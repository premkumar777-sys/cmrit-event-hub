import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { useUserProfile } from "@/hooks/useUserProfile";
import { Button } from "@/components/ui/button";
import { Award, Download, Eye, Calendar, MapPin } from "lucide-react";

const certificates = [
  {
    id: "1",
    eventTitle: "AI/ML Workshop: Building Smart Applications",
    eventDate: "Jan 15, 2024",
    venue: "Seminar Hall A",
    issuedDate: "Jan 16, 2024",
    certificateId: "CMRIT-2024-0145",
  },
  {
    id: "2",
    eventTitle: "Code Sprint 2024",
    eventDate: "Jan 20, 2024",
    venue: "Computer Lab 1 & 2",
    issuedDate: "Jan 21, 2024",
    certificateId: "CMRIT-2024-0189",
  },
  {
    id: "3",
    eventTitle: "Tech Talk: Cloud Computing Trends",
    eventDate: "Dec 10, 2023",
    venue: "Main Auditorium",
    issuedDate: "Dec 11, 2023",
    certificateId: "CMRIT-2023-0892",
  },
];


export default function CertificatesPage() {
  const { user } = useAuth();
  const { profile } = useUserProfile();

  const handleDownload = (certId: string) => {
    // Simulate download
    console.log("Downloading certificate:", certId);
  };

  const handleView = (certId: string) => {
    // Simulate view
    console.log("Viewing certificate:", certId);
  };

  const dashboardUser = {
    name: profile?.full_name || user?.email?.split('@')[0] || "Student",
    email: user?.email || "",
    role: "student" as const,
  };

  return (
    <DashboardLayout user={dashboardUser}>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="animate-fade-in">
          <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-3">
            <Award className="w-8 h-8 text-primary" />
            My Certificates
          </h1>
          <p className="text-muted-foreground mt-1">
            View and download certificates for events you've attended
          </p>
        </div>

        {/* Certificates Grid */}
        <div className="space-y-4">
          {certificates.map((cert, index) => (
            <Card
              key={cert.id}
              className="overflow-hidden animate-fade-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <CardContent className="p-0">
                <div className="flex flex-col md:flex-row">
                  {/* Certificate Preview */}
                  <div className="md:w-64 bg-gradient-to-br from-primary/10 to-primary/5 p-6 flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-20 h-20 mx-auto mb-3 rounded-full bg-primary/20 flex items-center justify-center">
                        <Award className="w-10 h-10 text-primary" />
                      </div>
                      <p className="text-xs text-muted-foreground">Certificate of Participation</p>
                    </div>
                  </div>

                  {/* Certificate Details */}
                  <div className="flex-1 p-6">
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                      <div className="space-y-2">
                        <h3 className="font-semibold text-lg">{cert.eventTitle}</h3>
                        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {cert.eventDate}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {cert.venue}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Certificate ID: <span className="font-mono">{cert.certificateId}</span>
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Issued: {cert.issuedDate}
                        </p>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleView(cert.id)}
                          className="gap-1"
                        >
                          <Eye className="w-4 h-4" />
                          View
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleDownload(cert.id)}
                          className="gap-1"
                        >
                          <Download className="w-4 h-4" />
                          Download
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {certificates.length === 0 && (
          <Card className="p-12 text-center">
            <Award className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-lg font-semibold mb-2">No Certificates Yet</h3>
            <p className="text-muted-foreground">
              Attend events to receive certificates. They will appear here after the event is completed.
            </p>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
