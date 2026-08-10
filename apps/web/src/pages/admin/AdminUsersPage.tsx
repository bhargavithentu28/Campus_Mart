import React, { useState, useEffect } from 'react';
import { Button } from '../../components/ui/Button';
import { Users, Search, ShieldCheck, Ban, CheckCircle2 } from 'lucide-react';
import { api } from '../../lib/api';

export function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, [search]);

  const fetchUsers = () => {
    setIsLoading(true);
    api.get(`/admin/users?search=${encodeURIComponent(search)}`)
      .then(res => {
        if (res.data.users) setUsers(res.data.users);
      })
      .catch(err => console.error('Fetch users error:', err))
      .finally(() => setIsLoading(false));
  };

  const handleToggleSuspend = async (userId: string, currentSuspended: boolean) => {
    try {
      await api.post(`/admin/users/${userId}/suspend`, { suspend: !currentSuspended, reason: 'Administrative moderation' });
      fetchUsers();
    } catch (err) {
      console.error('Suspend error:', err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-100">User Management</h2>
          <p className="text-xs text-slate-400 mt-1">Manage verified student accounts and enforcement suspensions.</p>
        </div>

        <div className="w-full sm:w-64 relative">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name or email..."
            className="w-full glass-input text-xs rounded-xl pl-9 pr-4 py-2"
          />
        </div>
      </div>

      <div className="glass-panel rounded-2xl overflow-hidden border border-white/10">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-900 text-slate-400 uppercase tracking-wider text-[10px] border-b border-white/5">
            <tr>
              <th className="p-4">Student Name</th>
              <th className="p-4">Email Domain</th>
              <th className="p-4">Role</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {users.map((u) => (
              <tr key={u.id} className="hover:bg-slate-800/40">
                <td className="p-4 font-bold text-slate-100 flex items-center gap-1.5">
                  {u.name}
                  {u.isVerified && <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />}
                </td>
                <td className="p-4 text-slate-400">{u.email}</td>
                <td className="p-4">
                  <span className="px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 text-[10px] font-bold border border-indigo-800">
                    {u.role}
                  </span>
                </td>
                <td className="p-4">
                  {u.isSuspended ? (
                    <span className="px-2 py-0.5 rounded bg-rose-950 text-rose-300 text-[10px] font-bold border border-rose-800">
                      SUSPENDED
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 text-[10px] font-bold border border-emerald-800">
                      ACTIVE
                    </span>
                  )}
                </td>
                <td className="p-4 text-right">
                  <Button
                    variant={u.isSuspended ? 'outline' : 'danger'}
                    size="sm"
                    onClick={() => handleToggleSuspend(u.id, u.isSuspended)}
                  >
                    {u.isSuspended ? 'Unsuspend' : 'Suspend'}
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
