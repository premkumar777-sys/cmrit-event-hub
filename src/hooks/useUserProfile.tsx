import { useState, useEffect } from "react";
import { useAuth } from "./useAuth";
import { supabase } from "@/integrations/supabase/client";

export function useUserProfile() {
    const { user } = useAuth();
    const [profile, setProfile] = useState<{ full_name: string; email: string } | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfile = async () => {
            if (!user) {
                setProfile(null);
                setLoading(false);
                return;
            }

            try {
                const { data, error } = await supabase
                    .from("profiles")
                    .select("full_name, email")
                    .eq("id", user.id)
                    .single();

                if (data) {
                    setProfile(data);
                } else {
                    // Fallback if no profile row yet
                    setProfile({
                        full_name: user.user_metadata?.full_name || "",
                        email: user.email || ""
                    });
                }
            } catch (e) {
                console.error("Error fetching profile:", e);
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [user]);

    return { profile, loading };
}
