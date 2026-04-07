import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { GraduationCap, Users } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useState } from "react";
import logo from "@/assets/logo.png";

const SelectRole = () => {
  const navigate = useNavigate();
  const { user, profile, refreshProfile } = useAuth();
  const { toast } = useToast();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const checkRedirect = async () => {
      if (!profile?.role) {
        setChecking(false);
        return;
      }
      if (profile.role === "mentee") {
        navigate("/mentee/dashboard", { replace: true });
        return;
      }
      if (profile.role === "mentor") {
        // Check if mentor profile exists already
        const { data } = await supabase
          .from("mentor_profiles")
          .select("id")
          .eq("user_id", user!.id)
          .maybeSingle();
        navigate(data ? "/mentor/dashboard" : "/mentor/setup", { replace: true });
        return;
      }
      setChecking(false);
    };
    checkRedirect();
  }, [profile, user, navigate]);

  if (checking) return null;

  const selectRole = async (role: "mentee" | "mentor") => {
    if (!user) return;
    const { error } = await supabase
      .from("profiles")
      .update({ role })
      .eq("user_id", user.id);

    if (error) {
      toast({ title: "Failed to set role", variant: "destructive" });
      return;
    }
    await refreshProfile();
    if (role === "mentee") navigate("/mentee/onboarding");
    else navigate("/mentor/setup");
  };

  return (
    <div className="min-h-screen gradient-sky flex items-center justify-center p-4">
      <div className="max-w-2xl w-full text-center">
        <img src={logo} alt="GUIDELY" className="h-16 w-16 rounded-full mx-auto mb-6" />
        <h1 className="text-3xl font-bold text-foreground mb-2">Choose Your Role</h1>
        <p className="text-muted-foreground mb-12">How would you like to use GUIDELY?</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => selectRole("mentee")}
            className="bg-card rounded-2xl border-2 border-border p-8 text-center hover:border-primary/40 hover:shadow-lg transition-all group">
            <div className="w-16 h-16 rounded-2xl gradient-ocean flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
              <GraduationCap className="w-8 h-8 text-primary-foreground" />
            </div>
            <h2 className="text-xl font-bold text-foreground mb-2">I'm a Mentee</h2>
            <p className="text-sm text-muted-foreground">Find a mentor to guide your business growth</p>
          </motion.button>

          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => selectRole("mentor")}
            className="bg-card rounded-2xl border-2 border-border p-8 text-center hover:border-primary/40 hover:shadow-lg transition-all group">
            <div className="w-16 h-16 rounded-2xl gradient-ocean flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
              <Users className="w-8 h-8 text-primary-foreground" />
            </div>
            <h2 className="text-xl font-bold text-foreground mb-2">I'm a Mentor</h2>
            <p className="text-sm text-muted-foreground">Share your expertise and help others grow</p>
          </motion.button>
        </div>
      </div>
    </div>
  );
};

export default SelectRole;

