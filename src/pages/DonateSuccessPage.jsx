import { useEffect, useRef, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { MdCheckCircle, MdError, MdShare, MdAccessTime, MdAccountBalance, MdDialpad } from 'react-icons/md';
import { FaWhatsapp } from 'react-icons/fa';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import LoadingSpinner from '../components/LoadingSpinner';
import api from '../utils/api';
import { formatCurrency, buildWhatsAppUrl } from '../utils/formatters';

const CHANNEL_SUCCESS_MESSAGE = {
  bank_transfer: 'Your bank transfer was received and confirmed.',
  ussd: 'Your USSD payment was confirmed.',
  card: 'Your card payment was successful.',
};

const CHANNEL_WAITING_ICON = {
  bank_transfer: MdAccountBalance,
  ussd: MdDialpad,
};

function formatCountdown(ms) {
  if (ms <= 0) return '0:00';
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

export default function DonateSuccessPage() {
  const [searchParams] = useSearchParams();
  const reference = searchParams.get('reference');
  const [status, setStatus] = useState('loading');
  const [data, setData] = useState(null);
  const [remainingMs, setRemainingMs] = useState(0);
  const verifiedRef = useRef(null);

  useEffect(() => {
    if (!reference) { setStatus('error'); return; }
    if (verifiedRef.current === reference) return; // StrictMode double-invokes effects in dev
    verifiedRef.current = reference;
    api.get(`/donations/verify/${reference}`)
      .then(res => {
        setData(res.data);
        const donationStatus = res.data?.status;
        if (donationStatus === 'success') setStatus('success');
        else if (donationStatus === 'pending') setStatus('pending');
        else setStatus('failed');
      })
      .catch(() => setStatus('error'));
  }, [reference]);

  // Donor isn't logged in, so this polls the lightweight unauthenticated
  // status endpoint (not /verify, which calls out to Paystack and mutates
  // state) while a bank transfer / USSD payment is still settling.
  useEffect(() => {
    if (status !== 'pending' || !reference) return;
    const poll = setInterval(async () => {
      try {
        const res = await api.get(`/donations/status/${reference}`);
        const polledStatus = res.data?.status;
        if (polledStatus === 'success') {
          setData(d => ({ ...d, donation: { ...d.donation, paystack_status: 'success', amount: res.data.amount } }));
          setStatus('success');
        } else if (polledStatus === 'expired' || polledStatus === 'failed') {
          setStatus(polledStatus);
        }
      } catch {
        // Transient network hiccup — keep polling, the next tick will retry.
      }
    }, 5000);
    return () => clearInterval(poll);
  }, [status, reference]);

  // Live countdown until payment_expires_at, ticking once per second while pending.
  useEffect(() => {
    if (status !== 'pending') return;
    const expiresAt = data?.donation?.payment_expires_at;
    if (!expiresAt) return;
    const expiryTime = new Date(expiresAt).getTime();
    const tick = () => {
      const left = expiryTime - Date.now();
      setRemainingMs(left);
      if (left <= 0) setStatus('expired');
    };
    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, [status, data?.donation?.payment_expires_at]);

  const channel = data?.donation?.payment_channel;
  const WaitingIcon = CHANNEL_WAITING_ICON[channel] || MdAccessTime;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="pt-24 pb-16 px-4">
        <div className="max-w-lg mx-auto text-center">
          {status === 'loading' && (
            <div className="py-20">
              <LoadingSpinner size="lg" />
              <p className="text-gray-500 mt-4">Verifying your donation...</p>
            </div>
          )}

          {status === 'pending' && (
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-10">
              <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-5">
                <WaitingIcon className="text-5xl text-amber-500" />
              </div>
              <h1 className="text-2xl font-black text-dark mb-2">
                {channel === 'bank_transfer' ? 'Waiting for your transfer' : 'Waiting for your payment'}
              </h1>
              <p className="text-gray-500 mb-6">
                {channel === 'bank_transfer'
                  ? 'Complete the bank transfer using the account details shown by Paystack. This page updates automatically once we receive it.'
                  : 'Complete the USSD prompt on your phone. This page updates automatically once we receive your payment.'}
              </p>

              <div className="bg-amber-50 rounded-2xl p-5 mb-6">
                <p className="text-4xl font-black text-amber-600 mb-1">{formatCurrency(data?.donation?.amount)}</p>
                <p className="text-gray-500 text-sm">to {data?.campaign?.title || 'this campaign'}</p>
                {remainingMs > 0 && (
                  <p className="flex items-center justify-center gap-1.5 text-sm text-amber-600 font-semibold mt-3">
                    <MdAccessTime /> Expires in {formatCountdown(remainingMs)}
                  </p>
                )}
              </div>

              <LoadingSpinner />
              <Link to="/campaigns" className="block text-primary text-sm font-semibold hover:underline mt-6">
                Browse more campaigns
              </Link>
            </div>
          )}

          {status === 'expired' && (
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-10">
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-5">
                <MdError className="text-5xl text-red-500" />
              </div>
              <h1 className="text-2xl font-black text-dark mb-2">Payment window expired</h1>
              <p className="text-gray-500 mb-6">We did not receive your payment in time. No charge was made — you can try again with a new payment.</p>
              {data?.campaign && (
                <Link to={`/campaign/${data.campaign.slug}`} className="bg-primary text-white font-bold px-6 py-3 rounded-xl inline-block">
                  Back to Campaign
                </Link>
              )}
            </div>
          )}

          {status === 'success' && (
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-10">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
                <MdCheckCircle className="text-5xl text-primary" />
              </div>
              <h1 className="text-3xl font-black text-dark mb-2">Thank you!</h1>
              <p className="text-gray-500 mb-6">{CHANNEL_SUCCESS_MESSAGE[channel] || 'Your donation was successful.'}</p>

              <div className="bg-green-50 rounded-2xl p-5 mb-6">
                <p className="text-4xl font-black text-primary mb-1">{formatCurrency(data?.donation?.amount)}</p>
                <p className="text-gray-500 text-sm">donated to</p>
                <p className="font-bold text-dark mt-1">{data?.campaign?.title || 'this campaign'}</p>
              </div>

              <div className="flex flex-col gap-3">
                {data?.campaign && (
                  <a
                    href={buildWhatsAppUrl(data.campaign)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white font-bold py-3.5 rounded-xl transition-colors"
                  >
                    <FaWhatsapp className="text-lg" />
                    Share on WhatsApp
                  </a>
                )}
                {data?.campaign && (
                  <Link
                    to={`/campaign/${data.campaign.slug}`}
                    className="flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-white font-bold py-3.5 rounded-xl transition-colors"
                  >
                    View Campaign
                  </Link>
                )}
                <Link to="/campaigns" className="text-primary text-sm font-semibold hover:underline mt-2">
                  Browse more campaigns
                </Link>
              </div>
            </div>
          )}

          {status === 'failed' && (
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-10">
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-5">
                <MdError className="text-5xl text-red-500" />
              </div>
              <h1 className="text-2xl font-black text-dark mb-2">Payment Failed</h1>
              <p className="text-gray-500 mb-6">Your payment was not successful. No charge was made — you can try again.</p>
              {data?.campaign && (
                <Link to={`/campaign/${data.campaign.slug}`} className="bg-primary text-white font-bold px-6 py-3 rounded-xl inline-block">
                  Back to Campaign
                </Link>
              )}
            </div>
          )}

          {status === 'error' && (
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-10">
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-5">
                <MdError className="text-5xl text-red-500" />
              </div>
              <h1 className="text-2xl font-black text-dark mb-2">Verification Failed</h1>
              <p className="text-gray-500 mb-6">We could not verify your payment. If money was deducted, please contact support with reference: <strong>{reference}</strong></p>
              <Link to="/campaigns" className="bg-primary text-white font-bold px-6 py-3 rounded-xl inline-block">
                Back to Campaigns
              </Link>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
