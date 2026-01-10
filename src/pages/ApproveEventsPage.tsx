import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { ClipboardCheck, Calendar, Users, CheckCircle, XCircle, Clock, Loader2, ArrowLeft } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useEventApprovals, PendingEvent } from "@/hooks/useEventApprovals";
import { format, formatDistanceToNow } from "date-fns";
import { useNavigate } from "react-router-dom";

export default function ApproveEventsPage() {
    const { user } = useAuth();
    const { primaryRole } = useUserRole();
    const { pendingEvents, loading: eventsLoading, approveEvent, rejectEvent } = useEventApprovals();
    const navigate = useNavigate();

    const [selectedEvent, setSelectedEvent] = useState<PendingEvent | null>(null);
    const [comments, setComments] = useState("");
    const [isProcessing, setIsProcessing] = useState(false);
    const { profile } = useUserProfile();

    const dashboardUser = {
        name: profile?.full_name || user?.email?.split('@')[0] || "Faculty",
        email: user?.email || "",
        role: primaryRole as "faculty" | "hod" | "admin",
    };

    const handleApprove = async () => {
        if (!selectedEvent) return;
        setIsProcessing(true);
        await approveEvent(selectedEvent.id);
        setIsProcessing(false);
        setSelectedEvent(null);
        setComments("");
    };

    const handleReject = async () => {
        if (!selectedEvent) return;
        if (!comments.trim()) {
            return;
        }
        setIsProcessing(true);
        await rejectEvent(selectedEvent.id, comments);
        setIsProcessing(false);
        setSelectedEvent(null);
        setComments("");
    };

    const formatEventDate = (dateStr: string) => {
        try {
            return format(new Date(dateStr), 'MMM dd, yyyy');
        } catch {
            return dateStr;
        }
    };

    const formatTimeAgo = (dateStr: string | null) => {
        if (!dateStr) return '';
        try {
            return formatDistanceToNow(new Date(dateStr), { addSuffix: true });
        } catch {
            return '';
        }
    };

    const getApprovalLevelInfo = (level: string) => {
        switch (level) {
            case 'pending_faculty':
                return { label: 'Faculty Review', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300' };
            case 'pending_hod':
                return { label: 'HOD Review', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300' };
            case 'pending_director':
                return { label: 'Director Review', color: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300' };
            default:
                return { label: 'Pending', color: 'bg-yellow-100 text-yellow-800' };
        }
    };

    return (
        <DashboardLayout user={dashboardUser}>
            <div className="space-y-6">
                <div className="flex items-center gap-4 animate-fade-in">
                    <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
                        <ArrowLeft className="w-4 h-4" />
                    </Button>
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold">
                            Approve Events
                        </h1>
                        <p className="text-muted-foreground mt-1">
                            Review and manage event proposals
                        </p>
                    </div>
                </div>

                <Card className="animate-slide-up">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <ClipboardCheck className="w-5 h-5 text-primary" />
                            Pending Approvals
                        </CardTitle>
                        <CardDescription>
                            Detailed list of events waiting for your approval
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {eventsLoading ? (
                            <>
                                <Skeleton className="h-24 w-full" />
                                <Skeleton className="h-24 w-full" />
                                <Skeleton className="h-24 w-full" />
                            </>
                        ) : pendingEvents.length > 0 ? (
                            <div className="grid gap-4">
                                {pendingEvents.map((event) => (
                                    <div
                                        key={event.id}
                                        className="p-4 rounded-lg border bg-card hover:shadow-card transition-shadow cursor-pointer flex flex-col md:flex-row gap-4 justify-between"
                                        onClick={() => setSelectedEvent(event)}
                                    >
                                        <div className="space-y-2 flex-1">
                                            <div className="flex items-start justify-between md:justify-start gap-3">
                                                <h3 className="font-semibold text-lg">{event.title}</h3>
                                                <Badge className={getApprovalLevelInfo(event.approval_level).color}>
                                                    {getApprovalLevelInfo(event.approval_level).label}
                                                </Badge>
                                            </div>
                                            <p className="text-sm text-muted-foreground">
                                                Organized by {event.organizer.full_name || event.organizer.email}
                                            </p>

                                            <div className="flex flex-wrap gap-4 text-xs text-muted-foreground mt-2">
                                                <span className="flex items-center gap-1">
                                                    <Calendar className="w-3 h-3" />
                                                    {formatEventDate(event.date)}
                                                </span>
                                                {event.max_participants && (
                                                    <span className="flex items-center gap-1">
                                                        <Users className="w-3 h-3" />
                                                        {event.max_participants} expected
                                                    </span>
                                                )}
                                                <span className="flex items-center gap-1">
                                                    <Clock className="w-3 h-3" />
                                                    {formatTimeAgo(event.created_at)}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2 mt-2 md:mt-0">
                                            <div className="flex flex-col items-end gap-1">
                                                <div className="flex items-center gap-1">
                                                    <div className={`w-2 h-2 rounded-full ${event.approved_by_faculty ? 'bg-green-500' : event.approval_level === 'pending_faculty' ? 'bg-yellow-500 animate-pulse' : 'bg-gray-300'}`} />
                                                    <span className="text-xs">Faculty</span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <div className={`w-2 h-2 rounded-full ${event.approved_by_hod ? 'bg-green-500' : event.approval_level === 'pending_hod' ? 'bg-yellow-500 animate-pulse' : 'bg-gray-300'}`} />
                                                    <span className="text-xs">HOD</span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <div className={`w-2 h-2 rounded-full ${event.approval_level === 'approved' ? 'bg-green-500' : event.approval_level === 'pending_director' ? 'bg-yellow-500 animate-pulse' : 'bg-gray-300'}`} />
                                                    <span className="text-xs">Director</span>
                                                </div>
                                            </div>
                                            <Button variant="outline" size="sm">Review</Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12 text-muted-foreground">
                                <CheckCircle className="w-16 h-16 mx-auto mb-4 opacity-50" />
                                <h3 className="text-lg font-medium">All caught up!</h3>
                                <p>No pending approvals at the moment.</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            <Dialog open={!!selectedEvent} onOpenChange={() => setSelectedEvent(null)}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle>{selectedEvent?.title}</DialogTitle>
                        <DialogDescription>
                            Review the event details and approve or reject
                        </DialogDescription>
                    </DialogHeader>

                    {selectedEvent && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <span className="text-muted-foreground">Organizer:</span>
                                    <p className="font-medium">{selectedEvent.organizer.full_name || 'N/A'}</p>
                                </div>
                                <div>
                                    <span className="text-muted-foreground">Email:</span>
                                    <p className="font-medium text-xs">{selectedEvent.organizer.email}</p>
                                </div>
                                <div>
                                    <span className="text-muted-foreground">Date:</span>
                                    <p className="font-medium">{formatEventDate(selectedEvent.date)}</p>
                                </div>
                                <div>
                                    <span className="text-muted-foreground">Venue:</span>
                                    <p className="font-medium">{selectedEvent.venue || 'TBD'}</p>
                                </div>
                                <div>
                                    <span className="text-muted-foreground">Department:</span>
                                    <p className="font-medium">{selectedEvent.department || 'All'}</p>
                                </div>
                                <div>
                                    <span className="text-muted-foreground">Expected Attendees:</span>
                                    <p className="font-medium">{selectedEvent.max_participants || 'N/A'}</p>
                                </div>
                                {selectedEvent.category && (
                                    <div>
                                        <span className="text-muted-foreground">Category:</span>
                                        <p className="font-medium">{selectedEvent.category}</p>
                                    </div>
                                )}
                                {selectedEvent.time && (
                                    <div>
                                        <span className="text-muted-foreground">Time:</span>
                                        <p className="font-medium">{selectedEvent.time}</p>
                                    </div>
                                )}
                            </div>

                            {selectedEvent.description && (
                                <div>
                                    <span className="text-sm text-muted-foreground">Description:</span>
                                    <p className="text-sm mt-1">{selectedEvent.description}</p>
                                </div>
                            )}

                            <div>
                                <label className="text-sm font-medium">Comments (required for rejection)</label>
                                <Textarea
                                    placeholder="Add your comments or reason for rejection..."
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
                            onClick={handleReject}
                            disabled={isProcessing || !comments.trim()}
                        >
                            {isProcessing ? (
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            ) : (
                                <XCircle className="w-4 h-4 mr-2" />
                            )}
                            Reject
                        </Button>
                        <Button
                            onClick={handleApprove}
                            disabled={isProcessing}
                        >
                            {isProcessing ? (
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            ) : (
                                <CheckCircle className="w-4 h-4 mr-2" />
                            )}
                            Approve
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </DashboardLayout>
    );
}
