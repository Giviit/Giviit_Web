import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
  MdArrowForward, MdAddCircle, MdTrendingUp,
  MdAccountBalanceWallet, MdPeople, MdArrowUpward,
} from 'react-icons/md';
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

  const { data: donations } = useQuery({
    queryKey: ['recent-donations'],
    queryFn: () => api.get('/donations/my?limit=5').then(r => r.data.donations),
    retry: false,
  });

  const { data: analytics } = useQuery({
    queryKey: ['dashboard-analytics'],
    queryFn: () => api.get('/dashboard/analytics').then(r => r.data),
  });

  const { data: withdrawals } = useQuery({
    queryKey: ['my-withdrawals'],
    queryFn: () => api.get('/withdrawals/my').then(r => r.data.withdrawals),
    retry: false,
  });

  const computedRaised = campaigns?.reduce((s, c) => s + (c.raised_amount || 0), 0) || 0;
  const computedDonors = campaigns?.reduce((s, c) => s + (c.donor_count || 0), 0) || 0;

  const stats = {
    totalRaised: analytics?.total_raised ?? computedRaised,
    availableBalance: analytics?.available_balance ?? 0,
    feesPaid: analytics?.platform_fees_paid ?? 0,
    totalWithdrawn: analytics?.total_withdrawn ?? 0,
    thisMonth: analytics?.this_month ?? 0,
    lastMonth: analytics?.last_month ?? 0,
    totalDonors: analytics?.total_donors ?? computedDonors,
  };

  const monthlyData = analytics?.monthly || [];
  const maxMonthly = Math.max(...monthlyData.map(m => m.amount), 1);

  const monthChange = stats.lastMonth > 0
    ? Math.round(((stats.thisMonth - stats.lastMonth) / stats.lastMonth) * 100)
    : 0;

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-2xl font-black text-dark">
          Good day, {user?.full_name?.split(' ')[0]}
        </h1>
        <p className="text-gray-500 text-sm mt-1">Here's your fundraising overview.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div
          className="col-span-2 lg:col-span-1 rounded-2xl p-5 flex flex-col justify-between"
          style={{ background: '#0D1A0D' }}
        >
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.5)' }}>
              Total Raised
            </p>
            <MdTrendingUp className="text-green-400 text-lg" />
          </div>
          <p className="text-2xl font-black text-white">{formatCurrency(stats.totalRaised)}</p>
          <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.4)' }}>Across all campaigns</p>
        </div>

        <div className="rounded-2xl p-5 border border-gray-100 bg-white shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Available</p>
            <MdAccountBalanceWallet className="text-primary text-lg" />
          </div>
          <p className="text-2xl font-black text-dark">{formatCurrency(stats.availableBalance)}</p>
          <p className="text-xs text-gray-400 mt-1">Ready to withdraw</p>
        </div>

        <div className="rounded-2xl p-5 border border-gray-100 bg-white shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">This Month</p>
            {monthChange >= 0 ? (
              <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">+{monthChange}%</span>
            ) : (
              <span className="text-xs font-bold text-red-500 bg-red-50 px-2 py-0.5 rounded-full">{monthChange}%</span>
            )}
          </div>
          <p className="text-2xl font-black text-dark">{formatCurrency(stats.thisMonth)}</p>
          <p className="text-xs text-gray-400 mt-1">vs {formatCurrency(stats.lastMonth)} last month</p>
        </div>

        <div className="rounded-2xl p-5 border border-gray-100 bg-white shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Donors</p>
            <MdPeople className="text-blue-500 text-lg" />
          </div>
          <p className="text-2xl font-black text-dark">{stats.totalDonors.toLocaleString()}</p>
          <p className="text-xs text-gray-400 mt-1">Total contributors</p>
        </div>
      </div>

      {/* Monthly Trend + Money Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="mb-5">
            <h2 className="font-bold text-dark text-sm">Monthly Earnings</h2>
            <p className="text-xs text-gray-400 mt-0.5">Last 6 months</p>
          </div>
          {monthlyData.length > 0 ? (
            <>
              <div className="flex items-end gap-2 h-28">
                {monthlyData.map((m, i) => {
                  const isLast = i === monthlyData.length - 1;
                  const barH = Math.max(8, Math.round((m.amount / maxMonthly) * 96));
                  return (
                    <div key={m.month} className="flex-1 flex flex-col items-center gap-1.5">
                      {isLast && (
                        <span className="text-[9px] font-bold text-primary leading-none">
                          {formatCurrency(m.amount)}
                        </span>
                      )}
                      <div
                        className="w-full rounded-t-lg"
                        style={{
                          height: `${barH}%`,
                          background: isLast ? '#1a7a4a' : 'rgba(26,122,74,0.18)',
                        }}
                        title={formatCurrency(m.amount)}
                      />
                      <span className="text-[10px] text-gray-400 font-medium">{m.month}</span>
                    </div>
                  );
                })}
              </div>
              <div className="mt-4 flex items-center gap-4 text-xs text-gray-400">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm bg-primary inline-block" />
                  Current month
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm inline-block" style={{ background: 'rgba(26,122,74,0.18)' }} />
                  Previous months
                </span>
              </div>
            </>
          ) : (
            <div className="h-28 flex items-center justify-center text-gray-300 text-sm">No data yet</div>
          )}
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col">
          <h2 className="font-bold text-dark text-sm mb-5">Money Breakdown</h2>
          <div className="space-y-4 flex-1">
            {[
              { label: 'Total Raised', value: stats.totalRaised, bg: '#0D1A0D', pct: 100 },
              { label: 'Platform Fees (5%)', value: stats.feesPaid, bg: '#f59e0b', pct: Math.round((stats.feesPaid / (stats.totalRaised || 1)) * 100) },
              { label: 'Withdrawn', value: stats.totalWithdrawn, bg: '#60a5fa', pct: Math.round((stats.totalWithdrawn / (stats.totalRaised || 1)) * 100) },
              { label: 'Available', value: stats.availableBalance, bg: '#1a7a4a', pct: Math.round((stats.availableBalance / (stats.totalRaised || 1)) * 100) },
            ].map(({ label, value, bg, pct }) => (
              <div key={label}>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-gray-500">{label}</span>
                  <span className="font-bold text-dark">{formatCurrency(value)}</span>
                </div>
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${pct}%`, background: bg }}
                  />
                </div>
              </div>
            ))}
          </div>
          <Link
            to="/dashboard/withdrawals"
            className="mt-5 flex items-center justify-center gap-2 text-white text-xs font-bold py-3 rounded-xl hover:opacity-90 transition-opacity"
            style={{ background: '#1a7a4a' }}
          >
            <MdArrowUpward className="text-sm" /> Request Withdrawal
          </Link>
        </div>
      </div>

      {/* Campaign Performance Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm mb-6">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="font-bold text-dark">Campaign Performance</h2>
          <Link to="/dashboard/campaigns" className="text-primary text-sm font-medium flex items-center gap-1 hover:underline">
            View all <MdArrowForward />
          </Link>
        </div>
        {campaignsLoading ? (
          <div className="py-8"><LoadingSpinner /></div>
        ) : !campaigns?.length ? (
          <div className="py-8 text-center">
            <p className="text-gray-400 text-sm">No campaigns yet.</p>
            <Link to="/dashboard/campaigns/create" className="text-primary text-sm font-medium mt-2 inline-block">
              Create your first campaign
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-[11px] text-gray-400 uppercase tracking-wider border-b border-gray-50">
                  <th className="px-5 py-3 text-left font-semibold">Campaign</th>
                  <th className="px-3 py-3 text-right font-semibold">Raised</th>
                  <th className="px-3 py-3 text-right font-semibold hidden sm:table-cell">Goal</th>
                  <th className="px-3 py-3 text-left font-semibold hidden md:table-cell w-40">Progress</th>
                  <th className="px-3 py-3 text-right font-semibold hidden sm:table-cell">Donors</th>
                  <th className="px-3 py-3 text-center font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {campaigns.slice(0, 5).map(c => {
                  const pct = c.goal_amount
                    ? Math.min(100, Math.round((c.raised_amount / c.goal_amount) * 100))
                    : 0;
                  return (
                    <tr key={c.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                            {c.cover_image
                              ? <img src={c.cover_image} alt="" className="w-full h-full object-cover" />
                              : <div className="w-full h-full bg-primary/10" />}
                          </div>
                          <p className="font-medium text-dark truncate max-w-[150px]">{c.title}</p>
                        </div>
                      </td>
                      <td className="px-3 py-3.5 text-right font-bold text-primary whitespace-nowrap">
                        {formatCurrency(c.raised_amount)}
                      </td>
                      <td className="px-3 py-3.5 text-right text-gray-500 whitespace-nowrap hidden sm:table-cell">
                        {formatCurrency(c.goal_amount)}
                      </td>
                      <td className="px-3 py-3.5 hidden md:table-cell">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full"
                              style={{ width: `${pct}%`, background: '#1a7a4a' }}
                            />
                          </div>
                          <span className="text-xs text-gray-500 w-8 text-right">{pct}%</span>
                        </div>
                      </td>
                      <td className="px-3 py-3.5 text-right text-gray-600 hidden sm:table-cell">
                        {(c.donor_count || 0).toLocaleString()}
                      </td>
                      <td className="px-3 py-3.5 text-center">
                        <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                          c.status === 'active'  ? 'bg-green-100 text-green-700' :
                          c.status === 'pending' ? 'bg-amber-100 text-amber-600' :
                          c.status === 'flagged' ? 'bg-red-100 text-red-600' :
                          'bg-gray-100 text-gray-600'
                        }`}>
                          {c.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Recent Donations + Withdrawals */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="font-bold text-dark">Recent Donations</h2>
          </div>
          {donations && donations.length > 0 ? (
            <div className="divide-y divide-gray-50">
              {donations.slice(0, 5).map(d => (
                <div key={d.id} className="flex items-center gap-3 px-5 py-3">
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-primary font-bold text-xs">
                      {d.is_anonymous ? 'A' : d.donor_name?.charAt(0)}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-dark truncate">
                      {d.is_anonymous ? 'Anonymous' : d.donor_name}
                    </p>
                    <p className="text-xs text-gray-400">{formatTimeAgo(d.created_at)}</p>
                  </div>
                  <p className="text-primary font-bold text-sm whitespace-nowrap">{formatCurrency(d.amount)}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-gray-400 text-sm">No donations yet</div>
          )}
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h2 className="font-bold text-dark">Withdrawals</h2>
            <Link to="/dashboard/withdrawals" className="text-primary text-sm font-medium flex items-center gap-1 hover:underline">
              View all <MdArrowForward />
            </Link>
          </div>
          {withdrawals && withdrawals.length > 0 ? (
            <div className="divide-y divide-gray-50">
              {withdrawals.slice(0, 4).map(w => (
                <div key={w.id} className="flex items-center gap-3 px-5 py-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    w.status === 'completed' ? 'bg-green-100' :
                    w.status === 'pending'   ? 'bg-amber-100' :
                    'bg-red-100'
                  }`}>
                    <MdAccountBalanceWallet className={`text-sm ${
                      w.status === 'completed' ? 'text-green-600' :
                      w.status === 'pending'   ? 'text-amber-600' :
                      'text-red-600'
                    }`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-dark capitalize">{w.status}</p>
                    <p className="text-xs text-gray-400">{formatTimeAgo(w.created_at)}</p>
                  </div>
                  <p className="font-bold text-sm text-dark whitespace-nowrap">{formatCurrency(w.amount)}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center">
              <p className="text-gray-400 text-sm">No withdrawals yet</p>
              <Link to="/dashboard/withdrawals" className="text-primary text-sm font-medium mt-2 inline-block">
                Request withdrawal
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* New Campaign CTA */}
      <div className="border border-gray-200 rounded-xl p-5 flex items-center justify-between gap-4">
        <div>
          <h2 className="font-bold text-dark">Start a new campaign</h2>
          <p className="text-gray-500 text-sm mt-0.5">Create your campaign and start raising funds today.</p>
        </div>
        <Link
          to="/dashboard/campaigns/create"
          className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-white font-bold px-5 py-2.5 rounded-lg text-sm transition-colors flex-shrink-0"
        >
          <MdAddCircle /> Create Campaign
        </Link>
      </div>
    </DashboardLayout>
  );
}
