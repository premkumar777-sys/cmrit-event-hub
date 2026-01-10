import { supabase } from "@/integrations/supabase/client";

interface EmailData {
    eventTitle?: string;
    eventDate?: string;
    eventTime?: string;
    eventVenue?: string;
    slotTime?: string;
    slotDate?: string;
    certificateUrl?: string;
}

type EmailType = "welcome" | "event_registration" | "canteen_booking" | "event_reminder" | "certificate";

export async function sendEmail(
    type: EmailType,
    to: string,
    userName: string,
    data?: EmailData
): Promise<{ success: boolean; error?: string }> {
    try {
        const { data: result, error } = await supabase.functions.invoke("send-email", {
            body: { type, to, userName, data },
        });

        if (error) {
            console.error("Error sending email:", error);
            return { success: false, error: error.message };
        }

        return { success: true };
    } catch (error) {
        console.error("Error invoking email function:", error);
        return { success: false, error: String(error) };
    }
}

// Helper functions for specific email types
export const sendWelcomeEmail = (to: string, userName: string) =>
    sendEmail("welcome", to, userName);

export const sendEventRegistrationEmail = (
    to: string,
    userName: string,
    eventTitle: string,
    eventDate: string,
    eventTime: string,
    eventVenue: string
) =>
    sendEmail("event_registration", to, userName, {
        eventTitle,
        eventDate,
        eventTime,
        eventVenue,
    });

export const sendCanteenBookingEmail = (
    to: string,
    userName: string,
    slotDate: string,
    slotTime: string
) =>
    sendEmail("canteen_booking", to, userName, { slotDate, slotTime });

export const sendEventReminderEmail = (
    to: string,
    userName: string,
    eventTitle: string,
    eventDate: string,
    eventTime: string,
    eventVenue: string
) =>
    sendEmail("event_reminder", to, userName, {
        eventTitle,
        eventDate,
        eventTime,
        eventVenue,
    });

export const sendCertificateEmail = (
    to: string,
    userName: string,
    eventTitle: string,
    certificateUrl: string
) =>
    sendEmail("certificate", to, userName, { eventTitle, certificateUrl });
