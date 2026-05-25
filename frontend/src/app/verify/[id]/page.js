"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
  CheckCircle2, 
  MapPin, 
  Calendar, 
  ImageIcon, 
  MessageSquare, 
  ArrowLeft,
  Loader2,
  ShieldCheck,
  Building
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { motion, AnimatePresence } from "framer-motion";

export default function VerifyResolution() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id;

  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [error, setError] = useState("");
  const [verified, setVerified] = useState(false);

  const fetchComplaint = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/complaints/${id}`);
      if (res.ok) {
        const data = await res.json();
        setComplaint(data);
        if (data.status === 'Resolved') setVerified(true);
      } else {
        const data = await res.json();
        setError(data.message || "Case history synchronization failed.");
      }
    } catch (err) {
      setError("Network infrastructure offline.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchComplaint();
  }, [id]);

  const handleVerify = async () => {
    setVerifyLoading(true);
    const token = localStorage.getItem("token");

    if (!token) {
      router.push(`/login?redirect=/verify/${id}`);
      return;
    }

    try {
      const res = await fetch(`http://localhost:5000/api/complaints/${id}/verify`, {
        method: "PUT",
        headers: { 
          "Authorization": `Bearer ${token}` 
        },
      });

      if (res.ok) {
        setVerified(true);
        // Add a small delay for the animation
        setTimeout(() => {
          router.push("/dashboard");
        }, 3000);
      } else {
        const data = await res.json();
        setError(data.message || "Verification transaction failed.");
      }
    } catch (err) {
      setError("Authorization timeout or connection error.");
    } finally {
      setVerifyLoading(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="text-center space-y-4">
        <Loader2 className="h-12 w-12 text-blue-600 animate-spin mx-auto" />
        <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Accessing Case Vault...</p>
      </div>
    </div>
  );

  if (error || !complaint) return (
    <div className="min-h-screen flex items-center justify-center p-8 bg-slate-50">
       <Card className="max-w-md w-full border-none shadow-2xl rounded-[2.5rem] overflow-hidden">
          <div className="bg-red-500 p-8 text-center text-white">
             <MapPin className="h-12 w-12 mx-auto mb-4 opacity-50" />
             <h2 className="text-2xl font-black uppercase tracking-tighter">Access Denied</h2>
          </div>
          <CardContent className="p-10 text-center">
             <p className="text-slate-600 font-bold mb-8 italic">"{error || "We couldn't retrieve the requested data packet."}"</p>
             <Button onClick={() => router.push("/track")} className="w-full h-14 rounded-2xl bg-slate-900 font-black uppercase tracking-widest">Return to Tracker</Button>
          </CardContent>
       </Card>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 md:px-8">
      <div className="max-w-3xl mx-auto space-y-8">
        
        <AnimatePresence>
          {verified ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center p-12 bg-white rounded-[3rem] shadow-2xl shadow-teal-200 border-2 border-teal-100"
            >
               <div className="h-24 w-24 bg-teal-500 text-white rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-xl shadow-teal-300 animate-bounce">
                  <CheckCircle2 size={48} />
               </div>
               <h1 className="text-4xl font-black text-slate-900 mb-2 uppercase tracking-tighter">Resolution Verified</h1>
               <p className="text-slate-500 font-bold mb-8">Case closed successfully. Redirecting to your dashboard...</p>
               <Button onClick={() => router.push("/dashboard")} className="h-14 px-8 rounded-2xl bg-teal-600 font-black uppercase tracking-widest">Return to Dashboard</Button>
            </motion.div>
          ) : (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8 text-slate-950">
              
              <div className="flex items-center justify-between">
                 <Button variant="ghost" onClick={() => router.back()} className="rounded-xl font-bold gap-2 text-slate-500">
                    <ArrowLeft size={18} /> Back
                 </Button>
                 <div className="px-4 py-1.5 bg-blue-100 text-blue-700 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border border-blue-200">
                    Verification Needed
                 </div>
              </div>

              <div className="space-y-2">
                 <h1 className="text-5xl font-black tracking-tight uppercase leading-none">Review & Verify</h1>
                 <p className="text-slate-500 font-bold text-lg">Case #{(complaint.id || complaint._id || "").toString().slice(-8)} — {complaint.category}</p>
              </div>

              <div className="grid gap-8">
                 {/* Authority Evidence */}
                 <Card className="border-none shadow-2xl shadow-slate-200 rounded-[2.5rem] overflow-hidden">
                    <CardHeader className="bg-slate-900 text-white p-8">
                       <div className="flex items-center gap-3 mb-2">
                          <Building className="h-5 w-5 text-blue-400" />
                          <CardTitle className="text-xl font-black uppercase tracking-tighter">Authority Evidence</CardTitle>
                       </div>
                       <CardDescription className="text-slate-400 font-bold">Visual proof of work completed by municipal teams</CardDescription>
                    </CardHeader>
                    <CardContent className="p-8 space-y-8">
                       <div className="rounded-[2rem] overflow-hidden h-[350px] bg-slate-100 border-4 border-slate-50 shadow-inner">
                          <img 
                            src={complaint.resolvedImageUrl || complaint.imageUrl} 
                            className="w-full h-full object-cover" 
                            alt="Resolution Evidence" 
                          />
                       </div>
                       <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 relative">
                          <div className="absolute -top-3 left-6 px-3 py-1 bg-white border border-slate-100 rounded-full text-[10px] font-black uppercase text-slate-400">Resolution Note</div>
                          <p className="text-slate-800 font-medium italic leading-relaxed">"{complaint.resolutionNote || "Resolution handled according to municipal guidelines."}"</p>
                       </div>
                    </CardContent>
                 </Card>

                 {/* Verification Card */}
                 <Card className="border-none shadow-2xl shadow-blue-200/50 rounded-[2.5rem] overflow-hidden">
                    <CardHeader className="p-8 pb-0">
                       <CardTitle className="text-2xl font-black flex items-center gap-3">
                          <ShieldCheck className="h-8 w-8 text-blue-600" /> Citizen Confirmation
                       </CardTitle>
                    </CardHeader>
                    <CardContent className="p-8 space-y-6">
                       <p className="text-slate-600 font-bold leading-relaxed">
                          By clicking verify, you confirm that the reported issue has been satisfactorily resolved. 
                          This will officially close the case in the municipal registry.
                       </p>
                       <Button 
                         onClick={handleVerify}
                         disabled={verifyLoading}
                         className="w-full h-16 rounded-[1.5rem] text-lg font-black bg-blue-600 hover:bg-blue-700 shadow-xl shadow-blue-500/30 uppercase tracking-[0.2em] transition-all active:scale-[0.98]"
                       >
                         {verifyLoading ? <Loader2 className="animate-spin h-6 w-6" /> : "Verify & Close Case"}
                       </Button>
                       <p className="text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">
                          Secured Transaction — Verified Citizen Auth Required
                       </p>
                    </CardContent>
                 </Card>
              </div>

            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
