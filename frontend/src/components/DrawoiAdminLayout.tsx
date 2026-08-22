'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { 
  LayoutDashboard, User, Briefcase, Building, CreditCard, 
  ShieldCheck, HelpCircle, Bell, BarChart2, Grid, Home, 
  Shield, LogOut, ChevronDown, Menu, X, Search, Sparkles
} from 'lucide-react';

export default function DrawoiAdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (showUserDropdown && !target.closest('.user-dropdown-container')) {
        setShowUserDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showUserDropdown]);

  if (!isAuthenticated) {
    return <>{children}</>;
  }

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const navGroups = [
    {
      title: 'OVERVIEW',
      items: [
        ...( ['CUSTOMER', 'CONTRACTOR'].includes(user?.account_type || '') 
            ? [{ label: 'Customer Dashboard', href: '/dashboard', icon: LayoutDashboard }] 
            : []
        ),
        ...( ['WORKER', 'GROUP_LEADER'].includes(user?.account_type || '') 
            ? [{ label: 'Worker Dashboard', href: '/worker-dashboard', icon: Briefcase }] 
            : []
        ),
        { label: 'My Profile & Details', href: '/profile', icon: User },
        { label: 'Contractor & Team Hub', href: '/contractor', icon: Building },
        ...( user?.account_type === 'ADMIN' 
            ? [{ label: 'Admin Control Panel', href: '/admin', icon: Shield }] 
            : []
        ),
      ]
    },
    {
      title: 'FINANCE & VERIFICATION',
      items: [
        { label: 'Payments & Invoices', href: '/payments', icon: CreditCard },
        { label: 'KYC & Verification', href: '/verification', icon: ShieldCheck },
        { label: 'Summary Statistics', href: '/analytics', icon: BarChart2 },
      ]
    },
    {
      title: 'MARKETPLACE & HELP',
      items: [
        { label: 'Notifications Center', href: '/notifications', icon: Bell },
        { label: 'Support & Help Center', href: '/support', icon: HelpCircle },
        { label: 'Trade Categories', href: '/categories', icon: Grid },
        { label: 'Worker Directory', href: '/', icon: Home },
      ]
    }
  ];

  // Helper to resolve active page title for top bar
  const getPageTitle = () => {
    if (pathname === '/') return 'Worker Directory';
    if (pathname === '/profile') return 'My Profile & Account Details';
    if (pathname === '/worker-dashboard') return 'Worker Operational Dashboard';
    if (pathname === '/dashboard') return 'Customer Service Dashboard';
    if (pathname === '/payments') return 'Escrow Payments & Invoices';
    if (pathname === '/verification') return 'KYC & Skill Verification Portal';
    if (pathname === '/analytics') return 'Platform Summary Statistics';
    if (pathname === '/contractor') return 'Contractor Workforce Hub';
    if (pathname === '/support') return 'Support & Help Center';
    if (pathname === '/notifications') return 'Notifications Center';
    if (pathname === '/admin') return 'Admin Control Panel';
    if (pathname === '/categories') return 'Trade Categories';
    return 'Dashboard';
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex font-sans antialiased">
      
      {/* Mobile Drawer Overlay */}
      {isMobileOpen && (
        <div 
          onClick={() => setIsMobileOpen(false)}
          className="fixed inset-0 z-40 bg-zinc-950/80 backdrop-blur-sm lg:hidden transition-opacity"
        />
      )}

      {/* Drawoi Admin Left Sidebar */}
      <aside className={`
        fixed top-0 left-0 z-50 h-screen w-64 bg-zinc-900 border-r border-zinc-800/80 flex flex-col justify-between transition-transform duration-300 ease-in-out
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="flex flex-col h-full overflow-hidden">
          
          {/* Logo Header */}
          <div className="flex items-center justify-between px-5 h-[64px] border-b border-zinc-800/80">
            <Link href="/" onClick={() => setIsMobileOpen(false)} className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-600 rounded-xl flex items-center justify-center text-white font-black text-base shadow-md shadow-blue-600/30">
                S
              </div>
              <span className="text-lg font-extrabold text-white tracking-tight">
                ShramSetu <span className="text-xs text-blue-400 font-bold px-1.5 py-0.5 rounded-md bg-blue-950 border border-blue-800/50">Admin</span>
              </span>
            </Link>

            <button
              onClick={() => setIsMobileOpen(false)}
              className="lg:hidden p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 px-3 py-4 space-y-5 overflow-y-auto custom-scrollbar">
            {navGroups.map((group) => (
              <div key={group.title} className="space-y-1.5">
                <div className="px-3 text-[10px] font-black tracking-widest text-zinc-400 uppercase">
                  {group.title}
                </div>
                <div className="space-y-1">
                  {group.items.map((item) => {
                    const isActive = pathname === item.href;
                    const IconComponent = item.icon;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setIsMobileOpen(false)}
                        className={`
                          flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all w-full
                          ${isActive 
                            ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 font-extrabold' 
                            : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/60'
                          }
                        `}
                      >
                        <div className={`p-1 rounded-lg ${isActive ? 'bg-white/20 text-white' : 'text-zinc-400'}`}>
                          <IconComponent size={16} />
                        </div>
                        <span className="truncate">{item.label}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>

          {/* Bottom User Profile Section */}
          <div className="p-3 border-t border-zinc-800/80 relative user-dropdown-container">
            <button
              onClick={() => setShowUserDropdown(!showUserDropdown)}
              className="flex items-center justify-between gap-2.5 rounded-xl p-2 text-xs bg-zinc-950/60 hover:bg-zinc-800 border border-zinc-800 transition-all w-full text-left"
            >
              <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-extrabold text-sm flex-shrink-0">
                {user?.full_name?.charAt(0) || 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-extrabold text-white text-xs truncate">{user?.full_name}</div>
                <div className="text-[10px] text-zinc-400 truncate uppercase font-semibold">{user?.account_type}</div>
              </div>
              <ChevronDown size={14} className="text-zinc-400 flex-shrink-0" />
            </button>

            {/* Dropdown Menu Popup */}
            {showUserDropdown && (
              <div className="absolute bottom-full left-3 right-3 mb-2 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl p-2 space-y-1 z-50">
                <div className="px-3 py-2 border-b border-zinc-800/80">
                  <div className="font-extrabold text-xs text-white">{user?.full_name}</div>
                  <div className="text-[10px] text-zinc-400 font-mono mt-0.5">{user?.mobile_number}</div>
                </div>
                <Link
                  href="/profile"
                  onClick={() => setShowUserDropdown(false)}
                  className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-zinc-300 hover:text-white hover:bg-zinc-800 rounded-xl transition-all w-full"
                >
                  <User size={14} />
                  <span>My Profile</span>
                </Link>
                <button
                  onClick={() => {
                    setShowUserDropdown(false);
                    handleLogout();
                  }}
                  className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-rose-400 hover:bg-rose-950/40 rounded-xl transition-all w-full"
                >
                  <LogOut size={14} />
                  <span>Sign Out</span>
                </button>
              </div>
            )}
          </div>

        </div>
      </aside>

      {/* Main Layout Body */}
      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen bg-zinc-950 overflow-hidden">
        
        {/* Drawoi Admin Top Navigation Bar */}
        <header className="sticky top-0 z-30 h-[64px] bg-zinc-900/90 border-b border-zinc-800/80 px-4 sm:px-8 flex items-center justify-between backdrop-blur-md">
          
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setIsMobileOpen(true)}
              className="lg:hidden p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 focus:outline-none"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div>
              <div className="flex items-center space-x-2 text-xs text-zinc-400 font-medium">
                <span>ShramSetu</span>
                <span>/</span>
                <span className="text-blue-400 font-bold">{getPageTitle()}</span>
              </div>
            </div>
          </div>

          {/* Right Action Icons & Badges */}
          <div className="flex items-center space-x-3">
            
            <Link
              href="/analytics"
              className="hidden sm:inline-flex items-center space-x-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 px-3 py-1.5 rounded-xl text-xs font-bold border border-zinc-700 transition-all"
            >
              <BarChart2 className="w-3.5 h-3.5 text-blue-400" />
              <span>Stats 📊</span>
            </Link>

            <Link
              href="/notifications"
              className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all relative"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-500 rounded-full animate-ping" />
            </Link>

            <div className="flex items-center space-x-2 bg-zinc-800/80 border border-zinc-700/80 px-3 py-1.5 rounded-xl text-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-extrabold text-white uppercase text-[11px] tracking-wider">{user?.account_type}</span>
            </div>

          </div>
        </header>

        {/* Main Content Workspace Canvas */}
        <main className="flex-1 p-4 sm:p-8 overflow-y-auto">
          <div className="max-w-7xl mx-auto space-y-6">
            {children}
          </div>
        </main>

      </div>

    </div>
  );
}
