import { Link } from 'react-router-dom';
import { MdPeople, MdVerified, MdAccessTime, MdBolt, MdCake, MdCelebration, MdCheck } from 'react-icons/md';
import { CountdownBadge } from './CountdownTimer';
import { formatCurrency, formatDaysLeft, formatProgress } from '../utils/formatters';

export default function CampaignCard({ campaign }) {
  const pct = formatProgress(campaign.raised_amount, campaign.goal_amount);
  const isGoalReached = pct >= 100;
  const isUrgentWithTimer = campaign.is_urgent && campaign.urgency_deadline;

  const birthdayDays = campaign.is_birthday && campaign.birthday_date
    ? Math.ceil((new Date(campaign.birthday_date) - Date.now()) / (1000 * 60 * 60 * 24))
    : null;

  const leftAccent = isUrgentWithTimer
    ? 'before:bg-red-500'
    : campaign.is_birthday
      ? 'before:bg-pink-400'
      : isGoalReached
        ? 'before:bg-green-500'
        : 'before:bg-transparent group-hover:before:bg-green-500';

  const barColor = isUrgentWithTimer
    ? 'from-red-500 to-red-600'
    : isGoalReached
      ? 'from-green-400 to-green-600'
      : 'from-green-500 to-green-700';

  const barGlow = isUrgentWithTimer
    ? '0 0 10px rgba(239,68,68,0.45)'
    : isGoalReached
      ? '0 0 10px rgba(34,197,94,0.45)'
      : 'none';

  return (
    <Link
      to={`/campaign/${campaign.slug}`}
      className={`
        relative bg-white rounded-2xl overflow-hidden flex flex-col group
        shadow-sm hover:shadow-xl
        transition-all duration-300 hover:-translate-y-1
        before:absolute before:inset-y-0 before:left-0 before:w-1 before:rounded-l-2xl before:transition-colors before:duration-300
        ${leftAccent}
        ${isUrgentWithTimer ? 'ring-1 ring-red-300' : campaign.is_birthday ? 'ring-1 ring-pink-200' : 'ring-1 ring-gray-100'}
      `}
    >
      {/* ── Image ── */}
      <div className="relative h-52 overflow-hidden bg-gray-100 flex-shrink-0">
        {campaign.cover_image ? (
          <img
            src={campaign.cover_image}
            alt={campaign.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center">
            <span className="text-gray-300 text-sm">No image</span>
          </div>
        )}

        {/* gradient scrim — bottom only */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

        {/* Top-left: category pill + urgent icon */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5">
          <span className="bg-white/90 backdrop-blur-sm text-gray-700 text-[11px] px-2.5 py-0.5 rounded-full capitalize font-semibold shadow-sm">
            {campaign.category}
          </span>
          {isUrgentWithTimer && (
            <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold flex items-center gap-0.5">
              <MdBolt className="text-[11px]" /> Urgent
            </span>
          )}
        </div>

        {/* Top-right: countdown badge */}
        {isUrgentWithTimer && (
          <div className="absolute top-3 right-3">
            <CountdownBadge deadline={campaign.urgency_deadline} />
          </div>
        )}

        {/* Bottom-left: trust badges */}
        <div className="absolute bottom-3 left-3 flex items-center gap-1.5 flex-wrap">
          {campaign.is_verified && (
            <span className="bg-green-600/90 backdrop-blur-sm text-white text-[10px] px-2 py-0.5 rounded-full font-bold flex items-center gap-0.5">
              <MdVerified className="text-[11px]" /> Verified
            </span>
          )}
          {campaign.guarantor_status === 'vouched' && (
            <span className="bg-blue-600/90 backdrop-blur-sm text-white text-[10px] px-2 py-0.5 rounded-full font-bold">
              Vouched
            </span>
          )}
          {campaign.is_birthday && (
            <span className="bg-pink-500/90 backdrop-blur-sm text-white text-[10px] px-2 py-0.5 rounded-full font-bold inline-flex items-center gap-0.5">
              <MdCake className="text-xs" /> Birthday
            </span>
          )}
        </div>

        {/* Bottom-right: % funded pill */}
        <div className="absolute bottom-3 right-3">
          {isGoalReached ? (
            <span className="bg-green-500 text-white text-[11px] px-2.5 py-1 rounded-full font-black tracking-wide shadow inline-flex items-center gap-0.5">
              <MdCheck className="text-xs" /> Goal Met
            </span>
          ) : (
            <span className={`text-white text-[11px] px-2.5 py-1 rounded-full font-black shadow ${
              pct >= 75 ? 'bg-green-600' : pct >= 40 ? 'bg-green-700/80' : 'bg-gray-700/80'
            }`}>
              {pct}%
            </span>
          )}
        </div>
      </div>

      {/* ── Content ── */}
      <div className="p-4 flex flex-col flex-1 gap-3">

        {/* Title */}
        <div>
          <h3 className="font-bold text-gray-900 text-sm leading-snug line-clamp-2 group-hover:text-green-700 transition-colors duration-200">
            {campaign.is_birthday && <MdCake className="inline mr-1 text-pink-500 text-sm" />}
            {campaign.title}
          </h3>
          {campaign.is_birthday && birthdayDays !== null && (
            <p className="text-[11px] text-pink-500 font-semibold mt-1 flex items-center gap-1">
              {birthdayDays <= 0
                ? <><MdCelebration className="text-sm" /> Today is their birthday!</>
                : <><MdCake className="text-sm" /> Birthday in {birthdayDays} day{birthdayDays !== 1 ? 's' : ''}</>}
            </p>
          )}
        </div>

        {/* Progress bar */}
        <div className="space-y-1.5">
          <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
            <div
              className={`h-2.5 rounded-full bg-gradient-to-r ${barColor} transition-all duration-700 ease-out`}
              style={{ width: `${Math.min(pct, 100)}%`, boxShadow: barGlow }}
            />
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-end justify-between mt-auto pt-1 border-t border-gray-50">
          <div>
            <p className="text-green-700 font-black text-base leading-none">
              {formatCurrency(campaign.raised_amount)}
            </p>
            <p className="text-gray-400 text-[11px] mt-0.5">
              of {formatCurrency(campaign.goal_amount)}
            </p>
          </div>
          <div className="text-right space-y-0.5">
            <p className="flex items-center justify-end gap-1 text-[11px] text-gray-500">
              <MdPeople className="text-gray-400 text-xs" />
              {(campaign.donor_count || 0).toLocaleString()} donors
            </p>
            <p className="flex items-center justify-end gap-1 text-[11px] text-gray-400">
              <MdAccessTime className="text-gray-300 text-xs" />
              {formatDaysLeft(campaign.deadline)}
            </p>
          </div>
        </div>
      </div>
    </Link>
  );
}
