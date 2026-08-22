'use client';

import Link from 'next/link';
import { Shield, Hammer, CreditCard, LayoutDashboard, ChevronRight } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';

export default function Footer() {
  const { t } = useLanguage();
  const { user, isAuthenticated } = useAuth();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-slate-900 text-slate-300 mt-20 border-t border-slate-800 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
          
          {/* Brand Column */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="inline-flex items-center space-x-2">
              <span className="text-2xl font-extrabold text-blue-400 tracking-tight">ShramSetu</span>
            </Link>
            <p className="text-slate-400 text-sm leading-relaxed max-w-sm">
              Empowering India's skilled trade workforce. Direct on-demand booking for verified Electricians, Plumbers, Carpenters, Painters & Construction Crews with escrow protected payments.
            </p>
            <div className="flex items-center space-x-3 pt-2">
              <div className="flex items-center text-xs text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-3 py-1.5 rounded-full font-medium">
                <Shield className="w-3.5 h-3.5 mr-1.5" /> Aadhaar & Skill Verified Workforce
              </div>
            </div>
          </div>

          {/* Column 1: Marketplace Services */}
          <div>
            <h4 className="text-white text-xs font-extrabold tracking-wider uppercase mb-4 flex items-center">
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
                  <ChevronRight className="w-3 h-3 mr-1 text-slate-500" /> Trade Categories
                </Link>
              </li>
              <li>
                <Link href="/contractor" className="hover:text-blue-400 transition-colors flex items-center">
                  <ChevronRight className="w-3 h-3 mr-1 text-slate-500" /> Contractor & Team Hub
                </Link>
              </li>
              <li>
                <Link href="/analytics" className="hover:text-blue-400 transition-colors flex items-center">
                  <ChevronRight className="w-3 h-3 mr-1 text-slate-500" /> Summary Statistics
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 2: User Portals & Dashboards (Conditional) */}
          <div>
            <h4 className="text-white text-xs font-extrabold tracking-wider uppercase mb-4 flex items-center">
              <LayoutDashboard className="w-4 h-4 mr-2 text-blue-400" /> {isAuthenticated ? 'My Account' : 'Getting Started'}
            </h4>
            <ul className="space-y-2.5 text-sm">
              {!isAuthenticated ? (
                <>
                  <li>
                    <Link href="/login" className="hover:text-blue-400 transition-colors flex items-center">
                      <ChevronRight className="w-3 h-3 mr-1 text-slate-500" /> Log In to Account
                    </Link>
                  </li>
                  <li>
                    <Link href="/register" className="hover:text-blue-400 transition-colors flex items-center">
                      <ChevronRight className="w-3 h-3 mr-1 text-slate-500" /> Register as Customer
                    </Link>
                  </li>
                  <li>
                    <Link href="/register" className="hover:text-blue-400 transition-colors flex items-center">
                      <ChevronRight className="w-3 h-3 mr-1 text-slate-500" /> Join as Skilled Worker
                    </Link>
                  </li>
                </>
              ) : (
                <>
                  <li>
                    <Link href="/profile" className="hover:text-blue-400 transition-colors flex items-center">
                      <ChevronRight className="w-3 h-3 mr-1 text-slate-500" /> My Profile & Settings
                    </Link>
                  </li>
                  {['CUSTOMER', 'CONTRACTOR'].includes(user?.account_type || '') && (
                    <li>
                      <Link href="/dashboard" className="hover:text-blue-400 transition-colors flex items-center">
                        <ChevronRight className="w-3 h-3 mr-1 text-slate-500" /> Customer Dashboard
                      </Link>
                    </li>
                  )}
                  {['WORKER', 'GROUP_LEADER'].includes(user?.account_type || '') && (
                    <li>
                      <Link href="/worker-dashboard" className="hover:text-blue-400 transition-colors flex items-center">
                        <ChevronRight className="w-3 h-3 mr-1 text-slate-500" /> Worker Dashboard
                      </Link>
                    </li>
                  )}
                  {user?.account_type === 'ADMIN' && (
                    <li>
                      <Link href="/admin" className="hover:text-blue-400 transition-colors flex items-center">
                        <ChevronRight className="w-3 h-3 mr-1 text-slate-500" /> Admin Control Panel
                      </Link>
                    </li>
                  )}
                </>
              )}
            </ul>
          </div>

          {/* Column 3: Finance & Support (Conditional) */}
          <div>
            <h4 className="text-white text-xs font-extrabold tracking-wider uppercase mb-4 flex items-center">
              <CreditCard className="w-4 h-4 mr-2 text-blue-400" /> Finance & Support
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/support" className="hover:text-blue-400 transition-colors flex items-center">
                  <ChevronRight className="w-3 h-3 mr-1 text-slate-500" /> Support & Help Center
                </Link>
              </li>
              {isAuthenticated ? (
                <>
                  <li>
                    <Link href="/payments" className="hover:text-blue-400 transition-colors flex items-center">
                      <ChevronRight className="w-3 h-3 mr-1 text-slate-500" /> Payments & Invoices
                    </Link>
                  </li>
                  <li>
                    <Link href="/verification" className="hover:text-blue-400 transition-colors flex items-center">
                      <ChevronRight className="w-3 h-3 mr-1 text-slate-500" /> KYC Verification Hub
                    </Link>
                  </li>
                  <li>
                    <Link href="/notifications" className="hover:text-blue-400 transition-colors flex items-center">
                      <ChevronRight className="w-3 h-3 mr-1 text-slate-500" /> Notifications Center
                    </Link>
                  </li>
                </>
              ) : (
                <>
                  <li>
                    <Link href="/login" className="hover:text-blue-400 transition-colors flex items-center">
                      <ChevronRight className="w-3 h-3 mr-1 text-slate-500" /> Secure Login
                    </Link>
                  </li>
                  <li>
                    <Link href="/register" className="hover:text-blue-400 transition-colors flex items-center">
                      <ChevronRight className="w-3 h-3 mr-1 text-slate-500" /> Create Free Account
                    </Link>
                  </li>
                </>
              )}
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
