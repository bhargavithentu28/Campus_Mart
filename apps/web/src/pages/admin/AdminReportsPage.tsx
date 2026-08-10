import React, { useState, useEffect } from 'react';
import { Button } from '../../components/ui/Button';
import { Flag, CheckCircle2, Trash2, AlertCircle } from 'lucide-react';
import { api } from '../../lib/api';

export function AdminReportsPage() {
  const [reports, setReports] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = () => {
    setIsLoading(true);
    api.get('/admin/reports')
      .then(res => {
        if (res.data.reports) setReports(res.data.reports);
      })
      .catch(err => console.error('Fetch reports error:', err))
      .finally(() => setIsLoading(false));
  };

  const handleResolve = async (id: string, action: string) => {
    try {
      await api.post(`/admin/reports/${id}/resolve`, { action });
      fetchReports();
    } catch (err) {
      console.error('Resolve error:', err);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-extrabold text-slate-100">Moderation Reports Queue</h2>
        <p className="text-xs text-slate-400 mt-1">Review flagged product listings and safety reports.</p>
      </div>

      {isLoading ? (
        <div className="text-xs text-slate-400 animate-pulse">Loading moderation queue...</div>
      ) : reports.length === 0 ? (
        <div className="glass-panel rounded-2xl p-8 text-center space-y-2">
          <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
          <h4 className="text-sm font-bold text-slate-200">No Pending Moderation Reports</h4>
          <p className="text-xs text-slate-500">All campus listings meet platform safety standards.</p>
        </div>
      ) : (
        <div className="glass-panel rounded-2xl overflow-hidden border border-white/10">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900 text-slate-400 uppercase tracking-wider text-[10px] border-b border-white/5">
              <tr>
                <th className="p-4">Reporter</th>
                <th className="p-4">Reported Product</th>
                <th className="p-4">Reason</th>
                <th className="p-4">Date</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {reports.map((r) => (
                <tr key={r.id} className="hover:bg-slate-800/40">
                  <td className="p-4 font-semibold text-slate-200">{r.reporter?.name || 'Anonymous'}</td>
                  <td className="p-4">{r.reportedProduct?.title || 'Listing Item'}</td>
                  <td className="p-4 text-rose-300 font-semibold">{r.reason}</td>
                  <td className="p-4 text-slate-400">{new Date(r.createdAt).toLocaleDateString()}</td>
                  <td className="p-4 text-right space-x-2">
                    <Button variant="outline" size="sm" onClick={() => handleResolve(r.id, 'dismiss')}>
                      Dismiss
                    </Button>
                    <Button variant="danger" size="sm" onClick={() => handleResolve(r.id, 'remove_listing')}>
                      Remove Listing
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
