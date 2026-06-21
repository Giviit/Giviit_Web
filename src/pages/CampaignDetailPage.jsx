import { useState, useRef, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import {
  Users, Calendar, Flag, ArrowLeft, Users2, Cake,
  PartyPopper, BadgeCheck, Zap, Share2, Copy, Check,
} from 'lucide-react';
import { stripEmoji } from '../utils/formatters';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ProgressBar from '../components/ProgressBar';
import DonationModal from '../components/DonationModal';
import LoadingSpinner from '../components/LoadingSpinner';
import PrayerWall from '../components/PrayerWall';
import MilestoneTracker from '../components/MilestoneTracker';
import GuarantorBadge from '../components/GuarantorBadge';
import DiasporaLeaderboard from '../components/DiasporaLeaderboard';
import SapaBanner from '../components/SapaBanner';
import api from '../utils/api';
import { formatCurrency, formatDaysLeft, formatProgress, formatTimeAgo, getCampaignShareUrl } from '../utils/formatters';

function BirthdayBanner({ campaign }) {
  if (!campaign.is_birthday || !campaign.birthday_date) return null;
  const today = new Date();
  const bday = new Date(campaign.birthday_date);
  const isToday = today.toDateString() === bday.toDateString();
  const diffDays = Math.ceil((bday - today) / (1000 * 60 * 60 * 24));

  return (
    <div className="rounded-2xl p-4 mb-4 border-2 border-pink-300 relative overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #fdf2f8, #fce7f3)' }}>
      <div className="absolute -top-2 -right-2 opacity-20 select-none rotate-12">
        <Cake size={48} className="text-pink-400" />
      </div>
      <div className="relative flex items-center gap-3">
        <Cake size={24} className="text-pink-600 flex-shrink-0" />
        <div>
          <p className="font-black text-pink-800 text-sm">
            {isToday
              ? `Today is ${campaign.birthday_person_name}'s Birthday!`
              : `${campaign.birthday_person_name}'s Birthday in ${diffDays} day${diffDays !== 1 ? 's' : ''}`}
          </p>
          <p className="text-xs text-pink-600 mt-0.5">They asked for no gifts — just donate to their cause.</p>
        </div>
      </div>
    </div>
  );
}

function WhatsAppShareBtn({ campaign }) {
  const raised = formatCurrency(campaign.raised_amount || 0);
  const goal = formatCurrency(campaign.goal_amount || 0);
  const url = getCampaignShareUrl(campaign);
  const msg = encodeURIComponent(
    `Help ${campaign.title}! They've raised ${raised} of ${goal}. Every donation counts. Donate here: ${url}`
  );
  return (
    <a
      href={`https://wa.me/?text=${msg}`}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#1ebe5d] text-white font-bold px-5 py-3 rounded-xl text-sm transition-all hover:scale-[1.02] shadow-md shadow-[#25D366]/20"
    >
      <Share2 size={16} />
      Share on WhatsApp
    </a>
  );
}

function CopyLinkBtn({ campaign }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(getCampaignShareUrl(campaign));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button onClick={copy}
      className="inline-flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold px-4 py-3 rounded-xl text-sm transition-colors"
    >
      {copied ? <Check size={16} className="text-green-600" /> : <Copy size={16} />}
      {copied ? 'Copied!' : 'Copy link'}
    </button>
  );
}

