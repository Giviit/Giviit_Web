import { Link } from 'react-router-dom';
import { MdArrowForward, MdVerified, MdPublic, MdShield, MdFavorite } from 'react-icons/md';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const STATS = [
  { value: '₦2.4B+', label: 'Total raised on platform' },
  { value: '47,000+', label: 'Donors and counting' },
  { value: '3,200+', label: 'Campaigns completed' },
  { value: '36', label: 'States represented' },
];

const VALUES = [
  {
    icon: MdVerified,
    title: 'Transparency First',
    desc: 'Every naira is traceable. Campaign creators must provide documentation, and every withdrawal is reviewed before funds are released.',
    color: 'text-primary bg-green-50',
  },
  {
    icon: MdShield,
    title: 'Community Trust',
    desc: 'We built Givia on the principle that Nigerians can trust each other — but that trust must be earned and verified.',
    color: 'text-blue-600 bg-blue-50',
  },
  {
    icon: MdPublic,
    title: 'Nigeria First',
    desc: 'Our platform is designed specifically for Nigerians — domestic and diaspora. Naira payments, Nigerian bank withdrawals, and Nigerian cultural context.',
    color: 'text-purple-600 bg-purple-50',
  },
  {
    icon: MdFavorite,
    title: 'Human at the Centre',
    desc: 'Behind every campaign is a real person with a real story. We exist to make sure that person gets heard — and helped.',
    color: 'text-red-500 bg-red-50',
  },
];

const TEAM = [
  { name: 'Olusegun Adeyemi', role: 'Co-Founder & CEO', initials: 'OA' },
  { name: 'Ngozi Okonkwo', role: 'Co-Founder & CTO', initials: 'NO' },
  { name: 'Tunde Bello', role: 'Head of Trust & Safety', initials: 'TB' },
  { name: 'Amaka Eze', role: 'Head of Operations', initials: 'AE' },
  { name: 'Chidi Obi', role: 'Lead Engineer', initials: 'CO' },
  { name: 'Funmilayo Adesanya', role: 'Community Manager', initials: 'FA' },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Hero */}
      <div className="pt-24 pb-16 bg-white border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <span className="inline-block bg-primary/10 text-primary text-xs font-bold px-3 py-1 rounded-full mb-4 uppercase tracking-widest">About Givia</span>
          <h1 className="text-4xl sm:text-5xl font-black text-gray-900 mb-6 leading-tight">
            Together We Rise
          </h1>
          <p className="text-gray-600 text-lg leading-relaxed max-w-2xl mx-auto">
            Givia is Nigeria's most trusted crowdfunding platform — built by Nigerians, for Nigerians. We connect people who need help with people who want to give it, securely and transparently.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-20">

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
          {STATS.map((stat, i) => (
            <div key={i} className="bg-white rounded-2xl p-6 text-center shadow-sm border border-gray-100">
              <p className="text-3xl font-black text-primary mb-1">{stat.value}</p>
              <p className="text-gray-500 text-sm">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Mission */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <span className="inline-block bg-primary/10 text-primary text-xs font-bold px-3 py-1 rounded-full mb-4 uppercase tracking-widest">Our Mission</span>
            <h2 className="text-3xl font-black text-gray-900 mb-5">Making it possible for any Nigerian to get help when they need it most</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              In Nigeria, the gap between a medical emergency and financial ruin can be a single hospital bill. A business dream can die because a first-generation entrepreneur cannot access capital. A community project can stall because no single person can bear the cost alone.
            </p>
            <p className="text-gray-600 leading-relaxed mb-6">
              Givia exists to bridge that gap — not by giving handouts, but by mobilising the collective generosity of Nigerians at home and in the diaspora. When we act together, no one has to face a crisis alone.
            </p>
            <Link to="/campaigns" className="inline-flex items-center gap-2 bg-primary text-white font-bold px-6 py-3 rounded-xl text-sm hover:bg-primary/90 transition-colors">
              Browse Campaigns <MdArrowForward />
            </Link>
          </div>
          <div className="rounded-2xl overflow-hidden h-80 bg-gray-100">
            <img
              src="https://images.unsplash.com/photo-1515658323406-25d61c141a6e?w=800&q=80"
              alt="Community"
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Values */}
        <section>
          <div className="text-center mb-12">
            <h2 className="text-3xl font-black text-gray-900 mb-3">Our Values</h2>
            <p className="text-gray-500">The principles that guide every decision we make.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {VALUES.map((val, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${val.color}`}>
                  <val.icon className="text-xl" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{val.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{val.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Team */}
        <section>
          <div className="text-center mb-12">
            <h2 className="text-3xl font-black text-gray-900 mb-3">Meet the Team</h2>
            <p className="text-gray-500">The people building Givia — all Nigerians, all believers in what we're doing.</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-5">
            {TEAM.map((member, i) => (
              <div key={i} className="text-center">
                <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center mx-auto mb-3">
                  <span className="text-white font-black text-lg">{member.initials}</span>
                </div>
                <p className="font-bold text-gray-900 text-sm">{member.name}</p>
                <p className="text-gray-400 text-xs mt-0.5">{member.role}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CAC notice */}
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 flex gap-4 items-start">
          <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <MdShield className="text-amber-600 text-lg" />
          </div>
          <div>
            <p className="font-bold text-amber-900 text-sm mb-1">Legal & Compliance</p>
            <p className="text-amber-700 text-sm leading-relaxed">
              Givia is registered with the Corporate Affairs Commission (CAC) of Nigeria. We operate in compliance with the Nigeria Data Protection Regulation (NDPR) and maintain a comprehensive Terms of Service and Privacy Policy. For legal enquiries, contact legal@givia.ng.
            </p>
          </div>
        </div>

        {/* Contact + CTA */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
            <h3 className="font-black text-gray-900 text-xl mb-4">Get in Touch</h3>
            <div className="space-y-3 text-sm text-gray-600">
              <p><span className="font-semibold text-gray-900">General:</span> hello@givia.ng</p>
              <p><span className="font-semibold text-gray-900">Trust & Safety:</span> trust@givia.ng</p>
              <p><span className="font-semibold text-gray-900">Partnerships:</span> partners@givia.ng</p>
              <p><span className="font-semibold text-gray-900">Press:</span> press@givia.ng</p>
              <p><span className="font-semibold text-gray-900">Address:</span> 14 Adeola Odeku Street, Victoria Island, Lagos</p>
            </div>
          </div>
          <div className="rounded-2xl p-8 text-center flex flex-col items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #1a7a4a 0%, #22c55e 100%)' }}>
            <h3 className="text-white font-black text-2xl mb-3">Join the movement</h3>
            <p className="text-white/80 text-sm mb-6">Create an account and start making a difference today.</p>
            <Link to="/register" className="bg-white text-primary font-black px-7 py-3 rounded-xl text-sm hover:bg-gray-50 transition-colors inline-flex items-center gap-2">
              Create Free Account <MdArrowForward />
            </Link>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
