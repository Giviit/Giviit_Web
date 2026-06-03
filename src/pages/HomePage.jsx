import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  MdArrowForward,
  MdVerified,
  MdSecurity,
  MdTrendingUp,
  MdPeople,
  MdFavorite,
  MdSchool,
  MdLocalHospital,
  MdBusiness,
  MdChurch,
  MdWarning,
  MdGroups,
  MdStar,
  MdChevronLeft,
  MdChevronRight,
  MdEditNote,
  MdCloudUpload,
  MdShare,
  MdVolunteerActivism,
  MdAccountBalance,
} from 'react-icons/md';
import { FaHandHoldingHeart, FaWhatsapp } from 'react-icons/fa';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import CampaignCard from '../components/CampaignCard';
import CampaignCardSkeleton from '../components/CampaignCardSkeleton';
import { CATEGORIES } from '../components/CategoryPill';
import api from '../utils/api';

const CATEGORY_ICONS = {
  medical: MdLocalHospital,
  education: MdSchool,
  business: MdBusiness,
  emergency: MdWarning,
  funeral: MdFavorite,
  church: MdChurch,
  community: MdGroups,
  other: MdStar,
};

const HOW_IT_WORKS = [
  {
    step: '01',
    title: 'Start your campaign',
    desc: 'Sign up and create your fundraising campaign in minutes.',
    icon: MdEditNote,
  },
  {
    step: '02',
    title: 'Upload your information',
    desc: 'Add photos, your story, and set a funding goal so donors understand your cause.',
    icon: MdCloudUpload,
  },
  {
    step: '03',
    title: 'Share your campaign',
    desc: 'Spread the word via WhatsApp, Instagram, or email to reach your community.',
    icon: MdShare,
  },
  {
    step: '04',
    title: 'Receive donations',
    desc: 'Supporters contribute securely through Paystack — every naira goes directly to your campaign.',
    icon: MdVolunteerActivism,
  },
  {
    step: '05',
    title: 'Withdraw funds',
    desc: 'Request a withdrawal anytime. Funds land straight in your Nigerian bank account.',
    icon: MdAccountBalance,
  },
];

const TRUST_POINTS = [
  {
    icon: MdVerified,
    title: 'Verified campaigns',
    desc: 'Every campaign is manually reviewed by our team before going live.',
  },
  {
    icon: MdSecurity,
    title: 'Secured by Paystack',
    desc: "Nigeria's most trusted payment gateway handles every transaction.",
  },
  {
    icon: FaHandHoldingHeart,
    title: 'Direct to your account',
    desc: 'No holding periods. Withdraw whenever you need to.',
  },
];

