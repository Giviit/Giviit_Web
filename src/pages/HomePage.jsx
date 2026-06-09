import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowRight, ArrowUp, BadgeCheck, Shield, Users, Heart,
  GraduationCap, Stethoscope, Briefcase, Zap, Church, Star,
  PenLine, Share2, Landmark, Link2, Send, HandHeart,
  Fingerprint, Globe,
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import CampaignCard from '../components/CampaignCard';
import CampaignCardSkeleton from '../components/CampaignCardSkeleton';
import api from '../utils/api';

/* ─── constants ─────────────────────────────────────────────────── */
const TICKER_ITEMS = [
  '🟢 Adaeze reached 80% of her goal in 48 hours',
  '💚 ₦500,000 raised for flood relief in Lokoja today',
  '🎯 3 campaigns hit their full goals this week',
  '🔴 Urgent: Community market rebuild needs your support',
  '🟢 Scholarship fund crossed ₦1.9M raised',
  '📱 One WhatsApp message can unlock your first 20 donations',
  '💳 Every naira on Giviit is secured by Paystack',
  '🎉 New: 14,200+ campaigns successfully funded so far',
];

const CATEGORY_GRID = [
  { value: 'medical',   label: 'Medical',       icon: Stethoscope, color: 'bg-red-50 text-red-600 border-red-100',     activeColor: 'bg-red-500 text-white border-red-500' },
  { value: 'education', label: 'Education',      icon: GraduationCap, color: 'bg-blue-50 text-blue-600 border-blue-100', activeColor: 'bg-blue-600 text-white border-blue-600' },
  { value: 'business',  label: 'Business',       icon: Briefcase, color: 'bg-amber-50 text-amber-600 border-amber-100',  activeColor: 'bg-amber-500 text-white border-amber-500' },
  { value: 'emergency', label: 'Emergency',      icon: Zap, color: 'bg-orange-50 text-orange-600 border-orange-100',    activeColor: 'bg-orange-500 text-white border-orange-500' },
  { value: 'funeral',   label: 'Memorial',       icon: Heart, color: 'bg-purple-50 text-purple-600 border-purple-100',  activeColor: 'bg-purple-600 text-white border-purple-600' },
  { value: 'church',    label: 'Faith & Church', icon: Church, color: 'bg-indigo-50 text-indigo-600 border-indigo-100', activeColor: 'bg-indigo-600 text-white border-indigo-600' },
  { value: 'community', label: 'Community',      icon: Users, color: 'bg-green-50 text-green-600 border-green-100',     activeColor: 'bg-green-600 text-white border-green-600' },
  { value: 'other',     label: 'Startup',        icon: Star, color: 'bg-gray-50 text-gray-600 border-gray-100',         activeColor: 'bg-gray-700 text-white border-gray-700' },
];

const HOW_STEPS = [
  { n: '01', title: 'Tell your story.', sub: 'Create your campaign', body: 'Sign up free, write your story, set a goal, and add photos. Most creators are live in under five minutes.', icon: PenLine },
  { n: '02', title: 'Share it everywhere.', sub: 'WhatsApp, Instagram, email', body: 'One tap to copy your campaign link. Send it to your contacts — your network is your most powerful fundraising tool.', icon: Share2 },
  { n: '03', title: 'Receive your funds.', sub: 'Straight into your bank account', body: 'Donations arrive securely through Paystack. Request a withdrawal anytime directly into your verified Nigerian bank account.', icon: Landmark },
];

/* ─── sub-components ────────────────────────────────────────────── */
function LiveTicker({ items }) {
  const doubled = [...items, ...items];
  return (
    <div className="overflow-hidden py-3.5 flex-1">
      <div className="flex items-center whitespace-nowrap" style={{ animation: 'giviit-ticker 45s linear infinite' }}>
        {doubled.map((item, i) => (
          <span key={i} className="text-[13px] font-medium text-green-200 flex-shrink-0 flex items-center">
            <span className="px-6">{item}</span>
            <span className="text-[#22c55e] font-black text-base">·</span>
          </span>
        ))}
      </div>
    </div>
  );
}

