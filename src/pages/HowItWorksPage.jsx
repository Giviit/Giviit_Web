import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  MdVerified, MdPayment, MdAccountBalance, MdShield, MdPeople,
  MdEdit, MdCampaign, MdArrowForward, MdCheckCircle, MdShare,
  MdExpandMore, MdBolt, MdSecurity, MdFingerprint, MdSearch,
} from 'react-icons/md';
import { GiPrayerBeads } from 'react-icons/gi';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

/* ─── Data ─────────────────────────────────────────────────────────── */
const CREATOR_STEPS = [
  {
    num: '01',
    icon: MdEdit,
    iconBg: 'bg-blue-50',
    iconColor: 'text-blue-600',
    accentBg: 'bg-blue-600',
    title: 'Create Your Campaign',
    desc: 'Fill out your campaign details — title, story, goal amount, and deadline. Add photos and break your goal into milestones so donors see exactly where every naira goes.',
    callout: '⏱ Most campaigns go live in under 5 minutes',
  },
  {
    num: '02',
    icon: MdFingerprint,
    iconBg: 'bg-green-50',
    iconColor: 'text-green-600',
    accentBg: 'bg-green-600',
    title: 'Identity Verification',
    desc: 'Submit your NIN or BVN for a one-time identity check. Our team reviews your documents within 24–48 hours and issues the "Verified" badge — the mark donors trust most.',
    callout: '✓ Verified within 24–48 business hours',
  },
  {
    num: '03',
    icon: MdShare,
    iconBg: 'bg-purple-50',
    iconColor: 'text-purple-600',
    accentBg: 'bg-purple-600',
    title: 'Share Your Campaign Link',
    desc: 'Every campaign gets a clean shareable link the moment it goes live. Send it directly to your network on any platform or messaging app — personal outreach converts far better than broadcasts.',
    callout: '🔗 One link works everywhere',
  },
  {
    num: '04',
    icon: MdAccountBalance,
    iconBg: 'bg-amber-50',
    iconColor: 'text-amber-600',
    accentBg: 'bg-amber-500',
    title: 'Receive Your Funds',
    desc: "You don't need to reach your goal to withdraw. Request a payout at any time — funds go directly into your verified Nigerian bank account after a brief review.",
    callout: '🏦 Payout processed within 1–3 business days',
  },
];

const DONOR_STEPS = [
  {
    num: '01',
    icon: MdSearch,
    iconBg: 'bg-pink-50',
    iconColor: 'text-pink-600',
    accentBg: 'bg-pink-600',
    title: 'Discover a Campaign',
    desc: 'Browse hundreds of verified campaigns by category — medical, education, emergency, community, business, and more. Filter by urgency, location, or funding progress to find causes you care about.',
    callout: '📂 8 categories · Hundreds of live campaigns',
  },
  {
    num: '02',
    icon: MdShield,
    iconBg: 'bg-green-50',
    iconColor: 'text-green-600',
    accentBg: 'bg-green-600',
    title: "Verify It's Legitimate",
    desc: 'Look for the green Verified badge (identity confirmed by our team) and the Vouched badge (a named guarantor has publicly endorsed the creator). Read the story, check campaign updates, and review milestones.',
    callout: '🛡 Every creator is manually reviewed',
  },
  {
    num: '03',
    icon: MdPayment,
    iconBg: 'bg-blue-50',
    iconColor: 'text-blue-600',
    accentBg: 'bg-blue-600',
    title: 'Donate Securely via Paystack',
    desc: 'Give any amount — even ₦100 — via Paystack. Your card and bank details go directly to Paystack; Giviit never stores payment data. An email receipt arrives in your inbox the moment the payment clears.',
    callout: '💳 Minimum donation: ₦100 · Receipt instant',
  },
  {
    num: '04',
    icon: GiPrayerBeads,
    iconBg: 'bg-amber-50',
    iconColor: 'text-amber-600',
    accentBg: 'bg-amber-500',
    title: 'Leave a Message or Prayer',
    desc: 'After donating, leave an encouraging message or prayer for the campaign. It appears on the public Prayer Wall — visible to the creator and other donors. You can also choose to give anonymously.',
    callout: '🙏 Anonymous giving is supported',
  },
];

