import { useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const LAST_UPDATED = 'June 2025';
const EFFECTIVE_DATE = '1 July 2025';

const SECTIONS = [
  {
    id: 'introduction',
    title: '1. Introduction & Acceptance',
    body: `Welcome to Giviit. By accessing or using the Giviit platform at Giviit.ng (the "Platform"), you agree to be bound by these Terms of Service ("Terms"), our Privacy Policy, and our Cookie Policy. If you do not agree, do not use the Platform.

These Terms form a legally binding agreement between you and Giviit Technologies Ltd ("Giviit", "we", "us", or "our"), a company incorporated in Nigeria.

We may update these Terms from time to time. Continued use of the Platform after changes are posted constitutes acceptance of the updated Terms. We will notify registered users by email of any material changes.`,
  },
  {
    id: 'eligibility',
    title: '2. Eligibility',
    body: `You must be at least 18 years old to create an account, start a campaign, or make a donation on Giviit. By using the Platform you confirm that you meet this requirement.

Giviit is available to Nigerian residents and members of the Nigerian diaspora worldwide. Campaigns must be initiated by or on behalf of individuals, registered businesses, or registered non-profit organisations with a verifiable Nigerian connection.

Giviit reserves the right to refuse access to any person or entity at its sole discretion.`,
  },
  {
    id: 'accounts',
    title: '3. Account Registration',
    body: `You must register an account to create a campaign or withdraw funds. You agree to provide accurate, current, and complete information during registration and to keep your account information updated.

You are responsible for maintaining the confidentiality of your password and for all activity that occurs under your account. You must notify us immediately at support@Giviit.ng if you suspect unauthorised access.

One person may not operate multiple accounts. Accounts created to circumvent a suspension or ban will be permanently terminated.`,
  },
  {
    id: 'kyc',
    title: '4. Identity Verification (KYC)',
    body: `To withdraw funds, campaign creators must complete identity verification (KYC). This requires:

â€” A valid government-issued photo ID (National ID card, international passport, or driver's licence)
â€” Your Bank Verification Number (BVN) or National Identification Number (NIN)
â€” A selfie or liveness check

KYC data is processed solely for identity verification and fraud prevention. It is encrypted, never displayed publicly, and handled in accordance with our Privacy Policy and applicable Nigerian law (NDPR 2019, Money Laundering (Prevention and Prohibition) Act 2022).

Giviit may require additional verification for high-value campaigns or unusual withdrawal patterns.`,
  },
  {
    id: 'campaigns',
    title: '5. Campaign Creation',
    body: `Campaign creators ("Creators") must:

â€” Provide accurate, truthful information about themselves and the purpose of the campaign
â€” Upload genuine photos or videos that represent the campaign
â€” Set a realistic and honest funding goal
â€” Promptly update donors if circumstances materially change
â€” Use funds solely for the stated campaign purpose

Giviit reviews every campaign before it goes live. Approval does not constitute an endorsement or verification of any claims made. Our disclaimer: "Giviit verifies identity, not campaign outcomes" applies to all campaigns.

Creators are solely responsible for the delivery of promised outcomes. Giviit is not a party to any arrangement between a Creator and their donors.`,
  },
  {
    id: 'prohibited',
    title: '6. Prohibited Campaign Categories',
    body: `The following categories of campaigns are strictly prohibited on Giviit:

Financial & Investment
â€” Ponzi or pyramid schemes, investment returns, forex trading capital, cryptocurrency speculations

Illegal or Harmful
â€” Campaigns that fund illegal activities under Nigerian law or international law
â€” Proceeds intended to fund violence, terrorism, or criminal organisations
â€” Campaigns designed to defraud, harass, or harm any individual or group

Regulated Activities (without proof of licence)
â€” Political campaigns or party funding (without INEC approval where applicable)
â€” Religious levy collection without registered organisational credentials
â€” Medical treatments that are unproven, harmful, or experimental without clinical backing

Deceptive Campaigns
â€” Campaigns based on false identities, fabricated emergencies, or misleading imagery
â€” "Clone" campaigns impersonating existing verified campaigns

Other Prohibited Uses
â€” Payment of gambling debts
â€” Bail or legal fees for violent crimes
â€” Circumventing a court order

Giviit reserves the right to take down any campaign that violates these rules, even after approval, and to withhold or return funds as appropriate.`,
  },
  {
    id: 'fees',
    title: '7. Platform Fees & Payment Processing',
    body: `Starting a campaign on Giviit is free. We charge a platform fee of 5% on each successful donation. This fee is deducted automatically before funds are credited to the campaign balance.

Payment processing is handled by Paystack Technologies Ltd. Paystack charges a transaction fee of 1.5% + â‚¦100 per transaction (capped at â‚¦2,000 for Nigerian cards; international cards may attract additional fees). These fees are separate from Giviit's platform fee and are deducted by Paystack.

Giviit's fee structure may change. We will give at least 30 days' notice before increasing our platform fee for active campaigns.

All fees are shown transparently in the campaign dashboard before any withdrawal is processed.`,
  },
  {
    id: 'donations',
    title: '8. Donations',
    body: `Donations made through Giviit are voluntary contributions to a campaign. They are not purchases, investments, or loans.

Giviit does not guarantee that a campaign will reach its goal, that funds will be used as stated, or that any promised reward, outcome, or benefit will be delivered. Donors give at their own discretion.

Anonymous donations: Donors may choose to give anonymously. Their name will not be shown publicly, but Giviit retains their details for fraud prevention and legal compliance.

Donation receipts: Donors receive an automated email receipt upon successful payment via Paystack.`,
  },
  {
    id: 'refunds',
    title: '9. Refunds & Disputes',
    body: `Giviit does not automatically issue refunds on donations once they have been credited to a campaign. Donations represent voluntary contributions.

Refunds may be issued at Giviit's sole discretion in the following circumstances:

â€” The campaign is removed by Giviit for violating these Terms before any withdrawal has been processed
â€” The Creator requests a refund on behalf of a donor within 72 hours of the donation
â€” A donation was made in clear error (e.g. duplicate charge) and the Creator has not yet withdrawn the funds
â€” A payment dispute is successfully upheld via Paystack's dispute mechanism

To request a refund, contact support@Giviit.ng with your payment reference. We will investigate and respond within 5 business days.

Chargebacks filed directly with your card issuer may result in suspension of the associated donor account.`,
  },
  {
    id: 'withdrawals',
    title: '10. Withdrawals',
    body: `Creators may request a withdrawal of available campaign funds at any time, subject to:

â€” Completion of identity verification (KYC)
â€” A minimum withdrawal amount of â‚¦1,000
â€” No active fraud investigation or account hold on the campaign

Withdrawal requests are typically processed within 1â€“3 business days. Funds are transferred directly to the verified Nigerian bank account on record.

Giviit may delay or withhold a withdrawal if there are credible reports of fraud, ongoing disputes with donors, or a regulatory hold. We will notify the Creator in writing of any such delay.

Campaigns may accept donations beyond their stated goal. Creators are responsible for communicating to donors how excess funds will be used.`,
  },
  {
    id: 'creator-obligations',
    title: '11. Creator Obligations',
    body: `By creating a campaign, you agree to:

â€” Use all raised funds exclusively for the stated campaign purpose
â€” Post regular updates to donors when there is a material development (at least once if the goal is reached)
â€” Respond to Giviit's requests for information within 5 business days
â€” Notify Giviit if the campaign purpose changes significantly before all funds are withdrawn
â€” Not offer financial returns, equity, or loan repayments as rewards for donations
â€” Comply with all applicable Nigerian tax laws regarding funds received

Failure to comply with these obligations may result in campaign suspension, account termination, and/or recovery of disbursed funds.`,
  },
  {
    id: 'intellectual-property',
    title: '12. Intellectual Property',
    body: `Giviit and its logos, brand elements, and platform code are the intellectual property of Giviit Technologies Ltd. You may not copy, reproduce, or distribute them without our written permission.

Content you submit (photos, text, video) remains your property. By submitting it, you grant Giviit a non-exclusive, royalty-free, worldwide licence to display, resize, and distribute your campaign content on the Platform and in promotional materials for the purpose of operating and promoting the Platform.

You confirm that any content you upload does not infringe on the intellectual property rights of any third party.`,
  },
  {
    id: 'conduct',
    title: '13. Prohibited Conduct',
    body: `You may not use the Platform to:

â€” Violate any applicable Nigerian or international law
â€” Harass, threaten, defame, or abuse any user or third party
â€” Upload malware, viruses, or any code designed to harm the Platform or its users
â€” Scrape, crawl, or harvest user data without written authorisation
â€” Attempt to gain unauthorised access to any part of the Platform or its infrastructure
â€” Misrepresent your identity or affiliation
â€” Spam users with unsolicited messages
â€” Manipulate campaign metrics, donor counts, or progress bars artificially
â€” Create fake donor accounts or make self-donations to inflate campaign figures

Violations may result in immediate account suspension and, where appropriate, referral to Nigerian law enforcement authorities.`,
  },
  {
    id: 'third-parties',
    title: '14. Third-Party Services',
    body: `Giviit integrates with third-party services to deliver the Platform, including Paystack (payments), Cloudinary (image storage), Supabase (database and authentication), and Resend (email delivery).

Your use of these services is also governed by their own terms of service and privacy policies. Giviit is not liable for the acts or omissions of these third-party providers, but we select partners who meet appropriate data security standards.

Links to external websites from campaign pages are provided by Creators and do not constitute an endorsement by Giviit.`,
  },
  {
    id: 'disclaimer',
    title: '15. Disclaimer of Warranties',
    body: `The Platform is provided "as is" and "as available" without warranties of any kind, express or implied, to the fullest extent permitted by Nigerian law.

Giviit does not warrant that:
â€” The Platform will be uninterrupted, error-free, or free of viruses
â€” Campaign information is accurate, complete, or up to date
â€” Funds raised will achieve any stated goal
â€” Any particular campaign outcome will be delivered by a Creator

Giviit is a technology platform, not a charity, trustee, or financial institution. We facilitate connections between Creators and donors; we do not guarantee the performance of either party.`,
  },
  {
    id: 'liability',
    title: '16. Limitation of Liability',
    body: `To the maximum extent permitted by applicable Nigerian law, Giviit's total liability to you for any claim arising from or related to your use of the Platform shall not exceed the greater of:

(a) â‚¦50,000, or
(b) The total platform fees paid by you to Giviit in the 12 months preceding the event giving rise to the claim.

Giviit shall not be liable for any indirect, incidental, consequential, or punitive damages, including loss of data, loss of donations, or loss of business opportunity, even if Giviit has been advised of the possibility of such damages.

Nothing in these Terms limits liability for fraud, gross negligence, or any matter that cannot be excluded by Nigerian law.`,
  },
  {
    id: 'indemnification',
    title: '17. Indemnification',
    body: `You agree to indemnify and hold harmless Giviit, its directors, employees, and agents from and against any claims, losses, liabilities, damages, costs, and expenses (including reasonable legal fees) arising from:

â€” Your breach of these Terms
â€” Your campaign content or campaign activity
â€” Your violation of any applicable law
â€” Any claim by a donor arising from your campaign
â€” Your misuse of funds received through the Platform`,
  },
  {
    id: 'termination',
    title: '18. Termination',
    body: `You may delete your account at any time by contacting support@Giviit.ng. Campaign balances must be withdrawn before account deletion; unclaimed balances of less than â‚¦1,000 will be forfeited after 180 days of account inactivity.

Giviit may suspend or terminate your account with or without notice if:
â€” You violate these Terms or any applicable law
â€” We have reasonable grounds to suspect fraud or abuse
â€” Required to do so by a court order or regulatory authority

On termination, your ability to access the Platform and withdraw funds may be restricted pending investigation. Active campaigns may be taken offline.`,
  },
  {
    id: 'governing-law',
    title: '19. Governing Law & Dispute Resolution',
    body: `These Terms are governed by the laws of the Federal Republic of Nigeria. Any dispute arising from or related to these Terms shall first be referred to mediation in Lagos, Nigeria, under the rules of the Lagos Multi-Door Courthouse (LMDC).

If mediation fails within 60 days, the dispute shall be resolved by arbitration in Lagos, Nigeria, under the Arbitration and Conciliation Act (ACA) 2023. The language of arbitration shall be English.

Nothing prevents either party from seeking urgent injunctive relief from a competent Nigerian court.

If you are a consumer and your country of residence provides mandatory consumer protection rights, those rights are not affected by this clause.`,
  },
  {
    id: 'general',
    title: '20. General Provisions',
    body: `Entire agreement: These Terms, together with the Privacy Policy and Cookie Policy, constitute the entire agreement between you and Giviit regarding the Platform.

Severability: If any provision of these Terms is found to be unenforceable, the remaining provisions continue in full force.

No waiver: Giviit's failure to enforce any right or provision does not constitute a waiver of that right or provision.

Assignment: You may not assign your rights under these Terms without our written consent. Giviit may assign its rights to a successor entity in connection with a merger, acquisition, or sale of all or substantially all of its assets.

Force majeure: Giviit is not liable for delays or failures caused by events beyond its reasonable control, including power outages, internet disruptions, acts of God, or government actions.`,
  },
  {
    id: 'email-verification',
    title: '21. Email Verification',
    body: `Users must verify their email address before accessing platform features. Unverified accounts will have limited access.`,
  },
  {
    id: 'inactivity',
    title: '22. Account Inactivity Policy',
    body: `If you have not logged in for an extended period, your saved session will expire and you will be asked to log in again. This does not affect your account, campaigns, or funds — it is simply a security measure.

You are responsible for maintaining account access and withdrawing funds in a timely manner.`,
  },
  {
    id: 'age-restriction',
    title: '23. Age Restriction',
    body: `Users must be 18 years or older to create campaigns. Age is verified through government-issued ID (NIN).

Accounts found to belong to users under 18 will be restricted from campaign creation.`,
  },
  {
    id: 'campaign-documentation',
    title: '24. Campaign Documentation',
    body: `Certain campaign categories require supporting documents for verification. These documents are strictly confidential and will never be shared publicly. They are used solely by Giviit's trust and safety team to verify campaign authenticity.

Uploading false or misleading documents will result in immediate account suspension and potential legal action.`,
  },
  {
    id: 'fraud-policy-refunds',
    title: '25. Fraud Policy and Refunds',
    body: `Giviit maintains a fraud reserve fund of 0.5% of all donations. In the event a campaign is found fraudulent while funds remain on the platform, all donors will be automatically refunded.

Giviit cannot guarantee refunds for funds already withdrawn by campaign creators found to be fraudulent after withdrawal.`,
  },
  {
    id: 'platform-fees-summary',
    title: '26. Platform Fees',
    body: `Giviit charges a 3% platform fee on all funds raised. A 0.5% fraud protection reserve is applied to all donations. These fees are deducted before withdrawal.`,
  },
  {
    id: 'social-media',
    title: '27. Social Media',
    body: `Social media handles provided during campaign creation are publicly displayed. Users are responsible for the accuracy of their social media information.`,
  },
  {
    id: 'dormancy-fund-safety',
    title: '28. Account Dormancy and Fund Safety',
    body: `If your session expires while you have funds pending withdrawal, those withdrawal requests are not affected — simply log back in to continue managing them.

Giviit is not liable for funds left unclaimed due to extended account inactivity.`,
  },
  {
    id: 'contact',
    title: '29. Contact Us',
    body: `For questions about these Terms, please contact:

Giviit Technologies Ltd
Legal & Compliance Team
Email: legal@Giviit.ng
Support: support@Giviit.ng
Address: Lagos, Nigeria

For data protection concerns: privacy@Giviit.ng
For urgent payment issues: Contact Paystack directly via paystack.com/contact`,
  },
];

const NAV_ITEMS = SECTIONS.map(s => ({ id: s.id, label: s.title.replace(/^\d+\.\s/, '') }));

export default function TermsPage() {
  const [active, setActive] = useState(null);

  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) {
      const offset = 96;
      const top = el.getBoundingClientRect().top + window.scrollY - offset;
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
            <h1 className="text-4xl sm:text-5xl font-black mb-4">Terms of Service</h1>
            <p className="text-gray-400 text-sm max-w-xl">
              Please read these terms carefully before using Giviit. They explain your rights, our obligations, and the rules of the platform.
            </p>
            <div className="flex flex-wrap gap-4 mt-6 text-xs text-gray-500">
              <span>Last updated: <span className="text-gray-300">{LAST_UPDATED}</span></span>
              <span>Effective: <span className="text-gray-300">{EFFECTIVE_DATE}</span></span>
            </div>
          </div>
        </div>

        {/* Body: sidebar + content */}
        <div className="max-w-5xl mx-auto px-4 py-14">

          {/* Intro summary box */}
          <div className="border-l-4 border-primary bg-primary/5 pl-5 pr-4 py-4 rounded-r-xl mb-14">
            <p className="text-gray-700 text-sm leading-relaxed">
              <strong className="text-dark">Summary:</strong> Giviit is a crowdfunding platform for Nigerian communities. Creators raise funds, donors give voluntarily, and Giviit charges a 5% platform fee on donations. We verify identity but not campaign outcomes. These Terms govern everyone who uses the platform.
            </p>
            <div className="flex flex-wrap gap-4 mt-3">
              <Link to="/privacy-policy" className="text-primary text-xs font-semibold hover:underline">Privacy Policy â†’</Link>
              <Link to="/cookie-policy" className="text-primary text-xs font-semibold hover:underline">Cookie Policy â†’</Link>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-10">

            {/* Sticky sidebar â€” desktop */}
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

            {/* Main content */}
            <div className="flex-1 min-w-0 space-y-12">
              {SECTIONS.map(({ id, title, body }) => (
                <section key={id} id={id} className="scroll-mt-24">
                  <h2 className="text-lg font-bold text-dark mb-4 pb-2 border-b border-gray-100">
                    {title}
                  </h2>
                  <div className="text-gray-600 text-sm leading-relaxed whitespace-pre-line">
                    {body}
                  </div>
                </section>
              ))}

              {/* Bottom links */}
              <div className="pt-8 border-t border-gray-100 flex flex-wrap gap-4">
                <Link to="/privacy-policy" className="text-primary text-sm font-semibold hover:underline">Privacy Policy</Link>
                <Link to="/cookie-policy" className="text-primary text-sm font-semibold hover:underline">Cookie Policy</Link>
                <a href="mailto:legal@Giviit.ng" className="text-primary text-sm font-semibold hover:underline">legal@Giviit.ng</a>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

