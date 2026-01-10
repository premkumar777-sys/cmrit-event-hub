import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { ProtectedRoute, DashboardRedirect } from "@/components/ProtectedRoute";
import LandingPage from "./pages/LandingPage";
import AuthPage from "./pages/AuthPage";
import StudentDashboard from "./pages/StudentDashboard";
import SettingsPage from "./pages/SettingsPage";
import OrganizerDashboard from "./pages/OrganizerDashboard";
import FacultyDashboard from "./pages/FacultyDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import CreateEventPage from "./pages/CreateEventPage";
import QRScannerPage from "./pages/QRScannerPage";
import CertificatesPage from "./pages/CertificatesPage";
import CanteenMenuPage from "./pages/CanteenMenuPage";
import ClubPage from "./pages/ClubPage";
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
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/clubs/:clubId" element={<ClubPage />} />

            {/* Smart Dashboard Redirect - redirects based on role */}
            <Route path="/dashboard" element={<DashboardRedirect />} />

            {/* Student Routes */}
            <Route path="/events" element={
              <ProtectedRoute allowedRoles={['student', 'organizer', 'faculty', 'hod', 'admin']}>
                <StudentDashboard />
              </ProtectedRoute>
            } />
            <Route path="/registrations" element={
              <ProtectedRoute allowedRoles={['student', 'organizer', 'faculty', 'hod', 'admin']}>
                <StudentDashboard />
              </ProtectedRoute>
            } />
            <Route path="/certificates" element={
              <ProtectedRoute allowedRoles={['student', 'organizer', 'faculty', 'hod', 'admin']}>
                <CertificatesPage />
              </ProtectedRoute>
            } />
            <Route path="/canteen" element={
              <ProtectedRoute allowedRoles={['student', 'organizer', 'faculty', 'hod', 'admin']}>
                <CanteenMenuPage />
              </ProtectedRoute>
            } />
            <Route path="/settings" element={
              <ProtectedRoute>
                <SettingsPage />
              </ProtectedRoute>
            } />

            {/* Organizer Routes */}
            <Route path="/organizer" element={
              <ProtectedRoute allowedRoles={['organizer', 'faculty', 'hod', 'admin']}>
                <OrganizerDashboard />
              </ProtectedRoute>
            } />
            <Route path="/my-events" element={
              <ProtectedRoute allowedRoles={['organizer', 'faculty', 'hod', 'admin']}>
                <OrganizerDashboard />
              </ProtectedRoute>
            } />
            <Route path="/create-event" element={
              <ProtectedRoute allowedRoles={['organizer', 'faculty', 'hod', 'admin']}>
                <CreateEventPage />
              </ProtectedRoute>
            } />
            <Route path="/scanner" element={
              <ProtectedRoute allowedRoles={['organizer', 'faculty', 'hod', 'admin']}>
                <QRScannerPage />
              </ProtectedRoute>
            } />

            {/* Faculty/HOD Routes */}
            <Route path="/faculty" element={
              <ProtectedRoute allowedRoles={['faculty', 'hod', 'admin']}>
                <FacultyDashboard />
              </ProtectedRoute>
            } />
            <Route path="/approvals" element={
              <ProtectedRoute allowedRoles={['faculty', 'hod', 'admin']}>
                <FacultyDashboard />
              </ProtectedRoute>
            } />

            {/* Admin Routes */}
            <Route path="/admin" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            } />
            <Route path="/analytics" element={
              <ProtectedRoute allowedRoles={['organizer', 'faculty', 'hod', 'admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            } />
            <Route path="/users" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            } />

            {/* Canteen admin routes removed */}

            {/* 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;

