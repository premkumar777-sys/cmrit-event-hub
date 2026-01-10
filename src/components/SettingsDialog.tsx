import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { RoleBadge } from "@/components/ui/role-badge";

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
  } else if (pref === "dark") {
    setDark(true);
  } else {
    setDark(false);
  }
}

export function SettingsDialog({
  open,
  onOpenChange,
  user,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  user?: {
    name: string;
    email: string;
    role: "student" | "organizer" | "faculty" | "hod" | "admin" | "canteen_admin";
    avatar?: string;
  };
}) {
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

  useEffect(() => {
    // Listen for system theme changes when using system
    const mq = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => {
      if (theme === "system") applyTheme("system");
    };
    mq?.addEventListener?.("change", handler);
    return () => mq?.removeEventListener?.("change", handler);
  }, [theme]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
          <DialogDescription>Customize your preferences</DialogDescription>
        </DialogHeader>

        <div className="mt-4 space-y-4">
          {user && (
            <div className="bg-muted/50 p-4 rounded-lg space-y-3">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-lg">
                  {user.avatar ? (
                    <img src={user.avatar} alt={user.name} className="w-full h-full rounded-full object-cover" />
                  ) : (
                    user.name.charAt(0).toUpperCase()
                  )}
                </div>
                <div>
                  <p className="font-semibold">{user.name}</p>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Designation</span>
                <RoleBadge role={user.role} showIcon={false} />
              </div>
            </div>
          )}

          <div>
            <p className="text-sm font-medium">Theme</p>
            <p className="text-xs text-muted-foreground mb-2">Choose light, dark or follow system</p>
            <ToggleGroup type="single" value={theme} onValueChange={(v) => v && setTheme(v as ThemePref)} className="mt-2">
              <ToggleGroupItem value="light">Light</ToggleGroupItem>
              <ToggleGroupItem value="dark">Dark</ToggleGroupItem>
              <ToggleGroupItem value="system">System</ToggleGroupItem>
            </ToggleGroup>
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)} className="mr-2">
            Close
          </Button>
          <Button onClick={() => onOpenChange(false)}>Save</Button>
        </DialogFooter>

        <DialogClose />
      </DialogContent>
    </Dialog>
  );
}

export default SettingsDialog;
