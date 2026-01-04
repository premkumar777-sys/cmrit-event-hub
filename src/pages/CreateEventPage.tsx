import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar, Upload, ArrowLeft, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const mockUser = {
  name: "Sarah Johnson",
  email: "sarah.johnson@cmrit.ac.in",
  role: "organizer" as const,
};

const departments = ["CSE", "CSM", "CSD", "ECE", "EEE", "MECH", "CIVIL"];
const categories = ["Workshop", "Competition", "Seminar", "Cultural", "Sports", "Tech Talk"];
const venues = [
  "Seminar Hall A",
  "Seminar Hall B",
  "Main Auditorium",
  "Computer Lab 1",
  "Computer Lab 2",
  "Conference Room A",
  "Conference Room B",
  "Innovation Hub",
  "Main Ground",
];

export default function CreateEventPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      toast({
        title: "Event Submitted!",
        description: "Your event has been submitted for approval.",
      });
      navigate("/my-events");
    }, 1500);
  };

  const handleSaveDraft = () => {
    toast({
      title: "Draft Saved",
      description: "Your event draft has been saved.",
    });
  };

  return (
    <DashboardLayout user={mockUser}>
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4 animate-fade-in">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Create New Event</h1>
            <p className="text-muted-foreground">
              Fill in the details to submit your event for approval
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 animate-slide-up">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>
                Enter the main details about your event
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Event Title *</Label>
                <Input
                  id="title"
                  placeholder="e.g., AI/ML Workshop: Building Smart Applications"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  placeholder="Provide a detailed description of your event..."
                  rows={4}
                  required
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Department *</Label>
                  <Select required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      {departments.map((dept) => (
                        <SelectItem key={dept} value={dept}>
                          {dept}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Category *</Label>
                  <Select required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Date and Venue */}
          <Card>
            <CardHeader>
              <CardTitle>Date & Venue</CardTitle>
              <CardDescription>
                When and where will the event take place?
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date">Event Date *</Label>
                  <div className="relative">
                    <Input
                      id="date"
                      type="date"
                      required
                    />
                    <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="time">Time *</Label>
                  <Input
                    id="time"
                    type="time"
                    required
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Venue *</Label>
                  <Select required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select venue" />
                    </SelectTrigger>
                    <SelectContent>
                      {venues.map((venue) => (
                        <SelectItem key={venue} value={venue}>
                          {venue}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="capacity">Expected Attendees *</Label>
                  <Input
                    id="capacity"
                    type="number"
                    placeholder="50"
                    min={1}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="duration">Duration</Label>
                <Input
                  id="duration"
                  placeholder="e.g., 3 hours, Full day"
                />
              </div>
            </CardContent>
          </Card>

          {/* Poster Upload */}
          <Card>
            <CardHeader>
              <CardTitle>Event Poster</CardTitle>
              <CardDescription>
                Upload an attractive poster for your event (optional)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border-2 border-dashed rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer">
                <Upload className="w-10 h-10 mx-auto mb-4 text-muted-foreground" />
                <p className="text-sm text-muted-foreground mb-2">
                  Drag and drop your poster here, or click to browse
                </p>
                <p className="text-xs text-muted-foreground">
                  PNG, JPG up to 5MB
                </p>
                <Input
                  type="file"
                  accept="image/*"
                  className="hidden"
                />
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={handleSaveDraft}
              className="flex-1"
            >
              Save as Draft
            </Button>
            <Button
              type="submit"
              className="flex-1 gap-2"
              disabled={isSubmitting}
            >
              <Send className="w-4 h-4" />
              {isSubmitting ? "Submitting..." : "Submit for Approval"}
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
