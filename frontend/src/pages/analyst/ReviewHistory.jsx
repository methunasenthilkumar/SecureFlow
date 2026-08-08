import React, { useState, useEffect } from 'react';
import { RefreshCw, CheckCircle, XCircle } from 'lucide-react';
import { getReviewHistoryApi } from '../../services/api';
import Badge from '../../components/common/Badge';

const ReviewHistory = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const res = await getReviewHistoryApi();
      if (res.data.success) {
        setReviews(res.data.reviews);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-white">Analyst Review Audit History</h1>
          <p className="text-xs text-slate-400 mt-1">Audit log of all manual approval and rejection decisions</p>
        </div>
        <button
          onClick={fetchHistory}
          className="p-2.5 rounded-xl border border-slate-800 bg-slate-900/60 text-slate-300 hover:text-white flex items-center gap-2 text-xs font-semibold"
        >
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      <div className="glass-panel rounded-3xl border border-slate-800 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate-500 text-sm">Loading review history...</div>
        ) : reviews.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-sm">No analyst reviews recorded yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="text-slate-400 border-b border-slate-800 uppercase tracking-wider font-semibold bg-slate-900/40">
                  <th className="py-3.5 px-4">Txn ID</th>
                  <th className="py-3.5 px-4">Customer</th>
                  <th className="py-3.5 px-4">Amount</th>
                  <th className="py-3.5 px-4">Analyst Name</th>
                  <th className="py-3.5 px-4">Decision</th>
                  <th className="py-3.5 px-4">Investigation Notes</th>
                  <th className="py-3.5 px-4">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {reviews.map((rev) => (
                  <tr key={rev._id} className="hover:bg-slate-900/60 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-medium text-slate-300">
                      {rev.transaction?.transactionId || 'N/A'}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-200">
                      {rev.transaction?.user?.name || 'Customer'}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-100">
                      ₹{rev.transaction?.amount?.toLocaleString('en-IN') || 0}
                    </td>
                    <td className="py-3.5 px-4 text-indigo-300 font-medium">
                      {rev.analyst?.name || 'Analyst'}
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge type={rev.decision} />
                    </td>
                    <td className="py-3.5 px-4 text-slate-300 max-w-xs truncate" title={rev.notes}>
                      {rev.notes}
                    </td>
                    <td className="py-3.5 px-4 text-slate-400">
                      {new Date(rev.reviewedAt || rev.createdAt).toLocaleString()}
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

export default ReviewHistory;
