'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { 
  Home, Grid, User, LayoutDashboard, Briefcase, Building, 
  CreditCard, ShieldCheck, HelpCircle, Bell, LogOut, Shield, ChevronRight, X, BarChart2
} from 'lucide-react';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ isOpen = false, onClose }: SidebarProps) {
  const { user, isAuthenticated, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  if (!isAuthenticated) return null;

  const handleLogout = () => {
    logout();
    router.push('/');
    if (onClose) onClose();
  };

  const navGroups = [
    {
      title: 'Marketplace',
      items: [
        { label: 'Worker Directory', href: '/', icon: Home },
        { label: 'All Categories', href: '/categories', icon: Grid },
      ]
    },
    {
      title: 'My Account & Dashboards',
      items: [
        { label: 'My Profile & Details', href: '/profile', icon: User },
        ...( ['CUSTOMER', 'CONTRACTOR'].includes(user?.account_type || '') 
            ? [{ label: 'Customer Dashboard', href: '/dashboard', icon: LayoutDashboard }] 
            : []
        ),
        ...( ['WORKER', 'GROUP_LEADER'].includes(user?.account_type || '') 
            ? [{ label: 'Worker Dashboard', href: '/worker-dashboard', icon: Briefcase }] 
            : []
        ),
        { label: 'Contractor & Team Hub', href: '/contractor', icon: Building },
        ...( user?.account_type === 'ADMIN' 
            ? [{ label: 'Admin Control Panel', href: '/admin', icon: Shield }] 
            : []
        ),
      ]
    },
    {
      title: 'Finance & Verification',
      items: [
        { label: 'Payments & Invoices', href: '/payments', icon: CreditCard },
        { label: 'KYC & Skill Verification', href: '/verification', icon: ShieldCheck },
        { label: 'Summary Statistics', href: '/analytics', icon: BarChart2 },
      ]
    },
    {
      title: 'Help & Alerts',
      items: [
        { label: 'Support & Complaints', href: '/support', icon: HelpCircle },
        { label: 'Notifications Center', href: '/notifications', icon: Bell },
      ]
    }
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-xs lg:hidden transition-opacity"
        />
      )}

      {/* Left Sidebar Container */}
      <aside className={`
        fixed top-0 left-0 z-50 h-full w-72 bg-slate-900 text-slate-300 flex flex-col justify-between border-r border-slate-800 transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="flex flex-col h-full overflow-y-auto custom-scrollbar">
          
          {/* Sidebar Top Header & Brand */}
          <div className="p-6 border-b border-slate-800/80 flex items-center justify-between">
            <Link href="/" onClick={onClose} className="flex items-center space-x-2">
              <span className="text-2xl font-extrabold text-blue-400 tracking-tight">ShramSetu</span>
            </Link>
            {onClose && (
              <button 
                onClick={onClose}
                className="lg:hidden p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* User Profile Mini Badge Card */}
          <div className="p-4 mx-4 mt-4 bg-slate-800/60 rounded-2xl border border-slate-800 flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-lg flex-shrink-0">
              {user?.full_name?.charAt(0) || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-bold text-white truncate">{user?.full_name}</h4>
              <span className="inline-block text-[10px] font-extrabold text-blue-400 uppercase tracking-wider">
                {user?.account_type}
              </span>
            </div>
          </div>

          {/* Navigation Groups */}
          <div className="px-4 py-4 space-y-6 flex-1">
            {navGroups.map((group, idx) => (
              <div key={idx} className="space-y-1.5">
                <h5 className="px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  {group.title}
                </h5>
                <div className="space-y-1">
                  {group.items.map((item) => {
                    const isActive = pathname === item.href;
                    const IconComp = item.icon;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={onClose}
                        className={`
                          flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all group
                          ${isActive 
                            ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' 
                            : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                          }
                        `}
                      >
                        <div className="flex items-center space-x-3">
                          <IconComp className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-blue-400'}`} />
                          <span>{item.label}</span>
                        </div>
                        {isActive && <ChevronRight className="w-3.5 h-3.5" />}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Sidebar Footer Logout Action */}
          <div className="p-4 border-t border-slate-800/80">
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl bg-red-950/40 border border-red-900/50 text-red-400 hover:bg-red-900/60 hover:text-white text-xs font-bold transition-all"
            >
              <LogOut className="w-4 h-4" />
              <span>Log Out</span>
            </button>
          </div>

        </div>
      </aside>
    </>
  );
}
