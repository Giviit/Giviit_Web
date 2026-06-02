import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { MdTrendingUp, MdCampaign, MdPeople, MdArrowForward, MdAddCircle } from 'react-icons/md';
import DashboardLayout from '../../components/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import { formatCurrency, formatTimeAgo } from '../../utils/formatters';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function DashboardHome() {
  const { user } = useAuth();

  const { data: campaigns, isLoading: campaignsLoading } = useQuery({
    queryKey: ['my-campaigns'],
    queryFn: () => api.get('/campaigns?my=true').then(r => r.data.campaigns),
  });

  const { data: donations, isLoading: donationsLoading } = useQuery({
    queryKey: ['recent-donations'],
    queryFn: () => api.get('/donations/my?limit=5').then(r => r.data.donations),
    retry: false,
  });

  const totalRaised = campaigns?.reduce((sum, c) => sum + (c.raised_amount || 0), 0) || 0;
  const activeCampaigns = campaigns?.filter(c => c.status === 'active').length || 0;
  const totalDonors = campaigns?.reduce((sum, c) => sum + (c.donor_count || 0), 0) || 0;

  const stats = [
    { label: 'Total Raised', value: formatCurrency(totalRaised), icon: MdTrendingUp, iconClass: 'icon-green' },
    { label: 'Active Campaigns', value: activeCampaigns, icon: MdCampaign, iconClass: 'icon-blue' },
    { label: 'Total Donors', value: totalDonors, icon: MdPeople, iconClass: 'icon-gold' },
  ];

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-2xl font-black text-dark">
          Good day, {user?.full_name?.split(' ')[0]}
        </h1>
        <p className="text-gray-500 text-sm mt-1">Here's an overview of your fundraising activity.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
        {stats.map(({ label, value, icon: Icon, iconClass }) => (
          <div key={label} className="stat-card p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-gray-500 font-medium">{label}</p>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${iconClass}`}>
                <Icon className="text-lg text-white" />
              </div>
            </div>
            <p className="text-2xl font-black text-dark">{value}</p>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div className="bg-gradient-to-r from-primary to-primary/80 rounded-2xl p-6 mb-8 text-white">
        <h2 className="font-bold text-lg mb-1">Start a new campaign</h2>
        <p className="text-green-200 text-sm mb-4">Create your campaign and start raising funds today.</p>
        <Link
          to="/dashboard/campaigns/create"
          className="inline-flex items-center gap-2 bg-white text-primary font-bold px-5 py-2.5 rounded-full text-sm transition-all hover:scale-105"
        >
          <MdAddCircle /> Create Campaign
        </Link>
      </div>

      {/* My campaigns */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 mb-8">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="font-bold text-dark">My Campaigns</h2>
          <Link to="/dashboard/campaigns" className="text-primary text-sm font-medium flex items-center gap-1 hover:underline">
            View all <MdArrowForward />
          </Link>
        </div>
        {campaignsLoading ? (
          <div className="py-8"><LoadingSpinner /></div>
        ) : !campaigns?.length ? (
          <div className="py-8 text-center">
            <p className="text-gray-400 text-sm">No campaigns yet.</p>
            <Link to="/dashboard/campaigns/create" className="text-primary text-sm font-medium mt-2 inline-block">Create your first campaign</Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {campaigns.slice(0, 5).map(c => (
              <div key={c.id} className="flex items-center gap-3 px-5 py-3">
                <div className="w-10 h-10 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0">
                  {c.cover_image ? (
                    <img src={c.cover_image} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-primary/10" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-dark text-sm truncate">{c.title}</p>
                  <p className="text-xs text-gray-400">{formatCurrency(c.raised_amount)} raised</p>
                </div>
                <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                  c.status === 'active' ? 'bg-green-100 text-primary' :
                  c.status === 'pending' ? 'bg-amber-100 text-amber-600' :
                  c.status === 'rejected' ? 'bg-red-100 text-red-600' :
                  'bg-gray-100 text-gray-600'
                }`}>
                  {c.status}
                </span>
                <Link to={`/dashboard/campaigns/${c.id}`} className="text-primary text-xs font-medium hover:underline ml-2">
                  View
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent donations */}
      {donations && donations.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="font-bold text-dark">Recent Donations</h2>
          </div>
          <div className="divide-y divide-gray-50">
            {donations.map(d => (
              <div key={d.id} className="flex items-center gap-3 px-5 py-3">
                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-primary font-bold text-xs">{d.is_anonymous ? 'A' : d.donor_name?.charAt(0)}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-dark">{d.is_anonymous ? 'Anonymous' : d.donor_name}</p>
                  <p className="text-xs text-gray-400">{formatTimeAgo(d.created_at)}</p>
                </div>
                <p className="text-primary font-bold text-sm">{formatCurrency(d.amount)}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
