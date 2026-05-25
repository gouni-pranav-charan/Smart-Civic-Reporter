"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { ShieldAlert } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useSearchParams } from "next/navigation";

export default function AuthorityLogin() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/authority/dashboard";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      console.log("Attempting login for:", email);
      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      console.log("Login response status:", res.status);
      const data = await res.json();
      console.log("Login res data:", data);

      if (!res.ok) {
        throw new Error(data.message || "Failed to log in");
      }

      if (data.role !== 'authority') {
        throw new Error("Access denied. Not an authority account.");
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data));
      console.log("Login successful, redirecting to:", redirect);
      router.push(redirect);
    } catch (err) {
      console.error("Login Error:", err);
      if (err.message === "Invalid credentials") {
        setError("Invalid credentials. If the server restarted, please click 'Create Demo Admin' below to re-register the account.");
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDemoSeed = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          name: "Admin Officer", 
          email: "admin@smartcivic.local", 
          password: "password", 
          role: "authority",
          area: "GHMC Central"
        }),
      });
      
      setEmail("admin@smartcivic.local");
      setPassword("password");
      
      if(res.ok) {
        alert("Success: Demo Authority created. Data pre-filled.");
      } else {
        alert("Demo Authority ready. Data pre-filled.");
      }
    } catch(e) {
      setError("Backend connection failure during seeding.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md"
      >
        <div className="flex justify-center mb-6">
          <div className="flex items-center justify-center h-16 w-16 rounded-full bg-slate-900 dark:bg-slate-100">
            <ShieldAlert className="h-8 w-8 text-white dark:text-slate-900" />
          </div>
        </div>
        <Card className="border-t-4 border-t-slate-900 dark:border-t-slate-100">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl font-bold">Authority Portal</CardTitle>
            <CardDescription>
              Sign in to manage and resolve civic complaints
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
             {error && <div className="text-red-500 text-sm font-medium text-center">{error}</div>}
             <div className="space-y-2">
               <label className="text-sm font-medium leading-none">Official Email Address</label>
               <Input 
                 id="email" 
                 type="email" 
                 placeholder="admin@smartcivic.local" 
                 value={email}
                 onChange={(e) => setEmail(e.target.value)}
               />
             </div>
             <div className="space-y-2">
               <label className="text-sm font-medium leading-none">Password</label>
               <Input 
                 id="password" 
                 type="password" 
                 value={password}
                 onChange={(e) => setPassword(e.target.value)}
               />
             </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button 
              className="w-full bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200"
              onClick={handleLogin}
              disabled={loading}
            >
              {loading ? "Authenticating..." : "Secure Login"}
            </Button>
            <Button variant="link" onClick={handleDemoSeed} className="text-xs text-slate-500">
              [Create Demo Admin: admin@smartcivic.local / password]
            </Button>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
}