const BADGES = [
  {
    icon: MdVerified,
    bg: 'bg-green-100',
    color: 'text-green-700',
    border: 'border-green-200',
    label: 'Verified',
    desc: 'Identity documents confirmed by our team. The creator is who they claim to be.',
  },
  {
    icon: MdPeople,
    bg: 'bg-blue-100',
    color: 'text-blue-700',
    border: 'border-blue-200',
    label: 'Vouched',
    desc: 'A named guarantor — doctor, pastor, employer, or community leader — has publicly endorsed this campaign.',
  },
  {
    icon: MdBolt,
    bg: 'bg-red-100',
    color: 'text-red-600',
    border: 'border-red-200',
    label: 'Urgent',
    desc: 'Creator has indicated a time-sensitive need. A live countdown shows the urgency deadline.',
  },
];

const FAQS = [
  {
    q: 'What fees does Giviit charge?',
    a: 'Giviit charges a 5% platform fee on each donation received. Paystack separately charges approximately 1.5% + ₦100 per transaction (capped at ₦2,000 for local cards). There are no sign-up fees, listing fees, or hidden charges.',
  },
  {
    q: 'How long does identity verification take?',
    a: 'Identity verification is completed within 24–48 business hours. You will receive an email the moment your campaign is verified and live. Submissions with clear, legible documents are usually processed fastest.',
  },
  {
    q: 'Can I withdraw before reaching my goal?',
    a: 'Yes — there is no requirement to hit your goal before requesting a payout. You can withdraw any amount raised at any time. Our team reviews each withdrawal request within 24 hours before releasing funds.',
  },
  {
    q: 'What happens if a campaign turns out to be fraudulent?',
    a: 'Any visitor can report a campaign using the "Report" button on the campaign page. We investigate within 24 hours. If fraud is confirmed, the campaign is suspended, the creator\'s account is closed, and affected donors are refunded.',
  },
  {
    q: 'Is there a minimum or maximum donation?',
    a: 'The minimum donation is ₦100. There is no maximum. International donors can give in GBP, USD, CAD, EUR, or AUD — converted to Naira at the prevailing exchange rate. Donors receive a receipt in their local currency.',
  },
  {
    q: 'Can I donate anonymously?',
    a: 'Yes. Check the "Donate anonymously" option in the donation form. Your name is hidden from the public donor list and the campaign creator, though your email is retained for our fraud-prevention records.',
  },
  {
    q: "What is a Pledge and how is it different from a donation?",
    a: 'A Pledge is an instalment commitment. Instead of giving ₦10,000 at once, you commit to 5 monthly payments of ₦2,000. Pledge reminders are sent by email before each instalment. You can cancel a future instalment at any time.',
  },
  {
    q: 'Can I run a campaign as a group or organisation?',
    a: 'Yes. Use the Ajo Mode (co-owner) feature to add team members to your campaign. All co-owners can post updates and monitor donations — but only the primary creator can submit withdrawal requests.',
  },
];

