"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/Card";
import { User, Mail, Phone, MapPin, Building, ShieldCheck, LogOut, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

export default function Profile() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }

      try {
        const res = await fetch("http://localhost:5000/api/auth/profile", {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });
        const data = await res.json();
        
        if (!res.ok) throw new Error(data.message || "Failed to fetch profile");
        
        setUser(data);
      } catch (err) {
        setError(err.message);
        // If token invalid, redirect
        if (err.message.includes("authorized")) {
            handleLogout();
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/");
    // Force refresh to update navbar
    window.location.reload();
  };

  if (loading) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-4">
        <Card className="max-w-md w-full border-red-200 bg-red-50 dark:bg-red-900/10">
          <CardHeader>
            <CardTitle className="text-red-600">Profile Error</CardTitle>
            <CardDescription>{error || "Unable to load profile data."}</CardDescription>
          </CardHeader>
          <CardFooter>
            <Button onClick={() => window.location.reload()} variant="outline" className="w-full">
              Retry Loading
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-2xl py-12 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="mb-8 flex items-center justify-between">
            <Link href={user.role === 'authority' ? "/authority/dashboard" : "/dashboard"}>
                <Button variant="ghost" className="gap-2">
                    <ArrowLeft className="h-4 w-4" /> Back to Dashboard
                </Button>
            </Link>
        </div>

        <Card className="overflow-hidden border-none shadow-2xl">
          <div className={`h-32 ${user.role === 'authority' ? 'bg-slate-900' : 'bg-blue-600'}`} />
          <div className="relative px-8 pb-8">
            <div className="absolute -top-12 left-8">
              <div className="h-24 w-24 rounded-3xl bg-white p-1 shadow-xl">
                <div className={`h-full w-full rounded-2xl flex items-center justify-center ${user.role === 'authority' ? 'bg-slate-100 text-slate-900' : 'bg-blue-50 text-blue-600'}`}>
                  {user.role === 'authority' ? <ShieldCheck className="h-12 w-12" /> : <User className="h-12 w-12" />}
                </div>
              </div>
            </div>
            
            <div className="pt-16">
              <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50">{user.name}</h1>
              <p className="text-slate-500 font-medium capitalize flex items-center gap-2 mt-1">
                {user.role} Account • {user.area}, {user.city}
              </p>
            </div>

            <div className="mt-8 grid gap-6 md:grid-cols-2">
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400">
                  <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg">
                    <Mail className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Email Address</p>
                    <p className="font-medium">{user.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400">
                  <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg">
                    <Phone className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Phone Number</p>
                    <p className="font-medium">{user.phone || "Not provided"}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400">
                  <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg">
                    <Building className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400">City / Region</p>
                    <p className="font-medium">{user.city}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400">
                  <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg">
                    <MapPin className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Department / Area</p>
                    <p className="font-medium">{user.area}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-12 pt-8 border-t border-slate-100 dark:border-slate-800">
                <Button 
                    variant="destructive" 
                    className="w-full h-12 gap-2 text-base font-bold rounded-xl shadow-lg shadow-red-500/20"
                    onClick={handleLogout}
                >
                    <LogOut className="h-5 w-5" /> Logout from Session
                </Button>
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
