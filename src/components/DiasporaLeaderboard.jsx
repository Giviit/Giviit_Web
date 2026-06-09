import { MdPublic } from 'react-icons/md';
import { formatCurrency } from '../utils/formatters';

const COUNTRY_CODES = {
  'United Kingdom': 'GB', 'United States': 'US', 'Canada': 'CA',
  'Germany': 'DE', 'Netherlands': 'NL', 'Australia': 'AU',
  'Ireland': 'IE', 'France': 'FR', 'Italy': 'IT',
  'Spain': 'ES', 'Sweden': 'SE', 'Norway': 'NO',
};

const RATES = { GBP: 2050, USD: 1620, CAD: 1180, EUR: 1750, AUD: 1040 };

function toNGN(amount, currency) {
  return amount * (RATES[currency] || 1);
}

export default function DiasporaLeaderboard({ donations = [] }) {
  const diaspora = donations.filter(d => d.donor_country && d.donor_currency && d.donor_currency !== 'NGN');
  if (diaspora.length === 0) return null;

  const top5 = [...diaspora].sort((a, b) => toNGN(b.amount, b.donor_currency) - toNGN(a.amount, a.donor_currency)).slice(0, 5);
  const totalNGN = diaspora.reduce((s, d) => s + toNGN(d.amount, d.donor_currency), 0);

  return (
    <div className="rounded-2xl overflow-hidden border border-blue-200" style={{ background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)' }}>
      <div className="px-5 py-4 border-b border-blue-200/60">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MdPublic className="text-xl text-blue-600" />
            <div>
              <h3 className="font-bold text-blue-900 text-sm">Diaspora Support</h3>
              <p className="text-xs text-blue-600">Nigerians abroad are showing up!</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm font-black text-blue-800">{formatCurrency(totalNGN)}</p>
            <p className="text-[10px] text-blue-500">{diaspora.length} international donors</p>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-2.5">
        {top5.map((d, i) => (
          <div key={d.id || i} className="flex items-center gap-3">
            <div className="w-6 h-6 rounded-full bg-blue-200 flex items-center justify-center text-xs font-black text-blue-700 flex-shrink-0">
              {i + 1}
            </div>
            <span className="text-[11px] font-black bg-blue-200 text-blue-800 px-1.5 py-0.5 rounded flex-shrink-0 uppercase tracking-wide">
              {COUNTRY_CODES[d.donor_country] || 'INT'}
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-blue-900 truncate">
                {d.is_anonymous ? 'Anonymous' : d.donor_name}
              </p>
              <p className="text-[10px] text-blue-500">{d.donor_country}</p>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="text-xs font-black text-blue-800">{formatCurrency(toNGN(d.amount, d.donor_currency))}</p>
              <p className="text-[10px] text-blue-400">{d.donor_currency} {d.amount.toLocaleString()}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
