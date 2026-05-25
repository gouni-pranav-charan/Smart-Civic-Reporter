"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MapPin, Mail, Phone } from "lucide-react";

export default function Footer() {
  const pathname = usePathname();
  
  // Hide Footer for authority portal
  if (pathname?.startsWith("/authority")) return null;

  return (
    <footer className="border-t border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900/50">
      <div className="container mx-auto px-4 py-12 md:px-6">
        <div className="grid gap-8 md:grid-cols-4">
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex p-1 bg-blue-600 rounded-md">
                <MapPin className="h-4 w-4 text-white" />
              </div>
              <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-slate-50">
                Smart Civic Connect
              </span>
            </Link>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              An AI-powered platform helping citizens report problems and helping authorities resolve them faster.
            </p>
          </div>
          <div>
            <h3 className="mb-4 text-sm font-semibold text-slate-900 dark:text-slate-50">Quick Links</h3>
            <ul className="space-y-2 text-sm text-slate-500 dark:text-slate-400">
              <li><Link href="/report" className="hover:text-blue-600 dark:hover:text-blue-500">Report Issue</Link></li>
              <li><Link href="/track" className="hover:text-blue-600 dark:hover:text-blue-500">Track Complaint</Link></li>
              <li><Link href="/about" className="hover:text-blue-600 dark:hover:text-blue-500">About Us</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="mb-4 text-sm font-semibold text-slate-900 dark:text-slate-50">Authorities</h3>
            <ul className="space-y-2 text-sm text-slate-500 dark:text-slate-400">
              <li><Link href="/authority/login" className="hover:text-blue-600 dark:hover:text-blue-500">Authority Login</Link></li>
              <li><Link href="/authority/dashboard" className="hover:text-blue-600 dark:hover:text-blue-500">Authority Dashboard</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="mb-4 text-sm font-semibold text-slate-900 dark:text-slate-50">Contact</h3>
            <ul className="space-y-2 text-sm text-slate-500 dark:text-slate-400">
              <li className="flex items-center gap-2"><Mail className="h-4 w-4" /> support@smartcivic.local</li>
              <li className="flex items-center gap-2"><Phone className="h-4 w-4" /> 1800-CIVIC-HELP</li>
            </ul>
          </div>
        </div>
        <div className="mt-12 border-t border-slate-200 pt-8 text-center text-sm text-slate-500 dark:border-slate-800 dark:text-slate-400">
          © {new Date().getFullYear()} Smart Civic Connect. Built with AI. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
