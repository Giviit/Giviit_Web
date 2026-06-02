import { Link } from 'react-router-dom';
import { MdVerified, MdPayment, MdAccountBalance, MdShield, MdPeople, MdEdit, MdCampaign, MdArrowForward, MdCheckCircle } from 'react-icons/md';
import { GiPrayerBeads } from 'react-icons/gi';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const CREATOR_STEPS = [
  {
    icon: MdEdit,
    title: 'Create Your Campaign',
    desc: 'Fill out your campaign details — title, story, goal amount, and deadline. Add photos and break your goal into milestones so donors can see exactly where their money goes.',
    color: 'bg-blue-50 text-blue-600',
  },
  {
    icon: MdVerified,
    title: 'Identity Verification',
    desc: 'Submit your NIN or BVN for verification. Our team reviews your documents within 24–48 hours and issues the trusted "Verified" badge to your campaign.',
    color: 'bg-green-50 text-green-600',
  },
  {
    icon: MdPeople,
    title: 'Share With Your Network',
    desc: 'Share your campaign via WhatsApp, Twitter, and Facebook. Personal outreach works best — send direct messages, not just broadcasts. Ask your guarantor to share too.',
    color: 'bg-purple-50 text-purple-600',
  },
  {
    icon: MdAccountBalance,
    title: 'Receive Your Funds',
    desc: 'Once your campaign meets its target (or you request a withdrawal), submit your Nigerian bank details. After a brief review, funds are transferred directly to your account.',
    color: 'bg-amber-50 text-amber-600',
  },
];

const DONOR_STEPS = [
  {
    icon: MdCampaign,
    title: 'Discover a Campaign',
    desc: 'Browse hundreds of verified campaigns by category — medical, education, emergency, community, business, and more. Filter by urgency, location, or funding progress.',
    color: 'bg-pink-50 text-pink-600',
  },
  {
    icon: MdShield,
    title: 'Verify It\'s Legitimate',
    desc: 'Look for the Verified badge (identity confirmed) and the Vouched badge (a real person has vouched for the creator). Read the story, check updates, and review milestones.',
    color: 'bg-green-50 text-green-600',
  },
  {
    icon: MdPayment,
    title: 'Donate Securely',
    desc: 'Donate any amount — even ₦100 — via Paystack. Your card and bank details go directly to Paystack; Givia never stores them. You receive an email receipt instantly.',
    color: 'bg-blue-50 text-blue-600',
  },
  {
    icon: GiPrayerBeads,
    title: 'Leave a Prayer or Message',
    desc: 'Optionally leave an encouraging message or prayer for the campaign. Your prayer appears on the public Prayer Wall, visible to other donors and the campaign creator.',
    color: 'bg-amber-50 text-amber-600',
  },
];

