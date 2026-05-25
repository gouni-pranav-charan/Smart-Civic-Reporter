"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { MapPin, Menu, X, ChevronDown, ShieldCheck, User, LogOut } from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [authDropdown, setAuthDropdown] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  // Hide Navbar for authority portal
  if (pathname?.startsWith("/authority")) return null;

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    window.location.href = "/";
  };

  const getDashboardLink = () => {
    if (!user) return "/dashboard";
    return user.role === 'authority' ? "/authority/dashboard" : "/dashboard";
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/80 backdrop-blur-md dark:border-slate-800 dark:bg-slate-950/80">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex p-1.5 bg-blue-600 rounded-lg">
            <MapPin className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight text-blue-600 dark:text-blue-500">
            Smart Civic Connect
          </span>
        </Link>
        
        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-6">
          <Link href="/" className="text-sm font-medium text-slate-700 hover:text-blue-600 dark:text-slate-300 dark:hover:text-blue-500">Home</Link>
          <Link href="/report" className="text-sm font-medium text-slate-700 hover:text-blue-600 dark:text-slate-300 dark:hover:text-blue-500">Report Issue</Link>
          <Link href="/track" className="text-sm font-medium text-slate-700 hover:text-blue-600 dark:text-slate-300 dark:hover:text-blue-500">Track</Link>
          <Link href={getDashboardLink()} className="text-sm font-medium text-slate-700 hover:text-blue-600 dark:text-slate-300 dark:hover:text-blue-500">Dashboard</Link>
          <Link href="/profile" className="text-sm font-medium text-slate-700 hover:text-blue-600 dark:text-slate-300 dark:hover:text-blue-500">Profile</Link>
          
          <div className="relative">
            {!user ? (
              <Link href="/auth-selection">
                <Button 
                  variant="outline" 
                  className="gap-2 border-blue-600 text-blue-600 hover:bg-blue-50"
                >
                  Get Started <ChevronDown className="h-4 w-4" />
                </Button>
              </Link>
            ) : (
              <Button 
                variant="outline" 
                onClick={handleLogout}
                className="gap-2 border-red-500 text-red-600 hover:bg-red-50"
              >
                Logout <LogOut className="h-4 w-4" />
              </Button>
            )}

            {authDropdown && (
              <div className="absolute right-0 mt-2 w-56 rounded-xl border border-slate-200 bg-white p-2 shadow-xl dark:border-slate-800 dark:bg-slate-950">
                <div className="p-2 text-xs font-bold text-slate-500 uppercase tracking-wider">Citizen Portal</div>
                <Link href="/login" onClick={() => setAuthDropdown(false)}>
                  <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors cursor-pointer text-sm">
                    <User className="h-4 w-4 text-blue-600" />
                    <span>Citizen Login</span>
                  </div>
                </Link>
                <Link href="/register" onClick={() => setAuthDropdown(false)}>
                  <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors cursor-pointer text-sm">
                    <User className="h-4 w-4 text-blue-600" />
                    <span>Citizen Register</span>
                  </div>
                </Link>
                
                <div className="my-2 border-t border-slate-100 dark:border-slate-800"></div>
                
                <div className="p-2 text-xs font-bold text-slate-500 uppercase tracking-wider">Authority Portal</div>
                <Link href="/authority/login" onClick={() => setAuthDropdown(false)}>
                  <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors cursor-pointer text-sm">
                    <ShieldCheck className="h-4 w-4 text-slate-900 dark:text-slate-100" />
                    <span>Authority Login</span>
                  </div>
                </Link>
                <Link href="/authority/register" onClick={() => setAuthDropdown(false)}>
                  <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors cursor-pointer text-sm">
                    <ShieldCheck className="h-4 w-4 text-slate-900 dark:text-slate-100" />
                    <span>Authority Register</span>
                  </div>
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Nav Toggle */}
        <div className="md:hidden flex items-center">
          <button onClick={() => setIsOpen(!isOpen)} className="text-slate-700 dark:text-slate-300">
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Nav Menu */}
      {isOpen && (
        <div className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-4 py-4 flex flex-col gap-4">
          <Link href="/" onClick={() => setIsOpen(false)} className="text-sm font-medium text-slate-700 dark:text-slate-300">Home</Link>
          <Link href="/report" onClick={() => setIsOpen(false)} className="text-sm font-medium text-slate-700 dark:text-slate-300">Report Issue</Link>
          <Link href="/track" onClick={() => setIsOpen(false)} className="text-sm font-medium text-slate-700 dark:text-slate-300">Track</Link>
          <Link href={getDashboardLink()} onClick={() => setIsOpen(false)} className="text-sm font-medium text-slate-700 dark:text-slate-300">Dashboard</Link>
          <Link href="/profile" onClick={() => setIsOpen(false)} className="text-sm font-medium text-slate-700 dark:text-slate-300">Profile</Link>
          
          {user ? (
            <Button 
              variant="outline" 
              onClick={handleLogout}
              className="w-full text-xs border-red-500 text-red-600 hover:bg-red-50"
            >
              Logout <LogOut className="h-3 w-3 ml-2" />
            </Button>
          ) : (
            <>
              <div className="pt-2">
                <div className="text-xs font-bold text-slate-400 uppercase mb-2">Citizen Portal</div>
                <div className="grid grid-cols-2 gap-2">
                  <Link href="/login" onClick={() => setIsOpen(false)}>
                    <Button variant="outline" className="w-full text-xs">Login</Button>
                  </Link>
                  <Link href="/register" onClick={() => setIsOpen(false)}>
                    <Button className="w-full text-xs">Register</Button>
                  </Link>
                </div>
              </div>

              <div>
                <div className="text-xs font-bold text-slate-400 uppercase mb-2">Authority Portal</div>
                <div className="grid grid-cols-2 gap-2">
                  <Link href="/authority/login" onClick={() => setIsOpen(false)}>
                    <Button variant="outline" className="w-full text-xs bg-slate-900 text-white hover:bg-slate-800">Officer Login</Button>
                  </Link>
                  <Link href="/authority/register" onClick={() => setIsOpen(false)}>
                    <Button className="w-full text-xs bg-slate-100 text-slate-900 hover:bg-slate-200">Officer Join</Button>
                  </Link>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