export default function HomePage() {
  const [activeCategory, setActiveCategory] = useState('all');
  const urgentScrollRef = useRef(null);

  const { data: featuredData, isLoading: featuredLoading } = useQuery({
    queryKey: ['featured-campaigns'],
    queryFn: () => api.get('/campaigns/featured').then(r => r.data.campaigns),
    staleTime: 5 * 60 * 1000,
  });

  const { data: urgentData, isLoading: urgentLoading } = useQuery({
    queryKey: ['urgent-campaigns'],
    queryFn: () => api.get('/campaigns/urgent').then(r => r.data.campaigns),
    staleTime: 5 * 60 * 1000,
  });

  const { data: campaignsData, isLoading: campaignsLoading } = useQuery({
    queryKey: ['home-campaigns', activeCategory],
    queryFn: () =>
      api
        .get('/campaigns', {
          params: { category: activeCategory === 'all' ? undefined : activeCategory, limit: 8 },
        })
        .then(r => r.data),
    staleTime: 3 * 60 * 1000,
  });

  const scrollUrgent = dir => {
    if (urgentScrollRef.current) {
      urgentScrollRef.current.scrollBy({ left: dir * 320, behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* ── Hero ── */}
      <section className="relative min-h-screen flex items-center pt-16 overflow-hidden bg-dark">
        {/* right-half background image */}
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1618828665011-0abd973f7bb8?w=1800&q=80"
            alt=""
            className="w-full h-full object-cover opacity-50"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-dark/90 from-40% via-dark/50 to-transparent" />
        </div>

        <div className="relative w-full grid grid-cols-1 lg:grid-cols-2 min-h-screen">
          {/* Left — text */}
          <div className="flex flex-col justify-center px-6 sm:px-12 lg:px-16 py-28">
            <span className="inline-flex items-center gap-2 bg-accent/15 border border-accent/30 text-accent text-xs font-bold px-3 py-1.5 rounded-full mb-8 tracking-wide uppercase w-fit">
              <MdVerified />
              Africa's #1 Crowdfunding Platform
            </span>

            <h1 className="text-6xl sm:text-7xl lg:text-7xl xl:text-8xl font-black text-white leading-[1.02] mb-6">
              Together
              <br />
              <span className="text-accent">We Rise.</span>
            </h1>

            <p className="text-gray-300 text-lg sm:text-xl leading-relaxed mb-10 max-w-md">
              From medical emergencies to business dreams — Givia connects African communities to the support they need.
            </p>

            <div className="flex flex-wrap gap-4 mb-14">
              <Link
                to="/register"
                className="inline-flex items-center gap-2 bg-accent hover:bg-accent/90 text-white font-bold px-8 py-4 rounded-full text-base transition-all hover:scale-105 shadow-lg shadow-accent/20"
              >
                Start a Campaign
                <MdArrowForward className="text-lg" />
              </Link>
              <Link
                to="/campaigns"
                className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold px-8 py-4 rounded-full text-base transition-all backdrop-blur-sm"
              >
                Browse Campaigns
              </Link>
            </div>

            <div className="flex flex-wrap gap-10 border-t border-white/10 pt-10">
              {[
                { value: '₦2.4B+', label: 'Total Raised' },
                { value: '14,200+', label: 'Active Campaigns' },
                { value: '320K+', label: 'Donors' },
              ].map(({ value, label }) => (
                <div key={label}>
                  <p className="text-3xl font-black text-accent">{value}</p>
                  <p className="text-gray-400 text-sm mt-0.5">{label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right — floating campaign cards */}
          <div className="hidden lg:flex flex-col justify-center items-start gap-4 px-8 py-28">
            {/* Category pill strip */}
            <div className="flex gap-2 mb-2 flex-wrap">
              {['Medical', 'Education', 'Business', 'Emergency'].map(cat => (
                <span key={cat} className="bg-white/10 border border-white/15 text-white/70 text-xs font-medium px-3 py-1 rounded-full">
                  {cat}
                </span>
              ))}
            </div>

            {/* Fake campaign cards — replaced by real ones once data loads */}
            {(urgentData || featuredData || [null, null, null])
              .slice(0, 3)
              .map((c, i) =>
                c ? (
                  <div
                    key={c.id}
                    className="w-full max-w-sm bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-4 flex gap-3 items-start hover:bg-white/15 transition-colors"
                    style={{ transform: i === 1 ? 'translateX(32px)' : 'none' }}
                  >
                    {c.cover_image && (
                      <img src={c.cover_image} alt="" className="w-14 h-14 rounded-xl object-cover flex-shrink-0" />
                    )}
                    <div className="min-w-0">
                      <p className="text-white font-semibold text-sm leading-snug line-clamp-2">{c.title}</p>
                      <div className="mt-2 h-1 bg-white/10 rounded-full w-full">
                        <div
                          className="h-1 bg-accent rounded-full"
                          style={{ width: `${Math.min(100, Math.round(((c.amount_raised || 0) / (c.goal_amount || 1)) * 100))}%` }}
                        />
                      </div>
                      <p className="text-accent text-xs font-bold mt-1">
                        ₦{((c.amount_raised || 0) / 1000).toFixed(0)}k raised
                      </p>
                    </div>
                  </div>
                ) : (
                  <div
                    key={i}
                    className="w-full max-w-sm bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-4 animate-pulse"
                    style={{ transform: i === 1 ? 'translateX(32px)' : 'none' }}
                  >
                    <div className="flex gap-3">
                      <div className="w-14 h-14 bg-white/10 rounded-xl flex-shrink-0" />
                      <div className="flex-1 space-y-2">
                        <div className="h-3 bg-white/10 rounded w-3/4" />
                        <div className="h-3 bg-white/10 rounded w-1/2" />
                        <div className="h-1 bg-white/10 rounded w-full mt-2" />
                      </div>
                    </div>
                  </div>
                )
              )}

            <Link
              to="/campaigns"
              className="text-accent text-sm font-semibold flex items-center gap-1 hover:gap-2 transition-all mt-2"
            >
              See all campaigns <MdArrowForward />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Urgent Campaigns ── */}
      {(urgentLoading || (urgentData && urgentData.length > 0)) && (
        <section className="py-20 bg-white">
          <div className="w-full px-6 sm:px-10 lg:px-16">
            <div className="flex items-end justify-between mb-10">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                  <span className="text-red-500 text-xs font-bold uppercase tracking-widest">Urgent</span>
                </div>
                <h2 className="text-3xl font-black text-dark">Needs your help now</h2>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => scrollUrgent(-1)}
                  className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors"
                >
                  <MdChevronLeft className="text-xl text-gray-500" />
                </button>
                <button
                  onClick={() => scrollUrgent(1)}
                  className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors"
                >
                  <MdChevronRight className="text-xl text-gray-500" />
                </button>
              </div>
            </div>

            <div
              ref={urgentScrollRef}
              className="flex gap-5 overflow-x-auto pb-2 snap-x"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {urgentLoading
                ? Array(4)
                    .fill(0)
                    .map((_, i) => (
                      <div key={i} className="flex-shrink-0 w-72 snap-start">
                        <CampaignCardSkeleton />
                      </div>
                    ))
                : urgentData?.map(c => (
                    <div key={c.id} className="flex-shrink-0 w-72 snap-start">
                      <CampaignCard campaign={c} />
                    </div>
                  ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Browse by Category ── */}
      <section className="py-20 bg-[#f9f6f1]">
        <div className="w-full px-6 sm:px-10 lg:px-16">
          <div className="mb-10">
            <p className="text-primary text-xs font-bold uppercase tracking-widest mb-2">Explore</p>
            <h2 className="text-3xl font-black text-dark">Browse campaigns</h2>
          </div>

          <div className="flex flex-wrap gap-2 mb-10">
            <button
              onClick={() => setActiveCategory('all')}
              className={`px-4 py-2 rounded-full text-sm font-semibold border transition-all ${
                activeCategory === 'all'
                  ? 'bg-dark text-white border-dark'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-dark/30'
              }`}
            >
              All
            </button>
            {CATEGORIES.filter(c => c.value !== 'all').map(({ value, label }) => {
              const Icon = CATEGORY_ICONS[value] || MdStar;
              return (
                <button
                  key={value}
                  onClick={() => setActiveCategory(value)}
                  className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold border transition-all ${
                    activeCategory === value
                      ? 'bg-dark text-white border-dark'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-dark/30'
                  }`}
                >
                  <Icon className="text-base" />
                  {label}
                </button>
              );
            })}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {campaignsLoading
              ? Array(8)
                  .fill(0)
                  .map((_, i) => <CampaignCardSkeleton key={i} />)
              : campaignsData?.campaigns?.map(c => <CampaignCard key={c.id} campaign={c} />)}
          </div>

          <div className="mt-10">
            <Link
              to="/campaigns"
              className="inline-flex items-center gap-2 border-2 border-dark text-dark font-bold px-7 py-3 rounded-full hover:bg-dark hover:text-white transition-all"
            >
              View all campaigns
              <MdArrowForward />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Featured Campaigns ── */}
      {(featuredLoading || (featuredData && featuredData.length > 0)) && (
        <section className="py-20 bg-white">
          <div className="w-full px-6 sm:px-10 lg:px-16">
            <div className="flex items-end justify-between mb-10">
              <div>
                <p className="text-accent text-xs font-bold uppercase tracking-widest mb-2">Editor's Pick</p>
                <h2 className="text-3xl font-black text-dark">Featured campaigns</h2>
              </div>
              <Link
                to="/campaigns?featured=true"
                className="text-primary text-sm font-semibold hover:underline flex items-center gap-1"
              >
                See all <MdArrowForward />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {featuredLoading
                ? Array(3)
                    .fill(0)
                    .map((_, i) => <CampaignCardSkeleton key={i} />)
                : featuredData?.slice(0, 6).map(c => <CampaignCard key={c.id} campaign={c} />)}
            </div>
          </div>
        </section>
      )}

      {/* ── How It Works ── */}
      <section className="py-24 bg-[#f9f6f1]">
        <div className="w-full px-6 sm:px-10 lg:px-16">
          <div className="mb-16">
            <p className="text-primary text-xs font-bold uppercase tracking-widest mb-2">Simple process</p>
            <h2 className="text-3xl font-black text-dark max-w-xs">How Givia works</h2>
          </div>

          <div className="grid grid-cols-2 md:flex md:flex-row md:items-stretch gap-3 md:gap-0">
            {HOW_IT_WORKS.map(({ step, title, desc, icon: Icon }, idx) => (
              <div key={step} className="flex flex-col md:flex-row md:items-stretch md:flex-1 md:min-w-0">
                {/* Card */}
                <div className="flex-1 bg-white rounded-xl p-4 md:p-6 border border-gray-100 flex flex-col items-start">
                  <span className="text-3xl md:text-4xl font-black text-gray-100 leading-none block mb-3">{step}</span>
                  <div className="w-8 h-8 md:w-10 md:h-10 bg-primary/10 rounded-xl flex items-center justify-center mb-3">
                    <Icon className="text-primary text-base md:text-xl" />
                  </div>
                  <h3 className="font-bold text-dark text-sm md:text-base mb-1">{title}</h3>
                  <p className="text-gray-500 text-xs md:text-sm leading-relaxed">{desc}</p>
                </div>
                {/* Connector arrow — desktop only */}
                {idx < HOW_IT_WORKS.length - 1 && (
                  <div className="hidden md:flex items-center justify-center px-2 text-primary/30">
                    <MdArrowForward className="text-2xl" />
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="mt-10">
            <Link
              to="/register"
              className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-white font-bold px-8 py-4 rounded-full transition-colors shadow-lg shadow-primary/20"
            >
              Start your campaign today
              <MdArrowForward />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Trust ── */}
      <section className="py-20 bg-dark">
        <div className="w-full px-6 sm:px-10 lg:px-16">
          <div className="mb-14">
            <p className="text-accent text-xs font-bold uppercase tracking-widest mb-2">Why Givia</p>
            <h2 className="text-3xl font-black text-white">Built for trust</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TRUST_POINTS.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="border border-white/10 rounded-2xl p-8 hover:border-accent/30 transition-colors">
                <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center mb-6">
                  <Icon className="text-accent text-2xl" />
                </div>
                <h3 className="text-white font-bold text-lg mb-2">{title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-24 bg-primary">
        <div className="w-full px-6 sm:px-10 lg:px-16">
          <div className="max-w-2xl">
            <h2 className="text-4xl sm:text-5xl font-black text-white leading-tight mb-4">
              Ready to change
              <br />
              someone's life?
            </h2>
            <p className="text-green-200 text-lg mb-10">
              Join hundreds of thousands of Africans using Givia every day.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                to="/register"
                className="inline-flex items-center gap-2 bg-accent hover:bg-accent/90 text-white font-bold px-8 py-4 rounded-full transition-all hover:scale-105 shadow-lg shadow-black/20"
              >
                Start a Campaign
                <MdArrowForward />
              </Link>
              <Link
                to="/campaigns"
                className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold px-8 py-4 rounded-full transition-all"
              >
                Browse Campaigns
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
