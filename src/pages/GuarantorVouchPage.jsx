import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { MdShield, MdCheckCircle, MdClose } from 'react-icons/md';
import api from '../utils/api';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/LoadingSpinner';
import { formatCurrency } from '../utils/formatters';

export default function GuarantorVouchPage() {
  const { token } = useParams();
  const [done, setDone] = useState(null); // 'vouched' | 'declined'
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const { data, isLoading, error } = useQuery({
    queryKey: ['vouch', token],
    queryFn: () => api.get(`/campaigns/vouch/${token}`).then(r => r.data.campaign),
  });

  const vouch = async () => {
    if (!message.trim()) { toast.error('Please write a short endorsement message'); return; }
    setLoading(true);
    try {
      await api.post(`/campaigns/vouch/${token}`, { message });
      setDone('vouched');
      toast.success('Thank you for vouching!');
    } catch { toast.error('Failed — the link may have expired'); }
    setLoading(false);
  };

  const decline = async () => {
    setLoading(true);
    try {
      await api.post(`/campaigns/decline-vouch/${token}`);
      setDone('declined');
    } catch { toast.error('Failed'); }
    setLoading(false);
  };

  if (isLoading) return <div className="min-h-screen flex items-center justify-center"><LoadingSpinner size="lg" /></div>;
  if (error || !data) return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="text-center">
        <p className="text-xl font-bold text-dark mb-2">Invalid or expired link</p>
        <Link to="/" className="text-primary underline">Go to homepage</Link>
      </div>
    </div>
  );

  if (done === 'vouched') return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <div className="bg-white rounded-3xl p-8 max-w-md w-full text-center shadow-sm border border-gray-100">
        <div className="w-16 h-16 rounded-2xl icon-green flex items-center justify-center mx-auto mb-4">
          <MdCheckCircle className="text-white text-3xl" />
        </div>
        <h1 className="text-2xl font-black text-dark mb-2">Thank you!</h1>
        <p className="text-gray-500 mb-6">Your endorsement has been recorded and will be displayed publicly on the campaign page. This helps build donor trust.</p>
        <Link to={`/campaign/${data.slug || ''}`} className="inline-block bg-primary text-white px-6 py-3 rounded-xl font-bold text-sm">
          View Campaign
        </Link>
      </div>
    </div>
  );

  if (done === 'declined') return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <div className="bg-white rounded-3xl p-8 max-w-md w-full text-center shadow-sm border border-gray-100">
        <div className="w-16 h-16 rounded-2xl icon-red flex items-center justify-center mx-auto mb-4">
          <MdClose className="text-white text-3xl" />
        </div>
        <h1 className="text-xl font-black text-dark mb-2">Response recorded</h1>
        <p className="text-gray-500">You have declined to vouch for this campaign. The admin has been notified.</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 w-full max-w-lg overflow-hidden">
        {/* Campaign preview */}
        {data.cover_image && (
          <div className="relative h-48 overflow-hidden">
            <img src={data.cover_image} alt="" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute bottom-4 left-5 right-5">
              <p className="text-white font-black text-lg leading-tight line-clamp-2">{data.title}</p>
            </div>
          </div>
        )}

        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl icon-green flex items-center justify-center flex-shrink-0">
              <MdShield className="text-white text-xl" />
            </div>
            <div>
              <p className="font-black text-dark">Guarantor Invitation</p>
              <p className="text-xs text-gray-500 mt-0.5">You have been asked to publicly vouch for this campaign</p>
            </div>
          </div>

          {!data.cover_image && (
            <div className="bg-gray-50 rounded-2xl p-4 mb-4">
              <p className="font-bold text-dark text-sm">{data.title}</p>
              {data.description && <p className="text-gray-500 text-xs mt-1 line-clamp-2">{data.description}</p>}
            </div>
          )}

          <p className="text-sm text-gray-600 mb-4 leading-relaxed">
            By vouching, your name will appear publicly on the campaign as a trusted guarantor. Only vouch if you personally know and trust the campaign creator.
          </p>

          <label className="block text-sm font-bold text-dark mb-1.5">Your endorsement message <span className="text-red-500">*</span></label>
          <textarea
            value={message}
            onChange={e => setMessage(e.target.value)}
            placeholder="e.g. I personally know this person and can confirm their situation is genuine..."
            rows={4}
            className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm focus:border-primary outline-none resize-none mb-4"
          />

          <div className="flex gap-3">
            <button onClick={decline} disabled={loading} className="flex-1 py-3 rounded-xl border-2 border-red-200 text-red-600 text-sm font-semibold hover:bg-red-50 transition-colors disabled:opacity-50">
              I cannot vouch
            </button>
            <button onClick={vouch} disabled={loading} className="flex-1 py-3 rounded-xl text-white text-sm font-bold transition-all hover:opacity-90 disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg, #22c55e, #1a7a4a)', boxShadow: '0 4px 12px rgba(26,122,74,0.3)' }}>
              {loading ? 'Submitting...' : 'I vouch for this campaign'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
