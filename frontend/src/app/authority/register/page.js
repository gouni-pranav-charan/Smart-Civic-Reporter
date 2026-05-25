"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { ShieldCheck } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useSearchParams } from "next/navigation";

export default function AuthorityRegister() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/authority/dashboard";
  const [formData, setFormData] = useState({
    name: "", phone: "", email: "", password: "", city: "", area: "", role: "authority"
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Registration failed");
      }

      alert("Authority registration successful! Please log in.");
      router.push(`/authority/login?redirect=${redirect}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-4 py-12">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-lg"
      >
        <div className="flex justify-center mb-6">
          <div className="flex items-center justify-center h-16 w-16 rounded-full bg-slate-900 dark:bg-slate-100">
            <ShieldCheck className="h-8 w-8 text-white dark:text-slate-900" />
          </div>
        </div>
        <Card className="border-t-4 border-t-slate-900 dark:border-t-slate-100">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl font-bold">Authority Registration</CardTitle>
            <CardDescription>
              Create an official account to manage civic issues
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && <div className="text-red-500 text-sm font-medium text-center">{error}</div>}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">Full Name</label>
                <Input 
                  placeholder="Officer Name" 
                  value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Official Phone</label>
                <Input 
                  placeholder="+91 0000000000" 
                  value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})}
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Official Email Address</label>
              <Input 
                type="email" 
                placeholder="officer@smartcivic.local" 
                value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Secure Password</label>
              <Input 
                type="password" 
                value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})}
              />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">City / Municipality</label>
                <Input 
                  placeholder="e.g. Hyderabad" 
                  value={formData.city} onChange={(e) => setFormData({...formData, city: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Department / Zone</label>
                <Input 
                  placeholder="e.g. GHMC Central" 
                  value={formData.area} onChange={(e) => setFormData({...formData, area: e.target.value})}
                />
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button 
              className="w-full bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200" 
              onClick={handleRegister} 
              disabled={loading}
            >
              {loading ? "Registering..." : "Register Authority"}
            </Button>
            <div className="text-center text-sm text-slate-500">
              Already have an authority account?{" "}
              <Link href={`/authority/login?redirect=${redirect}`} className="text-slate-900 dark:text-slate-100 font-bold hover:underline">
                Sign In
              </Link>
            </div>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
}
