import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useAuth } from "@/hooks/useAuth";
import { useUserProfile } from "@/hooks/useUserProfile";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useOrganizerEvents } from "@/hooks/useOrganizerEvents";
import { Loader2 } from "lucide-react";
import { format } from "date-fns";

export default function RegistrationsPage() {
  const { user } = useAuth();
  const { events, loading, fetchRegistrations } = useOrganizerEvents();
  const [openFor, setOpenFor] = useState<string | null>(null);
  const [regs, setRegs] = useState<any[]>([]);
  const [regsLoading, setRegsLoading] = useState(false);

  const open = async (eventId: string) => {
    setOpenFor(eventId);
    setRegsLoading(true);
    const list = await fetchRegistrations(eventId);
    setRegs(list || []);
    setRegsLoading(false);
  };

  const close = () => {
    setOpenFor(null);
    setRegs([]);
  };

  const exportCSV = () => {
    if (!regs || regs.length === 0) return;
    const rows = regs.map(r => ({ name: r.profile.full_name || '', email: r.profile.email || '', registered_at: r.created_at }));
    const csv = [Object.keys(rows[0]).join(','), ...rows.map(r => [r.name, r.email, r.registered_at].map(c => `"${String(c).replace(/"/g, '""')}"`).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `registrations_${openFor || 'export'}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const { profile } = useUserProfile();

  const dashboardUser = {
    name: profile?.full_name || user?.email?.split('@')[0] || "Organizer",
    email: user?.email || "",
    role: "organizer" as const,
  };

  return (
    <DashboardLayout user={dashboardUser}>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Registrations</h1>
          <p className="text-muted-foreground mt-1">View registrations for your events and export attendee lists.</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {loading ? (
            <div className="col-span-2 p-6 bg-card rounded">Loading...</div>
          ) : events.length === 0 ? (
            <div className="col-span-2 p-6 bg-card rounded">No events found.</div>
          ) : (
            events.map(evt => (
              <Card key={evt.id}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold">{evt.title}</div>
                      <div className="text-xs text-muted-foreground">{evt.department || evt.category}</div>
                    </div>
                    <div className="text-sm text-muted-foreground">{evt.date ? format(new Date(evt.date), 'MMM dd, yyyy') : ''}</div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">Registrations: <strong>{evt.id ? '—' : '—'}</strong></div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => open(evt.id)}>View</Button>
                      <Button size="sm" onClick={() => { open(evt.id); setTimeout(exportCSV, 500); }}>Export</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {openFor && (
          <div className="p-4 bg-card rounded">
            <div className="flex items-center justify-between mb-4">
              <div className="font-semibold">Attendees</div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={close}>Close</Button>
                <Button onClick={exportCSV} disabled={regs.length === 0}>Export CSV</Button>
              </div>
            </div>
            {regsLoading ? (
              <div className="py-8 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto" /></div>
            ) : regs.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground">No registrations yet.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-xs text-muted-foreground">
                      <th className="py-2">Name</th>
                      <th>Email</th>
                      <th>Registered At</th>
                    </tr>
                  </thead>
                  <tbody>
                    {regs.map(r => (
                      <tr key={r.id} className="border-t"><td className="py-2">{r.profile.full_name}</td><td>{r.profile.email}</td><td className="text-xs text-muted-foreground">{new Date(r.created_at).toLocaleString()}</td></tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

      </div>
    </DashboardLayout>
  );
}
