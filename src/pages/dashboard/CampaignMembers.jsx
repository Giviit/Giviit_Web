import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MdArrowBack, MdPersonAdd, MdDelete, MdPeople, MdCheck, MdClose } from 'react-icons/md';
import DashboardLayout from '../../components/DashboardLayout';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function CampaignMembers() {
  const { id } = useParams();
  const qc = useQueryClient();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['campaign-members', id],
    queryFn: () => api.get(`/campaigns/${id}/members`).then(r => r.data),
  });

  const invite = async (e) => {
    e.preventDefault();
    if (!email.trim() || !email.includes('@')) { toast.error('Enter a valid email'); return; }
    setLoading(true);
    try {
      await api.post(`/campaigns/${id}/invite`, { email });
      toast.success(`Invitation sent to ${email}`);
      setEmail('');
      qc.invalidateQueries(['campaign-members', id]);
    } catch { toast.error('Failed to send invitation'); }
    setLoading(false);
  };

  const removeMutation = useMutation({
    mutationFn: (userId) => api.delete(`/campaigns/${id}/members/${userId}`),
    onSuccess: () => { qc.invalidateQueries(['campaign-members', id]); toast.success('Co-owner removed'); },
    onError: () => toast.error('Failed to remove'),
  });

  const members = data?.members || [];

  return (
    <DashboardLayout>
      <div className="max-w-xl mx-auto">
        <Link to="/dashboard/campaigns" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-dark mb-5 transition-colors">
          <MdArrowBack /> Back to Campaigns
        </Link>

        <div className="mb-6">
          <h1 className="text-2xl font-black text-dark">Ajo Mode — Co-Owners</h1>
          <p className="text-sm text-gray-500 mt-0.5">Invite trusted people to manage this campaign with you</p>
        </div>

        {/* Role info */}
        <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4 mb-5">
          <p className="text-xs font-bold text-primary uppercase tracking-wide mb-2">Co-owner permissions</p>
          <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
            {[
              { can: true, action: 'Post campaign updates' },
              { can: true, action: 'View donation details' },
              { can: true, action: 'Respond to comments' },
              { can: false, action: 'Request withdrawals' },
              { can: false, action: 'Delete campaign' },
              { can: false, action: 'Invite others' },
            ].map(({ can, action }) => (
              <div key={action} className="flex items-center gap-1.5">
                <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-black flex-shrink-0 ${can ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-500'}`}>
                  {can ? <MdCheck className="text-xs" /> : <MdClose className="text-xs" />}
                </span>
                {action}
              </div>
            ))}
          </div>
        </div>

        {/* Invite form */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-5 shadow-sm">
          <h3 className="font-bold text-dark mb-3">Invite a Co-owner</h3>
          <form onSubmit={invite} className="flex gap-2">
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="Enter email address"
              className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
            <button type="submit" disabled={loading} className="px-4 py-2.5 rounded-xl text-white text-sm font-bold transition-all hover:opacity-90 disabled:opacity-60 flex items-center gap-1.5"
              style={{ background: 'linear-gradient(135deg, #22c55e, #1a7a4a)' }}>
              <MdPersonAdd className="text-lg" /> {loading ? 'Sending...' : 'Invite'}
            </button>
          </form>
          <p className="text-xs text-gray-400 mt-2">They'll receive an email with a link to accept. The invite expires in 7 days.</p>
        </div>

        {/* Members list */}
        {isLoading ? <div className="py-12"><LoadingSpinner /></div> : (
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
            <div className="px-5 py-3 border-b border-gray-50 flex items-center gap-2">
              <MdPeople className="text-primary" />
              <span className="text-sm font-bold text-dark">{members.length + 1} member{members.length !== 0 ? 's' : ''}</span>
            </div>

            {/* Owner (always first) */}
            <div className="flex items-center gap-3 px-5 py-3.5 border-b border-gray-50">
              <div className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                style={{ background: 'linear-gradient(135deg, #22c55e, #1a7a4a)' }}>Y</div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-dark">You (Campaign Owner)</p>
                <p className="text-xs text-primary font-medium">Full access</p>
              </div>
              <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-primary/10 text-primary">Owner</span>
            </div>

            {members.length === 0 ? (
              <div className="px-5 py-8 text-center text-sm text-gray-400">
                No co-owners yet. Invite someone to help manage this campaign.
              </div>
            ) : members.map(m => (
              <div key={m.id} className="flex items-center gap-3 px-5 py-3.5 border-b border-gray-50 last:border-0">
                <div className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                  style={{ background: 'linear-gradient(135deg, #60a5fa, #2563eb)' }}>
                  {m.full_name?.charAt(0)?.toUpperCase() || '?'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-dark">{m.full_name || m.invited_email}</p>
                  <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${m.status === 'accepted' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                    {m.status === 'accepted' ? 'Active' : 'Invite Pending'}
                  </span>
                </div>
                <button onClick={() => removeMutation.mutate(m.user_id)} disabled={removeMutation.isPending}
                  className="p-1.5 rounded-lg hover:bg-red-50 text-gray-300 hover:text-red-500 transition-colors">
                  <MdDelete className="text-lg" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
