import React, { useState, useEffect } from 'react';
import { Sliders, Save, CheckCircle2, ShieldAlert } from 'lucide-react';
import { getThresholdConfigApi, updateThresholdConfigApi } from '../../services/api';

const ThresholdConfig = () => {
  const [threshold, setThreshold] = useState(40);
  const [autoApproveLimit, setAutoApproveLimit] = useState(15000);
  const [highRiskAmountThreshold, setHighRiskAmountThreshold] = useState(50000);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      const res = await getThresholdConfigApi();
      if (res.data.success && res.data.config) {
        setThreshold(res.data.config.threshold || 40);
        setAutoApproveLimit(res.data.config.autoApproveLimit || 15000);
        setHighRiskAmountThreshold(res.data.config.highRiskAmountThreshold || 50000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg('');
    setError('');
    setSaving(true);

    try {
      const res = await updateThresholdConfigApi({
        threshold: Number(threshold),
        autoApproveLimit: Number(autoApproveLimit),
        highRiskAmountThreshold: Number(highRiskAmountThreshold)
      });

      if (res.data.success) {
        setMsg('Dynamic fraud configuration updated successfully!');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update threshold configuration');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold text-white">Fraud Threshold Configuration</h1>
        <p className="text-xs text-slate-400 mt-1">Configure automated routing rules & risk cutoffs for Machine Learning predictions</p>
      </div>

      <div className="glass-panel p-8 rounded-3xl border border-slate-800 space-y-6">
        {msg && (
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" /> {msg}
          </div>
        )}

        {error && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-semibold">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Risk Cutoff Score Slider */}
          <div className="space-y-3 bg-slate-900/60 p-5 rounded-2xl border border-slate-800">
            <div className="flex items-center justify-between">
              <label className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <Sliders className="w-4 h-4 text-indigo-400" /> Analyst Review Cutoff Risk Score (0-100)
              </label>
              <span className="text-2xl font-extrabold text-indigo-400 px-3 py-1 bg-indigo-500/10 rounded-xl border border-indigo-500/30">
                {threshold}
              </span>
            </div>
            <input
              type="range"
              min="10"
              max="90"
              step="1"
              value={threshold}
              onChange={(e) => setThreshold(e.target.value)}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
            />
            <div className="flex justify-between text-[11px] text-slate-400 font-semibold">
              <span>Risk &lt; {threshold} ➔ Auto Approved</span>
              <span className="text-amber-400 font-bold">Risk ≥ {threshold} ➔ Fraud Analyst Review</span>
            </div>
          </div>

          {/* Limits */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-400 mb-2">Auto-Approve Limit (₹ INR)</label>
              <input
                type="number"
                value={autoApproveLimit}
                onChange={(e) => setAutoApproveLimit(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-white font-bold text-sm focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-slate-400 mb-2">High Risk Amount Threshold (₹ INR)</label>
              <input
                type="number"
                value={highRiskAmountThreshold}
                onChange={(e) => setHighRiskAmountThreshold(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-white font-bold text-sm focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="py-3 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-glow-indigo flex items-center gap-2"
          >
            <Save className="w-4 h-4" /> {saving ? 'Updating...' : 'Save Configuration'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ThresholdConfig;
