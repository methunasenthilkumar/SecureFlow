import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Send, Shield, CreditCard, Activity, CheckCircle, AlertTriangle, ArrowUpRight } from 'lucide-react';
import { getMyTransactionsApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import StatCard from '../../components/common/StatCard';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import RiskMeter from '../../components/common/RiskMeter';
import XAICard from '../../components/common/XAICard';
import SkeletonLoader from '../../components/common/SkeletonLoader';

const CustomerDashboard = () => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTxn, setSelectedTxn] = useState(null);

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      const res = await getMyTransactionsApi();
      if (res.data.success) {
        setTransactions(res.data.transactions);
      }
    } catch (err) {
      console.error('Failed to fetch transactions:', err);
    } finally {
      setLoading(false);
    }
  };

  const totalSpent = transactions
    .filter(t => t.status === 'APPROVED')
    .reduce((acc, t) => acc + t.amount, 0);

  const pendingReviewCount = transactions.filter(t => t.status === 'PENDING_REVIEW').length;
  const approvedCount = transactions.filter(t => t.status === 'APPROVED').length;

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl glass-card border border-indigo-500/20 bg-gradient-to-r from-indigo-950/40 via-slate-900 to-slate-900">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white">
            Welcome back, <span className="gradient-text">{user?.name}</span>!
          </h1>
          <p className="text-xs md:text-sm text-slate-400 mt-1">
            Your UPI Account (<span className="text-indigo-300 font-mono">{user?.upiId}</span>) is active & protected by UPIShield.
          </p>
        </div>
        <Link
          to="/customer/submit"
          className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white font-bold text-sm shadow-glow-indigo transition-all"
        >
          <Send className="w-4 h-4" /> Send Money (UPI)
        </Link>
      </div>

      {/* Metrics Row */}
      {loading ? (
        <SkeletonLoader count={4} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <StatCard title="Total Volume Spent" value={`₹${totalSpent.toLocaleString('en-IN')}`} icon={CreditCard} color="indigo" />
          <StatCard title="Total Transactions" value={transactions.length} icon={Activity} color="cyan" />
          <StatCard title="Approved Transfers" value={approvedCount} icon={CheckCircle} color="emerald" />
          <StatCard title="Under Security Review" value={pendingReviewCount} icon={AlertTriangle} color={pendingReviewCount > 0 ? 'amber' : 'indigo'} />
        </div>
      )}

      {/* Recent Transactions List */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-100">Recent UPI Transactions</h2>
            <p className="text-xs text-slate-400">Click any transaction to inspect AI risk scores & XAI reasons</p>
          </div>
          <Link to="/customer/transactions" className="text-xs font-semibold text-indigo-400 hover:underline flex items-center gap-1">
            View All <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <SkeletonLoader count={3} type="table" />
        ) : transactions.length === 0 ? (
          <div className="text-center py-12 text-slate-500 text-sm">
            No transactions found. Click "Send Money (UPI)" to initiate your first transfer.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="text-slate-400 border-b border-slate-800 uppercase tracking-wider font-semibold">
                  <th className="py-3 px-4">Txn ID</th>
                  <th className="py-3 px-4">Recipient</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Risk Score</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {transactions.slice(0, 5).map((txn) => (
                  <tr
                    key={txn._id}
                    onClick={() => setSelectedTxn(txn)}
                    className="hover:bg-slate-900/60 transition-colors cursor-pointer"
                  >
                    <td className="py-3.5 px-4 font-mono font-medium text-slate-300">{txn.transactionId}</td>
                    <td className="py-3.5 px-4 font-semibold text-slate-200">{txn.receiverName || txn.receiverUpi}</td>
                    <td className="py-3.5 px-4 text-slate-400">{txn.merchantCategory}</td>
                    <td className="py-3.5 px-4 font-bold text-slate-100">₹{txn.amount.toLocaleString('en-IN')}</td>
                    <td className="py-3.5 px-4">
                      <span className={`font-extrabold ${txn.riskScore >= 50 ? 'text-rose-400' : 'text-emerald-400'}`}>
                        {txn.riskScore}/100
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge type={txn.status} />
                    </td>
                    <td className="py-3.5 px-4 text-slate-400">{new Date(txn.createdAt).toLocaleTimeString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Transaction Detail Modal */}
      {selectedTxn && (
        <Modal
          isOpen={!!selectedTxn}
          onClose={() => setSelectedTxn(null)}
          title={`Transaction Detail - ${selectedTxn.transactionId}`}
        >
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center bg-slate-900/60 p-5 rounded-2xl border border-slate-800">
              <div>
                <div className="text-xs text-slate-400 uppercase font-semibold">Amount</div>
                <div className="text-3xl font-extrabold text-white mt-1">₹{selectedTxn.amount.toLocaleString('en-IN')}</div>
                <div className="text-xs text-slate-400 mt-3 space-y-1">
                  <div><strong>Receiver UPI:</strong> {selectedTxn.receiverUpi}</div>
                  <div><strong>Category:</strong> {selectedTxn.merchantCategory}</div>
                  <div><strong>Payment App:</strong> {selectedTxn.paymentType}</div>
                  <div><strong>Location:</strong> {selectedTxn.location}</div>
                  <div><strong>Status:</strong> <Badge type={selectedTxn.status} /></div>
                </div>
              </div>
              <div className="flex justify-center border-t md:border-t-0 md:border-l border-slate-800 pt-4 md:pt-0">
                <RiskMeter score={selectedTxn.riskScore} />
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default CustomerDashboard;
