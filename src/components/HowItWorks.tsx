import { motion } from "framer-motion";

const steps = [
  { step: "01", title: "Create Account", description: "Sign up and choose your role as a mentee or mentor." },
  { step: "02", title: "Set Your Profile", description: "Select your industry, stage, and areas of interest." },
  { step: "03", title: "Get Matched", description: "Browse verified mentors or receive mentee requests." },
  { step: "04", title: "Start Growing", description: "Schedule sessions, chat, and track your progress." },
];

const HowItWorks = () => {
  return (
    <section id="how-it-works" className="py-20 lg:py-28 gradient-sky">
      <div className="container">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            How It <span className="text-gradient-ocean">Works</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Get started in four simple steps.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((item, i) => (
            <motion.div
              key={item.step}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              className="relative text-center"
            >
              <div className="text-5xl font-extrabold text-primary/10 mb-2">{item.step}</div>
              <h3 className="text-lg font-bold text-foreground mb-2">{item.title}</h3>
              <p className="text-sm text-muted-foreground">{item.description}</p>
              {i < steps.length - 1 && (
                <div className="hidden lg:block absolute top-8 -right-4 w-8 h-0.5 bg-border" />
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
