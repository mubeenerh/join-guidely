import { motion } from "framer-motion";
import { Shield, Users, Calendar, MessageSquare, Star, TrendingUp } from "lucide-react";

const features = [
  { icon: Shield, title: "Verified Mentors", description: "Every mentor is verified with credentials and experience checks." },
  { icon: Users, title: "Industry Matching", description: "Find mentors in your exact business sector and growth stage." },
  { icon: Calendar, title: "Easy Scheduling", description: "Book sessions with an integrated calendar system." },
  { icon: MessageSquare, title: "Secure Messaging", description: "Private chat and video calls with your mentor." },
  { icon: Star, title: "Ratings & Reviews", description: "Make informed choices with community feedback." },
  { icon: TrendingUp, title: "Progress Tracking", description: "Track milestones and measure your growth journey." },
];

const Features = () => {
  return (
    <section id="features" className="py-20 lg:py-28 bg-background">
      <div className="container">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Everything You Need to <span className="text-gradient-ocean">Grow</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            A complete mentorship ecosystem designed to accelerate your business growth.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="group bg-card rounded-2xl border border-border p-6 hover:shadow-lg hover:border-primary/20 transition-all"
            >
              <div className="w-12 h-12 rounded-xl gradient-ocean flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <feature.icon className="w-6 h-6 text-primary-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;

