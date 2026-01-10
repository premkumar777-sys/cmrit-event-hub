import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useToast } from "./use-toast";
import { sendEventRegistrationEmail } from "@/utils/email";

interface Event {
  id: string;
  title: string;
  description: string | null;
  date: string;
  time: string | null;
  venue: string | null;
  department: string | null;
  category: string | null;
  status: "draft" | "pending" | "approved" | "rejected" | "completed";
  max_participants: number | null;
  poster_url: string | null;
  organizer_id: string;
}

interface Registration {
  id: string;
  event_id: string;
  user_id: string;
  registered_at: string;
  qr_code: string | null;
  event?: Event;
}

interface RegistrationWithDetails {
  id: string;
  eventId: string;
  eventTitle: string;
  eventDate: string;
  eventTime: string;
  eventVenue: string;
  organizerName: string;
  userName: string;
  userEmail: string;
}

export function useEventRegistration() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch user's registrations
  const fetchRegistrations = async () => {
    if (!user) {
      setRegistrations([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("registrations")
        .select(`
          *,
          event:events(*)
        `)
        .eq("user_id", user.id);

      if (error) throw error;
      setRegistrations(data || []);
    } catch (error) {
      console.error("Error fetching registrations:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRegistrations();
  }, [user]);

  // Register for an event
  const registerForEvent = async (
    event: Event,
    organizerName: string
  ): Promise<RegistrationWithDetails | null> => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to register for events",
        variant: "destructive",
      });
      return null;
    }

    try {
      // Get user profile for QR data
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, email")
        .eq("id", user.id)
        .single();

      const userName = profile?.full_name || user.email?.split("@")[0] || "Attendee";
      const userEmail = profile?.email || user.email || "";

      // Generate QR code data
      const qrData = JSON.stringify({
        eventId: event.id,
        eventTitle: event.title,
        eventDate: event.date,
        eventTime: event.time,
        eventVenue: event.venue,
        organizer: organizerName,
        attendee: {
          name: userName,
          email: userEmail,
        },
        registeredAt: new Date().toISOString(),
      });

      // Create registration
      const { data, error } = await supabase
        .from("registrations")
        .insert({
          event_id: event.id,
          user_id: user.id,
          qr_code: qrData,
        })
        .select()
        .single();

      if (error) {
        if (error.code === "23505") {
          toast({
            title: "Already Registered",
            description: "You are already registered for this event",
            variant: "destructive",
          });
        } else {
          throw error;
        }
        return null;
      }

      // Refresh registrations
      await fetchRegistrations();

      toast({
        title: "Registration Successful!",
        description: `You have registered for "${event.title}"`,
      });

      // Send confirmation email
      sendEventRegistrationEmail(
        userEmail,
        userName,
        event.title,
        event.date,
        event.time || "TBD",
        event.venue || "TBD"
      );

      return {
        id: data.id,
        eventId: event.id,
        eventTitle: event.title,
        eventDate: event.date,
        eventTime: event.time || "",
        eventVenue: event.venue || "",
        organizerName,
        userName,
        userEmail,
      };
    } catch (error) {
      console.error("Registration error:", error);
      toast({
        title: "Registration Failed",
        description: "Could not register for this event. Please try again.",
        variant: "destructive",
      });
      return null;
    }
  };

  // Get registration details for QR display
  const getRegistrationDetails = async (
    registrationId: string,
    organizerName: string
  ): Promise<RegistrationWithDetails | null> => {
    const registration = registrations.find((r) => r.id === registrationId);
    if (!registration || !registration.event) return null;

    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name, email")
      .eq("id", user?.id || "")
      .single();

    return {
      id: registration.id,
      eventId: registration.event_id,
      eventTitle: registration.event.title,
      eventDate: registration.event.date,
      eventTime: registration.event.time || "",
      eventVenue: registration.event.venue || "",
      organizerName,
      userName: profile?.full_name || "Attendee",
      userEmail: profile?.email || user?.email || "",
    };
  };

  // Check if user is registered for an event
  const isRegistered = (eventId: string): boolean => {
    return registrations.some((r) => r.event_id === eventId);
  };

  // Get registration by event ID
  const getRegistrationByEventId = (eventId: string): Registration | undefined => {
    return registrations.find((r) => r.event_id === eventId);
  };

  return {
    registrations,
    loading,
    registerForEvent,
    getRegistrationDetails,
    isRegistered,
    getRegistrationByEventId,
    refreshRegistrations: fetchRegistrations,
  };
}