export default function CampaignDetailPage() {
  const { slug } = useParams();
  const [showModal, setShowModal] = useState(false);
  const [presetAmount, setPresetAmount] = useState(null);
  const [reportOpen, setReportOpen] = useState(false);
  const [reportData, setReportData] = useState({ reason: '', details: '', email: '' });
  const [reportLoading, setReportLoading] = useState(false);
  const [activeImage, setActiveImage] = useState(0);
  const [showStickyBar, setShowStickyBar] = useState(false);
  const donateRef = useRef(null);

  const { data: campaign, isLoading, error } = useQuery({
    queryKey: ['campaign', slug],
    queryFn: () => api.get(`/campaigns/${slug}`).then(r => r.data.campaign),
  });

  const { data: donationsData } = useQuery({
    queryKey: ['campaign-donations', campaign?.id],
    queryFn: () => api.get(`/donations/campaign/${campaign.id}?limit=10`).then(r => r.data),
    enabled: !!campaign?.id,
  });

  const { data: updatesData } = useQuery({
    queryKey: ['campaign-updates', campaign?.id],
    queryFn: () => api.get(`/campaigns/${campaign.id}/updates`).then(r => r.data.updates),
    enabled: !!campaign?.id,
  });

  useEffect(() => {
    const onScroll = () => {
      if (!donateRef.current) return;
      const rect = donateRef.current.getBoundingClientRect();
      setShowStickyBar(rect.bottom < 0);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleReport = async (e) => {
    e.preventDefault();
    setReportLoading(true);
    try {
      await api.post(`/campaigns/${campaign.id}/report`, reportData);
      setReportOpen(false);
      setReportData({ reason: '', details: '', email: '' });
    } catch {}
    setReportLoading(false);
  };

  const openDonate = (amount) => {
    setPresetAmount(amount || null);
    setShowModal(true);
  };

  if (isLoading) return (
    <div className="min-h-screen">
      <Navbar />
      <div className="flex items-center justify-center min-h-[70vh]"><LoadingSpinner size="lg" /></div>
      <Footer />
    </div>
  );

  if (error || !campaign) return (
    <div className="min-h-screen">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 py-32 text-center">
        <h1 className="text-2xl font-bold text-dark mb-2">Campaign Not Found</h1>
        <p className="text-gray-500 mb-6">This campaign may have been removed.</p>
        <Link to="/campaigns" className="bg-primary text-white px-6 py-3 rounded-full font-semibold">Browse Campaigns</Link>
      </div>
      <Footer />
    </div>
  );

  const pct = formatProgress(campaign.raised_amount, campaign.goal_amount);
  const images = [campaign.cover_image, ...(campaign.gallery || [])].filter(Boolean);
  const donations = donationsData?.donations || [];
  const updates = updatesData || [];
  const members = campaign.members || [];
  const milestones = campaign.milestones || [];
  const pledgeCount = campaign.pledge_count || 0;
  const pageUrl = typeof window !== 'undefined' ? window.location.href : '';

  return (
    <div className="min-h-screen bg-gray-50">
      <Helmet>
        <title>{campaign.title} | Giviit</title>
        <meta name="description" content={campaign.description || campaign.story?.substring(0, 160)} />
        <meta property="og:title" content={`Help ${campaign.title} | Giviit`} />
        <meta property="og:description" content={`${formatCurrency(campaign.raised_amount)} raised of ${formatCurrency(campaign.goal_amount)} goal. ${campaign.description || ''}`} />
        {campaign.cover_image && <meta property="og:image" content={campaign.cover_image} />}
        <meta property="og:url" content={pageUrl} />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`Help ${campaign.title}`} />
        <meta name="twitter:description" content={`${formatCurrency(campaign.raised_amount)} raised of ${formatCurrency(campaign.goal_amount)} goal.`} />
        {campaign.cover_image && <meta name="twitter:image" content={campaign.cover_image} />}
      </Helmet>

      <Navbar />

      {/* ── 1. FULL-WIDTH COVER IMAGE ── */}
      <div className="w-full pt-16 bg-gray-900 relative" style={{ height: 'clamp(280px, 45vw, 520px)' }}>
        {images.length > 0 ? (
          <img src={images[activeImage]} alt={campaign.title}
            className="w-full h-full object-cover opacity-90" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary/20 to-accent/20" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

        {/* Back link */}
        <div className="absolute top-4 left-4">
          <Link to="/campaigns"
            className="inline-flex items-center gap-1.5 bg-black/40 hover:bg-black/60 backdrop-blur-sm text-white text-sm font-semibold px-3 py-2 rounded-full transition-colors">
            <ArrowLeft size={16} /> Campaigns
          </Link>
        </div>

        {/* Gallery thumbnails */}
        {images.length > 1 && (
          <div className="absolute bottom-3 right-3 flex gap-1.5">
            {images.map((img, i) => (
              <button key={i} onClick={() => setActiveImage(i)}
                className={`w-12 h-12 rounded-lg overflow-hidden border-2 transition-all ${activeImage === i ? 'border-white' : 'border-white/30 opacity-60 hover:opacity-100'}`}>
                <img src={img} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── MAIN LAYOUT ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">

          {/* ── LEFT / MAIN COLUMN ── */}
          <div className="lg:col-span-2 space-y-5">

            {/* ── 2. TITLE + BADGES ── */}
            <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-gray-100">
              {/* Small badges row */}
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className="bg-gray-100 text-gray-600 text-[11px] font-bold px-2.5 py-1 rounded-full capitalize">
                  {campaign.category}
                </span>
                {campaign.is_verified && (
                  <span className="inline-flex items-center gap-1 bg-green-50 border border-green-200 text-green-700 text-[11px] font-bold px-2.5 py-1 rounded-full">
                    <BadgeCheck size={11} /> Verified
                  </span>
                )}
                {campaign.is_urgent && (
                  <span className="inline-flex items-center gap-1 bg-red-50 border border-red-200 text-red-600 text-[11px] font-bold px-2.5 py-1 rounded-full">
                    <Zap size={11} />
                    Urgent{campaign.urgency_reason ? ` — ${campaign.urgency_reason}` : ''}
                  </span>
                )}
                {campaign.is_birthday && (
                  <span className="inline-flex items-center gap-1 bg-pink-50 border border-pink-200 text-pink-700 text-[11px] font-bold px-2.5 py-1 rounded-full">
                    <Cake size={11} /> Birthday
                  </span>
                )}
                {campaign.guarantor_status === 'vouched' && (
                  <span className="bg-blue-50 border border-blue-200 text-blue-700 text-[11px] font-bold px-2.5 py-1 rounded-full">
                    Vouched
                  </span>
                )}
              </div>

              <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-dark leading-tight mb-1">
                {campaign.title}
              </h1>

              {campaign.description && (
                <p className="text-gray-500 text-sm leading-relaxed mt-2">{campaign.description}</p>
              )}
            </div>

            {/* ── 3. PROGRESS + STATS ── */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <div className="flex items-end justify-between mb-3">
                <div>
                  <p className="text-2xl sm:text-3xl font-black text-primary leading-none">
                    {formatCurrency(campaign.raised_amount)}
                  </p>
                  <p className="text-gray-400 text-sm mt-1">raised of {formatCurrency(campaign.goal_amount)} goal</p>
                </div>
                <span className="text-2xl font-black text-primary">{pct}%</span>
              </div>
              <ProgressBar percentage={pct} className="mb-3" urgent={campaign.is_urgent && !!campaign.urgency_deadline} />
              {pct >= 100 && (
                <p className="text-primary text-sm font-bold text-center mb-3">Goal Reached!</p>
              )}
              <div className="grid grid-cols-2 gap-3">
                <div className="text-center bg-gray-50 rounded-xl p-3">
                  <div className="flex items-center justify-center gap-1 text-gray-400 text-xs mb-1">
                    <Users size={13} /> Donors
                  </div>
                  <p className="font-black text-dark">{(campaign.donor_count || 0).toLocaleString()}</p>
                </div>
                <div className="text-center bg-gray-50 rounded-xl p-3">
                  <div className="flex items-center justify-center gap-1 text-gray-400 text-xs mb-1">
                    <Calendar size={13} /> Days Left
                  </div>
                  <p className="font-black text-dark text-sm">{formatDaysLeft(campaign.deadline)}</p>
                </div>
              </div>
            </div>

            {/* ── 4. DONATE + WHATSAPP ── */}
            <div ref={donateRef} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <button onClick={() => openDonate()}
                className="w-full bg-primary hover:bg-primary/90 text-white font-black py-4 rounded-xl text-base transition-colors shadow-md shadow-primary/20 mb-3">
                Donate Now
              </button>
              <p className="text-[11px] text-center text-gray-400 mb-4">Secured by Paystack · No amount is too small</p>
              <div className="flex gap-2 flex-wrap">
                <WhatsAppShareBtn campaign={campaign} />
                <CopyLinkBtn campaign={campaign} />
              </div>

              {/* Quick amounts */}
              <div className="flex gap-2 flex-wrap mt-4 pt-4 border-t border-gray-50">
                {[500, 1000, 2500, 5000, 10000].map(amt => (
                  <button key={amt} onClick={() => openDonate(amt)}
                    className="text-xs font-bold bg-gray-50 hover:bg-primary/10 hover:text-primary border border-gray-100 hover:border-primary/30 px-3 py-1.5 rounded-lg transition-all">
                    {formatCurrency(amt)}
                  </button>
                ))}
              </div>
            </div>

            {/* Birthday banner */}
            <BirthdayBanner campaign={campaign} />

            {/* Group campaign note */}
            {members.length > 0 && (
              <div className="bg-white rounded-2xl px-5 py-3.5 shadow-sm border border-gray-100 flex items-center gap-3">
                <Users2 size={20} className="text-primary flex-shrink-0" />
                <p className="text-sm text-gray-600">
                  <span className="font-bold text-dark">{members.length + 1} people</span> are fundraising together for this campaign
                </p>
              </div>
            )}

            {/* Guarantor badge */}
            {campaign.guarantor_status === 'vouched' && <GuarantorBadge campaign={campaign} />}

            {/* ── 5. STORY ── */}
            {campaign.story && (
              <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm">
                <h2 className="text-lg font-bold text-dark mb-4">Campaign Story</h2>
                <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: campaign.story }} />
              </div>
            )}

            {/* ── 6. MILESTONES ── */}
            {milestones.length > 0 && (
              <MilestoneTracker milestones={milestones} raised={campaign.raised_amount} />
            )}

            {/* ── 7. PRAYER WALL ── */}
            {campaign.prayer_wall_enabled && donations.some(d => d.prayer && d.show_prayer !== false) && (
              <PrayerWall donations={donations} />
            )}

            {/* ── 8. UPDATES ── */}
            {updates.length > 0 && (
              <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm">
                <h2 className="text-lg font-bold text-dark mb-4">Campaign Updates</h2>
                <div className="space-y-4">
                  {updates.map(update => (
                    <div key={update.id} className="border-l-2 border-primary pl-4 py-1">
                      <p className="font-semibold text-dark">{update.title}</p>
                      <p className="text-gray-400 text-xs mb-2">{formatTimeAgo(update.created_at)}</p>
                      <p className="text-gray-600 text-sm">{update.content}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Pledge counter */}
            {pledgeCount > 0 && (
              <div className="bg-white rounded-2xl px-5 py-4 shadow-sm border border-primary/10 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center flex-shrink-0">
                  <Users size={18} className="text-white" />
                </div>
                <p className="text-sm text-gray-600">
                  <span className="font-bold text-dark">{pledgeCount} people</span> have pledged instalment support for this campaign
                </p>
              </div>
            )}

            {/* ── 9. DONORS ── */}
            <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm">
              <h2 className="text-lg font-bold text-dark mb-4">Recent Donors ({campaign.donor_count || 0})</h2>
              {donations.length === 0 ? (
                <p className="text-gray-400 text-sm text-center py-4">Be the first to donate!</p>
              ) : (
                <div className="space-y-3">
                  {donations.map(d => (
                    <div key={d.id} className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
                      <div className="w-9 h-9 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-primary font-bold text-sm">
                          {d.is_anonymous ? 'A' : d.donor_name?.charAt(0)?.toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <p className="font-medium text-sm text-dark">{d.is_anonymous ? 'Anonymous' : d.donor_name}</p>
                          {d.donor_country && d.donor_currency !== 'NGN' && (
                            <span className="text-[10px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded-full font-semibold border border-blue-100">
                              {d.donor_country}
                            </span>
                          )}
                          {d.is_offline && (
                            <span className="text-[10px] bg-amber-50 text-amber-600 px-1.5 py-0.5 rounded-full font-semibold border border-amber-100">
                              Cash
                            </span>
                          )}
                        </div>
                        {d.message && <p className="text-gray-400 text-xs truncate mt-0.5">{d.message}</p>}
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-primary font-bold text-sm">{formatCurrency(d.amount)}</p>
                        <p className="text-gray-400 text-xs">{formatTimeAgo(d.created_at)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Diaspora leaderboard */}
            {donations.some(d => d.donor_country && d.donor_currency !== 'NGN') && (
              <DiasporaLeaderboard donations={donations} />
            )}

            {/* Report */}
            <div className="text-center">
              <button onClick={() => setReportOpen(!reportOpen)}
                className="inline-flex items-center gap-1 text-gray-400 hover:text-red-500 text-sm transition-colors">
                <Flag size={14} /> Report this campaign
              </button>
              {reportOpen && (
                <form onSubmit={handleReport}
                  className="mt-4 bg-white rounded-2xl p-5 text-left shadow-sm space-y-3">
                  <h3 className="font-semibold text-dark">Report Campaign</h3>
                  <input type="email" required placeholder="Your email" value={reportData.email}
                    onChange={e => setReportData(p => ({ ...p, email: e.target.value }))}
                    className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl text-sm focus:border-primary outline-none" />
                  <select required value={reportData.reason}
                    onChange={e => setReportData(p => ({ ...p, reason: e.target.value }))}
                    className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl text-sm focus:border-primary outline-none bg-white">
                    <option value="">Select a reason</option>
                    <option value="fraud">Suspected Fraud</option>
                    <option value="misleading">Misleading Information</option>
                    <option value="inappropriate">Inappropriate Content</option>
                    <option value="other">Other</option>
                  </select>
                  <textarea placeholder="Additional details..." rows={3} value={reportData.details}
                    onChange={e => setReportData(p => ({ ...p, details: stripEmoji(e.target.value) }))}
                    className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl text-sm focus:border-primary outline-none resize-none" />
                  <div className="flex gap-2">
                    <button type="submit" disabled={reportLoading}
                      className="bg-red-500 text-white px-5 py-2 rounded-lg text-sm font-semibold disabled:opacity-50">
                      {reportLoading ? 'Sending...' : 'Submit Report'}
                    </button>
                    <button type="button" onClick={() => setReportOpen(false)}
                      className="bg-gray-100 text-gray-700 px-5 py-2 rounded-lg text-sm font-semibold">
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>

          {/* ── RIGHT SIDEBAR ── */}
          <div className="lg:col-span-1">
            <div className="sticky top-20 space-y-4">

              {/* Creator info */}
              {campaign.creator && (
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                  <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-3">Campaign Creator</p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      {campaign.creator.avatar_url
                        ? <img src={campaign.creator.avatar_url} alt="" className="w-10 h-10 rounded-full object-cover" />
                        : <span className="text-primary font-bold">{campaign.creator.full_name?.charAt(0)}</span>
                      }
                    </div>
                    <div>
                      <p className="font-semibold text-dark text-sm">{campaign.creator.full_name}</p>
                      {campaign.creator.bvn_verified && (
                        <span className="text-xs text-primary font-medium">Identity Verified</span>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Quick donate CTA (sidebar — only visible on desktop) */}
              <div className="hidden lg:block bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                <div className="mb-4">
                  <div className="flex justify-between items-end mb-2">
                    <div>
                      <p className="text-2xl font-black text-primary">{formatCurrency(campaign.raised_amount)}</p>
                      <p className="text-gray-400 text-sm">of {formatCurrency(campaign.goal_amount)}</p>
                    </div>
                    <span className="text-xl font-black text-primary">{pct}%</span>
                  </div>
                  <ProgressBar percentage={pct} className="mb-3"
                    urgent={campaign.is_urgent && !!campaign.urgency_deadline} />
                </div>
                <button onClick={() => openDonate()}
                  className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-3.5 rounded-xl text-sm transition-colors shadow-md shadow-primary/20 mb-2">
                  Donate Now
                </button>
                <p className="text-[11px] text-center text-gray-400 mb-3">Secured by Paystack</p>
                <div className="flex gap-2">
                  <WhatsAppShareBtn campaign={campaign} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── STICKY BOTTOM BAR (mobile + when donate scrolled out of view) ── */}
      {showStickyBar && (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-2xl px-4 py-3 flex items-center gap-3 safe-bottom">
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-dark truncate">{campaign.title}</p>
            <p className="text-xs text-primary font-bold">
              {formatCurrency(campaign.raised_amount)} raised · {pct}%
            </p>
          </div>
          <button onClick={() => openDonate()}
            className="flex-shrink-0 bg-primary hover:bg-primary/90 text-white font-black px-6 py-3 rounded-xl text-sm transition-colors shadow-md">
            Donate Now
          </button>
        </div>
      )}

      {showModal && (
        <DonationModal campaign={campaign} onClose={() => setShowModal(false)} presetAmount={presetAmount} />
      )}

      <SapaBanner campaign={campaign} onDonate={openDonate} />

      <Footer />
    </div>
  );
}
