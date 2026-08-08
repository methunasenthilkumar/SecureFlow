import React, { useState, useEffect } from 'react';
import { ShieldAlert, Search, RefreshCw, CheckCircle, XCircle, FileText, AlertTriangle } from 'lucide-react';
import { getPendingReviewsApi, submitReviewApi } from '../../services/api';
import Modal from '../../components/common/Modal';
import RiskMeter from '../../components/common/RiskMeter';
import XAICard from '../../components/common/XAICard';
import Badge from '../../components/common/Badge';

const PendingReviews = () => {
  const [pending, setPending] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null);

  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [actionError, setActionError] = useState('');

  useEffect(() => {
    fetchPending();
  }, []);

  const fetchPending = async () => {
    setLoading(true);
    try {
      const res = await getPendingReviewsApi();
      if (res.data.success) {
        setPending(res.data.pending);
        setFiltered(res.data.pending);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!search) {
      setFiltered(pending);
    } else {
      const q = search.toLowerCase();
      setFiltered(
        pending.filter(
          (item) =>
            item.transaction.transactionId.toLowerCase().includes(q) ||
            item.transaction.receiverUpi.toLowerCase().includes(q) ||
            (item.transaction.user?.name && item.transaction.user.name.toLowerCase().includes(q))
        )
      );
    }
  }, [search, pending]);

  const handleOpenInspect = (item) => {
    setSelectedItem(item);
    setNotes('');
    setActionError('');
  };

  const handleDecision = async (decision) => {
    if (!notes || notes.trim().length < 5) {
      setActionError('Please enter mandatory investigation notes (minimum 5 characters)');
      return;
    }

    setSubmitting(true);
    setActionError('');

    try {
      const res = await submitReviewApi(selectedItem.transaction._id, {
        decision,
        notes: notes.trim()
      });

      if (res.data.success) {
        setSelectedItem(null);
        fetchPending();
      }
    } catch (err) {
      setActionError(err.response?.data?.message || 'Failed to submit analyst review decision');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white">Pending Fraud Triage Queue</h1>
          <p className="text-xs text-slate-400 mt-1">Review flagged UPI transactions and approve or decline with notes</p>
        </div>
        <button
          onClick={fetchPending}
          className="p-2.5 rounded-xl border border-slate-800 bg-slate-900/60 text-slate-300 hover:text-white flex items-center gap-2 text-xs font-semibold self-start"
        >
          <RefreshCw className="w-4 h-4" /> Refresh Queue
        </button>
      </div>

      {/* Search Bar */}
      <div className="glass-panel p-4 rounded-2xl border border-slate-800">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-500" />
          <input
            type="text"
            placeholder="Search pending reviews by Txn ID, Sender or Recipient UPI..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-900/80 border border-slate-800 text-white text-xs focus:outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Queue Table */}
      <div className="glass-panel rounded-3xl border border-slate-800 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate-500 text-sm">Loading pending queue...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-sm">No transactions currently requiring analyst review.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="text-slate-400 border-b border-slate-800 uppercase tracking-wider font-semibold bg-slate-900/40">
                  <th className="py-3.5 px-4">Txn ID</th>
                  <th className="py-3.5 px-4">Customer</th>
                  <th className="py-3.5 px-4">Recipient</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Amount</th>
                  <th className="py-3.5 px-4">Risk Score</th>
                  <th className="py-3.5 px-4">Primary Risk Factor</th>
                  <th className="py-3.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filtered.map((item) => {
                  const { transaction, prediction } = item;
                  return (
                    <tr key={transaction._id} className="hover:bg-slate-900/60 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-medium text-slate-300">{transaction.transactionId}</td>
                      <td className="py-3.5 px-4 font-semibold text-slate-200">{transaction.user?.name || 'Customer'}</td>
                      <td className="py-3.5 px-4 text-slate-400">{transaction.receiverUpi}</td>
                      <td className="py-3.5 px-4 text-slate-400">{transaction.merchantCategory}</td>
                      <td className="py-3.5 px-4 font-bold text-slate-100">₹{transaction.amount.toLocaleString('en-IN')}</td>
                      <td className="py-3.5 px-4">
                        <span className="font-extrabold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-500/20">
                          {transaction.riskScore}/100
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-300">
                        {prediction?.reasons?.[0]?.title || 'High Risk Profile'}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => handleOpenInspect(item)}
                          className="py-1.5 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-glow-indigo transition-all"
                        >
                          Inspect & Decide
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Inspector Modal */}
      {selectedItem && (
        <Modal
          isOpen={!!selectedItem}
          onClose={() => setSelectedItem(null)}
          title={`Fraud Investigation: ${selectedItem.transaction.transactionId}`}
          maxWidth="max-w-3xl"
        >
          <div className="space-y-6">
            {/* Header Telemetry Box */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center bg-slate-900/80 p-5 rounded-2xl border border-slate-800">
              <div className="md:col-span-2 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400 uppercase font-semibold">Flagged Transfer</span>
                  <Badge type={selectedItem.prediction?.riskLevel || 'HIGH'} text={`${selectedItem.prediction?.riskLevel} RISK`} />
                </div>
                <div className="text-3xl font-extrabold text-white">₹{selectedItem.transaction.amount.toLocaleString('en-IN')}</div>
                <div className="text-xs text-slate-300 grid grid-cols-2 gap-x-4 gap-y-1">
                  <div><strong>Customer:</strong> {selectedItem.transaction.user?.name}</div>
                  <div><strong>Sender UPI:</strong> {selectedItem.transaction.senderUpi}</div>
                  <div><strong>Recipient UPI:</strong> {selectedItem.transaction.receiverUpi}</div>
                  <div><strong>Merchant Cat:</strong> {selectedItem.transaction.merchantCategory}</div>
                  <div><strong>Location:</strong> {selectedItem.transaction.location}</div>
                  <div><strong>Device ID:</strong> {selectedItem.transaction.deviceId}</div>
                </div>
              </div>
              <div className="flex flex-col items-center justify-center border-t md:border-t-0 md:border-l border-slate-800 pt-4 md:pt-0">
                <RiskMeter score={selectedItem.transaction.riskScore} />
              </div>
            </div>

            {/* Explainable AI Reasons */}
            <div className="space-y-3">
              <h4 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-amber-400" /> Explainable AI (XAI) Risk Factors
              </h4>
              <div className="space-y-2">
                {selectedItem.prediction?.reasons?.map((reason, idx) => (
                  <XAICard key={idx} reason={reason} />
                ))}
              </div>
            </div>

            {/* Analyst Notes Input */}
            <div className="space-y-2 pt-2 border-t border-slate-800">
              <label className="block text-xs font-bold uppercase text-slate-300">
                Investigation Notes <span className="text-rose-400">* Required</span>
              </label>
              <textarea
                rows="3"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Enter detailed reasoning (e.g. Verified customer identity via OTP confirmation / Confirmed unauthorized attempt)..."
                className="w-full p-3 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:outline-none focus:border-indigo-500"
              />
              {actionError && <p className="text-xs text-rose-400 font-semibold">{actionError}</p>}
            </div>

            {/* Action Decision Buttons */}
            <div className="flex gap-4 pt-4 border-t border-slate-800 justify-end">
              <button
                disabled={submitting}
                onClick={() => handleDecision('REJECTED')}
                className="py-3 px-6 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center gap-2 transition-all shadow-glow-rose"
              >
                <XCircle className="w-4 h-4" /> Reject & Decline Transfer
              </button>
              <button
                disabled={submitting}
                onClick={() => handleDecision('APPROVED')}
                className="py-3 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-2 transition-all"
              >
                <CheckCircle className="w-4 h-4" /> Approve Transaction
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default PendingReviews;
