import { NavLink, Link, useLocation } from 'react-router-dom';
import { MdHome, MdExplore, MdAdd, MdSpaceDashboard, MdPerson, MdLogin } from 'react-icons/md';
import { useAuth } from '../context/AuthContext';

// App-style bottom tab bar, mobile only. Rendered by App.jsx on primary
// navigation routes; hidden on flows with their own bottom UI (campaign
// detail's sticky donate bar, the create-campaign wizard, checkout pages).
export default function BottomNav() {
  const { user } = useAuth();
  const location = useLocation();

  const tabClass = (isActive) =>
    `flex flex-col items-center justify-center gap-0.5 h-full transition-colors ${
      isActive ? 'text-primary' : 'text-gray-400 active:text-gray-600'
    }`;

  // Dashboard tab stays lit for all /dashboard/* pages except profile,
  // which has its own tab.
  const dashboardActive = location.pathname.startsWith('/dashboard') && location.pathname !== '/dashboard/profile';

  return (
    <nav
      className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-lg border-t border-gray-100"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="grid grid-cols-5 h-[52px]">
        <NavLink to="/" end className={({ isActive }) => tabClass(isActive)}>
          <MdHome className="text-xl" />
          <span className="text-[9px] font-semibold">Home</span>
        </NavLink>

        <NavLink to="/campaigns" className={({ isActive }) => tabClass(isActive)}>
          <MdExplore className="text-xl" />
          <span className="text-[9px] font-semibold">Explore</span>
        </NavLink>

        {/* Center raised action — start a campaign */}
        <div className="relative flex justify-center">
          <Link
            to={user ? '/dashboard/campaigns/create' : '/register'}
            className="absolute -top-3.5 w-11 h-11 rounded-full bg-accent text-white flex items-center justify-center shadow-lg shadow-accent/30 active:scale-95 transition-transform"
            aria-label="Start a campaign"
          >
            <MdAdd className="text-2xl" />
          </Link>
          <span className="absolute bottom-1 text-[9px] font-semibold text-gray-400">Start</span>
        </div>

        <NavLink to="/dashboard" className={() => tabClass(dashboardActive)}>
          <MdSpaceDashboard className="text-xl" />
          <span className="text-[9px] font-semibold">Dashboard</span>
        </NavLink>

        {user ? (
          <NavLink to="/dashboard/profile" className={({ isActive }) => tabClass(isActive)}>
            {user.avatar_url ? (
              <img src={user.avatar_url} alt="" className="w-5 h-5 rounded-full object-cover" />
            ) : (
              <MdPerson className="text-xl" />
            )}
            <span className="text-[9px] font-semibold">Profile</span>
          </NavLink>
        ) : (
          <NavLink to="/login" className={({ isActive }) => tabClass(isActive)}>
            <MdLogin className="text-xl" />
            <span className="text-[9px] font-semibold">Sign In</span>
          </NavLink>
        )}
      </div>
    </nav>
  );
}
