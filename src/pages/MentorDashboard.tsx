import { useState } from "react";
import { motion } from "framer-motion";
import { Bell, User, Calendar, Users, TrendingUp, Clock, CheckCircle, XCircle } from "lucide-react";
import logo from "@/assets/logo.png";
import { Link } from "react-router-dom";

const requests = [
  { id: 1, name: "Ngozi Adeyemi", sector: "Agriculture", stage: "Seed", message: "I need help scaling my poultry farm operations." },
  { id: 2, name: "Tunde Bakare", sector: "Fintech", stage: "Pre-Seed", message: "Looking for guidance on product-market fit." },
  { id: 3, name: "Amina Hassan", sector: "Fashion", stage: "Growth", message: "Need mentorship on expanding to international markets." },
];

const MentorDashboard = () => {
  const [tab, setTab] = useState<"requests" | "schedule" | "impact">("requests");
  const [pendingRequests, setPendingRequests] = useState(requests);

  const handleAccept = (id: number) => {
    setPendingRequests(prev => prev.filter(r => r.id !== id));
  };

  const handleDecline = (id: number) => {
    setPendingRequests(prev => prev.filter(r => r.id !== id));
  };

  return (
    <div className="min-h-screen bg-background">
      <nav className="bg-card border-b border-border sticky top-0 z-40">
        <div className="container flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2">
            <img src={logo} alt="Guidedly" className="h-8 w-8 rounded-full" />
            <span className="font-bold text-foreground hidden sm:block">Guidedly</span>
          </Link>
          <div className="flex items-center gap-4">
            <button className="relative text-muted-foreground hover:text-foreground">
              <Bell className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-wave rounded-full border-2 border-card" />
            </button>
            <div className="w-9 h-9 rounded-full gradient-ocean flex items-center justify-center">
              <User className="w-5 h-5 text-primary-foreground" />
            </div>
          </div>
        </div>
      </nav>

      <div className="container py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Active Mentees", value: "12", icon: Users },
            { label: "Sessions This Month", value: "24", icon: Calendar },
            { label: "Pending Requests", value: String(pendingRequests.length), icon: Clock },
            { label: "Avg. Rating", value: "4.9", icon: TrendingUp },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-card rounded-2xl border border-border p-5"
            >
              <stat.icon className="w-5 h-5 text-wave mb-2" />
              <p className="text-2xl font-bold text-foreground">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-muted rounded-xl p-1 mb-8 w-fit">
          {(["requests", "schedule", "impact"] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-5 py-2 rounded-lg text-sm font-medium transition-all capitalize ${
                tab === t ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {tab === "requests" && (
          <div className="space-y-4">
            {pendingRequests.length === 0 ? (
              <div className="bg-card rounded-2xl border border-border p-8 text-center">
                <CheckCircle className="w-12 h-12 text-wave mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">All Caught Up!</h3>
                <p className="text-sm text-muted-foreground">No pending requests at the moment.</p>
              </div>
            ) : (
              pendingRequests.map((req, i) => (
                <motion.div
                  key={req.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-card rounded-2xl border border-border p-6"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl gradient-wave flex items-center justify-center shrink-0">
                      <span className="text-lg font-bold text-primary">{req.name.charAt(0)}</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground">{req.name}</h3>
                      <p className="text-xs text-muted-foreground mb-2">{req.sector} · {req.stage} Stage</p>
                      <p className="text-sm text-muted-foreground">{req.message}</p>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <button onClick={() => handleAccept(req.id)} className="flex-1 gradient-ocean text-primary-foreground py-2.5 rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity flex items-center justify-center gap-1">
                      <CheckCircle className="w-4 h-4" /> Accept
                    </button>
                    <button onClick={() => handleDecline(req.id)} className="flex-1 border border-border text-foreground py-2.5 rounded-lg text-sm font-medium hover:bg-muted transition-colors flex items-center justify-center gap-1">
                      <XCircle className="w-4 h-4" /> Decline
                    </button>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        )}

        {tab === "schedule" && (
          <div className="bg-card rounded-2xl border border-border p-8 text-center">
            <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">Your Schedule</h3>
            <p className="text-sm text-muted-foreground">Your upcoming sessions will appear here.</p>
          </div>
        )}

        {tab === "impact" && (
          <div className="bg-card rounded-2xl border border-border p-8 text-center">
            <TrendingUp className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">Your Impact</h3>
            <p className="text-sm text-muted-foreground">Track mentee progress and feedback here.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MentorDashboard;
