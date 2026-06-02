import { Link } from 'react-router-dom';
import { FaTwitter, FaFacebook, FaInstagram, FaWhatsapp } from 'react-icons/fa';
import { MdEmail, MdPhone, MdLocationOn } from 'react-icons/md';

const CATEGORIES = ['Medical', 'Education', 'Business', 'Emergency', 'Funeral', 'Church', 'Community'];

export default function Footer() {
  return (
    <footer className="bg-dark text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-white font-black">CF</span>
              </div>
              <div>
                <p className="font-black text-white text-lg">Givia</p>
                <p className="text-[10px] text-gray-400 tracking-widest font-medium">TOGETHER WE RISE</p>
              </div>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed mb-5">
              Africa's premier crowdfunding platform. Empowering communities to fund what matters most — together.
            </p>
            <div className="flex gap-3">
              {[
                { icon: FaTwitter, href: '#' },
                { icon: FaFacebook, href: '#' },
                { icon: FaInstagram, href: '#' },
                { icon: FaWhatsapp, href: '#' },
              ].map(({ icon: Icon, href }, i) => (
                <a
                  key={i}
                  href={href}
                  className="w-8 h-8 bg-white/10 hover:bg-primary rounded-lg flex items-center justify-center transition-colors"
                >
                  <Icon className="text-sm" />
                </a>
              ))}
            </div>
          </div>

          {/* Categories */}
          <div>
            <h4 className="font-bold text-white mb-4 text-sm tracking-wide uppercase">Categories</h4>
            <ul className="space-y-2">
              {CATEGORIES.map(cat => (
                <li key={cat}>
                  <Link
                    to={`/campaigns?category=${cat.toLowerCase()}`}
                    className="text-gray-400 hover:text-accent text-sm transition-colors"
                  >
                    {cat}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-bold text-white mb-4 text-sm tracking-wide uppercase">Quick Links</h4>
            <ul className="space-y-2">
              {[
                { to: '/', label: 'Home' },
                { to: '/campaigns', label: 'Browse Campaigns' },
                { to: '/register', label: 'Start a Campaign' },
                { to: '/login', label: 'Sign In' },
                { to: '/register', label: 'Create Account' },
              ].map(({ to, label }) => (
                <li key={label}>
                  <Link to={to} className="text-gray-400 hover:text-accent text-sm transition-colors">{label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-bold text-white mb-4 text-sm tracking-wide uppercase">Contact Us</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-2 text-gray-400 text-sm">
                <MdEmail className="text-accent mt-0.5 flex-shrink-0" />
                support@givia.ng
              </li>
              <li className="flex items-start gap-2 text-gray-400 text-sm">
                <MdPhone className="text-accent mt-0.5 flex-shrink-0" />
                +234 800 Givia
              </li>
              <li className="flex items-start gap-2 text-gray-400 text-sm">
                <MdLocationOn className="text-accent mt-0.5 flex-shrink-0" />
                Lagos, Nigeria
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-gray-500 text-xs">&copy; {new Date().getFullYear()} Givia. All rights reserved.</p>
          <div className="flex gap-5 text-xs text-gray-500">
            <Link to="#" className="hover:text-accent transition-colors">Privacy Policy</Link>
            <Link to="#" className="hover:text-accent transition-colors">Terms of Service</Link>
            <Link to="#" className="hover:text-accent transition-colors">Cookie Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
