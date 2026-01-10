import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { StatsCard } from "@/components/StatsCard";
import { EventCard } from "@/components/EventCard";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Users, ClipboardCheck, Plus, Eye, XCircle, ArchiveRestore, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useOrganizerEvents } from "@/hooks/useOrganizerEvents";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";

// Data is fetched using hooks: organizer events and registration counts (see useOrganizerEvents.ts)


export default function OrganizerDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("all");
  const { user } = useAuth();

  const { events, loading, registrationsMap, refetch, closeRegistration, cancelEvent } = useOrganizerEvents();

  const filteredEvents = (events || []).filter((event) => {
    if (activeTab === "all") return true;
    return event.status === activeTab;
  });

  const totalRegistrations = Object.values(registrationsMap || {}).reduce((a, b) => a + b, 0);

  const dashboardUser = {
    name: user?.user_metadata?.full_name || user?.email || 'Organizer',
    email: user?.email || '',
    role: 'organizer' as const,
  };

  const [openRegsFor, setOpenRegsFor] = useState<string | null>(null);
  const [registrationsList, setRegistrationsList] = useState<any[]>([]);
  const [regsLoading, setRegsLoading] = useState(false);

  const openRegistrations = async (eventId: string) => {
    setOpenRegsFor(eventId);
    setRegsLoading(true);
    const regs = await fetchRegistrations(eventId);
    setRegistrationsList(regs || []);
    setRegsLoading(false);
  };

  const handleCloseRegistrations = async (eventId: string) => {
    await closeRegistration(eventId);
  };

  const handleCancelEvent = async (eventId: string) => {
    await cancelEvent(eventId);
  };

  return (
    <DashboardLayout user={dashboardUser}>
      <div className="space-y-6">        {/* Welcome Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fade-in">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">
              Organizer Dashboard
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage your events and track registrations.
            </p>
          </div>
          <Button onClick={() => navigate("/create-event")} className="gap-2">
            <Plus className="w-4 h-4" />
            Schedule Event
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 animate-slide-up">
          <StatsCard
            title="Total Events"
            value={loading ? "-" : events.length}
            icon={Calendar}
          />
          <StatsCard
            title="Total Registrations"
            value={loading ? "-" : totalRegistrations}
            icon={Users}
            trend={{ value: 12, isPositive: true }}
          />
          <StatsCard
            title="Pending Approvals"
            value={loading ? "-" : events.filter(e => e.status === 'pending').length}
            icon={ClipboardCheck}
          />
          <StatsCard
            title="Completed Events"
            value={loading ? "-" : events.filter(e => e.status === 'completed').length}
            icon={Calendar}
          />
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Events List */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">My Events</h2>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList>
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="approved">Approved</TabsTrigger>
                <TabsTrigger value="pending">Pending</TabsTrigger>
                <TabsTrigger value="rejected">Rejected</TabsTrigger>
              </TabsList>

              <TabsContent value={activeTab} className="mt-4">
                <div className="grid md:grid-cols-2 gap-4">
                  {filteredEvents.map((event, index) => (
                    <div
                      key={event.id}
                      className="animate-fade-in"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <EventCard
                        {...event}
                        registrations={registrationsMap[event.id] || 0}
                        showActions={true}
                        onViewDetails={() => navigate('/my-events', { state: { eventId: event.id } })}
                        actions={(
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" onClick={() => openRegistrations(event.id)}>
                              <Eye className="w-4 h-4 mr-2" />
                              Registrations
                            </Button>
                            <Button size="sm" onClick={() => handleCloseRegistrations(event.id)}>
                              <ArchiveRestore className="w-4 h-4 mr-2" />
                              Close
                            </Button>
                            <Button size="sm" variant="destructive" onClick={() => handleCancelEvent(event.id)}>
                              <Trash2 className="w-4 h-4 mr-2" />
                              Cancel
                            </Button>
                          </div>
                        )}
                      />
                    </div>
                  ))}
                </div>

                {filteredEvents.length === 0 && (
                  <div className="text-center py-12 text-muted-foreground">
                    <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No events found with this status.</p>
                  </div>
                )}
              </TabsContent>

              {/* Registrations Dialog */}
              <Dialog open={!!openRegsFor} onOpenChange={() => setOpenRegsFor(null)}>
                <DialogContent className="max-w-lg">
                  <DialogHeader>
                    <DialogTitle>Registrations</DialogTitle>
                  </DialogHeader>

                  <div>
                    {regsLoading ? (
                      <div className="py-8 text-center">
                        <Loader2 className="w-6 h-6 animate-spin mx-auto" />
                        <p className="text-muted-foreground mt-2">Loading...</p>
                      </div>
                    ) : registrationsList.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <p>No registrations yet.</p>
                      </div>
                    ) : (
                      <ul className="divide-y">
                        {registrationsList.map((r) => (
                          <li key={r.id} className="p-3 flex items-center justify-between">
                            <div>
                              <p className="font-medium">{r.profile.full_name || r.profile.email}</p>
                              <p className="text-xs text-muted-foreground">{r.profile.email}</p>
                            </div>
                            <span className="text-xs text-muted-foreground">{new Date(r.created_at).toLocaleString()}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  <DialogFooter>
                    <Button variant="outline" onClick={() => setOpenRegsFor(null)}>
                      Close
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </Tabs>
          </div>

          {/* Recent Activity */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Recent Registrations</h2>
            <Card>
              <CardContent className="p-0">
                <ul className="divide-y">
                  {(events || []).sort((a,b) => (registrationsMap[b.id] || 0) - (registrationsMap[a.id] || 0)).slice(0,4).map((evt, index) => (
                    <li
                      key={evt.id}
                      className="p-4 hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-sm">{evt.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {evt.department || evt.category || 'Event'}
                          </p>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {(registrationsMap[evt.id] || 0) + ' registrations'}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full justify-start gap-2">
                  <Eye className="w-4 h-4" />
                  View All Registrations
                </Button>
                <Button variant="outline" className="w-full justify-start gap-2">
                  <ClipboardCheck className="w-4 h-4" />
                  Check Approval Status
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
