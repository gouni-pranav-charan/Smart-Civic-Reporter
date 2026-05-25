"use client";

import { motion } from "framer-motion";
import { User, ShieldCheck, ArrowRight, MapPin, Sparkles, Navigation } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function AuthSelection() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const redirect = searchParams.get("redirect") || "/dashboard";
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      // Removed auto-redirect to allow users to see the selection gateway even if logged in
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
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1 }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 bg-slate-50/50 dark:bg-slate-950/50">
      <div className="max-w-4xl w-full grid md:grid-cols-2 gap-8">
        
        {/* Citizen Side */}
        <motion.div
           variants={itemVariants}
           initial="hidden"
           animate="visible"
        >
          <Card className="h-full border-none shadow-2xl shadow-blue-500/10 rounded-3xl overflow-hidden hover:scale-[1.02] transition-transform duration-300">
            <div className="h-2 bg-blue-600" />
            <CardHeader className="p-8 pb-4">
              <div className="h-14 w-14 rounded-2xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center mb-6">
                <User className="h-7 w-7 text-blue-600 dark:text-blue-400" />
              </div>
              <CardTitle className="text-3xl font-black text-slate-900 dark:text-slate-50 tracking-tight">Citizen Portal</CardTitle>
              <CardDescription className="text-slate-500 dark:text-slate-400 font-bold text-base mt-2">
                Report issues, track progress, and get AI-assisted help in seconds.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-8 pt-4 space-y-4">
               <div className="space-y-4 mb-8">
                  <div className="flex items-center gap-3 text-sm font-medium text-slate-600">
                     <MapPin className="h-4 w-4 text-blue-500" />
                     <span>Report infrastructure problems</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm font-medium text-slate-600">
                     <Sparkles className="h-4 w-4 text-teal-500" />
                     <span>AI-powered descriptions</span>
                  </div>
               </div>
               
               <div className="grid gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                 <Link href={`/login?redirect=${redirect}`}>
                    <Button className="w-full h-14 rounded-2xl text-base font-bold bg-blue-600 hover:bg-blue-700 shadow-xl shadow-blue-500/20">
                      Sign In to Account <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                 </Link>
                 <Link href="/register">
                    <Button variant="outline" className="w-full h-14 rounded-2xl text-base font-bold bg-white dark:bg-slate-950">
                      New? Create Account
                    </Button>
                 </Link>
               </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Authority Side */}
        <motion.div
           variants={itemVariants}
           initial="hidden"
           animate="visible"
           transition={{ delay: 0.1 }}
        >
          <Card className="h-full border-none shadow-2xl shadow-slate-900/10 rounded-3xl overflow-hidden hover:scale-[1.02] transition-transform duration-300">
            <div className="h-2 bg-slate-950 dark:bg-slate-100" />
            <CardHeader className="p-8 pb-4">
              <div className="h-14 w-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-6">
                <ShieldCheck className="h-7 w-7 text-slate-900 dark:text-slate-100" />
              </div>
              <CardTitle className="text-3xl font-black text-slate-900 dark:text-slate-50 tracking-tight">Authority Access</CardTitle>
              <CardDescription className="text-slate-500 dark:text-slate-400 font-bold text-base mt-2">
                Manage city-wide complaints, navigate to sites, and resolve issues.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-8 pt-4 space-y-4">
               <div className="space-y-4 mb-8">
                  <div className="flex items-center gap-3 text-sm font-medium text-slate-600">
                     <Navigation className="h-4 w-4 text-orange-500" />
                     <span>Integrated on-site navigation</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm font-medium text-slate-600">
                     <ShieldCheck className="h-4 w-4 text-blue-500" />
                     <span>Official case management</span>
                  </div>
               </div>

               <div className="grid gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                 <Link href="/authority/login">
                    <Button className="w-full h-14 rounded-2xl text-base font-bold bg-slate-950 text-white hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 shadow-xl shadow-slate-500/20">
                      Official Sign In <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                 </Link>
                 <Link href="/authority/register">
                    <Button variant="outline" className="w-full h-14 rounded-2xl text-base font-bold bg-white dark:bg-slate-950">
                      Register as Authority
                    </Button>
                 </Link>
               </div>
            </CardContent>
          </Card>
        </motion.div>

      </div>
    </div>
  );
}
