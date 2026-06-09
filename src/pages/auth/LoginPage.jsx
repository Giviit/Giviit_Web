import { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { MdEmail, MdLock, MdVisibility, MdVisibilityOff, MdArrowForward } from 'react-icons/md';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import GiviitLogo from '../../components/GiviitLogo';

const DEMO_ACCOUNTS = [
  { label: 'Creator Account', email: 'creator@demo.com', password: 'demo123', color: 'bg-primary/10 text-primary border-primary/20' },
  { label: 'Admin Account', email: 'admin@demo.com', password: 'demo123', color: 'bg-amber-50 text-amber-700 border-amber-200' },
];

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      toast.success('Welcome back!');
      navigate(from, { replace: true });
    } catch (err) {
      const code = err.response?.data?.code;
      if (code === 'TERMS_NOT_AGREED') {
        toast.error('Your account requires you to accept our Terms of Service. Please contact support@giviit.ng.', { duration: 7000 });
      } else {
        toast.error(err.response?.data?.error || 'Invalid email or password');
      }
    } finally {
      setLoading(false);
    }
  };

  const quickLogin = async (acc) => {
    setLoading(true);
    try {
      const u = await login(acc.email, acc.password);
      toast.success(`Signed in as ${acc.label}`);
      navigate(u?.role === 'admin' ? '/admin' : '/dashboard', { replace: true });
    } catch {
      toast.error('Demo login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left panel — full bleed image with overlay content */}
      <div className="hidden lg:flex lg:w-[55%] relative overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1644152993066-9b9ee687930d?w=1400&q=85"
          alt="African community"
          className="absolute inset-0 w-full h-full object-cover"
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-dark/85 via-primary/60 to-dark/50" />

        {/* Decorative circles */}
        <div className="absolute -top-20 -left-20 w-80 h-80 bg-accent/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />

        <div className="relative flex flex-col h-full px-12 py-10">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3">
            <GiviitLogo size={40} variant="white" />
            <div>
              <p className="text-white font-black text-lg leading-none">Giviit</p>
              <p className="text-white/60 text-[10px] tracking-widest font-medium">TOGETHER WE RISE</p>
            </div>
          </Link>

          {/* Center content */}
          <div className="flex-1 flex flex-col justify-center max-w-sm">
            <div className="inline-flex items-center gap-2 bg-accent/20 border border-accent/40 text-accent text-xs font-semibold px-3 py-1.5 rounded-full mb-6 w-fit">
              Africa's #1 Crowdfunding Platform
            </div>
            <h2 className="text-4xl font-black text-white leading-tight mb-4">
              Thousands of lives<br />changed every day.
            </h2>
            <p className="text-white/70 leading-relaxed mb-8">
              Join 320,000+ Africans raising funds for medical bills, education, business dreams, and community projects.
            </p>

            {/* Stat pills */}
            <div className="flex flex-wrap gap-3">
              {[
                { val: '₦2.4B+', label: 'Raised' },
                { val: '14K+', label: 'Campaigns' },
                { val: '320K+', label: 'Donors' },
              ].map(({ val, label }) => (
                <div key={label} className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-4 py-2">
                  <p className="text-white font-black text-base leading-none">{val}</p>
                  <p className="text-white/60 text-xs mt-0.5">{label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom testimonial */}
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-5">
            <p className="text-white/90 text-sm leading-relaxed mb-3">
              "I raised ₦2.3M in just 10 days for my surgery. Giviit literally saved my life. Sharing my campaign link with my community made all the difference."
            </p>
            <div className="flex items-center gap-3">
              <img
                src="https://images.unsplash.com/photo-1530785602389-07594beb8b73?w=80&q=80"
                alt=""
                className="w-8 h-8 rounded-full object-cover border-2 border-white/30"
              />
              <div>
                <p className="text-white text-sm font-semibold">Adaeze O.</p>
                <p className="text-white/60 text-xs">Medical campaign, Enugu</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-gray-50 overflow-y-auto">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <Link to="/" className="lg:hidden flex items-center gap-2.5 mb-8">
            <GiviitLogo size={32} variant="green" showWordmark wordmarkLight={false} />
          </Link>

          <h1 className="text-2xl font-black text-dark mb-1">Welcome back</h1>
          <p className="text-gray-500 text-sm mb-7">Sign in to manage your campaigns and donations.</p>

          {/* Demo quick-login */}
          <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 mb-6">
            <p className="text-xs font-bold text-blue-700 mb-3 uppercase tracking-wide">Demo — Click to sign in instantly</p>
            <div className="grid grid-cols-2 gap-2">
              {DEMO_ACCOUNTS.map(acc => (
                <button
                  key={acc.email}
                  onClick={() => quickLogin(acc)}
                  disabled={loading}
                  className={`border rounded-xl px-3 py-2.5 text-xs font-semibold text-left transition-all hover:scale-105 disabled:opacity-50 ${acc.color}`}
                >
                  <p className="font-bold">{acc.label}</p>
                  <p className="opacity-70 mt-0.5">{acc.email}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs text-gray-400 font-medium">or sign in with email</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-dark mb-1.5">Email Address</label>
              <div className="relative">
                <MdEmail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary outline-none text-sm bg-white"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-sm font-semibold text-dark">Password</label>
                <Link to="/forgot-password" className="text-xs text-primary hover:underline">Forgot?</Link>
              </div>
              <div className="relative">
                <MdLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
                <input
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Your password"
                  required
                  className="w-full pl-10 pr-10 py-3 border-2 border-gray-200 rounded-xl focus:border-primary outline-none text-sm bg-white"
                />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPw ? <MdVisibilityOff /> : <MdVisibility />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-primary/90 disabled:opacity-50 text-white font-bold py-3.5 rounded-xl text-sm transition-all flex items-center justify-center gap-2 hover:scale-[1.01]"
            >
              {loading ? (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <><MdArrowForward /> Sign In</>
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-500">
            Don&apos;t have an account?{' '}
            <Link to="/register" className="text-primary font-semibold hover:underline">Create one free</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

