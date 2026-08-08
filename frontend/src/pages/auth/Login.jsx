import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Shield, Lock, Mail, ArrowRight, UserCheck, KeyRound } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await login(email, password);
      if (data.success) {
        const role = data.user.role;
        if (role === 'admin') navigate('/admin/dashboard');
        else if (role === 'analyst') navigate('/analyst/dashboard');
        else navigate('/customer/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (demoEmail) => {
    setEmail(demoEmail);
    setPassword('password123');
    setError('');
    setLoading(true);

    try {
      const data = await login(demoEmail, 'password123');
      if (data.success) {
        const role = data.user.role;
        if (role === 'admin') navigate('/admin/dashboard');
        else if (role === 'analyst') navigate('/analyst/dashboard');
        else navigate('/customer/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Demo login error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-slate-950 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-950/40 via-slate-950 to-slate-950">
      <div className="w-full max-w-md">
        {/* Logo Branding */}
        <div className="text-center mb-8">
          <div className="inline-flex p-3 rounded-2xl bg-gradient-to-tr from-indigo-600 to-cyan-500 text-white shadow-glow-indigo mb-3">
            <Shield className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight gradient-text">UPIShield</h1>
          <p className="text-sm text-slate-400 mt-1">AI-Powered UPI Fraud Detection Engine</p>
        </div>

        {/* Form Card */}
        <div className="glass-panel p-8 rounded-3xl border border-slate-800 shadow-2xl">
          <h2 className="text-xl font-bold text-slate-100 mb-6">Sign In to Dashboard</h2>

          {error && (
            <div className="p-3 mb-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-semibold">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-400 mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="w-5 h-5 absolute left-3.5 top-3 text-slate-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@domain.com"
                  className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm transition-all"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold uppercase text-slate-400">Password</label>
                <Link to="/forgot-password" className="text-xs text-indigo-400 hover:underline">
                  Forgot?
                </Link>
              </div>
              <div className="relative">
                <Lock className="w-5 h-5 absolute left-3.5 top-3 text-slate-500" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 mt-2 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white font-bold text-sm shadow-glow-indigo transition-all flex items-center justify-center gap-2"
            >
              {loading ? 'Authenticating...' : 'Sign In'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Preset Demo Accounts */}
          <div className="mt-8 pt-6 border-t border-slate-800">
            <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 block mb-3 text-center">
              Quick Demo One-Click Sign In
            </span>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleDemoLogin('customer@upishield.com')}
                className="p-2 text-center rounded-xl bg-slate-900/80 hover:bg-indigo-950/50 border border-slate-800 hover:border-indigo-500/50 text-xs transition-all text-slate-300"
              >
                Customer
              </button>
              <button
                type="button"
                onClick={() => handleDemoLogin('analyst@upishield.com')}
                className="p-2 text-center rounded-xl bg-slate-900/80 hover:bg-amber-950/50 border border-slate-800 hover:border-amber-500/50 text-xs transition-all text-slate-300"
              >
                Analyst
              </button>
              <button
                type="button"
                onClick={() => handleDemoLogin('admin@upishield.com')}
                className="p-2 text-center rounded-xl bg-slate-900/80 hover:bg-emerald-950/50 border border-slate-800 hover:border-emerald-500/50 text-xs transition-all text-slate-300"
              >
                Admin
              </button>
            </div>
          </div>

          <div className="mt-6 text-center text-xs text-slate-400">
            Don't have an account?{' '}
            <Link to="/register" className="text-indigo-400 font-semibold hover:underline">
              Create Account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
