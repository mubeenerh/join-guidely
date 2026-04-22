import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { format } from "date-fns";
import { CalendarIcon, ArrowLeft, Clock, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import logo from "@/assets/logo.png";

interface AvailabilitySlot {
  day_of_week: number;
  start_time: string;
  end_time: string;
}

interface ReviewItem {
  id: string;
  rating: number;
  review: string | null;
  created_at: string;
  mentee_id: string;
  mentee_name?: string;
}

const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const generateTimeSlots = (start: string, end: string): string[] => {
  const slots: string[] = [];
  let [h, m] = start.split(":").map(Number);
  const [endH, endM] = end.split(":").map(Number);
  while (h < endH || (h === endH && m < endM)) {
    slots.push(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`);
    m += 30;
    if (m >= 60) { h++; m = 0; }
  }
  return slots;
};

const BookSession = () => {
  const { mentorId } = useParams<{ mentorId: string }>();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [date, setDate] = useState<Date>();
  const [selectedTime, setSelectedTime] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [availability, setAvailability] = useState<AvailabilitySlot[]>([]);
  const [mentorName, setMentorName] = useState("");
  const [existingSessions, setExistingSessions] = useState<{ scheduled_date: string; start_time: string }[]>([]);
  const [reviews, setReviews] = useState<ReviewItem[]>([]);

  useEffect(() => {
    if (!mentorId) return;
    // Fetch mentor availability
    supabase.from("mentor_availability").select("*").eq("mentor_id", mentorId)
      .then(({ data }) => { if (data) setAvailability(data); });
    // Fetch mentor name
    supabase.from("profiles").select("first_name, last_name").eq("user_id", mentorId).single()
      .then(({ data }) => { if (data) setMentorName(`${data.first_name} ${data.last_name}`); });
    // Fetch existing sessions to avoid double-booking
    supabase.from("sessions").select("scheduled_date, start_time").eq("mentor_id", mentorId).eq("status", "scheduled")
      .then(({ data }) => { if (data) setExistingSessions(data); });
    // Fetch mentor reviews with mentee names
    (async () => {
      const { data: revs } = await supabase
        .from("mentor_reviews")
        .select("id, rating, review, created_at, mentee_id")
        .eq("mentor_id", mentorId)
        .order("created_at", { ascending: false });
      if (revs && revs.length > 0) {
        const menteeIds = [...new Set(revs.map(r => r.mentee_id))];
        const { data: profs } = await supabase
          .from("profiles")
          .select("user_id, first_name, last_name")
          .in("user_id", menteeIds);
        setReviews(revs.map(r => {
          const p = profs?.find(pr => pr.user_id === r.mentee_id);
          return { ...r, mentee_name: p ? `${p.first_name} ${p.last_name}` : "Anonymous" };
        }));
      } else {
        setReviews([]);
      }
    })();
  }, [mentorId]);

  const avgRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : null;

  const availableDays = availability.map(a => a.day_of_week);

  const isDateAvailable = (d: Date) => {
    return availableDays.includes(d.getDay()) && d >= new Date(new Date().setHours(0, 0, 0, 0));
  };

  const getTimeSlotsForDate = (d: Date): string[] => {
    const daySlots = availability.filter(a => a.day_of_week === d.getDay());
    const allSlots: string[] = [];
    daySlots.forEach(slot => {
      allSlots.push(...generateTimeSlots(slot.start_time, slot.end_time));
    });
    // Filter out already booked slots
    const dateStr = format(d, "yyyy-MM-dd");
    const booked = existingSessions.filter(s => s.scheduled_date === dateStr).map(s => s.start_time.slice(0, 5));
    return allSlots.filter(t => !booked.includes(t));
  };

  const timeSlots = date ? getTimeSlotsForDate(date) : [];

  const handleBook = async () => {
    if (!date || !selectedTime || !user || !mentorId) return;
    setLoading(true);
    const [h, m] = selectedTime.split(":").map(Number);
    const endH = m + 30 >= 60 ? h + 1 : h;
    const endM = (m + 30) % 60;
    const endTime = `${String(endH).padStart(2, "0")}:${String(endM).padStart(2, "0")}`;

    const { error } = await supabase.from("sessions").insert({
      mentor_id: mentorId,
      mentee_id: user.id,
      scheduled_date: format(date, "yyyy-MM-dd"),
      start_time: selectedTime,
      end_time: endTime,
      notes: notes || null,
    });

    setLoading(false);
    if (error) {
      toast({ title: "Booking failed: " + error.message, variant: "destructive" });
    } else {
      toast({ title: "Session booked!" });
      navigate(-1);
    }
  };

  return (
    <div className="min-h-screen gradient-sky">
      <nav className="bg-card/80 backdrop-blur-lg border-b border-border sticky top-0 z-40">
        <div className="container flex items-center gap-3 h-16">
          <button onClick={() => navigate(-1)} className="text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <img src={logo} alt="GUIDELY" className="h-8 w-8 rounded-full" />
          <span className="font-bold text-foreground">Book a Session</span>
        </div>
      </nav>

      <div className="container py-8 max-w-lg mx-auto">
        <div className="bg-card rounded-2xl border border-border shadow-xl p-6 sm:p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl gradient-wave flex items-center justify-center">
              <span className="text-lg font-bold text-primary">{mentorName.charAt(0) || "?"}</span>
            </div>
            <div>
              <h2 className="font-semibold text-foreground">{mentorName || "Mentor"}</h2>
              <p className="text-xs text-muted-foreground">Select a date and time for your session</p>
            </div>
          </div>

          {/* Date picker */}
          <div className="mb-6">
            <label className="text-sm font-medium text-foreground mb-2 block">Select Date</label>
            <Popover>
              <PopoverTrigger asChild>
                <button className={cn(
                  "w-full px-4 py-3 rounded-xl border border-input bg-background text-foreground text-sm text-left flex items-center gap-2",
                  !date && "text-muted-foreground"
                )}>
                  <CalendarIcon className="w-4 h-4" />
                  {date ? format(date, "EEEE, MMMM d, yyyy") : "Pick a date"}
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={(d) => { setDate(d); setSelectedTime(""); }}
                  disabled={(d) => !isDateAvailable(d)}
                  initialFocus
                  className="p-3 pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
            {availability.length === 0 && (
              <p className="text-xs text-muted-foreground mt-2">This mentor hasn't set their availability yet.</p>
            )}
            {availability.length > 0 && (
              <p className="text-xs text-muted-foreground mt-2">
                Available on: {[...new Set(availability.map(a => days[a.day_of_week]))].join(", ")}
              </p>
            )}
          </div>

          {/* Time slots */}
          {date && (
            <div className="mb-6">
              <label className="text-sm font-medium text-foreground mb-2 block">Select Time</label>
              {timeSlots.length === 0 ? (
                <p className="text-sm text-muted-foreground">No available slots for this date.</p>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {timeSlots.map(t => (
                    <button key={t} onClick={() => setSelectedTime(t)}
                      className={cn(
                        "px-3 py-2.5 rounded-xl text-sm font-medium border-2 transition-all flex items-center justify-center gap-1",
                        selectedTime === t
                          ? "border-primary bg-primary/5 text-primary"
                          : "border-border text-foreground hover:border-primary/30"
                      )}>
                      <Clock className="w-3.5 h-3.5" /> {t}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Notes */}
          {selectedTime && (
            <div className="mb-6">
              <label className="text-sm font-medium text-foreground mb-2 block">Notes (optional)</label>
              <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3}
                placeholder="What would you like to discuss?"
                className="w-full px-4 py-3 rounded-xl border border-input bg-background text-foreground text-sm focus:ring-2 focus:ring-ring outline-none transition resize-none" />
            </div>
          )}

          {/* Summary & Book */}
          {date && selectedTime && (
            <div className="bg-secondary/50 rounded-xl p-4 mb-6">
              <h4 className="text-sm font-semibold text-foreground mb-2">Session Summary</h4>
              <div className="space-y-1 text-sm text-muted-foreground">
                <p>📅 {format(date, "EEEE, MMMM d, yyyy")}</p>
                <p>🕐 {selectedTime} — 30 min session</p>
                <p>👤 With {mentorName}</p>
              </div>
            </div>
          )}

          <button onClick={handleBook} disabled={!date || !selectedTime || loading}
            className="w-full gradient-ocean text-primary-foreground py-3 rounded-xl font-semibold hover:opacity-90 transition-opacity disabled:opacity-40">
            {loading ? "Booking..." : "Confirm Booking"}
          </button>
        </div>

        {/* Reviews from other mentees */}
        <div className="bg-card rounded-2xl border border-border shadow-xl p-6 sm:p-8 mt-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-foreground">Mentee Reviews</h3>
            {avgRating && (
              <div className="flex items-center gap-1.5 text-sm">
                <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                <span className="font-semibold text-foreground">{avgRating}</span>
                <span className="text-muted-foreground">({reviews.length})</span>
              </div>
            )}
          </div>

          {reviews.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">
              No reviews yet. Be the first to share your experience after a session!
            </p>
          ) : (
            <div className="space-y-4">
              {reviews.map(r => (
                <div key={r.id} className="border-b border-border last:border-0 pb-4 last:pb-0">
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full gradient-wave flex items-center justify-center text-xs font-semibold text-primary">
                        {r.mentee_name?.charAt(0) || "?"}
                      </div>
                      <span className="text-sm font-medium text-foreground">{r.mentee_name}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(r.created_at), "MMM d, yyyy")}
                    </span>
                  </div>
                  <div className="flex gap-0.5 mb-1.5 ml-9">
                    {[1, 2, 3, 4, 5].map(s => (
                      <Star key={s} className={cn(
                        "w-3.5 h-3.5",
                        s <= r.rating ? "text-amber-500 fill-amber-500" : "text-muted-foreground/30"
                      )} />
                    ))}
                  </div>
                  {r.review && (
                    <p className="text-sm text-muted-foreground ml-9">{r.review}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookSession;

