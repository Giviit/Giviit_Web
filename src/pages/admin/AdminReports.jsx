import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MdFlag, MdCheck, MdVisibility } from 'react-icons/md';
import { Link } from 'react-router-dom';
import AdminLayout from '../../components/AdminLayout';
import api from '../../utils/api';
import { formatTimeAgo } from '../../utils/formatters';
import LoadingSpinner from '../../components/LoadingSpinner';
import toast from 'react-hot-toast';

const STATUS_STYLES = {
  pending: 'bg-amber-100 text-amber-600',
  reviewed: 'bg-green-100 text-primary',
  dismissed: 'bg-gray-100 text-gray-500',
};

export default function AdminReports() {
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['admin-reports'],
    queryFn: () => api.get('/admin/reports').then(r => r.data),
  });

  const review = useMutation({
    mutationFn: (id) => api.put(`/admin/reports/${id}/review`),
    onSuccess: () => { toast.success('Report marked as reviewed'); qc.invalidateQueries(['admin-reports']); },
  });

  const reports = data?.reports || [];

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="text-2xl font-black text-dark">Reports</h1>
        <p className="text-gray-500 text-sm mt-1">Review and action campaign reports</p>
      </div>

      {isLoading ? (
        <div className="py-16"><LoadingSpinner /></div>
      ) : reports.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-100">
          <MdFlag className="text-5xl text-gray-200 mx-auto mb-3" />
          <p className="text-gray-400">No reports to review.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {reports.map(r => (
            <div key={r.id} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <MdFlag className={`text-sm ${r.status === 'pending' ? 'text-red-500' : 'text-gray-400'}`} />
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full capitalize ${STATUS_STYLES[r.status] || 'bg-gray-100 text-gray-600'}`}>
                      {r.status}
                    </span>
                    <span className="text-xs text-gray-400">{formatTimeAgo(r.created_at)}</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-0.5">Campaign</p>
                      <p className="font-medium text-dark">{r.campaign?.title || 'Unknown'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-0.5">Reporter</p>
                      <p className="text-dark">{r.reporter_email}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-0.5">Reason</p>
                      <p className="text-dark capitalize">{r.reason}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-0.5">Details</p>
                      <p className="text-gray-600 line-clamp-2">{r.details || '—'}</p>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col gap-2 flex-shrink-0">
                  {r.campaign && (
                    <Link to={`/campaign/${r.campaign.slug}`} target="_blank"
                      className="inline-flex items-center gap-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-full font-medium transition-colors">
                      <MdVisibility className="text-sm" /> View
                    </Link>
                  )}
                  {r.status === 'pending' && (
                    <button onClick={() => review.mutate(r.id)} disabled={review.isPending}
                      className="inline-flex items-center gap-1 text-xs bg-green-100 hover:bg-green-200 text-primary px-3 py-1.5 rounded-full font-medium transition-colors">
                      <MdCheck className="text-sm" /> Reviewed
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </AdminLayout>
  );
}
