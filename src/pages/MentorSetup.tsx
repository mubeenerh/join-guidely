import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Plus, X, Clock } from "lucide-react";
import logo from "@/assets/logo.png";

const sectors = ["Agriculture", "Poultry", "Fishery", "Fashion", "Food Business", "Fintech", "Edtech", "Medtech", "Tech Startup"];
const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const MentorSetup = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(0);

  const [sector, setSector] = useState("");
  const [bio, setBio] = useState("");
  const [qualifications, setQualifications] = useState<string[]>([]);
  const [newQual, setNewQual] = useState("");
  const [certifications, setCertifications] = useState<string[]>([]);
  const [newCert, setNewCert] = useState("");
  const [achievements, setAchievements] = useState<string[]>([]);
  const [newAch, setNewAch] = useState("");
  const [availability, setAvailability] = useState<{ day: number; start: string; end: string }[]>([]);

  const addItem = (list: string[], setList: (v: string[]) => void, value: string, setValue: (v: string) => void) => {
    if (value.trim()) {
      setList([...list, value.trim()]);
      setValue("");
    }
  };

  const removeItem = (list: string[], setList: (v: string[]) => void, index: number) => {
    setList(list.filter((_, i) => i !== index));
  };

  const addAvailability = () => {
    setAvailability([...availability, { day: 1, start: "09:00", end: "17:00" }]);
  };

  const updateAvailability = (index: number, field: string, value: string | number) => {
    setAvailability(prev => prev.map((a, i) => i === index ? { ...a, [field]: value } : a));
  };

  const handleSubmit = async () => {
    if (!user) return;
    setLoading(true);

    const { error: profileError } = await supabase.from("mentor_profiles").upsert({
      user_id: user.id,
      sector,
      bio,
      qualifications,
      certifications,
      achievements,
      available: availability.length > 0,
    }, { onConflict: "user_id" });

    if (profileError) {
      toast({ title: profileError.message, variant: "destructive" });
      setLoading(false);
      return;
    }

    // Delete old availability and insert new
    await supabase.from("mentor_availability").delete().eq("mentor_id", user.id);
    if (availability.length > 0) {
      await supabase.from("mentor_availability").insert(
        availability.map(a => ({ mentor_id: user.id, day_of_week: a.day, start_time: a.start, end_time: a.end }))
      );
    }

    setLoading(false);
    toast({ title: "Profile saved!" });
    navigate("/mentor/dashboard");
  };

  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-1">Select Your Sector</h2>
            <p className="text-sm text-muted-foreground mb-6">What industry do you mentor in?</p>
            <div className="grid grid-cols-2 gap-3">
              {sectors.map(s => (
                <button key={s} onClick={() => setSector(s)}
                  className={`px-4 py-3 rounded-xl text-sm font-medium border-2 transition-all ${sector === s ? "border-primary bg-primary/5 text-primary" : "border-border text-foreground hover:border-primary/30"}`}>
                  {s}
                </button>
              ))}
            </div>
          </div>
        );
      case 1:
        return (
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-1">About You</h2>
            <p className="text-sm text-muted-foreground mb-6">Tell mentees about your experience</p>
            <textarea value={bio} onChange={e => setBio(e.target.value)} rows={4} placeholder="Share your professional background and mentoring style..."
              className="w-full px-4 py-3 rounded-xl border border-input bg-background text-foreground text-sm focus:ring-2 focus:ring-ring outline-none transition resize-none mb-6" />

            <h3 className="text-sm font-semibold text-foreground mb-3">Qualifications</h3>
            <div className="flex gap-2 mb-3">
              <input value={newQual} onChange={e => setNewQual(e.target.value)} placeholder="e.g. MBA, 10 years in fintech"
                className="flex-1 px-4 py-2.5 rounded-lg border border-input bg-background text-foreground text-sm focus:ring-2 focus:ring-ring outline-none transition"
                onKeyDown={e => e.key === "Enter" && (e.preventDefault(), addItem(qualifications, setQualifications, newQual, setNewQual))} />
              <button onClick={() => addItem(qualifications, setQualifications, newQual, setNewQual)} className="gradient-ocean text-primary-foreground px-3 rounded-lg"><Plus className="w-5 h-5" /></button>
            </div>
            <div className="flex flex-wrap gap-2 mb-6">
              {qualifications.map((q, i) => (
                <span key={i} className="bg-secondary text-secondary-foreground px-3 py-1.5 rounded-lg text-xs flex items-center gap-1">
                  {q} <button onClick={() => removeItem(qualifications, setQualifications, i)}><X className="w-3 h-3" /></button>
                </span>
              ))}
            </div>

            <h3 className="text-sm font-semibold text-foreground mb-3">Certifications</h3>
            <div className="flex gap-2 mb-3">
              <input value={newCert} onChange={e => setNewCert(e.target.value)} placeholder="e.g. PMP, AWS Certified"
                className="flex-1 px-4 py-2.5 rounded-lg border border-input bg-background text-foreground text-sm focus:ring-2 focus:ring-ring outline-none transition"
                onKeyDown={e => e.key === "Enter" && (e.preventDefault(), addItem(certifications, setCertifications, newCert, setNewCert))} />
              <button onClick={() => addItem(certifications, setCertifications, newCert, setNewCert)} className="gradient-ocean text-primary-foreground px-3 rounded-lg"><Plus className="w-5 h-5" /></button>
            </div>
            <div className="flex flex-wrap gap-2 mb-6">
              {certifications.map((c, i) => (
                <span key={i} className="bg-secondary text-secondary-foreground px-3 py-1.5 rounded-lg text-xs flex items-center gap-1">
                  {c} <button onClick={() => removeItem(certifications, setCertifications, i)}><X className="w-3 h-3" /></button>
                </span>
              ))}
            </div>

            <h3 className="text-sm font-semibold text-foreground mb-3">Achievements</h3>
            <div className="flex gap-2 mb-3">
              <input value={newAch} onChange={e => setNewAch(e.target.value)} placeholder="e.g. Scaled startup to $1M ARR"
                className="flex-1 px-4 py-2.5 rounded-lg border border-input bg-background text-foreground text-sm focus:ring-2 focus:ring-ring outline-none transition"
                onKeyDown={e => e.key === "Enter" && (e.preventDefault(), addItem(achievements, setAchievements, newAch, setNewAch))} />
              <button onClick={() => addItem(achievements, setAchievements, newAch, setNewAch)} className="gradient-ocean text-primary-foreground px-3 rounded-lg"><Plus className="w-5 h-5" /></button>
            </div>
            <div className="flex flex-wrap gap-2">
              {achievements.map((a, i) => (
                <span key={i} className="bg-secondary text-secondary-foreground px-3 py-1.5 rounded-lg text-xs flex items-center gap-1">
                  {a} <button onClick={() => removeItem(achievements, setAchievements, i)}><X className="w-3 h-3" /></button>
                </span>
              ))}
            </div>
          </div>
        );
      case 2:
        return (
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-1">Set Your Availability</h2>
            <p className="text-sm text-muted-foreground mb-6">When are you available for sessions?</p>
            <div className="space-y-3 mb-4">
              {availability.map((slot, i) => (
                <div key={i} className="flex items-center gap-2 bg-secondary/50 rounded-xl p-3">
                  <select value={slot.day} onChange={e => updateAvailability(i, "day", parseInt(e.target.value))}
                    className="px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm flex-1">
                    {days.map((d, di) => <option key={di} value={di}>{d}</option>)}
                  </select>
                  <input type="time" value={slot.start} onChange={e => updateAvailability(i, "start", e.target.value)}
                    className="px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm" />
                  <span className="text-muted-foreground text-sm">to</span>
                  <input type="time" value={slot.end} onChange={e => updateAvailability(i, "end", e.target.value)}
                    className="px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm" />
                  <button onClick={() => setAvailability(prev => prev.filter((_, j) => j !== i))} className="text-muted-foreground hover:text-destructive">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
            <button onClick={addAvailability} className="flex items-center gap-2 text-sm font-medium text-primary hover:underline">
              <Clock className="w-4 h-4" /> Add time slot
            </button>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen gradient-sky flex items-center justify-center p-4">
      <div className="max-w-lg w-full">
        <div className="text-center mb-6">
          <img src={logo} alt="Guidedly" className="h-12 w-12 rounded-full mx-auto mb-4" />
        </div>

        {/* Progress */}
        <div className="flex gap-2 mb-8">
          {[0, 1, 2].map(i => (
            <div key={i} className={`h-1.5 flex-1 rounded-full transition-colors ${i <= step ? "gradient-ocean" : "bg-border"}`} />
          ))}
        </div>

        <div className="bg-card rounded-2xl border border-border shadow-xl p-8">
          {renderStep()}

          <div className="flex justify-between mt-8">
            <button onClick={() => setStep(Math.max(0, step - 1))} disabled={step === 0}
              className="text-sm text-muted-foreground hover:text-foreground disabled:opacity-30">← Back</button>
            {step < 2 ? (
              <button onClick={() => setStep(step + 1)} disabled={step === 0 && !sector}
                className="gradient-ocean text-primary-foreground px-6 py-2.5 rounded-lg text-sm font-semibold disabled:opacity-40 hover:opacity-90 transition-opacity">
                Next →
              </button>
            ) : (
              <button onClick={handleSubmit} disabled={loading}
                className="gradient-ocean text-primary-foreground px-6 py-2.5 rounded-lg text-sm font-semibold disabled:opacity-40 hover:opacity-90 transition-opacity">
                {loading ? "Saving..." : "Complete Setup"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MentorSetup;
