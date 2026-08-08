import React, { useState, useEffect } from 'react';
import {
  Users,
  Activity,
  ShieldAlert,
  CheckCircle,
  XCircle,
  TrendingUp,
  PieChart as PieIcon,
  BarChart2
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid
} from 'recharts';
import { getAdminDashboardApi } from '../../services/api';
import StatCard from '../../components/common/StatCard';
import SkeletonLoader from '../../components/common/SkeletonLoader';

const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const res = await getAdminDashboardApi();
      if (res.data.success) {
        setData(res.data);
      }
    } catch (err) {
      console.error('Failed to load admin metrics:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <SkeletonLoader count={4} />;

  const stats = data?.stats || {};
  const charts = data?.charts || {};

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold text-white">Executive Administrator Analytics</h1>
        <p className="text-xs text-slate-400 mt-1">Real-time macro view of system throughput, fraud trends, and risk distributions</p>
      </div>

      {/* Top Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard title="Total Platform Users" value={stats.totalUsers || 0} icon={Users} color="indigo" />
        <StatCard title="Total UPI Volume (Count)" value={stats.totalTransactions || 0} icon={Activity} color="cyan" />
        <StatCard title="Total Flagged Fraud" value={stats.fraudCount || 0} icon={ShieldAlert} color="rose" />
        <StatCard title="Fraud Incidence Rate" value={`${stats.fraudPercentage || 0}%`} icon={TrendingUp} color="amber" />
      </div>

      {/* Recharts Row 1: Daily Volume Area Chart + Risk Pie Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Daily Transactions Area Chart */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <BarChart2 className="w-5 h-5 text-indigo-400" /> Daily Transaction & Fraud Trend (Last 7 Days)
            </h3>
          </div>
          <div className="h-72 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={charts.dailyTransactions || []}>
                <defs>
                  <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorRejected" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="date" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Area type="monotone" dataKey="total" name="Total Transfers" stroke="#6366f1" fillOpacity={1} fill="url(#colorTotal)" />
                <Area type="monotone" dataKey="rejected" name="Fraud / Rejected" stroke="#ef4444" fillOpacity={1} fill="url(#colorRejected)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Risk Distribution Pie Chart */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
          <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <PieIcon className="w-5 h-5 text-cyan-400" /> Risk Score Severity Distribution
          </h3>
          <div className="h-72 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={charts.riskDistribution || []}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="count"
                  nameKey="level"
                >
                  {(charts.riskDistribution || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recharts Row 2: Monthly Trend Bar Chart */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
        <h3 className="text-base font-bold text-slate-100">Monthly Platform Growth vs Fraud Multi-Month Comparison</h3>
        <div className="h-64 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={charts.monthlyFraudTrend || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
              <YAxis stroke="#64748b" fontSize={12} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
              />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <Bar dataKey="total" name="Total Volume" fill="#3b82f6" radius={[6, 6, 0, 0]} />
              <Bar dataKey="fraud" name="Flagged Fraud" fill="#f59e0b" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
