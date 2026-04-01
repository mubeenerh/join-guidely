import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Bell, User, Calendar, Users, TrendingUp, Clock, CheckCircle, XCircle, MessageSquare, LogOut } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import logo from "@/assets/logo.png";
import { Link } from "react-router-dom";

interface MenteeRequest {
  id: string;
  mentee_id: string;
  status: string;
  message: string | null;
  created_at: string;
  mentee_profile?: { first_name: string; last_name: string };
}

const MentorDashboard = () => {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<"requests" | "schedule" | "impact">("requests");
  const [requests, setRequests] = useState<MenteeRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetchRequests = async () => {
      const { data } = await supabase
        .from("mentorship_requests")
        .select("*")
        .eq("mentor_id", user.id)
        .eq("status", "pending")
        .order("created_at", { ascending: false });

      if (data && data.length > 0) {
        const menteeIds = data.map(r => r.mentee_id);
        const { data: profiles } = await supabase
          .from("profiles")
          .select("user_id, first_name, last_name")
          .in("user_id", menteeIds);

        setRequests(data.map(r => ({
          ...r,
          mentee_profile: profiles?.find(p => p.user_id === r.mentee_id),
        })));
      }
      setLoading(false);
    };
    fetchRequests();
  }, [user]);

  const handleRequest = async (id: string, status: "accepted" | "declined") => {
    await supabase.from("mentorship_requests").update({ status }).eq("id", id);
    setRequests(prev => prev.filter(r => r.id !== id));
  };

  return (
    <div className="min-h-screen bg-background">
      <nav className="bg-card border-b border-border sticky top-0 z-40">
        <div className="container flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2">
            <img src={logo} alt="Guidedly" className="h-8 w-8 rounded-full" />
            <span className="font-bold text-foreground hidden sm:block">Guidedly</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link to="/mentor/setup" className="text-sm text-muted-foreground hover:text-foreground">Edit Profile</Link>
            <button onClick={() => { signOut(); navigate("/"); }} className="text-muted-foreground hover:text-foreground">
              <LogOut className="w-5 h-5" />
            </button>
            <div className="w-9 h-9 rounded-full gradient-ocean flex items-center justify-center">
              <User className="w-5 h-5 text-primary-foreground" />
            </div>
          </div>
        </div>
      </nav>

      <div className="container py-8">
        <h1 className="text-2xl font-bold text-foreground mb-1">
          Welcome, {profile?.first_name || "Mentor"}! 🎓
        </h1>
        <p className="text-muted-foreground mb-8">Manage your mentees and track your impact.</p>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Pending Requests", value: String(requests.length), icon: Clock },
            { label: "Active Mentees", value: "—", icon: Users },
            { label: "Sessions", value: "—", icon: Calendar },
            { label: "Rating", value: "—", icon: TrendingUp },
          ].map((stat, i) => (
            <motion.div key={stat.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }} className="bg-card rounded-2xl border border-border p-5">
              <stat.icon className="w-5 h-5 text-wave mb-2" />
              <p className="text-2xl font-bold text-foreground">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        <div className="flex gap-1 bg-muted rounded-xl p-1 mb-8 w-fit">
          {(["requests", "schedule", "impact"] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-5 py-2 rounded-lg text-sm font-medium transition-all capitalize ${tab === t ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>
              {t}
            </button>
          ))}
        </div>

        {tab === "requests" && (
          <div className="space-y-4">
            {loading ? (
              <div className="text-center py-12 text-muted-foreground">Loading...</div>
            ) : requests.length === 0 ? (
              <div className="bg-card rounded-2xl border border-border p-8 text-center">
                <CheckCircle className="w-12 h-12 text-wave mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">All Caught Up!</h3>
                <p className="text-sm text-muted-foreground">No pending requests at the moment.</p>
              </div>
            ) : (
              requests.map((req, i) => (
                <motion.div key={req.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }} className="bg-card rounded-2xl border border-border p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl gradient-wave flex items-center justify-center shrink-0">
                      <span className="text-lg font-bold text-primary">
                        {req.mentee_profile?.first_name?.charAt(0) || "?"}
                      </span>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground">
                        {req.mentee_profile ? `${req.mentee_profile.first_name} ${req.mentee_profile.last_name}` : "Mentee"}
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1">{req.message}</p>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <button onClick={() => handleRequest(req.id, "accepted")}
                      className="flex-1 gradient-ocean text-primary-foreground py-2.5 rounded-lg text-sm font-semibold hover:opacity-90 flex items-center justify-center gap-1">
                      <CheckCircle className="w-4 h-4" /> Accept
                    </button>
                    <button onClick={() => navigate(`/chat/${req.mentee_id}`)}
                      className="px-4 py-2.5 rounded-lg border border-border text-foreground text-sm font-medium hover:bg-muted flex items-center gap-1">
                      <MessageSquare className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleRequest(req.id, "declined")}
                      className="flex-1 border border-border text-foreground py-2.5 rounded-lg text-sm font-medium hover:bg-muted flex items-center justify-center gap-1">
                      <XCircle className="w-4 h-4" /> Decline
                    </button>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        )}

        {tab === "schedule" && (
          <div className="bg-card rounded-2xl border border-border p-8 text-center">
            <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">Your Schedule</h3>
            <p className="text-sm text-muted-foreground">Upcoming sessions will appear here.</p>
          </div>
        )}

        {tab === "impact" && (
          <div className="bg-card rounded-2xl border border-border p-8 text-center">
            <TrendingUp className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">Your Impact</h3>
            <p className="text-sm text-muted-foreground">Track mentee progress and feedback here.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MentorDashboard;
