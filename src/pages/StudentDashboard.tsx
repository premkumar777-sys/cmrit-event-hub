import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { StatsCard } from "@/components/StatsCard";
import { EventCard } from "@/components/EventCard";
import { DepartmentFilter } from "@/components/DepartmentFilter";
import { Calendar, Award, CheckCircle, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const mockUser = {
  name: "John Doe",
  email: "john.doe@cmrit.ac.in",
  role: "student" as const,
};

const mockEvents = [
  {
    id: "1",
    title: "AI/ML Workshop: Building Smart Applications",
    description: "Learn to build intelligent applications using TensorFlow and PyTorch. Hands-on session with real-world projects.",
    date: "Jan 15, 2024",
    time: "10:00 AM - 4:00 PM",
    venue: "Seminar Hall A",
    department: "CSE",
    category: "Workshop",
    status: "approved" as const,
    registrations: 85,
    posterUrl: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=400",
  },
  {
    id: "2",
    title: "Code Sprint 2024",
    description: "24-hour competitive programming challenge. Form teams of 3 and solve algorithmic problems.",
    date: "Jan 20, 2024",
    time: "9:00 AM - 9:00 AM",
    venue: "Computer Lab 1 & 2",
    department: "CSM",
    category: "Competition",
    status: "approved" as const,
    registrations: 120,
    posterUrl: "https://images.unsplash.com/photo-1504639725590-34d0984388bd?w=400",
  },
  {
    id: "3",
    title: "IoT Innovation Summit",
    description: "Explore the latest in Internet of Things technology. Guest speakers from leading tech companies.",
    date: "Jan 25, 2024",
    time: "2:00 PM - 6:00 PM",
    venue: "Main Auditorium",
    department: "ECE",
    category: "Seminar",
    status: "approved" as const,
    registrations: 200,
    posterUrl: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=400",
  },
  {
    id: "4",
    title: "Cloud Computing Bootcamp",
    description: "Master AWS, Azure, and GCP fundamentals. Get certified and boost your career.",
    date: "Feb 1, 2024",
    time: "9:00 AM - 5:00 PM",
    venue: "Conference Room B",
    department: "CSD",
    category: "Workshop",
    status: "approved" as const,
    registrations: 60,
    posterUrl: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400",
  },
];

export default function StudentDashboard() {
  const [selectedDept, setSelectedDept] = useState("all");
  const [registeredEvents, setRegisteredEvents] = useState<string[]>([]);
  const { toast } = useToast();

  const filteredEvents = mockEvents.filter(
    (event) => selectedDept === "all" || event.department === selectedDept
  );

  const handleRegister = (eventId: string, eventTitle: string) => {
    setRegisteredEvents([...registeredEvents, eventId]);
    toast({
      title: "Registration Successful!",
      description: `You have registered for "${eventTitle}"`,
    });
  };

  return (
    <DashboardLayout user={mockUser}>
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="animate-fade-in">
          <h1 className="text-2xl md:text-3xl font-bold">
            Welcome back, {mockUser.name.split(" ")[0]}! 👋
          </h1>
          <p className="text-muted-foreground mt-1">
            Discover and register for upcoming events across departments.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 animate-slide-up">
          <StatsCard
            title="Registered Events"
            value={registeredEvents.length}
            icon={Calendar}
          />
          <StatsCard
            title="Events Attended"
            value={5}
            icon={CheckCircle}
          />
          <StatsCard
            title="Certificates"
            value={3}
            icon={Award}
          />
          <StatsCard
            title="Upcoming"
            value={2}
            icon={Clock}
          />
        </div>

        {/* Events Section */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h2 className="text-xl font-semibold">Upcoming Events</h2>
          </div>
          
          <DepartmentFilter
            selected={selectedDept}
            onSelect={setSelectedDept}
          />

          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredEvents.map((event, index) => (
              <div
                key={event.id}
                className="animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <EventCard
                  {...event}
                  isRegistered={registeredEvents.includes(event.id)}
                  onRegister={() => handleRegister(event.id, event.title)}
                  onViewDetails={() => {}}
                />
              </div>
            ))}
          </div>

          {filteredEvents.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No events found for this department.</p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
