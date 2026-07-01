import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
  MdAddCircle, MdEdit, MdVisibility, MdUpdate,
  MdFlag, MdWarning, MdSend, MdClose, MdCelebration, MdLock,
} from 'react-icons/md';
import DashboardLayout from '../../components/DashboardLayout';
import api from '../../utils/api';
import { formatCurrency, formatProgress, stripEmoji } from '../../utils/formatters';
import ProgressBar from '../../components/ProgressBar';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import toast from 'react-hot-toast';

const STATUS_STYLES = {
  active: 'bg-green-100 text-primary',
  pending: 'bg-amber-100 text-amber-600',
  rejected: 'bg-red-100 text-red-600',
  flagged: 'bg-red-100 text-red-600',
  paused: 'bg-gray-100 text-gray-500',
  completed: 'bg-blue-100 text-blue-600',
};

function AppealModal({ campaign, onClose }) {
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim() || message.trim().length < 50) {
      toast.error('Please write at least 50 characters explaining your appeal');
      return;
    }
    setLoading(true);
    try {
      await api.post(`/campaigns/${campaign.id}/appeal`, { message });
      toast.success('Appeal submitted! We will review within 24–48 hours.');
      onClose(true);
    } catch {
      toast.error('Failed to submit appeal. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => onClose(false)} />
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-lg p-6">
        <button onClick={() => onClose(false)} className="absolute top-4 right-4 p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
          <MdClose className="text-xl text-gray-400" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 icon-gold">
            <MdFlag className="text-white text-lg" />
          </div>
          <div>
            <h3 className="font-black text-dark text-base">Submit an Appeal</h3>
            <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{campaign.title}</p>
          </div>
        </div>

        {/* Flag reason */}
        <div className="p-4 rounded-2xl bg-red-50 border border-red-100 mb-4">
          <p className="text-xs font-bold text-red-500 uppercase tracking-wide mb-1">Admin's Reason for Flagging</p>
          <p className="text-sm text-red-700">{campaign.flag_reason}</p>
        </div>

        <form onSubmit={handleSubmit}>
          <label className="block text-sm font-bold text-dark mb-1.5">
            Your Appeal Message <span className="text-red-500">*</span>
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(stripEmoji(e.target.value))}
            placeholder="Explain why this flag is incorrect. Provide evidence, documentation, or context that supports your campaign's legitimacy. Be specific and detailed."
            rows={5}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none mb-1"
          />
          <p className="text-xs text-gray-400 mb-4">{message.length} characters (minimum 50)</p>

          <div className="flex gap-3">
            <button type="button" onClick={() => onClose(false)} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors">
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || message.trim().length < 50}
              className="flex-1 py-2.5 rounded-xl text-white text-sm font-bold flex items-center justify-center gap-2 transition-all hover:opacity-90 disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg, #22c55e, #1a7a4a)', boxShadow: '0 4px 12px rgba(26,122,74,0.3)' }}
            >
              {loading ? 'Submitting...' : <><MdSend className="text-sm" /> Submit Appeal</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function MyCampaigns() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ['my-campaigns'],
    queryFn: () => api.get('/campaigns?my=true').then(r => r.data),
  });

  const [appealTarget, setAppealTarget] = useState(null);
  const [submittedAppeals, setSubmittedAppeals] = useState(new Set());
  const [closingId, setClosingId] = useState(null);

  const campaigns = data?.campaigns || [];
  const flaggedCount = campaigns.filter(c => c.is_flagged).length;

  const handleAppealClose = (submitted) => {
    if (submitted && appealTarget) {
      setSubmittedAppeals(prev => new Set([...prev, appealTarget.id]));
    }
    setAppealTarget(null);
  };

  const handleCloseCampaign = async (campaign) => {
    if (!window.confirm(`Close "${campaign.title}"? This stops new donations immediately and can't be undone.`)) return;
    setClosingId(campaign.id);
    try {
      await api.put(`/campaigns/${campaign.id}/close`);
      toast.success('Campaign closed. You can now withdraw your funds.');
      queryClient.invalidateQueries({ queryKey: ['my-campaigns'] });
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to close campaign');
    } finally {
      setClosingId(null);
    }
  };

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black text-dark">My Campaigns</h1>
          <p className="text-gray-500 text-sm mt-1">{campaigns.length} campaign{campaigns.length !== 1 ? 's' : ''}</p>
        </div>
        <Link
          to="/dashboard/campaigns/create"
          className="inline-flex items-center gap-2 text-white font-bold px-5 py-2.5 rounded-full text-sm transition-colors"
          style={{ background: 'linear-gradient(135deg, #22c55e, #1a7a4a)' }}
        >
          <MdAddCircle /> New Campaign
        </Link>
      </div>

      {/* Flagged campaigns banner */}
      {flaggedCount > 0 && (
        <div className="mb-5 p-4 rounded-2xl border border-red-200 bg-red-50 flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 icon-red">
            <MdWarning className="text-white text-lg" />
          </div>
          <div>
            <p className="text-sm font-bold text-red-700">
              {flaggedCount === 1 ? '1 campaign has been flagged' : `${flaggedCount} campaigns have been flagged`}
            </p>
            <p className="text-xs text-red-600 mt-0.5">
              Flagged campaigns are paused and hidden from the public. Review the reason below and submit an appeal if you believe this is a mistake.
            </p>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="py-16"><LoadingSpinner /></div>
      ) : campaigns.length === 0 ? (
        <EmptyState
          title="No campaigns yet"
          description="Create your first fundraising campaign to get started."
          action={
            <Link to="/dashboard/campaigns/create" className="bg-primary text-white px-6 py-2.5 rounded-full text-sm font-semibold">
              Create Campaign
            </Link>
          }
        />
      ) : (
        <div className="grid gap-4">
          {campaigns.map(c => {
            const pct = formatProgress(c.raised_amount, c.goal_amount);
            const appealSubmitted = submittedAppeals.has(c.id);
            return (
              <div key={c.id} className={`bg-white rounded-2xl shadow-sm border overflow-hidden ${c.is_flagged ? 'border-red-200' : 'border-gray-100'}`}>
                {/* Flagged warning banner */}
                {c.is_flagged && (
                  <div className="px-5 py-3 bg-red-50 border-b border-red-100 flex items-center justify-between flex-wrap gap-3">
                    <div className="flex items-start gap-2 flex-1 min-w-0">
                      <MdFlag className="text-red-500 text-sm mt-0.5 flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-red-600">Campaign Flagged</p>
                        <p className="text-xs text-red-500 mt-0.5 line-clamp-2">{c.flag_reason}</p>
                      </div>
                    </div>
                    {!appealSubmitted && !c.appeal_status && (
                      <button
                        onClick={() => setAppealTarget(c)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-red-200 text-red-600 text-xs font-semibold hover:bg-red-50 transition-colors flex-shrink-0"
                      >
                        <MdSend className="text-sm" /> Appeal
                      </button>
                    )}
                    {(appealSubmitted || c.appeal_status === 'pending') && (
                      <span className="text-xs font-semibold text-amber-600 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-xl">
                        Appeal Submitted — Under Review
                      </span>
                    )}
                    {c.appeal_status === 'approved' && (
                      <span className="text-xs font-semibold text-green-600 bg-green-50 border border-green-200 px-3 py-1.5 rounded-xl">
                        Appeal Approved
                      </span>
                    )}
                    {c.appeal_status === 'rejected' && (
                      <span className="text-xs font-semibold text-red-600 bg-red-50 border border-red-200 px-3 py-1.5 rounded-xl">
                        Appeal Rejected
                      </span>
                    )}
                  </div>
                )}

                {/* Goal-reached celebration */}
                {c.goal_reached_at && (
                  <div className="px-5 py-3 border-b flex items-center justify-between flex-wrap gap-3"
                    style={{ background: 'linear-gradient(135deg,#fffbeb,#fef3c7)', borderColor: '#fde68a' }}>
                    <div className="flex items-start gap-2 flex-1 min-w-0">
                      <MdCelebration className="text-amber-500 text-lg mt-0.5 flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-amber-800">Goal Reached! Campaign closed automatically.</p>
                        <p className="text-xs text-amber-700 mt-0.5">You can now withdraw your funds.</p>
                      </div>
                    </div>
                    <Link to="/dashboard/withdrawals" className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500 text-white text-xs font-semibold hover:bg-amber-600 transition-colors flex-shrink-0">
                      Withdraw Funds
                    </Link>
                  </div>
                )}

                <div className="flex">
                  <div className="w-24 sm:w-36 h-full flex-shrink-0 bg-gray-100">
                    {c.cover_image ? (
                      <img src={c.cover_image} alt="" className="w-full h-full object-cover min-h-[100px]" />
                    ) : (
                      <div className="w-full h-full bg-primary/10 min-h-[100px]" />
                    )}
                  </div>
                  <div className="flex-1 p-4 sm:p-5">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="font-bold text-dark text-base leading-snug line-clamp-1">{c.title}</h3>
                      <span className={`text-xs font-semibold px-2 py-1 rounded-full flex-shrink-0 capitalize ${STATUS_STYLES[c.status] || 'bg-gray-100 text-gray-600'}`}>
                        {c.status}
                      </span>
                    </div>
                    {c.verification_note && c.status === 'rejected' && (
                      <p className="text-xs text-red-500 mb-2 bg-red-50 px-2 py-1 rounded">{c.verification_note}</p>
                    )}
                    <div className="mb-2">
                      <ProgressBar percentage={pct} />
                      <div className="flex justify-between mt-1">
                        <span className="text-xs text-gray-500">{formatCurrency(c.raised_amount)} raised</span>
                        <span className="text-xs text-gray-400">of {formatCurrency(c.goal_amount)}</span>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-3">
                      <Link to={`/campaign/${c.slug}`} className="inline-flex items-center gap-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-full transition-colors font-medium">
                        <MdVisibility className="text-sm" /> View
                      </Link>
                      <Link to={`/dashboard/campaigns/${c.id}/edit`} className="inline-flex items-center gap-1 text-xs bg-blue-50 hover:bg-blue-100 text-blue-600 px-3 py-1.5 rounded-full transition-colors font-medium">
                        <MdEdit className="text-sm" /> Edit
                      </Link>
                      <Link to={`/dashboard/campaigns/${c.id}/update`} className="inline-flex items-center gap-1 text-xs bg-primary/10 hover:bg-primary/20 text-primary px-3 py-1.5 rounded-full transition-colors font-medium">
                        <MdUpdate className="text-sm" /> Post Update
                      </Link>
                      {c.status === 'active' && !c.is_flagged && (
                        <button
                          onClick={() => handleCloseCampaign(c)}
                          disabled={closingId === c.id}
                          className="inline-flex items-center gap-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-600 px-3 py-1.5 rounded-full transition-colors font-medium disabled:opacity-50"
                        >
                          <MdLock className="text-sm" /> {closingId === c.id ? 'Closing...' : 'Close Campaign'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {appealTarget && (
        <AppealModal campaign={appealTarget} onClose={handleAppealClose} />
      )}
    </DashboardLayout>
  );
}
