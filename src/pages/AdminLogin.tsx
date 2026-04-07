import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, ShieldCheck } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import logo from "@/assets/logo.png";

const AdminLogin = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await signIn(email, password);
    if (error) {
      toast({ title: error.message, variant: "destructive" });
      setLoading(false);
      return;
    }

    // Check admin role
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({ title: "Authentication failed", variant: "destructive" });
      setLoading(false);
      return;
    }

    const { data: roleData } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .maybeSingle();

    setLoading(false);
    if (!roleData) {
      await supabase.auth.signOut();
      toast({ title: "Access denied. You are not an admin.", variant: "destructive" });
      return;
    }
    navigate("/admin/dashboard");
  };

  return (
    <div className="min-h-screen bg-muted flex items-center justify-center p-4">
      <div className="bg-card rounded-2xl border border-border shadow-xl p-8 max-w-md w-full">
        <Link to="/" className="flex items-center gap-2 justify-center mb-6">
          <img src={logo} alt="Guidedly" className="h-10 w-10 rounded-full" />
          <span className="text-xl font-bold text-foreground">Guidedly</span>
        </Link>
        <div className="flex items-center justify-center gap-2 mb-2">
          <ShieldCheck className="w-6 h-6 text-primary" />
          <h1 className="text-2xl font-bold text-foreground">Admin Login</h1>
        </div>
        <p className="text-sm text-muted-foreground text-center mb-8">Sign in to the admin panel</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">Email</label>
            <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground text-sm focus:ring-2 focus:ring-ring outline-none transition" placeholder="admin@guidedly.com" />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">Password</label>
            <div className="relative">
              <input type={showPassword ? "text" : "password"} required value={password} onChange={e => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground text-sm focus:ring-2 focus:ring-ring outline-none transition pr-12" placeholder="••••••••" />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>
          <button type="submit" disabled={loading} className="w-full gradient-ocean text-primary-foreground py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity disabled:opacity-50">
            {loading ? "Signing in..." : "Sign In as Admin"}
          </button>
        </form>
        <p className="text-sm text-muted-foreground text-center mt-6">
          <Link to="/login" className="text-primary font-medium hover:underline">Back to user login</Link>
        </p>
      </div>
    </div>
  );
};

export default AdminLogin;
