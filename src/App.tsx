import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import SelectRole from "./pages/SelectRole";
import MenteeOnboarding from "./pages/MenteeOnboarding";
import MenteeDashboard from "./pages/MenteeDashboard";
import MentorSetup from "./pages/MentorSetup";
import MentorDashboard from "./pages/MentorDashboard";
import Chat from "./pages/Chat";
import BookSession from "./pages/BookSession";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/select-role" element={<ProtectedRoute><SelectRole /></ProtectedRoute>} />
            <Route path="/mentee/onboarding" element={<ProtectedRoute><MenteeOnboarding /></ProtectedRoute>} />
            <Route path="/mentee/dashboard" element={<ProtectedRoute><MenteeDashboard /></ProtectedRoute>} />
            <Route path="/mentor/setup" element={<ProtectedRoute><MentorSetup /></ProtectedRoute>} />
            <Route path="/mentor/dashboard" element={<ProtectedRoute><MentorDashboard /></ProtectedRoute>} />
            <Route path="/chat/:partnerId" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
