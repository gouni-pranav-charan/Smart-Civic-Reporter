"use client";

import { useEffect, useState, useMemo, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { 
  Search, 
  Filter, 
  MapPin, 
  Calendar, 
  AlertOctagon, 
  ChevronRight,
  MoreVertical,
  Download,
  Terminal
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

function ComplaintsTableContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialStatus = searchParams.get("status") || "all";
  const initialPriority = searchParams.get("priority") || "all";

  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState(initialStatus);
  const [priorityFilter, setPriorityFilter] = useState(initialPriority);
  const [categoryFilter, setCategoryFilter] = useState("all");

  // Sync state with URL query parameters for sidebar navigation
  useEffect(() => {
    const status = searchParams.get("status") || "all";
    const priority = searchParams.get("priority") || "all";
    setStatusFilter(status);
    setPriorityFilter(priority);
  }, [searchParams]);

  useEffect(() => {
    const fetchComplaints = async () => {
      const token = localStorage.getItem("token");
      try {
        const res = await fetch("http://localhost:5000/api/complaints", {
          headers: { "Authorization": `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setComplaints(data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchComplaints();
  }, []);

  const filteredComplaints = useMemo(() => {
    return complaints.filter(c => {
      const matchesSearch = (c.id || c._id || "").toString().toLowerCase().includes(searchTerm.toLowerCase()) || 
                            c.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            (c.address || c.location?.address)?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === "all" || c.status === statusFilter;
      const matchesCategory = categoryFilter === "all" || c.category === categoryFilter;
      
      let matchesPriority = true;
      if (priorityFilter === "high") {
        matchesPriority = (c.priorityScore || 0) >= 8;
      }

      return matchesSearch && matchesStatus && matchesCategory && matchesPriority;
    });
  }, [complaints, searchTerm, statusFilter, categoryFilter, priorityFilter]);

  const getPriorityInfo = (item) => {
    // Logic: severity (mock) + reminders + days pending
    const score = item.priorityScore || 0;
    const reminders = item.reminders || 0;
    const daysPending = Math.floor((new Date() - new Date(item.createdAt)) / (1000 * 60 * 60 * 24));
    
    const totalScore = score + (reminders * 2) + Math.min(daysPending, 5);
    
    if (totalScore >= 8) return { label: "High Priority", color: "bg-red-50 text-red-600 border-red-100", dot: "bg-red-500" };
    if (totalScore >= 5) return { label: "Medium", color: "bg-orange-50 text-orange-600 border-orange-100", dot: "bg-orange-500" };
    return { label: "Low", color: "bg-teal-50 text-teal-600 border-teal-100", dot: "bg-teal-500" };
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Complaint Management</h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium">Monitoring {complaints.length} issues across Hyderabad</p>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <Button variant="outline" className="gap-2 h-11 rounded-xl border-2 flex-1 md:flex-none">
            <Download className="h-4 w-4" /> Export Data
          </Button>
          <Button className="gap-2 bg-slate-900 text-white h-11 rounded-xl shadow-lg flex-1 md:flex-none">
             Latest Alerts
          </Button>
        </div>
      </div>

      {/* Filters & Search */}
      <Card className="border-none shadow-xl shadow-slate-200/50 dark:shadow-none bg-white dark:bg-slate-900 overflow-visible">
        <CardContent className="p-4 flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <Input 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by Complaint ID, Category, or Landmark..." 
              className="pl-12 h-12 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-blue-600 transition-all font-medium"
            />
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 px-4 h-12 rounded-2xl bg-slate-50 dark:bg-slate-800 text-sm font-bold text-slate-500">
               <Filter className="h-4 w-4" /> Filters:
            </div>
            
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-12 w-40 px-4 rounded-2xl bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-800 text-sm font-bold focus:outline-none focus:border-blue-600 transition-colors"
            >
              <option value="all">Any Status</option>
              <option value="Pending">Pending</option>
              <option value="Accepted">Accepted</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
              <option value="Rejected">Rejected</option>
            </select>

            <select 
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="h-12 w-48 px-4 rounded-2xl bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-800 text-sm font-bold focus:outline-none focus:border-blue-600 transition-colors"
            >
              <option value="all">All Categories</option>
              <option value="Drainage">Drainage Leaks</option>
              <option value="Garbage">Garbage Issues</option>
              <option value="Road Damage">Road Damage</option>
              <option value="Streetlight">Streetlight Issues</option>
              <option value="Water Leakage">Water Leaks</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Complaints Table */}
      <Card className="border-none shadow-2xl shadow-slate-200/50 dark:shadow-none overflow-hidden rounded-3xl group">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">ID & References</th>
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Issue Category</th>
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Precise Location</th>
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Priority Level</th>
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Status</th>
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-20 text-center text-slate-500 font-bold animate-pulse">Synchronizing Fleet Data...</td>
                </tr>
              ) : filteredComplaints.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-20 text-center text-slate-500 font-bold">No complaints found matching your filters.</td>
                </tr>
              ) : (
                filteredComplaints.map((item, i) => {
                  const priority = getPriorityInfo(item);
                  return (
                    <motion.tr 
                      key={item.id || item._id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.05 }}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors group/row cursor-pointer"
                      onClick={() => router.push(`/authority/complaints/${item.id || item._id}`)}
                    >
                      <td className="px-6 py-5">
                        <div className="flex flex-col">
                          <span className="text-sm font-black text-slate-900 dark:text-slate-100 font-mono">
                            #{(item.id || item._id || "").toString().slice(-8).toUpperCase()}
                          </span>
                          <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                             <Calendar className="h-2.5 w-2.5" /> {new Date(item.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                           <div className="h-10 w-10 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 flex items-center justify-center shrink-0">
                              <Terminal className="h-5 w-5" />
                           </div>
                           <span className="text-sm font-bold text-slate-900 dark:text-slate-100">{item.category}</span>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex flex-col max-w-[200px]">
                           <span className="text-sm font-bold text-slate-700 dark:text-slate-300 truncate">{(item.address || item.location?.address)?.split(',')[0]}</span>
                           <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1 uppercase tracking-tighter">
                              <MapPin className="h-2.5 w-2.5" /> {(item.address || item.location?.address)?.split(',')[1] || "Hyderabad"}
                           </span>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border ${priority.color} text-xs font-black uppercase tracking-widest`}>
                          <div className={`h-1.5 w-1.5 rounded-full ${priority.dot} animate-pulse`}></div>
                          {priority.label}
                        </div>
                      </td>
                      <td className="px-6 py-5">
                         <span className={`inline-flex items-center px-4 py-1.5 rounded-2xl text-[10px] font-black uppercase tracking-widest border-2
                          ${item.status === 'Resolved' ? 'bg-teal-50 text-teal-600 border-teal-100' : 
                            item.status === 'Accepted' ? 'bg-blue-50 text-blue-600 border-blue-100' : 
                            item.status === 'In Progress' ? 'bg-orange-50 text-orange-600 border-orange-100' :
                              'bg-slate-50 text-slate-500 border-slate-100'}`}>
                          {item.status}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover/row:opacity-100 transition-opacity">
                           <Button variant="ghost" size="icon" className="h-10 w-10 p-0 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700">
                              <MoreVertical className="h-4 w-4 text-slate-400" />
                           </Button>
                           <Button className="h-10 w-10 p-0 rounded-xl bg-slate-900 text-white flex items-center justify-center">
                              <ChevronRight className="h-5 w-5" />
                           </Button>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        <div className="p-4 bg-slate-50/50 dark:bg-slate-800/20 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
           <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Showing {filteredComplaints.length} Records</span>
           <div className="flex items-center gap-2">
              <Button variant="ghost" className="h-8 text-xs font-bold disabled:opacity-30" disabled>Previous</Button>
              <Button variant="ghost" className="h-8 text-xs font-bold disabled:opacity-30" disabled>Next</Button>
           </div>
        </div>
      </Card>
    </div>
  );
}

export default function ComplaintsManagement() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-500">Loading complaints...</div>}>
      <ComplaintsTableContent />
    </Suspense>
  );
}
