import { Link } from "react-router-dom";
import logo from "@/assets/logo.png";

const Navbar = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-card/80 backdrop-blur-lg border-b border-border">
      <div className="container flex items-center justify-between h-16">
        <Link to="/" className="flex items-center gap-2">
          <img src={logo} alt="GUIDELY" className="h-10 w-10 rounded-full" />
          <span className="text-xl font-bold text-foreground">GUIDELY</span>
        </Link>
        <div className="hidden md:flex items-center gap-8">
          <a href="#features" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Features</a>
          <a href="#how-it-works" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">How It Works</a>
          <a href="#sectors" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Sectors</a>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/login" className="text-sm font-medium text-foreground hover:text-primary transition-colors hidden sm:block">
            Log In
          </Link>
          <Link to="/signup" className="gradient-ocean text-primary-foreground px-5 py-2.5 rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity">
            Get Started
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

