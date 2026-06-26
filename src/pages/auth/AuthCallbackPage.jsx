import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import toast from 'react-hot-toast';

export default function AuthCallbackPage() {
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const handleCallback = async () => {
      const token = searchParams.get('token');
      const refreshToken = searchParams.get('refresh_token');

      if (!token) {
        toast.error('Google sign-in failed. Please try again.');
        navigate('/login');
        return;
      }

      try {
        localStorage.setItem('token', token);
        if (refreshToken) localStorage.setItem('refresh_token', refreshToken);
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

        const res = await api.get('/auth/me');
        const user = res.data.user;
        setUser(user);

        const firstName = user.full_name?.split(' ')[0];
        toast.success(`Welcome${firstName ? `, ${firstName}` : ''}!`);
        navigate('/dashboard', { replace: true });
      } catch {
        localStorage.removeItem('token');
        localStorage.removeItem('refresh_token');
        delete api.defaults.headers.common['Authorization'];
        toast.error('Sign-in failed. Please try again.');
        navigate('/login');
      }
    };

    handleCallback();
  }, [navigate, setUser, searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-4" />
        <p className="text-dark font-semibold">Completing sign-in...</p>
        <p className="text-gray-400 text-sm mt-1">Please wait a moment</p>
      </div>
    </div>
  );
}
