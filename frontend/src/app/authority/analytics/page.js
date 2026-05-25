"use client";

import { useEffect, useState, useMemo } from "react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell,
  AreaChart,
  Area
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { BarChart3, PieChart as PieIcon, LineChart, Target, Zap, Shield } from "lucide-react";
import { motion } from "framer-motion";

const COLORS = ['#2563EB', '#14B8A6', '#F97316', '#7C3AED', '#EF4444', '#10B981'];

export default function AnalyticsPage() {
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

  const categoryData = useMemo(() => {
    const counts = {};
    complaints.forEach(c => {
      counts[c.category] = (counts[c.category] || 0) + 1;
    });
    return Object.keys(counts).map(key => ({ name: key, value: counts[key] }));
  }, [complaints]);

  const statusData = useMemo(() => {
    const counts = { Pending: 0, Accepted: 0, "In Progress": 0, Resolved: 0 };
    complaints.forEach(c => {
      if (counts[c.status] !== undefined) counts[c.status]++;
    });
    return Object.keys(counts).map(key => ({ name: key, value: counts[key] }));
  }, [complaints]);

  const weeklyTrendData = [
    { day: "Mon", resolved: 4, reported: 7 },
    { day: "Tue", resolved: 6, reported: 5 },
    { day: "Wed", resolved: 9, reported: 12 },
    { day: "Thu", resolved: 5, reported: 8 },
    { day: "Fri", resolved: 11, reported: 9 },
    { day: "Sat", resolved: 3, reported: 4 },
    { day: "Sun", resolved: 2, reported: 2 },
  ];

  if (loading) return <div className="p-20 text-center text-slate-500 font-bold uppercase tracking-widest animate-pulse">Initializing Data Engine...</div>;

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-slate-100">Analytical Intelligence</h1>
          <p className="text-slate-500 dark:text-slate-400 font-bold">Data-driven performance monitoring Dashboard</p>
        </div>
        <div className="flex gap-2">
           <div className="p-4 bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center gap-3">
              <div className="h-10 w-10 bg-teal-50 text-teal-600 rounded-xl flex items-center justify-center">
                 <Target className="h-6 w-6" />
              </div>
              <div>
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Target SLA</p>
                 <span className="text-xl font-black text-slate-900">48 Hours</span>
              </div>
           </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Performance Metrics */}
        <Card className="md:col-span-2 border-none shadow-2xl shadow-slate-200/50 rounded-[2rem] overflow-hidden">
          <CardHeader className="bg-slate-50 border-b border-slate-100 p-8 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-xl font-black flex items-center gap-3">
                <LineChart className="h-6 w-6 text-blue-600" /> Resolution Velocity
              </CardTitle>
              <CardDescription className="text-slate-500 font-bold">Weekly reporting vs resolution trend</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="p-8 h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weeklyTrendData}>
                <defs>
                  <linearGradient id="colorReported" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563EB" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#2563EB" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorResolved" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#14B8A6" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#14B8A6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12, fontWeight: 700}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12, fontWeight: 700}} />
                <Tooltip 
                   contentStyle={{backgroundColor: '#0f172a', border: 'none', borderRadius: '12px', color: '#fff'}}
                   itemStyle={{color: '#fff', fontSize: '12px', fontWeight: 'bold'}}
                />
                <Area type="monotone" dataKey="reported" stroke="#2563EB" strokeWidth={3} fillOpacity={1} fill="url(#colorReported)" />
                <Area type="monotone" dataKey="resolved" stroke="#14B8A6" strokeWidth={3} fillOpacity={1} fill="url(#colorResolved)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Categories Pie */}
        <Card className="border-none shadow-2xl shadow-slate-200/50 rounded-[2rem] overflow-hidden">
          <CardHeader className="p-8 pb-2 text-center">
            <CardTitle className="text-xl font-black flex items-center justify-center gap-3">
               <PieIcon className="h-6 w-6 text-orange-500" /> Category Split
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8 h-[350px] flex flex-col items-center">
            <ResponsiveContainer width="100%" height="200">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-2 gap-4 mt-8 w-full">
               {categoryData.slice(0, 4).map((entry, index) => (
                  <div key={entry.name} className="flex items-center gap-2">
                     <div className="h-2 w-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                     <span className="text-[10px] font-black text-slate-500 uppercase tracking-tighter truncate w-24">{entry.name}</span>
                  </div>
               ))}
            </div>
          </CardContent>
        </Card>

        {/* Status Distribution */}
        <Card className="border-none shadow-2xl shadow-slate-200/50 rounded-[2rem] overflow-hidden">
           <CardHeader className="p-8">
              <CardTitle className="text-xl font-black flex items-center gap-3">
                 <Zap className="h-6 w-6 text-teal-600" /> Operational Progress
              </CardTitle>
           </CardHeader>
           <CardContent className="p-8 h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={statusData} layout="vertical">
                   <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                   <XAxis type="number" hide />
                   <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#475569', fontSize: 10, fontWeight: 900}} />
                   <Tooltip cursor={{fill: '#f8fafc'}} />
                   <Bar dataKey="value" fill="#2563EB" radius={[0, 10, 10, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
           </CardContent>
        </Card>

        {/* Area Intelligence Placeholder */}
        <Card className="md:col-span-2 border-none shadow-2xl shadow-slate-200/50 rounded-[2rem] overflow-hidden bg-slate-900 text-white">
           <CardContent className="p-12 flex items-center justify-between">
              <div className="space-y-4">
                 <div className="h-12 w-12 bg-white/10 rounded-2xl flex items-center justify-center">
                    <Shield className="h-6 w-6 text-teal-400" />
                 </div>
                 <div>
                    <h3 className="text-3xl font-black mb-2 leading-none uppercase tracking-tighter">Strategic Insights Engine</h3>
                    <p className="text-slate-400 font-bold max-w-md">Our AI is monitoring reporting density. Area "LB Nagar" is currently showing a 23% spike in road damage reports over the last 48 hours.</p>
                 </div>
                 <Button className="bg-teal-500 hover:bg-teal-600 font-black text-xs uppercase tracking-[0.2em] h-12 px-8 rounded-xl shadow-xl shadow-teal-500/20">
                    Deploy Field Investigation
                 </Button>
              </div>
              <div className="hidden lg:block">
                 <div className="h-40 w-40 border-[10px] border-teal-500/20 rounded-full flex items-center justify-center relative">
                    <div className="h-32 w-32 border-[10px] border-teal-500/40 rounded-full flex items-center justify-center">
                       <div className="h-24 w-24 bg-teal-500 rounded-full flex items-center justify-center shadow-2xl shadow-teal-500/40">
                          <BarChart3 className="h-10 w-10 text-slate-900" />
                       </div>
                    </div>
                 </div>
              </div>
           </CardContent>
        </Card>
      </div>
    </div>
  );
}
