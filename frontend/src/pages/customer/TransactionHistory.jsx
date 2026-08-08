import React, { useState, useEffect } from 'react';
import { Search, Filter, RefreshCw, Eye } from 'lucide-react';
import { getMyTransactionsApi } from '../../services/api';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import RiskMeter from '../../components/common/RiskMeter';

const TransactionHistory = () => {
  const [transactions, setTransactions] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [selectedTxn, setSelectedTxn] = useState(null);

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const res = await getMyTransactionsApi();
      if (res.data.success) {
        setTransactions(res.data.transactions);
        setFiltered(res.data.transactions);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let result = [...transactions];
    if (statusFilter !== 'ALL') {
      result = result.filter(t => t.status === statusFilter);
    }
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(t =>
        t.transactionId.toLowerCase().includes(q) ||
        t.receiverUpi.toLowerCase().includes(q) ||
        t.receiverName.toLowerCase().includes(q)
      );
    }
    setFiltered(result);
  }, [search, statusFilter, transactions]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white">My Transaction History</h1>
          <p className="text-xs text-slate-400 mt-1">Complete log of all initiated UPI transfers and risk scores</p>
        </div>
        <button
          onClick={fetchTransactions}
          className="p-2.5 rounded-xl border border-slate-800 bg-slate-900/60 text-slate-300 hover:text-white flex items-center gap-2 text-xs font-semibold self-start"
        >
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      {/* Filter Bar */}
      <div className="glass-panel p-4 rounded-2xl border border-slate-800 flex flex-col md:flex-row gap-4 justify-between">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-500" />
          <input
            type="text"
            placeholder="Search by Txn ID or Recipient UPI..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-900/80 border border-slate-800 text-white text-xs focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-500" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-900/80 border border-slate-800 text-white text-xs focus:outline-none"
          >
            <option value="ALL">All Statuses</option>
            <option value="APPROVED">Approved</option>
            <option value="PENDING_REVIEW">Pending Review</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="glass-panel rounded-3xl border border-slate-800 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate-500 text-sm">Loading transactions...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-sm">No matching transactions found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="text-slate-400 border-b border-slate-800 uppercase tracking-wider font-semibold bg-slate-900/40">
                  <th className="py-3.5 px-4">Transaction ID</th>
                  <th className="py-3.5 px-4">Recipient</th>
                  <th className="py-3.5 px-4">App</th>
                  <th className="py-3.5 px-4">Amount</th>
                  <th className="py-3.5 px-4">Risk Score</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Timestamp</th>
                  <th className="py-3.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filtered.map((txn) => (
                  <tr key={txn._id} className="hover:bg-slate-900/60 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-medium text-slate-300">{txn.transactionId}</td>
                    <td className="py-3.5 px-4 font-semibold text-slate-200">
                      <div>{txn.receiverName}</div>
                      <div className="text-[10px] text-slate-500 font-mono">{txn.receiverUpi}</div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-400">{txn.paymentType}</td>
                    <td className="py-3.5 px-4 font-bold text-slate-100">₹{txn.amount.toLocaleString('en-IN')}</td>
                    <td className="py-3.5 px-4">
                      <span className={`font-bold ${txn.riskScore >= 50 ? 'text-rose-400' : 'text-emerald-400'}`}>
                        {txn.riskScore}/100
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge type={txn.status} />
                    </td>
                    <td className="py-3.5 px-4 text-slate-400">{new Date(txn.createdAt).toLocaleString()}</td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => setSelectedTxn(txn)}
                        className="p-1.5 rounded-lg border border-slate-800 hover:bg-indigo-600/20 text-indigo-400"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selectedTxn && (
        <Modal
          isOpen={!!selectedTxn}
          onClose={() => setSelectedTxn(null)}
          title={`Transaction Inspection - ${selectedTxn.transactionId}`}
        >
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center bg-slate-900/60 p-5 rounded-2xl border border-slate-800">
              <div>
                <div className="text-xs text-slate-400 uppercase font-semibold">Amount</div>
                <div className="text-3xl font-extrabold text-white mt-1">₹{selectedTxn.amount.toLocaleString('en-IN')}</div>
                <div className="text-xs text-slate-300 mt-3 space-y-1">
                  <div><strong>Sender:</strong> {selectedTxn.senderUpi}</div>
                  <div><strong>Receiver:</strong> {selectedTxn.receiverUpi}</div>
                  <div><strong>Category:</strong> {selectedTxn.merchantCategory}</div>
                  <div><strong>Device ID:</strong> {selectedTxn.deviceId}</div>
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

export default TransactionHistory;
