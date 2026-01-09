import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RegistrationQRCode } from "./RegistrationQRCode";
import { Download, Share2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface RegistrationTicketDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  registration: {
    id: string;
    eventTitle: string;
    eventDate: string;
    eventTime: string;
    eventVenue: string;
    organizerName: string;
    userName: string;
    userEmail: string;
  } | null;
}

export function RegistrationTicketDialog({
  open,
  onOpenChange,
  registration,
}: RegistrationTicketDialogProps) {
  const { toast } = useToast();

  if (!registration) return null;

  const handleShare = async () => {
    const shareData = {
      title: `Event Registration: ${registration.eventTitle}`,
      text: `I'm registered for ${registration.eventTitle} by ${registration.organizerName} on ${registration.eventDate}`,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        // User cancelled or error
      }
    } else {
      await navigator.clipboard.writeText(shareData.text);
      toast({
        title: "Copied to clipboard",
        description: "Registration details copied!",
      });
    }
  };

  const handleDownload = () => {
    // Get the SVG element and convert to downloadable image
    const svgElement = document.querySelector(".registration-qr svg");
    if (!svgElement) return;

    const svgData = new XMLSerializer().serializeToString(svgElement);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx?.drawImage(img, 0, 0);
      const link = document.createElement("a");
      link.download = `ticket-${registration.eventTitle.replace(/\s+/g, "-")}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    };

    img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">Your Event Ticket</DialogTitle>
        </DialogHeader>
        
        <div className="registration-qr">
          <RegistrationQRCode
            registrationId={registration.id}
            eventTitle={registration.eventTitle}
            eventDate={registration.eventDate}
            eventTime={registration.eventTime}
            eventVenue={registration.eventVenue}
            organizerName={registration.organizerName}
            userName={registration.userName}
            userEmail={registration.userEmail}
          />
        </div>

        <div className="flex gap-2 mt-4">
          <Button variant="outline" className="flex-1" onClick={handleDownload}>
            <Download className="w-4 h-4 mr-2" />
            Download
          </Button>
          <Button variant="outline" className="flex-1" onClick={handleShare}>
            <Share2 className="w-4 h-4 mr-2" />
            Share
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
