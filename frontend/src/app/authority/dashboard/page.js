"use client";

import { useEffect, useState } from "react";
import { 
  ListTodo, 
  AlertOctagon, 
  Clock, 
  CheckCircle2, 
  ArrowRight,
  TrendingUp,
  MapPin,
  Calendar,
  BarChart3,
  ShieldCheck
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { motion } from "framer-motion";
import Link from "next/link";

export default function AuthorityDashboard() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

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

  const stats = [
    { 
      title: "New Complaints", 
      count: complaints.filter(c => c.status === "Pending").length, 
      desc: "Awaiting review", 
      icon: ListTodo, 
      color: "blue",
      href: "/authority/complaints?status=Pending"
    },
    { 
      title: "High Priority", 
      count: complaints.filter(c => c.priorityScore >= 8 && c.status === "Pending").length, 
      desc: "Critical issues", 
      icon: AlertOctagon, 
      color: "red",
      href: "/authority/complaints?priority=high&status=Pending"
    },
    { 
      title: "In Progress", 
      count: complaints.filter(c => c.status === "Accepted" || c.status === "In Progress").length, 
      desc: "Currently fixing", 
      icon: Clock, 
      color: "orange",
      href: "/authority/complaints?status=In Progress"
    },
    { 
      title: "Resolved Today", 
      count: complaints.filter(c => {
        const today = new Date().toDateString();
        return c.status === "Resolved" && new Date(c.updatedAt).toDateString() === today;
      }).length, 
      desc: "Efficiency up", 
      icon: CheckCircle2, 
      color: "teal",
      href: "/authority/complaints?status=Resolved"
    },
  ];

  const recentHighPriority = complaints
    .filter(c => c.priorityScore >= 8 && c.status === "Pending")
    .slice(0, 3);

  const colorMaps = {
    blue: { bg: "bg-blue-50", darkBg: "dark:bg-blue-900/20", text: "text-blue-600", darkText: "dark:text-blue-400", border: "bg-blue-500", bar: "bg-blue-500/10" },
    red: { bg: "bg-red-50", darkBg: "dark:bg-red-900/20", text: "text-red-600", darkText: "dark:text-red-400", border: "bg-red-500", bar: "bg-red-500/10" },
    orange: { bg: "bg-orange-50", darkBg: "dark:bg-orange-900/20", text: "text-orange-600", darkText: "dark:text-orange-400", border: "bg-orange-500", bar: "bg-orange-500/10" },
    amber: { bg: "bg-amber-50", darkBg: "dark:bg-amber-900/20", text: "text-amber-600", darkText: "dark:text-amber-400", border: "bg-amber-500", bar: "bg-amber-500/10" },
    teal: { bg: "bg-teal-50", darkBg: "dark:bg-teal-900/20", text: "text-teal-600", darkText: "dark:text-teal-400", border: "bg-teal-500", bar: "bg-teal-500/10" }
  };

  if (loading) return <div className="p-8 text-center text-slate-500 animate-pulse font-medium">Loading Dashboard Data...</div>;

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Executive Overview</h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium">Performance summary for Hyderabad Central Zone</p>
        </div>
        <div className="bg-slate-900 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-xl shadow-slate-200 dark:shadow-none flex items-center gap-2">
          <TrendingUp className="h-4 w-4" />
          System Efficiency: 94%
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, i) => {
          const colors = colorMaps[stat.color];
          return (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Link href={stat.href}>
                <Card className="hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border-none bg-white dark:bg-slate-900 shadow-sm overflow-hidden group cursor-pointer">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className={`p-3 rounded-2xl ${colors.bg} ${colors.darkBg} ${colors.text} ${colors.darkText} group-hover:scale-110 transition-transform`}>
                        <stat.icon className="h-6 w-6" />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-4xl font-black text-slate-900 dark:text-slate-100 mb-1 leading-none">{stat.count}</h3>
                      <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">{stat.title}</p>
                    </div>
                  </CardContent>
                  <div className={`h-1.5 w-full ${colors.bar}`}>
                    <div className={`h-full ${colors.border}`} style={{ width: '60%' }}></div>
                  </div>
                </Card>
              </Link>
            </motion.div>
          );
        })}
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Recent High Priority */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Critical Issues Queue</h2>
            <Link href="/authority/complaints?priority=high">
              <Button variant="ghost" className="text-blue-600 font-bold hover:bg-blue-50 gap-2">
                View Queue <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
          
          <div className="space-y-4">
            {recentHighPriority.length === 0 ? (
              <Card className="p-12 text-center bg-slate-50 border-dashed border-2">
                <CheckCircle2 className="h-12 w-12 text-teal-500 mx-auto mb-4" />
                <p className="text-slate-500 font-bold">No high priority issues pending!</p>
              </Card>
            ) : (
              recentHighPriority.map((item, i) => (
                <motion.div
                  key={item.id || item._id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Card className="hover:shadow-lg transition-shadow overflow-hidden">
                    <div className="flex items-stretch h-full">
                      <div className="w-2 bg-red-500"></div>
                      <div className="flex-1 p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-black text-slate-400 uppercase tracking-widest">ID: #{(item.id || item._id || "").toString().slice(-6).toUpperCase()}</span>
                            <span className={`px-2 py-0.5 border text-[10px] font-black rounded uppercase ${item.status === 'Resolved' ? 'bg-teal-50 text-teal-600 border-teal-100' : 
                            item.status === 'Verification Pending' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                            item.status === 'Accepted' ? 'bg-blue-50 text-blue-600 border-blue-100' : 
                            item.status === 'In Progress' ? 'bg-orange-50 text-orange-600 border-orange-100' :
                              'bg-slate-50 text-slate-500 border-slate-100'}`}>
                              {item.status}
                            </span>
                          </div>
                          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 leading-tight">{item.category}</h3>
                          <div className="flex items-center text-slate-500 text-sm gap-4">
                            <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {item.address?.split(',')[0]}</span>
                            <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {new Date(item.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <Link href={`/authority/complaints/${item.id || item._id}`}>
                          <Button className="rounded-xl shadow-lg shadow-slate-200 dark:shadow-none bg-slate-900 dark:bg-slate-100 dark:text-slate-900">
                            Assign Task
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))
            )}
          </div>
        </div>

        {/* Efficiency Chart Placeholder */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Department Performance</h2>
          <Card className="h-[400px] flex flex-col items-center justify-center p-8 text-center bg-white shadow-xl shadow-slate-200/50 dark:shadow-none rounded-3xl overflow-hidden relative group">
             <div className="absolute inset-0 bg-blue-600/5 group-hover:bg-blue-600/10 transition-colors"></div>
             <BarChart3 className="h-16 w-16 text-blue-600 mb-6 group-hover:scale-110 transition-transform" />
             <h3 className="text-2xl font-black text-slate-900 mb-2">Analytics Engine</h3>
             <p className="text-slate-500 text-sm font-medium leading-relaxed">
               Real-time reporting on resolution times, area compliance, and staff load.
             </p>
             <Link href="/authority/analytics" className="mt-8">
               <Button variant="outline" className="rounded-2xl border-2 font-bold h-12 px-8">Deep Dive</Button>
             </Link>
          </Card>
        </div>
      </div>
    </div>
  );
}
