import { useState } from "react";
import { motion } from "framer-motion";
import { Star, Calendar, MessageSquare, TrendingUp, Search, Bell, User, BadgeCheck } from "lucide-react";
import logo from "@/assets/logo.png";
import { Link } from "react-router-dom";

const mentors = [
  { id: 1, name: "Adaeze Okafor", sector: "Agriculture", rating: 4.9, sessions: 120, bio: "10+ years in sustainable farming and agribusiness consulting.", available: true },
  { id: 2, name: "Chidi Nnamdi", sector: "Fintech", rating: 4.8, sessions: 95, bio: "Former VP of product at a leading African fintech.", available: true },
  { id: 3, name: "Fatima Bello", sector: "Fashion", rating: 4.7, sessions: 78, bio: "Fashion brand strategist with global market experience.", available: false },
  { id: 4, name: "Emeka Eze", sector: "Tech Startup", rating: 4.9, sessions: 150, bio: "Serial entrepreneur, Y Combinator alum.", available: true },
];

const MenteeDashboard = () => {
  const [tab, setTab] = useState<"mentors" | "sessions" | "progress">("mentors");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredMentors = mentors.filter(m =>
    m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.sector.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Top nav */}
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
        <h1 className="text-2xl font-bold text-foreground mb-1">Welcome back! 👋</h1>
        <p className="text-muted-foreground mb-8">Find your perfect mentor and grow your business.</p>

        {/* Tabs */}
        <div className="flex gap-1 bg-muted rounded-xl p-1 mb-8 w-fit">
          {(["mentors", "sessions", "progress"] as const).map(t => (
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

        {tab === "mentors" && (
          <>
            <div className="relative mb-6">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search mentors by name or sector..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-xl border border-input bg-card text-foreground text-sm focus:ring-2 focus:ring-ring outline-none transition"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredMentors.map((mentor, i) => (
                <motion.div
                  key={mentor.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-card rounded-2xl border border-border p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-xl gradient-wave flex items-center justify-center shrink-0">
                      <span className="text-lg font-bold text-primary">{mentor.name.charAt(0)}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-foreground truncate">{mentor.name}</h3>
                        <BadgeCheck className="w-4 h-4 text-wave shrink-0" />
                      </div>
                      <p className="text-xs text-muted-foreground mb-2">{mentor.sector}</p>
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{mentor.bio}</p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1"><Star className="w-3.5 h-3.5 text-yellow-500" /> {mentor.rating}</span>
                        <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {mentor.sessions} sessions</span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 flex gap-2">
                    <button className="flex-1 gradient-ocean text-primary-foreground py-2.5 rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity">
                      Request Mentorship
                    </button>
                    <button className="px-4 py-2.5 rounded-lg border border-border text-foreground text-sm font-medium hover:bg-muted transition-colors">
                      <MessageSquare className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </>
        )}

        {tab === "sessions" && (
          <div className="bg-card rounded-2xl border border-border p-8 text-center">
            <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No Sessions Yet</h3>
            <p className="text-sm text-muted-foreground">Once a mentor accepts your request, you'll be able to schedule sessions here.</p>
          </div>
        )}

        {tab === "progress" && (
          <div className="bg-card rounded-2xl border border-border p-8 text-center">
            <TrendingUp className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">Track Your Growth</h3>
            <p className="text-sm text-muted-foreground">Your milestones and achievements will appear here as you progress.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MenteeDashboard;
