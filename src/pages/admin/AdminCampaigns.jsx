import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
  MdVerified,
  MdClose,
  MdStar,
  MdWarning,
  MdSearch,
  MdVisibility,
} from 'react-icons/md';
import AdminLayout from '../../components/AdminLayout';
import api from '../../utils/api';
import { formatCurrency } from '../../utils/formatters';
import LoadingSpinner from '../../components/LoadingSpinner';
import toast from 'react-hot-toast';

const STATUS_FILTERS = ['all', 'pending', 'active', 'rejected', 'paused', 'completed'];

export default function AdminCampaigns() {
  const qc = useQueryClient();
  const [status, setStatus] = useState('all');
  const [search, setSearch] = useState('');
  const [rejectModal, setRejectModal] = useState(null);
  const [rejectNote, setRejectNote] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['admin-campaigns', status, search],
    queryFn: () =>
      api.get('/admin/campaigns', { params: { status: status === 'all' ? undefined : status, search: search || undefined } })
        .then(r => r.data),
  });

  const campaigns = data?.campaigns || [];

  const mutate = (fn) => useMutation({ mutationFn: fn, onSuccess: () => qc.invalidateQueries(['admin-campaigns']) });

  const verify = useMutation({
    mutationFn: (id) => api.put(`/admin/campaigns/${id}/verify`),
    onSuccess: () => { toast.success('Campaign verified'); qc.invalidateQueries(['admin-campaigns']); },
    onError: () => toast.error('Failed to verify'),
  });

  const reject = useMutation({
    mutationFn: ({ id, note }) => api.put(`/admin/campaigns/${id}/reject`, { note }),
    onSuccess: () => { toast.success('Campaign rejected'); setRejectModal(null); setRejectNote(''); qc.invalidateQueries(['admin-campaigns']); },
    onError: () => toast.error('Failed to reject'),
  });

  const feature = useMutation({
    mutationFn: (id) => api.put(`/admin/campaigns/${id}/feature`),
    onSuccess: () => { toast.success('Updated'); qc.invalidateQueries(['admin-campaigns']); },
  });

  const urgent = useMutation({
    mutationFn: (id) => api.put(`/admin/campaigns/${id}/urgent`),
    onSuccess: () => { toast.success('Updated'); qc.invalidateQueries(['admin-campaigns']); },
  });

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="text-2xl font-black text-dark">Campaigns</h1>
        <p className="text-gray-500 text-sm mt-1">Review, verify, and manage all campaigns</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mb-5 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xl" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search campaigns..."
            className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-200 rounded-xl focus:border-primary outline-none text-sm" />
        </div>
        <div className="flex flex-wrap gap-2">
          {STATUS_FILTERS.map(s => (
            <button key={s} onClick={() => setStatus(s)}
              className={`px-3 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${status === s ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
              {s}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="py-16"><LoadingSpinner /></div>
      ) : campaigns.length === 0 ? (
        <p className="text-gray-400 text-center py-16">No campaigns found.</p>
      ) : (
        <div className="space-y-3">
          {campaigns.map(c => (
            <div key={c.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="flex">
                <div className="w-20 sm:w-28 flex-shrink-0 bg-gray-100">
                  {c.cover_image ? (
                    <img src={c.cover_image} alt="" className="w-full h-full object-cover min-h-[90px]" />
                  ) : (
                    <div className="w-full min-h-[90px] bg-gray-200" />
                  )}
                </div>
                <div className="flex-1 p-4">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h3 className="font-bold text-dark text-sm leading-snug line-clamp-1 flex-1">{c.title}</h3>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      {c.is_verified && <MdVerified className="text-primary" title="Verified" />}
                      {c.is_featured && <MdStar className="text-accent" title="Featured" />}
                      {c.is_urgent && <MdWarning className="text-red-500" title="Urgent" />}
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full capitalize ml-1 ${
                        c.status === 'active' ? 'bg-green-100 text-primary' :
                        c.status === 'pending' ? 'bg-amber-100 text-amber-600' :
                        c.status === 'rejected' ? 'bg-red-100 text-red-600' :
                        'bg-gray-100 text-gray-600'
                      }`}>{c.status}</span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mb-3">{formatCurrency(c.raised_amount)} raised of {formatCurrency(c.goal_amount)} · {c.donor_count} donors · {c.category}</p>

                  <div className="flex flex-wrap gap-2">
                    <Link to={`/campaign/${c.slug}`} target="_blank"
                      className="inline-flex items-center gap-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-full font-medium transition-colors">
                      <MdVisibility className="text-sm" /> View
                    </Link>
                    {c.status === 'pending' && (
                      <button onClick={() => verify.mutate(c.id)} disabled={verify.isPending}
                        className="inline-flex items-center gap-1 text-xs bg-green-100 hover:bg-green-200 text-primary px-3 py-1.5 rounded-full font-medium transition-colors">
                        <MdVerified className="text-sm" /> Verify
                      </button>
                    )}
                    {c.status !== 'rejected' && (
                      <button onClick={() => setRejectModal(c)}
                        className="inline-flex items-center gap-1 text-xs bg-red-100 hover:bg-red-200 text-red-600 px-3 py-1.5 rounded-full font-medium transition-colors">
                        <MdClose className="text-sm" /> Reject
                      </button>
                    )}
                    <button onClick={() => feature.mutate(c.id)}
                      className={`inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded-full font-medium transition-colors ${
                        c.is_featured ? 'bg-accent/20 text-accent hover:bg-accent/30' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                      }`}>
                      <MdStar className="text-sm" /> {c.is_featured ? 'Unfeature' : 'Feature'}
                    </button>
                    <button onClick={() => urgent.mutate(c.id)}
                      className={`inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded-full font-medium transition-colors ${
                        c.is_urgent ? 'bg-red-100 text-red-600 hover:bg-red-200' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                      }`}>
                      <MdWarning className="text-sm" /> {c.is_urgent ? 'Remove Urgent' : 'Mark Urgent'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Reject modal */}
      {rejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60" onClick={() => setRejectModal(null)} />
          <div className="relative bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
            <h3 className="font-bold text-dark mb-1">Reject Campaign</h3>
            <p className="text-sm text-gray-500 mb-4 line-clamp-1">{rejectModal.title}</p>
            <textarea value={rejectNote} onChange={e => setRejectNote(e.target.value)}
              placeholder="Reason for rejection (will be shown to creator)..." rows={4} required
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-red-400 outline-none text-sm resize-none mb-4" />
            <div className="flex gap-2">
              <button onClick={() => reject.mutate({ id: rejectModal.id, note: rejectNote })} disabled={!rejectNote || reject.isPending}
                className="bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white font-bold px-5 py-2.5 rounded-xl text-sm transition-colors">
                {reject.isPending ? 'Rejecting...' : 'Confirm Reject'}
              </button>
              <button onClick={() => { setRejectModal(null); setRejectNote(''); }}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold px-5 py-2.5 rounded-xl text-sm transition-colors">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
