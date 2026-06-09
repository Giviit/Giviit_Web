import { MdVerified, MdShield } from 'react-icons/md';

export default function GuarantorBadge({ campaign }) {
  if (!campaign.guarantor_name || campaign.guarantor_status !== 'vouched') return null;

  return (
    <div className="rounded-2xl p-5 border-2 border-green-200 bg-gradient-to-br from-green-50 to-emerald-50">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: 'linear-gradient(135deg, #22c55e, #1a7a4a)', boxShadow: '0 4px 12px rgba(26,122,74,0.3)' }}>
          <MdShield className="text-white text-xl" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <p className="text-sm font-black text-dark">Vouched for by a Guarantor</p>
            <span className="flex items-center gap-0.5 text-[10px] font-bold text-green-700 bg-green-100 px-2 py-0.5 rounded-full border border-green-200">
              <MdVerified className="text-xs" /> Verified
            </span>
          </div>
          <p className="text-sm font-semibold text-green-800">
            {campaign.guarantor_name}
            {campaign.guarantor_relationship && (
              <span className="text-green-600 font-normal"> · {campaign.guarantor_relationship}</span>
            )}
          </p>
          {campaign.guarantor_message && (
            <p className="text-xs text-green-700 mt-2 italic leading-relaxed">
              "{campaign.guarantor_message}"
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
