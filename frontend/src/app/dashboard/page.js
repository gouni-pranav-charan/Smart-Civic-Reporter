"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { PlusCircle, List, Clock, CheckCircle2, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function Dashboard() {
  const router = useRouter();
  const [complaints, setComplaints] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchComplaints = async () => {
      const token = localStorage.getItem("token");
      const userData = localStorage.getItem("user");

      if (!token) {
        router.push("/login");
        return;
      }

      if (userData) {
        setUser(JSON.parse(userData));
      }

      try {
        const res = await fetch("http://localhost:5000/api/complaints/my", {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });
        if (res.ok) {
          const data = await res.json();
          setComplaints(data);
        }
      } catch (error) {
        console.error("Failed to fetch complaints:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchComplaints();
  }, [router]);

  const total = complaints.length;
  const active = complaints.filter(c => ["Pending", "Accepted", "In Progress"].includes(c.status)).length;
  const awaiting = complaints.filter(c => c.status === "Verification Pending").length;
  const resolved = complaints.filter(c => c.status === "Resolved").length;

  const stats = [
    { title: "Total Reports", value: total, icon: List, color: "text-blue-500" },
    { title: "Active Issues", value: active, icon: Clock, color: "text-blue-600" },
    { title: "Awaiting You", value: awaiting, icon: ShieldCheck, color: "text-amber-500" },
    { title: "Resolved", value: resolved, icon: CheckCircle2, color: "text-teal-500" },
  ];

  if (loading) return <div className="p-8 text-center text-slate-500">Loading dashboard...</div>;

  return (
    <div className="container mx-auto p-4 py-8 md:p-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
            Welcome, {user?.name || "Citizen"}
          </h1>
          <p className="text-slate-500 dark:text-slate-400">Manage your civic reports and track their status.</p>
        </div>
        <Link href="/report">
          <Button className="gap-2">
            <PlusCircle className="h-4 w-4" /> Report New Issue
          </Button>
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        {stats.map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-slate-500">{stat.title}</CardTitle>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <h2 className="text-xl font-bold mb-4 tracking-tight text-slate-900 dark:text-slate-50">Recent Complaints</h2>
      <Card>
        <div className="divide-y divide-slate-200 dark:divide-slate-800">
          {complaints.length === 0 ? (
            <div className="p-6 text-center text-slate-500">No complaints reported yet.</div>
          ) : (
            complaints.map((item, i) => (
              <div key={item.id || item._id} className="flex items-center justify-between p-4 sm:p-6 hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                <div className="flex flex-col space-y-1">
                  <span className="font-medium text-slate-900 dark:text-slate-50">{item.category}</span>
                  <div className="flex items-center text-sm text-slate-500 gap-2">
                    <span className="uppercase text-xs font-mono bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded">
                      #{(item.id || item._id || "").toString().slice(-6)}
                    </span>
                    <span>•</span>
                    <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="flex items-center">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold
                    ${item.status === 'Resolved' ? 'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-400' : 
                      item.status === 'Verification Pending' ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 border border-amber-200' :
                      item.status === 'Pending' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400' : 
                        'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'}`}>
                    {item.status}
                  </span>
                  <Link href={`/track?id=${item.id || item._id}`}>
                    <Button variant="ghost" size="sm" className="ml-4 tabular-nums hidden sm:flex">
                      Track
                    </Button>
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
}
