'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { 
  LayoutDashboard, User, Briefcase, Building, CreditCard, 
  ShieldCheck, HelpCircle, Bell, BarChart2, Grid, Home, 
  Shield, LogOut, ChevronDown, Menu, X, Search
} from 'lucide-react';

export default function DrawoiAdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);

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

  if (!isAuthenticated) return <>{children}</>;

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const navItems = [
    ...( ['CUSTOMER', 'CONTRACTOR'].includes(user?.account_type || '') 
        ? [{ label: 'Customer Dashboard', href: '/dashboard', icon: LayoutDashboard }] 
        : []
    ),
    ...( ['WORKER', 'GROUP_LEADER'].includes(user?.account_type || '') 
        ? [{ label: 'Worker Dashboard', href: '/worker-dashboard', icon: Briefcase }] 
        : []
    ),
    { label: 'My Profile', href: '/profile', icon: User },
    { label: 'Contractor & Team', href: '/contractor', icon: Building },
    { label: 'Payments', href: '/payments', icon: CreditCard },
    { label: 'KYC Verification', href: '/verification', icon: ShieldCheck },
    { label: 'Statistics', href: '/analytics', icon: BarChart2 },
    { label: 'Notifications', href: '/notifications', icon: Bell },
    { label: 'Support', href: '/support', icon: HelpCircle },
    { label: 'Categories', href: '/categories', icon: Grid },
    { label: 'Worker Directory', href: '/', icon: Home },
    ...( user?.account_type === 'ADMIN' 
        ? [{ label: 'Admin Panel', href: '/admin', icon: Shield }] 
        : []
    ),
  ];

  const getPageTitle = () => {
    if (pathname === '/') return 'Worker Directory';
    if (pathname === '/profile') return 'My Profile';
    if (pathname === '/worker-dashboard') return 'Worker Dashboard';
    if (pathname === '/dashboard') return 'Customer Dashboard';
    if (pathname === '/payments') return 'Payments';
    if (pathname === '/verification') return 'KYC Verification';
    if (pathname === '/analytics') return 'Statistics';
    if (pathname === '/contractor') return 'Contractor & Team';
    if (pathname === '/support') return 'Support';
    if (pathname === '/notifications') return 'Notifications';
    if (pathname === '/admin') return 'Admin Panel';
    if (pathname === '/categories') return 'Categories';
    return 'Dashboard';
  };

  return (
    <div className="min-h-screen bg-gray-50 flex font-sans antialiased text-gray-900">

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          onClick={() => setIsMobileOpen(false)}
          className="fixed inset-0 z-40 bg-black/20 lg:hidden"
        />
      )}

      {/* Sidebar — wider, clean Drawoi Admin style */}
      <aside className={`
        fixed top-0 left-0 z-50 h-screen w-56 bg-white border-r border-gray-200 flex flex-col transition-transform duration-300 ease-in-out shadow-sm
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>

        {/* Logo / Brand Header */}
        <div className="flex items-center gap-3 px-5 h-[60px] border-b border-gray-100 flex-shrink-0">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-sm flex-shrink-0 shadow-sm">
            S
          </div>
          <span className="text-[15px] font-bold text-gray-900 tracking-tight leading-tight">ShramSetu</span>
          <button onClick={() => setIsMobileOpen(false)} className="ml-auto lg:hidden text-gray-400 hover:text-gray-600">
            <X size={16} />
          </button>
        </div>

        {/* Nav Items */}
        <nav className="flex-1 px-3 py-3 overflow-y-auto space-y-0.5">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const IconComponent = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsMobileOpen(false)}
                className={`
                  flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all w-full
                  ${isActive
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }
                `}
              >
                <IconComponent
                  size={16}
                  className={isActive ? 'text-blue-600 flex-shrink-0' : 'text-gray-400 flex-shrink-0'}
                  strokeWidth={isActive ? 2.5 : 1.75}
                />
                <span className="truncate">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Bottom — user info + dropdown */}
        <div className="p-3 border-t border-gray-100 flex-shrink-0 user-dropdown-container relative">
          <button
            onClick={() => setShowUserDropdown(!showUserDropdown)}
            className="flex items-center gap-2 w-full px-3 py-2 rounded-lg hover:bg-gray-50 transition-all text-left"
          >
            <div className="w-6 h-6 rounded-md bg-blue-600 text-white flex items-center justify-center font-bold text-xs flex-shrink-0">
              {user?.full_name?.charAt(0) || 'U'}
            </div>
            <span className="text-sm text-gray-500 truncate flex-1 font-medium">
              {user?.full_name || user?.mobile_number}
            </span>
            <ChevronDown size={13} className="text-gray-400 flex-shrink-0" />
          </button>

          {showUserDropdown && (
            <div className="absolute bottom-full left-2 right-2 mb-1 bg-white border border-gray-200 rounded-xl shadow-xl p-1.5 space-y-0.5 z-50">
              <div className="px-3 py-2 border-b border-gray-100">
                <div className="font-semibold text-sm text-gray-900">{user?.full_name}</div>
                <div className="text-xs text-gray-400 mt-0.5 uppercase font-medium">{user?.account_type}</div>
              </div>
              <Link
                href="/profile"
                onClick={() => setShowUserDropdown(false)}
                className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-all w-full font-medium"
              >
                <User size={14} className="text-gray-400" />
                <span>My Profile</span>
              </Link>
              <button
                onClick={() => { setShowUserDropdown(false); handleLogout(); }}
                className="flex items-center gap-2 px-3 py-2 text-sm font-semibold text-red-500 hover:bg-red-50 rounded-lg transition-all w-full"
              >
                <LogOut size={14} />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 lg:ml-56 flex flex-col min-h-screen overflow-hidden">

        {/* Top Header Bar — clean, full-width, properly aligned */}
        <header className="sticky top-0 z-30 h-[60px] bg-white border-b border-gray-200 px-6 flex items-center justify-between shadow-sm">
          
          {/* Left: Mobile menu + Page title */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileOpen(true)}
              className="lg:hidden p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 focus:outline-none"
            >
              <Menu size={18} />
            </button>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <span className="text-gray-400">ShramSetu</span>
              <span className="text-gray-300">/</span>
              <span className="font-semibold text-gray-900">{getPageTitle()}</span>
            </div>
          </div>

          {/* Right: User badge + notifications */}
          <div className="flex items-center gap-2">
            <Link
              href="/notifications"
              className="relative p-2 rounded-lg text-gray-400 hover:bg-gray-50 hover:text-gray-700 transition-all"
              title="Notifications"
            >
              <Bell size={17} />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-blue-500 rounded-full" />
            </Link>

            <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 pl-2 pr-3 py-1.5 rounded-lg">
              <div className="w-6 h-6 rounded-md bg-blue-600 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
                {user?.full_name?.charAt(0) || 'U'}
              </div>
              <div className="leading-tight">
                <div className="text-xs font-semibold text-gray-900 truncate max-w-[100px]">{user?.full_name}</div>
                <div className="text-[10px] text-gray-400 uppercase font-medium">{user?.account_type}</div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 overflow-y-auto bg-gray-50">
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
