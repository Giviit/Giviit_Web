import { Link, useSearchParams } from 'react-router-dom';
import { MdCheckCircle, MdCalendarToday, MdEmail } from 'react-icons/md';

export default function PledgeConfirmPage() {
  const [params] = useSearchParams();
  const reference = params.get('reference') || 'PLEDGE_DEMO';

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 max-w-md w-full p-8 text-center">
        <div className="w-16 h-16 rounded-2xl icon-green flex items-center justify-center mx-auto mb-5">
          <MdCheckCircle className="text-white text-3xl" />
        </div>
        <h1 className="text-2xl font-black text-dark mb-2">Pledge Confirmed!</h1>
        <p className="text-gray-500 text-sm mb-6 leading-relaxed">
          Your first installment has been received. You'll get email reminders before each upcoming payment.
        </p>

        <div className="bg-gray-50 rounded-2xl p-4 mb-6 space-y-3 text-left">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500 flex items-center gap-1.5"><MdCalendarToday className="text-primary" /> Reference</span>
            <span className="font-mono font-semibold text-dark text-xs">{reference}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500 flex items-center gap-1.5"><MdEmail className="text-primary" /> Reminders</span>
            <span className="font-semibold text-dark text-xs">Sent to your email</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10 mb-6 text-left">
          <p className="text-xs text-primary font-bold uppercase tracking-wide mb-1">What happens next?</p>
          <ul className="text-xs text-gray-600 space-y-1">
            <li>• You'll receive an email reminder before each payment date</li>
            <li>• Click the link in the email to pay the next installment</li>
            <li>• You can cancel anytime by contacting the campaign creator</li>
          </ul>
        </div>

        <Link to="/campaigns" className="block w-full py-3 rounded-xl text-white font-bold text-sm transition-all hover:opacity-90"
          style={{ background: 'linear-gradient(135deg, #22c55e, #1a7a4a)', boxShadow: '0 4px 12px rgba(26,122,74,0.3)' }}>
          Browse More Campaigns
        </Link>
      </div>
    </div>
  );
}
