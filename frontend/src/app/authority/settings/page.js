"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { User, Bell, Shield, Lock, Globe, Save } from "lucide-react";
import { motion } from "framer-motion";

export default function SettingsPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      <div>
        <h1 className="text-3xl font-black text-slate-900 border-l-8 border-blue-600 pl-4 uppercase tracking-tighter">System Configuration</h1>
        <p className="text-slate-500 font-bold mt-2">Manage authority preferences and security protocols.</p>
      </div>

      <div className="grid gap-8">
        <section className="space-y-4">
           <h2 className="text-lg font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <User size={18} /> Official Profile
           </h2>
           <Card className="border-none shadow-xl shadow-slate-200/50 rounded-3xl overflow-hidden">
              <CardContent className="p-8 grid gap-6">
                 <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                       <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Full Name</label>
                       <Input value="Ravi Kumar" className="rounded-xl border-2 h-12" readOnly />
                    </div>
                    <div className="space-y-2">
                       <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Official ID</label>
                       <Input value="IND-HYD-7829-M" className="rounded-xl border-2 h-12 bg-slate-50" readOnly />
                    </div>
                 </div>
                 <div className="space-y-2">
                    <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Department</label>
                    <Input value="LB Nagar Drainage Maintenance" className="rounded-xl border-2 h-12" readOnly />
                 </div>
              </CardContent>
           </Card>
        </section>

        <section className="space-y-4">
           <h2 className="text-lg font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <Shield size={18} /> Security & Authentication
           </h2>
           <Card className="border-none shadow-xl shadow-slate-200/50 rounded-3xl overflow-hidden">
              <CardContent className="p-8 space-y-6">
                 <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <div className="flex items-center gap-4">
                       <div className="p-3 bg-white rounded-xl shadow-sm">
                          <Lock className="text-blue-600 h-5 w-5" />
                       </div>
                       <div>
                          <h4 className="font-black text-slate-900 leading-none mb-1">Two-Factor Authentication</h4>
                          <p className="text-xs text-slate-500 font-bold">Secure your officer account with mobile OTP.</p>
                       </div>
                    </div>
                    <Button variant="outline" className="rounded-xl border-2 font-bold text-xs uppercase text-blue-600 border-blue-100">Enable</Button>
                 </div>
                 <Button className="w-full h-12 rounded-xl bg-slate-900 text-white font-bold gap-2">
                    <Save className="h-4 w-4" /> Save Security Changes
                 </Button>
              </CardContent>
           </Card>
        </section>
      </div>
    </div>
  );
}
