import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { Calendar, Clock, Video, XCircle, CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface SessionWithProfile {
  id: string;
  mentor_id: string;
  mentee_id: string;
  scheduled_date: string;
  start_time: string;
  end_time: string;
  status: string;
  notes: string | null;
  partner_name?: string;
}

interface SessionsListProps {
  role: "mentee" | "mentor";
}

const SessionsList = ({ role }: SessionsListProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [sessions, setSessions] = useState<SessionWithProfile[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSessions = async () => {
    if (!user) return;
    const col = role === "mentee" ? "mentee_id" : "mentor_id";
    const { data } = await supabase
      .from("sessions")
      .select("*")
      .eq(col, user.id)
      .order("scheduled_date", { ascending: true });

    if (data && data.length > 0) {
      const partnerIds = data.map(s => role === "mentee" ? s.mentor_id : s.mentee_id);
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, first_name, last_name")
        .in("user_id", partnerIds);

      setSessions(data.map(s => {
        const partnerId = role === "mentee" ? s.mentor_id : s.mentee_id;
        const p = profiles?.find(pr => pr.user_id === partnerId);
        return { ...s, partner_name: p ? `${p.first_name} ${p.last_name}` : "Unknown" };
      }));
    }
    setLoading(false);
  };

  useEffect(() => { fetchSessions(); }, [user]);

  // Realtime
  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel("sessions-" + role)
      .on("postgres_changes", { event: "*", schema: "public", table: "sessions" }, () => {
        fetchSessions();
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user]);

  const updateStatus = async (id: string, status: "completed" | "cancelled") => {
    await supabase.from("sessions").update({ status }).eq("id", id);
    toast({ title: `Session ${status}` });
    fetchSessions();
  };

  const upcoming = sessions.filter(s => s.status === "scheduled");
  const past = sessions.filter(s => s.status !== "scheduled");

  if (loading) return <div className="text-center py-8 text-muted-foreground">Loading sessions...</div>;

  if (sessions.length === 0) {
    return (
      <div className="bg-card rounded-2xl border border-border p-8 text-center">
        <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-foreground mb-2">No Sessions Yet</h3>
        <p className="text-sm text-muted-foreground">
          {role === "mentee" ? "Book a session with a mentor to get started." : "Sessions will appear here once mentees book with you."}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {upcoming.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-foreground mb-3">Upcoming</h3>
          <div className="space-y-3">
            {upcoming.map((session, i) => (
              <motion.div key={session.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-card rounded-2xl border border-border p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl gradient-ocean flex items-center justify-center shrink-0 mt-0.5">
                      <Video className="w-5 h-5 text-primary-foreground" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground text-sm">{session.partner_name}</h4>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          {format(new Date(session.scheduled_date + "T00:00"), "MMM d, yyyy")}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {session.start_time.slice(0, 5)} — {session.end_time.slice(0, 5)}
                        </span>
                      </div>
                      {session.notes && (
                        <p className="text-xs text-muted-foreground mt-2 line-clamp-1">📝 {session.notes}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-1.5 shrink-0">
                    <button onClick={() => navigate(`/chat/${role === "mentee" ? session.mentor_id : session.mentee_id}`)}
                      className="gradient-ocean text-primary-foreground px-3 py-1.5 rounded-lg text-xs font-medium hover:opacity-90">
                      Chat
                    </button>
                    <button onClick={() => updateStatus(session.id, "cancelled")}
                      className="border border-border text-muted-foreground px-2 py-1.5 rounded-lg hover:text-destructive hover:border-destructive/30 transition-colors">
                      <XCircle className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {past.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-foreground mb-3">Past Sessions</h3>
          <div className="space-y-3">
            {past.map(session => (
              <div key={session.id} className="bg-card rounded-2xl border border-border p-5 opacity-60">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${session.status === "completed" ? "bg-secondary" : "bg-destructive/10"}`}>
                    {session.status === "completed" ? <CheckCircle className="w-4 h-4 text-wave" /> : <XCircle className="w-4 h-4 text-destructive" />}
                  </div>
                  <div>
                    <h4 className="font-medium text-foreground text-sm">{session.partner_name}</h4>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(session.scheduled_date + "T00:00"), "MMM d")} · {session.start_time.slice(0, 5)} · {session.status}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SessionsList;
