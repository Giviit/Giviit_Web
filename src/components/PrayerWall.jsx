import { useState } from 'react';
import { MdExpandMore, MdExpandLess, MdPerson, MdPublic } from 'react-icons/md';
import { GiPrayerBeads } from 'react-icons/gi';
import { formatTimeAgo } from '../utils/formatters';

const COUNTRY_CODES = {
  'United Kingdom': 'GB', 'United States': 'US', 'Canada': 'CA',
  'Germany': 'DE', 'Netherlands': 'NL', 'Australia': 'AU',
  'South Africa': 'ZA', 'Ghana': 'GH', 'Kenya': 'KE',
};

export default function PrayerWall({ donations = [] }) {
  const [expanded, setExpanded] = useState(false);
  const prayers = donations.filter(d => d.prayer && d.show_prayer !== false);
  if (prayers.length === 0) return null;

  const shown = expanded ? prayers : prayers.slice(0, 4);

  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)', border: '1px solid #fde68a' }}>
      <div className="px-5 py-4 border-b border-amber-200/60">
        <div className="flex items-center gap-2">
          <GiPrayerBeads className="text-xl text-amber-700" />
          <div>
            <h3 className="font-bold text-amber-900 text-sm">Prayer Wall</h3>
            <p className="text-xs text-amber-700">{prayers.length} prayer{prayers.length !== 1 ? 's' : ''} for this campaign</p>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-3">
        {shown.map((d, i) => (
          <div key={d.id || i} className="flex gap-3">
            <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold text-amber-700"
              style={{ background: 'linear-gradient(135deg, #fbbf24, #f59e0b)', boxShadow: '0 2px 8px rgba(245,158,11,0.3)' }}>
              {d.is_anonymous ? <MdPerson className="text-base text-amber-900" /> : d.donor_name?.charAt(0)?.toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span className="text-xs font-semibold text-amber-900 flex items-center gap-1">
                  {d.is_anonymous ? 'Anonymous' : d.donor_name}
                  {d.donor_country && (
                    <span className="text-[9px] font-bold bg-amber-200/60 text-amber-800 px-1 py-0.5 rounded uppercase tracking-wide">
                      {COUNTRY_CODES[d.donor_country] || <MdPublic className="inline text-xs" />}
                    </span>
                  )}
                </span>
                <span className="text-[10px] text-amber-600">{formatTimeAgo(d.created_at)}</span>
              </div>
              <p className="text-sm text-amber-800 leading-relaxed italic">"{d.prayer}"</p>
            </div>
          </div>
        ))}
      </div>

      {prayers.length > 4 && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full py-3 text-sm font-semibold text-amber-700 hover:text-amber-900 flex items-center justify-center gap-1 border-t border-amber-200/60 transition-colors"
        >
          {expanded ? <><MdExpandLess className="text-base" /> Show fewer prayers</> : <><MdExpandMore className="text-base" /> See all {prayers.length} prayers</>}
        </button>
      )}
    </div>
  );
}
