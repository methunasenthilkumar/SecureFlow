import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Send, Shield, AlertTriangle, CheckCircle, Smartphone, MapPin, CreditCard } from 'lucide-react';
import { submitTransactionApi } from '../../services/api';
import RiskMeter from '../../components/common/RiskMeter';
import XAICard from '../../components/common/XAICard';
import Badge from '../../components/common/Badge';

const SubmitTransaction = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    amount: '',
    receiverUpi: '',
    receiverName: '',
    merchantCategory: 'Peer-to-Peer',
    paymentType: 'GPay',
    location: 'Mumbai, India',
    locationDiscrepancy: false,
    isNewDevice: false,
    hourOfDay: new Date().getHours()
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setResult(null);
    setLoading(true);

    try {
      const res = await submitTransactionApi({
        ...formData,
        amount: Number(formData.amount)
      });
      if (res.data.success) {
        setResult(res.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit transaction');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold text-white">Send Money via UPI</h1>
        <p className="text-xs text-slate-400 mt-1">
          Transactions are monitored in real-time by Random Forest AI & Explainable Risk Models.
        </p>
      </div>

      {!result ? (
        <div className="glass-panel p-8 rounded-3xl border border-slate-800 shadow-2xl">
          {error && (
            <div className="p-3 mb-6 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-semibold">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Transaction Amount */}
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-400 mb-2">Amount (₹ INR)</label>
                <div className="relative">
                  <span className="absolute left-4 top-3 text-slate-500 font-bold">₹</span>
                  <input
                    type="number"
                    name="amount"
                    required
                    min="1"
                    value={formData.amount}
                    onChange={handleChange}
                    placeholder="2500"
                    className="w-full pl-9 pr-4 py-3 rounded-xl bg-slate-900/80 border border-slate-800 text-white font-bold text-lg focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Receiver UPI ID */}
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-400 mb-2">Recipient UPI ID</label>
                <div className="relative">
                  <CreditCard className="w-5 h-5 absolute left-3.5 top-3.5 text-slate-500" />
                  <input
                    type="text"
                    name="receiverUpi"
                    required
                    value={formData.receiverUpi}
                    onChange={handleChange}
                    placeholder="merchant@paytm or contact@ybl"
                    className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-900/80 border border-slate-800 text-white text-sm focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Receiver Name */}
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-400 mb-2">Recipient Name (Optional)</label>
                <input
                  type="text"
                  name="receiverName"
                  value={formData.receiverName}
                  onChange={handleChange}
                  placeholder="Croma Store / Ankit Verma"
                  className="w-full px-4 py-3 rounded-xl bg-slate-900/80 border border-slate-800 text-white text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Merchant Category */}
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-400 mb-2">Merchant / Transfer Category</label>
                <select
                  name="merchantCategory"
                  value={formData.merchantCategory}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl bg-slate-900/80 border border-slate-800 text-white text-sm focus:outline-none focus:border-indigo-500"
                >
                  <option value="Peer-to-Peer">Peer-to-Peer (Friends & Family)</option>
                  <option value="Retail Stores">Retail Stores / Shopping</option>
                  <option value="Food & Dining">Food & Restaurants</option>
                  <option value="Utility Bills">Utility & Recharge Bills</option>
                  <option value="Financial Services">Financial Services & Banking</option>
                  <option value="Gaming & Crypto">Gaming & Crypto Exchange</option>
                </select>
              </div>

              {/* Payment Type */}
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-400 mb-2">UPI Application</label>
                <select
                  name="paymentType"
                  value={formData.paymentType}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl bg-slate-900/80 border border-slate-800 text-white text-sm focus:outline-none focus:border-indigo-500"
                >
                  <option value="GPay">Google Pay (GPay)</option>
                  <option value="PhonePe">PhonePe</option>
                  <option value="Paytm">Paytm UPI</option>
                  <option value="BHIM">BHIM UPI</option>
                  <option value="NetBanking">NetBanking UPI</option>
                </select>
              </div>

              {/* Location */}
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-400 mb-2">Initiation Location</label>
                <div className="relative">
                  <MapPin className="w-5 h-5 absolute left-3.5 top-3.5 text-slate-500" />
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    placeholder="Mumbai, India"
                    className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-900/80 border border-slate-800 text-white text-sm focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
            </div>

            {/* Simulation Context Checkboxes */}
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
                Simulation Security Context
              </span>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="locationDiscrepancy"
                  checked={formData.locationDiscrepancy}
                  onChange={handleChange}
                  className="w-4 h-4 rounded border-slate-700 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-xs text-slate-300">Flag location as unexpected / unusual travel IP</span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="isNewDevice"
                  checked={formData.isNewDevice}
                  onChange={handleChange}
                  className="w-4 h-4 rounded border-slate-700 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-xs text-slate-300">Flag device signature as new / unrecognized phone</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white font-extrabold text-base shadow-glow-indigo transition-all flex items-center justify-center gap-2"
            >
              {loading ? 'Analyzing with ML & Processing...' : 'Authorize UPI Transfer'}
              <Send className="w-5 h-5" />
            </button>
          </form>
        </div>
      ) : (
        /* Result Screen */
        <div className="glass-panel p-8 rounded-3xl border border-slate-800 space-y-8 animate-fadeIn">
          {/* Status Alert Banner */}
          <div
            className={`p-6 rounded-2xl border flex items-start gap-4 ${
              result.transaction.status === 'APPROVED'
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200'
                : 'bg-amber-500/10 border-amber-500/30 text-amber-200'
            }`}
          >
            {result.transaction.status === 'APPROVED' ? (
              <CheckCircle className="w-8 h-8 text-emerald-400 flex-shrink-0" />
            ) : (
              <AlertTriangle className="w-8 h-8 text-amber-400 flex-shrink-0" />
            )}
            <div>
              <h3 className="text-lg font-bold">
                {result.transaction.status === 'APPROVED'
                  ? 'Transaction Approved & Completed'
                  : 'Security Hold: Transaction Sent for Analyst Review'}
              </h3>
              <p className="text-xs mt-1 leading-relaxed opacity-90">
                {result.transaction.status === 'APPROVED'
                  ? `Your transfer of ₹${result.transaction.amount} to ${result.transaction.receiverUpi} was processed smoothly.`
                  : `Your transaction of ₹${result.transaction.amount} received a risk score of ${result.transaction.riskScore}/100 and was held for verification.`}
              </p>
            </div>
          </div>

          {/* Risk Meter & XAI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            <div className="glass-card p-6 rounded-2xl flex flex-col items-center justify-center">
              <span className="text-xs font-semibold text-slate-400 uppercase">AI Fraud Risk Score</span>
              <RiskMeter score={result.prediction.riskScore} />
              <Badge type={result.prediction.riskLevel} text={`${result.prediction.riskLevel} RISK`} />
            </div>

            <div className="md:col-span-2 space-y-3">
              <h4 className="text-sm font-bold text-slate-200">Explainable AI (XAI) Reasons</h4>
              {result.prediction.reasons?.map((reason, idx) => (
                <XAICard key={idx} reason={reason} />
              ))}
            </div>
          </div>

          <div className="flex gap-4 pt-4 border-t border-slate-800">
            <button
              onClick={() => setResult(null)}
              className="py-3 px-6 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs"
            >
              Make Another Transfer
            </button>
            <button
              onClick={() => navigate('/customer/dashboard')}
              className="py-3 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubmitTransaction;
