import { useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { MdCheckCircle, MdCalendarToday, MdEmail, MdError } from 'react-icons/md';
import LoadingSpinner from '../components/LoadingSpinner';
import api from '../utils/api';
import { formatCurrency } from '../utils/formatters';

export default function PledgeConfirmPage() {
  const [params] = useSearchParams();
  const reference = params.get('reference');
  const [status, setStatus] = useState('loading');
  const [data, setData] = useState(null);
  const verifiedRef = useRef(null);

  useEffect(() => {
    if (!reference) { setStatus('error'); return; }
    if (verifiedRef.current === reference) return; // StrictMode double-invokes effects in dev
    verifiedRef.current = reference;
    api.get(`/donations/verify/${reference}`)
      .then((res) => { setStatus('success'); setData(res.data); })
      .catch(() => setStatus('error'));
  }, [reference]);

  const pledge = data?.pledge;
  const donation = data?.donation;
  const fullyPaid = pledge?.status === 'completed';

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 max-w-md w-full p-8 text-center">
        {status === 'loading' && (
          <div className="py-10">
            <LoadingSpinner size="lg" />
            <p className="text-gray-500 mt-4 text-sm">Verifying your payment...</p>
          </div>
        )}

        {status === 'success' && (
          <>
            <div className="w-16 h-16 rounded-2xl icon-green flex items-center justify-center mx-auto mb-5">
              <MdCheckCircle className="text-white text-3xl" />
            </div>
            <h1 className="text-2xl font-black text-dark mb-2">
              {fullyPaid ? 'Pledge Fully Paid!' : 'Installment Confirmed!'}
            </h1>
            <p className="text-gray-500 text-sm mb-6 leading-relaxed">
              {fullyPaid
                ? "You've completed every payment on this pledge — thank you!"
                : "You'll get an email reminder before your next payment."}
            </p>

            <div className="bg-gray-50 rounded-2xl p-4 mb-6 space-y-3 text-left">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Amount paid</span>
                <span className="font-bold text-dark">{formatCurrency(donation?.amount)}</span>
              </div>
              {pledge && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Progress</span>
                  <span className="font-semibold text-dark text-xs">{pledge.installments_paid} of {pledge.installments_total} payments</span>
                </div>
              )}
              {!fullyPaid && pledge?.next_payment_date && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500 flex items-center gap-1.5"><MdCalendarToday className="text-primary" /> Next payment</span>
                  <span className="font-semibold text-dark text-xs">{new Date(pledge.next_payment_date).toLocaleDateString('en-NG', { day: 'numeric', month: 'long' })}</span>
                </div>
              )}
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500 flex items-center gap-1.5"><MdEmail className="text-primary" /> Receipt</span>
                <span className="font-semibold text-dark text-xs">Sent to your email</span>
              </div>
            </div>

            {!fullyPaid && (
              <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10 mb-6 text-left">
                <p className="text-xs text-primary font-bold uppercase tracking-wide mb-1">What happens next?</p>
                <ul className="text-xs text-gray-600 space-y-1">
                  <li>• You'll receive an email reminder before each payment date</li>
                  <li>• Click the link in the email to pay the next installment</li>
                  <li>• You can cancel anytime by contacting the campaign creator</li>
                </ul>
              </div>
            )}

            <Link to="/campaigns" className="block w-full py-3 rounded-xl text-white font-bold text-sm transition-all hover:opacity-90"
              style={{ background: 'linear-gradient(135deg, #22c55e, #1a7a4a)', boxShadow: '0 4px 12px rgba(26,122,74,0.3)' }}>
              Browse More Campaigns
            </Link>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="w-16 h-16 rounded-2xl bg-red-100 flex items-center justify-center mx-auto mb-5">
              <MdError className="text-red-500 text-3xl" />
            </div>
            <h1 className="text-xl font-black text-dark mb-2">Verification Failed</h1>
            <p className="text-gray-500 text-sm mb-6">We could not verify this payment. If money was deducted, please contact support{reference ? ` with reference: ${reference}` : ''}.</p>
            <Link to="/campaigns" className="bg-primary text-white font-bold px-6 py-3 rounded-xl inline-block">Back to Campaigns</Link>
          </>
        )}
      </div>
    </div>
  );
}
