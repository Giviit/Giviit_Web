import { useState, useEffect } from 'react';
import { MdBolt } from 'react-icons/md';
import { formatCurrency } from '../utils/formatters';

function pad(n) { return String(n).padStart(2, '0'); }

function getTimeLeft(deadline) {
  const diff = new Date(deadline) - Date.now();
  if (diff <= 0) return null;
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const secs = Math.floor((diff % (1000 * 60)) / 1000);
  return { days, hours, mins, secs };
}

// Full banner version for campaign detail page
export function UrgencyBanner({ campaign }) {
  const [time, setTime] = useState(() => getTimeLeft(campaign.urgency_deadline));

  useEffect(() => {
    if (!campaign.urgency_deadline) return;
    const id = setInterval(() => setTime(getTimeLeft(campaign.urgency_deadline)), 1000);
    return () => clearInterval(id);
  }, [campaign.urgency_deadline]);

  if (!campaign.is_urgent || !campaign.urgency_deadline) return null;

  const stillNeeded = Math.max(0, campaign.goal_amount - campaign.raised_amount);

  return (
    <div className="rounded-2xl overflow-hidden border-2 border-red-400 mb-4" style={{ background: 'linear-gradient(135deg, #7f1d1d 0%, #991b1b 50%, #7f1d1d 100%)' }}>
      <div className="px-5 py-4 flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-red-400/20 flex items-center justify-center flex-shrink-0 border border-red-400/30">
          <MdBolt className="text-red-300 text-xl animate-pulse" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-white font-black text-sm flex items-center gap-2">
            URGENT
            {campaign.urgency_reason && <span className="font-normal text-red-200">— {campaign.urgency_reason}</span>}
          </p>
          <p className="text-red-200 text-xs mt-0.5">{formatCurrency(stillNeeded)} still needed</p>
        </div>
      </div>

      {time && (
        <div className="px-5 pb-4 flex gap-3">
          {[
            { val: pad(time.days), label: 'Days' },
            { val: pad(time.hours), label: 'Hours' },
            { val: pad(time.mins), label: 'Mins' },
            { val: pad(time.secs), label: 'Secs' },
          ].map(({ val, label }) => (
            <div key={label} className="flex-1 bg-black/20 rounded-xl py-2 text-center border border-red-500/20">
              <p className="text-2xl font-black text-white tabular-nums">{val}</p>
              <p className="text-[10px] text-red-300 font-semibold uppercase tracking-wide">{label}</p>
            </div>
          ))}
        </div>
      )}
      {!time && <p className="px-5 pb-4 text-red-300 text-sm font-semibold">Deadline has passed</p>}
    </div>
  );
}

// Compact version for campaign cards
export function CountdownBadge({ deadline }) {
  const [time, setTime] = useState(() => getTimeLeft(deadline));
  useEffect(() => {
    const id = setInterval(() => setTime(getTimeLeft(deadline)), 1000);
    return () => clearInterval(id);
  }, [deadline]);

  if (!time) return null;

  return (
    <div className="flex items-center gap-1 text-[10px] font-bold text-red-600 bg-red-50 border border-red-200 px-2 py-1 rounded-full">
      <MdBolt className="text-xs" />
      {time.days > 0 ? `${time.days}d ${pad(time.hours)}h` : `${pad(time.hours)}:${pad(time.mins)}:${pad(time.secs)}`}
    </div>
  );
}
