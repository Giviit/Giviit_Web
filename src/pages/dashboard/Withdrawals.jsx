import { useState, useEffect, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  MdAccountBalance, MdHistory, MdCheck, MdClose, MdSearch,
  MdCheckCircle, MdError, MdSchedule, MdUndo, MdContentCopy,
} from 'react-icons/md';
import DashboardLayout from '../../components/DashboardLayout';
import api from '../../utils/api';
import { formatCurrency, formatTimeAgo } from '../../utils/formatters';
import toast from 'react-hot-toast';
import LoadingSpinner from '../../components/LoadingSpinner';
import NIGERIAN_BANKS from '../../utils/nigerianBanks';

const SINGLE_WITHDRAWAL_LIMIT = 2000000;
const MIN_WITHDRAWAL = 1000;
const QUICK_AMOUNTS = [10000, 50000, 100000];

const STATUS_BADGE = {
  processing: { label: 'Processing...', className: 'bg-amber-100 text-amber-700' },
  completed: { label: 'Sent', className: 'bg-green-100 text-primary' },
  failed: { label: 'Failed — Balance Restored', className: 'bg-red-100 text-red-600' },
  reversed: { label: 'Reversed', className: 'bg-orange-100 text-orange-600' },
  pending: { label: 'Pending', className: 'bg-gray-100 text-gray-500' },
};
const STATUS_ICON = { completed: MdCheck, failed: MdClose, reversed: MdUndo, processing: MdSchedule, pending: MdSchedule };

