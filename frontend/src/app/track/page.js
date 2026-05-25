"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Search, MapPin, Building, Calendar, ArrowRightCircle } from "lucide-react";
import { motion } from "framer-motion";

function TrackComplaintInner() {
  const searchParams = useSearchParams();
  const initialId = searchParams.get("id") || "";
  
  const [complaintId, setComplaintId] = useState(initialId);
  const [isSearching, setIsSearching] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (initialId) {
      handleSearch(initialId);
    }
  }, [initialId]);

  const handleSearch = async (idToSearch = complaintId) => {
    if (!idToSearch) return;
    setIsSearching(true);
    setError("");
    setResult(null);

    try {
      const res = await fetch(`http://localhost:5000/api/complaints/${idToSearch}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Complaint not found");
      }
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="container mx-auto p-4 py-8 md:p-8 max-w-2xl min-h-[calc(100vh-4rem)]">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl font-bold">Track Your Complaint</CardTitle>
            <CardDescription>
              Enter your Complaint Reference ID to get real-time status details.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && <div className="text-red-500 text-sm mb-4 bg-red-50 p-3 rounded-xl">{error}</div>}
            <div className="flex gap-2">
              <Input 
                placeholder="e.g. 101" 
                value={complaintId}
                onChange={(e) => setComplaintId(e.target.value)}
              />
              <Button onClick={() => handleSearch(complaintId)} disabled={isSearching} className="w-32">
                {isSearching ? 'Searching...' : <><Search className="mr-2 h-4 w-4" /> Track</>}
              </Button>
            </div>
          </CardContent>
        </Card>

        {result && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <Card className="border-t-4 border-t-teal-500">
              <CardHeader className="pb-4">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="mb-1 text-slate-500 text-sm font-mono tracking-wider">ID: {result.id || result._id}</CardTitle>
                    <h3 className="text-xl font-bold">{result.category}</h3>
                  </div>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold
                    ${result.status === 'Resolved' ? 'bg-teal-100 text-teal-800' : 
                      result.status === 'Verification Pending' ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                      result.status === 'Pending' ? 'bg-orange-100 text-orange-800' : 
                        'bg-blue-100 text-blue-800'}`}>
                    {result.status}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2 bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl">
                  <div className="space-y-1">
                    <span className="text-xs font-semibold text-slate-500 uppercase">Assigned Authority</span>
                    <div className="flex items-center font-medium">
                      <Building className="mr-2 h-4 w-4 text-slate-400" />
                      {result.assignedTo ? result.assignedTo.name : "Unassigned"}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs font-semibold text-slate-500 uppercase">Reported On</span>
                    <div className="flex items-center font-medium">
                      <Calendar className="mr-2 h-4 w-4 text-slate-400" />
                      {new Date(result.createdAt).toLocaleString()}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-semibold text-slate-900 dark:text-slate-50">Description</h4>
                  <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                    {result.description}
                  </p>
                </div>
                
                {result.aiEnhancedDescription && (
                  <div className="space-y-2">
                    <h4 className="font-semibold text-slate-900 dark:text-slate-50">AI Enhanced Details</h4>
                    <p className="text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/20 p-3 rounded-xl border border-blue-100 dark:border-blue-900/50 text-sm leading-relaxed">
                      {result.aiEnhancedDescription}
                    </p>
                  </div>
                )}

                {result.resolutionNote && (
                  <div className="space-y-2 pt-4 border-t border-slate-200 dark:border-slate-800">
                    <h4 className="font-semibold text-teal-700 dark:text-teal-400 flex items-center">
                      Resolution Note
                    </h4>
                    <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed bg-teal-50 dark:bg-teal-900/10 p-3 rounded-xl">
                      {result.resolutionNote}
                    </p>
                  </div>
                )}

              </CardContent>
            </Card>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}

export default function TrackComplaint() {
  return (
    <Suspense fallback={<div className="container mx-auto p-8 text-center text-slate-500">Loading tracker...</div>}>
      <TrackComplaintInner />
    </Suspense>
  );
}
