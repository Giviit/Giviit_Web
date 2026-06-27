import { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { MdCheckCircle } from 'react-icons/md';
import GiviitLogo from '../../components/GiviitLogo';

export default function VerifyEmailSuccessPage() {
  const navigate = useNavigate();

  useEffect(() => {
    const t = setTimeout(() => navigate('/login', { replace: true }), 3000);
    return () => clearTimeout(t);
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-12 bg-gray-50">
      <div className="w-full max-w-sm text-center">
        <Link to="/" className="inline-flex items-center gap-2.5 mb-8">
          <GiviitLogo size={32} variant="green" showWordmark wordmarkLight={false} />
        </Link>
        <div className="w-16 h-16 rounded-2xl icon-green flex items-center justify-center mx-auto mb-5">
          <MdCheckCircle className="text-white text-3xl" />
        </div>
        <h1 className="text-2xl font-black text-dark mb-2">Email verified!</h1>
        <p className="text-gray-500 text-sm">You can now log in. Redirecting...</p>
      </div>
    </div>
  );
}