export default function Withdrawals() {
  const queryClient = useQueryClient();

  const [campaignId, setCampaignId] = useState('');
  const [bankSearch, setBankSearch] = useState('');
  const [bankDropdownOpen, setBankDropdownOpen] = useState(false);
  const [selectedBank, setSelectedBank] = useState(null);
  const [accountNumber, setAccountNumber] = useState('');
  const [amount, setAmount] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);
  const [successResult, setSuccessResult] = useState(null);

  const { data: campaigns } = useQuery({
    queryKey: ['my-campaigns'],
    queryFn: () => api.get('/campaigns?my=true').then((r) => r.data.campaigns),
  });

  const { data: withdrawals, isLoading } = useQuery({
    queryKey: ['my-withdrawals'],
    queryFn: () => api.get('/withdrawals/my').then((r) => r.data.withdrawals),
  });

  const activeCampaigns = campaigns?.filter((c) => c.status === 'active') || [];
  const selectedCampaign = campaigns?.find((c) => c.id === campaignId);

  const { data: balance, isLoading: balanceLoading } = useQuery({
    queryKey: ['withdrawal-balance', campaignId],
    queryFn: () => api.get(`/withdrawals/balance/${campaignId}`).then((r) => r.data.balance),
    enabled: !!campaignId,
  });
  const available = balance?.available ?? 0;

  // Account resolution fires automatically — no button — the instant both
  // a bank and a full 10-digit account number are present.
  const [resolveStatus, setResolveStatus] = useState('idle'); // idle | loading | success | error
  const [resolvedName, setResolvedName] = useState('');

  useEffect(() => {
    setResolveStatus('idle');
    setResolvedName('');
    if (!selectedBank || accountNumber.length !== 10) return;

    let cancelled = false;
    setResolveStatus('loading');
    api.get('/withdrawals/resolve-account', { params: { account_number: accountNumber, bank_code: selectedBank.code } })
      .then((res) => {
        if (cancelled) return;
        setResolvedName(res.data.account_name);
        setResolveStatus('success');
      })
      .catch(() => {
        if (cancelled) return;
        setResolveStatus('error');
      });

    return () => { cancelled = true; };
  }, [selectedBank, accountNumber]);

  const filteredBanks = useMemo(() => {
    if (!bankSearch.trim()) return NIGERIAN_BANKS;
    const q = bankSearch.trim().toLowerCase();
    return NIGERIAN_BANKS.filter((b) => b.name.toLowerCase().includes(q));
  }, [bankSearch]);

  const maxAllowed = Math.min(available, SINGLE_WITHDRAWAL_LIMIT);
  const amountValid = Number(amount) > 0 && Number(amount) >= MIN_WITHDRAWAL && Number(amount) <= maxAllowed;
  const canSubmit = !!campaignId && !!selectedBank && accountNumber.length === 10 && resolveStatus === 'success' && amountValid;

  const mutation = useMutation({
    mutationFn: (data) => api.post('/withdrawals', data),
    onSuccess: (res) => {
      setShowConfirm(false);
      setSuccessResult({
        amount: Number(amount),
        account_name: resolvedName,
        bank_name: selectedBank.name,
        estimated_arrival: res.data.estimated_arrival,
      });
      setCampaignId(''); setSelectedBank(null); setBankSearch(''); setAccountNumber(''); setAmount('');
      queryClient.invalidateQueries(['my-withdrawals']);
      queryClient.invalidateQueries(['withdrawal-balance']);
    },
    onError: (err) => {
      setShowConfirm(false);
      toast.error(err.response?.data?.error || 'Failed to initiate withdrawal');
    },
  });

  const handleQuickAmount = (val) => setAmount(String(Math.min(val, maxAllowed)));
  const handleAll = () => setAmount(String(maxAllowed));

  const handleSubmitClick = () => {
    if (!canSubmit) return;
    setShowConfirm(true);
  };

  const confirmWithdraw = () => {
    mutation.mutate({
      campaign_id: campaignId,
      amount: Number(amount),
      bank_name: selectedBank.name,
      bank_code: selectedBank.code,
      account_number: accountNumber,
      account_name: resolvedName,
    });
  };

  const copy = (text) => navigator.clipboard.writeText(text).then(() => toast.success('Copied'));

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-black text-dark">Withdraw Funds</h1>
          <p className="text-gray-500 text-sm mt-1">Funds are sent instantly once confirmed</p>
        </div>

        {/* Campaign select */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 mb-5">
          <label className="block text-sm font-semibold text-dark mb-1.5">Campaign</label>
          <select
            value={campaignId}
            onChange={(e) => { setCampaignId(e.target.value); setAmount(''); }}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary outline-none text-sm bg-white"
          >
            <option value="">Select campaign</option>
            {activeCampaigns.map((c) => (
              <option key={c.id} value={c.id}>{c.title}</option>
            ))}
          </select>
        </div>

        {selectedCampaign && (
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 mb-5">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Available to Withdraw</p>
            {balanceLoading ? (
              <p className="text-gray-400 text-sm">Calculating available balance...</p>
            ) : (
              <>
                <p className="text-3xl font-black text-primary mb-3">{formatCurrency(available)}</p>
                <div className="space-y-1 text-sm border-t border-gray-100 pt-3">
                  <div className="flex justify-between text-gray-500"><span>Raised</span><span>{formatCurrency(balance.raised)}</span></div>
                  <div className="flex justify-between text-gray-500"><span>Withdrawn</span><span>{formatCurrency(balance.withdrawn)}</span></div>
                  <div className="flex justify-between text-gray-500"><span>Platform fee</span><span>-{formatCurrency(balance.platformFee)}</span></div>
                  {balance.fraudReserve > 0 && (
                    <div className="flex justify-between text-gray-500"><span>Fraud reserve</span><span>-{formatCurrency(balance.fraudReserve)}</span></div>
                  )}
                  {balance.pending > 0 && (
                    <div className="flex justify-between text-gray-500"><span>Pending withdrawal</span><span>-{formatCurrency(balance.pending)}</span></div>
                  )}
                </div>
              </>
            )}
          </div>
        )}

        {selectedCampaign && (
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 mb-5 space-y-4">
            {/* Bank dropdown */}
            <div className="relative">
              <label className="block text-sm font-semibold text-dark mb-1.5">Select Your Bank</label>
              <div className="relative">
                <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  value={selectedBank ? selectedBank.name : bankSearch}
                  onChange={(e) => { setBankSearch(e.target.value); setSelectedBank(null); setBankDropdownOpen(true); }}
                  onFocus={() => setBankDropdownOpen(true)}
                  placeholder="Search for your bank..."
                  className="w-full pl-9 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary outline-none text-sm"
                />
              </div>
              {bankDropdownOpen && (
                <div className="absolute z-20 mt-1 w-full max-h-56 overflow-y-auto bg-white border border-gray-200 rounded-xl shadow-lg">
                  {filteredBanks.length === 0 ? (
                    <p className="px-4 py-3 text-sm text-gray-400">No banks match "{bankSearch}"</p>
                  ) : (
                    filteredBanks.map((b) => (
                      <button
                        key={b.code}
                        type="button"
                        onClick={() => { setSelectedBank(b); setBankSearch(''); setBankDropdownOpen(false); }}
                        className="w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors flex items-center justify-between"
                      >
                        <span className="text-dark">{b.name}</span>
                        <span className="text-gray-400 text-xs font-mono">{b.code}</span>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* Account number */}
            <div>
              <label className="block text-sm font-semibold text-dark mb-1.5">Account Number</label>
              <input
                type="text"
                inputMode="numeric"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                placeholder="0123456789"
                maxLength={10}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary outline-none text-sm font-mono tracking-wide"
              />

              {resolveStatus === 'loading' && (
                <p className="flex items-center gap-2 text-xs text-gray-400 mt-2">
                  <span className="w-3.5 h-3.5 border-2 border-gray-300 border-t-primary rounded-full animate-spin" />
                  Verifying account...
                </p>
              )}
              {resolveStatus === 'success' && (
                <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 border border-green-200 rounded-xl px-3 py-2 mt-2">
                  <MdCheckCircle className="text-base flex-shrink-0" />
                  <div>
                    <p className="font-bold uppercase">{resolvedName}</p>
                    <p className="text-xs text-green-600">Account verified</p>
                  </div>
                </div>
              )}
              {resolveStatus === 'error' && (
                <p className="flex items-center gap-1.5 text-xs text-red-500 mt-2">
                  <MdError className="text-sm" /> Account not found. Check the number and bank.
                </p>
              )}
            </div>

            {/* Amount */}
            <div>
              <label className="block text-sm font-semibold text-dark mb-1.5">Amount to Withdraw (₦)</label>
              <input
                type="number"
                inputMode="numeric"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="50,000"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary outline-none text-sm"
              />
              <p className="text-xs text-gray-400 mt-1">Maximum: {formatCurrency(maxAllowed)}</p>

              <div className="flex flex-wrap gap-2 mt-2.5">
                {QUICK_AMOUNTS.filter((v) => v <= maxAllowed).map((v) => (
                  <button key={v} type="button" onClick={() => handleQuickAmount(v)}
                    className="px-3.5 py-1.5 rounded-full border border-gray-200 text-xs font-semibold text-gray-600 hover:border-primary hover:text-primary transition-colors">
                    {formatCurrency(v)}
                  </button>
                ))}
                {maxAllowed > 0 && (
                  <button type="button" onClick={handleAll}
                    className="px-3.5 py-1.5 rounded-full border border-primary bg-primary/5 text-xs font-semibold text-primary hover:bg-primary/10 transition-colors">
                    All
                  </button>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={handleSubmitClick}
              disabled={!canSubmit || mutation.isPending}
              className="w-full py-3.5 rounded-xl bg-primary hover:bg-primary/90 disabled:opacity-50 text-white font-bold text-sm transition-colors"
            >
              {amount ? `Withdraw ${formatCurrency(Number(amount))}` : 'Withdraw Funds'}
            </button>
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
              {withdrawals.map((w) => {
                const badge = STATUS_BADGE[w.status] || STATUS_BADGE.pending;
                const Icon = STATUS_ICON[w.status] || MdSchedule;
                return (
                  <div key={w.id} className="flex items-center gap-4 px-5 py-4">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${badge.className}`}>
                      <Icon />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-dark text-sm">{w.bank_name} — {w.account_number}</p>
                      <p className="text-xs text-gray-400">{formatTimeAgo(w.created_at)}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-dark">{formatCurrency(w.amount)}</p>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${badge.className}`}>
                        {badge.label}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Confirmation modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowConfirm(false)} />
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-sm p-6">
            <h3 className="font-black text-dark text-lg mb-4">Confirm Withdrawal</h3>
            <div className="space-y-2 text-sm bg-gray-50 rounded-2xl p-4 mb-5">
              <div className="flex justify-between"><span className="text-gray-500">Amount</span><span className="font-bold text-dark">{formatCurrency(Number(amount))}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Bank</span><span className="font-medium text-dark">{selectedBank?.name}</span></div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Account</span>
                <span className="font-mono font-medium text-dark flex items-center gap-1">
                  ****{accountNumber.slice(-4)}
                  <button onClick={() => copy(accountNumber)} className="text-gray-300 hover:text-gray-500"><MdContentCopy className="text-xs" /></button>
                </span>
              </div>
              <div className="flex justify-between"><span className="text-gray-500">Name</span><span className="font-medium text-dark uppercase">{resolvedName}</span></div>
            </div>
            <p className="text-xs text-gray-500 text-center mb-5">Funds arrive within 5–10 minutes</p>
            <div className="flex gap-3">
              <button onClick={() => setShowConfirm(false)} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50">Cancel</button>
              <button
                onClick={confirmWithdraw}
                disabled={mutation.isPending}
                className="flex-1 py-2.5 rounded-xl bg-primary hover:bg-primary/90 disabled:opacity-50 text-white text-sm font-bold"
              >
                {mutation.isPending ? 'Sending...' : 'Yes, Withdraw'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success modal */}
      {successResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setSuccessResult(null)} />
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-sm p-6 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <MdCheckCircle className="text-4xl text-primary" />
            </div>
            <h3 className="font-black text-dark text-lg mb-2">Withdrawal Initiated!</h3>
            <p className="text-sm text-gray-600 mb-1">
              {formatCurrency(successResult.amount)} is on its way to <strong className="uppercase">{successResult.account_name}</strong> at <strong>{successResult.bank_name}</strong>.
            </p>
            <p className="text-sm text-gray-500 mb-5">Expected arrival: {successResult.estimated_arrival || '5-10 minutes'}. We'll email you when it lands.</p>
            <button
              onClick={() => setSuccessResult(null)}
              className="w-full py-3 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold text-sm"
            >
              View Withdrawal History
            </button>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
