import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import LandingPage from "./pages/LandingPage";
import AuthPage from "./pages/AuthPage";
import StudentDashboard from "./pages/StudentDashboard";
import OrganizerDashboard from "./pages/OrganizerDashboard";
import FacultyDashboard from "./pages/FacultyDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import CreateEventPage from "./pages/CreateEventPage";
import QRScannerPage from "./pages/QRScannerPage";
import CertificatesPage from "./pages/CertificatesPage";
import CanteenMenuPage from "./pages/CanteenMenuPage";
import CanteenAdminPage from "./pages/CanteenAdminPage";
import CanteenScannerPage from "./pages/CanteenScannerPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/dashboard" element={<StudentDashboard />} />
            <Route path="/events" element={<StudentDashboard />} />
            <Route path="/registrations" element={<StudentDashboard />} />
            <Route path="/certificates" element={<CertificatesPage />} />
            <Route path="/organizer" element={<OrganizerDashboard />} />
            <Route path="/my-events" element={<OrganizerDashboard />} />
            <Route path="/create-event" element={<CreateEventPage />} />
            <Route path="/scanner" element={<QRScannerPage />} />
            <Route path="/faculty" element={<FacultyDashboard />} />
            <Route path="/approvals" element={<FacultyDashboard />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/analytics" element={<AdminDashboard />} />
            <Route path="/users" element={<AdminDashboard />} />
            <Route path="/settings" element={<StudentDashboard />} />
            <Route path="/canteen" element={<CanteenMenuPage />} />
            <Route path="/canteen/admin" element={<CanteenAdminPage />} />
            <Route path="/canteen/scanner" element={<CanteenScannerPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
