import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import UserDashboard from "./pages/UserDashboard";
import MeetingsList from "./pages/MeetingsList";
import MeetingDetail from "./pages/MeetingDetail";
import MeetingPlayer from "./pages/MeetingPlayer";
import SummarizeMeeting from "./pages/SummarizeMeeting";
import AdminDashboard from "./pages/AdminDashboard";
import AdminMeetingsList from "./pages/AdminMeetingsList";
import AdminMeetingDetail from "./pages/AdminMeetingDetail";
import AdminMeetingPlayer from "./pages/AdminMeetingPlayer";
import AdminUsersList from "./pages/AdminUsersList";
import AdminAnalytics from "./pages/AdminAnalytics";
import AdminApiIntegration from "./pages/AdminApiIntegration";
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
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/userdashboard" element={<UserDashboard />} />
            <Route path="/meetings" element={<MeetingsList />} />
            <Route path="/meetings/:id" element={<MeetingDetail />} />
            <Route path="/meetings/:id/play" element={<MeetingPlayer />} />
            <Route path="/summarize" element={<SummarizeMeeting />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/meetings" element={<AdminMeetingsList />} />
            <Route path="/admin/meetings/:id" element={<AdminMeetingDetail />} />
            <Route path="/admin/meetings/:id/play" element={<AdminMeetingPlayer />} />
            <Route path="/admin/users" element={<AdminUsersList />} />
            <Route path="/admin/analytics" element={<AdminAnalytics />} />
            <Route path="/admin/api-integration" element={<AdminApiIntegration />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
