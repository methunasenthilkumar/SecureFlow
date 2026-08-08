import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Send,
  History,
  User,
  ShieldAlert,
  CheckCircle,
  Users,
  FileText,
  Sliders,
  BarChart3
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Sidebar = () => {
  const { user } = useAuth();
  if (!user) return null;

  const roleNavItems = {
    customer: [
      { name: 'Dashboard', path: '/customer/dashboard', icon: LayoutDashboard },
      { name: 'New Transaction', path: '/customer/submit', icon: Send },
      { name: 'My Transactions', path: '/customer/transactions', icon: History },
      { name: 'Profile Settings', path: '/customer/profile', icon: User }
    ],
    analyst: [
      { name: 'Analyst Control Center', path: '/analyst/dashboard', icon: LayoutDashboard },
      { name: 'Pending Reviews', path: '/analyst/pending', icon: ShieldAlert },
      { name: 'Review History', path: '/analyst/history', icon: CheckCircle }
    ],
    admin: [
      { name: 'Executive Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
      { name: 'User Management', path: '/admin/users', icon: Users },
      { name: 'Fraud Thresholds', path: '/admin/threshold', icon: Sliders },
      { name: 'Audit Security Logs', path: '/admin/audit-logs', icon: FileText },
      { name: 'Reports & Analytics', path: '/admin/reports', icon: BarChart3 }
    ]
  };

  const navItems = roleNavItems[user.role] || [];

  return (
    <aside className="w-64 border-r border-slate-800 bg-slate-950/60 p-4 flex flex-col justify-between hidden md:flex min-h-[calc(100vh-4rem)]">
      <div className="space-y-6">
        <div>
          <span className="text-[10px] uppercase font-extrabold tracking-widest text-slate-400 px-3 block mb-2">
            Main Navigation
          </span>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 ${
                      isActive
                        ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 shadow-glow-indigo'
                        : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900/60'
                    }`
                  }
                >
                  <Icon className="w-4 h-4" />
                  {item.name}
                </NavLink>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Role Badge Box */}
      <div className="p-4 rounded-2xl glass-card border border-slate-800">
        <div className="text-xs text-slate-400">Log in Active As</div>
        <div className="text-sm font-bold text-slate-200 capitalize mt-0.5">{user.name}</div>
        <div className="text-[11px] text-indigo-400 font-semibold uppercase mt-1 tracking-wider">
          {user.role} Authorization
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
