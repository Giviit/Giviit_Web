import { useState, useRef, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import {
  MdMenu, MdClose, MdPerson, MdDashboard, MdLogout,
  MdExpandMore, MdCampaign, MdInfo, MdArticle, MdLightbulb, MdPeople,
} from 'react-icons/md';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import GiviitLogo from './GiviitLogo';

const EXPLORE_LINKS = [
  { to: '/campaigns', icon: MdCampaign, label: 'Browse Campaigns', desc: 'Find a cause to support' },
  { to: '/how-it-works', icon: MdLightbulb, label: 'How It Works', desc: 'For creators and donors' },
  { to: '/blog', icon: MdArticle, label: 'Blog & News', desc: 'Tips, stories, and updates' },
  { to: '/about', icon: MdInfo, label: 'About Us', desc: 'Our mission and team' },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [exploreOpen, setExploreOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const dropdownRef = useRef(null);
  const exploreRef = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setDropdownOpen(false);
      if (exploreRef.current && !exploreRef.current.contains(e.target)) setExploreOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = async () => {
    await logout();
    toast.success('Logged out successfully');
    navigate('/');
    setDropdownOpen(false);
  };

  const navLinkClass = ({ isActive }) =>
    `text-sm font-medium transition-colors ${isActive ? 'text-primary' : 'text-gray-700 hover:text-primary'}`;

  return (
    <header className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${scrolled ? 'bg-white/95 backdrop-blur-md shadow-sm' : 'bg-white border-b border-gray-100'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link to="/" className="flex items-center flex-shrink-0">
            <GiviitLogo size={30} variant="flat" showWordmark wordmarkLight={false} />
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            <NavLink to="/" end className={({ isActive }) =>
              `px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isActive ? 'text-primary bg-primary/5' : 'text-gray-700 hover:text-primary hover:bg-gray-50'}`
            }>Home</NavLink>

            <NavLink to="/campaigns" className={({ isActive }) =>
              `px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isActive ? 'text-primary bg-primary/5' : 'text-gray-700 hover:text-primary hover:bg-gray-50'}`
            }>Campaigns</NavLink>

            <NavLink to="/how-it-works" className={({ isActive }) =>
              `px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isActive ? 'text-primary bg-primary/5' : 'text-gray-700 hover:text-primary hover:bg-gray-50'}`
            }>How It Works</NavLink>

            <NavLink to="/blog" className={({ isActive }) =>
              `px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isActive ? 'text-primary bg-primary/5' : 'text-gray-700 hover:text-primary hover:bg-gray-50'}`
            }>Blog</NavLink>

            {/* Explore dropdown */}
            <div className="relative" ref={exploreRef}>
              <button
                onClick={() => setExploreOpen(!exploreOpen)}
                className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${exploreOpen ? 'text-primary bg-primary/5' : 'text-gray-700 hover:text-primary hover:bg-gray-50'}`}
              >
                More <MdExpandMore className={`text-base transition-transform duration-200 ${exploreOpen ? 'rotate-180' : ''}`} />
              </button>
              {exploreOpen && (
                <div className="absolute left-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50 overflow-hidden">
                  <div className="px-4 pt-2 pb-3 border-b border-gray-50">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Explore Giviit</p>
                  </div>
                  {EXPLORE_LINKS.map(({ to, icon: Icon, label, desc }) => (
                    <Link
                      key={to}
                      to={to}
                      onClick={() => setExploreOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
                    >
                      <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Icon className="text-primary text-base" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{label}</p>
                        <p className="text-[11px] text-gray-400">{desc}</p>
                      </div>
                    </Link>
                  ))}
                  <div className="px-4 pt-2 pb-1 border-t border-gray-50 mt-1">
                    <Link to="/about" onClick={() => setExploreOpen(false)}
                      className="flex items-center gap-2 text-xs text-gray-500 hover:text-primary transition-colors py-1">
                      <MdPeople className="text-sm" /> Meet the Team
                    </Link>
                  </div>
                </div>
              )}
            </div>

            <div className="w-px h-5 bg-gray-200 mx-2" />

            <Link
              to={user ? '/dashboard/campaigns/create' : '/register'}
              className="bg-accent hover:bg-accent/90 text-white text-sm font-bold px-5 py-2 rounded-full transition-colors"
            >
              Start a Campaign
            </Link>
          </nav>

          {/* Right side — auth */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 bg-gray-50 hover:bg-gray-100 px-3 py-2 rounded-full transition-colors"
                >
                  <div className="w-7 h-7 bg-primary rounded-full flex items-center justify-center">
                    {user.avatar_url ? (
                      <img src={user.avatar_url} alt="" className="w-7 h-7 rounded-full object-cover" />
                    ) : (
                      <MdPerson className="text-white text-sm" />
                    )}
                  </div>
                  <span className="text-sm font-medium text-dark max-w-24 truncate">{user.full_name || 'Account'}</span>
                  <MdExpandMore className={`text-gray-400 text-base transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50">
                    <Link to="/dashboard" onClick={() => setDropdownOpen(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                      <MdDashboard className="text-primary" /> Dashboard
                    </Link>
                    <Link to="/dashboard/profile" onClick={() => setDropdownOpen(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                      <MdPerson className="text-primary" /> Profile
                    </Link>
                    <hr className="my-1 border-gray-100" />
                    <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors w-full text-left">
                      <MdLogout /> Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link to="/login" className="text-sm font-medium text-gray-700 hover:text-primary transition-colors px-3 py-2">
                  Sign In
                </Link>
                <Link to="/register" className="bg-primary hover:bg-primary/90 text-white text-sm font-bold px-5 py-2 rounded-full transition-colors">
                  Join Free
                </Link>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors">
            {mobileOpen ? <MdClose className="text-2xl" /> : <MdMenu className="text-2xl" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 px-4 pb-5 pt-2">
          <div className="space-y-0.5">
            <NavLink to="/" end onClick={() => setMobileOpen(false)} className={({ isActive }) =>
              `flex items-center gap-2 py-3 px-3 rounded-xl text-sm font-medium transition-colors ${isActive ? 'text-primary bg-primary/5' : 'text-gray-700'}`
            }>Home</NavLink>
            <NavLink to="/campaigns" onClick={() => setMobileOpen(false)} className={({ isActive }) =>
              `flex items-center gap-2 py-3 px-3 rounded-xl text-sm font-medium transition-colors ${isActive ? 'text-primary bg-primary/5' : 'text-gray-700'}`
            }>Campaigns</NavLink>
            <NavLink to="/how-it-works" onClick={() => setMobileOpen(false)} className={({ isActive }) =>
              `flex items-center gap-2 py-3 px-3 rounded-xl text-sm font-medium transition-colors ${isActive ? 'text-primary bg-primary/5' : 'text-gray-700'}`
            }>How It Works</NavLink>
            <NavLink to="/blog" onClick={() => setMobileOpen(false)} className={({ isActive }) =>
              `flex items-center gap-2 py-3 px-3 rounded-xl text-sm font-medium transition-colors ${isActive ? 'text-primary bg-primary/5' : 'text-gray-700'}`
            }>Blog & News</NavLink>
            <NavLink to="/about" onClick={() => setMobileOpen(false)} className={({ isActive }) =>
              `flex items-center gap-2 py-3 px-3 rounded-xl text-sm font-medium transition-colors ${isActive ? 'text-primary bg-primary/5' : 'text-gray-700'}`
            }>About</NavLink>
          </div>

          <div className="mt-3 pt-3 border-t border-gray-100 space-y-1">
            {user ? (
              <>
                <NavLink to="/dashboard" onClick={() => setMobileOpen(false)} className="flex items-center gap-2 py-3 px-3 rounded-xl text-sm font-medium text-gray-700">
                  <MdDashboard className="text-primary" /> Dashboard
                </NavLink>
                <NavLink to="/dashboard/profile" onClick={() => setMobileOpen(false)} className="flex items-center gap-2 py-3 px-3 rounded-xl text-sm font-medium text-gray-700">
                  <MdPerson className="text-primary" /> Profile
                </NavLink>
                <button onClick={handleLogout} className="flex items-center gap-2 py-3 px-3 rounded-xl text-sm font-medium text-red-500 w-full text-left">
                  <MdLogout /> Sign Out
                </button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={() => setMobileOpen(false)} className="flex items-center gap-2 py-3 px-3 rounded-xl text-sm font-medium text-gray-700">
                  Sign In
                </Link>
                <Link to="/register" onClick={() => setMobileOpen(false)} className="block bg-primary text-white text-center py-3 rounded-xl text-sm font-bold mt-1">
                  Join Free
                </Link>
              </>
            )}
            <Link
              to={user ? '/dashboard/campaigns/create' : '/register'}
              onClick={() => setMobileOpen(false)}
              className="block bg-accent text-white text-center py-3 rounded-xl text-sm font-bold"
            >
              Start a Campaign
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}

