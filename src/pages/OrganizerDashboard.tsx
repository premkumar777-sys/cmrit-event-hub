import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { StatsCard } from "@/components/StatsCard";
import { EventCard } from "@/components/EventCard";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Users, ClipboardCheck, Plus, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";

const mockUser = {
  name: "Sarah Johnson",
  email: "sarah.johnson@cmrit.ac.in",
  role: "organizer" as const,
};

const mockEvents = [
  {
    id: "1",
    title: "Hackathon 2024: Build the Future",
    description: "48-hour hackathon with exciting prizes and mentorship from industry experts.",
    date: "Feb 10, 2024",
    time: "9:00 AM onwards",
    venue: "Innovation Hub",
    department: "CSE",
    category: "Competition",
    status: "approved" as const,
    registrations: 150,
    posterUrl: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=400",
  },
  {
    id: "2",
    title: "Web Development Bootcamp",
    description: "Learn React, Node.js, and MongoDB in this comprehensive 3-day bootcamp.",
    date: "Feb 15, 2024",
    time: "10:00 AM - 5:00 PM",
    venue: "Lab 3",
    department: "CSE",
    category: "Workshop",
    status: "pending" as const,
    registrations: 0,
  },
  {
    id: "3",
    title: "Tech Talk: Future of AI",
    description: "Industry expert sharing insights on the future of artificial intelligence.",
    date: "Feb 5, 2024",
    time: "3:00 PM - 5:00 PM",
    venue: "Seminar Hall B",
    department: "CSE",
    category: "Seminar",
    status: "completed" as const,
    registrations: 80,
  },
  {
    id: "4",
    title: "Mobile App Development",
    description: "Introduction to Flutter and cross-platform mobile development.",
    date: "Feb 20, 2024",
    time: "10:00 AM - 4:00 PM",
    venue: "Lab 2",
    department: "CSE",
    category: "Workshop",
    status: "rejected" as const,
    registrations: 0,
  },
];

const recentRegistrations = [
  { name: "Alice Smith", event: "Hackathon 2024", time: "2 hours ago" },
  { name: "Bob Kumar", event: "Hackathon 2024", time: "3 hours ago" },
  { name: "Charlie Reddy", event: "Hackathon 2024", time: "5 hours ago" },
  { name: "Diana Sharma", event: "Hackathon 2024", time: "6 hours ago" },
];

export default function OrganizerDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("all");

  const filteredEvents = mockEvents.filter((event) => {
    if (activeTab === "all") return true;
    return event.status === activeTab;
  });

  return (
    <DashboardLayout user={mockUser}>
      <div className="space-y-6">
        {/* Welcome Section */}
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
            Create Event
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 animate-slide-up">
          <StatsCard
            title="Total Events"
            value={mockEvents.length}
            icon={Calendar}
          />
          <StatsCard
            title="Total Registrations"
            value={230}
            icon={Users}
            trend={{ value: 12, isPositive: true }}
          />
          <StatsCard
            title="Pending Approvals"
            value={1}
            icon={ClipboardCheck}
          />
          <StatsCard
            title="Completed Events"
            value={1}
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
                        showActions={false}
                        onViewDetails={() => {}}
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
            </Tabs>
          </div>

          {/* Recent Activity */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Recent Registrations</h2>
            <Card>
              <CardContent className="p-0">
                <ul className="divide-y">
                  {recentRegistrations.map((reg, index) => (
                    <li
                      key={index}
                      className="p-4 hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-sm">{reg.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {reg.event}
                          </p>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {reg.time}
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
