import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { QrCode, Camera, CheckCircle, XCircle, Users, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useUserProfile } from "@/hooks/useUserProfile";

const mockEvents = [
  { id: "1", title: "AI/ML Workshop", attendees: 42, total: 85 },
  { id: "2", title: "Hackathon 2024", attendees: 98, total: 150 },
  { id: "3", title: "Tech Talk: Future of AI", attendees: 65, total: 80 },
];

const recentScans = [
  { name: "Alice Smith", studentId: "1CR21CS001", time: "10:15 AM", status: "success" },
  { name: "Bob Kumar", studentId: "1CR21CS045", time: "10:14 AM", status: "success" },
  { name: "Charlie Reddy", studentId: "1CR21CS078", time: "10:12 AM", status: "success" },
  { name: "Diana Sharma", studentId: "1CR21EC034", time: "10:10 AM", status: "error" },
];

export default function QRScannerPage() {
  const { toast } = useToast();
  const [selectedEvent, setSelectedEvent] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [manualId, setManualId] = useState("");

  const handleStartScanning = () => {
    if (!selectedEvent) {
      toast({
        title: "Select an Event",
        description: "Please select an event before scanning.",
        variant: "destructive",
      });
      return;
    }
    setIsScanning(true);
    toast({
      title: "Scanner Ready",
      description: "Point the camera at a student's QR code.",
    });
  };

  const handleManualEntry = () => {
    if (!manualId.trim()) {
      toast({
        title: "Enter Student ID",
        description: "Please enter a valid student ID.",
        variant: "destructive",
      });
      return;
    }
    toast({
      title: "Attendance Marked",
      description: `Successfully marked attendance for ${manualId}`,
    });
    setManualId("");
  };

  const selectedEventData = mockEvents.find((e) => e.id === selectedEvent);

  return (
    <DashboardLayout user={mockUser}>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="animate-fade-in">
          <h1 className="text-2xl md:text-3xl font-bold">QR Attendance Scanner</h1>
          <p className="text-muted-foreground mt-1">
            Scan student QR codes to mark attendance
          </p>
        </div>

        <div className="grid lg:grid-cols-5 gap-6">
          {/* Scanner Section */}
          <div className="lg:col-span-3 space-y-4 animate-slide-up">
            {/* Event Selection */}
            <Card>
              <CardHeader>
                <CardTitle>Select Event</CardTitle>
                <CardDescription>Choose the event for attendance tracking</CardDescription>
              </CardHeader>
              <CardContent>
                <Select value={selectedEvent} onValueChange={setSelectedEvent}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select an event" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockEvents.map((event) => (
                      <SelectItem key={event.id} value={event.id}>
                        {event.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {selectedEventData && (
                  <div className="mt-4 p-4 rounded-lg bg-muted">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{selectedEventData.title}</span>
                      <div className="flex items-center gap-2 text-sm">
                        <Users className="w-4 h-4" />
                        <span className="text-primary font-semibold">
                          {selectedEventData.attendees}
                        </span>
                        <span className="text-muted-foreground">
                          / {selectedEventData.total} checked in
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* QR Scanner */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <QrCode className="w-5 h-5 text-primary" />
                  QR Scanner
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative aspect-square max-w-sm mx-auto bg-muted rounded-xl overflow-hidden">
                  {isScanning ? (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="relative w-48 h-48">
                        <div className="absolute inset-0 border-2 border-primary rounded-lg" />
                        <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-primary rounded-tl-lg" />
                        <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-primary rounded-tr-lg" />
                        <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-primary rounded-bl-lg" />
                        <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-primary rounded-br-lg" />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-full h-0.5 bg-primary animate-pulse" />
                        </div>
                      </div>
                      <p className="absolute bottom-4 text-sm text-muted-foreground">
                        Scanning...
                      </p>
                    </div>
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground">
                      <Camera className="w-16 h-16 mb-4" />
                      <p>Click "Start Scanning" to begin</p>
                    </div>
                  )}
                </div>

                <Button
                  onClick={handleStartScanning}
                  className="w-full mt-4 gap-2"
                  disabled={!selectedEvent}
                >
                  <Camera className="w-4 h-4" />
                  {isScanning ? "Stop Scanning" : "Start Scanning"}
                </Button>
              </CardContent>
            </Card>

            {/* Manual Entry */}
            <Card>
              <CardHeader>
                <CardTitle>Manual Entry</CardTitle>
                <CardDescription>Enter student ID manually if QR scan fails</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter Student ID (e.g., 1CR21CS001)"
                    value={manualId}
                    onChange={(e) => setManualId(e.target.value)}
                  />
                  <Button onClick={handleManualEntry} className="gap-2">
                    <Search className="w-4 h-4" />
                    Mark
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Scans */}
          <div className="lg:col-span-2 animate-slide-up" style={{ animationDelay: "100ms" }}>
            <Card className="h-fit">
              <CardHeader>
                <CardTitle>Recent Scans</CardTitle>
                <CardDescription>Latest attendance entries</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <ul className="divide-y">
                  {recentScans.map((scan, index) => (
                    <li key={index} className="p-4">
                      <div className="flex items-center gap-3">
                        {scan.status === "success" ? (
                          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-status-approved/10">
                            <CheckCircle className="w-5 h-5 text-status-approved" />
                          </div>
                        ) : (
                          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-status-rejected/10">
                            <XCircle className="w-5 h-5 text-status-rejected" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{scan.name}</p>
                          <p className="text-xs text-muted-foreground">{scan.studentId}</p>
                        </div>
                        <span className="text-xs text-muted-foreground">{scan.time}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
