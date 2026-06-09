import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../utils/supabaseClient';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import toast from 'react-hot-toast';

export default function AuthCallbackPage() {
  const navigate = useNavigate();
  const { setUser } = useAuth();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error || !session) {
          toast.error('Google sign-in failed. Please try again.');
          navigate('/login');
          return;
        }

        // Sync with backend — creates profile if first time, returns our JWT
        const res = await api.post('/auth/google/sync', {}, {
          headers: { Authorization: `Bearer ${session.access_token}` },
        });

        const { token, user } = res.data;
        localStorage.setItem('token', token);
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        setUser(user);

        const firstName = user.full_name?.split(' ')[0];
        toast.success(`Welcome${firstName ? `, ${firstName}` : ''}!`);
        navigate('/dashboard', { replace: true });
      } catch {
        toast.error('Sign-in failed. Please try again.');
        navigate('/login');
      }
    };

    handleCallback();
  }, [navigate, setUser]);

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
