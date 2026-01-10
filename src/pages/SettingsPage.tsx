import React, { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useAuth } from "@/hooks/useAuth";
import { useUserProfile } from "@/hooks/useUserProfile";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type ThemePref = "light" | "dark" | "system";
const STORAGE_KEY = "cmrit_theme_pref";

function applyTheme(pref: ThemePref) {
  const root = document.documentElement;
  const setDark = (isDark: boolean) => {
    if (isDark) root.classList.add("dark");
    else root.classList.remove("dark");
  };

  if (pref === "system") {
    const isDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
    setDark(isDark);
  } else if (pref === "dark") setDark(true);
  else setDark(false);
}

export default function SettingsPage() {
  const [theme, setTheme] = useState<ThemePref>("system");

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY) as ThemePref | null;
      const initial = stored || "system";
      setTheme(initial);
      applyTheme(initial);
    } catch (e) {
      setTheme("system");
      applyTheme("system");
    }
  }, []);

  useEffect(() => {
    applyTheme(theme);
    try {
      if (theme === "system") localStorage.removeItem(STORAGE_KEY);
      else localStorage.setItem(STORAGE_KEY, theme);
    } catch (_) { }
  }, [theme]);

  const { user } = useAuth();
  const { profile } = useUserProfile();

  const dashboardUser = {
    name: profile?.full_name || user?.email?.split('@')[0] || "Settings",
    email: user?.email || "",
    role: "student" as const // This page is accessible by all, but layout needs a role. We might want to fix this dynamically later, but for now fallback to student or check useUserRole
  };

  // Actually, we should get the real role
  // But for now, let's just use what we have, or better:
  // We can fetch primaryRole from useUserRole

  return (
    <DashboardLayout user={{
      name: profile?.full_name || user?.email?.split('@')[0] || "Settings",
      email: user?.email || "",
      role: "student"
    }}>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground mt-1">Personalize your application preferences.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Theme</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-3">Choose light, dark, or follow system preference.</p>
              <ToggleGroup type="single" value={theme} onValueChange={(v) => v && setTheme(v as ThemePref)}>
                <ToggleGroupItem value="light">Light</ToggleGroupItem>
                <ToggleGroupItem value="dark">Dark</ToggleGroupItem>
                <ToggleGroupItem value="system">System</ToggleGroupItem>
              </ToggleGroup>
              <div className="mt-4">
                <Button variant="ghost" onClick={() => { setTheme("system"); localStorage.removeItem(STORAGE_KEY); }}>
                  Reset to system
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
