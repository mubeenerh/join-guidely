import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import logo from "@/assets/logo.png";

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) {
      toast({ title: "Passwords don't match", variant: "destructive" });
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) {
      toast({ title: error.message, variant: "destructive" });
    } else {
      toast({ title: "Password updated! Please log in." });
      navigate("/login");
    }
  };

  return (
    <div className="min-h-screen gradient-sky flex items-center justify-center p-4">
      <div className="bg-card rounded-2xl border border-border shadow-xl p-8 max-w-md w-full text-center">
        <img src={logo} alt="GUIDELY" className="h-10 w-10 rounded-full mx-auto mb-6" />
        <h1 className="text-2xl font-bold text-foreground mb-2">Set New Password</h1>
        <p className="text-sm text-muted-foreground mb-8">Enter your new password below.</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="password" required value={password} onChange={e => setPassword(e.target.value)} placeholder="New password" minLength={6}
            className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground text-sm focus:ring-2 focus:ring-ring outline-none transition" />
          <input type="password" required value={confirm} onChange={e => setConfirm(e.target.value)} placeholder="Confirm new password"
            className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground text-sm focus:ring-2 focus:ring-ring outline-none transition" />
          <button type="submit" disabled={loading} className="w-full gradient-ocean text-primary-foreground py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity disabled:opacity-50">
            {loading ? "Updating..." : "Update Password"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;

