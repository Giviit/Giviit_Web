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

  const barColor = isUrgentWithTimer ? 'bg-red-500' : 'bg-primary';

  return (
    <Link
      to={`/campaign/${campaign.slug}`}
      className="relative bg-white rounded-xl overflow-hidden flex flex-col group border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all duration-200"
    >
      {/* ── Image ── */}
      <div className="relative h-32 sm:h-44 overflow-hidden bg-gray-100 flex-shrink-0">
        {campaign.cover_image ? (
          <img
            src={campaign.cover_image}
            alt={campaign.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center">
            <span className="text-gray-300 text-xs">No image</span>
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />

        {/* Top-left: category + urgent */}
        <div className="absolute top-2 left-2 flex items-center gap-1">
          <span className="bg-white/90 backdrop-blur-sm text-gray-700 text-[10px] px-2 py-0.5 rounded-full capitalize font-semibold shadow-sm leading-tight">
            {campaign.category}
          </span>
          {isUrgentWithTimer && (
            <span className="bg-red-500 text-white text-[9px] px-1.5 py-0.5 rounded-full font-bold flex items-center gap-0.5 leading-tight">
              <MdBolt className="text-[10px]" /> Urgent
            </span>
          )}
        </div>

        {/* Top-right: countdown */}
        {isUrgentWithTimer && (
          <div className="absolute top-2 right-2">
            <CountdownBadge deadline={campaign.urgency_deadline} />
          </div>
        )}

        {/* Bottom-left: trust badges */}
        <div className="absolute bottom-2 left-2 flex items-center gap-1 flex-wrap">
          {campaign.is_verified && (
            <span className="bg-green-600/90 backdrop-blur-sm text-white text-[9px] px-1.5 py-0.5 rounded-full font-bold flex items-center gap-0.5 leading-tight">
              <MdVerified className="text-[10px]" /> Verified
            </span>
          )}
          {campaign.guarantor_status === 'vouched' && (
            <span className="bg-blue-600/90 backdrop-blur-sm text-white text-[9px] px-1.5 py-0.5 rounded-full font-bold leading-tight">
              Vouched
            </span>
          )}
          {campaign.is_birthday && (
            <span className="bg-pink-500/90 backdrop-blur-sm text-white text-[9px] px-1.5 py-0.5 rounded-full font-bold inline-flex items-center gap-0.5 leading-tight">
              <MdCake className="text-[10px]" /> Bday
            </span>
          )}
        </div>

        {/* Bottom-right: % funded */}
        <div className="absolute bottom-2 right-2">
          {isGoalReached ? (
            <span className="bg-green-500 text-white text-[9px] px-2 py-0.5 rounded-full font-black shadow inline-flex items-center gap-0.5 leading-tight">
              <MdCheck className="text-[10px]" /> Met
            </span>
          ) : (
            <span className={`text-white text-[9px] px-2 py-0.5 rounded-full font-black shadow leading-tight ${
              pct >= 75 ? 'bg-green-600' : pct >= 40 ? 'bg-green-700/80' : 'bg-gray-700/80'
            }`}>
              {pct}%
            </span>
          )}
        </div>
      </div>

      {/* ── Content ── */}
      <div className="p-2.5 sm:p-3.5 flex flex-col flex-1 gap-2">

        {/* Title */}
        <h3 className="font-bold text-gray-900 text-[11px] sm:text-sm leading-tight line-clamp-2 group-hover:text-green-700 transition-colors duration-200">
          {campaign.is_birthday && <MdCake className="inline mr-0.5 text-pink-500 text-xs" />}
          {campaign.title}
        </h3>

        {campaign.is_birthday && birthdayDays !== null && (
          <p className="text-[10px] text-pink-500 font-semibold flex items-center gap-0.5 -mt-1">
            {birthdayDays <= 0
              ? <><MdCelebration className="text-xs" /> Today!</>
              : <><MdCake className="text-xs" /> In {birthdayDays}d</>}
          </p>
        )}

        {/* Progress bar */}
        <div className="w-full bg-gray-100 rounded-full h-1 sm:h-1.5 overflow-hidden">
          <div
            className={`h-full rounded-full ${barColor} transition-all duration-500`}
            style={{ width: `${Math.min(pct, 100)}%` }}
          />
        </div>

        {/* Stats */}
        <div className="mt-auto pt-1.5 border-t border-gray-50">
          <p className="text-green-700 font-black text-xs sm:text-sm leading-none">
            {formatCurrency(campaign.raised_amount)}
          </p>
          <div className="flex items-center justify-between mt-1">
            <p className="text-gray-400 text-[10px]">
              of {formatCurrency(campaign.goal_amount)}
            </p>
            <div className="flex items-center gap-1.5">
              <span className="flex items-center gap-0.5 text-[10px] text-gray-400">
                <MdPeople className="text-[9px]" />
                {(campaign.donor_count || 0).toLocaleString()}
              </span>
              <span className="flex items-center gap-0.5 text-[10px] text-gray-400">
                <MdAccessTime className="text-[9px]" />
                {formatDaysLeft(campaign.deadline)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
