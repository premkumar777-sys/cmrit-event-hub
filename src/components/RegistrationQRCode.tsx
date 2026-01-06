import { QRCodeSVG } from "qrcode.react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Clock, MapPin, Building2 } from "lucide-react";

interface RegistrationQRCodeProps {
  registrationId: string;
  eventTitle: string;
  eventDate: string;
  eventTime: string;
  eventVenue: string;
  organizerName: string; // Club/Unit name
  userName: string;
  userEmail: string;
}

export function RegistrationQRCode({
  registrationId,
  eventTitle,
  eventDate,
  eventTime,
  eventVenue,
  organizerName,
  userName,
  userEmail,
}: RegistrationQRCodeProps) {
  // QR data contains all necessary info for scanning
  const qrData = JSON.stringify({
    registrationId,
    eventTitle,
    eventDate,
    eventTime,
    eventVenue,
    organizer: organizerName,
    attendee: {
      name: userName,
      email: userEmail,
    },
    timestamp: new Date().toISOString(),
  });

  return (
    <Card className="w-full max-w-sm mx-auto">
      <CardHeader className="text-center pb-2">
        <div className="inline-flex items-center justify-center gap-2 text-sm text-primary font-medium mb-2">
          <Building2 className="w-4 h-4" />
          <span>{organizerName}</span>
        </div>
        <CardTitle className="text-lg">{eventTitle}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-4">
        <div className="bg-white p-4 rounded-lg shadow-inner">
          <QRCodeSVG
            value={qrData}
            size={180}
            level="H"
            includeMargin={false}
            bgColor="#ffffff"
            fgColor="#000000"
          />
        </div>
        
        <div className="w-full space-y-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-primary" />
            <span>{eventDate}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-primary" />
            <span>{eventTime}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-primary" />
            <span>{eventVenue}</span>
          </div>
        </div>

        <div className="w-full pt-2 border-t text-center">
          <p className="text-xs text-muted-foreground">Attendee</p>
          <p className="font-medium">{userName}</p>
          <p className="text-xs text-muted-foreground">{userEmail}</p>
        </div>

        <p className="text-xs text-muted-foreground text-center">
          Show this QR code at the event entrance for check-in
        </p>
      </CardContent>
    </Card>
  );
}