const FAQS = [
  {
    q: 'What fees does Givia charge?',
    a: 'Givia charges a 5% platform fee on successfully funded campaigns. Paystack charges an additional 1.5% + ₦100 per transaction. There are no hidden fees.',
  },
  {
    q: 'How long does verification take?',
    a: 'Identity verification is completed within 24–48 business hours. You will receive an email notification once your campaign is verified and live.',
  },
  {
    q: 'Can I withdraw before reaching my goal?',
    a: 'Yes. You can request a withdrawal of any amount raised so far, at any time. Our team reviews withdrawal requests within 24 hours before releasing funds.',
  },
  {
    q: 'What happens if a campaign is fraudulent?',
    a: 'Any user can report a campaign using the "Report" button on the campaign page. We investigate within 24 hours. If fraud is confirmed, the campaign is suspended and affected donors are refunded.',
  },
  {
    q: 'Is there a minimum or maximum donation amount?',
    a: 'The minimum donation is ₦100. There is no maximum. International donors can give in GBP, USD, CAD, EUR, or AUD — converted to Naira at the current exchange rate.',
  },
  {
    q: 'Can I donate anonymously?',
    a: 'Yes. Check the "Donate anonymously" option in the donation form. Your name will be hidden from the public donor list, though your email is retained for our records.',
  },
  {
    q: 'What is a Pledge and how is it different from a donation?',
    a: 'A Pledge is an instalment commitment. Instead of donating ₦10,000 at once, you can pledge ₦10,000 spread over 5 monthly payments of ₦2,000. You receive payment reminders by email.',
  },
  {
    q: 'Can I campaign as a group or organisation?',
    a: 'Yes. Use the Ajo Mode (co-owner) feature to add team members to your campaign. All co-owners can post updates and monitor donations, though only the main creator can request withdrawals.',
  },
];

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Hero */}
      <div className="pt-24 pb-16 bg-white border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <span className="inline-block bg-primary/10 text-primary text-xs font-bold px-3 py-1 rounded-full mb-4 uppercase tracking-widest">How It Works</span>
          <h1 className="text-4xl sm:text-5xl font-black text-gray-900 mb-5 leading-tight">
            Simple, Transparent,<br />and Built for Nigeria
          </h1>
          <p className="text-gray-500 text-lg max-w-2xl mx-auto leading-relaxed">
            Givia connects people who need help with people who want to help — securely, transparently, and entirely in Naira.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
            <Link to="/dashboard/campaigns/create" className="bg-primary text-white font-bold px-8 py-3.5 rounded-xl text-sm hover:bg-primary/90 transition-colors">
              Start a Campaign
            </Link>
            <Link to="/campaigns" className="border-2 border-gray-200 text-gray-700 font-bold px-8 py-3.5 rounded-xl text-sm hover:border-primary hover:text-primary transition-colors">
              Browse Campaigns
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-20">

        {/* For creators */}
        <section>
          <div className="text-center mb-12">
            <h2 className="text-3xl font-black text-gray-900 mb-3">For Campaign Creators</h2>
            <p className="text-gray-500">Launch your campaign in minutes and start receiving support from day one.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {CREATOR_STEPS.map((step, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 relative">
                <div className="absolute -top-3 -left-3 w-7 h-7 bg-primary text-white rounded-full flex items-center justify-center text-xs font-black">
                  {i + 1}
                </div>
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${step.color}`}>
                  <step.icon className="text-xl" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{step.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* For donors */}
        <section>
          <div className="text-center mb-12">
            <h2 className="text-3xl font-black text-gray-900 mb-3">For Donors</h2>
            <p className="text-gray-500">Give confidently knowing your money goes exactly where it should.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {DONOR_STEPS.map((step, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 relative">
                <div className="absolute -top-3 -left-3 w-7 h-7 bg-accent text-white rounded-full flex items-center justify-center text-xs font-black">
                  {i + 1}
                </div>
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${step.color}`}>
                  <step.icon className="text-xl" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{step.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Trust & verification */}
        <section className="rounded-3xl overflow-hidden" style={{ background: 'linear-gradient(135deg, #f0fdf4, #dcfce7)', border: '1px solid #bbf7d0' }}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
            <div className="p-10 lg:p-14">
              <span className="inline-block bg-primary/10 text-primary text-xs font-bold px-3 py-1 rounded-full mb-4 uppercase tracking-widest">Trust & Safety</span>
              <h2 className="text-3xl font-black text-gray-900 mb-5">We verify every creator.<br />Every single one.</h2>
              <p className="text-gray-600 leading-relaxed mb-6">
                Before any campaign goes live on Givia, the creator must submit a government-issued ID, BVN, and a live selfie. Our team manually reviews every submission. No campaign gets a Verified badge without human eyes on it.
              </p>
              <ul className="space-y-3">
                {[
                  'NIN or BVN cross-checked against NIBSS',
                  'Guarantor system — real people vouching publicly',
                  'Withdrawal funds held for review before release',
                  'Every flagged campaign reviewed within 24 hours',
                  'Fraud cases referred to the EFCC',
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                    <MdCheckCircle className="text-primary text-lg flex-shrink-0 mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="p-10 lg:p-14 bg-white/50 flex flex-col justify-center">
              <h3 className="font-bold text-gray-900 text-lg mb-6">What our badges mean</h3>
              <div className="space-y-5">
                <div className="flex gap-4">
                  <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <MdVerified className="text-primary text-lg" />
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 text-sm">Verified</p>
                    <p className="text-gray-500 text-sm">Identity documents confirmed by our team. The creator is who they claim to be.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <MdPeople className="text-blue-600 text-lg" />
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 text-sm">Vouched</p>
                    <p className="text-gray-500 text-sm">A named guarantor (doctor, pastor, community leader) has publicly endorsed this campaign.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <MdShield className="text-red-500 text-lg" />
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 text-sm">Urgent</p>
                    <p className="text-gray-500 text-sm">Creator has indicated a time-sensitive need. A countdown timer shows the urgency deadline.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section>
          <div className="text-center mb-12">
            <h2 className="text-3xl font-black text-gray-900 mb-3">Frequently Asked Questions</h2>
            <p className="text-gray-500">Everything you need to know before you get started.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-5xl mx-auto">
            {FAQS.map((faq, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h3 className="font-bold text-gray-900 mb-2 text-sm">{faq.q}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Bottom CTA */}
        <div className="text-center rounded-3xl py-16 px-6"
          style={{ background: 'linear-gradient(135deg, #1a7a4a 0%, #22c55e 100%)' }}>
          <h3 className="text-white font-black text-3xl mb-3">Ready to get started?</h3>
          <p className="text-white/80 mb-8 max-w-md mx-auto">Join thousands of Nigerians who have used Givia to change lives — including their own.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register" className="bg-white text-primary font-black px-8 py-4 rounded-xl text-sm hover:bg-gray-50 transition-colors inline-flex items-center gap-2">
              Create Free Account <MdArrowForward />
            </Link>
            <Link to="/campaigns" className="border-2 border-white/40 text-white font-bold px-8 py-4 rounded-xl text-sm hover:bg-white/10 transition-colors">
              Browse Campaigns
            </Link>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
