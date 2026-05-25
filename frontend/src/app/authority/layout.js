"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { 
  LayoutDashboard, 
  ListTodo, 
  CheckCircle2, 
  BarChart3, 
  Settings, 
  LogOut, 
  Bell, 
  User, 
  ShieldCheck,
  Menu,
  X,
  Clock,
  Briefcase
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { motion, AnimatePresence } from "framer-motion";

const sidebarItems = [
  { name: "Dashboard", href: "/authority/dashboard", icon: LayoutDashboard },
  { name: "New Complaints", href: "/authority/complaints?status=Pending", icon: ListTodo },
  { name: "Assigned", href: "/authority/complaints?status=Accepted", icon: Briefcase },
  { name: "In Progress", href: "/authority/complaints?status=In Progress", icon: Clock },
  { name: "Resolved", href: "/authority/complaints?status=Resolved", icon: CheckCircle2 },
  { name: "Analytics", href: "/authority/analytics", icon: BarChart3 },
  { name: "Settings", href: "/authority/settings", icon: Settings },
];

export default function AuthorityLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const isPublicRoute = pathname === "/authority/login" || pathname === "/authority/register";

  useEffect(() => {
    const checkAuth = () => {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          if (parsedUser.role !== "authority") {
            if (!isPublicRoute) router.push("/authority/login");
          } else {
            setUser(parsedUser);
            // If logged in as authority and on login page, go to dashboard
            if (isPublicRoute && pathname !== "/authority/register") {
              router.push("/authority/dashboard");
            }
          }
        } catch (e) {
          console.error("Auth parsing error", e);
          if (!isPublicRoute) router.push("/authority/login");
        }
      } else if (!isPublicRoute) {
        router.push("/authority/login");
      }
    };

    checkAuth();
  }, [router, pathname, isPublicRoute]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    router.push("/");
  };

  // Skip loading screen for public routes
  if (isPublicRoute && !user) return <div className="min-h-screen bg-slate-50 dark:bg-slate-950">{children}</div>;

  if (!user && !isPublicRoute) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-slate-50 gap-4">
        <div className="h-12 w-12 border-4 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
        <p className="font-bold text-slate-500 animate-pulse">Authenticating Command Access...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex transition-colors duration-300">
      {/* Sidebar - Desktop */}
      <aside 
        className={`fixed left-0 top-0 h-full bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transition-all duration-300 z-40 hidden md:block ${isSidebarOpen ? "w-64" : "w-20"}`}
      >
        <div className="flex h-16 items-center px-6 border-b border-slate-100 dark:border-slate-800">
          <ShieldCheck className="h-8 w-8 text-slate-900 dark:text-slate-100 shrink-0" />
          {isSidebarOpen && (
            <span className="ml-3 font-bold text-lg tracking-tight text-slate-900 dark:text-slate-100 overflow-hidden whitespace-nowrap">
              Authority Portal
            </span>
          )}
        </div>

        <nav className="p-4 space-y-1 mt-4">
          {sidebarItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link key={item.name} href={item.href}>
                <div 
                  className={`flex items-center p-3 rounded-xl transition-all duration-200 group ${
                    isActive 
                      ? "bg-slate-900 text-white shadow-lg shadow-slate-200 dark:shadow-none" 
                      : "text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100"
                  }`}
                >
                  <item.icon className={`h-5 w-5 shrink-0 ${isActive ? "" : "group-hover:scale-110 transition-transform"}`} />
                  {isSidebarOpen && <span className="ml-3 text-sm font-medium">{item.name}</span>}
                </div>
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-4 left-0 w-full px-4">
          <Button 
            variant="ghost" 
            className={`w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 px-3 h-12 rounded-xl transition-all ${!isSidebarOpen && "justify-center"}`} 
            onClick={handleLogout}
          >
            <LogOut className="h-5 w-5 shrink-0" />
            {isSidebarOpen && <span className="ml-3 font-semibold">Logout</span>}
          </Button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className={`flex-1 transition-all duration-300 ${isSidebarOpen ? "md:ml-64" : "md:ml-20"}`}>
        {/* Top Navbar */}
        <header className="sticky top-0 z-30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 h-16 px-4 md:px-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="hidden md:block p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <Menu className="h-5 w-5 text-slate-500" />
            </button>
            <button 
              onClick={() => setIsMobileOpen(true)}
              className="md:hidden p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <Menu className="h-5 w-5 text-slate-500" />
            </button>
            <div className="hidden lg:block">
              <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">{user.name}</h2>
              <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider leading-tight">
                Department: {user.area || "General Maintenance"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors">
              <Bell className="h-5 w-5 text-slate-500" />
              <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-red-500 rounded-full border-2 border-white dark:border-slate-900"></span>
            </div>
            
            <div className="h-8 w-px bg-slate-200 dark:border-slate-700 mx-2"></div>
            
            <Link href="/profile">
              <div className="flex items-center gap-3 pl-2 cursor-pointer group">
                <div className="h-9 w-9 rounded-full bg-slate-900 dark:bg-slate-100 flex items-center justify-center text-white dark:text-slate-900 font-bold group-hover:scale-105 transition-transform">
                  {user.name?.charAt(0) || "A"}
                </div>
                <ChevronDown className="h-4 w-4 text-slate-400" />
              </div>
            </Link>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-4 md:p-8">
          {children}
        </div>
      </main>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isMobileOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileOpen(false)}
              className="fixed inset-0 bg-black/50 z-50 md:hidden"
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed left-0 top-0 h-full w-72 bg-white dark:bg-slate-900 z-50 p-6 md:hidden shadow-2xl"
            >
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center">
                  <ShieldCheck className="h-8 w-8 text-slate-900 dark:text-slate-100" />
                  <span className="ml-3 font-bold text-lg">Authority Portal</span>
                </div>
                <button onClick={() => setIsMobileOpen(false)}>
                  <X className="h-6 w-6 text-slate-400" />
                </button>
              </div>

              <div className="mb-8 p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700">
                <div className="flex items-center gap-3 mb-2">
                  <div className="h-10 w-10 rounded-full bg-slate-900 dark:bg-slate-100 flex items-center justify-center text-white dark:text-slate-900 font-bold text-lg">
                    {user.name?.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-sm">{user.name}</h3>
                    <p className="text-[10px] text-slate-500 uppercase font-black">{user.area}</p>
                  </div>
                </div>
              </div>

              <nav className="space-y-2">
                {sidebarItems.map((item) => (
                  <Link key={item.name} href={item.href} onClick={() => setIsMobileOpen(false)}>
                    <div className="flex items-center p-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 font-medium transition-colors">
                      <item.icon className="h-5 w-5 mr-3 text-slate-500" />
                      <span>{item.name}</span>
                    </div>
                  </Link>
                ))}
              </nav>

              <div className="absolute bottom-8 left-6 right-6">
                <Button variant="outline" className="w-full border-red-200 text-red-500 h-12 rounded-xl" onClick={handleLogout}>
                  <LogOut className="h-5 w-5 mr-3" /> Logout
                </Button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

function ChevronDown(props) {
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
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}
