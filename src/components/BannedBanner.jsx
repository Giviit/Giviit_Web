import { useState } from 'react';
import { MdWarning, MdSend } from 'react-icons/md';
import toast from 'react-hot-toast';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

export default function BannedBanner() {
  const { user, setUser } = useAuth();
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  if (!user?.is_banned) return null;

  const appealStatus = user.ban_appeal_status || 'none';

  const submit = async () => {
    if (message.trim().length < 20) {
      toast.error('Please write at least 20 characters explaining your appeal');
      return;
    }
    setLoading(true);
    try {
      await api.post('/auth/appeal-ban', { message });
      toast.success('Appeal submitted! We will review within 24–48 hours.');
      setUser({ ...user, ban_appeal_status: 'pending' });
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to submit appeal');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-5">
      <div className="flex items-start gap-3">
        <MdWarning className="text-red-500 text-2xl flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <h3 className="font-black text-red-800 text-base">Your account has been suspended</h3>
          {user.ban_reason && <p className="text-sm text-red-700 mt-1">{user.ban_reason}</p>}
          <p className="text-sm text-red-600 mt-1">
            You cannot create campaigns or request withdrawals while suspended.
          </p>

          {appealStatus === 'pending' ? (
            <p className="mt-3 text-sm font-semibold text-red-800">Your appeal is under review — we'll email you once it's decided.</p>
          ) : appealStatus === 'rejected' ? (
            <p className="mt-3 text-sm font-semibold text-red-800">Your last appeal was not approved. Contact support@giviit.ng for further questions.</p>
          ) : (
            <div className="mt-3">
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Explain why you believe this suspension is a mistake (min. 20 characters)..."
                rows={3}
                className="w-full px-3 py-2 border border-red-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-red-200"
              />
              <button
                onClick={submit}
                disabled={loading}
                className="mt-2 flex items-center gap-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors"
              >
                <MdSend className="text-sm" /> {loading ? 'Submitting...' : 'Submit Appeal'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
