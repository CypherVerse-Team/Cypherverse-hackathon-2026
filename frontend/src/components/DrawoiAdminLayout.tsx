'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { 
  LayoutDashboard, User, Briefcase, Building, CreditCard, 
  ShieldCheck, HelpCircle, Bell, BarChart2, Grid, Home, 
  Shield, LogOut, ChevronDown, Menu, X, Terminal, Cpu
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
    <div className="min-h-screen bg-[#0c0d0e] text-zinc-100 flex font-sans antialiased selection:bg-[#00e599]/30 selection:text-[#00e599]">
      
      {/* Mobile Drawer Overlay */}
      {isMobileOpen && (
        <div 
          onClick={() => setIsMobileOpen(false)}
          className="fixed inset-0 z-40 bg-[#0c0d0e]/80 backdrop-blur-md lg:hidden transition-opacity"
        />
      )}

      {/* Neon Database Style Console Sidebar */}
      <aside className={`
        fixed top-0 left-0 z-50 h-screen w-64 bg-[#0e0f12] border-r border-[#1f2023] flex flex-col justify-between transition-transform duration-300 ease-in-out
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="flex flex-col h-full overflow-hidden">
          
          {/* Brand Header with Neon Emblem */}
          <div className="flex items-center justify-between px-5 h-[64px] border-b border-[#1f2023]">
            <Link href="/" onClick={() => setIsMobileOpen(false)} className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-[#00e599] rounded-xl flex items-center justify-center text-black font-black text-base shadow-[0_0_20px_rgba(0,229,153,0.4)]">
                S
              </div>
              <span className="text-lg font-extrabold text-white tracking-tight flex items-center gap-1.5 font-sans">
                ShramSetu <span className="text-[10px] font-mono text-[#00e599] font-bold px-2 py-0.5 rounded-md bg-[#00e599]/10 border border-[#00e599]/30">Console</span>
              </span>
            </Link>

            <button
              onClick={() => setIsMobileOpen(false)}
              className="lg:hidden p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links with Neon Green Accent Highlights */}
          <nav className="flex-1 px-3 py-4 space-y-6 overflow-y-auto custom-scrollbar">
            {navGroups.map((group) => (
              <div key={group.title} className="space-y-1.5">
                <div className="px-3 text-[10px] font-mono tracking-widest text-zinc-500 uppercase font-semibold">
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
                          flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs transition-all w-full
                          ${isActive 
                            ? 'bg-[#181a20] text-[#00e599] border-l-2 border-[#00e599] font-extrabold shadow-[0_0_15px_rgba(0,229,153,0.1)] rounded-r-xl' 
                            : 'text-zinc-400 hover:text-zinc-100 hover:bg-[#14151a] font-medium'
                          }
                        `}
                      >
                        <div className={`p-1 rounded-lg flex-shrink-0 transition-colors ${isActive ? 'text-[#00e599]' : 'text-zinc-500'}`}>
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

          {/* Bottom Profile Section in Neon Dark Theme */}
          <div className="p-3 border-t border-[#1f2023] relative user-dropdown-container">
            <button
              onClick={() => setShowUserDropdown(!showUserDropdown)}
              className="flex items-center justify-between gap-2.5 rounded-2xl p-2.5 text-xs bg-[#141519] hover:bg-[#181a20] border border-[#22242b] transition-all w-full text-left cursor-pointer"
            >
              <div className="w-8 h-8 rounded-xl bg-[#00e599] text-black font-black flex items-center justify-center text-sm flex-shrink-0 shadow-[0_0_10px_rgba(0,229,153,0.3)]">
                {user?.full_name?.charAt(0) || 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-extrabold text-white text-xs truncate">{user?.full_name}</div>
                <div className="text-[10px] text-[#00e599] font-mono font-bold uppercase truncate">{user?.account_type}</div>
              </div>
              <ChevronDown size={14} className="text-zinc-400 flex-shrink-0" />
            </button>

            {/* Neon Dropdown Menu */}
            {showUserDropdown && (
              <div className="absolute bottom-full left-3 right-3 mb-2 bg-[#141519] border border-[#262832] rounded-2xl shadow-2xl p-2 space-y-1 z-50">
                <div className="px-3 py-2 border-b border-[#22242b]">
                  <div className="font-extrabold text-xs text-white">{user?.full_name}</div>
                  <div className="text-[10px] text-zinc-400 font-mono mt-0.5">{user?.mobile_number}</div>
                </div>
                <Link
                  href="/profile"
                  onClick={() => setShowUserDropdown(false)}
                  className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-zinc-300 hover:text-white hover:bg-[#1f212a] rounded-xl transition-all w-full"
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
      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen bg-[#0c0d0e] overflow-hidden">
        
        {/* Neon Console Top Navigation Bar */}
        <header className="sticky top-0 z-30 h-[64px] bg-[#0c0d0e]/95 border-b border-[#1f2023] px-4 sm:px-8 flex items-center justify-between backdrop-blur-md">
          
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setIsMobileOpen(true)}
              className="lg:hidden p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 focus:outline-none"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div>
              <div className="flex items-center space-x-2 text-xs text-zinc-400 font-mono">
                <span>Console</span>
                <span>/</span>
                <span className="text-[#00e599] font-bold">{getPageTitle()}</span>
              </div>
            </div>
          </div>

          {/* Right Action Icons & Neon Badges */}
          <div className="flex items-center space-x-3">
            
            <Link
              href="/analytics"
              className="hidden sm:inline-flex items-center space-x-1.5 bg-[#141519] hover:bg-[#1a1c23] text-[#00e599] border border-[#00e599]/30 px-3 py-1.5 rounded-xl text-xs font-bold font-mono shadow-[0_0_15px_rgba(0,229,153,0.1)] transition-all"
            >
              <BarChart2 className="w-3.5 h-3.5 text-[#00e599]" />
              <span>Stats 📊</span>
            </Link>

            <Link
              href="/notifications"
              className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-[#181a20] transition-all relative border border-[#1f2023]"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#00e599] rounded-full animate-ping" />
            </Link>

            <div className="flex items-center space-x-2 bg-[#141519] border border-[#22242b] px-3 py-1.5 rounded-xl text-xs">
              <span className="w-2 h-2 rounded-full bg-[#00e599] shadow-[0_0_10px_#00e599] animate-pulse" />
              <span className="font-extrabold text-white uppercase text-[11px] tracking-wider font-mono">{user?.account_type}</span>
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
