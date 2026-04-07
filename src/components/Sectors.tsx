import { motion } from "framer-motion";
import { Sprout, Fish, Shirt, UtensilsCrossed, Cpu, GraduationCap, HeartPulse, Rocket, Egg } from "lucide-react";

const sectors = [
  { icon: Sprout, name: "Agriculture" },
  { icon: Egg, name: "Poultry" },
  { icon: Fish, name: "Fishery" },
  { icon: Shirt, name: "Fashion" },
  { icon: UtensilsCrossed, name: "Food Business" },
  { icon: Cpu, name: "Fintech" },
  { icon: GraduationCap, name: "Edtech" },
  { icon: HeartPulse, name: "Medtech" },
  { icon: Rocket, name: "Tech Startup" },
];

const Sectors = () => {
  return (
    <section id="sectors" className="py-20 lg:py-28 bg-background">
      <div className="container">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Industries We <span className="text-gradient-ocean">Cover</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Find mentorship in the sector that matters to you.
          </p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {sectors.map((sector, i) => (
            <motion.div
              key={sector.name}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="flex flex-col items-center gap-3 bg-card rounded-2xl border border-border p-6 hover:shadow-md hover:border-primary/20 transition-all cursor-pointer group"
            >
              <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center group-hover:gradient-ocean transition-all">
                <sector.icon className="w-6 h-6 text-secondary-foreground group-hover:text-primary-foreground transition-colors" />
              </div>
              <span className="text-sm font-medium text-foreground">{sector.name}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Sectors;

