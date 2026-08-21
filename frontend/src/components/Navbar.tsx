'use client';

import Link from 'next/link';
import { Menu, User, Bell, LogOut, Globe } from 'lucide-react';
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
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Menu className="h-6 w-6 text-gray-500 mr-4 sm:hidden" />
            <Link href="/" className="flex-shrink-0 flex items-center">
              <span className="text-2xl font-bold text-blue-600">ShramSetu</span>
            </Link>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link href="/" className="border-blue-500 text-gray-900 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                {t('nav.directory')}
              </Link>
              {isAuthenticated && ['CUSTOMER', 'CONTRACTOR'].includes(user?.account_type || '') && (
                <Link href="/dashboard" className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                  {t('dashboard.myBookings')}
                </Link>
              )}
              {isAuthenticated && ['WORKER', 'GROUP_LEADER'].includes(user?.account_type || '') && (
                <Link href="/worker-dashboard" className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                  {t('nav.dashboard')}
                </Link>
              )}
              {user?.account_type === 'ADMIN' && (
                <Link href="/admin" className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                  Admin Panel
                </Link>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-4">
            
            <button 
              onClick={() => setLocale(locale === 'en' ? 'hi' : 'en')}
              className="flex items-center text-sm font-medium text-gray-600 hover:text-gray-900 bg-gray-100 px-3 py-1.5 rounded-full"
            >
              <Globe className="w-4 h-4 mr-1 text-gray-500" />
              {locale === 'en' ? 'EN' : 'हिन्दी'}
            </button>

            {isAuthenticated ? (
              <div className="relative">
                <button 
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="p-2 text-gray-400 hover:text-gray-500 relative"
                >
                  <Bell className="h-6 w-6" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 flex items-center justify-center h-4 w-4 rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-white">
                      {unreadCount}
                    </span>
                  )}
                </button>
                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50">
                    <div className="px-4 py-2 font-bold text-gray-900 border-b">Notifications</div>
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
                <div className="flex items-center space-x-3 ml-2">
                  <div className="text-sm text-right hidden sm:block">
                    <div className="font-medium text-gray-900">{user?.full_name}</div>
                    <div className="text-gray-500 text-xs">{user?.account_type}</div>
                  </div>
                  <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                    <User className="h-5 w-5" />
                  </div>
                </div>
                <button onClick={handleLogout} className="p-2 text-gray-400 hover:text-red-500 transition-colors" title="Logout">
                  <LogOut className="h-5 w-5" />
                </button>
              </>
            ) : (
              <div className="flex items-center space-x-4">
                <Link href="/login" className="text-gray-500 hover:text-gray-900 font-medium text-sm">
                  Log In
                </Link>
                <Link href="/register" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
