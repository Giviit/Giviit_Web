import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MdArrowBack, MdAdd, MdDelete, MdAttachMoney } from 'react-icons/md';
import DashboardLayout from '../../components/DashboardLayout';
import api from '../../utils/api';
import { formatCurrency } from '../../utils/formatters';
import toast from 'react-hot-toast';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function OfflineDonations() {
  const { id } = useParams();
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ donor_name: '', amount: '', note: '', donated_at: new Date().toISOString().split('T')[0] });

  const { data, isLoading } = useQuery({
    queryKey: ['offline-donations', id],
    queryFn: () => api.get(`/donations/offline/${id}`).then(r => r.data),
  });

  const addMutation = useMutation({
    mutationFn: (body) => api.post('/donations/offline', { ...body, campaign_id: id, amount: Number(body.amount) }),
    onSuccess: () => {
      qc.invalidateQueries(['offline-donations', id]);
      toast.success('Offline donation logged');
      setForm({ donor_name: '', amount: '', note: '', donated_at: new Date().toISOString().split('T')[0] });
      setShowForm(false);
    },
    onError: () => toast.error('Failed to log donation'),
  });

  const deleteMutation = useMutation({
    mutationFn: (donationId) => api.delete(`/donations/offline/${donationId}`),
    onSuccess: () => { qc.invalidateQueries(['offline-donations', id]); toast.success('Removed'); },
    onError: () => toast.error('Failed to remove'),
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.donor_name.trim() || !form.amount || Number(form.amount) < 100) {
      toast.error('Enter donor name and amount (min ₦100)');
      return;
    }
    addMutation.mutate(form);
  };

  const offlineDonations = data?.offline_donations || [];
  const total = offlineDonations.reduce((s, d) => s + d.amount, 0);

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto">
        <Link to="/dashboard/campaigns" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-dark mb-5 transition-colors">
          <MdArrowBack /> Back to Campaigns
        </Link>

        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-black text-dark">Offline Donations</h1>
            <p className="text-sm text-gray-500 mt-0.5">Log cash donations received in person</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="inline-flex items-center gap-2 text-white font-bold px-4 py-2.5 rounded-xl text-sm transition-all"
            style={{ background: 'linear-gradient(135deg, #22c55e, #1a7a4a)' }}
          >
            <MdAdd /> Log Donation
          </button>
        </div>

        {/* Total card */}
        {total > 0 && (
          <div className="stat-card p-5 mb-5">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center icon-gold">
                <MdAttachMoney className="text-white text-xl" />
              </div>
              <div>
                <p className="text-2xl font-black text-dark">{formatCurrency(total)}</p>
                <p className="text-sm text-gray-500">Total offline donations logged</p>
              </div>
            </div>
          </div>
        )}

        {/* Add form */}
        {showForm && (
          <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-5 shadow-sm">
            <h3 className="font-bold text-dark mb-4">Log New Offline Donation</h3>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold text-dark mb-1">Donor Name <span className="text-red-500">*</span></label>
                  <input
                    value={form.donor_name}
                    onChange={e => setForm(p => ({ ...p, donor_name: e.target.value }))}
                    placeholder="Full name of donor"
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-dark mb-1">Amount (₦) <span className="text-red-500">*</span></label>
                  <input
                    type="number"
                    value={form.amount}
                    onChange={e => setForm(p => ({ ...p, amount: e.target.value }))}
                    placeholder="e.g. 5000"
                    min="100"
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold text-dark mb-1">Date Received</label>
                  <input
                    type="date"
                    value={form.donated_at}
                    onChange={e => setForm(p => ({ ...p, donated_at: e.target.value }))}
                    max={new Date().toISOString().split('T')[0]}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-dark mb-1">Note (optional)</label>
                  <input
                    value={form.note}
                    onChange={e => setForm(p => ({ ...p, note: e.target.value }))}
                    placeholder="e.g. Received at church"
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>
              </div>
              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors">Cancel</button>
                <button type="submit" disabled={addMutation.isPending} className="flex-1 py-2.5 rounded-xl text-white text-sm font-bold transition-all hover:opacity-90 disabled:opacity-60"
                  style={{ background: 'linear-gradient(135deg, #22c55e, #1a7a4a)' }}>
                  {addMutation.isPending ? 'Saving...' : 'Log Donation'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* List */}
        {isLoading ? (
          <div className="py-16"><LoadingSpinner /></div>
        ) : offlineDonations.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center">
            <MdAttachMoney className="text-gray-200 text-5xl mx-auto mb-3" />
            <p className="font-semibold text-dark">No offline donations yet</p>
            <p className="text-sm text-gray-400 mt-1">Log cash donations you received in person to track your total</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
            <div className="divide-y divide-gray-50">
              {offlineDonations.map(d => (
                <div key={d.id} className="flex items-center gap-4 px-5 py-3.5">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                    style={{ background: 'linear-gradient(135deg, #f5a623, #e89010)' }}>
                    {d.donor_name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-dark">{d.donor_name}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {new Date(d.donated_at).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })}
                      {d.note && <span className="ml-2 text-gray-400">· {d.note}</span>}
                    </p>
                  </div>
                  <p className="text-sm font-black text-primary flex-shrink-0">{formatCurrency(d.amount)}</p>
                  <button
                    onClick={() => deleteMutation.mutate(d.id)}
                    disabled={deleteMutation.isPending}
                    className="p-1.5 rounded-lg hover:bg-red-50 text-gray-300 hover:text-red-500 transition-colors disabled:opacity-40"
                  >
                    <MdDelete className="text-lg" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
