import { useState } from 'react';
import { MdClose, MdLock, MdPayment, MdExpandMore, MdExpandLess } from 'react-icons/md';
import api from '../utils/api';
import { formatCurrency } from '../utils/formatters';
import toast from 'react-hot-toast';
import { getSapaMessage } from './SapaBanner';
import { stripEmoji } from '../utils/formatters';

const PRESET_AMOUNTS = [500, 1000, 5000, 10000, 25000, 50000];
const FREQUENCIES = [
  { value: 'weekly', label: 'Weekly' },
  { value: 'biweekly', label: 'Every 2 weeks' },
  { value: 'monthly', label: 'Monthly' },
];

export default function DonationModal({ campaign, onClose, presetAmount }) {
  const [amount, setAmount] = useState(presetAmount || '');
  const [customAmount, setCustomAmount] = useState('');
  const [donorName, setDonorName] = useState('');
  const [donorEmail, setDonorEmail] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [message, setMessage] = useState('');
  const [prayer, setPrayer] = useState('');
  const [loading, setLoading] = useState(false);

  // Pledge mode
  const [pledgeMode, setPledgeMode] = useState(false);
  const [pledgeInstallments, setPledgeInstallments] = useState(3);
  const [pledgeFrequency, setPledgeFrequency] = useState('monthly');

  const selectedAmount = amount || customAmount;
  const installmentAmount = pledgeMode && selectedAmount
    ? Math.ceil(Number(selectedAmount) / pledgeInstallments)
    : 0;

  const handlePreset = (val) => { setAmount(val); setCustomAmount(''); };
  const handleCustom = (val) => { setCustomAmount(val); setAmount(''); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedAmount || Number(selectedAmount) < 100) { toast.error('Minimum donation is ₦100'); return; }
    if (!donorName.trim()) { toast.error('Please enter your name'); return; }
    if (!donorEmail.trim()) { toast.error('Please enter your email'); return; }

    setLoading(true);
    try {
      if (pledgeMode) {
        // Create pledge
        await api.post('/pledges', {
          campaign_id: campaign.id,
          donor_name: donorName,
          donor_email: donorEmail,
          total_amount: Number(selectedAmount),
          installment_amount: installmentAmount,
          frequency: pledgeFrequency,
          installments_total: pledgeInstallments,
        });
        const sapaMsg = getSapaMessage(installmentAmount);
        toast.success(`Pledge set up! First payment: ${formatCurrency(installmentAmount)}`);
        onClose();
        return;
      }

      const res = await api.post('/donations/initiate', {
        campaign_id: campaign.id,
        donor_name: donorName,
        donor_email: donorEmail,
        amount: Number(selectedAmount),
        is_anonymous: isAnonymous,
        message,
        prayer: prayer || null,
        show_prayer: !!prayer,
      });

      // Show sapa message
      const sapaMsg = getSapaMessage(Number(selectedAmount));
      toast.success(sapaMsg.msg, { duration: 4000 });

      window.location.href = res.data.authorization_url;
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to initiate payment');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[92vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-100 px-5 py-4 flex items-center justify-between rounded-t-2xl z-10">
          <div>
            <h2 className="text-base font-bold text-dark">{pledgeMode ? 'Make a Pledge' : 'Make a Donation'}</h2>
            <p className="text-xs text-gray-500 truncate max-w-[260px]">{campaign.title}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors flex-shrink-0">
            <MdClose className="text-xl" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Amount */}
          <div>
            <label className="block text-sm font-semibold text-dark mb-2">
              {pledgeMode ? 'Total Pledge Amount' : 'Select Amount'}
            </label>
            <div className="grid grid-cols-3 gap-2 mb-2">
              {PRESET_AMOUNTS.map(val => (
                <button key={val} type="button" onClick={() => handlePreset(val)}
                  className={`py-2 rounded-xl text-sm font-semibold border-2 transition-all ${amount === val ? 'border-primary bg-primary text-white' : 'border-gray-200 text-gray-700 hover:border-primary hover:text-primary'}`}>
                  {formatCurrency(val)}
                </button>
              ))}
            </div>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">₦</span>
              <input type="number" placeholder="Or enter custom amount" value={customAmount}
                onChange={e => handleCustom(e.target.value)} min="100"
                className="w-full pl-8 pr-4 py-2.5 border-2 border-gray-200 rounded-xl focus:border-primary outline-none text-sm" />
            </div>
          </div>

          {/* Pledge toggle */}
          <div className="border border-dashed border-primary/30 rounded-xl overflow-hidden">
            <button type="button" onClick={() => setPledgeMode(!pledgeMode)}
              className="w-full flex items-center justify-between px-4 py-3 text-sm font-semibold text-primary hover:bg-primary/5 transition-colors">
              <span>{pledgeMode ? 'Switch to one-time donation' : "Can't give it all now? Make a Pledge"}</span>
              {pledgeMode ? <MdExpandLess /> : <MdExpandMore />}
            </button>
            {pledgeMode && selectedAmount && (
              <div className="px-4 pb-4 space-y-3 border-t border-dashed border-primary/20">
                <div className="grid grid-cols-2 gap-3 mt-3">
                  <div>
                    <label className="block text-xs font-semibold text-dark mb-1">Number of installments</label>
                    <select value={pledgeInstallments} onChange={e => setPledgeInstallments(Number(e.target.value))}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:border-primary outline-none bg-white">
                      {[2, 3, 4, 5, 6, 8, 10, 12].map(n => <option key={n} value={n}>{n} payments</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-dark mb-1">Frequency</label>
                    <select value={pledgeFrequency} onChange={e => setPledgeFrequency(e.target.value)}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:border-primary outline-none bg-white">
                      {FREQUENCIES.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
                    </select>
                  </div>
                </div>
                <div className="bg-primary/5 rounded-xl p-3 text-sm text-center">
                  <span className="font-bold text-primary">{formatCurrency(installmentAmount)}</span>
                  <span className="text-gray-600">/{pledgeFrequency === 'biweekly' ? '2 weeks' : pledgeFrequency.replace('ly', '')} for {pledgeInstallments} payments = </span>
                  <span className="font-bold text-dark">{formatCurrency(Number(selectedAmount))} total</span>
                </div>
              </div>
            )}
          </div>

          {/* Donor info */}
          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-semibold text-dark mb-1">Your Name</label>
                <input type="text" value={donorName} onChange={e => setDonorName(stripEmoji(e.target.value))}
                  placeholder="Full name" required={!isAnonymous}
                  className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:border-primary outline-none text-sm" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-dark mb-1">Email Address</label>
                <input type="email" value={donorEmail} onChange={e => setDonorEmail(e.target.value)}
                  placeholder="your@email.com" required
                  className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:border-primary outline-none text-sm" />
              </div>
            </div>

            {!pledgeMode && (
              <>
                <div>
                  <label className="block text-sm font-semibold text-dark mb-1">Message (optional)</label>
                  <textarea value={message} onChange={e => setMessage(stripEmoji(e.target.value))}
                    placeholder="Leave an encouraging message..." rows={2}
                    className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:border-primary outline-none text-sm resize-none" />
                </div>

                {/* Prayer Wall */}
                <div>
                  <label className="block text-sm font-semibold text-dark mb-1">
                    Leave a Prayer or Encouragement
                    <span className="text-gray-400 font-normal ml-1">(optional)</span>
                  </label>
                  <textarea value={prayer} onChange={e => setPrayer(stripEmoji(e.target.value))}
                    placeholder="Father Lord, heal John completely and restore his health..."
                    rows={2}
                    className="w-full px-4 py-2.5 border-2 border-amber-200 bg-amber-50/50 rounded-xl focus:border-amber-400 outline-none text-sm resize-none placeholder:text-amber-400/70" />
                  <p className="text-[10px] text-amber-600 mt-1">Your prayer will appear on the public Prayer Wall for this campaign</p>
                </div>
              </>
            )}

            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={isAnonymous} onChange={e => setIsAnonymous(e.target.checked)} className="w-4 h-4 accent-primary" />
              <span className="text-sm text-gray-600">Donate anonymously</span>
            </label>
          </div>

          {/* Summary */}
          {selectedAmount && (
            <div className="bg-green-50 border border-green-100 rounded-xl p-3 text-sm">
              {pledgeMode ? (
                <p className="text-gray-600">First payment of <span className="text-primary font-bold">{formatCurrency(installmentAmount)}</span> then {pledgeInstallments - 1} more payments</p>
              ) : (
                <p className="text-gray-600">Donating <span className="text-primary font-bold text-base">{formatCurrency(selectedAmount)}</span> to this campaign</p>
              )}
            </div>
          )}

          {/* No amount too small note */}
          <p className="text-xs text-center text-gray-400">No amount is too small — every kobo makes a difference</p>

          <button type="submit" disabled={loading || !selectedAmount}
            className="w-full bg-primary hover:bg-primary/90 disabled:opacity-50 text-white py-3.5 rounded-xl font-bold text-base flex items-center justify-center gap-2 transition-colors">
            {loading
              ? <span className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              : <><MdPayment className="text-lg" />{pledgeMode ? 'Confirm Pledge' : 'Donate with Paystack'}</>}
          </button>

          <p className="flex items-center justify-center gap-1 text-xs text-gray-400">
            <MdLock /> Secured by Paystack. Your details are safe.
          </p>
        </form>
      </div>
    </div>
  );
}
