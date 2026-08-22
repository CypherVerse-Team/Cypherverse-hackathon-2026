'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { 
  User, LayoutDashboard, Briefcase, Building, Shield, 
  CreditCard, ShieldCheck, HelpCircle, Bell, Grid, Home, ArrowRight, BarChart2
} from 'lucide-react';

export default function AccountQuickHub() {
  const { user, isAuthenticated } = useAuth();
  const pathname = usePathname();

  if (!isAuthenticated) return null;

  // Categorized links structure for clean drawoi-admin style navigation
  const navSections = [
    {
      title: 'CORE PORTALS',
      items: [
        { label: 'My Profile & Details', href: '/profile', icon: User, color: 'text-indigo-600 bg-indigo-50' },
        ...( ['CUSTOMER', 'CONTRACTOR'].includes(user?.account_type || '') 
            ? [{ label: 'Customer Dashboard', href: '/dashboard', icon: LayoutDashboard, color: 'text-purple-600 bg-purple-50' }] 
            : []
        ),
        ...( ['WORKER', 'GROUP_LEADER'].includes(user?.account_type || '') 
            ? [{ label: 'Worker Dashboard', href: '/worker-dashboard', icon: Briefcase, color: 'text-indigo-600 bg-indigo-50' }] 
            : []
        ),
        { label: 'Contractor & Team Hub', href: '/contractor', icon: Building, color: 'text-amber-600 bg-amber-50' },
        ...( user?.account_type === 'ADMIN' 
            ? [{ label: 'Admin Control Panel', href: '/admin', icon: Shield, color: 'text-emerald-600 bg-emerald-50' }] 
            : []
        ),
      ]
    },
    {
      title: 'FINANCE & VERIFICATION',
      items: [
        { label: 'Payments & Invoices', href: '/payments', icon: CreditCard, color: 'text-emerald-600 bg-emerald-50' },
        { label: 'KYC & Verification', href: '/verification', icon: ShieldCheck, color: 'text-indigo-600 bg-indigo-50' },
        { label: 'Summary Statistics', href: '/analytics', icon: BarChart2, color: 'text-blue-600 bg-blue-50' },
      ]
    },
    {
      title: 'MARKETPLACE & HELP',
      items: [
        { label: 'Notifications Center', href: '/notifications', icon: Bell, color: 'text-indigo-600 bg-indigo-50' },
        { label: 'Support & Complaints', href: '/support', icon: HelpCircle, color: 'text-purple-600 bg-purple-50' },
        { label: 'Trade Categories', href: '/categories', icon: Grid, color: 'text-slate-600 bg-slate-100' },
        { label: 'Worker Directory', href: '/', icon: Home, color: 'text-slate-600 bg-slate-100' },
      ]
    }
  ];

  return (
    <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-lg space-y-5 sticky top-20 max-h-[calc(100vh-6rem)] overflow-y-auto custom-scrollbar font-sans">
      
      {/* Drawoi Admin Style User Profile Card Header */}
      <div className="bg-slate-900 text-white rounded-2xl p-4 shadow-md flex items-center space-x-3.5 border border-slate-800">
        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 text-white flex items-center justify-center font-black text-lg shadow-sm flex-shrink-0">
          {user?.full_name?.charAt(0) || 'U'}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-extrabold text-white truncate leading-tight">{user?.full_name}</h4>
          <div className="flex items-center space-x-1.5 mt-1">
            <span className="text-[10px] font-black uppercase tracking-wider bg-white/10 text-indigo-300 px-2 py-0.5 rounded-md border border-white/10">
              {user?.account_type}
            </span>
            {(user?.verification_status === 'VERIFIED' || user?.verification_status === true) && (
              <span className="text-[9px] font-bold text-emerald-400 bg-emerald-950/80 px-1.5 py-0.5 rounded-md border border-emerald-800/80">
                ✓ Verified
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Categorized Admin Navigation Sections */}
      <div className="space-y-4">
        {navSections.map((section) => (
          <div key={section.title} className="space-y-1.5">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">
              {section.title}
            </h3>
            <div className="space-y-1">
              {section.items.map((link) => {
                const isActive = pathname === link.href;
                const IconComponent = link.icon;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`
                      p-2.5 rounded-xl border transition-all flex items-center justify-between group text-xs font-bold
                      ${isActive 
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-600/30' 
                        : 'bg-slate-50/90 border-slate-100/80 text-slate-700 hover:border-indigo-200 hover:bg-indigo-50/50 hover:text-indigo-700'
                      }
                    `}
                  >
                    <div className="flex items-center space-x-3 min-w-0">
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold flex-shrink-0 transition-colors ${isActive ? 'bg-white/20 text-white' : link.color}`}>
                        <IconComponent className="w-3.5 h-3.5" />
                      </div>
                      <span className={`truncate ${isActive ? 'text-white font-extrabold' : 'group-hover:text-indigo-700'}`}>
                        {link.label}
                      </span>
                    </div>
                    <ArrowRight className={`w-3.5 h-3.5 flex-shrink-0 transition-transform ${isActive ? 'text-white' : 'text-slate-300 group-hover:text-indigo-600 group-hover:translate-x-1'}`} />
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
