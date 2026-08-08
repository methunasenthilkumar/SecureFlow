import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Shield, Mail, ArrowRight, CheckCircle2 } from 'lucide-react';
import { forgotPasswordApi } from '../../services/api';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [mockOtp, setMockOtp] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setLoading(true);

    try {
      const res = await forgotPasswordApi({ email });
      if (res.data.success) {
        setSuccessMsg(res.data.message);
        if (res.data.mockOtp) {
          setMockOtp(res.data.mockOtp);
        }
        setTimeout(() => {
          navigate('/reset-password', { state: { email, otp: res.data.mockOtp } });
        }, 2000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to request OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-slate-950">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <div className="inline-flex p-3 rounded-2xl bg-gradient-to-tr from-indigo-600 to-cyan-500 text-white mb-3">
            <Shield className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-bold gradient-text">Reset Password</h1>
          <p className="text-xs text-slate-400 mt-1">Receive a security OTP code via email</p>
        </div>

        <div className="glass-panel p-8 rounded-3xl border border-slate-800">
          {error && <div className="p-3 mb-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs">{error}</div>}
          {successMsg && (
            <div className="p-3 mb-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" /> {successMsg}
            </div>
          )}

          {mockOtp && (
            <div className="p-3 mb-4 rounded-xl bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 text-xs">
              <strong>Demo Notice:</strong> OTP Code is <strong>{mockOtp}</strong>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-5 h-5 absolute left-3.5 top-3 text-slate-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@domain.com"
                  className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-white text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm transition-all flex items-center justify-center gap-2"
            >
              {loading ? 'Sending OTP...' : 'Send Reset Code'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-slate-400">
            Remembered password?{' '}
            <Link to="/login" className="text-indigo-400 hover:underline">
              Back to Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
