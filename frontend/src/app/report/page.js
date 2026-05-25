"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { MapPin, Mic, Image as ImageIcon, Sparkles, Upload, Loader2, X, Languages } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import dynamic from "next/dynamic";

const MapPicker = dynamic(() => import("@/components/ui/MapPicker"), { 
  ssr: false,
  loading: () => <div className="h-[350px] w-full bg-slate-100 animate-pulse rounded-2xl flex items-center justify-center text-slate-400 italic font-bold">Initializing Advanced Map Engine...</div>
});

const INDIAN_LANGUAGES = [
  { label: "English", code: "en-US" },
  { label: "Hindi (हिन्दी)", code: "hi-IN" },
  { label: "Telugu (తెలుగు)", code: "te-IN" },
  { label: "Marathi (मराठी)", code: "mr-IN" },
  { label: "Tamil (தமிழ்)", code: "ta-IN" },
  { label: "Kannada (ಕನ್ನಡ)", code: "kn-IN" },
  { label: "Bengali (বাংলা)", code: "bn-IN" }
];

export default function ReportIssue() {
  const router = useRouter();
  const fileInputRef = useRef(null);
  const recognitionRef = useRef(null);
  
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [locationData, setLocationData] = useState({
    lat: null,
    lng: null,
    address: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  // Voice State
  const [isListening, setIsListening] = useState(false);
  const [selectedLang, setSelectedLang] = useState("en-US");
  
  // Image State
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const handleEnhance = () => {
    if (!description) {
      setError("Please write a short description first.");
      return;
    }
    setIsEnhancing(true);
    setError("");
    setTimeout(() => {
      setDescription(`[AI Enhanced]: Based on the description: "${description}". Immediate repair and municipal intervention is required to prevent further damage and ensure commuter safety.`);
      setIsEnhancing(false);
    }, 1500);
  };

  const handleLocationSelect = (data) => {
    setLocationData(data);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    
    recognition.lang = selectedLang;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = (event) => {
      if (event.error !== 'aborted') {
        console.error("Speech Recognition Error:", event.error);
        setError(`Voice Error: ${event.error}`);
      }
      setIsListening(false);
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setDescription((prev) => prev ? prev + " " + transcript : transcript);
    };

    try {
      recognition.start();
    } catch (err) {
      console.error("Failed to start recognition:", err);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const handleSubmit = async () => {
    if (!description || !category || !locationData.address) {
      setError("Please fill all required fields (Map Location, Category, Description).");
      return;
    }

    setLoading(true);
    setError("");
    const token = localStorage.getItem("token");

    if (!token) {
      setError("You must be logged in to report an issue.");
      setLoading(false);
      return;
    }

    try {
      // In a real app, we would upload the image to Cloudinary/S3 here
      const res = await fetch("http://localhost:5000/api/complaints", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ 
          category, 
          description, 
          location: { 
            lat: locationData.lat,
            lng: locationData.lng,
            address: locationData.address 
          }, 
          imageUrl: imagePreview || "https://via.placeholder.com/400"
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to submit complaint");
      }

      router.push("/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4 py-8 md:p-8 max-w-3xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="border-none shadow-2xl shadow-slate-200/50 rounded-[2.5rem] overflow-hidden">
          <CardHeader className="bg-slate-900 text-white p-8 md:p-12">
            <div className="flex items-center gap-4 mb-2">
               <div className="p-3 bg-blue-600 rounded-2xl shadow-lg shadow-blue-500/20">
                  <MapPin className="h-6 w-6" />
               </div>
               <CardTitle className="text-3xl font-black uppercase tracking-tighter">Report Civic Issue</CardTitle>
            </div>
            <CardDescription className="text-slate-400 font-bold">
              Submit an issue in less than 30 seconds. Help us make our city better.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-8 md:p-12 space-y-10">
            
            {error && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="p-4 bg-red-50 border-2 border-red-100 text-red-600 rounded-2xl text-sm font-black flex items-center gap-3"
              >
                <XCircle size={18} /> {error}
              </motion.div>
            )}

            {/* Location Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                 <label className="text-xs font-black text-slate-400 uppercase tracking-widest">1. Issue Geography</label>
                 <span className="text-[10px] font-black bg-blue-50 text-blue-600 px-2 py-1 rounded-full uppercase">Required</span>
              </div>
              <MapPicker onLocationSelect={handleLocationSelect} initialLocation={locationData} />
            </div>

            {/* Category Section */}
            <div className="space-y-4">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest">2. Incident Category</label>
              <select 
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="flex h-14 w-full rounded-2xl border-2 border-slate-100 bg-slate-50 px-4 py-2 text-base font-bold text-slate-900 focus:outline-none focus:border-blue-500 transition-all appearance-none cursor-pointer">
                <option value="">Select Category</option>
                <option value="Drainage">Drainage Issue</option>
                <option value="Garbage">Garbage Issue</option>
                <option value="Road Damage">Road Damage / Potholes</option>
                <option value="Streetlight">Streetlight Problem</option>
                <option value="Water Leakage">Water Leakage</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* Description & AI Section */}
            <div className="space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest">3. Problem Intelligence</label>
                <div className="flex flex-wrap items-center gap-2">
                  <div className="flex items-center bg-white rounded-2xl px-4 h-12 border-2 border-slate-100 shadow-sm transition-all focus-within:border-blue-500">
                     <Languages size={18} className="text-blue-600 mr-3" />
                     <select 
                        value={selectedLang} 
                        onChange={(e) => setSelectedLang(e.target.value)}
                        className="bg-transparent text-sm font-bold text-slate-900 focus:outline-none cursor-pointer"
                     >
                        {INDIAN_LANGUAGES.map(lang => (
                           <option key={lang.code} value={lang.code}>{lang.label}</option>
                        ))}
                     </select>
                  </div>
                  <Button 
                    onClick={toggleListening}
                    variant={isListening ? "destructive" : "secondary"} 
                    className={`h-12 rounded-2xl px-6 font-black text-xs uppercase tracking-widest transition-all shadow-lg ${isListening ? "bg-red-500 text-white animate-pulse" : "bg-white text-slate-900 border-2 border-slate-100 hover:bg-slate-50"}`}
                  >
                    <Mic className={`h-4 w-4 ${isListening ? "mr-2 text-white" : "text-blue-600 mr-2"}`} /> 
                    {isListening ? "Recording..." : "Voice Input"}
                  </Button>
                  <Button 
                    variant="secondary" 
                    onClick={handleEnhance} 
                    disabled={isEnhancing} 
                    className="h-12 rounded-2xl px-6 font-black text-xs uppercase tracking-widest bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-100 shadow-sm"
                  >
                    <Sparkles className="mr-2 h-4 w-4" /> {isEnhancing ? 'Improving...' : 'Smart Fix'}
                  </Button>
                </div>
              </div>
              <Textarea 
                placeholder="Describe the issue in detail... use the mic for any Indian language." 
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="min-h-[150px] rounded-3xl border-2 border-slate-100 bg-slate-50 p-6 font-medium text-lg leading-relaxed focus:bg-white focus:border-blue-500 transition-all shadow-inner shadow-slate-100"
              />
            </div>

            {/* Image Upload Section */}
            <div className="space-y-4">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest">4. Visual Evidence</label>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleImageChange} 
                accept="image/*" 
                className="hidden" 
              />
              
              {!imagePreview ? (
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="border-4 border-dashed border-slate-100 rounded-[2rem] p-12 flex flex-col items-center justify-center text-slate-400 hover:bg-blue-50 hover:border-blue-200 transition-all cursor-pointer group shadow-inner shadow-slate-50"
                >
                  <div className="p-5 bg-white rounded-3xl shadow-xl shadow-slate-200/50 mb-4 group-hover:scale-110 group-hover:-rotate-3 transition-all">
                    <ImageIcon size={32} className="text-slate-400 group-hover:text-blue-600 transition-colors" />
                  </div>
                  <p className="text-lg font-black text-slate-900 mb-1">Upload Photo</p>
                  <p className="text-xs font-bold text-slate-400 text-center max-w-[200px]">Clear photos significantally reduce resolution time</p>
                </div>
              ) : (
                <div className="relative rounded-[2rem] overflow-hidden h-[300px] border-4 border-white shadow-2xl group">
                   <img src={imagePreview} className="w-full h-full object-cover" alt="Preview" />
                   <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Button 
                        variant="destructive" 
                        size="icon" 
                        className="rounded-full h-12 w-12"
                        onClick={() => { setImagePreview(null); setSelectedImage(null); }}
                      >
                         <X size={24} />
                      </Button>
                   </div>
                </div>
              )}
            </div>

          </CardContent>
          <CardFooter className="p-8 md:p-12 md:pt-0">
            <Button 
              size="lg" 
              className="w-full h-16 rounded-[1.5rem] text-lg font-black uppercase tracking-[0.2em] shadow-2xl shadow-blue-500/40 bg-blue-600 hover:bg-blue-700 active:scale-[0.98] transition-all" 
              onClick={handleSubmit} 
              disabled={loading}
            >
              {loading ? <><Loader2 className="mr-3 h-6 w-6 animate-spin" /> Transmitting...</> : "Submit Complaint"}
            </Button>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
}

function XCircle(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="m15 9-6 6" />
      <path d="m9 9 6 6" />
    </svg>
  );
}
