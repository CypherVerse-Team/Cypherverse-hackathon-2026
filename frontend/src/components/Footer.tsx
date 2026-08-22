'use client';

import Link from 'next/link';
import { Shield, Hammer, CreditCard, LayoutDashboard, ChevronRight } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

export default function Footer() {
  const { t } = useLanguage();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-slate-900 text-slate-300 mt-20 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
          {/* Brand Column */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="inline-flex items-center space-x-2">
              <span className="text-2xl font-extrabold text-blue-400 tracking-tight">ShramSetu</span>
            </Link>
            <p className="text-slate-400 text-sm leading-relaxed max-w-sm">
              Empowering blue-collar workforce & connecting clients with verified skilled professionals on-demand with secure payments & digital identity.
            </p>
            <div className="flex items-center space-x-3 pt-2">
              <div className="flex items-center text-xs text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-3 py-1.5 rounded-full">
                <Shield className="w-3.5 h-3.5 mr-1.5" /> Aadhaar & Skill Verified Workers
              </div>
            </div>
          </div>

          {/* Quick Links / Marketplace */}
          <div>
            <h4 className="text-white text-sm font-semibold tracking-wider uppercase mb-4 flex items-center">
              <Hammer className="w-4 h-4 mr-2 text-blue-400" /> Marketplace
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/" className="hover:text-blue-400 transition-colors flex items-center">
                  <ChevronRight className="w-3 h-3 mr-1 text-slate-500" /> Worker Directory
                </Link>
              </li>
              <li>
                <Link href="/categories" className="hover:text-blue-400 transition-colors flex items-center">
                  <ChevronRight className="w-3 h-3 mr-1 text-slate-500" /> All Categories & Services
                </Link>
              </li>
              <li>
                <Link href="/verification" className="hover:text-blue-400 transition-colors flex items-center">
                  <ChevronRight className="w-3 h-3 mr-1 text-slate-500" /> Verification Hub (KYC)
                </Link>
              </li>
            </ul>
          </div>

          {/* User Portals & Dashboards */}
          <div>
            <h4 className="text-white text-sm font-semibold tracking-wider uppercase mb-4 flex items-center">
              <LayoutDashboard className="w-4 h-4 mr-2 text-blue-400" /> User Portals
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/dashboard" className="hover:text-blue-400 transition-colors flex items-center">
                  <ChevronRight className="w-3 h-3 mr-1 text-slate-500" /> Customer Dashboard
                </Link>
              </li>
              <li>
                <Link href="/worker-dashboard" className="hover:text-blue-400 transition-colors flex items-center">
                  <ChevronRight className="w-3 h-3 mr-1 text-slate-500" /> Worker Dashboard
                </Link>
              </li>
              <li>
                <Link href="/contractor" className="hover:text-blue-400 transition-colors flex items-center">
                  <ChevronRight className="w-3 h-3 mr-1 text-slate-500" /> Contractor & Team Hub
                </Link>
              </li>
              <li>
                <Link href="/admin" className="hover:text-blue-400 transition-colors flex items-center">
                  <ChevronRight className="w-3 h-3 mr-1 text-slate-500" /> Admin Control Panel
                </Link>
              </li>
            </ul>
          </div>

          {/* Account & Support */}
          <div>
            <h4 className="text-white text-sm font-semibold tracking-wider uppercase mb-4 flex items-center">
              <CreditCard className="w-4 h-4 mr-2 text-blue-400" /> Finance & Support
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/payments" className="hover:text-blue-400 transition-colors flex items-center">
                  <ChevronRight className="w-3 h-3 mr-1 text-slate-500" /> Payments & Invoices
                </Link>
              </li>
              <li>
                <Link href="/support" className="hover:text-blue-400 transition-colors flex items-center">
                  <ChevronRight className="w-3 h-3 mr-1 text-slate-500" /> Support & Complaints
                </Link>
              </li>
              <li>
                <Link href="/notifications" className="hover:text-blue-400 transition-colors flex items-center">
                  <ChevronRight className="w-3 h-3 mr-1 text-slate-500" /> Notifications Center
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-blue-400 transition-colors flex items-center">
                  <ChevronRight className="w-3 h-3 mr-1 text-slate-500" /> Login / Register
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-slate-500">
          <p>© {currentYear} ShramSetu Digital Workforce Platform. All rights reserved.</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <Link href="/" className="hover:text-slate-400 transition-colors">Privacy Policy</Link>
            <Link href="/" className="hover:text-slate-400 transition-colors">Terms of Service</Link>
            <Link href="/support" className="hover:text-slate-400 transition-colors">Help Center</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
