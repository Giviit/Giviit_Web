import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { MdPeople, MdCalendarToday, MdFlag, MdArrowBack, MdGroups, MdCake } from 'react-icons/md';
import { stripEmoji } from '../utils/formatters';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ProgressBar from '../components/ProgressBar';
import VerifiedBadge from '../components/VerifiedBadge';
import UrgentBadge from '../components/UrgentBadge';
import ShareButtons from '../components/ShareButtons';
import DonationModal from '../components/DonationModal';
import LoadingSpinner from '../components/LoadingSpinner';
import PrayerWall from '../components/PrayerWall';
import MilestoneTracker from '../components/MilestoneTracker';
import GuarantorBadge from '../components/GuarantorBadge';
import DiasporaLeaderboard from '../components/DiasporaLeaderboard';
import SapaBanner from '../components/SapaBanner';
import { UrgencyBanner } from '../components/CountdownTimer';
import api from '../utils/api';
import { formatCurrency, formatDaysLeft, formatProgress, formatTimeAgo } from '../utils/formatters';

function BirthdayBanner({ campaign }) {
  if (!campaign.is_birthday || !campaign.birthday_date) return null;
  const today = new Date();
  const bday = new Date(campaign.birthday_date);
  const isToday = today.toDateString() === bday.toDateString();
  const diffDays = Math.ceil((bday - today) / (1000 * 60 * 60 * 24));

  return (
    <div className="rounded-2xl p-4 mb-4 border-2 border-pink-300 overflow-hidden relative" style={{ background: 'linear-gradient(135deg, #fdf2f8, #fce7f3)' }}>
      <div className="absolute -top-2 -right-2 opacity-20 select-none rotate-12">
        <MdCake className="text-5xl text-pink-400" />
      </div>
      <div className="relative flex items-center gap-3">
        <MdCake className="text-2xl text-pink-600 flex-shrink-0" />
        <div>
          <p className="font-black text-pink-800 text-sm">
            {isToday ? `Today is ${campaign.birthday_person_name}'s Birthday!` : `${campaign.birthday_person_name}'s Birthday in ${diffDays} day${diffDays !== 1 ? 's' : ''}`}
          </p>
          <p className="text-xs text-pink-600 mt-0.5">They asked for no gifts — just donate to their cause. What a beautiful way to celebrate!</p>
        </div>
      </div>
    </div>
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
    <div className="min-h-screen"><Navbar /><div className="flex items-center justify-center min-h-[70vh]"><LoadingSpinner size="lg" /></div><Footer /></div>
  );

  if (error || !campaign) return (
    <div className="min-h-screen"><Navbar />
      <div className="max-w-2xl mx-auto px-4 py-32 text-center">
        <h1 className="text-2xl font-bold text-dark mb-2">Campaign Not Found</h1>
        <p className="text-gray-500 mb-6">This campaign may have been removed.</p>
        <Link to="/campaigns" className="bg-primary text-white px-6 py-3 rounded-full font-semibold">Browse Campaigns</Link>
      </div><Footer /></div>
  );

  const pct = formatProgress(campaign.raised_amount, campaign.goal_amount);
  const images = [campaign.cover_image, ...(campaign.gallery || [])].filter(Boolean);
  const donations = donationsData?.donations || [];
  const updates = updatesData || [];
  const members = campaign.members || [];
  const milestones = campaign.milestones || [];
  const pledgeCount = campaign.pledge_count || 0;

  // Build birthday WhatsApp override
  const birthdayWhatsApp = campaign.is_birthday
    ? `It's ${campaign.birthday_person_name}'s birthday! They asked for no gifts — just donate to their cause. Let's make it special: ${window.location.href}`
    : null;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="pt-20 pb-4 bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link to="/campaigns" className="inline-flex items-center gap-1 text-gray-500 hover:text-primary text-sm transition-colors">
            <MdArrowBack /> Back to campaigns
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-5">

            {/* Urgency banner */}
            {campaign.is_urgent && campaign.urgency_deadline && (
              <UrgencyBanner campaign={campaign} />
            )}

            {/* Birthday banner */}
            <BirthdayBanner campaign={campaign} />

            {/* Group campaign note */}
            {members.length > 0 && (
              <div className="bg-white rounded-2xl px-5 py-3.5 shadow-sm border border-gray-100 flex items-center gap-3">
                <MdGroups className="text-primary text-xl flex-shrink-0" />
                <p className="text-sm text-gray-600">
                  <span className="font-bold text-dark">{members.length + 1} people</span> are fundraising together for this campaign
                </p>
              </div>
            )}

            {/* Image Gallery */}
            <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
              <div className="relative h-[340px] sm:h-[440px] bg-gray-100">
                {images.length > 0 ? (
                  <img src={images[activeImage]} alt={campaign.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center">
                    <span className="text-gray-400">No image</span>
                  </div>
                )}
                <div className="absolute top-4 left-4 flex gap-2 flex-wrap">
                  <span className="bg-white/90 backdrop-blur-sm text-gray-700 text-xs px-3 py-1 rounded-full capitalize font-medium">
                    {campaign.category}
                  </span>
                  {campaign.is_verified && <VerifiedBadge />}
                  {campaign.is_urgent && <UrgentBadge />}
                  {campaign.is_birthday && (
                    <span className="bg-pink-100 text-pink-700 text-xs px-3 py-1 rounded-full font-semibold inline-flex items-center gap-1">
                      <MdCake className="text-sm" /> Birthday
                    </span>
                  )}
                </div>
              </div>
              {images.length > 1 && (
                <div className="flex gap-2 p-3 overflow-x-auto scrollbar-hide">
                  {images.map((img, i) => (
                    <button key={i} onClick={() => setActiveImage(i)}
                      className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${activeImage === i ? 'border-primary' : 'border-transparent opacity-60 hover:opacity-100'}`}>
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Title & share */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h1 className="text-2xl sm:text-3xl font-black text-dark leading-tight mb-3">
                {campaign.is_birthday && <MdCake className="inline mr-2 text-pink-500" />}
                {campaign.title}
              </h1>
              {campaign.description && <p className="text-gray-600 leading-relaxed mb-4">{campaign.description}</p>}
              <ShareButtons campaign={campaign} customWhatsApp={birthdayWhatsApp} />
            </div>

            {/* Guarantor badge */}
            {campaign.guarantor_status === 'vouched' && <GuarantorBadge campaign={campaign} />}

            {/* Story */}
            {campaign.story && (
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <h2 className="text-lg font-bold text-dark mb-4">Campaign Story</h2>
                <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{ __html: campaign.story }} />
              </div>
            )}

            {/* Milestones */}
            {milestones.length > 0 && (
              <MilestoneTracker milestones={milestones} raised={campaign.raised_amount} />
            )}

            {/* Updates */}
            {updates.length > 0 && (
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <h2 className="text-lg font-bold text-dark mb-4">Campaign Updates</h2>
                <div className="space-y-4">
                  {updates.map(update => (
                    <div key={update.id} className="border-l-2 border-primary pl-4 py-1">
                      <p className="font-semibold text-dark">{update.title}</p>
                      <p className="text-gray-500 text-xs mb-2">{formatTimeAgo(update.created_at)}</p>
                      <p className="text-gray-600 text-sm">{update.content}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Pledge counter */}
            {pledgeCount > 0 && (
              <div className="bg-white rounded-2xl px-5 py-4 shadow-sm border border-primary/10 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center icon-purple flex-shrink-0">
                  <MdPeople className="text-white text-lg" />
                </div>
                <p className="text-sm text-gray-600">
                  <span className="font-bold text-dark">{pledgeCount} people</span> have pledged installment support for this campaign
                </p>
              </div>
            )}

            {/* Donors */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h2 className="text-lg font-bold text-dark mb-4">Recent Donors ({campaign.donor_count || 0})</h2>
              {donations.length === 0 ? (
                <p className="text-gray-400 text-sm text-center py-4">Be the first to donate!</p>
              ) : (
                <div className="space-y-3">
                  {donations.map(d => (
                    <div key={d.id} className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
                      <div className="w-9 h-9 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-primary font-bold text-sm">{d.is_anonymous ? 'A' : d.donor_name?.charAt(0)?.toUpperCase()}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <p className="font-medium text-sm text-dark">{d.is_anonymous ? 'Anonymous' : d.donor_name}</p>
                          {d.donor_country && d.donor_currency !== 'NGN' && (
                            <span className="text-[10px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded-full font-semibold border border-blue-100">
                              {d.donor_country}
                            </span>
                          )}
                          {d.is_offline && <span className="text-[10px] bg-amber-50 text-amber-600 px-1.5 py-0.5 rounded-full font-semibold border border-amber-100">Cash</span>}
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

            {/* Prayer Wall — only shown when creator enabled it */}
            {campaign.prayer_wall_enabled && donations.some(d => d.prayer && d.show_prayer !== false) && (
              <PrayerWall donations={donations} />
            )}

            {/* Diaspora */}
            {donations.some(d => d.donor_country && d.donor_currency !== 'NGN') && (
              <DiasporaLeaderboard donations={donations} />
            )}

            {/* Report */}
            <div className="text-center">
              <button onClick={() => setReportOpen(!reportOpen)}
                className="inline-flex items-center gap-1 text-gray-400 hover:text-red-500 text-sm transition-colors">
                <MdFlag className="text-sm" /> Report this campaign
              </button>
              {reportOpen && (
                <form onSubmit={handleReport} className="mt-4 bg-white rounded-2xl p-5 text-left shadow-sm space-y-3">
                  <h3 className="font-semibold text-dark">Report Campaign</h3>
                  <input type="email" required placeholder="Your email" value={reportData.email}
                    onChange={e => setReportData(p => ({ ...p, email: e.target.value }))}
                    className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl text-sm focus:border-primary outline-none" />
                  <select required value={reportData.reason} onChange={e => setReportData(p => ({ ...p, reason: e.target.value }))}
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
                    <button type="submit" disabled={reportLoading} className="bg-red-500 text-white px-5 py-2 rounded-lg text-sm font-semibold disabled:opacity-50">
                      {reportLoading ? 'Sending...' : 'Submit Report'}
                    </button>
                    <button type="button" onClick={() => setReportOpen(false)} className="bg-gray-100 text-gray-700 px-5 py-2 rounded-lg text-sm font-semibold">Cancel</button>
                  </div>
                </form>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-20 space-y-4">
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <div className="mb-4">
                  <div className="flex justify-between items-end mb-2">
                    <div>
                      <p className="text-3xl font-black text-primary">{formatCurrency(campaign.raised_amount)}</p>
                      <p className="text-gray-400 text-sm">raised of {formatCurrency(campaign.goal_amount)} goal</p>
                    </div>
                    <span className="text-2xl font-black text-primary">{pct}%</span>
                  </div>
                  <ProgressBar percentage={pct}
                    className="mb-3"
                    urgent={campaign.is_urgent && !!campaign.urgency_deadline} />
                  {pct >= 100 && <p className="text-primary text-sm font-bold text-center">Goal Reached!</p>}
                </div>

                <div className="grid grid-cols-2 gap-3 mb-5">
                  <div className="text-center bg-gray-50 rounded-xl p-3">
                    <div className="flex items-center justify-center gap-1 text-gray-500 text-xs mb-1"><MdPeople className="text-sm" /> Donors</div>
                    <p className="font-black text-dark">{campaign.donor_count || 0}</p>
                  </div>
                  <div className="text-center bg-gray-50 rounded-xl p-3">
                    <div className="flex items-center justify-center gap-1 text-gray-500 text-xs mb-1"><MdCalendarToday className="text-sm" /> Days Left</div>
                    <p className="font-black text-dark text-sm">{formatDaysLeft(campaign.deadline)}</p>
                  </div>
                </div>

                <button onClick={() => openDonate()}
                  className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-4 rounded-xl text-base transition-colors shadow-md shadow-primary/20">
                  Donate Now
                </button>
                <p className="text-[11px] text-center text-gray-400 mt-2">No amount is too small</p>

                <div className="mt-4">
                  <p className="text-xs text-gray-400 text-center mb-3 font-medium">Share this campaign</p>
                  <ShareButtons campaign={campaign} customWhatsApp={birthdayWhatsApp} />
                </div>
              </div>

              {/* Creator info */}
              {campaign.creator && (
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                  <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-3">Campaign Creator</p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      {campaign.creator.avatar_url
                        ? <img src={campaign.creator.avatar_url} alt="" className="w-10 h-10 rounded-full object-cover" />
                        : <span className="text-primary font-bold">{campaign.creator.full_name?.charAt(0)}</span>}
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
            </div>
          </div>
        </div>
      </div>

      {showModal && (
        <DonationModal campaign={campaign} onClose={() => setShowModal(false)} presetAmount={presetAmount} />
      )}

      <SapaBanner campaign={campaign} onDonate={openDonate} />

      <Footer />
    </div>
  );
}
