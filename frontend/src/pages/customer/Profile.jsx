import React, { useState } from 'react';
import { User, Mail, Phone, CreditCard, Shield, Save, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Badge from '../../components/common/Badge';

const Profile = () => {
  const { user, updateProfile } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [upiId, setUpiId] = useState(user?.upiId || '');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg('');
    setError('');
    setLoading(true);

    try {
      const res = await updateProfile({ name, phone, upiId });
      if (res.success) {
        setMsg('Profile details updated successfully!');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold text-white">Profile & Security Settings</h1>
        <p className="text-xs text-slate-400 mt-1">Manage your identity & personal UPI credentials</p>
      </div>

      <div className="glass-panel p-8 rounded-3xl border border-slate-800 space-y-6">
        <div className="flex items-center gap-4 pb-6 border-b border-slate-800">
          <div className="w-16 h-16 rounded-2xl bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-indigo-300 font-extrabold text-2xl">
            {user?.name?.charAt(0)}
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-100">{user?.name}</h2>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-slate-400">{user?.email}</span>
              <Badge type={user?.role} text={user?.role?.toUpperCase()} />
            </div>
          </div>
        </div>

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

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">Full Name</label>
            <div className="relative">
              <User className="w-5 h-5 absolute left-3.5 top-3 text-slate-500" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-white text-sm focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">Primary UPI Handle</label>
            <div className="relative">
              <CreditCard className="w-5 h-5 absolute left-3.5 top-3 text-slate-500" />
              <input
                type="text"
                required
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-white text-sm focus:outline-none focus:border-indigo-500 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">Phone Number</label>
            <div className="relative">
              <Phone className="w-5 h-5 absolute left-3.5 top-3 text-slate-500" />
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-white text-sm focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="py-3 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-glow-indigo flex items-center gap-2"
          >
            <Save className="w-4 h-4" /> {loading ? 'Saving...' : 'Save Profile Changes'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Profile;
