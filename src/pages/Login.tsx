import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import logo from "@/assets/logo.png";

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate("/select-role");
  };

  return (
    <div className="min-h-screen gradient-sky flex items-center justify-center p-4">
      <div className="bg-card rounded-2xl border border-border shadow-xl p-8 max-w-md w-full">
        <Link to="/" className="flex items-center gap-2 justify-center mb-8">
          <img src={logo} alt="Guidedly" className="h-10 w-10 rounded-full" />
          <span className="text-xl font-bold text-foreground">Guidedly</span>
        </Link>
        <h1 className="text-2xl font-bold text-foreground text-center mb-2">Welcome Back</h1>
        <p className="text-sm text-muted-foreground text-center mb-8">Log in to your account</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground text-sm focus:ring-2 focus:ring-ring focus:border-transparent outline-none transition"
              placeholder="john@example.com"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground text-sm focus:ring-2 focus:ring-ring focus:border-transparent outline-none transition pr-12"
                placeholder="••••••••"
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>
          <div className="text-right">
            <Link to="/forgot-password" className="text-sm text-primary hover:underline">Forgot password?</Link>
          </div>
          <button type="submit" className="w-full gradient-ocean text-primary-foreground py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity">
            Log In
          </button>
        </form>
        <p className="text-sm text-muted-foreground text-center mt-6">
          Don't have an account?{" "}
          <Link to="/signup" className="text-primary font-medium hover:underline">Sign Up</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
