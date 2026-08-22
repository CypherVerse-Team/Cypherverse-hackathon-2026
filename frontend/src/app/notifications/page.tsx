'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { fetchWithAuth } from '@/lib/api';
import { Bell, CheckCheck, Clock, ShieldAlert, CheckCircle, Info, Calendar } from 'lucide-react';
import Link from 'next/link';
import AccountQuickHub from '@/components/AccountQuickHub';

export default function NotificationsPage() {
  const { user, isAuthenticated } = useAuth();

  const [notifications, setNotifications] = useState<any[]>([]);
  const [filter, setFilter] = useState<'ALL' | 'UNREAD'>('ALL');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isAuthenticated) {
      loadNotifications();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated]);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const res = await fetchWithAuth('/v1/notifications');
      if (res.ok) setNotifications(await res.json());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id: string) => {
    await fetchWithAuth(`/v1/notifications/${id}/read`, { method: 'PATCH' });
    loadNotifications();
  };

  const markAllAsRead = async () => {
    await fetchWithAuth('/v1/notifications/read-all', { method: 'PATCH' });
    loadNotifications();
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-xl mx-auto py-16 text-center bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
        <Bell className="w-16 h-16 text-blue-600 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Notifications Center</h2>
        <p className="text-gray-600 mb-6">Please log in to view booking alerts, payment receipts, and verification updates.</p>
        <Link href="/login" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold text-sm inline-block">
          Log In Now
        </Link>
      </div>
    );
  }

  const filteredNotifications = notifications.filter(n => filter === 'ALL' || !n.is_read);
  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Notifications Column */}
        <div className="lg:col-span-2 space-y-8">
          {/* Header */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold relative">
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full ring-2 ring-white" />
                  )}
                </div>
                <div>
                  <h1 className="text-2xl font-extrabold text-gray-900">Notifications Center</h1>
                  <p className="text-xs text-gray-500">{unreadCount} unread alert(s)</p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="bg-gray-100 p-1 rounded-xl flex text-xs font-semibold">
                <button 
                  onClick={() => setFilter('ALL')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${filter === 'ALL' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
                >
                  All ({notifications.length})
                </button>
                <button 
                  onClick={() => setFilter('UNREAD')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${filter === 'UNREAD' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
                >
                  Unread ({unreadCount})
                </button>
              </div>

              {unreadCount > 0 && (
                <button 
                  onClick={markAllAsRead}
                  className="px-3.5 py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-xl text-xs font-semibold flex items-center transition-colors"
                >
                  <CheckCheck className="w-4 h-4 mr-1.5" /> Mark All Read
                </button>
              )}
            </div>
          </div>

          {/* Notifications List */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
            {filteredNotifications.length === 0 ? (
              <div className="py-16 text-center text-gray-500">
                <Info className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-sm font-medium">No notifications matching selected filter.</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {filteredNotifications.map((n: any) => (
                  <div 
                    key={n.notification_id}
                    onClick={() => {
                      if (!n.is_read) markAsRead(n.notification_id);
                    }}
                    className={`p-6 transition-colors cursor-pointer flex items-start justify-between space-x-4 ${!n.is_read ? 'bg-blue-50/40 hover:bg-blue-50/70' : 'hover:bg-gray-50'}`}
                  >
                    <div className="flex items-start space-x-4">
                      <div className={`w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 font-bold ${!n.is_read ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-500'}`}>
                        <Bell className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h3 className="font-bold text-gray-900 text-sm">{n.title}</h3>
                          {!n.is_read && (
                            <span className="w-2 h-2 rounded-full bg-blue-600 inline-block" />
                          )}
                        </div>
                        <p className="text-xs text-gray-600 mt-1 leading-relaxed">{n.message}</p>
                        <span className="text-[11px] text-gray-400 mt-2 block flex items-center">
                          <Calendar className="w-3 h-3 mr-1" /> {new Date(n.created_at).toLocaleString()}
                        </span>
                      </div>
                    </div>

                    {!n.is_read && (
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          markAsRead(n.notification_id);
                        }}
                        className="text-xs text-blue-600 hover:text-blue-800 font-semibold whitespace-nowrap"
                      >
                        Mark Read
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Side Column: Account Quick Hub */}
        <div className="space-y-6">
          <AccountQuickHub />
        </div>
      </div>
    </div>
  );
}
