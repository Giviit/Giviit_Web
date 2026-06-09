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
    desc: 'We built Giviit on the principle that Nigerians can trust each other — but that trust must be earned and verified.',
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
  { name: 'Adigun Oreoluwa', role: 'Founder & CEO', initials: 'AO', photo: null },
  { name: 'Sofela Israel',   role: 'Technical Team Lead', initials: 'SI', photo: null },
  { name: 'Nworah Chiddima', role: 'CFO',            initials: 'NC', photo: null },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Hero */}
      <div className="pt-24 pb-16 bg-white border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <span className="inline-block bg-primary/10 text-primary text-xs font-bold px-3 py-1 rounded-full mb-4 uppercase tracking-widest">About Giviit</span>
          <h1 className="text-4xl sm:text-5xl font-black text-gray-900 mb-6 leading-tight">
            Together We Rise
          </h1>
          <p className="text-gray-600 text-lg leading-relaxed max-w-2xl mx-auto">
            Giviit is Nigeria's most trusted crowdfunding platform — built by Nigerians, for Nigerians. We connect people who need help with people who want to give it, securely and transparently.
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
              Giviit exists to bridge that gap — not by giving handouts, but by mobilising the collective generosity of Nigerians at home and in the diaspora. When we act together, no one has to face a crisis alone.
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
          <div className="text-center mb-14">
            <span className="inline-block bg-primary/10 text-primary text-[11px] font-black px-4 py-1.5 rounded-full mb-4 uppercase tracking-[0.15em]">The Team</span>
            <h2 className="text-4xl font-black text-gray-900 mb-3" style={{ letterSpacing: '-0.03em' }}>
              Built by Nigerians,<br />for Nigerians.
            </h2>
            <p className="text-gray-400 max-w-sm mx-auto text-sm">All believers in what we're building together.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 max-w-5xl mx-auto">
            {TEAM.map((member, i) => {
              const styles = [
                { bg: 'linear-gradient(145deg,#0D1A0D,#1a7a4a)', accent: '#22c55e', accentHex: '34d399' },
                { bg: 'linear-gradient(145deg,#0a1624,#0f3d6e)', accent: '#60a5fa', accentHex: '60a5fa' },
                { bg: 'linear-gradient(145deg,#1a0d00,#7a3d00)', accent: '#f5a623', accentHex: 'f5a623' },
              ][i % 3];

              return (
                <div key={i} className="group rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-500">

                  {/* Placeholder photo area */}
                  <div className="relative h-72 sm:h-80 overflow-hidden" style={{ background: styles.bg }}>

                    {/* Dot pattern */}
                    <div className="absolute inset-0 opacity-[0.12]"
                      style={{ backgroundImage: `radial-gradient(circle, ${styles.accent} 1.5px, transparent 1.5px)`, backgroundSize: '26px 26px' }} />

                    {/* Giant ghost initial */}
                    <div className="absolute inset-0 flex items-center justify-center select-none pointer-events-none overflow-hidden">
                      <span className="font-black text-white/[0.07]" style={{ fontSize: 'clamp(10rem,30vw,16rem)', lineHeight: 1, letterSpacing: '-0.06em' }}>
                        {member.initials.charAt(0)}
                      </span>
                    </div>

                    {/* Glow blob */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full blur-3xl opacity-20 pointer-events-none"
                      style={{ background: styles.accent }} />

                    {/* Avatar ring + initials */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                      <div
                        className="w-32 h-32 rounded-full flex items-center justify-center shadow-2xl relative"
                        style={{
                          background: `linear-gradient(135deg,#${styles.accentHex}22,#${styles.accentHex}55)`,
                          border: `2px solid #${styles.accentHex}44`,
                          boxShadow: `0 0 40px #${styles.accentHex}30, 0 8px 32px rgba(0,0,0,0.4)`,
                        }}>
                        <span className="font-black text-white text-4xl" style={{ letterSpacing: '-0.04em', textShadow: '0 2px 12px rgba(0,0,0,0.4)' }}>
                          {member.initials}
                        </span>
                      </div>
                      <span className="text-[11px] font-semibold tracking-widest uppercase"
                        style={{ color: `${styles.accent}99` }}>
                        {member.photo ? '' : 'photo coming soon'}
                      </span>
                    </div>

                    {/* Bottom scrim */}
                    <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/50 to-transparent" />
                  </div>

                  {/* Info bar */}
                  <div className="bg-[#0D1A0D] px-6 py-5 flex items-center justify-between gap-3">
                    <div>
                      <p className="font-black text-white text-base leading-none mb-1.5">{member.name}</p>
                      <span
                        className="inline-block text-[11px] font-bold px-3 py-1 rounded-full"
                        style={{ background: `#${styles.accentHex}1a`, color: styles.accent, border: `1px solid #${styles.accentHex}33` }}>
                        {member.role}
                      </span>
                    </div>
                    <div className="w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center font-black text-sm"
                      style={{ background: `#${styles.accentHex}22`, color: styles.accent }}>
                      {member.initials}
                    </div>
                  </div>
                </div>
              );
            })}
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
              Giviit is registered with the Corporate Affairs Commission (CAC) of Nigeria. We operate in compliance with the Nigeria Data Protection Regulation (NDPR) and maintain a comprehensive Terms of Service and Privacy Policy. For legal enquiries, contact legal@Giviit.ng.
            </p>
          </div>
        </div>

        {/* Contact + CTA */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
            <h3 className="font-black text-gray-900 text-xl mb-4">Get in Touch</h3>
            <div className="space-y-3 text-sm text-gray-600">
              <p><span className="font-semibold text-gray-900">General:</span> hello@Giviit.ng</p>
              <p><span className="font-semibold text-gray-900">Trust & Safety:</span> trust@Giviit.ng</p>
              <p><span className="font-semibold text-gray-900">Partnerships:</span> partners@Giviit.ng</p>
              <p><span className="font-semibold text-gray-900">Press:</span> press@Giviit.ng</p>
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

