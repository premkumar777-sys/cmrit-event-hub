import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { StatsCard } from "@/components/StatsCard";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ClipboardCheck, Calendar, Users, CheckCircle, XCircle, Clock, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const mockUser = {
  name: "Dr. Ramesh Kumar",
  email: "ramesh.kumar@cmrit.ac.in",
  role: "faculty" as const,
};

const pendingApprovals = [
  {
    id: "1",
    title: "Web Development Bootcamp",
    organizer: "Sarah Johnson",
    club: "Coding Club",
    date: "Feb 15, 2024",
    venue: "Lab 3",
    department: "CSE",
    category: "Workshop",
    expectedAttendees: 50,
    description: "Learn React, Node.js, and MongoDB in this comprehensive 3-day bootcamp designed for beginners and intermediate developers.",
    submittedAt: "2 days ago",
  },
  {
    id: "2",
    title: "Robotics Competition",
    organizer: "Mike Chen",
    club: "Robotics Club",
    date: "Feb 25, 2024",
    venue: "Main Ground",
    department: "ECE",
    category: "Competition",
    expectedAttendees: 100,
    description: "Inter-college robotics competition featuring autonomous bots and manual control challenges.",
    submittedAt: "1 day ago",
  },
];

const permissionRequests = [
  {
    id: "1",
    studentName: "Rahul Sharma",
    studentId: "1CR21CS101",
    event: "Hackathon 2024",
    attendance: 72,
    reason: "Important technical event for career development",
    submittedAt: "3 hours ago",
  },
  {
    id: "2",
    studentName: "Priya Patel",
    studentId: "1CR21CS045",
    event: "AI/ML Workshop",
    attendance: 68,
    reason: "Workshop aligns with my final year project topic",
    submittedAt: "5 hours ago",
  },
];

export default function FacultyDashboard() {
  const { toast } = useToast();
  const [selectedApproval, setSelectedApproval] = useState<typeof pendingApprovals[0] | null>(null);
  const [comments, setComments] = useState("");

  const handleApprove = (id: string, title: string) => {
    toast({
      title: "Event Approved",
      description: `"${title}" has been approved successfully.`,
    });
    setSelectedApproval(null);
    setComments("");
  };

  const handleReject = (id: string, title: string) => {
    if (!comments.trim()) {
      toast({
        title: "Comments Required",
        description: "Please provide a reason for rejection.",
        variant: "destructive",
      });
      return;
    }
    toast({
      title: "Event Rejected",
      description: `"${title}" has been rejected.`,
    });
    setSelectedApproval(null);
    setComments("");
  };

  const handlePermissionGrant = (studentName: string) => {
    toast({
      title: "Permission Granted",
      description: `Permission granted to ${studentName}.`,
    });
  };

  const handlePermissionDeny = (studentName: string) => {
    toast({
      title: "Permission Denied",
      description: `Permission denied for ${studentName}.`,
    });
  };

  return (
    <DashboardLayout user={mockUser}>
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="animate-fade-in">
          <h1 className="text-2xl md:text-3xl font-bold">
            Faculty Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">
            Review event approvals and student permission requests.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 animate-slide-up">
          <StatsCard
            title="Pending Approvals"
            value={pendingApprovals.length}
            icon={ClipboardCheck}
          />
          <StatsCard
            title="Permission Requests"
            value={permissionRequests.length}
            icon={AlertTriangle}
          />
          <StatsCard
            title="Approved This Month"
            value={12}
            icon={CheckCircle}
          />
          <StatsCard
            title="Dept Events"
            value={8}
            icon={Calendar}
          />
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Pending Approvals */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ClipboardCheck className="w-5 h-5 text-primary" />
                Pending Event Approvals
              </CardTitle>
              <CardDescription>
                Review and approve event proposals from clubs
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {pendingApprovals.map((approval) => (
                <div
                  key={approval.id}
                  className="p-4 rounded-lg border bg-card hover:shadow-card transition-shadow cursor-pointer"
                  onClick={() => setSelectedApproval(approval)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-semibold">{approval.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        by {approval.organizer} • {approval.club}
                      </p>
                    </div>
                    <StatusBadge status="pending" />
                  </div>
                  <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {approval.date}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {approval.expectedAttendees} expected
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {approval.submittedAt}
                    </span>
                  </div>
                </div>
              ))}

              {pendingApprovals.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <CheckCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No pending approvals</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Permission Requests */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-status-pending" />
                Permission Requests
              </CardTitle>
              <CardDescription>
                Students with {"<"}75% attendance requesting event permission
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {permissionRequests.map((request) => (
                <div
                  key={request.id}
                  className="p-4 rounded-lg border bg-card"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-semibold">{request.studentName}</h3>
                      <p className="text-sm text-muted-foreground">
                        {request.studentId}
                      </p>
                    </div>
                    <Badge variant="outline" className="text-status-pending border-status-pending">
                      {request.attendance}% Attendance
                    </Badge>
                  </div>
                  <p className="text-sm mb-2">
                    <span className="font-medium">Event:</span> {request.event}
                  </p>
                  <p className="text-sm text-muted-foreground mb-3">
                    <span className="font-medium text-foreground">Reason:</span> {request.reason}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => handlePermissionGrant(request.studentName)}
                    >
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Grant
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handlePermissionDeny(request.studentName)}
                    >
                      <XCircle className="w-4 h-4 mr-1" />
                      Deny
                    </Button>
                  </div>
                </div>
              ))}

              {permissionRequests.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <CheckCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No permission requests</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Approval Dialog */}
      <Dialog open={!!selectedApproval} onOpenChange={() => setSelectedApproval(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{selectedApproval?.title}</DialogTitle>
            <DialogDescription>
              Review the event details and approve or reject
            </DialogDescription>
          </DialogHeader>

          {selectedApproval && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Organizer:</span>
                  <p className="font-medium">{selectedApproval.organizer}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Club:</span>
                  <p className="font-medium">{selectedApproval.club}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Date:</span>
                  <p className="font-medium">{selectedApproval.date}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Venue:</span>
                  <p className="font-medium">{selectedApproval.venue}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Department:</span>
                  <p className="font-medium">{selectedApproval.department}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Expected Attendees:</span>
                  <p className="font-medium">{selectedApproval.expectedAttendees}</p>
                </div>
              </div>

              <div>
                <span className="text-sm text-muted-foreground">Description:</span>
                <p className="text-sm mt-1">{selectedApproval.description}</p>
              </div>

              <div>
                <label className="text-sm font-medium">Comments (required for rejection)</label>
                <Textarea
                  placeholder="Add your comments..."
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => handleReject(selectedApproval!.id, selectedApproval!.title)}
            >
              <XCircle className="w-4 h-4 mr-2" />
              Reject
            </Button>
            <Button
              onClick={() => handleApprove(selectedApproval!.id, selectedApproval!.title)}
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Approve
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
