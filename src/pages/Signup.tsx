import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import logo from "@/assets/logo.png";

const Signup = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", password: "", confirmPassword: "" });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      toast({ title: "Passwords don't match", variant: "destructive" });
      return;
    }
    if (form.password.length < 6) {
      toast({ title: "Password must be at least 6 characters", variant: "destructive" });
      return;
    }
    setLoading(true);
    const { error } = await signUp(form.email, form.password, form.firstName, form.lastName);
    setLoading(false);
    if (error) {
      toast({ title: error.message, variant: "destructive" });
    } else {
      setSubmitted(true);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen gradient-sky flex items-center justify-center p-4">
        <div className="bg-card rounded-2xl border border-border shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 gradient-ocean rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-2xl">✉️</span>
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-3">Verify Your Email</h2>
          <p className="text-muted-foreground mb-6">
            We've sent a verification link to <strong className="text-foreground">{form.email}</strong>. Please check your inbox.
          </p>
          <Link to="/login" className="text-sm font-medium text-primary hover:underline">Go to Login</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-sky flex items-center justify-center p-4">
      <div className="bg-card rounded-2xl border border-border shadow-xl p-8 max-w-md w-full">
        <Link to="/" className="flex items-center gap-2 justify-center mb-8">
          <img src={logo} alt="GUIDELY" className="h-10 w-10 rounded-full" />
          <span className="text-xl font-bold text-foreground">GUIDELY</span>
        </Link>
        <h1 className="text-2xl font-bold text-foreground text-center mb-2">Create Account</h1>
        <p className="text-sm text-muted-foreground text-center mb-8">Start your mentorship journey</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">First Name</label>
              <input type="text" required value={form.firstName} onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))}
                className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground text-sm focus:ring-2 focus:ring-ring focus:border-transparent outline-none transition" placeholder="John" />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Last Name</label>
              <input type="text" required value={form.lastName} onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))}
                className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground text-sm focus:ring-2 focus:ring-ring focus:border-transparent outline-none transition" placeholder="Doe" />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">Email</label>
            <input type="email" required value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground text-sm focus:ring-2 focus:ring-ring focus:border-transparent outline-none transition" placeholder="john@example.com" />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">Password</label>
            <div className="relative">
              <input type={showPassword ? "text" : "password"} required value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground text-sm focus:ring-2 focus:ring-ring focus:border-transparent outline-none transition pr-12" placeholder="••••••••" />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">Confirm Password</label>
            <div className="relative">
              <input type={showConfirm ? "text" : "password"} required value={form.confirmPassword} onChange={e => setForm(f => ({ ...f, confirmPassword: e.target.value }))}
                className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground text-sm focus:ring-2 focus:ring-ring focus:border-transparent outline-none transition pr-12" placeholder="••••••••" />
              <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                {showConfirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>
          <button type="submit" disabled={loading} className="w-full gradient-ocean text-primary-foreground py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity disabled:opacity-50">
            {loading ? "Creating Account..." : "Create Account"}
          </button>
        </form>
        <p className="text-sm text-muted-foreground text-center mt-6">
          Already have an account?{" "}
          <Link to="/login" className="text-primary font-medium hover:underline">Log In</Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;

