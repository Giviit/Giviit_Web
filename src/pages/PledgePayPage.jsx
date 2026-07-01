import { useEffect, useRef, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MdError } from 'react-icons/md';
import LoadingSpinner from '../components/LoadingSpinner';
import api from '../utils/api';

// Landing target for the "Pay Now" link in pledge reminder emails — kicks
// off a fresh Paystack session for the next installment and redirects there
// immediately, rather than creating that session ahead of time in the email
// itself (which would go stale if the donor doesn't click for a while).
export default function PledgePayPage() {
  const { id } = useParams();
  const [error, setError] = useState(null);
  const startedRef = useRef(false);

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;
    api.post(`/pledges/${id}/pay`)
      .then((res) => { window.location.href = res.data.authorization_url; })
      .catch((err) => setError(err.response?.data?.error || 'Failed to start payment'));
  }, [id]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 max-w-md w-full p-8 text-center">
        {error ? (
          <>
            <div className="w-16 h-16 rounded-2xl bg-red-100 flex items-center justify-center mx-auto mb-5">
              <MdError className="text-red-500 text-3xl" />
            </div>
            <h1 className="text-xl font-black text-dark mb-2">Couldn't start payment</h1>
            <p className="text-gray-500 text-sm mb-6">{error}</p>
            <Link to="/campaigns" className="text-primary text-sm font-semibold hover:underline">Browse campaigns</Link>
          </>
        ) : (
          <>
            <LoadingSpinner size="lg" />
            <p className="text-gray-500 mt-4 text-sm">Taking you to Paystack to complete this installment...</p>
          </>
        )}
      </div>
    </div>
  );
}
