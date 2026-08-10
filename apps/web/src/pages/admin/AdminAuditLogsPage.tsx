import React, { useState, useEffect } from 'react';
import { FileText, ShieldCheck, Clock } from 'lucide-react';
import { api } from '../../lib/api';

export function AdminAuditLogsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/audit-logs')
      .then(res => {
        if (res.data.logs) setLogs(res.data.logs);
      })
      .catch(err => console.error('Fetch audit logs error:', err))
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-extrabold text-slate-100">Administrative Audit Trail</h2>
        <p className="text-xs text-slate-400 mt-1">Append-only security event stream recording all privileged administrative actions.</p>
      </div>

      <div className="glass-panel rounded-2xl overflow-hidden border border-white/10">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-900 text-slate-400 uppercase tracking-wider text-[10px] border-b border-white/5">
            <tr>
              <th className="p-4">Administrator</th>
              <th className="p-4">Action</th>
              <th className="p-4">Target ID</th>
              <th className="p-4">Timestamp</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {logs.map((log) => (
              <tr key={log.id} className="hover:bg-slate-800/40">
                <td className="p-4 font-bold text-slate-100">{log.admin?.name || 'Administrator'}</td>
                <td className="p-4">
                  <span className="px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 text-[10px] font-mono border border-indigo-800">
                    {log.action}
                  </span>
                </td>
                <td className="p-4 text-slate-400 font-mono text-[11px]">{log.target || 'N/A'}</td>
                <td className="p-4 text-slate-400">{new Date(log.createdAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