function HeroCard({ campaign, cardStyle, imgClass }) {
  if (!campaign) {
    return (
      <div className="absolute bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100 animate-pulse" style={cardStyle}>
        <div className={`bg-gray-100 ${imgClass}`} />
        <div className="p-3.5 space-y-2">
          <div className="h-3 bg-gray-100 rounded w-3/4" />
          <div className="h-2 bg-gray-100 rounded" />
        </div>
      </div>
    );
  }
  const pct = Math.min(100, Math.round(((campaign.amount_raised || 0) / (campaign.goal_amount || 1)) * 100));
  return (
    <Link to={`/campaign/${campaign.slug}`}
      className="absolute bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100 hover:-translate-y-1 transition-transform duration-300 group"
      style={cardStyle}
    >
      {campaign.cover_image
        ? <img src={campaign.cover_image} alt="" className={`w-full object-cover ${imgClass}`} />
        : <div className={`w-full bg-[#1a7a4a]/10 ${imgClass}`} />
      }
      <div className="p-3.5">
        <p className="text-[11px] font-black text-[#0D1A0D] line-clamp-2 leading-snug mb-2.5 group-hover:text-[#1a7a4a] transition-colors">{campaign.title}</p>
        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden mb-1.5">
          <div className="h-full rounded-full bg-[#1a7a4a]" style={{ width: `${pct}%` }} />
        </div>
        <div className="flex justify-between text-[10px] font-semibold">
          <span className="text-[#1a7a4a]">₦{((campaign.amount_raised || 0) / 1000).toFixed(0)}k raised</span>
          <span className="text-gray-400">{(campaign.donor_count || 0).toLocaleString()} donors</span>
        </div>
      </div>
    </Link>
  );
}

