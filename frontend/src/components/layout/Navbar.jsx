import React, { useState, useEffect } from 'react';
import { Shield, Bell, Sun, Moon, LogOut, User as UserIcon, CheckCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { getNotificationsApi, markNotificationReadApi, markAllNotificationsReadApi } from '../../services/api';
import Badge from '../common/Badge';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);

  const fetchNotifications = async () => {
    try {
      const res = await getNotificationsApi();
      if (res.data.success) {
        setNotifications(res.data.notifications);
        setUnreadCount(res.data.unreadCount);
      }
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    }
  };

  useEffect(() => {
    if (user) {
      fetchNotifications();
    }
  }, [user]);

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsReadApi();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <header className="h-16 border-b border-slate-800 bg-slate-950/80 backdrop-blur-xl sticky top-0 z-40 px-6 flex items-center justify-between">
      {/* Brand Logo */}
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-500 text-white shadow-glow-indigo">
          <Shield className="w-6 h-6" />
        </div>
        <div>
          <span className="text-xl font-extrabold tracking-tight gradient-text">UPIShield</span>
          <span className="hidden md:inline-block ml-2 text-[10px] uppercase font-bold tracking-widest text-slate-400 border border-slate-800 px-2 py-0.5 rounded-full">
            AI Fraud Guard
          </span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-4">
        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl border border-slate-800 bg-slate-900/60 text-slate-400 hover:text-white hover:border-slate-700 transition-all"
          title="Toggle Theme"
        >
          {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>

        {/* Notifications Icon & Popover */}
        <div className="relative">
          <button
            onClick={() => {
              setShowNotifications(!showNotifications);
              if (!showNotifications) fetchNotifications();
            }}
            className="p-2 rounded-xl border border-slate-800 bg-slate-900/60 text-slate-400 hover:text-white hover:border-slate-700 transition-all relative"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-bounce">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 mt-3 w-80 md:w-96 glass-panel bg-slate-900/95 border border-slate-700/60 rounded-2xl shadow-2xl p-4 z-50 animate-fadeIn">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <h4 className="font-bold text-sm text-slate-100 flex items-center gap-2">
                  Notifications ({unreadCount} unread)
                </h4>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="text-xs text-indigo-400 hover:underline flex items-center gap-1"
                  >
                    <CheckCheck className="w-3.5 h-3.5" /> Mark all read
                  </button>
                )}
              </div>

              <div className="max-h-72 overflow-y-auto mt-3 space-y-2.5 custom-scrollbar">
                {notifications.length === 0 ? (
                  <p className="text-xs text-slate-500 text-center py-6">No notifications found.</p>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n._id}
                      className={`p-3 rounded-xl border text-xs transition-all ${
                        n.isRead
                          ? 'bg-slate-900/40 border-slate-800/60 text-slate-400'
                          : 'bg-slate-800/80 border-indigo-500/30 text-slate-200'
                      }`}
                    >
                      <div className="font-semibold text-slate-100 mb-0.5">{n.title}</div>
                      <p className="leading-relaxed">{n.message}</p>
                      <span className="text-[10px] text-slate-500 mt-1 block">
                        {new Date(n.createdAt).toLocaleTimeString()}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Info & Role */}
        {user && (
          <div className="flex items-center gap-3 pl-2 border-l border-slate-800">
            <div className="w-9 h-9 rounded-xl bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-indigo-300 font-bold text-sm">
              {user.name.charAt(0)}
            </div>
            <div className="hidden sm:block">
              <div className="text-sm font-semibold text-slate-200 leading-tight">{user.name}</div>
              <div className="flex items-center gap-1.5 mt-0.5">
                <Badge type={user.role} text={user.role.toUpperCase()} />
              </div>
            </div>
            <button
              onClick={logout}
              className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-all ml-1"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
