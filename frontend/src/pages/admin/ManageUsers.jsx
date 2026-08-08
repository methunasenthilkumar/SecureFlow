import React, { useState, useEffect } from 'react';
import { Search, Users, Shield, Lock, Unlock, RefreshCw } from 'lucide-react';
import { getUsersApi, updateUserStatusApi, updateUserRoleApi } from '../../services/api';
import Badge from '../../components/common/Badge';

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, [search, roleFilter]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await getUsersApi({ search, role: roleFilter });
      if (res.data.success) {
        setUsers(res.data.users);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (user) => {
    const newStatus = user.status === 'active' ? 'suspended' : 'active';
    try {
      const res = await updateUserStatusApi(user._id, newStatus);
      if (res.data.success) {
        setUsers(users.map(u => u._id === user._id ? { ...u, status: newStatus } : u));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      const res = await updateUserRoleApi(userId, newRole);
      if (res.data.success) {
        setUsers(users.map(u => u._id === userId ? { ...u, role: newRole } : u));
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white">User & Role Management</h1>
          <p className="text-xs text-slate-400 mt-1">Manage system access, roles (Customer, Analyst, Admin) and account statuses</p>
        </div>
        <button
          onClick={fetchUsers}
          className="p-2.5 rounded-xl border border-slate-800 bg-slate-900/60 text-slate-300 hover:text-white flex items-center gap-2 text-xs font-semibold self-start"
        >
          <RefreshCw className="w-4 h-4" /> Refresh Users
        </button>
      </div>

      {/* Filter Bar */}
      <div className="glass-panel p-4 rounded-2xl border border-slate-800 flex flex-col md:flex-row gap-4 justify-between">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-500" />
          <input
            type="text"
            placeholder="Search by name, email, or UPI ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-900/80 border border-slate-800 text-white text-xs focus:outline-none focus:border-indigo-500"
          />
        </div>

        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="px-3 py-2 rounded-xl bg-slate-900/80 border border-slate-800 text-white text-xs focus:outline-none"
        >
          <option value="all">All Roles</option>
          <option value="customer">Customers</option>
          <option value="analyst">Fraud Analysts</option>
          <option value="admin">Administrators</option>
        </select>
      </div>

      {/* Users Table */}
      <div className="glass-panel rounded-3xl border border-slate-800 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate-500 text-sm">Loading users...</div>
        ) : users.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-sm">No users found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="text-slate-400 border-b border-slate-800 uppercase tracking-wider font-semibold bg-slate-900/40">
                  <th className="py-3.5 px-4">User</th>
                  <th className="py-3.5 px-4">UPI ID</th>
                  <th className="py-3.5 px-4">Role</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Joined Date</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {users.map((u) => (
                  <tr key={u._id} className="hover:bg-slate-900/60 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-100">{u.name}</div>
                      <div className="text-[10px] text-slate-400">{u.email}</div>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-indigo-300">{u.upiId || 'N/A'}</td>
                    <td className="py-3.5 px-4">
                      <select
                        value={u.role}
                        onChange={(e) => handleRoleChange(u._id, e.target.value)}
                        className="bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 capitalize"
                      >
                        <option value="customer">Customer</option>
                        <option value="analyst">Analyst</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge type={u.status} text={u.status.toUpperCase()} />
                    </td>
                    <td className="py-3.5 px-4 text-slate-400">{new Date(u.createdAt).toLocaleDateString()}</td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleToggleStatus(u)}
                        className={`py-1 px-3 rounded-lg text-xs font-semibold transition-all ${
                          u.status === 'active'
                            ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20 hover:bg-rose-500/20'
                            : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20'
                        }`}
                      >
                        {u.status === 'active' ? 'Suspend' : 'Activate'}
                      </button>
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

export default ManageUsers;
