import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import logo from "@/assets/logo.png";

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center gradient-sky pt-16 overflow-hidden">
      {/* Decorative circles */}
      <div className="absolute top-20 right-10 w-64 h-64 bg-wave/10 rounded-full blur-3xl" />
      <div className="absolute bottom-20 left-10 w-80 h-80 bg-primary/5 rounded-full blur-3xl" />

      <div className="container relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="flex-1 text-center lg:text-left"
          >
            <div className="inline-flex items-center gap-2 bg-secondary px-4 py-2 rounded-full text-sm font-medium text-secondary-foreground mb-6">
              <span className="w-2 h-2 bg-wave rounded-full animate-pulse" />
              Trusted Mentorship Platform
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-foreground leading-tight mb-6">
              Navigate Your
              <span className="text-gradient-ocean block">Business Journey</span>
              With Expert Guidance
            </h1>
            <p className="text-lg text-muted-foreground max-w-lg mx-auto lg:mx-0 mb-8">
              Connect with verified mentors across industries. Get affordable, personalized mentorship to grow your business from idea to scale.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link
                to="/signup"
                className="gradient-ocean text-primary-foreground px-8 py-4 rounded-xl text-base font-semibold hover:opacity-90 transition-all shadow-lg shadow-primary/20"
              >
                Create Account
              </Link>
              <a
                href="#how-it-works"
                className="bg-card text-foreground px-8 py-4 rounded-xl text-base font-semibold border border-border hover:border-primary/30 transition-all"
              >
                Learn More
              </a>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="flex-1 flex justify-center"
          >
            <div className="relative">
              <div className="w-64 h-64 sm:w-80 sm:h-80 rounded-full gradient-wave p-1 animate-float">
                <div className="w-full h-full rounded-full bg-card flex items-center justify-center">
                  <img src={logo} alt="GUIDELY" className="w-3/4 h-3/4 object-contain" />
                </div>
              </div>
              {/* Floating stats */}
              <div className="absolute -top-4 -right-4 bg-card rounded-2xl shadow-lg border border-border px-4 py-3">
                <p className="text-2xl font-bold text-foreground">500+</p>
                <p className="text-xs text-muted-foreground">Verified Mentors</p>
              </div>
              <div className="absolute -bottom-4 -left-4 bg-card rounded-2xl shadow-lg border border-border px-4 py-3">
                <p className="text-2xl font-bold text-foreground">9+</p>
                <p className="text-xs text-muted-foreground">Industries</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Hero;

