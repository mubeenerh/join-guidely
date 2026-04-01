import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, ChevronLeft } from "lucide-react";

const industries = ["Poultry", "Fishery", "Agriculture", "Fashion", "Food Business", "Fintech", "Edtech", "Medtech", "Tech Startup"];
const supportAreas = ["Marketing", "Social Media", "Promotion", "Business Strategy", "Financial Planning", "Operations"];
const stages = ["Idea", "Pre-Seed", "Seed", "Growth"];

const MenteeOnboarding = () => {
  const [step, setStep] = useState(0);
  const [industry, setIndustry] = useState("");
  const [support, setSupport] = useState("");
  const [stage, setStage] = useState("");
  const navigate = useNavigate();

  const steps = [
    {
      title: "Select Your Industry",
      subtitle: "What sector is your business in?",
      options: industries,
      value: industry,
      onChange: setIndustry,
    },
    {
      title: "Area of Support",
      subtitle: "What do you need help with?",
      options: supportAreas,
      value: support,
      onChange: setSupport,
    },
    {
      title: "Business Stage",
      subtitle: "Where are you in your journey?",
      options: stages,
      value: stage,
      onChange: setStage,
    },
  ];

  const current = steps[step];
  const canNext = current.value !== "";

  const handleNext = () => {
    if (step < steps.length - 1) setStep(step + 1);
    else navigate("/mentee/dashboard");
  };

  return (
    <div className="min-h-screen gradient-sky flex items-center justify-center p-4">
      <div className="max-w-lg w-full">
        {/* Progress */}
        <div className="flex gap-2 mb-8">
          {steps.map((_, i) => (
            <div key={i} className={`h-1.5 flex-1 rounded-full transition-colors ${i <= step ? "gradient-ocean" : "bg-border"}`} />
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="bg-card rounded-2xl border border-border shadow-xl p-8"
          >
            <h2 className="text-2xl font-bold text-foreground mb-1">{current.title}</h2>
            <p className="text-sm text-muted-foreground mb-6">{current.subtitle}</p>

            <div className="grid grid-cols-2 gap-3 mb-8">
              {current.options.map(option => (
                <button
                  key={option}
                  onClick={() => current.onChange(option)}
                  className={`px-4 py-3 rounded-xl text-sm font-medium border-2 transition-all ${
                    current.value === option
                      ? "border-primary bg-primary/5 text-primary"
                      : "border-border text-foreground hover:border-primary/30"
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>

            <div className="flex justify-between">
              <button
                onClick={() => setStep(Math.max(0, step - 1))}
                disabled={step === 0}
                className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" /> Back
              </button>
              <button
                onClick={handleNext}
                disabled={!canNext}
                className="flex items-center gap-1 gradient-ocean text-primary-foreground px-6 py-2.5 rounded-lg text-sm font-semibold disabled:opacity-40 hover:opacity-90 transition-opacity"
              >
                {step === steps.length - 1 ? "Find Mentors" : "Next"} <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default MenteeOnboarding;
