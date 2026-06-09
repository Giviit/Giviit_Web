import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MdCheck, MdClose, MdPending } from 'react-icons/md';
import AdminLayout from '../../components/AdminLayout';
import api from '../../utils/api';
import { formatCurrency, formatTimeAgo } from '../../utils/formatters';
import LoadingSpinner from '../../components/LoadingSpinner';
import toast from 'react-hot-toast';
import { useState } from 'react';

const STATUS_STYLES = {
  pending: 'bg-amber-100 text-amber-600',
  processing: 'bg-blue-100 text-blue-600',
  completed: 'bg-green-100 text-primary',
  failed: 'bg-red-100 text-red-600',
};

export default function AdminWithdrawals() {
  const qc = useQueryClient();
  const [statusFilter, setStatusFilter] = useState('pending');

  const { data, isLoading } = useQuery({
    queryKey: ['admin-withdrawals', statusFilter],
    queryFn: () => api.get('/admin/withdrawals', { params: { status: statusFilter === 'all' ? undefined : statusFilter } }).then(r => r.data),
  });

  const approve = useMutation({
    mutationFn: (id) => api.put(`/admin/withdrawals/${id}/approve`),
    onSuccess: () => { toast.success('Withdrawal approved and transfer initiated'); qc.invalidateQueries(['admin-withdrawals']); },
    onError: (err) => toast.error(err.response?.data?.error || 'Failed to approve'),
  });

  const reject = useMutation({
    mutationFn: (id) => api.put(`/admin/withdrawals/${id}/reject`),
    onSuccess: () => { toast.success('Withdrawal rejected'); qc.invalidateQueries(['admin-withdrawals']); },
    onError: () => toast.error('Failed to reject'),
  });

  const withdrawals = data?.withdrawals || [];

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="text-2xl font-black text-dark">Withdrawals</h1>
        <p className="text-gray-500 text-sm mt-1">Review and process withdrawal requests</p>
      </div>

      {/* Filter tabs */}
      <div className="flex flex-wrap gap-2 mb-5">
        {['all', 'pending', 'processing', 'completed', 'failed'].map(s => (
          <button key={s} onClick={() => setStatusFilter(s)}
            className={`px-4 py-2 rounded-full text-sm font-medium capitalize transition-colors ${statusFilter === s ? 'bg-primary text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-primary hover:text-primary'}`}>
            {s}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="py-16"><LoadingSpinner /></div>
      ) : withdrawals.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-100">
          <p className="text-gray-400">No withdrawals found.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Campaign</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden sm:table-cell">Bank Details</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Amount</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">Date</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {withdrawals.map(w => (
                <tr key={w.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-4">
                    <p className="font-medium text-dark text-sm">{w.campaign?.title || 'Campaign'}</p>
                    <p className="text-xs text-gray-400">{w.creator?.full_name}</p>
                  </td>
                  <td className="px-5 py-4 hidden sm:table-cell">
                    <p className="text-sm text-dark">{w.bank_name}</p>
                    <p className="text-xs text-gray-400">{w.account_number} · {w.account_name}</p>
                  </td>
                  <td className="px-5 py-4">
                    <p className="font-bold text-dark">{formatCurrency(w.amount)}</p>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full capitalize ${STATUS_STYLES[w.status] || 'bg-gray-100 text-gray-600'}`}>
                      {w.status}
                    </span>
                  </td>
                  <td className="px-5 py-4 hidden md:table-cell">
                    <p className="text-xs text-gray-400">{formatTimeAgo(w.created_at)}</p>
                  </td>
                  <td className="px-5 py-4">
                    {w.status === 'pending' && (
                      <div className="flex gap-2">
                        <button onClick={() => approve.mutate(w.id)} disabled={approve.isPending}
                          className="inline-flex items-center gap-1 text-xs bg-green-100 hover:bg-green-200 text-primary px-3 py-1.5 rounded-full font-medium transition-colors disabled:opacity-50">
                          <MdCheck /> Approve
                        </button>
                        <button onClick={() => reject.mutate(w.id)} disabled={reject.isPending}
                          className="inline-flex items-center gap-1 text-xs bg-red-100 hover:bg-red-200 text-red-600 px-3 py-1.5 rounded-full font-medium transition-colors disabled:opacity-50">
                          <MdClose /> Reject
                        </button>
                      </div>
                    )}
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
