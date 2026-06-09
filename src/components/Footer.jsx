import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaTwitter, FaFacebook, FaInstagram, FaWhatsapp } from 'react-icons/fa';
import GiviitLogo from './GiviitLogo';

const CATEGORIES = ['Medical', 'Education', 'Business', 'Emergency', 'Funeral', 'Church', 'Community'];

export default function Footer() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSubscribed(true);
    setEmail('');
  };

  return (
    <footer className="bg-dark text-white">

      {/* Subscribe strip */}
      <div className="border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <h3 className="text-xl font-bold text-white">Stay in the loop</h3>
              <p className="text-gray-400 text-sm mt-1">Campaign stories, fundraising tips, and Giviit updates — straight to your inbox.</p>
            </div>
            {subscribed ? (
              <p className="text-primary font-semibold text-sm flex-shrink-0">You're subscribed!</p>
            ) : (
              <form onSubmit={handleSubscribe} className="flex gap-2 w-full md:w-auto">
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  className="flex-1 md:w-64 bg-white/10 border border-white/15 text-white placeholder:text-gray-500 text-sm px-4 py-2.5 rounded-lg focus:outline-none focus:border-primary focus:bg-white/15 transition-all"
                />
                <button
                  type="submit"
                  className="bg-primary hover:bg-primary/90 text-white font-semibold text-sm px-5 py-2.5 rounded-lg transition-colors flex-shrink-0"
                >
                  Subscribe
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Main footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">

          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="mb-4">
              <GiviitLogo size={34} variant="white" showWordmark wordmarkLight />
            </div>
            <p className="text-gray-400 text-sm leading-relaxed mb-6">
              Nigeria's home for crowdfunding — built for communities to fund what matters most.
            </p>
            <div className="flex gap-3">
              {[
                { icon: FaTwitter, href: '#', label: 'Twitter' },
                { icon: FaFacebook, href: '#', label: 'Facebook' },
                { icon: FaInstagram, href: '#', label: 'Instagram' },
                { icon: FaWhatsapp, href: '#', label: 'WhatsApp' },
              ].map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="w-9 h-9 border border-white/15 hover:border-primary hover:text-primary text-gray-400 rounded-lg flex items-center justify-center transition-colors"
                >
                  <Icon className="text-sm" />
                </a>
              ))}
            </div>
          </div>

          {/* Categories */}
          <div>
            <h4 className="font-semibold text-white mb-4 text-sm">Categories</h4>
            <ul className="space-y-2.5">
              {CATEGORIES.map(cat => (
                <li key={cat}>
                  <Link
                    to={`/campaigns?category=${cat.toLowerCase()}`}
                    className="text-gray-400 hover:text-white text-sm transition-colors"
                  >
                    {cat}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-semibold text-white mb-4 text-sm">Company</h4>
            <ul className="space-y-2.5">
              {[
                { to: '/about', label: 'About Us' },
                { to: '/how-it-works', label: 'How It Works' },
                { to: '/blog', label: 'Blog' },
                { to: '/campaigns', label: 'Browse Campaigns' },
                { to: '/register', label: 'Start a Campaign' },
              ].map(({ to, label }) => (
                <li key={label}>
                  <Link to={to} className="text-gray-400 hover:text-white text-sm transition-colors">{label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-semibold text-white mb-4 text-sm">Support</h4>
            <ul className="space-y-2.5">
              <li><a href="mailto:support@giviit.ng" className="text-gray-400 hover:text-white text-sm transition-colors">support@giviit.ng</a></li>
              <li><span className="text-gray-400 text-sm">Lagos, Nigeria</span></li>
              <li className="pt-2">
                <Link to="/privacy-policy" className="text-gray-400 hover:text-white text-sm transition-colors block">Privacy Policy</Link>
              </li>
              <li>
                <Link to="/cookie-policy" className="text-gray-400 hover:text-white text-sm transition-colors block">Cookie Policy</Link>
              </li>
              <li>
                <Link to="/terms" className="text-gray-400 hover:text-white text-sm transition-colors block">Terms of Service</Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-gray-500 text-xs">&copy; {new Date().getFullYear()} Giviit Technologies Ltd. All rights reserved.</p>
          <p className="text-gray-600 text-xs">Registered in Nigeria · NDPR Compliant</p>
        </div>
      </div>
    </footer>
  );
}

