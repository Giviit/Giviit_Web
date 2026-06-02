import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { MdPerson, MdEmail, MdPhone, MdLock, MdVisibility, MdVisibilityOff, MdArrowForward } from 'react-icons/md';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const STEPS = [
  { icon: '01', title: 'Create your campaign', desc: 'Set it up in minutes' },
  { icon: '02', title: 'Share via WhatsApp', desc: 'Reach your whole network' },
  { icon: '03', title: 'Receive funds', desc: 'Direct to your bank account' },
];

export default function RegisterPage() {
  const [form, setForm] = useState({ full_name: '', email: '', phone: '', password: '' });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register, login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (field) => (e) => setForm(p => ({ ...p, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    setLoading(true);
    try {
      await register(form);
      toast.success('Account created! Welcome to Givia.');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-[45%] relative overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1680713660046-67b7350ed679?w=1200&q=85"
          alt="Community"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-dark/80 via-primary/50 to-accent/30" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-accent/15 rounded-full blur-3xl" />

        <div className="relative flex flex-col h-full px-10 py-10">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-10 h-10 bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl flex items-center justify-center">
              <span className="text-white font-black text-sm">CF</span>
            </div>
            <div>
              <p className="text-white font-black text-lg leading-none">Givia</p>
              <p className="text-white/60 text-[10px] tracking-widest">TOGETHER WE RISE</p>
            </div>
          </Link>

          <div className="flex-1 flex flex-col justify-center">
            <h2 className="text-3xl font-black text-white leading-tight mb-3">
              Start raising funds<br />in 3 simple steps.
            </h2>
            <p className="text-white/70 text-sm mb-8">No upfront fees. Pay a small percentage only when you raise money.</p>

            <div className="space-y-4">
              {STEPS.map(({ icon, title, desc }) => (
                <div key={icon} className="flex items-center gap-4 bg-white/10 backdrop-blur-sm border border-white/15 rounded-2xl p-4">
                  <div className="w-10 h-10 bg-accent rounded-xl flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-black text-sm">{icon}</span>
                  </div>
                  <div>
                    <p className="text-white font-semibold text-sm">{title}</p>
                    <p className="text-white/60 text-xs">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Avatars */}
          <div className="flex items-center gap-3">
            <div className="flex -space-x-2">
              {[
                'https://images.unsplash.com/photo-1509099863731-ef4bff19e808?w=60&q=80',
                'https://images.unsplash.com/photo-1522529599102-193c0d76b5b6?w=60&q=80',
                'https://images.unsplash.com/photo-1504598578017-40d9b776f1bc?w=60&q=80',
                'https://images.unsplash.com/photo-1547226706-af7e2c20bcea?w=60&q=80',
              ].map((src, i) => (
                <img key={i} src={src} alt="" className="w-8 h-8 rounded-full border-2 border-white/40 object-cover" />
              ))}
            </div>
            <p className="text-white/80 text-xs">Join 32,000+ creators already raising funds</p>
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-gray-50 overflow-y-auto">
        <div className="w-full max-w-sm">
          <Link to="/" className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-8 h-8 bg-primary rounded-xl flex items-center justify-center">
              <span className="text-white font-black text-sm">CF</span>
            </div>
            <span className="font-black text-dark text-lg">Givia</span>
          </Link>

          <h1 className="text-2xl font-black text-dark mb-1">Create your account</h1>
          <p className="text-gray-500 text-sm mb-7">Start fundraising for free today. No credit card needed.</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {[
              { field: 'full_name', label: 'Full Name', icon: MdPerson, type: 'text', placeholder: 'John Adeyemi' },
              { field: 'email', label: 'Email Address', icon: MdEmail, type: 'email', placeholder: 'john@email.com' },
              { field: 'phone', label: 'Phone Number', icon: MdPhone, type: 'tel', placeholder: '+234 800 000 0000' },
            ].map(({ field, label, icon: Icon, type, placeholder }) => (
              <div key={field}>
                <label className="block text-sm font-semibold text-dark mb-1.5">{label}</label>
                <div className="relative">
                  <Icon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
                  <input
                    type={type}
                    value={form[field]}
                    onChange={handleChange(field)}
                    placeholder={placeholder}
                    required
                    className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary outline-none text-sm bg-white"
                  />
                </div>
              </div>
            ))}

            <div>
              <label className="block text-sm font-semibold text-dark mb-1.5">Password</label>
              <div className="relative">
                <MdLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
                <input
                  type={showPw ? 'text' : 'password'}
                  value={form.password}
                  onChange={handleChange('password')}
                  placeholder="Min. 6 characters"
                  required
                  minLength={6}
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
                <><MdArrowForward /> Create Free Account</>
              )}
            </button>

            <p className="text-xs text-gray-400 text-center">
              By signing up you agree to our Terms of Service and Privacy Policy.
            </p>
          </form>

          <p className="mt-6 text-center text-sm text-gray-500">
            Already have an account?{' '}
            <Link to="/login" className="text-primary font-semibold hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
