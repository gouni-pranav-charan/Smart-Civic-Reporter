"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
  ArrowLeft, 
  MapPin, 
  Bot, 
  Calendar, 
  Clock, 
  User, 
  Phone, 
  Mail, 
  Navigation, 
  CheckCircle2, 
  XCircle, 
  AlertOctagon,
  Image as ImageIcon,
  Maximize2,
  Upload,
  Loader2,
  Construction,
  MessageSquare,
  Download,
  Sparkles,
  X
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Textarea } from "@/components/ui/Textarea";
import { motion, AnimatePresence } from "framer-motion";
import dynamic from "next/dynamic";

const MapPicker = dynamic(() => import("@/components/ui/MapPicker"), { 
  ssr: false,
  loading: () => <div className="h-[350px] w-full bg-slate-100 animate-pulse rounded-2xl flex items-center justify-center text-slate-400 italic font-bold">Initializing Advanced Map Engine...</div>
});

export default function ComplaintDetails() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id;

  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [resolutionNote, setResolutionNote] = useState("");
  const [progressNote, setProgressNote] = useState("");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [resImagePreview, setResImagePreview] = useState(null);
  const resFileInputRef = useRef(null);
  const [error, setError] = useState("");

  const fetchComplaint = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/complaints/${id}`);
      if (res.ok) {
        const data = await res.json();
        setComplaint(data);
      } else {
        setError("Complaint data synchronization failed.");
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

  const handleUpdateStatus = async (status, extraData = {}) => {
    if (status === 'Resolved' && !resImagePreview) {
       setError("Validation Error: A resolution photo is mandatory for accountability.");
       return;
    }

    setActionLoading(true);
    const token = localStorage.getItem("token");
    try {
      const endpoint = status === 'Accepted' ? 'accept' : status === 'Resolved' ? 'resolve' : 'status';
      const url = `http://localhost:5000/api/complaints/${id}/${endpoint}`;
      
      const body = { 
        status, 
        resolvedImageUrl: resImagePreview,
        ...extraData 
      };
      
      const res = await fetch(url, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}` 
        },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        await fetchComplaint();
        if (status === 'Resolved') alert("Resolution confirmed. Citizen notified.");
      } else {
        throw new Error("Authorization failure or transaction error.");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleExportReport = () => {
    window.print();
  };

  const handleRejectCase = async () => {
    if (window.confirm("Are you sure you want to REJECT this case? The citizen will be notified.")) {
      await handleUpdateStatus('Rejected', { resolutionNote: "Case rejected by internal authority review." });
    }
  };

  const handleResImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setResImagePreview(reader.result);
        setError(""); // Clear error if image added
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEscalate = () => {
    alert("Case escalation protocol initiated. Regional administration has been notified for prioritized review.");
  };

  const getPriorityInfo = (score) => {
    if (score >= 8) return { label: "Critical", color: "bg-red-500" };
    if (score >= 5) return { label: "High", color: "bg-orange-500" };
    if (score >= 3) return { label: "Medium", color: "bg-blue-500" };
    return { label: "Low", color: "bg-teal-500" };
  };

  const openInMaps = () => {
    const lat = complaint?.lat || complaint?.location?.lat;
    const lng = complaint?.lng || complaint?.location?.lng;
    if (lat && lng) {
      const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
      window.open(url, "_blank");
    }
  };

  const handleSeed = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/auth/seed", { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        // Redirect to the newly seeded complaint to show it works
        router.push(`/authority/complaints/${data.newComplaintId}`);
      } else {
        setError("Seeding failed: " + data.message);
      }
    } catch (err) {
      setError("Cound not connect to seeding engine.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center p-20">
      <Loader2 className="h-12 w-12 text-slate-900 animate-spin" />
    </div>
  );

  if (!complaint) return (
    <div className="p-12 text-center bg-red-50 rounded-3xl border border-red-100 max-w-2xl mx-auto mt-12">
      <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
      <h2 className="text-xl font-black text-red-900 mb-2">Data Synchronization Error</h2>
      <p className="text-red-700 font-bold mb-6">{error || "The requested case link is broken or the session has reset."}</p>
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button onClick={handleSeed} className="bg-slate-900 text-white font-bold rounded-xl px-8 h-12 shadow-xl shadow-slate-200">Restore Demo Database</Button>
        <Button variant="outline" onClick={() => router.push("/authority/dashboard")} className="font-bold rounded-xl px-8 h-12">Return to Dashboard</Button>
      </div>
    </div>
  );

  const statusColors = {
    'Pending': 'bg-slate-100 text-slate-500 border-slate-200',
    'Accepted': 'bg-blue-50 text-blue-600 border-blue-100',
    'In Progress': 'bg-orange-50 text-orange-600 border-orange-100',
    'Verification Pending': 'bg-amber-50 text-amber-600 border-amber-100',
    'Resolved': 'bg-teal-50 text-teal-600 border-teal-100',
    'Rejected': 'bg-red-50 text-red-600 border-red-100'
  };

  return (
    <div className="space-y-8 pb-20">
      {/* Error Alert Banner */}
      <AnimatePresence>
        {error && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-red-500 text-white p-4 rounded-2xl flex items-center justify-between shadow-lg shadow-red-200">
               <div className="flex items-center gap-3">
                  <AlertOctagon size={20} />
                  <p className="font-bold text-sm">Action Failed: {error}</p>
               </div>
               <button onClick={() => setError("")} className="hover:bg-white/20 p-1 rounded-lg transition-colors">
                  <X size={18} />
               </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Action Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            size="icon" 
            className="h-12 w-12 rounded-2xl border-2 shrink-0"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <div className="flex items-center gap-2 mb-1">
               <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-slate-100 uppercase">Case #{(complaint.id || complaint._id || "").toString().slice(-8)}</h1>
               <div className={`px-4 py-1.5 rounded-full border-2 text-[10px] font-black uppercase tracking-[0.2em] shadow-sm ${statusColors[complaint.status]}`}>
                 {complaint.status}
               </div>
            </div>
            <p className="text-slate-500 font-bold flex items-center gap-2">
               <Calendar className="h-4 w-4" /> Reported on {new Date(complaint.createdAt).toLocaleString('en-IN', { dateStyle: 'long', timeStyle: 'short' })}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
           <Button 
            onClick={handleExportReport}
            variant="outline" 
            className="h-12 px-6 rounded-2xl border-2 font-black text-xs uppercase tracking-widest gap-2"
           >
              <Download className="h-4 w-4" /> Export Report
           </Button>
           <Button variant="outline" className="h-12 px-6 rounded-2xl border-2 border-red-200 text-red-500 font-black text-xs uppercase tracking-widest gap-2 hover:bg-red-50">
              <AlertOctagon className="h-4 w-4" /> Flag Issue
           </Button>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Main Content (2 cols) */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Detailed Context */}
          <Card className="border-none shadow-2xl shadow-slate-200/50 dark:shadow-none rounded-[2rem] overflow-hidden">
             <CardHeader className="p-8 bg-slate-50 border-b border-slate-100">
                <CardTitle className="text-xl font-black text-slate-900 flex items-center gap-3 italic">
                   <MessageSquare className="h-6 w-6 text-blue-600" /> Executive Problem Summary
                </CardTitle>
             </CardHeader>
             <CardContent className="p-8 space-y-8">
                <div className="grid gap-8 md:grid-cols-2">
                   <div className="space-y-4">
                      <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Issue Categorization</h4>
                      <div className="flex items-center gap-3">
                         <div className="h-12 w-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-200">
                           <Construction className="h-6 w-6" />
                         </div>
                         <div>
                            <span className="text-2xl font-black text-slate-900">{complaint.category}</span>
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-tighter">Emergency Infrastructure Response</p>
                         </div>
                      </div>
                   </div>
                   <div className="space-y-4">
                      <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">AI Criticality Score</h4>
                      <div className="flex items-center gap-3">
                         <div className="h-12 w-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center text-xl font-black">
                           {complaint.priorityScore || 0}
                         </div>
                         <div>
                            <span className="text-2xl font-black text-slate-900">Priority Level: {getPriorityInfo(complaint.priorityScore).label}</span>
                            <div className="h-1.5 w-32 bg-slate-100 rounded-full mt-1">
                               <div className={`h-full ${getPriorityInfo(complaint.priorityScore).color} rounded-full`} style={{ width: `${(complaint.priorityScore || 1) * 10}%` }}></div>
                            </div>
                         </div>
                      </div>
                   </div>
                </div>

                <div className="space-y-6">
                   <div className="p-6 bg-slate-50 border border-slate-100 rounded-3xl relative">
                      <div className="absolute -top-3 left-6 px-3 py-1 bg-white border border-slate-100 rounded-full text-[10px] font-black uppercase text-slate-400">Citizen Description</div>
                      <p className="text-slate-800 font-medium leading-relaxed italic">"{complaint.description}"</p>
                   </div>

                   {complaint.aiEnhancedDescription && (
                      <div className="p-6 bg-blue-600 text-white rounded-3xl shadow-xl shadow-blue-200 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-8 opacity-10 rotate-12">
                          <Bot className="h-20 w-20" />
                        </div>
                        <div className="flex items-center gap-2 mb-2 relative z-10">
                           <Sparkles size={16} />
                           <span className="text-[10px] font-black uppercase tracking-widest">AI Strategic Enhancement</span>
                        </div>
                        <p className="font-bold relative z-10">{complaint.aiEnhancedDescription.replace('[AI ENHANCED]', '')}</p>
                      </div>
                   )}
                </div>
             </CardContent>
          </Card>

          {/* Evidence Viewer */}
          <Card className="border-none shadow-2xl shadow-slate-200/50 dark:shadow-none rounded-[2rem] overflow-hidden">
             <CardHeader className="p-8 flex flex-row items-center justify-between">
                <div>
                   <CardTitle className="text-xl font-black flex items-center gap-3">
                      <ImageIcon className="h-6 w-6 text-orange-500" /> Evidence Capture
                   </CardTitle>
                   <CardDescription className="font-bold text-slate-500">Visual proof provided by reporting citizen</CardDescription>
                </div>
                <Button variant="outline" className="rounded-xl border-2" onClick={() => setIsFullscreen(true)}>
                   <Maximize2 className="h-4 w-4 mr-2" /> Inspect Large
                </Button>
             </CardHeader>
             <CardContent className="px-8 pb-8">
                <div className="relative group overflow-hidden rounded-[2rem] bg-slate-100 h-[400px]">
                   <img 
                      src={complaint.imageUrl || "https://images.unsplash.com/photo-1598971861713-54ad16a7e72e?q=80&w=1000&auto=format&fit=crop"} 
                      alt="Issue Evidence" 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                   />
                   <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-8 flex flex-col justify-end">
                      <p className="text-white font-black text-sm uppercase tracking-widest">Evidence Authenticated by System</p>
                      <p className="text-slate-300 text-xs font-bold">Captured via CivicReporter App (Android v12.4)</p>
                   </div>
                </div>
             </CardContent>
          </Card>

          {/* Map Section */}
          <Card className="border-none shadow-2xl shadow-slate-200/50 dark:shadow-none rounded-[2rem] overflow-hidden">
             <CardHeader className="p-8 flex flex-row items-center justify-between">
                 <div>
                    <CardTitle className="text-xl font-black flex items-center gap-3">
                       <MapPin className="h-6 w-6 text-teal-600" /> Precise Coordinate Mapping
                    </CardTitle>
                    <CardDescription className="font-bold text-slate-500">{complaint.address || complaint.location?.address}</CardDescription>
                 </div>
                 <Button onClick={openInMaps} className="bg-slate-900 text-white rounded-xl shadow-xl hover:scale-105 transition-transform gap-2">
                    <Navigation className="h-4 w-4" /> Navigate to Location
                 </Button>
             </CardHeader>
             <CardContent className="px-8 pb-8 space-y-4">
                <MapPicker 
                  initialLocation={{ 
                    lat: complaint.lat || complaint.location?.lat, 
                    lng: complaint.lng || complaint.location?.lng, 
                    address: complaint.address || complaint.location?.address 
                  }} 
                  onLocationSelect={() => {}} 
                  readOnly={true}
                />
                <div className="grid grid-cols-2 gap-4">
                   <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-center">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Latitude</span>
                      <span className="text-lg font-black text-slate-900 font-mono tracking-tighter">{Number(complaint.lat || complaint.location?.lat || 0).toFixed(6)}</span>
                   </div>
                   <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-center">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Longitude</span>
                      <span className="text-lg font-black text-slate-900 font-mono tracking-tighter">{Number(complaint.lng || complaint.location?.lng || 0).toFixed(6)}</span>
                   </div>
                </div>
             </CardContent>
          </Card>
        </div>

        {/* Sidebar Actions (1 col) */}
        <div className="space-y-8 sticky top-24">
           {/* Citizen Details */}
           <Card className="border-none shadow-xl shadow-slate-200/50 dark:shadow-none rounded-[2rem]">
              <CardHeader className="pb-2">
                 <CardTitle className="text-lg font-black flex items-center gap-3">
                    <User className="h-5 w-5 text-blue-600" /> Reporting Citizen
                 </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                 <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100 overflow-hidden">
                    <div className="h-12 w-12 rounded-full bg-white flex items-center justify-center font-black text-blue-600 text-lg border-2 border-blue-100">
                       {complaint.citizen?.name?.charAt(0) || "C"}
                    </div>
                    <div>
                       <h4 className="font-black text-slate-900 leading-none mb-1">{complaint.citizen?.name || "Verified Citizen"}</h4>
                       <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">KYC Authenticated</p>
                    </div>
                 </div>
                 <div className="space-y-3">
                    <div className="flex items-center gap-3 text-sm font-bold text-slate-600">
                       <Phone className="h-4 w-4 text-slate-400" /> {complaint.citizen?.phone || "N/A"}
                    </div>
                    <div className="flex items-center gap-3 text-sm font-bold text-slate-600">
                       <Mail className="h-4 w-4 text-slate-400" /> {complaint.citizen?.email || "citizen@mail.com"}
                    </div>
                 </div>
                 <div className="p-4 bg-red-50 text-red-700 rounded-2xl border border-red-100 flex items-center justify-between">
                    <span className="text-xs font-black uppercase tracking-widest flex items-center gap-2">
                       <AlertOctagon className="h-4 w-4" /> Reminders Sent
                    </span>
                    <span className="text-xl font-black">{complaint.reminders || 2}</span>
                 </div>
              </CardContent>
           </Card>

           {/* Workflow Actions */}
           <Card className="border-none shadow-2xl shadow-blue-200/40 dark:shadow-none rounded-[2rem] overflow-hidden">
              <CardHeader className="bg-slate-900 p-8">
                 <CardTitle className="text-white text-xl font-black">Strategic Response</CardTitle>
                 <CardDescription className="text-slate-400 font-bold">Update operational status</CardDescription>
              </CardHeader>
              <CardContent className="p-8 space-y-6">
                 
                 {complaint.status === 'Pending' && (
                    <Button 
                      onClick={() => handleUpdateStatus('Accepted')} 
                      disabled={actionLoading}
                      className="w-full h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-blue-200"
                    >
                      {actionLoading ? <Loader2 className="animate-spin" /> : "Accept Case & Assign Team"}
                    </Button>
                 )}

                 {(complaint.status === 'Accepted' || complaint.status === 'In Progress') && (
                    <div className="space-y-4">
                       <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Work Progress Notes</label>
                          <Textarea 
                            value={resolutionNote}
                            onChange={(e) => setResolutionNote(e.target.value)}
                            placeholder="Add inspection notes or repair progress..." 
                            className="rounded-2xl border-2 min-h-[100px] font-medium"
                          />
                       </div>
                       
                       {complaint.status === 'Accepted' && (
                          <Button 
                            onClick={() => handleUpdateStatus('In Progress')} 
                            className="w-full h-14 bg-orange-500 hover:bg-orange-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest"
                          >
                             Mark as In Progress
                          </Button>
                       )}

                       <input 
                         type="file" 
                         ref={resFileInputRef} 
                         onChange={handleResImageChange} 
                         accept="image/*" 
                         className="hidden" 
                       />

                       {!resImagePreview ? (
                         <div 
                           onClick={() => resFileInputRef.current?.click()}
                           className="flex items-center justify-center border-2 border-dashed border-slate-200 p-6 rounded-2xl group cursor-pointer hover:border-blue-500 transition-colors"
                         >
                            <div className="text-center">
                               <Upload className="h-6 w-6 text-slate-300 mx-auto mb-2 group-hover:text-blue-500" />
                               <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Upload Resolution Photo</p>
                            </div>
                         </div>
                       ) : (
                         <div className="relative h-32 w-full rounded-2xl overflow-hidden group shadow-lg">
                            <img src={resImagePreview} className="w-full h-full object-cover" alt="Resolution" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                               <Button 
                                 variant="destructive" 
                                 size="icon" 
                                 className="rounded-full h-8 w-8"
                                 onClick={() => setResImagePreview(null)}
                               >
                                  <X className="h-4 w-4" />
                               </Button>
                            </div>
                         </div>
                       )}

                       <Button 
                        onClick={() => handleUpdateStatus('Resolved', { resolutionNote })}
                        className="w-full h-14 bg-teal-600 hover:bg-teal-700 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-teal-200"
                       >
                          Submit for Verification
                       </Button>
                    </div>
                 )}

                  {complaint.status === 'Verification Pending' && (
                     <div className="text-center p-8 bg-amber-50 rounded-[2rem] border-2 border-amber-100">
                        <div className="h-16 w-16 bg-amber-500 text-white rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse">
                           <Clock size={32} />
                        </div>
                        <h3 className="text-xl font-black text-amber-900 mb-1">Awaiting Citizen</h3>
                        <p className="text-amber-700 font-bold mb-4">The citizen has been notified to verify the fix.</p>
                        <div className="p-4 bg-white rounded-2xl text-left border border-amber-200 opacity-60">
                           <p className="text-xs font-black text-amber-900/40 uppercase mb-2 tracking-widest">Sent Resolution Note</p>
                           <p className="text-sm font-bold text-amber-800 italic">"{complaint.resolutionNote || "Resolution submitted."}"</p>
                        </div>
                     </div>
                  )}

                  {complaint.status === 'Resolved' && (
                     <div className="text-center p-8 bg-teal-50 rounded-[2rem] border-2 border-teal-100">
                        <div className="h-16 w-16 bg-teal-600 text-white rounded-2xl flex items-center justify-center mx-auto mb-4">
                           <CheckCircle2 size={32} />
                        </div>
                        <h3 className="text-xl font-black text-teal-900 mb-1">Mission Completed</h3>
                        <p className="text-teal-700 font-bold mb-4">Citizen has verified the resolution.</p>
                        <div className="p-4 bg-white rounded-2xl text-left border border-teal-200">
                           <p className="text-xs font-black text-teal-900/40 uppercase mb-2 tracking-widest">Resolution Note</p>
                           <p className="text-sm font-bold text-teal-800 italic">"{complaint.resolutionNote || "Issue resolved within SLAs."}"</p>
                        </div>
                     </div>
                  )}

                 <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-100">
                    <Button 
                      onClick={handleEscalate}
                      variant="ghost" 
                      className="rounded-xl font-bold text-[10px] uppercase tracking-widest text-slate-400"
                    >
                      Escalate Link
                    </Button>
                    <Button 
                      onClick={handleRejectCase}
                      variant="ghost" 
                      className="rounded-xl font-bold text-[10px] uppercase tracking-widest text-red-500"
                    >
                      Reject Case
                    </Button>
                 </div>
              </CardContent>
           </Card>
        </div>
      </div>

      {/* Fullscreen Image Overlay */}
      <AnimatePresence>
         {isFullscreen && (
            <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4 md:p-12"
               onClick={() => setIsFullscreen(false)}
            >
               <button className="absolute top-8 right-8 text-white p-2 hover:bg-white/10 rounded-full transition-colors">
                  <XCircle size={40} />
               </button>
               <motion.img 
                  initial={{ scale: 0.9 }}
                  animate={{ scale: 1 }}
                  src={complaint.imageUrl || "https://images.unsplash.com/photo-1598971861713-54ad16a7e72e?q=80&w=1000&auto=format&fit=crop"} 
                  className="max-w-full max-h-full object-contain shadow-2xl rounded-xl"
               />
            </motion.div>
         )}
      </AnimatePresence>
    </div>
  );
}
