'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { 
  LayoutDashboard, User, Briefcase, Building, CreditCard, 
  ShieldCheck, HelpCircle, Bell, BarChart2, Grid, Home, 
  Shield, LogOut, ChevronDown, Menu, X, Users,
  CheckCircle, MessageSquareWarning, Layers, TrendingUp, Settings
} from 'lucide-react';

function DrawoiAdminLayoutContent({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, logout } = useAuth();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentTab = searchParams.get('tab');
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

  const isAdmin = user?.account_type === 'ADMIN';

  // Dedicated Admin management options vs regular user options
  const adminNavItems = [
    { label: 'Admin Dashboard', href: '/admin', tab: 'overview', icon: LayoutDashboard },
    { label: 'Manage Workers', href: '/admin?tab=workers', tab: 'workers', icon: Briefcase },
    { label: 'Manage Customers', href: '/admin?tab=customers', tab: 'customers', icon: Users },
    { label: 'Manage Contractors', href: '/admin?tab=contractors', tab: 'contractors', icon: Building },
    { label: 'Manage Works / Jobs', href: '/admin?tab=works', tab: 'works', icon: CheckCircle },
    { label: 'Worker KYC Status', href: '/admin?tab=verifications', tab: 'verifications', icon: ShieldCheck },
    { label: 'Manage Categories', href: '/categories', tab: 'categories', icon: Grid },
    { label: 'Disputes & Complaints', href: '/admin?tab=complaints', tab: 'complaints', icon: MessageSquareWarning },
    { label: 'Bulk Matchmaking', href: '/admin?tab=matchmaking', tab: 'matchmaking', icon: Layers },
    { label: 'Financials & Invoices', href: '/admin?tab=financials', tab: 'financials', icon: CreditCard },
    { label: 'Platform Analytics', href: '/analytics', icon: BarChart2 },
    { label: 'Worker Directory', href: '/', icon: Home },
  ];

  const userNavItems = [
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
  ];

  const navItems = isAdmin ? adminNavItems : userNavItems;

  const getPageTitle = () => {
    if (isAdmin && pathname === '/admin') {
      if (currentTab === 'workers') return 'Manage Workers';
      if (currentTab === 'customers') return 'Manage Customers';
      if (currentTab === 'contractors') return 'Manage Contractors';
      if (currentTab === 'works') return 'Manage Works & Bookings';
      if (currentTab === 'verifications') return 'Worker KYC Status';
      if (currentTab === 'complaints') return 'Disputes & Complaints';
      if (currentTab === 'matchmaking') return 'Bulk Matchmaking';
      if (currentTab === 'financials') return 'Financials & Invoices';
      if (currentTab === 'stats') return 'Platform Summary Stats';
      return 'Admin Dashboard';
    }
    if (pathname === '/') return 'Worker Directory';
    if (pathname === '/profile') return 'My Profile';
    if (pathname === '/worker-dashboard') return 'Worker Dashboard';
    if (pathname === '/dashboard') return 'Customer Dashboard';
    if (pathname === '/payments') return 'Payments';
    if (pathname === '/verification') return 'KYC Verification';
    if (pathname === '/analytics') return 'Platform Statistics';
    if (pathname === '/contractor') return 'Contractor & Team';
    if (pathname === '/support') return 'Support';
    if (pathname === '/notifications') return 'Notifications';
    if (pathname === '/admin') return 'Admin Panel';
    if (pathname === '/categories') return 'Manage Categories';
    return 'Dashboard';
  };

  const isItemActive = (item: any) => {
    if (isAdmin && pathname === '/admin') {
      if (item.tab) {
        if (!currentTab && item.tab === 'overview') return true;
        return currentTab === item.tab;
      }
    }
    return pathname === item.href;
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

      {/* Sidebar — clean Drawoi Admin style */}
      <aside className={`
        fixed top-0 left-0 z-50 h-screen w-60 bg-white border-r border-gray-200 flex flex-col transition-transform duration-300 ease-in-out shadow-sm
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>

        {/* Logo / Brand Header */}
        <div className="flex items-center gap-3 px-5 h-[60px] border-b border-gray-100 flex-shrink-0">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-sm flex-shrink-0 shadow-sm">
            {isAdmin ? '🛡️' : 'S'}
          </div>
          <div className="min-w-0">
            <span className="text-[15px] font-bold text-gray-900 tracking-tight leading-tight block">
              ShramSetu
            </span>
            {isAdmin && (
              <span className="text-[10px] text-blue-600 font-bold uppercase tracking-wider block">
                Admin Console
              </span>
            )}
          </div>
          <button onClick={() => setIsMobileOpen(false)} className="ml-auto lg:hidden text-gray-400 hover:text-gray-600">
            <X size={16} />
          </button>
        </div>

        {/* Nav Items */}
        <nav className="flex-1 px-3 py-3 overflow-y-auto space-y-0.5">
          {navItems.map((item) => {
            const isActive = isItemActive(item);
            const IconComponent = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsMobileOpen(false)}
                className={`
                  flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all w-full
                  ${isActive
                    ? 'bg-blue-50 text-blue-600 font-semibold'
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
            <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs flex-shrink-0 ${
              isAdmin ? 'bg-indigo-600 text-white' : 'bg-blue-600 text-white'
            }`}>
              {user?.full_name?.charAt(0) || 'A'}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-semibold text-gray-900 truncate">{user?.full_name || 'Admin'}</div>
              <div className="text-[10px] text-gray-400 truncate">{user?.mobile_number || user?.account_type}</div>
            </div>
            <ChevronDown size={13} className="text-gray-400 flex-shrink-0" />
          </button>

          {showUserDropdown && (
            <div className="absolute bottom-full left-2 right-2 mb-1 bg-white border border-gray-200 rounded-xl shadow-xl p-1.5 space-y-0.5 z-50">
              <div className="px-3 py-2 border-b border-gray-100">
                <div className="font-semibold text-xs text-gray-900">{user?.full_name}</div>
                <div className="text-[10px] text-blue-600 mt-0.5 uppercase font-bold">{user?.account_type} ACCOUNT</div>
              </div>
              <Link
                href="/profile"
                onClick={() => setShowUserDropdown(false)}
                className="flex items-center gap-2 px-3 py-2 text-xs text-gray-700 hover:bg-gray-50 rounded-lg transition-all w-full font-medium"
              >
                <User size={13} className="text-gray-400" />
                <span>My Profile</span>
              </Link>
              <button
                onClick={() => { setShowUserDropdown(false); handleLogout(); }}
                className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-red-500 hover:bg-red-50 rounded-lg transition-all w-full"
              >
                <LogOut size={13} />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 lg:ml-60 flex flex-col min-h-screen overflow-hidden">

        {/* Top Header Bar */}
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
              <span className="text-gray-400 font-medium">ShramSetu</span>
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
              <div className={`w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                isAdmin ? 'bg-indigo-600 text-white' : 'bg-blue-600 text-white'
              }`}>
                {user?.full_name?.charAt(0) || 'A'}
              </div>
              <div className="leading-tight">
                <div className="text-xs font-semibold text-gray-900 truncate max-w-[120px]">{user?.full_name}</div>
                <div className="text-[10px] text-blue-600 font-bold uppercase">{user?.account_type}</div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 overflow-y-auto bg-gray-50">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

export default function DrawoiAdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 p-6">Loading workspace...</div>}>
      <DrawoiAdminLayoutContent>{children}</DrawoiAdminLayoutContent>
    </Suspense>
  );
}
