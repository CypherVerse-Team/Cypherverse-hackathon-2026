'use client';

import Link from 'next/link';
import { Menu, X, User, Bell, LogOut, Globe } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { fetchWithAuth } from '@/lib/api';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const { locale, setLocale, t } = useLanguage();
  const router = useRouter();

  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      loadNotifications();
      const interval = setInterval(loadNotifications, 30000); // Polling
      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  const loadNotifications = async () => {
    try {
      const res = await fetchWithAuth('/v1/notifications');
      if (res.ok) setNotifications(await res.json());
    } catch (e) {}
  };

  const markAsRead = async (id: string) => {
    await fetchWithAuth(`/v1/notifications/${id}/read`, { method: 'PATCH' });
    loadNotifications();
  };

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Left portion: Hamburger + Brand */}
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-1.5 mr-1.5 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 focus:outline-none transition-all md:hidden"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
            
            <Link href="/" className="flex-shrink-0 flex items-center">
              <span className="text-xl sm:text-2xl font-bold text-blue-600 tracking-tight">ShramSetu</span>
            </Link>
            
            <div className="hidden md:ml-6 md:flex md:space-x-6">
              <Link href="/" className="border-transparent text-gray-600 hover:text-blue-600 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                {t('nav.directory')}
              </Link>
              <Link href="/categories" className="border-transparent text-gray-600 hover:text-blue-600 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                Categories
              </Link>
              {isAuthenticated && ['CUSTOMER', 'CONTRACTOR'].includes(user?.account_type || '') && (
                <Link href="/dashboard" className="border-transparent text-gray-600 hover:text-blue-600 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                  {t('dashboard.myBookings')}
                </Link>
              )}
              {isAuthenticated && ['WORKER', 'GROUP_LEADER'].includes(user?.account_type || '') && (
                <Link href="/worker-dashboard" className="border-transparent text-gray-600 hover:text-blue-600 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                  {t('nav.dashboard')}
                </Link>
              )}
              <Link href="/contractor" className="border-transparent text-gray-600 hover:text-blue-600 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                Contractors
              </Link>
              {isAuthenticated && (
                <Link href="/analytics" className="border-transparent text-gray-600 hover:text-blue-600 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                  Stats 📊
                </Link>
              )}
              <Link href="/support" className="border-transparent text-gray-600 hover:text-blue-600 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                Support
              </Link>
              {user?.account_type === 'ADMIN' && (
                <Link href="/admin" className="border-transparent text-gray-600 hover:text-blue-600 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                  Admin
                </Link>
              )}
            </div>
          </div>
          
          {/* Right portion: Controls */}
          <div className="flex items-center space-x-1.5 xs:space-x-3 sm:space-x-4">
            <button 
              onClick={() => setLocale(locale === 'en' ? 'hi' : 'en')}
              className="flex items-center text-xs sm:text-sm font-medium text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 px-2 py-1 sm:px-3 sm:py-1.5 rounded-full transition-all duration-150 active:scale-95"
            >
              <Globe className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-0.5 sm:mr-1 text-gray-500" />
              {locale === 'en' ? 'EN' : 'हिन्दी'}
            </button>

            {isAuthenticated ? (
              <div className="relative">
                <button 
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="p-1.5 text-gray-400 hover:text-gray-500 hover:bg-gray-50 rounded-full relative transition-all duration-150 active:scale-95"
                >
                  <Bell className="h-5 w-5 sm:h-6 sm:w-6" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 flex items-center justify-center h-4 w-4 rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-white">
                      {unreadCount}
                    </span>
                  )}
                </button>
                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50">
                    <div className="px-4 py-2 font-bold text-gray-900 border-b flex justify-between items-center">
                      <span>Notifications</span>
                      <Link href="/notifications" onClick={() => setShowNotifications(false)} className="text-xs text-blue-600 hover:underline">View All</Link>
                    </div>
                    <div className="max-h-64 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="px-4 py-4 text-sm text-gray-500 text-center">No notifications</div>
                      ) : (
                        notifications.map(n => (
                          <div 
                            key={n.notification_id} 
                            onClick={() => {
                              if (!n.is_read) markAsRead(n.notification_id);
                              setShowNotifications(false);
                            }}
                            className={`px-4 py-3 border-b hover:bg-gray-50 cursor-pointer ${!n.is_read ? 'bg-blue-50/50' : ''}`}
                          >
                            <div className="text-sm font-bold text-gray-900">{n.title}</div>
                            <div className="text-xs text-gray-600 mt-1">{n.message}</div>
                            <div className="text-[10px] text-gray-400 mt-2">{new Date(n.created_at).toLocaleString()}</div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            ) : null}

            {isAuthenticated ? (
              <>
                {/* Desktop User profile info */}
                <Link href="/profile" className="hidden sm:flex items-center space-x-3 ml-2 hover:opacity-80 transition-opacity" title="Edit Profile Details">
                  <div className="text-sm text-right">
                    <div className="font-bold text-gray-900 leading-tight">{user?.full_name}</div>
                    <div className="text-blue-600 text-xs font-semibold">{user?.account_type}</div>
                  </div>
                  <div className="h-9 w-9 rounded-full bg-blue-100 ring-2 ring-blue-500/20 flex items-center justify-center text-blue-600">
                    <User className="h-5 w-5" />
                  </div>
                </Link>
                {/* Mobile User avatar */}
                <Link href="/profile" className="sm:hidden h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 cursor-pointer">
                  <User className="h-5 w-5" />
                </Link>
                <button onClick={handleLogout} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all duration-150 active:scale-95 hidden sm:block" title="Logout">
                  <LogOut className="h-5 w-5" />
                </button>
              </>
            ) : (
              <div className="flex items-center space-x-1.5 xs:space-x-3 sm:space-x-4">
                <Link href="/login" className="text-gray-500 hover:text-gray-900 font-medium text-xs sm:text-sm px-1.5 py-1.5 rounded-lg hover:bg-gray-50 transition-all duration-150 active:scale-95">
                  Log In
                </Link>
                <Link href="/register" className="bg-blue-600 hover:bg-blue-700 text-white px-2.5 py-1.5 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-sm font-medium shadow-sm transition-all duration-150 active:scale-95">
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Drawer Navigation Menu */}
      <div 
        className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out bg-white ${
          isMenuOpen ? 'max-h-[500px] border-t border-gray-100 opacity-100' : 'max-h-0 opacity-0 pointer-events-none'
        }`}
      >
        <div className="px-4 py-3 space-y-2 shadow-inner">
          <div className="grid grid-cols-2 gap-2">
            <Link 
              href="/" 
              onClick={() => setIsMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-blue-50 transition-all"
            >
              {t('nav.directory')}
            </Link>
            <Link 
              href="/categories" 
              onClick={() => setIsMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-blue-50 transition-all"
            >
              Categories
            </Link>
            {isAuthenticated && ['CUSTOMER', 'CONTRACTOR'].includes(user?.account_type || '') && (
              <Link 
                href="/dashboard" 
                onClick={() => setIsMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-blue-50 transition-all"
              >
                {t('dashboard.myBookings')}
              </Link>
            )}
            {isAuthenticated && ['WORKER', 'GROUP_LEADER'].includes(user?.account_type || '') && (
              <Link 
                href="/worker-dashboard" 
                onClick={() => setIsMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-blue-50 transition-all"
              >
                {t('nav.dashboard')}
              </Link>
            )}
            <Link 
              href="/contractor" 
              onClick={() => setIsMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-blue-50 transition-all"
            >
              Contractor Hub
            </Link>
            {isAuthenticated && (
              <Link 
                href="/analytics" 
                onClick={() => setIsMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-blue-50 transition-all"
              >
                Stats 📊
              </Link>
            )}
            <Link 
              href="/support" 
              onClick={() => setIsMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-blue-50 transition-all"
            >
              Support Center
            </Link>
            {user?.account_type === 'ADMIN' && (
              <Link 
                href="/admin" 
                onClick={() => setIsMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-blue-50 transition-all"
              >
                Admin Panel
              </Link>
            )}
          </div>

          {/* Mobile Profile & Logout Section */}
          {isAuthenticated && (
            <div className="pt-3 border-t border-gray-100 flex items-center justify-between px-3">
              <div className="flex items-center space-x-3">
                <div className="h-9 w-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                  <User className="h-5 w-5" />
                </div>
                <div>
                  <div className="font-semibold text-gray-900 text-sm leading-none">{user?.full_name}</div>
                  <div className="text-gray-500 text-xs mt-1">{user?.account_type}</div>
                </div>
              </div>
              <button 
                onClick={() => {
                  setIsMenuOpen(false);
                  handleLogout();
                }}
                className="flex items-center space-x-1 px-3 py-2 rounded-xl border border-red-100 text-red-600 hover:bg-red-50 text-sm font-medium transition-all duration-150 active:scale-95"
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
