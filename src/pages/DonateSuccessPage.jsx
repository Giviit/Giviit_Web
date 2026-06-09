import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { MdCheckCircle, MdError, MdShare } from 'react-icons/md';
import { FaWhatsapp } from 'react-icons/fa';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import LoadingSpinner from '../components/LoadingSpinner';
import api from '../utils/api';
import { formatCurrency, buildWhatsAppUrl } from '../utils/formatters';

export default function DonateSuccessPage() {
  const [searchParams] = useSearchParams();
  const reference = searchParams.get('reference');
  const [status, setStatus] = useState('loading');
  const [data, setData] = useState(null);

  useEffect(() => {
    if (!reference) { setStatus('error'); return; }
    api.get(`/donations/verify/${reference}`)
      .then(res => { setStatus('success'); setData(res.data); })
      .catch(() => setStatus('error'));
  }, [reference]);

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

          {status === 'success' && (
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-10">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
                <MdCheckCircle className="text-5xl text-primary" />
              </div>
              <h1 className="text-3xl font-black text-dark mb-2">Thank you!</h1>
              <p className="text-gray-500 mb-6">Your donation was successful.</p>

              <div className="bg-green-50 rounded-2xl p-5 mb-6">
                <p className="text-4xl font-black text-primary mb-1">{formatCurrency(data?.donation?.amount)}</p>
                <p className="text-gray-500 text-sm">donated to</p>
                <p className="font-bold text-dark mt-1">{data?.campaign?.title || 'this campaign'}</p>
              </div>

              <div className="flex flex-col gap-3">
                {data?.campaign && (
                  <a
                    href={buildWhatsAppUrl(data.campaign, window.location.origin)}
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
