import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { MdLock, MdVisibility, MdVisibilityOff, MdArrowBack, MdCheckCircle } from 'react-icons/md';
import { supabase } from '../../utils/supabaseClient';
import toast from 'react-hot-toast';
import GiviitLogo from '../../components/GiviitLogo';

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [checking, setChecking] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        toast.error('Invalid or expired reset link. Please request a new one.');
        navigate('/forgot-password');
      }
      setChecking(false);
    });
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirm) { toast.error('Passwords do not match'); return; }
    if (password.length < 6) { toast.error('Password must be at least 6 characters'); return; }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      setDone(true);
      toast.success('Password updated successfully!');
    } catch (err) {
      toast.error(err.message || 'Failed to reset password. Please request a new link.');
    } finally {
      setLoading(false);
    }
  };

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-md">
        <Link to="/" className="flex items-center gap-2.5 mb-8">
          <GiviitLogo size={32} variant="green" showWordmark wordmarkLight={false} />
        </Link>

        <Link to="/login" className="inline-flex items-center gap-1 text-gray-500 hover:text-primary text-sm mb-6 transition-colors">
          <MdArrowBack /> Back to login
        </Link>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mb-5">
            <MdLock className="text-3xl text-primary" />
          </div>

          {done ? (
            <>
              <div className="flex items-center gap-2 mb-2">
                <MdCheckCircle className="text-2xl text-green-500" />
                <h1 className="text-2xl font-black text-dark">Password updated!</h1>
              </div>
              <p className="text-gray-500 text-sm mb-6">
                Your password has been changed. You can now sign in with your new password.
              </p>
              <Link
                to="/login"
                className="block text-center bg-primary text-white font-bold py-3 rounded-xl text-sm hover:bg-primary/90 transition-colors"
              >
                Sign In Now
              </Link>
            </>
          ) : (
            <>
              <h1 className="text-2xl font-black text-dark mb-1">Set new password</h1>
              <p className="text-gray-500 text-sm mb-7">Choose a strong password for your account.</p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-dark mb-1.5">New Password</label>
                  <div className="relative">
                    <MdLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
                    <input
                      type={showPw ? 'text' : 'password'}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="Min. 6 characters"
                      required
                      minLength={6}
                      className="w-full pl-10 pr-10 py-3 border-2 border-gray-200 rounded-xl focus:border-primary outline-none text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPw(!showPw)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPw ? <MdVisibilityOff /> : <MdVisibility />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-dark mb-1.5">Confirm Password</label>
                  <div className="relative">
                    <MdLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
                    <input
                      type={showPw ? 'text' : 'password'}
                      value={confirm}
                      onChange={e => setConfirm(e.target.value)}
                      placeholder="Repeat your password"
                      required
                      className={`w-full pl-10 pr-4 py-3 border-2 rounded-xl focus:border-primary outline-none text-sm ${
                        confirm && confirm !== password ? 'border-red-300 bg-red-50' : 'border-gray-200'
                      }`}
                    />
                  </div>
                  {confirm && confirm !== password && (
                    <p className="text-xs text-red-500 mt-1">Passwords do not match</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading || !password || password !== confirm}
                  className="w-full bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-xl text-sm transition-all flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Updating...</>
                  ) : 'Reset Password'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
