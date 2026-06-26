import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import {
  MdDashboard,
  MdCampaign,
  MdAddCircle,
  MdAccountBalanceWallet,
  MdPerson,
  MdLogout,
  MdMenu,
  MdClose,
  MdHome,
} from 'react-icons/md';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import BannedBanner from './BannedBanner';

const NAV_ITEMS = [
  { to: '/dashboard', icon: MdDashboard, label: 'Overview', end: true },
  { to: '/dashboard/campaigns', icon: MdCampaign, label: 'My Campaigns', end: true },
  { to: '/dashboard/campaigns/create', icon: MdAddCircle, label: 'New Campaign' },
  { to: '/dashboard/withdrawals', icon: MdAccountBalanceWallet, label: 'Withdrawals' },
  { to: '/dashboard/profile', icon: MdPerson, label: 'Profile' },
];

export default function DashboardLayout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    toast.success('Logged out');
    navigate('/');
  };

  const linkClass = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
      isActive
        ? 'bg-primary text-white shadow-md shadow-primary/20'
        : 'text-gray-600 hover:bg-gray-100 hover:text-dark'
    }`;

  const Sidebar = () => (
    <aside className="w-64 flex-shrink-0 flex flex-col h-full bg-white border-r border-gray-100">
      <div className="px-5 py-5 border-b border-gray-100">
        <Link to="/" className="flex items-center">
          <span className="font-black text-dark text-xl tracking-tight">Giviit</span>
        </Link>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map(({ to, icon: Icon, label, end }) => (
          <NavLink key={to} to={to} end={end} className={linkClass} onClick={() => setSidebarOpen(false)}>
            <Icon className="text-xl flex-shrink-0" />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="px-3 py-4 border-t border-gray-100 space-y-1">
        <Link to="/" className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors">
          <MdHome className="text-xl" /> Back to Site
        </Link>
        <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-colors w-full">
          <MdLogout className="text-xl" /> Sign Out
        </button>
      </div>

      <div className="px-4 py-4 border-t border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
            {user?.avatar_url ? (
              <img src={user.avatar_url} alt="" className="w-9 h-9 rounded-full object-cover" />
            ) : (
              <span className="text-white font-bold text-sm">{user?.full_name?.charAt(0)}</span>
            )}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-dark truncate">{user?.full_name}</p>
            <p className="text-xs text-gray-400 truncate">{user?.email}</p>
          </div>
        </div>
      </div>
    </aside>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Desktop sidebar */}
      <div className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 lg:z-30">
        <Sidebar />
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-40 flex">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
          <div className="relative w-64 flex flex-col h-full">
            <Sidebar />
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 lg:ml-64">
        {/* Mobile header */}
        <div className="lg:hidden flex items-center justify-between bg-white border-b border-gray-100 px-4 py-3">
          <button onClick={() => setSidebarOpen(true)} className="p-1.5 rounded-lg hover:bg-gray-100">
            <MdMenu className="text-xl" />
          </button>
          <span className="font-black text-dark text-lg tracking-tight">Giviit</span>
          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
            <span className="text-white text-sm font-bold">{user?.full_name?.charAt(0)}</span>
          </div>
        </div>

        <main className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto">
          <BannedBanner />
          {children}
        </main>
      </div>
    </div>
  );
}

