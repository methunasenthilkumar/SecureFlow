import React, { useState, useEffect } from 'react';
import { RefreshCw, FileText, Shield } from 'lucide-react';
import { getAuditLogsApi } from '../../services/api';
import Badge from '../../components/common/Badge';

const AuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await getAuditLogsApi();
      if (res.data.success) {
        setLogs(res.data.logs);
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
          <h1 className="text-2xl font-extrabold text-white">System Security Audit Logs</h1>
          <p className="text-xs text-slate-400 mt-1">Immutable security audit trails of all system events and authorization changes</p>
        </div>
        <button
          onClick={fetchLogs}
          className="p-2.5 rounded-xl border border-slate-800 bg-slate-900/60 text-slate-300 hover:text-white flex items-center gap-2 text-xs font-semibold"
        >
          <RefreshCw className="w-4 h-4" /> Refresh Audit Logs
        </button>
      </div>

      <div className="glass-panel rounded-3xl border border-slate-800 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate-500 text-sm">Loading audit trails...</div>
        ) : logs.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-sm">No audit entries recorded.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="text-slate-400 border-b border-slate-800 uppercase tracking-wider font-semibold bg-slate-900/40">
                  <th className="py-3.5 px-4">Action Event</th>
                  <th className="py-3.5 px-4">User</th>
                  <th className="py-3.5 px-4">Role</th>
                  <th className="py-3.5 px-4">IP Address</th>
                  <th className="py-3.5 px-4">Details</th>
                  <th className="py-3.5 px-4">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {logs.map((log) => (
                  <tr key={log._id} className="hover:bg-slate-900/60 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-indigo-300">{log.action}</td>
                    <td className="py-3.5 px-4 text-slate-200">{log.userName || 'System'}</td>
                    <td className="py-3.5 px-4">
                      <Badge type={log.role || 'system'} text={(log.role || 'system').toUpperCase()} />
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-400">{log.ipAddress}</td>
                    <td className="py-3.5 px-4 font-mono text-[11px] text-slate-300 max-w-xs truncate">
                      {JSON.stringify(log.details)}
                    </td>
                    <td className="py-3.5 px-4 text-slate-400">{new Date(log.createdAt).toLocaleString()}</td>
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

export default AuditLogs;
