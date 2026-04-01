import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import logo from "@/assets/logo.png";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const { resetPassword } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await resetPassword(email);
    setLoading(false);
    if (error) {
      toast({ title: error.message, variant: "destructive" });
    } else {
      setSent(true);
    }
  };

  return (
    <div className="min-h-screen gradient-sky flex items-center justify-center p-4">
      <div className="bg-card rounded-2xl border border-border shadow-xl p-8 max-w-md w-full text-center">
        <Link to="/" className="flex items-center gap-2 justify-center mb-8">
          <img src={logo} alt="Guidedly" className="h-10 w-10 rounded-full" />
          <span className="text-xl font-bold text-foreground">Guidedly</span>
        </Link>
        {sent ? (
          <>
            <div className="w-16 h-16 gradient-ocean rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-2xl">📧</span>
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-3">Check Your Email</h2>
            <p className="text-muted-foreground mb-6">We've sent a password reset link to <strong className="text-foreground">{email}</strong>.</p>
            <Link to="/login" className="text-sm font-medium text-primary hover:underline">Back to Login</Link>
          </>
        ) : (
          <>
            <h1 className="text-2xl font-bold text-foreground mb-2">Forgot Password?</h1>
            <p className="text-sm text-muted-foreground mb-8">Enter your email and we'll send a reset link.</p>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground text-sm focus:ring-2 focus:ring-ring focus:border-transparent outline-none transition" placeholder="john@example.com" />
              <button type="submit" disabled={loading} className="w-full gradient-ocean text-primary-foreground py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity disabled:opacity-50">
                {loading ? "Sending..." : "Send Reset Link"}
              </button>
            </form>
            <Link to="/login" className="text-sm text-muted-foreground hover:text-foreground mt-6 inline-block">Back to Login</Link>
          </>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
