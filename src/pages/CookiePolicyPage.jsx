import { useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const LAST_UPDATED = 'June 2025';

const COOKIE_TYPES = [
  {
    type: 'Strictly Necessary',
    canOptOut: false,
    examples: 'Authentication session token, CSRF token, load balancer cookie',
    purpose: 'These cookies are required for the platform to function. They keep you logged in, protect against cross-site request forgery, and route your requests correctly. They cannot be disabled.',
  },
  {
    type: 'Functional',
    canOptOut: true,
    examples: 'Language preference, currency display preference, campaign filter state',
    purpose: 'These cookies remember choices you make (like your preferred category filter) to give you a better experience on return visits. Disabling them means some preferences will reset on each visit.',
  },
  {
    type: 'Analytics',
    canOptOut: true,
    examples: 'Page view counts, session duration, click events (via internal analytics)',
    purpose: 'We use anonymised analytics to understand how visitors use Giviit â€” which pages are popular, where users drop off in the campaign creation flow, etc. This helps us improve the platform. No personally identifiable data is sent to third parties for analytics purposes.',
  },
  {
    type: 'Payment',
    canOptOut: false,
    examples: 'Paystack session cookie, fraud-detection token',
    purpose: "Set by Paystack when you make or process a donation. These are required to complete transactions securely. Paystack's own cookie and privacy policies apply to these.",
  },
];

const SECTIONS = [
  {
    id: 'what-are-cookies',
    title: '1. What Are Cookies?',
    body: `Cookies are small text files stored on your device when you visit a website. They allow the site to remember your actions and preferences over time, or to identify your session.

We also use similar technologies â€” specifically:
â€” localStorage / sessionStorage for client-side state (e.g. your draft campaign form)
â€” Supabase JWT tokens stored in localStorage to keep you authenticated`,
  },
  {
    id: 'cookies-we-use',
    title: '2. Cookies We Use',
    body: null,
  },
  {
    id: 'how-to-control',
    title: '3. How to Control Cookies',
    body: `Browser settings: All major browsers allow you to view, block, or delete cookies. Instructions vary by browser:

â€” Chrome: Settings â†’ Privacy and security â†’ Cookies
â€” Firefox: Options â†’ Privacy & Security â†’ Cookies and Site Data
â€” Safari: Preferences â†’ Privacy â†’ Manage Website Data
â€” Edge: Settings â†’ Cookies and site permissions

Note: Blocking strictly necessary cookies will prevent you from logging in or making donations.

Opt-out links: For any third-party services with opt-out mechanisms, we link to them below:
â€” Paystack privacy: paystack.com/privacy
â€” Cloudinary privacy: cloudinary.com/privacy`,
  },
  {
    id: 'do-not-track',
    title: '4. Do Not Track',
    body: `We respect the DNT (Do Not Track) browser signal. When DNT is enabled, we disable non-essential analytics tracking for your session.`,
  },
  {
    id: 'third-party',
    title: '5. Third-Party Cookies',
    body: `We embed no advertising networks and use no third-party ad cookies. The only third-party cookies set on Giviit.ng come from:

â€” Paystack â€” for payment processing
â€” Google Fonts â€” to load the Inter typeface (a connection is made to Google's CDN; see Google's privacy policy for details)

We do not use Facebook Pixel, Google Ads, or any other advertising or retargeting cookies.`,
  },
  {
    id: 'changes',
    title: '6. Changes to This Policy',
    body: `We may update this Cookie Policy when we add new features or third-party integrations. We will update the "Last updated" date and, for material changes, notify you by email.`,
  },
  {
    id: 'contact',
    title: '7. Contact',
    body: `For questions about our use of cookies, contact our Data Protection Officer at: privacy@Giviit.ng`,
  },
];

const NAV_ITEMS = SECTIONS.map(s => ({ id: s.id, label: s.title.replace(/^\d+\.\s/, '') }));

export default function CookiePolicyPage() {
  const [active, setActive] = useState(null);

  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) {
      const top = el.getBoundingClientRect().top + window.scrollY - 96;
      window.scrollTo({ top, behavior: 'smooth' });
      setActive(id);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="pt-16">

        {/* Header */}
        <div className="bg-dark text-white py-16 px-4">
          <div className="max-w-5xl mx-auto">
            <p className="text-primary text-xs font-bold uppercase tracking-widest mb-3">Legal</p>
            <h1 className="text-4xl sm:text-5xl font-black mb-4">Cookie Policy</h1>
            <p className="text-gray-400 text-sm max-w-xl">
              This policy explains what cookies Giviit uses, why, and how you can control them at any time.
            </p>
            <p className="text-gray-500 text-xs mt-4">Last updated: <span className="text-gray-300">{LAST_UPDATED}</span></p>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 py-14">

          {/* Summary box */}
          <div className="border-l-4 border-primary bg-primary/5 pl-5 pr-4 py-4 rounded-r-xl mb-14">
            <p className="text-gray-700 text-sm leading-relaxed">
              <strong className="text-dark">Summary:</strong> By using Giviit.ng you consent to strictly necessary cookies. All other cookies (functional, analytics) are optional and can be turned off in your browser settings. We use no advertising or retargeting cookies.
            </p>
            <div className="flex flex-wrap gap-4 mt-3">
              <Link to="/terms" className="text-primary text-xs font-semibold hover:underline">Terms of Service â†’</Link>
              <Link to="/privacy-policy" className="text-primary text-xs font-semibold hover:underline">Privacy Policy â†’</Link>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-10">

            {/* Sidebar */}
            <aside className="hidden lg:block w-60 flex-shrink-0">
              <div className="sticky top-24 bg-gray-50 border border-gray-200 rounded-2xl p-4">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3 px-1">Sections</p>
                <nav className="space-y-0.5">
                  {NAV_ITEMS.map(({ id, label }) => (
                    <button
                      key={id}
                      onClick={() => scrollTo(id)}
                      className={`w-full text-left text-xs px-3 py-2 rounded-lg transition-colors leading-snug ${
                        active === id
                          ? 'bg-primary text-white font-semibold'
                          : 'text-gray-600 hover:bg-gray-100 hover:text-dark'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </nav>
              </div>
            </aside>

            {/* Content */}
            <div className="flex-1 min-w-0 space-y-12">
              {SECTIONS.map(({ id, title, body }) => (
                <section key={id} id={id} className="scroll-mt-24">
                  <h2 className="text-lg font-bold text-dark mb-4 pb-2 border-b border-gray-100">{title}</h2>

                  {id === 'cookies-we-use' ? (
                    <div className="space-y-4">
                      {COOKIE_TYPES.map(({ type, canOptOut, examples, purpose }) => (
                        <div key={type} className="border border-gray-200 rounded-xl p-5">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="font-bold text-dark text-sm">{type}</h3>
                            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${canOptOut ? 'bg-gray-100 text-gray-600' : 'bg-primary/10 text-primary'}`}>
                              {canOptOut ? 'Optional' : 'Required'}
                            </span>
                          </div>
                          <p className="text-gray-600 text-sm leading-relaxed mb-2">{purpose}</p>
                          <p className="text-gray-400 text-xs">
                            <span className="font-medium text-gray-500">Examples:</span> {examples}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-gray-600 text-sm leading-relaxed whitespace-pre-line">{body}</div>
                  )}
                </section>
              ))}

              <div className="pt-8 border-t border-gray-100 flex flex-wrap gap-4">
                <Link to="/terms" className="text-primary text-sm font-semibold hover:underline">Terms of Service</Link>
                <Link to="/privacy-policy" className="text-primary text-sm font-semibold hover:underline">Privacy Policy</Link>
                <a href="mailto:privacy@Giviit.ng" className="text-primary text-sm font-semibold hover:underline">privacy@Giviit.ng</a>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

