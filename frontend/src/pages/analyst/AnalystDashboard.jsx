import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, CheckCircle, XCircle, Activity, ArrowRight, Eye } from 'lucide-react';
import { getPendingReviewsApi, getAnalystStatsApi } from '../../services/api';
import StatCard from '../../components/common/StatCard';
import Badge from '../../components/common/Badge';
import SkeletonLoader from '../../components/common/SkeletonLoader';

const AnalystDashboard = () => {
  const [stats, setStats] = useState(null);
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [statsRes, pendingRes] = await Promise.all([
        getAnalystStatsApi(),
        getPendingReviewsApi()
      ]);
      if (statsRes.data.success) setStats(statsRes.data.stats);
      if (pendingRes.data.success) setPending(pendingRes.data.pending);
    } catch (err) {
      console.error('Failed to load analyst data:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold text-white">Fraud Analyst Control Center</h1>
        <p className="text-xs text-slate-400 mt-1">Real-time triage of flagged UPI transactions requiring manual investigation</p>
      </div>

      {loading ? (
        <SkeletonLoader count={4} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <StatCard title="Pending Investigation" value={stats?.pendingCount || 0} icon={ShieldAlert} color="amber" />
          <StatCard title="My Reviews Completed" value={stats?.totalReviewedByMe || 0} icon={CheckCircle} color="indigo" />
          <StatCard title="Total Approved" value={stats?.approvedCount || 0} icon={CheckCircle} color="emerald" />
          <StatCard title="Total Rejected / Fraud" value={stats?.rejectedCount || 0} icon={XCircle} color="rose" />
        </div>
      )}

      <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-100">High Risk Pending Queue</h2>
            <p className="text-xs text-slate-400">Transactions sorted by ML Risk Score descending</p>
          </div>
          <Link to="/analyst/pending" className="text-xs font-semibold text-indigo-400 hover:underline flex items-center gap-1">
            Open Full Queue ({pending.length}) <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <SkeletonLoader count={3} type="table" />
        ) : pending.length === 0 ? (
          <div className="text-center py-12 text-slate-500 text-sm">
            🎉 All pending fraud alerts cleared! No transactions waiting for analyst review.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="text-slate-400 border-b border-slate-800 uppercase tracking-wider font-semibold">
                  <th className="py-3 px-4">Txn ID</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Recipient</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Risk Score</th>
                  <th className="py-3 px-4">Flagged Reason</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {pending.slice(0, 5).map(({ transaction, prediction }) => (
                  <tr key={transaction._id} className="hover:bg-slate-900/60 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-medium text-slate-300">{transaction.transactionId}</td>
                    <td className="py-3.5 px-4 text-slate-200 font-semibold">{transaction.user?.name || 'Customer'}</td>
                    <td className="py-3.5 px-4 text-slate-400">{transaction.receiverUpi}</td>
                    <td className="py-3.5 px-4 font-bold text-slate-100">₹{transaction.amount.toLocaleString('en-IN')}</td>
                    <td className="py-3.5 px-4">
                      <span className="font-extrabold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-500/20">
                        {transaction.riskScore}/100
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-300">
                      {prediction?.reasons?.[0]?.title || 'Multiple High Risk Indicators'}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Link
                        to="/analyst/pending"
                        className="inline-flex items-center gap-1 py-1.5 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs"
                      >
                        Inspect & Review
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnalystDashboard;
