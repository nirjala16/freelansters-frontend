"use client";

import { useState, useEffect } from "react";
import { motion, useAnimation } from "framer-motion";
import { TypeAnimation } from "react-type-animation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Briefcase,
  CheckCircle,
  Shield,
  Star,
  Users,
} from "lucide-react";
import PropTypes from "prop-types";
import { Link } from "react-router";

const HeroSection = ({ heroImage }) => {
  const controls = useAnimation();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    controls.start("visible");
    setIsVisible(true);
  }, [controls]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5, ease: "easeOut" },
    },
  };

  const floatingAnimation = {
    y: [0, -10, 0],
    transition: {
      duration: 4,
      repeat: Number.POSITIVE_INFINITY,
      repeatType: "reverse",
      ease: "easeInOut",
    },
  };

  const parallaxBg = {
    initial: { y: 0 },
    animate: {
      y: [-5, 5, -5],
      transition: {
        duration: 10,
        repeat: Number.POSITIVE_INFINITY,
        repeatType: "reverse",
        ease: "easeInOut",
      },
    },
  };

  return (
    <section className="pb-20 md:pt-16 md:pb-32 relative overflow-hidden">
      {/* Animated Background */}
      <motion.div
        className="absolute inset-0 -z-10"
        initial="initial"
        animate="animate"
        variants={parallaxBg}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-background to-background dark:from-purple-950/20" />
        <motion.div
          className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_top_right,rgba(124,58,237,0.1),transparent_50%)]"
          animate={{
            scale: [1, 1.05, 1],
            opacity: [0.7, 0.9, 0.7],
          }}
          transition={{
            duration: 8,
            repeat: Number.POSITIVE_INFINITY,
            repeatType: "reverse",
          }}
        />
      </motion.div>

      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="max-w-xl"
          >
            <motion.div variants={itemVariants}>
              <Badge
                className="mb-6 bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-900/30"
                variant="secondary"
              >
                <motion.span
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{
                    duration: 2,
                    repeat: Number.POSITIVE_INFINITY,
                    repeatType: "reverse",
                  }}
                >
                  Premium Freelancing Platform
                </motion.span>
              </Badge>
            </motion.div>

            <motion.h1
              variants={itemVariants}
              className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6"
            >
              Connect with{" "}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-indigo-600 inline-block">
                <TypeAnimation
                  sequence={[
                    "world-class",
                    2000,
                    "top-tier",
                    2000,
                    "expert",
                    2000,
                    "skilled",
                    2000,
                  ]}
                  wrapper="span"
                  speed={50}
                  repeat={Number.POSITIVE_INFINITY}
                />
              </span>{" "}
              <br className="hidden md:block" />
              talent & clients
            </motion.h1>

            <motion.p
              variants={itemVariants}
              className="text-lg text-muted-foreground mb-8 leading-relaxed"
            >
              Freelansters connects businesses with the perfect freelancers for
              any project. Our curated talent pool ensures quality, reliability,
              and exceptional results every time.
            </motion.p>

            <motion.div
              variants={itemVariants}
              className="flex flex-col sm:flex-row gap-4 mb-12"
            >
              <Link to="/freelancers">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-full"
                >
                  Hire Top Talent
                </Button>
              </Link>
              <Link to="/browse-Jobs">
                <Button size="lg" variant="outline" className="rounded-full">
                  Start Freelancing
                </Button>
              </Link>
            </motion.div>

            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate={isVisible ? "visible" : "hidden"}
              className="flex flex-wrap gap-x-8 gap-y-4 text-sm"
            >
              {[
                {
                  icon: <CheckCircle className="h-5 w-5 text-purple-600" />,
                  text: "Verified Professionals",
                },
                {
                  icon: <Shield className="h-5 w-5 text-purple-600" />,
                  text: "Secure Payments",
                },
                {
                  icon: <Star className="h-5 w-5 text-purple-600" />,
                  text: "4.9/5 Client Satisfaction",
                },
              ].map((item, index) => (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  custom={index}
                  className="flex items-center gap-2"
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                  <motion.div
                    animate={{
                      rotate: [0, 10, 0, -10, 0],
                    }}
                    transition={{
                      duration: 2,
                      delay: index * 0.5,
                      repeat: Number.POSITIVE_INFINITY,
                      repeatDelay: 5,
                    }}
                  >
                    {item.icon}
                  </motion.div>
                  <span>{item.text}</span>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="relative"
          >
            <motion.div
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
              className="relative rounded-2xl overflow-hidden shadow-2xl aspect-[4/3]"
            >
              <motion.img
                src={heroImage}
                alt="Freelancers collaborating"
                className="w-full h-full object-contain"
                initial={{ scale: 1.1 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.7 }}
              />
              <motion.div
                className="absolute inset-0 bg-gradient-to-tr from-purple-900/40 to-transparent mix-blend-multiply"
                animate={{
                  opacity: [0.4, 0.5, 0.4],
                }}
                transition={{
                  duration: 4,
                  repeat: Number.POSITIVE_INFINITY,
                  repeatType: "reverse",
                }}
              />
            </motion.div>

            {/* Floating Stats Cards */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              whileHover={{ scale: 1.05 }}
              className="absolute -bottom-6 -left-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 border border-purple-100 dark:border-purple-900/30"
            >
              <motion.div
                animate={floatingAnimation}
                className="flex items-center gap-3"
              >
                <motion.div
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.5 }}
                  className="h-10 w-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center"
                >
                  <Users className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </motion.div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Global Talent
                  </p>
                  <motion.p
                    className="text-xl font-bold"
                    animate={{
                      color: [
                        "rgb(126, 34, 206)",
                        "rgb(79, 70, 229)",
                        "rgb(126, 34, 206)",
                      ],
                    }}
                    transition={{
                      duration: 4,
                      repeat: Number.POSITIVE_INFINITY,
                      repeatType: "reverse",
                    }}
                  >
                    <CountUp end={10} suffix="k+ Freelancers" />
                  </motion.p>
                </div>
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              whileHover={{ scale: 1.05 }}
              className="absolute -top-6 -right-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 border border-purple-100 dark:border-purple-900/30"
            >
              <motion.div
                animate={{
                  ...floatingAnimation,
                  transition: {
                    ...floatingAnimation.transition,
                    delay: 0.5,
                  },
                }}
                className="flex items-center gap-3"
              >
                <motion.div
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.5 }}
                  className="h-10 w-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center"
                >
                  <Briefcase className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </motion.div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Completed
                  </p>
                  <motion.p
                    className="text-xl font-bold"
                    animate={{
                      color: [
                        "rgb(126, 34, 206)",
                        "rgb(79, 70, 229)",
                        "rgb(126, 34, 206)",
                      ],
                    }}
                    transition={{
                      duration: 4,
                      repeat: Number.POSITIVE_INFINITY,
                      repeatType: "reverse",
                    }}
                  >
                    <CountUp end={25} suffix="k+ Projects" />
                  </motion.p>
                </div>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

// Simple CountUp component
const CountUp = ({ end, suffix = "", duration = 2 }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const increment = end / (duration * 60);
    const timer = setInterval(() => {
      start += increment;
      if (start > end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16.7); // ~60fps

    return () => clearInterval(timer);
  }, [end, duration]);

  return (
    <span>
      {count}
      {suffix}
    </span>
  );
};

CountUp.propTypes = {
  end: PropTypes.number.isRequired,
  suffix: PropTypes.string,
  duration: PropTypes.number,
};

HeroSection.propTypes = {
  heroImage: PropTypes.string.isRequired,
};

export default HeroSection;