/* ─── Helpers ─────────────────────────────────────────────────────── */
function fmtNaira(n) {
  if (n >= 1_000_000) return '₦' + (n / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
  if (n >= 1_000) return '₦' + Math.round(n / 1_000) + 'k';
  return '₦' + n.toLocaleString();
}

function calcFees(goal) {
  const platformFee = Math.round(goal * 0.05);
  const paystack = Math.min(Math.round(goal * 0.015 + 100), 2000);
  return { platformFee, paystack, net: goal - platformFee - paystack };
}

/* ─── Sub-components ──────────────────────────────────────────────── */
function StepRow({ step, index, last }) {
  return (
    <div className="flex gap-6 sm:gap-10 relative">
      {/* Left: number + vertical connector */}
      <div className="flex flex-col items-center flex-shrink-0 w-14">
        <div className={`w-14 h-14 rounded-2xl ${step.iconBg} flex items-center justify-center shadow-sm`}>
          <step.icon className={`${step.iconColor} text-2xl`} />
        </div>
        {!last && <div className="w-px flex-1 bg-gray-100 mt-3 mb-0 min-h-8" />}
      </div>

      {/* Right: content */}
      <div className={`flex-1 ${!last ? 'pb-12' : ''}`}>
        <div className="flex items-start gap-4 mb-2">
          <span
            className="font-black text-gray-100 leading-none select-none flex-shrink-0 hidden sm:block"
            style={{ fontSize: '3rem', lineHeight: 1, marginTop: '-4px' }}
          >
            {step.num}
          </span>
          <div>
            <h3 className="font-black text-dark text-lg leading-snug">{step.title}</h3>
            <p className="text-gray-500 text-sm leading-relaxed mt-1.5 max-w-xl">{step.desc}</p>
            <span className="inline-block mt-3 text-xs font-semibold text-gray-400 bg-gray-50 border border-gray-100 px-3 py-1.5 rounded-full">
              {step.callout}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function FaqItem({ faq, open, onToggle }) {
  return (
    <div className="border border-gray-200 rounded-2xl overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full text-left px-6 py-5 flex items-center justify-between gap-4 hover:bg-gray-50 transition-colors"
      >
        <span className="font-bold text-dark text-sm sm:text-base leading-snug pr-2">{faq.q}</span>
        <MdExpandMore
          className={`text-gray-400 text-xl flex-shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>
      {open && (
        <div className="px-6 pb-5 text-gray-500 text-sm leading-relaxed border-t border-gray-100 pt-4">
          {faq.a}
        </div>
      )}
    </div>
  );
}

/* ─── Page ─────────────────────────────────────────────────────────── */
export default function HowItWorksPage() {
  const [tab, setTab] = useState('creator');
  const [openFaq, setOpenFaq] = useState(null);
  const [goal, setGoal] = useState(100000);

  const { platformFee, paystack, net } = calcFees(goal);
  const keepPct = Math.round((net / goal) * 100);

  const steps = tab === 'creator' ? CREATOR_STEPS : DONOR_STEPS;

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      <Navbar />

      {/* ── HERO ── */}
      <section className="bg-dark relative overflow-hidden pt-16">
        {/* Dot matrix bg */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.06]"
          style={{ backgroundImage: 'radial-gradient(circle, #f5a623 1px, transparent 1px)', backgroundSize: '32px 32px' }}
        />
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-dark to-transparent" />

        <div className="relative max-w-4xl mx-auto px-6 sm:px-10 py-24 sm:py-32 text-center">
          <span className="inline-flex items-center gap-2 bg-white/10 border border-white/15 text-white/70 text-xs font-black px-4 py-1.5 rounded-full mb-8 uppercase tracking-widest">
            How It Works
          </span>

          <h1 className="font-black text-white mb-5 leading-[1.05]" style={{ fontSize: 'clamp(2.6rem, 7vw, 5rem)', letterSpacing: '-0.03em' }}>
            Simple, Transparent,
            <br />
            <span className="text-accent">Built for Nigeria</span>
          </h1>

          <p className="text-gray-400 text-lg sm:text-xl max-w-2xl mx-auto leading-relaxed mb-10">
            Giviit connects people who need help with people who want to help — securely, transparently, and entirely in Naira.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/register"
              className="inline-flex items-center justify-center gap-2 bg-accent hover:bg-accent/90 text-white font-bold px-8 py-4 rounded-full transition-all hover:scale-105 shadow-lg shadow-accent/20"
            >
              Start a Campaign <MdArrowForward />
            </Link>
            <Link
              to="/campaigns"
              className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/15 border border-white/20 text-white font-semibold px-8 py-4 rounded-full transition-all"
            >
              Browse Campaigns
            </Link>
          </div>

          {/* Stats strip */}
          <div className="flex flex-wrap justify-center gap-8 mt-16 pt-10 border-t border-white/10">
            {[
              { v: '₦2.4B+', l: 'Total Raised' },
              { v: '14,200+', l: 'Campaigns Funded' },
              { v: '24–48 hrs', l: 'Avg. Verification Time' },
              { v: '5%', l: 'Platform Fee Only' },
            ].map(({ v, l }) => (
              <div key={l} className="text-center">
                <p className="font-black text-accent text-2xl leading-none">{v}</p>
                <p className="text-gray-500 text-xs mt-1">{l}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── JOURNEY TABS ── */}
      <section className="py-24 bg-white">
        <div className="max-w-3xl mx-auto px-6 sm:px-10">

          {/* Tab switcher */}
          <div className="flex justify-center mb-16">
            <div className="bg-gray-100 rounded-2xl p-1.5 flex gap-1.5 w-full sm:w-auto">
              {[
                { id: 'creator', label: 'For Campaign Creators' },
                { id: 'donor', label: 'For Donors' },
              ].map(({ id, label }) => (
                <button
                  key={id}
                  onClick={() => setTab(id)}
                  className={`flex-1 sm:flex-initial px-6 py-3 rounded-xl text-sm font-bold transition-all ${
                    tab === id
                      ? 'bg-dark text-white shadow-md'
                      : 'text-gray-500 hover:text-dark'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Tab intro */}
          <div className="mb-12">
            <h2 className="font-black text-dark text-2xl sm:text-3xl mb-2">
              {tab === 'creator' ? 'Launch your campaign in minutes.' : 'Give confidently, every time.'}
            </h2>
            <p className="text-gray-500">
              {tab === 'creator'
                ? 'Start receiving support from your very first share.'
                : 'Your money goes exactly where it should.'}
            </p>
          </div>

          {/* Steps */}
          <div>
            {steps.map((step, i) => (
              <StepRow key={step.num} step={step} index={i} last={i === steps.length - 1} />
            ))}
          </div>

          <div className="mt-8">
            <Link
              to="/register"
              className={`inline-flex items-center gap-2 font-bold px-7 py-3.5 rounded-full transition-all hover:scale-105 text-sm ${
                tab === 'creator'
                  ? 'bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20'
                  : 'bg-accent hover:bg-accent/90 text-white shadow-lg shadow-accent/20'
              }`}
            >
              {tab === 'creator' ? 'Start Your Campaign' : 'Find a Campaign to Support'}
              <MdArrowForward />
            </Link>
          </div>
        </div>
      </section>

      {/* ── FEE CALCULATOR ── */}
      <section className="py-24 bg-dark">
        <div className="max-w-3xl mx-auto px-6 sm:px-10">
          <div className="mb-12">
            <p className="text-accent text-xs font-black uppercase tracking-widest mb-3">Transparent Pricing</p>
            <h2 className="font-black text-white text-3xl sm:text-4xl leading-tight">
              Zero surprises.
              <br />
              Here's exactly what we charge.
            </h2>
            <p className="text-gray-400 mt-3">
              Move the slider to see how fees break down for any campaign goal.
            </p>
          </div>

          {/* Slider */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-8 mb-6">
            <div className="flex items-end justify-between mb-4">
              <span className="text-white/60 text-sm font-semibold">Campaign goal</span>
              <span className="font-black text-white text-2xl">{fmtNaira(goal)}</span>
            </div>
            <input
              type="range"
              min={10000}
              max={5000000}
              step={5000}
              value={goal}
              onChange={e => setGoal(Number(e.target.value))}
              className="w-full h-2 bg-white/10 rounded-full appearance-none cursor-pointer accent-accent"
            />
            <div className="flex justify-between text-white/30 text-xs mt-2">
              <span>₦10k</span>
              <span>₦5M</span>
            </div>
          </div>

          {/* Breakdown */}
          <div className="space-y-3">
            {/* Goal row */}
            <div className="bg-white/5 border border-white/10 rounded-xl px-6 py-4 flex justify-between items-center">
              <div>
                <p className="text-white font-semibold text-sm">Campaign goal</p>
                <p className="text-white/40 text-xs mt-0.5">Amount you're raising</p>
              </div>
              <span className="font-black text-white text-lg">{fmtNaira(goal)}</span>
            </div>

            {/* Giviit fee */}
            <div className="bg-white/5 border border-white/10 rounded-xl px-6 py-4 flex justify-between items-center">
              <div>
                <p className="text-white/70 font-semibold text-sm">Giviit platform fee</p>
                <p className="text-white/30 text-xs mt-0.5">5% of donations received</p>
              </div>
              <span className="font-bold text-red-400 text-base">− {fmtNaira(platformFee)}</span>
            </div>

            {/* Paystack fee */}
            <div className="bg-white/5 border border-white/10 rounded-xl px-6 py-4 flex justify-between items-center">
              <div>
                <p className="text-white/70 font-semibold text-sm">Paystack processing</p>
                <p className="text-white/30 text-xs mt-0.5">~1.5% + ₦100 per transaction (capped ₦2k)</p>
              </div>
              <span className="font-bold text-red-400 text-base">− {fmtNaira(paystack)}</span>
            </div>

            {/* You receive */}
            <div className="bg-accent/15 border border-accent/30 rounded-xl px-6 py-5 flex justify-between items-center">
              <div>
                <p className="text-white font-black text-base">You receive</p>
                <p className="text-accent/70 text-xs mt-0.5">{keepPct}% of your campaign goal</p>
              </div>
              <span className="font-black text-accent text-2xl">{fmtNaira(net)}</span>
            </div>
          </div>

          <p className="text-white/25 text-xs mt-5 leading-relaxed">
            * Paystack fee per donation — actual total depends on number of individual transactions. Caps apply for local debit/credit cards. International cards may attract higher Paystack rates.
          </p>
        </div>
      </section>

      {/* ── TRUST & SAFETY ── */}
      <section className="py-24 bg-[#f9f6f1]">
        <div className="max-w-5xl mx-auto px-6 sm:px-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">

            {/* Left */}
            <div>
              <p className="text-primary text-xs font-black uppercase tracking-widest mb-4">Trust & Safety</p>
              <h2 className="font-black text-dark text-3xl sm:text-4xl leading-tight mb-5">
                We verify every creator.
                <br />
                Every single one.
              </h2>
              <p className="text-gray-500 leading-relaxed mb-8">
                Before any campaign goes live on Giviit, the creator must submit a government-issued ID, their BVN or NIN, and a live selfie. Our team manually reviews every submission — no campaign gets a Verified badge without human eyes on it.
              </p>

              <ul className="space-y-4">
                {[
                  { icon: MdCheckCircle, text: 'NIN or BVN cross-checked against NIBSS' },
                  { icon: MdCheckCircle, text: 'Guarantor system — real people vouching publicly' },
                  { icon: MdCheckCircle, text: 'Withdrawal funds reviewed before each release' },
                  { icon: MdCheckCircle, text: 'Every flagged campaign reviewed within 24 hours' },
                  { icon: MdCheckCircle, text: 'Confirmed fraud cases referred to the EFCC' },
                ].map(({ icon: Icon, text }) => (
                  <li key={text} className="flex items-start gap-3 text-sm text-gray-700">
                    <Icon className="text-primary text-lg flex-shrink-0 mt-0.5" />
                    {text}
                  </li>
                ))}
              </ul>
            </div>

            {/* Right — badge cards */}
            <div>
              <h3 className="font-bold text-dark text-base mb-5">What our campaign badges mean</h3>
              <div className="space-y-4">
                {BADGES.map(({ icon: Icon, bg, color, border, label, desc }) => (
                  <div key={label} className={`flex gap-4 bg-white border ${border} rounded-2xl p-5`}>
                    <div className={`w-11 h-11 ${bg} rounded-xl flex items-center justify-center flex-shrink-0`}>
                      <Icon className={`${color} text-xl`} />
                    </div>
                    <div>
                      <p className="font-bold text-dark text-sm mb-1">{label}</p>
                      <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Review timeline */}
              <div className="mt-6 bg-dark rounded-2xl p-6">
                <p className="text-white/60 text-xs font-black uppercase tracking-widest mb-4">Verification Timeline</p>
                <div className="flex items-center gap-0">
                  {[
                    { label: 'Submit ID', sub: 'Day 0' },
                    { label: 'Manual review', sub: '24–48 hrs' },
                    { label: 'Verified & Live', sub: 'Badge issued' },
                  ].map(({ label, sub }, i) => (
                    <div key={label} className="flex items-center flex-1 min-w-0">
                      <div className="flex flex-col items-center min-w-0 flex-1">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black mb-2 ${i === 2 ? 'bg-primary text-white' : 'bg-white/10 text-white/60'}`}>
                          {i + 1}
                        </div>
                        <p className="text-white text-[11px] font-semibold text-center leading-snug">{label}</p>
                        <p className="text-white/30 text-[10px] text-center mt-0.5">{sub}</p>
                      </div>
                      {i < 2 && <div className="h-px bg-white/10 flex-1 mx-1 mb-6" />}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="py-24 bg-white">
        <div className="max-w-3xl mx-auto px-6 sm:px-10">
          <div className="text-center mb-14">
            <p className="text-primary text-xs font-black uppercase tracking-widest mb-3">FAQ</p>
            <h2 className="font-black text-dark text-3xl sm:text-4xl leading-tight">Everything you need to know</h2>
            <p className="text-gray-500 mt-3">Still have questions? Email us at <a href="mailto:support@giviit.ng" className="text-primary hover:underline">support@giviit.ng</a></p>
          </div>

          <div className="space-y-3">
            {FAQS.map((faq, i) => (
              <FaqItem
                key={i}
                faq={faq}
                open={openFaq === i}
                onToggle={() => setOpenFaq(openFaq === i ? null : i)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-28 bg-primary relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-20 -right-20 w-96 h-96 bg-white/5 rounded-full" />
          <div className="absolute -bottom-20 -left-20 w-72 h-72 bg-white/5 rounded-full" />
        </div>
        <div className="relative max-w-3xl mx-auto px-6 sm:px-10 text-center">
          <p className="text-green-300 text-xs font-black uppercase tracking-widest mb-4">Ready to start?</p>
          <h2 className="font-black text-white mb-4" style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', letterSpacing: '-0.03em', lineHeight: 1.1 }}>
            Join thousands of Nigerians
            <br />
            changing lives on Giviit
          </h2>
          <p className="text-green-200 text-lg mb-12 max-w-lg mx-auto">
            Start your campaign for free today — no credit card, no upfront fee. Withdraw whenever you're ready.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register"
              className="inline-flex items-center justify-center gap-2 bg-accent hover:bg-accent/90 text-white font-black px-10 py-4 rounded-full transition-all hover:scale-105 shadow-xl shadow-black/20 text-base"
            >
              Create Free Account <MdArrowForward />
            </Link>
            <Link
              to="/campaigns"
              className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/15 border border-white/20 text-white font-bold px-10 py-4 rounded-full transition-all text-base"
            >
              Browse Campaigns
            </Link>
          </div>
          <p className="text-green-300/50 text-xs mt-8">No fees to start · Paystack-secured · Withdraw anytime</p>
        </div>
      </section>

      <Footer />
    </div>
  );
}

