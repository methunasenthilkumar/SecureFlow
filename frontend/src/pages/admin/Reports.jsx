import React, { useState, useEffect } from 'react';
import { Download, RefreshCw, BarChart3 } from 'lucide-react';
import { getReportsApi } from '../../services/api';
import Badge from '../../components/common/Badge';

const Reports = () => {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const res = await getReportsApi();
      if (res.data.success) {
        setReport(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = () => {
    if (!report || !report.transactions) return;
    const headers = ['TransactionID', 'Customer', 'Amount', 'SenderUPI', 'ReceiverUPI', 'Status', 'RiskScore', 'CreatedAt'];
    const rows = report.transactions.map(t => [
      t.transactionId,
      t.user?.name || '',
      t.amount,
      t.senderUpi,
      t.receiverUpi,
      t.status,
      t.riskScore,
      t.createdAt
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `upishield_fraud_report_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white">System Reports & Export</h1>
          <p className="text-xs text-slate-400 mt-1">Export transaction & fraud metrics summary as CSV</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchReports}
            className="p-2.5 rounded-xl border border-slate-800 bg-slate-900/60 text-slate-300 hover:text-white flex items-center gap-2 text-xs font-semibold"
          >
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
          <button
            onClick={handleExportCSV}
            className="py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-2 shadow-glow-indigo"
          >
            <Download className="w-4 h-4" /> Export CSV Report
          </button>
        </div>
      </div>

      {/* Summary Box */}
      {report?.summary && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="glass-panel p-5 rounded-2xl border border-slate-800">
            <div className="text-xs text-slate-400 font-semibold uppercase">Total Volume Processed</div>
            <div className="text-2xl font-extrabold text-white mt-1">₹{report.summary.totalVolumeINR?.toLocaleString('en-IN')}</div>
          </div>
          <div className="glass-panel p-5 rounded-2xl border border-slate-800">
            <div className="text-xs text-slate-400 font-semibold uppercase">Total Transactions</div>
            <div className="text-2xl font-extrabold text-white mt-1">{report.summary.totalCount}</div>
          </div>
          <div className="glass-panel p-5 rounded-2xl border border-slate-800">
            <div className="text-xs text-slate-400 font-semibold uppercase">Approved Transactions</div>
            <div className="text-2xl font-extrabold text-emerald-400 mt-1">{report.summary.approvedCount}</div>
          </div>
          <div className="glass-panel p-5 rounded-2xl border border-slate-800">
            <div className="text-xs text-slate-400 font-semibold uppercase">Average Risk Score</div>
            <div className="text-2xl font-extrabold text-amber-400 mt-1">{report.summary.avgRiskScore}/100</div>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="glass-panel rounded-3xl border border-slate-800 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate-500 text-sm">Generating reports...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="text-slate-400 border-b border-slate-800 uppercase tracking-wider font-semibold bg-slate-900/40">
                  <th className="py-3.5 px-4">Txn ID</th>
                  <th className="py-3.5 px-4">Customer</th>
                  <th className="py-3.5 px-4">Sender</th>
                  <th className="py-3.5 px-4">Recipient</th>
                  <th className="py-3.5 px-4">Amount</th>
                  <th className="py-3.5 px-4">Risk Score</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {report?.transactions?.map((t) => (
                  <tr key={t._id} className="hover:bg-slate-900/60 transition-colors">
                    <td className="py-3.5 px-4 font-mono text-slate-300">{t.transactionId}</td>
                    <td className="py-3.5 px-4 font-semibold text-slate-200">{t.user?.name || 'Customer'}</td>
                    <td className="py-3.5 px-4 font-mono text-slate-400">{t.senderUpi}</td>
                    <td className="py-3.5 px-4 font-mono text-slate-400">{t.receiverUpi}</td>
                    <td className="py-3.5 px-4 font-bold text-slate-100">₹{t.amount?.toLocaleString('en-IN')}</td>
                    <td className="py-3.5 px-4 font-extrabold text-indigo-400">{t.riskScore}/100</td>
                    <td className="py-3.5 px-4">
                      <Badge type={t.status} />
                    </td>
                    <td className="py-3.5 px-4 text-slate-400">{new Date(t.createdAt).toLocaleString()}</td>
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

export default Reports;
