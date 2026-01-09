import { DashboardLayout } from "@/components/DashboardLayout";
import { StatsCard } from "@/components/StatsCard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RoleBadge } from "@/components/ui/role-badge";
import { StatusBadge } from "@/components/ui/status-badge";
import {
  Users,
  Calendar,
  Award,
  TrendingUp,
  Plus,
  Settings,
  BarChart3,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const mockUser = {
  name: "Admin User",
  email: "admin@cmrit.ac.in",
  role: "admin" as const,
};

const registrationData = [
  { name: "CSE", registrations: 450 },
  { name: "CSM", registrations: 320 },
  { name: "ECE", registrations: 280 },
  { name: "CSD", registrations: 220 },
  { name: "EEE", registrations: 180 },
  { name: "MECH", registrations: 150 },
];

const categoryData = [
  { name: "Workshops", value: 35, color: "#4285F4" },
  { name: "Competitions", value: 25, color: "#34A853" },
  { name: "Seminars", value: 20, color: "#FBBC05" },
  { name: "Cultural", value: 15, color: "#EA4335" },
  { name: "Sports", value: 5, color: "#9333EA" },
];

const recentUsers = [
  { name: "Alice Johnson", email: "alice@cmrit.ac.in", role: "student" as const, joinedAt: "2 hours ago" },
  { name: "Bob Smith", email: "bob@cmrit.ac.in", role: "organizer" as const, joinedAt: "5 hours ago" },
  { name: "Carol Williams", email: "carol@cmrit.ac.in", role: "student" as const, joinedAt: "1 day ago" },
  { name: "David Brown", email: "david@cmrit.ac.in", role: "faculty" as const, joinedAt: "2 days ago" },
];

const recentEvents = [
  { title: "AI Workshop", status: "approved" as const, registrations: 85 },
  { title: "Code Sprint", status: "pending" as const, registrations: 0 },
  { title: "Tech Talk", status: "completed" as const, registrations: 120 },
  { title: "Robotics Meet", status: "approved" as const, registrations: 45 },
];

export default function AdminDashboard() {
  return (
    <DashboardLayout user={mockUser}>
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fade-in">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">
              Admin Dashboard
            </h1>
            <p className="text-muted-foreground mt-1">
              System overview and management controls.
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2">
              <Settings className="w-4 h-4" />
              Settings
            </Button>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Add User
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 animate-slide-up">
          <StatsCard
            title="Total Users"
            value="1,245"
            icon={Users}
            trend={{ value: 8, isPositive: true }}
          />
          <StatsCard
            title="Total Events"
            value="156"
            icon={Calendar}
            trend={{ value: 12, isPositive: true }}
          />
          <StatsCard
            title="Certificates Issued"
            value="892"
            icon={Award}
          />
          <StatsCard
            title="Avg. Attendance"
            value="78%"
            icon={TrendingUp}
            trend={{ value: 5, isPositive: true }}
          />
        </div>

        {/* Charts Row */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Registrations by Department */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-primary" />
                Registrations by Department
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={registrationData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Bar dataKey="registrations" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Events by Category */}
          <Card>
            <CardHeader>
              <CardTitle>Events by Category</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center">
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-wrap justify-center gap-4 mt-4">
                {categoryData.map((cat) => (
                  <div key={cat.name} className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: cat.color }}
                    />
                    <span className="text-sm text-muted-foreground">{cat.name}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Recent Users */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Users</CardTitle>
              <CardDescription>Newly registered users</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <ul className="divide-y">
                {recentUsers.map((user, index) => (
                  <li key={index} className="p-4 hover:bg-muted/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary text-primary-foreground text-sm font-medium">
                          {user.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium text-sm">{user.name}</p>
                          <p className="text-xs text-muted-foreground">{user.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <RoleBadge role={user.role} showIcon={false} />
                        <span className="text-xs text-muted-foreground hidden sm:inline">
                          {user.joinedAt}
                        </span>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Recent Events */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Events</CardTitle>
              <CardDescription>Latest event activity</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <ul className="divide-y">
                {recentEvents.map((event, index) => (
                  <li key={index} className="p-4 hover:bg-muted/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-sm">{event.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {event.registrations} registrations
                        </p>
                      </div>
                      <StatusBadge status={event.status} />
                    </div>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
