import { useQuery } from '@tanstack/react-query';
import { MdTrendingUp, MdCampaign, MdPending, MdAccountBalanceWallet, MdPeople, MdFlag } from 'react-icons/md';
import AdminLayout from '../../components/AdminLayout';
import api from '../../utils/api';
import { formatCurrency, formatTimeAgo } from '../../utils/formatters';
import LoadingSpinner from '../../components/LoadingSpinner';
import { Link } from 'react-router-dom';

export default function AdminDashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: () => api.get('/admin/dashboard').then(r => r.data),
    staleTime: 60 * 1000,
  });

  const stats = data ? [
    { label: 'Total Raised', value: formatCurrency(data.total_raised || 0), icon: MdTrendingUp, iconClass: 'icon-green' },
    { label: 'Total Campaigns', value: data.total_campaigns || 0, icon: MdCampaign, iconClass: 'icon-blue' },
    { label: 'Total Donations', value: data.total_donations || 0, icon: MdPeople, iconClass: 'icon-purple' },
    { label: 'Pending Reviews', value: data.pending_verifications || 0, icon: MdPending, iconClass: 'icon-gold', urgent: true },
    { label: 'Pending Withdrawals', value: data.pending_withdrawals || 0, icon: MdAccountBalanceWallet, iconClass: 'icon-red', urgent: true },
    { label: 'Open Reports', value: data.open_reports || 0, icon: MdFlag, iconClass: 'icon-red' },
  ] : [];

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="text-2xl font-black text-dark">Admin Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Platform overview and management</p>
      </div>

      {isLoading ? (
        <div className="py-16"><LoadingSpinner /></div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
            {stats.map(({ label, value, icon: Icon, iconClass, urgent }) => (
              <div key={label} className={`stat-card p-5 ${urgent && Number(value) > 0 ? 'border-amber-200' : ''}`}>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm text-gray-500 font-medium">{label}</p>
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${iconClass}`}>
                    <Icon className="text-lg text-white" />
                  </div>
                </div>
                <p className={`text-2xl font-black ${urgent && Number(value) > 0 ? 'text-amber-600' : 'text-dark'}`}>{value}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[
              { label: 'Review Campaigns', to: '/admin/campaigns', color: 'bg-amber-500', count: data?.pending_verifications },
              { label: 'Approve Withdrawals', to: '/admin/withdrawals', color: 'bg-primary', count: data?.pending_withdrawals },
              { label: 'View Reports', to: '/admin/reports', color: 'bg-orange-500', count: data?.open_reports },
              { label: 'Manage Users', to: '/admin/users', color: 'bg-blue-600', count: data?.total_users },
            ].map(({ label, to, color, count }) => (
              <Link key={label} to={to} className={`${color} hover:opacity-90 text-white rounded-2xl p-5 transition-all hover:scale-105 block`}>
                <p className="text-2xl font-black mb-1">{count ?? 0}</p>
                <p className="text-sm font-semibold opacity-90">{label}</p>
              </Link>
            ))}
          </div>

          {data?.recent_campaigns && data.recent_campaigns.length > 0 && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                <h2 className="font-bold text-dark">Recent Campaigns</h2>
                <Link to="/admin/campaigns" className="text-primary text-sm font-medium hover:underline">View all</Link>
              </div>
              <div className="divide-y divide-gray-50">
                {data.recent_campaigns.map(c => (
                  <div key={c.id} className="flex items-center gap-3 px-5 py-3">
                    <div className="w-10 h-10 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0">
                      {c.cover_image && <img src={c.cover_image} alt="" className="w-full h-full object-cover" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-dark text-sm truncate">{c.title}</p>
                      <p className="text-xs text-gray-400">{formatTimeAgo(c.created_at)}</p>
                    </div>
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full capitalize ${
                      c.status === 'active' ? 'bg-green-100 text-primary' :
                      c.status === 'pending' ? 'bg-amber-100 text-amber-600' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      {c.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </AdminLayout>
  );
}
