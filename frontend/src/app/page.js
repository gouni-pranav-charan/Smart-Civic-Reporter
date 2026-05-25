"use client";

import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { motion } from "framer-motion";
import { ArrowRight, Bot, Map, Upload, CheckCircle2, Mic, Languages, LocateFixed, Eye, Navigation, Bell } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function Home() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 100 }
    }
  };

  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)]">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-white dark:bg-slate-950 py-24 sm:py-32">
        <div className="absolute inset-x-0 top-0 h-96 bg-gradient-to-b from-blue-50 to-transparent dark:from-blue-950/20" />
        <div className="container relative mx-auto px-4 md:px-6">
          <div className="text-center max-w-3xl mx-auto space-y-8">
            <motion.h1 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl text-slate-900 dark:text-slate-50"
            >
              Report Civic Issues. <span className="text-blue-600 dark:text-blue-500">Improve Your City.</span>
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-lg md:text-xl text-slate-600 dark:text-slate-300"
            >
              An AI-powered platform helping citizens report problems and helping authorities resolve them faster. 
              Join us in building a smarter, cleaner city together.
            </motion.p>
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <Link href="/report">
                <Button size="lg" className="w-full sm:w-auto h-14 px-8 text-base">
                  Report Issue <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/track">
                <Button size="lg" variant="outline" className="w-full sm:w-auto h-14 px-8 text-base bg-white dark:bg-slate-950">
                  Track Complaint
                </Button>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24 bg-slate-50 dark:bg-slate-900/50">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50">How It Works</h2>
            <p className="mt-4 text-slate-500 dark:text-slate-400">Four simple steps to a better community.</p>
          </div>

          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid gap-8 md:grid-cols-4"
          >
            {[
              { icon: Upload, title: "1. Report Issue", desc: "Upload a photo and brief description." },
              { icon: Bot, title: "2. AI Enhances", desc: "AI automatically details the problem for clarity." },
              { icon: Map, title: "3. Navigate", desc: "Authorities get exact GPS coordinates." },
              { icon: CheckCircle2, title: "4. Resolved", desc: "Get notified with proof of resolution." }
            ].map((step, i) => (
              <motion.div key={i} variants={itemVariants} className="relative">
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400">
                    <step.icon className="h-8 w-8" />
                  </div>
                  <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-50">{step.title}</h3>
                  <p className="text-slate-500 dark:text-slate-400">{step.desc}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Feature Highlights */}
      <section className="py-24 bg-white dark:bg-slate-950">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50">Features Designed for You</h2>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: Bot, title: "AI Description", desc: "Smart enhancement of descriptions." },
              { icon: Mic, title: "Voice Input", desc: "Speak your complaint naturally." },
              { icon: Languages, title: "Multi-Language", desc: "Support for local languages." },
              { icon: LocateFixed, title: "GPS Detection", desc: "Pinpoint exact issue locations." },
              { icon: Upload, title: "Image Evidence", desc: "Rich media uploads supported." },
              { icon: Eye, title: "Smart Prioritization", desc: "AI ranks severe issues higher." },
              { icon: Navigation, title: "Map Navigation", desc: "Routing for on-ground workers." },
              { icon: Bell, title: "Email Notifications", desc: "Updates on your issue status." },
            ].map((feature, i) => (
              <Card key={i} className="hover:border-blue-500/50 transition-colors bg-slate-50/50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 shadow-none">
                <CardHeader>
                  <feature.icon className="h-6 w-6 text-teal-500 mb-2" />
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                  <CardDescription>{feature.desc}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
