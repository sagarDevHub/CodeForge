"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Terminal,
  Sparkles,
  Code2,
  Shield,
  Zap,
} from "lucide-react";
import { motion } from "framer-motion";

const Home = () => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const features = [
    {
      icon: Code2,
      title: "AI-Powered Analysis",
      description: "Intelligent code insights and suggestions",
    },
    {
      icon: Shield,
      title: "Deployment Readiness",
      description: "Automated security and deployment checks",
    },
    {
      icon: Zap,
      title: "Smart Migrations",
      description: "AI-driven code migration with PR support",
    },
  ];

  return (
    <div className="from-background via-background dark:via-background relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-linear-to-b to-blue-50/10 px-4 dark:to-blue-950/5">
      {/* Animated Background */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-blue-500/5 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-indigo-500/5 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-400/5 blur-3xl" />
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex max-w-4xl flex-col items-center gap-6 text-center">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="inline-flex items-center gap-2 rounded-full border border-blue-200/50 bg-blue-50/50 px-4 py-1.5 text-sm font-medium text-blue-700 backdrop-blur-sm dark:border-blue-900/30 dark:bg-blue-950/30 dark:text-blue-400"
        >
          <Sparkles className="h-4 w-4" aria-hidden="true" />
          <span>AI-Powered Development Platform</span>
        </motion.div>

        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="space-y-3"
        >
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl">
            Build Better Code
            <br />
            <span className="bg-linear-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              With AI Intelligence
            </span>
          </h1>
        </motion.div>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="text-muted-foreground mx-auto max-w-2xl text-base sm:text-lg"
        >
          Supercharge your development workflow with AI-powered code analysis,
          deployment readiness checks, and automated migrations.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="flex flex-wrap items-center justify-center gap-4"
        >
          <Link href="/sign-up" prefetch={true}>
            <Button
              size="lg"
              className="group h-11 px-6 font-medium shadow-lg shadow-blue-500/25 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/30"
            >
              Get Started
              <ArrowRight
                className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
                aria-hidden="true"
              />
            </Button>
          </Link>
          <Link href="/sign-in" prefetch={true}>
            <Button
              variant="outline"
              size="lg"
              className="h-11 px-6 font-medium"
            >
              Sign In
            </Button>
          </Link>
        </motion.div>

        {/* Features */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="mt-12 grid w-full grid-cols-1 gap-4 sm:grid-cols-3"
        >
          {features.map((feature, idx) => (
            <div
              key={idx}
              className="group bg-card/50 hover:bg-card rounded-xl border p-4 text-center transition-all hover:shadow-lg"
            >
              <div className="mb-2 inline-flex rounded-lg bg-blue-500/10 p-2 text-blue-500">
                <feature.icon className="h-5 w-5" />
              </div>
              <h3 className="text-sm font-semibold">{feature.title}</h3>
              <p className="text-muted-foreground mt-1 text-xs">
                {feature.description}
              </p>
            </div>
          ))}
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="mt-8 flex flex-wrap items-center justify-center gap-8 text-center"
        >
          {[
            { label: "Projects", value: "10K+" },
            { label: "Users", value: "5K+" },
            { label: "Insights", value: "50K+" },
          ].map((stat, idx) => (
            <div key={idx}>
              <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
                {stat.value}
              </div>
              <div className="text-muted-foreground text-xs">{stat.label}</div>
            </div>
          ))}
        </motion.div>

        {/* Tech Stack Badges */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.4 }}
          className="mt-4 flex flex-wrap items-center justify-center gap-2"
        >
          <span className="text-muted-foreground text-xs">Powered by</span>
          <div className="flex flex-wrap gap-1.5">
            {["Next.js", "TypeScript", "Prisma", "Redis", "GROQ"].map(
              (tech) => (
                <span
                  key={tech}
                  className="bg-secondary/50 text-muted-foreground rounded-full border px-2.5 py-0.5 text-[10px]"
                >
                  {tech}
                </span>
              ),
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Home;