/* ─── page ───────────────────────────────────────────────────────── */
export default function HomePage() {
  const [activeCategory, setActiveCategory] = useState('all');
  const [showBackToTop, setShowBackToTop] = useState(false);

  useEffect(() => {
    const onScroll = () => setShowBackToTop(window.scrollY > 500);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

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
      api.get('/campaigns', { params: { category: activeCategory === 'all' ? undefined : activeCategory, limit: 9 } })
        .then(r => r.data),
    staleTime: 3 * 60 * 1000,
  });

  const heroCards = urgentData || featuredData || [];

  const cardConfigs = [
    { top: '3%',  left: '6%',  width: '260px', zIndex: 3, imgClass: 'h-40', animation: 'giviit-float1 6s ease-in-out infinite' },
    { top: '26%', left: '33%', width: '240px', zIndex: 2, imgClass: 'h-36', animation: 'giviit-float2 7s ease-in-out infinite 0.8s' },
    { top: '52%', left: '4%',  width: '250px', zIndex: 1, imgClass: 'h-32', animation: 'giviit-float3 8s ease-in-out infinite 1.5s' },
  ];

  return (
    <div className="min-h-screen overflow-x-hidden">
      <style>{`
        @keyframes giviit-ticker { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        @keyframes giviit-float1 { 0%,100% { transform: translateY(0px) rotate(-3deg); } 50% { transform: translateY(-10px) rotate(-3deg); } }
        @keyframes giviit-float2 { 0%,100% { transform: translateY(0px) rotate(2.5deg); } 50% { transform: translateY(-14px) rotate(2.5deg); } }
        @keyframes giviit-float3 { 0%,100% { transform: translateY(0px) rotate(-1.5deg); } 50% { transform: translateY(-7px) rotate(-1.5deg); } }
        @keyframes giviit-scroll { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
      `}</style>

      <Navbar />

      {/* ══ HERO ══ */}
      <section className="min-h-screen bg-[#0D1A0D] relative overflow-hidden flex flex-col">
        {/* Lagos city skyline — bright */}
        <img
          src="https://images.unsplash.com/photo-1618828665011-0abd973f7bb8?w=1800&q=85"
          alt="Lagos city skyline"
          className="absolute inset-0 w-full h-full object-cover object-center opacity-50"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0D1A0D]/90 via-[#0D1A0D]/60 to-[#0D1A0D]/20" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#0D1A0D] to-transparent" />

        <div className="relative flex-1 max-w-[1440px] mx-auto w-full px-5 sm:px-12 lg:px-20 pt-20 sm:pt-24 pb-12 sm:pb-16 flex flex-col justify-center">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_500px] gap-8 lg:gap-12 items-center min-h-[calc(100vh-5rem)]">

            {/* Copy */}
            <div>
              <span className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-white/80 text-[11px] font-black px-4 py-1.5 rounded-full mb-8 uppercase tracking-[0.15em]">
                <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                Nigeria's #1 Crowdfunding Platform
              </span>

              <h1 className="font-black text-white mb-8 select-none"
                style={{ fontSize: 'clamp(3.8rem, 10vw, 8.8rem)', lineHeight: 0.87, letterSpacing: '-0.04em' }}
              >
                <span className="block">TOGETHER</span>
                <span className="block text-[#f5a623]">WE RISE.</span>
              </h1>

              <p className="text-gray-300 text-lg sm:text-xl leading-relaxed mb-10 max-w-[500px]">
                Giviit is Nigeria's home for crowdfunding. Start a campaign in minutes, share your link, and receive donations straight to your bank account.
              </p>

              <div className="flex flex-wrap gap-3 mb-10">
                <Link to="/register"
                  className="inline-flex items-center gap-2.5 bg-[#f5a623] hover:bg-[#e09510] text-white font-black px-8 py-4 rounded-2xl text-base transition-all hover:scale-[1.03] shadow-xl shadow-[#f5a623]/25"
                >
                  Start a Campaign <ArrowRight size={20} />
                </Link>
                <Link to="/campaigns"
                  className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/25 text-white font-bold px-8 py-4 rounded-2xl text-base transition-all backdrop-blur-sm"
                >
                  Browse Campaigns
                </Link>
              </div>
            </div>

            {/* Floating cards */}
            <div className="hidden lg:block relative h-[600px] w-full">
              {cardConfigs.map((cfg, i) => (
                <HeroCard key={i} campaign={heroCards[i] || null} imgClass={cfg.imgClass}
                  cardStyle={{ top: cfg.top, left: cfg.left, width: cfg.width, zIndex: cfg.zIndex, animation: cfg.animation }}
                />
              ))}
              <div className="absolute top-[15%] right-[5%] w-48 h-48 bg-[#f5a623]/10 rounded-full blur-2xl pointer-events-none" />
            </div>
          </div>
        </div>
      </section>

      {/* ══ IMPACT NUMBERS ══ */}
      <section className="bg-[#0f2417] py-12 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-20">
          <p className="text-[#22c55e] text-[11px] font-black uppercase tracking-[0.2em] mb-8 sm:mb-12">The numbers don't lie</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-white/10">
            {[
              { big: '₦2.4B+',   label: 'raised by Nigerians',  note: 'Every naira secured by Paystack' },
              { big: '14,200+',  label: 'campaigns funded',      note: 'Medical · Education · Emergency · Community' },
              { big: '320,000+', label: 'donors across Nigeria', note: 'All 36 states and FCT' },
            ].map(({ big, label, note }, i) => (
              <div key={label} className={`py-8 sm:py-10 ${i === 1 ? 'sm:px-12 sm:text-center' : i === 2 ? 'sm:pl-12 sm:text-right' : 'sm:pr-12'}`}>
                <div className="font-black text-white" style={{ fontSize: 'clamp(2rem, 5vw, 3.8rem)', lineHeight: 1, letterSpacing: '-0.04em' }}>
                  {big}
                </div>
                <p className="text-[#22c55e] font-bold text-sm mt-2">{label}</p>
                <p className="text-white/30 text-xs mt-1 hidden sm:block">{note}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ URGENT CAMPAIGNS — auto-scroll carousel ══ */}
      {(urgentLoading || (urgentData && urgentData.length > 0)) && (
        <section className="py-12 sm:py-20 bg-[#F7F4EE] overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-20 mb-8">
            <div className="inline-flex items-center gap-2 bg-red-500 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full mb-4">
              <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" /> Urgent
            </div>
            <h2 className="font-black text-[#0D1A0D]" style={{ fontSize: 'clamp(1.8rem, 4vw, 3rem)', letterSpacing: '-0.03em', lineHeight: 1.1 }}>
              Needs your help<br /><span className="text-red-500">right now.</span>
            </h2>
          </div>

          {/* Auto-scrolling strip — no manual arrows */}
          <div className="relative">
            <div
              className="flex gap-5"
              style={{ animation: 'giviit-scroll 30s linear infinite', width: 'max-content' }}
            >
              {urgentLoading
                ? Array(6).fill(0).map((_, i) => (
                    <div key={i} className="flex-shrink-0 w-72"><CampaignCardSkeleton /></div>
                  ))
                : [...(urgentData || []), ...(urgentData || [])].map((c, i) => (
                    <div key={`${c.id}-${i}`} className="flex-shrink-0 w-72">
                      <CampaignCard campaign={c} />
                    </div>
                  ))
              }
            </div>
            {/* Fade edges */}
            <div className="absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-[#F7F4EE] to-transparent pointer-events-none" />
            <div className="absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-[#F7F4EE] to-transparent pointer-events-none" />
          </div>
        </section>
      )}

      {/* ══ DISCOVER — visual category filter ══ */}
      <section className="py-12 sm:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-20">
          <div className="flex items-start justify-between gap-4 mb-8 sm:mb-10">
            <div>
              <p className="text-[#1a7a4a] text-[11px] font-black uppercase tracking-[0.2em] mb-3">Discover</p>
              <h2 className="font-black text-[#0D1A0D]" style={{ fontSize: 'clamp(1.8rem, 4vw, 3rem)', letterSpacing: '-0.03em', lineHeight: 1.1 }}>
                Campaigns in<br />your community
              </h2>
            </div>
            <Link to="/campaigns" className="text-[#1a7a4a] text-sm font-bold hover:underline flex items-center gap-1 flex-shrink-0 mt-1">
              View all <ArrowRight size={16} />
            </Link>
          </div>

          {/* Visual category grid */}
          <div className="mb-10">
            <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 sm:gap-3">
              {/* All button */}
              <button
                onClick={() => setActiveCategory('all')}
                className={`flex flex-col items-center gap-1.5 p-3 rounded-2xl border-2 transition-all ${
                  activeCategory === 'all'
                    ? 'bg-[#0D1A0D] text-white border-[#0D1A0D] shadow-md'
                    : 'bg-gray-50 text-gray-500 border-gray-100 hover:border-gray-300 hover:bg-gray-100'
                }`}
              >
                <Globe size={20} />
                <span className="text-[10px] sm:text-xs font-bold">All</span>
              </button>

              {CATEGORY_GRID.map(({ value, label, icon: Icon, color, activeColor }) => (
                <button
                  key={value}
                  onClick={() => setActiveCategory(value)}
                  className={`flex flex-col items-center gap-1.5 p-3 rounded-2xl border-2 transition-all ${
                    activeCategory === value ? activeColor + ' shadow-md scale-105' : color + ' hover:scale-102 hover:shadow-sm'
                  }`}
                >
                  <Icon size={20} />
                  <span className="text-[10px] sm:text-xs font-bold leading-tight text-center">{label.split(' ')[0]}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {campaignsLoading
              ? Array(9).fill(0).map((_, i) => <CampaignCardSkeleton key={i} />)
              : campaignsData?.campaigns?.map(c => <CampaignCard key={c.id} campaign={c} />)
            }
          </div>
        </div>
      </section>

      {/* ══ FEATURED CAMPAIGNS ══ */}
      {(featuredLoading || (featuredData && featuredData.length > 0)) && (
        <section className="py-12 sm:py-20 bg-[#F7F4EE]">
          <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-20">
            <div className="flex items-end justify-between mb-10">
              <div>
                <p className="text-[11px] font-black uppercase tracking-[0.2em] text-[#1a7a4a] mb-3">Editor's Picks</p>
                <h2 className="font-black text-[#0D1A0D]" style={{ fontSize: 'clamp(1.8rem, 4vw, 3rem)', letterSpacing: '-0.03em', lineHeight: 1.1 }}>
                  Campaigns<br />we love
                </h2>
              </div>
              <Link to="/campaigns?featured=true" className="text-[#1a7a4a] text-sm font-bold hover:underline flex items-center gap-1">
                See all <ArrowRight size={16} />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
              {featuredLoading
                ? Array(3).fill(0).map((_, i) => <CampaignCardSkeleton key={i} />)
                : featuredData?.slice(0, 6).map(c => <CampaignCard key={c.id} campaign={c} />)
              }
            </div>
          </div>
        </section>
      )}

      {/* ══ CATEGORY WALL ══ */}
      <section className="bg-[#0D1A0D]">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-20 pt-20 pb-4">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-12">
            <h2 className="font-black text-white" style={{ fontSize: 'clamp(2rem, 5vw, 4rem)', letterSpacing: '-0.04em', lineHeight: 0.95 }}>
              Every cause.<br /><span className="text-[#22c55e]">One platform.</span>
            </h2>
            <Link to="/campaigns" className="text-white/30 text-sm font-bold hover:text-white transition-colors flex items-center gap-1 self-end sm:self-auto">
              View all campaigns <ArrowRight size={16} />
            </Link>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 border-t border-white/[0.07]">
          {CATEGORY_GRID.map(({ value, label, icon: Icon }) => (
            <Link key={value} to={`/campaigns?category=${value}`}
              className="group border-r border-b border-white/[0.07] last:border-r-0 sm:[&:nth-child(4n)]:border-r-0 p-8 flex flex-col justify-between gap-10 min-h-[160px] hover:bg-[#1a7a4a]/20 transition-all duration-200"
            >
              <Icon size={24} className="text-white/20 group-hover:text-[#22c55e] transition-colors" />
              <div>
                <p className="text-white font-black text-lg leading-none tracking-tight">{label}</p>
                <p className="text-white/25 text-[11px] font-bold mt-1.5 flex items-center gap-1 group-hover:text-[#22c55e] transition-colors uppercase tracking-widest">
                  Browse <ArrowRight size={10} />
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ══ HOW IT WORKS ══ */}
      <section className="py-14 sm:py-24 bg-[#F7F4EE]">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-20">
          <div className="mb-10 sm:mb-16">
            <p className="text-[#1a7a4a] text-[11px] font-black uppercase tracking-[0.2em] mb-4">Simple. Fast. Trusted.</p>
            <h2 className="font-black text-[#0D1A0D]" style={{ fontSize: 'clamp(2.2rem, 5vw, 4rem)', letterSpacing: '-0.04em', lineHeight: 0.95 }}>
              Get started<br />in 3 minutes.
            </h2>
          </div>

          <div className="space-y-0 divide-y-2 divide-[#0D1A0D]/[0.06]">
            {HOW_STEPS.map(({ n, title, sub, body, icon: Icon }, i) => (
              <div key={n} className={`flex flex-col sm:flex-row gap-1 sm:gap-8 py-8 sm:py-12 items-start ${i % 2 === 1 ? 'sm:flex-row-reverse' : ''}`}>
                <div className="flex-shrink-0 sm:w-28">
                  <span className="font-black text-[#0D1A0D]/[0.08] select-none leading-none block" style={{ fontSize: 'clamp(3.5rem, 10vw, 8rem)', letterSpacing: '-0.05em' }}>
                    {n}
                  </span>
                </div>
                <div className="flex-1 max-w-2xl">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-[#1a7a4a] rounded-xl flex items-center justify-center flex-shrink-0">
                      <Icon size={18} className="text-white" />
                    </div>
                    <p className="text-[#1a7a4a] text-xs font-black uppercase tracking-widest">{sub}</p>
                  </div>
                  <h3 className="font-black text-[#0D1A0D] mb-4" style={{ fontSize: 'clamp(1.6rem, 3.5vw, 2.5rem)', letterSpacing: '-0.03em', lineHeight: 1.1 }}>
                    {title}
                  </h3>
                  <p className="text-[#4a5a4a] text-lg leading-relaxed">{body}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Platform fee note */}
          <div className="mt-10 p-5 bg-white rounded-2xl border border-gray-100 flex items-start gap-3">
            <BadgeCheck size={20} className="text-[#1a7a4a] flex-shrink-0 mt-0.5" />
            <p className="text-sm text-gray-600 leading-relaxed">
              <span className="font-bold text-[#0D1A0D]">Transparent fees:</span> Giviit charges a <strong>3% platform fee</strong> on all funds raised, plus a <strong>0.5% fraud protection reserve</strong>. These fees ensure platform security and donor protection. No sign-up fees. No listing fees.
            </p>
          </div>

          <div className="mt-10">
            <Link to="/register"
              className="inline-flex items-center gap-2.5 bg-[#1a7a4a] hover:bg-[#155f3a] text-white font-black px-10 py-5 rounded-2xl text-base transition-all hover:scale-[1.02] shadow-lg shadow-[#1a7a4a]/20"
            >
              Start your campaign today <ArrowRight size={20} />
            </Link>
          </div>
        </div>
      </section>

      {/* ══ SHARE SECTION ══ */}
      <section className="bg-[#1a4d33] py-14 sm:py-20 relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.04] pointer-events-none"
          style={{ backgroundImage: 'radial-gradient(circle, #22c55e 1.5px, transparent 1.5px)', backgroundSize: '28px 28px' }}
        />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-8 lg:px-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2.5 bg-white/10 border border-white/10 rounded-full px-4 py-2 mb-8">
                <Share2 size={14} className="text-green-400" />
                <span className="text-white/60 text-[11px] font-black uppercase tracking-widest">Share your campaign</span>
              </div>
              <h2 className="font-black text-white mb-5" style={{ fontSize: 'clamp(2rem, 4.5vw, 3.5rem)', letterSpacing: '-0.04em', lineHeight: 0.95 }}>
                One link.<br />Unlimited<br /><span className="text-[#22c55e]">support.</span>
              </h2>
              <p className="text-green-200/70 text-lg leading-relaxed max-w-md">
                Every campaign gets a unique shareable link. Send it to friends, family, or anyone who might care — each click is a chance at a new donation.
              </p>
            </div>
            <div className="flex flex-col gap-5">
              <div className="bg-white/[0.07] border border-white/10 rounded-2xl p-6 space-y-4">
                {[
                  { icon: Link2,    label: 'Copy your link',          sub: 'One tap — your campaign URL is ready to share' },
                  { icon: Send,     label: 'Send it anywhere',         sub: 'Text, email, WhatsApp — wherever your people are' },
                  { icon: HandHeart, label: 'Watch donations come in', sub: 'Every share can bring new supporters to your cause' },
                ].map(({ icon: Icon, label, sub }) => (
                  <div key={label} className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Icon size={15} className="text-[#22c55e]" />
                    </div>
                    <div>
                      <p className="text-white text-sm font-bold">{label}</p>
                      <p className="text-white/40 text-xs mt-0.5">{sub}</p>
                    </div>
                  </div>
                ))}
              </div>
              <Link to="/register"
                className="flex items-center justify-center gap-2.5 bg-[#1a7a4a] hover:bg-[#155f3a] text-white font-black px-8 py-5 rounded-2xl transition-all hover:scale-[1.02] shadow-xl text-base"
              >
                <Share2 size={20} /> Start your campaign
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ══ TRUST ══ */}
      <section className="py-14 sm:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-20">
          <div className="max-w-3xl mb-10 sm:mb-16">
            <p className="text-[#1a7a4a] text-[11px] font-black uppercase tracking-[0.2em] mb-5">Why trust Giviit</p>
            <h2 className="font-black text-[#0D1A0D] mb-6" style={{ fontSize: 'clamp(2rem, 4.5vw, 3.5rem)', letterSpacing: '-0.04em', lineHeight: 1.05 }}>
              Built for Nigerians.<br /><span className="text-[#1a7a4a]">Powered by Giviit.</span>
            </h2>
            <p className="text-[#4a5a4a] text-xl leading-relaxed">
              Every safeguard Giviit has built is pointed at one goal — making sure every donation reaches the right hands.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-px bg-[#0D1A0D]/[0.07]">
            {[
              { icon: Fingerprint,     title: 'Identity verified',   body: 'Campaign creators verify their identity before launching. No anonymous fundraisers on Giviit.' },
              { icon: Shield,          title: 'Paystack-secured',     body: "Every naira moves through Paystack — Nigeria's most trusted payment gateway. No exceptions." },
              { icon: HandHeart, title: 'Direct bank payouts', body: 'Funds go straight to your verified Nigerian bank account. No holding periods, no middlemen.' },
              { icon: Users,           title: 'Community vouching',   body: 'Campaign guarantors can publicly vouch for creators — adding extra community accountability.' },
            ].map(({ icon: Icon, title, body }) => (
              <div key={title} className="bg-white p-8 sm:p-10 group hover:bg-[#F7F4EE] transition-colors">
                <div className="w-12 h-12 bg-[#1a7a4a]/10 group-hover:bg-[#1a7a4a]/15 rounded-xl flex items-center justify-center mb-5 transition-colors">
                  <Icon size={20} className="text-[#1a7a4a]" />
                </div>
                <h3 className="font-black text-[#0D1A0D] text-xl mb-3">{title}</h3>
                <p className="text-[#4a5a4a] text-base leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ FINAL CTA ══ */}
      <section className="bg-[#F5C842] relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.07] pointer-events-none"
          style={{ backgroundImage: 'radial-gradient(circle, #0D1A0D 1.5px, transparent 1.5px)', backgroundSize: '24px 24px' }}
        />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-8 lg:px-20 py-16 sm:py-24">
          <p className="text-[#0D1A0D]/50 text-[11px] font-black uppercase tracking-[0.2em] mb-6">Join the movement</p>
          <h2 className="font-black text-[#0D1A0D] mb-6"
            style={{ fontSize: 'clamp(2.5rem, 7vw, 6rem)', letterSpacing: '-0.04em', lineHeight: 0.9 }}
          >
            CHANGE<br />A LIFE<br />TODAY.
          </h2>
          <p className="text-[#0D1A0D]/60 text-lg mb-10 max-w-md leading-relaxed">
            Join 320,000+ Nigerians already using Giviit to fund what matters most.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link to="/register"
              className="inline-flex items-center gap-2.5 bg-[#0D1A0D] hover:bg-[#1a3a20] text-white font-black px-8 py-4 rounded-2xl text-base transition-all hover:scale-[1.02] shadow-xl"
            >
              Start a Campaign — Free <ArrowRight size={20} />
            </Link>
            <Link to="/campaigns"
              className="inline-flex items-center gap-2.5 border-2 border-[#0D1A0D]/20 text-[#0D1A0D] hover:border-[#0D1A0D] font-bold px-8 py-4 rounded-2xl text-base transition-all"
            >
              Browse Campaigns
            </Link>
          </div>
          <p className="text-[#0D1A0D]/30 text-sm mt-8 font-medium">
            No fees to start &nbsp;·&nbsp; Paystack-secured &nbsp;·&nbsp; Withdraw anytime
          </p>
        </div>
      </section>

      <Footer />

      {showBackToTop && (
        <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} aria-label="Back to top"
          className="fixed bottom-6 right-6 z-50 w-11 h-11 bg-[#0D1A0D] text-white rounded-2xl flex items-center justify-center shadow-lg hover:bg-[#1a7a4a] transition-colors"
        >
          <ArrowUp size={20} />
        </button>
      )}
    </div>
  );
}
