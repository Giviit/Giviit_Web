import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MdAdminPanelSettings, MdPerson } from 'react-icons/md';
import AdminLayout from '../../components/AdminLayout';
import api from '../../utils/api';
import { formatTimeAgo } from '../../utils/formatters';
import LoadingSpinner from '../../components/LoadingSpinner';
import toast from 'react-hot-toast';

export default function AdminUsers() {
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: () => api.get('/admin/users').then(r => r.data),
  });

  const changeRole = useMutation({
    mutationFn: ({ id, role }) => api.put(`/admin/users/${id}/role`, { role }),
    onSuccess: () => { toast.success('Role updated'); qc.invalidateQueries(['admin-users']); },
    onError: () => toast.error('Failed to update role'),
  });

  const users = data?.users || [];

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="text-2xl font-black text-dark">Users</h1>
        <p className="text-gray-500 text-sm mt-1">{users.length} registered users</p>
      </div>

      {isLoading ? (
        <div className="py-16"><LoadingSpinner /></div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">User</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden sm:table-cell">Phone</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Role</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">Joined</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {users.map(u => (
                <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                        {u.avatar_url ? (
                          <img src={u.avatar_url} alt="" className="w-8 h-8 rounded-full object-cover" />
                        ) : (
                          <MdPerson className="text-primary text-sm" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-dark text-sm">{u.full_name}</p>
                        <p className="text-xs text-gray-400">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 hidden sm:table-cell">
                    <p className="text-sm text-gray-600">{u.phone || '—'}</p>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full ${
                      u.role === 'admin' ? 'bg-purple-100 text-purple-600' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {u.role === 'admin' && <MdAdminPanelSettings className="text-xs" />}
                      {u.role || 'user'}
                    </span>
                  </td>
                  <td className="px-5 py-4 hidden md:table-cell">
                    <p className="text-xs text-gray-400">{formatTimeAgo(u.created_at)}</p>
                  </td>
                  <td className="px-5 py-4">
                    <button
                      onClick={() => changeRole.mutate({ id: u.id, role: u.role === 'admin' ? 'user' : 'admin' })}
                      disabled={changeRole.isPending}
                      className={`text-xs font-medium px-3 py-1.5 rounded-full transition-colors ${
                        u.role === 'admin'
                          ? 'bg-red-100 hover:bg-red-200 text-red-600'
                          : 'bg-purple-100 hover:bg-purple-200 text-purple-600'
                      }`}
                    >
                      {u.role === 'admin' ? 'Remove Admin' : 'Make Admin'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AdminLayout>
  );
}
