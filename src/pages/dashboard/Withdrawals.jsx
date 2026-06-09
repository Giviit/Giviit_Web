import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MdAccountBalance, MdHistory, MdCheck, MdPending, MdClose } from 'react-icons/md';
import DashboardLayout from '../../components/DashboardLayout';
import api from '../../utils/api';
import { formatCurrency, formatTimeAgo } from '../../utils/formatters';
import toast from 'react-hot-toast';
import LoadingSpinner from '../../components/LoadingSpinner';

const STATUS_STYLES = {
  pending: 'bg-amber-100 text-amber-600',
  processing: 'bg-blue-100 text-blue-600',
  completed: 'bg-green-100 text-primary',
  failed: 'bg-red-100 text-red-600',
};

export default function Withdrawals() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({ campaign_id: '', amount: '', bank_name: '', account_number: '', account_name: '' });
  const [showForm, setShowForm] = useState(false);

  const { data: campaigns } = useQuery({
    queryKey: ['my-campaigns'],
    queryFn: () => api.get('/campaigns?my=true').then(r => r.data.campaigns),
  });

  const { data: withdrawals, isLoading } = useQuery({
    queryKey: ['my-withdrawals'],
    queryFn: () => api.get('/withdrawals/my').then(r => r.data.withdrawals),
  });

  const mutation = useMutation({
    mutationFn: (data) => api.post('/withdrawals', data),
    onSuccess: () => {
      toast.success('Withdrawal request submitted!');
      setShowForm(false);
      setForm({ campaign_id: '', amount: '', bank_name: '', account_number: '', account_name: '' });
      queryClient.invalidateQueries(['my-withdrawals']);
    },
    onError: (err) => toast.error(err.response?.data?.error || 'Failed to request withdrawal'),
  });

  const activeCampaigns = campaigns?.filter(c => c.status === 'active') || [];
  const selectedCampaign = campaigns?.find(c => c.id === form.campaign_id);
  const available = selectedCampaign ? selectedCampaign.raised_amount - (selectedCampaign.withdrawn_amount || 0) : 0;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (Number(form.amount) > available) { toast.error(`Max available: ${formatCurrency(available)}`); return; }
    mutation.mutate({ ...form, amount: Number(form.amount) });
  };

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black text-dark">Withdrawals</h1>
          <p className="text-gray-500 text-sm mt-1">Request and track your fund withdrawals</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-white font-bold px-5 py-2.5 rounded-full text-sm transition-colors"
        >
          <MdAccountBalance /> Request Withdrawal
        </button>
      </div>

      {/* Request form */}
      {showForm && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-dark">New Withdrawal Request</h2>
            <button onClick={() => setShowForm(false)} className="p-1 hover:bg-gray-100 rounded-lg">
              <MdClose />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-dark mb-1.5">Campaign</label>
              <select
                value={form.campaign_id}
                onChange={e => setForm(p => ({ ...p, campaign_id: e.target.value }))}
                required
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary outline-none text-sm bg-white"
              >
                <option value="">Select campaign</option>
                {activeCampaigns.map(c => (
                  <option key={c.id} value={c.id}>{c.title} — Available: {formatCurrency(c.raised_amount)}</option>
                ))}
              </select>
            </div>

            {selectedCampaign && (
              <div className="bg-green-50 px-4 py-3 rounded-xl text-sm">
                <p className="text-gray-600">Available balance: <strong className="text-primary">{formatCurrency(available)}</strong></p>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-dark mb-1.5">Amount (NGN)</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₦</span>
                  <input type="number" value={form.amount} onChange={e => setForm(p => ({ ...p, amount: e.target.value }))} required min="1000" max={available}
                    className="w-full pl-8 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary outline-none text-sm" placeholder="50,000" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-dark mb-1.5">Bank Name</label>
                <input type="text" value={form.bank_name} onChange={e => setForm(p => ({ ...p, bank_name: e.target.value }))} required placeholder="GTBank"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary outline-none text-sm" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-dark mb-1.5">Account Number</label>
                <input type="text" value={form.account_number} onChange={e => setForm(p => ({ ...p, account_number: e.target.value }))} required placeholder="0123456789" maxLength={10}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary outline-none text-sm" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-dark mb-1.5">Account Name</label>
                <input type="text" value={form.account_name} onChange={e => setForm(p => ({ ...p, account_name: e.target.value }))} required placeholder="John Adeyemi"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary outline-none text-sm" />
              </div>
            </div>

            <button type="submit" disabled={mutation.isPending}
              className="bg-primary hover:bg-primary/90 disabled:opacity-50 text-white font-bold px-6 py-3 rounded-xl text-sm transition-colors">
              {mutation.isPending ? 'Submitting...' : 'Submit Request'}
            </button>
          </form>
        </div>
      )}

      {/* History */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
        <div className="flex items-center gap-2 px-5 py-4 border-b border-gray-100">
          <MdHistory className="text-gray-400" />
          <h2 className="font-bold text-dark">Withdrawal History</h2>
        </div>
        {isLoading ? (
          <div className="py-10"><LoadingSpinner /></div>
        ) : !withdrawals?.length ? (
          <p className="text-gray-400 text-sm text-center py-10">No withdrawals yet.</p>
        ) : (
          <div className="divide-y divide-gray-50">
            {withdrawals.map(w => (
              <div key={w.id} className="flex items-center gap-4 px-5 py-4">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${STATUS_STYLES[w.status]}`}>
                  {w.status === 'completed' ? <MdCheck /> : w.status === 'failed' ? <MdClose /> : <MdPending />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-dark text-sm">{w.bank_name} — {w.account_number}</p>
                  <p className="text-xs text-gray-400">{formatTimeAgo(w.created_at)}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-dark">{formatCurrency(w.amount)}</p>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full capitalize ${STATUS_STYLES[w.status]}`}>
                    {w.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
