import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import SessionsList from "@/components/SessionsList";
import { Star, Calendar, MessageSquare, TrendingUp, Search, Bell, User, BadgeCheck, LogOut } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import logo from "@/assets/logo.png";
import { Link } from "react-router-dom";

interface MentorWithProfile {
  user_id: string;
  sector: string;
  bio: string;
  available: boolean;
  rating: number | null;
  sessions_count: number | null;
  qualifications: string[] | null;
  profile?: { first_name: string; last_name: string };
}

const MenteeDashboard = () => {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<"mentors" | "sessions" | "progress">("mentors");
  const [searchQuery, setSearchQuery] = useState("");
  const [mentors, setMentors] = useState<MentorWithProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMentors = async () => {
      const { data: mentorProfiles } = await supabase
        .from("mentor_profiles")
        .select("*")
        .eq("available", true);

      if (mentorProfiles && mentorProfiles.length > 0) {
        const userIds = mentorProfiles.map(m => m.user_id);
        const { data: profiles } = await supabase
          .from("profiles")
          .select("user_id, first_name, last_name")
          .in("user_id", userIds);

        const merged = mentorProfiles.map(m => ({
          ...m,
          profile: profiles?.find(p => p.user_id === m.user_id),
        }));
        setMentors(merged);
      }
      setLoading(false);
    };
    fetchMentors();
  }, []);

  const filteredMentors = mentors.filter(m => {
    const name = m.profile ? `${m.profile.first_name} ${m.profile.last_name}` : "";
    return name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.sector.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const requestMentorship = async (mentorUserId: string) => {
    if (!user) return;
    const { error } = await supabase.from("mentorship_requests").insert({
      mentee_id: user.id,
      mentor_id: mentorUserId,
      message: "I'd love to connect for mentorship!",
    });
    if (!error) {
      alert("Request sent!");
    }
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
            <button className="relative text-muted-foreground hover:text-foreground">
              <Bell className="w-5 h-5" />
            </button>
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
          Welcome back, {profile?.first_name || "Mentee"}! 👋
        </h1>
        <p className="text-muted-foreground mb-8">Find your perfect mentor and grow your business.</p>

        <div className="flex gap-1 bg-muted rounded-xl p-1 mb-8 w-fit">
          {(["mentors", "sessions", "progress"] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-5 py-2 rounded-lg text-sm font-medium transition-all capitalize ${tab === t ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>
              {t}
            </button>
          ))}
        </div>

        {tab === "mentors" && (
          <>
            <div className="relative mb-6">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input type="text" placeholder="Search mentors by name or sector..." value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-xl border border-input bg-card text-foreground text-sm focus:ring-2 focus:ring-ring outline-none transition" />
            </div>
            {loading ? (
              <div className="text-center py-12 text-muted-foreground">Loading mentors...</div>
            ) : filteredMentors.length === 0 ? (
              <div className="bg-card rounded-2xl border border-border p-8 text-center">
                <User className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">No Mentors Found</h3>
                <p className="text-sm text-muted-foreground">Check back soon — mentors are joining every day!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredMentors.map((mentor, i) => (
                  <motion.div key={mentor.user_id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }} className="bg-card rounded-2xl border border-border p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-start gap-4">
                      <div className="w-14 h-14 rounded-xl gradient-wave flex items-center justify-center shrink-0">
                        <span className="text-lg font-bold text-primary">
                          {mentor.profile?.first_name?.charAt(0) || "?"}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-foreground truncate">
                            {mentor.profile ? `${mentor.profile.first_name} ${mentor.profile.last_name}` : "Mentor"}
                          </h3>
                          <BadgeCheck className="w-4 h-4 text-wave shrink-0" />
                        </div>
                        <p className="text-xs text-muted-foreground mb-2">{mentor.sector}</p>
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{mentor.bio}</p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1"><Star className="w-3.5 h-3.5 text-amber-500" /> {mentor.rating || "New"}</span>
                          <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {mentor.sessions_count || 0} sessions</span>
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 flex gap-2">
                      <button onClick={() => navigate(`/book/${mentor.user_id}`)}
                        className="flex-1 gradient-ocean text-primary-foreground py-2.5 rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity">
                        Book Session
                      </button>
                      <button onClick={() => requestMentorship(mentor.user_id)}
                        className="px-4 py-2.5 rounded-lg border border-border text-foreground text-sm font-medium hover:bg-muted transition-colors text-xs">
                        Request
                      </button>
                      <button onClick={() => navigate(`/chat/${mentor.user_id}`)}
                        className="px-4 py-2.5 rounded-lg border border-border text-foreground text-sm font-medium hover:bg-muted transition-colors">
                        <MessageSquare className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </>
        )}

        {tab === "sessions" && (
          <div className="bg-card rounded-2xl border border-border p-8 text-center">
            <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No Sessions Yet</h3>
            <p className="text-sm text-muted-foreground">Once a mentor accepts your request, you'll be able to schedule sessions.</p>
          </div>
        )}

        {tab === "progress" && (
          <div className="bg-card rounded-2xl border border-border p-8 text-center">
            <TrendingUp className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">Track Your Growth</h3>
            <p className="text-sm text-muted-foreground">Your milestones and achievements will appear here.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MenteeDashboard;
