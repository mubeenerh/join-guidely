import { Link } from "react-router-dom";
import logo from "@/assets/logo.png";

const Footer = () => {
  return (
    <footer className="bg-card border-t border-border py-12">
      <div className="container">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <img src={logo} alt="GUIDELY" className="h-8 w-8 rounded-full" />
            <span className="font-bold text-foreground">GUIDELY</span>
          </div>
          <p className="text-sm text-muted-foreground">
            Connect. Advise. Grow.
          </p>
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <Link to="/signup" className="hover:text-foreground transition-colors">Get Started</Link>
            <Link to="/login" className="hover:text-foreground transition-colors">Login</Link>
          </div>
        </div>
        <div className="mt-8 pt-6 border-t border-border text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} GUIDELY. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;

