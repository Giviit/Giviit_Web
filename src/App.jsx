import { Routes, Route, Navigate } from 'react-router-dom';

// Public pages
import HomePage from './pages/HomePage';
import CampaignsPage from './pages/CampaignsPage';
import CampaignDetailPage from './pages/CampaignDetailPage';
import DonateSuccessPage from './pages/DonateSuccessPage';
import GuarantorVouchPage from './pages/GuarantorVouchPage';
import BlogPage from './pages/BlogPage';
import BlogPostPage from './pages/BlogPostPage';
import HowItWorksPage from './pages/HowItWorksPage';
import AboutPage from './pages/AboutPage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import CookiePolicyPage from './pages/CookiePolicyPage';
import TermsPage from './pages/TermsPage';

// Auth pages
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';
import AuthCallbackPage from './pages/auth/AuthCallbackPage';

// Dashboard pages
import DashboardHome from './pages/dashboard/DashboardHome';
import MyCampaigns from './pages/dashboard/MyCampaigns';
import CreateCampaign from './pages/dashboard/CreateCampaign';
import Withdrawals from './pages/dashboard/Withdrawals';
import Profile from './pages/dashboard/Profile';
import PostUpdate from './pages/dashboard/PostUpdate';
import EditCampaign from './pages/dashboard/EditCampaign';
import OfflineDonations from './pages/dashboard/OfflineDonations';
import CampaignMembers from './pages/dashboard/CampaignMembers';
import PledgeConfirmPage from './pages/PledgeConfirmPage';

// Guards
import ProtectedRoute from './components/ProtectedRoute';
import ScrollToTop from './components/ScrollToTop';

function App() {
  return (
    <div className="min-h-screen">
      <ScrollToTop />
      <Routes>
        {/* Public */}
        <Route path="/" element={<HomePage />} />
        <Route path="/campaigns" element={<CampaignsPage />} />
        <Route path="/campaign/:slug" element={<CampaignDetailPage />} />
        <Route path="/donate/success" element={<DonateSuccessPage />} />
        <Route path="/pledge/confirm" element={<PledgeConfirmPage />} />
        <Route path="/vouch/:token" element={<GuarantorVouchPage />} />
        <Route path="/blog" element={<BlogPage />} />
        <Route path="/blog/:slug" element={<BlogPostPage />} />
        <Route path="/how-it-works" element={<HowItWorksPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
        <Route path="/cookie-policy" element={<CookiePolicyPage />} />
        <Route path="/terms" element={<TermsPage />} />

        {/* Auth */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/auth/callback" element={<AuthCallbackPage />} />

        {/* Dashboard — authenticated */}
        <Route path="/dashboard" element={<ProtectedRoute><DashboardHome /></ProtectedRoute>} />
        <Route path="/dashboard/campaigns" element={<ProtectedRoute><MyCampaigns /></ProtectedRoute>} />
        <Route path="/dashboard/campaigns/create" element={<ProtectedRoute><CreateCampaign /></ProtectedRoute>} />
        <Route path="/dashboard/campaigns/:id/edit" element={<ProtectedRoute><EditCampaign /></ProtectedRoute>} />
        <Route path="/dashboard/campaigns/:id/update" element={<ProtectedRoute><PostUpdate /></ProtectedRoute>} />
        <Route path="/dashboard/campaigns/:id/offline-donations" element={<ProtectedRoute><OfflineDonations /></ProtectedRoute>} />
        <Route path="/dashboard/campaigns/:id/members" element={<ProtectedRoute><CampaignMembers /></ProtectedRoute>} />
        <Route path="/dashboard/withdrawals" element={<ProtectedRoute><Withdrawals /></ProtectedRoute>} />
        <Route path="/dashboard/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />

        {/* Fallback */}
        <Route path="*" element={<Navigate replace to="/" />} />
      </Routes>
    </div>
  );
}

export default App;
