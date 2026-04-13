import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Plus, X, Upload, Loader2, ArrowLeft, Save } from "lucide-react";
import logo from "@/assets/logo.png";

const sectors = ["Agriculture", "Poultry", "Fishery", "Fashion", "Food Business", "Fintech", "Edtech", "Medtech", "Tech Startup"];

const MentorEditProfile = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingCert, setUploadingCert] = useState(false);

  const [selectedSectors, setSelectedSectors] = useState<string[]>([]);
  const [bio, setBio] = useState("");
  const [qualifications, setQualifications] = useState<string[]>([]);
  const [newQual, setNewQual] = useState("");
  const [certifications, setCertifications] = useState<string[]>([]);
  const [newCert, setNewCert] = useState("");
  const [achievements, setAchievements] = useState<string[]>([]);
  const [newAch, setNewAch] = useState("");

  useEffect(() => {
    if (!user) return;
    const fetchProfile = async () => {
      const { data } = await supabase
        .from("mentor_profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();
      if (data) {
        setSelectedSectors(data.sector ? data.sector.split(", ").filter(Boolean) : []);
        setBio(data.bio || "");
        setQualifications(data.qualifications || []);
        setCertifications(data.certifications || []);
        setAchievements(data.achievements || []);
      }
      setLoading(false);
    };
    fetchProfile();
  }, [user]);

  const addItem = (list: string[], setList: (v: string[]) => void, value: string, setValue: (v: string) => void) => {
    if (value.trim()) {
      setList([...list, value.trim()]);
      setValue("");
    }
  };

  const removeItem = (list: string[], setList: (v: string[]) => void, index: number) => {
    setList(list.filter((_, i) => i !== index));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setUploadingCert(true);

    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `${user.id}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("certificates")
      .upload(filePath, file);

    const prefix = newCert.trim() ? newCert.trim() + " - " : "";

    if (uploadError) {
      toast({ title: "Upload failed", description: uploadError.message, variant: "destructive" });
      setCertifications([...certifications, `${prefix}${file.name}`]);
    } else {
      const { data: { publicUrl } } = supabase.storage.from("certificates").getPublicUrl(filePath);
      setCertifications([...certifications, `${prefix}${file.name} (${publicUrl})`]);
      toast({ title: "Certificate uploaded!" });
    }
    setNewCert("");
    setUploadingCert(false);
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);

    const { error } = await supabase.from("mentor_profiles").update({
      sector: selectedSectors.join(", "),
      bio,
      qualifications,
      certifications,
      achievements,
    }).eq("user_id", user.id);

    setSaving(false);
    if (error) {
      toast({ title: "Error saving", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Profile updated!" });
      navigate("/mentor/dashboard");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <nav className="bg-card border-b border-border sticky top-0 z-40">
        <div className="container flex items-center justify-between h-16">
          <button onClick={() => navigate("/mentor/dashboard")} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </button>
          <img src={logo} alt="GUIDELY" className="h-8 w-8 rounded-full" />
        </div>
      </nav>

      <div className="container max-w-2xl py-8">
        <h1 className="text-2xl font-bold text-foreground mb-1">Edit Profile</h1>
        <p className="text-sm text-muted-foreground mb-8">Update your credentials and information.</p>

        <div className="space-y-8">
          {/* Sectors */}
          <section>
            <h2 className="text-sm font-semibold text-foreground mb-3">Sectors</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {sectors.map(s => (
                <button key={s} onClick={() => {
                  setSelectedSectors(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);
                }}
                  className={`px-3 py-2 rounded-lg text-sm font-medium border transition-all ${selectedSectors.includes(s) ? "border-primary bg-primary/5 text-primary" : "border-border text-foreground hover:border-primary/30"}`}>
                  {s}
                </button>
              ))}
            </div>
          </section>

          {/* Bio */}
          <section>
            <h2 className="text-sm font-semibold text-foreground mb-3">Bio</h2>
            <textarea value={bio} onChange={e => setBio(e.target.value)} rows={4}
              placeholder="Share your professional background..."
              className="w-full px-4 py-3 rounded-xl border border-input bg-background text-foreground text-sm focus:ring-2 focus:ring-ring outline-none transition resize-none" />
          </section>

          {/* Qualifications */}
          <section>
            <h2 className="text-sm font-semibold text-foreground mb-3">Qualifications</h2>
            <div className="flex gap-2 mb-3">
              <input value={newQual} onChange={e => setNewQual(e.target.value)} placeholder="e.g. MBA, 10 years in fintech"
                className="flex-1 px-4 py-2.5 rounded-lg border border-input bg-background text-foreground text-sm focus:ring-2 focus:ring-ring outline-none transition"
                onKeyDown={e => e.key === "Enter" && (e.preventDefault(), addItem(qualifications, setQualifications, newQual, setNewQual))} />
              <button onClick={() => addItem(qualifications, setQualifications, newQual, setNewQual)} className="gradient-ocean text-primary-foreground px-3 rounded-lg"><Plus className="w-5 h-5" /></button>
            </div>
            <div className="flex flex-wrap gap-2">
              {qualifications.map((q, i) => (
                <span key={i} className="bg-secondary text-secondary-foreground px-3 py-1.5 rounded-lg text-xs flex items-center gap-1">
                  {q} <button onClick={() => removeItem(qualifications, setQualifications, i)}><X className="w-3 h-3" /></button>
                </span>
              ))}
            </div>
          </section>

          {/* Certifications */}
          <section>
            <h2 className="text-sm font-semibold text-foreground mb-3">Certifications</h2>
            <div className="flex gap-2 mb-3">
              <input value={newCert} onChange={e => setNewCert(e.target.value)} placeholder="e.g. PMP, AWS Certified"
                className="flex-1 px-4 py-2.5 rounded-lg border border-input bg-background text-foreground text-sm focus:ring-2 focus:ring-ring outline-none transition"
                onKeyDown={e => e.key === "Enter" && (e.preventDefault(), addItem(certifications, setCertifications, newCert, setNewCert))} />
              <label className={`cursor-pointer gradient-ocean text-primary-foreground px-3 rounded-lg flex items-center justify-center hover:opacity-90 transition-opacity ${uploadingCert ? 'opacity-50 pointer-events-none' : ''}`}>
                {uploadingCert ? <Loader2 className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5" />}
                <input type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png" onChange={handleFileUpload} disabled={uploadingCert} />
              </label>
              <button onClick={() => addItem(certifications, setCertifications, newCert, setNewCert)} className="gradient-ocean text-primary-foreground px-3 rounded-lg"><Plus className="w-5 h-5" /></button>
            </div>
            <div className="flex flex-wrap gap-2">
              {certifications.map((c, i) => {
                const urlMatch = c.match(/\((https?:\/\/[^)]+)\)/);
                return (
                  <span key={i} className="bg-secondary text-secondary-foreground px-3 py-1.5 rounded-lg text-xs flex items-center gap-1">
                    {urlMatch ? (
                      <a href={urlMatch[1]} target="_blank" rel="noopener noreferrer" className="text-primary underline">{c.replace(` (${urlMatch[1]})`, '')}</a>
                    ) : c}
                    <button onClick={() => removeItem(certifications, setCertifications, i)}><X className="w-3 h-3" /></button>
                  </span>
                );
              })}
            </div>
          </section>

          {/* Achievements */}
          <section>
            <h2 className="text-sm font-semibold text-foreground mb-3">Achievements</h2>
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
          </section>

          <button onClick={handleSave} disabled={saving}
            className="w-full gradient-ocean text-primary-foreground py-3 rounded-xl text-sm font-semibold disabled:opacity-40 hover:opacity-90 transition-opacity flex items-center justify-center gap-2">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MentorEditProfile;
