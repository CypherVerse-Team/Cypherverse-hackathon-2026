'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { 
  User, LayoutDashboard, Briefcase, Building, Shield, 
  CreditCard, ShieldCheck, HelpCircle, Bell, Grid, Home, ArrowRight 
} from 'lucide-react';

export default function AccountQuickHub() {
  const { user, isAuthenticated } = useAuth();
  const pathname = usePathname();

  if (!isAuthenticated) return null;

  const quickLinks = [
    { label: 'My Profile & Details', href: '/profile', icon: User, color: 'text-blue-600 bg-blue-50' },
    ...( ['CUSTOMER', 'CONTRACTOR'].includes(user?.account_type || '') 
        ? [{ label: 'Customer Dashboard', href: '/dashboard', icon: LayoutDashboard, color: 'text-purple-600 bg-purple-50' }] 
        : []
    ),
    ...( ['WORKER', 'GROUP_LEADER'].includes(user?.account_type || '') 
        ? [{ label: 'Worker Dashboard', href: '/worker-dashboard', icon: Briefcase, color: 'text-blue-600 bg-blue-50' }] 
        : []
    ),
    { label: 'Contractor & Team Hub', href: '/contractor', icon: Building, color: 'text-amber-600 bg-amber-50' },
    ...( user?.account_type === 'ADMIN' 
        ? [{ label: 'Admin Control Panel', href: '/admin', icon: Shield, color: 'text-emerald-600 bg-emerald-50' }] 
        : []
    ),
    { label: 'Payments & Invoices', href: '/payments', icon: CreditCard, color: 'text-emerald-600 bg-emerald-50' },
    { label: 'KYC & Verification', href: '/verification', icon: ShieldCheck, color: 'text-blue-600 bg-blue-50' },
    { label: 'Support & Complaints', href: '/support', icon: HelpCircle, color: 'text-purple-600 bg-purple-50' },
    { label: 'Notifications Center', href: '/notifications', icon: Bell, color: 'text-indigo-600 bg-indigo-50' },
    { label: 'All Categories', href: '/categories', icon: Grid, color: 'text-slate-600 bg-slate-100' },
    { label: 'Worker Directory', href: '/', icon: Home, color: 'text-slate-600 bg-slate-100' },
  ];

  return (
    <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-5">
      {/* Mini Profile Header inside card */}
      <div className="flex items-center space-x-3 pb-4 border-b border-gray-100">
        <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-extrabold text-xl shadow-md">
          {user?.full_name?.charAt(0) || 'U'}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-base font-bold text-gray-900 truncate">{user?.full_name}</h4>
          <div className="flex items-center space-x-2 mt-0.5">
            <span className="text-[11px] font-extrabold text-blue-600 uppercase tracking-wider bg-blue-50 px-2 py-0.5 rounded-full">
              {user?.account_type}
            </span>
            {(user?.verification_status === 'VERIFIED' || user?.verification_status === true) && (
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                Verified
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Quick Hub Options List */}
      <div>
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Account Quick Hub</h3>
        <div className="space-y-2">
          {quickLinks.map((link) => {
            const isActive = pathname === link.href;
            const IconComponent = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`
                  p-3 rounded-2xl border transition-all flex items-center justify-between group text-xs font-semibold
                  ${isActive 
                    ? 'bg-blue-600 text-white border-blue-600 shadow-md' 
                    : 'bg-gray-50/80 border-gray-100 text-gray-800 hover:border-blue-200 hover:bg-blue-50/40'
                  }
                `}
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold ${isActive ? 'bg-white/20 text-white' : link.color}`}>
                    <IconComponent className="w-4 h-4" />
                  </div>
                  <span className={isActive ? 'text-white' : 'group-hover:text-blue-600'}>{link.label}</span>
                </div>
                <ArrowRight className={`w-3.5 h-3.5 transition-transform ${isActive ? 'text-white' : 'text-gray-400 group-hover:translate-x-1'}`} />
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
