import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Calendar, CheckCircle2, Clock, Star, Users, MessageSquare, TrendingUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface Stats {
  total: number;
  completed: number;
  upcoming: number;
  hours: number;
  uniqueMentors: number;
  reviewsGiven: number;
  avgRating: number;
}

interface MentorConnection {
  mentor_id: string;
  name: string;
  sessionCount: number;
}

interface ReviewGiven {
  id: string;
  rating: number;
  review: string | null;
  created_at: string;
  mentor_name: string;
}

interface ActivityItem {
  id: string;
  type: "session" | "review";
  title: string;
  subtitle: string;
  date: string;
  status?: string;
}

const MenteeProgress = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<Stats>({
    total: 0, completed: 0, upcoming: 0, hours: 0,
    uniqueMentors: 0, reviewsGiven: 0, avgRating: 0,
  });
  const [connections, setConnections] = useState<MentorConnection[]>([]);
  const [reviews, setReviews] = useState<ReviewGiven[]>([]);
  const [activity, setActivity] = useState<ActivityItem[]>([]);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const { data: sessions } = await supabase
        .from("sessions")
        .select("*")
        .eq("mentee_id", user.id)
        .order("scheduled_date", { ascending: false });

      const { data: reviewRows } = await supabase
        .from("mentor_reviews")
        .select("id, rating, review, created_at, mentor_id")
        .eq("mentee_id", user.id)
        .order("created_at", { ascending: false });

      const allMentorIds = Array.from(new Set([
        ...(sessions?.map(s => s.mentor_id) ?? []),
        ...(reviewRows?.map(r => r.mentor_id) ?? []),
      ]));

      const { data: profiles } = allMentorIds.length
        ? await supabase
            .from("profiles")
            .select("user_id, first_name, last_name")
            .in("user_id", allMentorIds)
        : { data: [] as { user_id: string; first_name: string; last_name: string }[] };

      const nameOf = (id: string) => {
        const p = profiles?.find(x => x.user_id === id);
        return p ? `${p.first_name} ${p.last_name}`.trim() || "Mentor" : "Mentor";
      };

      const today = new Date().toISOString().split("T")[0];
      const completed = sessions?.filter(s => s.status === "completed") ?? [];
      const upcoming = sessions?.filter(s => s.status !== "cancelled" && s.status !== "completed" && s.scheduled_date >= today) ?? [];

      const minutes = completed.reduce((sum, s) => {
        const [sh, sm] = s.start_time.split(":").map(Number);
        const [eh, em] = s.end_time.split(":").map(Number);
        return sum + Math.max(0, (eh * 60 + em) - (sh * 60 + sm));
      }, 0);

      const mentorCounts = new Map<string, number>();
      sessions?.forEach(s => mentorCounts.set(s.mentor_id, (mentorCounts.get(s.mentor_id) ?? 0) + 1));
      const conns: MentorConnection[] = Array.from(mentorCounts.entries())
        .map(([mentor_id, sessionCount]) => ({ mentor_id, name: nameOf(mentor_id), sessionCount }))
        .sort((a, b) => b.sessionCount - a.sessionCount);

      const revs: ReviewGiven[] = (reviewRows ?? []).map(r => ({
        id: r.id,
        rating: r.rating,
        review: r.review,
        created_at: r.created_at,
        mentor_name: nameOf(r.mentor_id),
      }));

      const avgRating = revs.length
        ? revs.reduce((s, r) => s + r.rating, 0) / revs.length
        : 0;

      setStats({
        total: sessions?.length ?? 0,
        completed: completed.length,
        upcoming: upcoming.length,
        hours: Math.round((minutes / 60) * 10) / 10,
        uniqueMentors: mentorCounts.size,
        reviewsGiven: revs.length,
        avgRating: Math.round(avgRating * 10) / 10,
      });
      setConnections(conns);
      setReviews(revs);

      const activityItems: ActivityItem[] = [
        ...(sessions ?? []).map(s => ({
          id: `s-${s.id}`,
          type: "session" as const,
          title: `Session with ${nameOf(s.mentor_id)}`,
          subtitle: `${s.start_time.slice(0, 5)} – ${s.end_time.slice(0, 5)}`,
          date: s.scheduled_date,
          status: s.status,
        })),
        ...revs.map(r => ({
          id: `r-${r.id}`,
          type: "review" as const,
          title: `Reviewed ${r.mentor_name}`,
          subtitle: `${r.rating} ★${r.review ? ` — "${r.review.slice(0, 60)}${r.review.length > 60 ? "…" : ""}"` : ""}`,
          date: r.created_at.split("T")[0],
        })),
      ].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 8);
      setActivity(activityItems);

      setLoading(false);
    };
    load();
  }, [user]);

  if (loading) {
    return <div className="text-center py-12 text-muted-foreground">Loading your progress...</div>;
  }

  if (stats.total === 0 && stats.reviewsGiven === 0) {
    return (
      <div className="bg-card rounded-2xl border border-border p-8 text-center">
        <TrendingUp className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-foreground mb-2">Start Your Journey</h3>
        <p className="text-sm text-muted-foreground">Book your first session with a mentor to start tracking your progress.</p>
      </div>
    );
  }

  const statCards = [
    { icon: Calendar, label: "Total Sessions", value: stats.total, color: "text-primary" },
    { icon: CheckCircle2, label: "Completed", value: stats.completed, color: "text-emerald-600" },
    { icon: Clock, label: "Hours Learned", value: stats.hours, color: "text-amber-600" },
    { icon: Users, label: "Mentors", value: stats.uniqueMentors, color: "text-violet-600" },
    { icon: MessageSquare, label: "Upcoming", value: stats.upcoming, color: "text-sky-600" },
    { icon: Star, label: "Reviews Given", value: stats.reviewsGiven, color: "text-rose-600" },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {statCards.map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
            className="bg-card rounded-xl border border-border p-4">
            <s.icon className={`w-5 h-5 ${s.color} mb-2`} />
            <div className="text-2xl font-bold text-foreground">{s.value}</div>
            <div className="text-xs text-muted-foreground">{s.label}</div>
          </motion.div>
        ))}
      </div>

      {connections.length > 0 && (
        <div className="bg-card rounded-2xl border border-border p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" /> Your Mentors
          </h3>
          <div className="space-y-2">
            {connections.map(c => (
              <div key={c.mentor_id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full gradient-wave flex items-center justify-center">
                    <span className="text-sm font-semibold text-primary">{c.name.charAt(0)}</span>
                  </div>
                  <span className="text-sm font-medium text-foreground">{c.name}</span>
                </div>
                <span className="text-xs text-muted-foreground">{c.sessionCount} session{c.sessionCount !== 1 ? "s" : ""}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {reviews.length > 0 && (
        <div className="bg-card rounded-2xl border border-border p-6">
          <h3 className="text-lg font-semibold text-foreground mb-1 flex items-center gap-2">
            <Star className="w-5 h-5 text-amber-500" /> Reviews You've Given
          </h3>
          <p className="text-xs text-muted-foreground mb-4">Average rating: {stats.avgRating} ★</p>
          <div className="space-y-3">
            {reviews.slice(0, 5).map(r => (
              <div key={r.id} className="p-3 rounded-lg border border-border">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-foreground">{r.mentor_name}</span>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className={`w-3.5 h-3.5 ${i < r.rating ? "text-amber-500 fill-amber-500" : "text-muted-foreground/30"}`} />
                    ))}
                  </div>
                </div>
                {r.review && <p className="text-sm text-muted-foreground italic">"{r.review}"</p>}
                <p className="text-xs text-muted-foreground mt-1">{new Date(r.created_at).toLocaleDateString()}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {activity.length > 0 && (
        <div className="bg-card rounded-2xl border border-border p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" /> Recent Activity
          </h3>
          <div className="space-y-3">
            {activity.map(a => (
              <div key={a.id} className="flex items-start gap-3 pb-3 border-b border-border last:border-0 last:pb-0">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${a.type === "review" ? "bg-amber-100 dark:bg-amber-950" : "bg-primary/10"}`}>
                  {a.type === "review" ? <Star className="w-4 h-4 text-amber-600" /> : <Calendar className="w-4 h-4 text-primary" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">{a.title}</p>
                  <p className="text-xs text-muted-foreground truncate">{a.subtitle}</p>
                </div>
                <span className="text-xs text-muted-foreground shrink-0">{new Date(a.date).toLocaleDateString()}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MenteeProgress;
