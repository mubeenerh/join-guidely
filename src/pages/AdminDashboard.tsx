import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ShieldCheck, Users, Calendar, CheckCircle, BarChart3, LogOut, UserCheck, UserX, Eye, MessageSquare } from "lucide-react";
import logo from "@/assets/logo.png";
import { useNavigate } from "react-router-dom";

type TabKey = "overview" | "users" | "sessions" | "verification" | "appeals";
type VerificationFilter = "all" | "pending" | "verified" | "suspended";

interface UserProfile {
  user_id: string;
  first_name: string;
  last_name: string;
  role: string | null;
  created_at: string;
}

interface MentorProfile {
  user_id: string;
  sector: string;
  bio: string;
  qualifications: string[] | null;
  certifications: string[] | null;
  achievements: string[] | null;
  available: boolean;
  rating: number | null;
  sessions_count: number | null;
  verified: boolean;
  suspended: boolean;
}

interface AppealRow {
  id: string;
  mentor_id: string;
  reason: string;
  admin_response: string | null;
  status: string;
  created_at: string;
}

interface SessionRow {
  id: string;
  mentor_id: string;
  mentee_id: string;
  scheduled_date: string;
  start_time: string;
  end_time: string;
  status: string;
}

const AdminDashboard = () => {
  const { signOut } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [tab, setTab] = useState<TabKey>("overview");
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [mentors, setMentors] = useState<MentorProfile[]>([]);
  const [sessions, setSessions] = useState<SessionRow[]>([]);
  const [appeals, setAppeals] = useState<AppealRow[]>([]);
  const [appealResponses, setAppealResponses] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [verificationFilter, setVerificationFilter] = useState<VerificationFilter>("all");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const [usersRes, mentorsRes, sessionsRes, appealsRes] = await Promise.all([
      supabase.from("profiles").select("user_id, first_name, last_name, role, created_at").order("created_at", { ascending: false }),
      supabase.from("mentor_profiles").select("user_id, sector, bio, qualifications, certifications, achievements, available, rating, sessions_count, verified, suspended"),
      supabase.from("sessions").select("id, mentor_id, mentee_id, scheduled_date, start_time, end_time, status").order("scheduled_date", { ascending: false }),
      supabase.from("mentor_appeals").select("*").order("created_at", { ascending: false }),
    ]);
    setUsers(usersRes.data || []);
    setMentors(mentorsRes.data || []);
    setSessions(sessionsRes.data || []);
    setAppeals(appealsRes.data || []);
    setLoading(false);
  };

  const handleLogout = async () => {
    await signOut();
    navigate("/admin/login");
  };

  const totalMentees = users.filter(u => u.role === "mentee").length;
  const totalMentors = users.filter(u => u.role === "mentor").length;
  const activeSessions = sessions.filter(s => s.status === "scheduled").length;
  const completedSessions = sessions.filter(s => s.status === "completed").length;

  const tabs: { key: TabKey; label: string; icon: React.ReactNode }[] = [
    { key: "overview", label: "Overview", icon: <BarChart3 className="w-4 h-4" /> },
    { key: "users", label: "Users", icon: <Users className="w-4 h-4" /> },
    { key: "sessions", label: "Sessions", icon: <Calendar className="w-4 h-4" /> },
    { key: "verification", label: "Mentor Verification", icon: <CheckCircle className="w-4 h-4" /> },
    { key: "appeals", label: `Appeals (${appeals.filter(a => a.status === "pending").length})`, icon: <MessageSquare className="w-4 h-4" /> },
  ];

  const getUserName = (userId: string) => {
    const u = users.find(u => u.user_id === userId);
    return u ? `${u.first_name} ${u.last_name}` : userId.slice(0, 8);
  };

  return (
    <div className="min-h-screen bg-muted">
      {/* Header */}
      <header className="bg-card border-b border-border px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src={logo} alt="GUIDELY" className="h-8 w-8 rounded-full" />
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-primary" />
            <span className="text-lg font-bold text-foreground">Admin Panel</span>
          </div>
        </div>
        <button onClick={handleLogout} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <LogOut className="w-4 h-4" /> Sign Out
        </button>
      </header>

      <div className="max-w-7xl mx-auto p-6">
        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {tabs.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${tab === t.key ? "bg-primary text-primary-foreground" : "bg-card border border-border text-muted-foreground hover:text-foreground"}`}>
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : (
          <>
            {/* Overview */}
            {tab === "overview" && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { label: "Total Users", value: users.length, icon: <Users className="w-5 h-5" />, color: "text-primary" },
                    { label: "Mentors", value: totalMentors, icon: <UserCheck className="w-5 h-5" />, color: "text-accent" },
                    { label: "Mentees", value: totalMentees, icon: <Users className="w-5 h-5" />, color: "text-accent" },
                    { label: "Active Sessions", value: activeSessions, icon: <Calendar className="w-5 h-5" />, color: "text-primary" },
                  ].map((stat, i) => (
                    <div key={i} className="bg-card rounded-xl border border-border p-5">
                      <div className={`${stat.color} mb-2`}>{stat.icon}</div>
                      <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                      <p className="text-xs text-muted-foreground">{stat.label}</p>
                    </div>
                  ))}
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-card rounded-xl border border-border p-6">
                    <h3 className="text-sm font-semibold text-foreground mb-4">Recent Users</h3>
                    <div className="space-y-3">
                      {users.slice(0, 5).map(u => (
                        <div key={u.user_id} className="flex items-center justify-between text-sm">
                          <span className="text-foreground">{u.first_name} {u.last_name}</span>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${u.role === "mentor" ? "bg-primary/10 text-primary" : u.role === "mentee" ? "bg-accent/10 text-accent" : "bg-muted text-muted-foreground"}`}>
                            {u.role || "No role"}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="bg-card rounded-xl border border-border p-6">
                    <h3 className="text-sm font-semibold text-foreground mb-4">Session Stats</h3>
                    <div className="space-y-3">
                      {[
                        { label: "Scheduled", count: activeSessions },
                        { label: "Completed", count: completedSessions },
                        { label: "Cancelled", count: sessions.filter(s => s.status === "cancelled").length },
                        { label: "Total", count: sessions.length },
                      ].map((s, i) => (
                        <div key={i} className="flex justify-between text-sm">
                          <span className="text-muted-foreground">{s.label}</span>
                          <span className="font-semibold text-foreground">{s.count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Users */}
            {tab === "users" && (
              <div className="bg-card rounded-xl border border-border overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="text-left px-4 py-3 font-medium text-muted-foreground">Name</th>
                        <th className="text-left px-4 py-3 font-medium text-muted-foreground">Role</th>
                        <th className="text-left px-4 py-3 font-medium text-muted-foreground">Joined</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {users.map(u => (
                        <tr key={u.user_id} className="hover:bg-muted/30">
                          <td className="px-4 py-3 text-foreground font-medium">{u.first_name} {u.last_name}</td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${u.role === "mentor" ? "bg-primary/10 text-primary" : u.role === "mentee" ? "bg-accent/10 text-accent" : "bg-muted text-muted-foreground"}`}>
                              {u.role || "No role"}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-muted-foreground">{new Date(u.created_at).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Sessions */}
            {tab === "sessions" && (
              <div className="bg-card rounded-xl border border-border overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="text-left px-4 py-3 font-medium text-muted-foreground">Mentor</th>
                        <th className="text-left px-4 py-3 font-medium text-muted-foreground">Mentee</th>
                        <th className="text-left px-4 py-3 font-medium text-muted-foreground">Date</th>
                        <th className="text-left px-4 py-3 font-medium text-muted-foreground">Time</th>
                        <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {sessions.map(s => (
                        <tr key={s.id} className="hover:bg-muted/30">
                          <td className="px-4 py-3 text-foreground">{getUserName(s.mentor_id)}</td>
                          <td className="px-4 py-3 text-foreground">{getUserName(s.mentee_id)}</td>
                          <td className="px-4 py-3 text-muted-foreground">{new Date(s.scheduled_date).toLocaleDateString()}</td>
                          <td className="px-4 py-3 text-muted-foreground">{s.start_time} - {s.end_time}</td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${s.status === "scheduled" ? "bg-primary/10 text-primary" : s.status === "completed" ? "bg-green-100 text-green-700" : "bg-destructive/10 text-destructive"}`}>
                              {s.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                      {sessions.length === 0 && (
                        <tr><td colSpan={5} className="text-center py-8 text-muted-foreground">No sessions yet</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Mentor Verification */}
            {tab === "verification" && (
              <div className="space-y-4">
                <div className="flex gap-2">
                  {(["all", "pending", "verified", "suspended"] as VerificationFilter[]).map(f => (
                    <button key={f} onClick={() => setVerificationFilter(f)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors ${verificationFilter === f ? "bg-primary text-primary-foreground" : "bg-card border border-border text-muted-foreground hover:text-foreground"}`}>
                      {f} ({f === "all" ? mentors.length : f === "pending" ? mentors.filter(m => !m.verified && !m.suspended).length : f === "verified" ? mentors.filter(m => m.verified).length : mentors.filter(m => m.suspended).length})
                    </button>
                  ))}
                </div>
                {mentors.filter(m => verificationFilter === "all" ? true : verificationFilter === "pending" ? (!m.verified && !m.suspended) : verificationFilter === "verified" ? m.verified : m.suspended).length === 0 && (
                  <div className="bg-card rounded-xl border border-border p-8 text-center text-muted-foreground">No {verificationFilter === "all" ? "" : verificationFilter + " "}mentors found</div>
                )}
                {mentors.filter(m => verificationFilter === "all" ? true : verificationFilter === "pending" ? !m.verified : m.verified).map(m => {
                  const profile = users.find(u => u.user_id === m.user_id);
                  return (
                    <div key={m.user_id} className="bg-card rounded-xl border border-border p-6">
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold text-foreground">{profile?.first_name} {profile?.last_name}</h3>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${m.verified ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>
                              {m.verified ? "Verified" : "Pending"}
                            </span>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${m.available ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>
                              {m.available ? "Available" : "Unavailable"}
                            </span>
                          </div>
                          <p className="text-sm text-primary font-medium mb-1">{m.sector}</p>
                          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{m.bio}</p>
                          <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                            <span>⭐ {m.rating ?? 0} rating</span>
                            <span>📅 {m.sessions_count ?? 0} sessions</span>
                            <span>🎓 {m.qualifications?.length ?? 0} qualifications</span>
                            <span>📜 {m.certifications?.length ?? 0} certifications</span>
                          </div>
                          {m.qualifications && m.qualifications.length > 0 && (
                            <div className="mt-3">
                              <p className="text-xs font-medium text-muted-foreground mb-1.5">Qualifications</p>
                              <div className="flex flex-wrap gap-1.5">
                                {m.qualifications.map((q, i) => (
                                  <span key={i} className="bg-secondary text-secondary-foreground px-2 py-1 rounded text-xs">{q}</span>
                                ))}
                              </div>
                            </div>
                          )}
                          {m.certifications && m.certifications.length > 0 && (
                            <div className="mt-3">
                              <p className="text-xs font-medium text-muted-foreground mb-1.5">Certifications</p>
                              <div className="flex flex-wrap gap-1.5">
                                {m.certifications.map((c, i) => {
                                  const urlMatch = c.match(/\((https?:\/\/[^)]+)\)/);
                                  return (
                                    <span key={i} className="bg-primary/10 text-primary px-2 py-1 rounded text-xs">
                                      {urlMatch ? (
                                        <a href={urlMatch[1]} target="_blank" rel="noopener noreferrer" className="underline">{c.replace(` (${urlMatch[1]})`, '')}</a>
                                      ) : c}
                                    </span>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                          {m.achievements && m.achievements.length > 0 && (
                            <div className="mt-3">
                              <p className="text-xs font-medium text-muted-foreground mb-1.5">Achievements</p>
                              <div className="flex flex-wrap gap-1.5">
                                {m.achievements.map((a, i) => (
                                  <span key={i} className="bg-accent/10 text-accent-foreground px-2 py-1 rounded text-xs">{a}</span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                        <div className="flex gap-2 shrink-0">
                          <button
                            onClick={async () => {
                              const { error } = await supabase.from("mentor_profiles").update({ verified: true }).eq("user_id", m.user_id);
                              if (!error) {
                                toast({ title: "Mentor verified", description: `${profile?.first_name} ${profile?.last_name} is now visible to mentees.` });
                                fetchData();
                              }
                            }}
                            disabled={m.verified}
                            className={`flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${m.verified ? "bg-green-100 text-green-700 opacity-60 cursor-not-allowed" : "bg-green-50 text-green-700 hover:bg-green-100"}`}>
                            <UserCheck className="w-3.5 h-3.5" /> {m.verified ? "Verified" : "Verify"}
                          </button>
                          <button
                            onClick={async () => {
                              const { error } = await supabase.from("mentor_profiles").update({ verified: false }).eq("user_id", m.user_id);
                              if (!error) {
                                toast({ title: "Mentor suspended", description: `${profile?.first_name} ${profile?.last_name} is no longer visible to mentees.` });
                                fetchData();
                              }
                            }}
                            disabled={!m.verified}
                            className={`flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${!m.verified ? "bg-destructive/10 text-destructive opacity-60 cursor-not-allowed" : "bg-destructive/10 text-destructive hover:bg-destructive/20"}`}>
                            <UserX className="w-3.5 h-3.5" /> Suspend
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;

