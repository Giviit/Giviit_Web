import { MdCheckCircle, MdRadioButtonUnchecked, MdAccessTime } from 'react-icons/md';
import { formatCurrency } from '../utils/formatters';

export default function MilestoneTracker({ milestones = [], raised = 0 }) {
  if (!milestones.length) return null;

  const sorted = [...milestones].sort((a, b) => a.order_index - b.order_index);
  // Find current milestone (first not reached)
  const currentIdx = sorted.findIndex(m => !m.is_reached);

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <h2 className="text-lg font-bold text-dark mb-5 flex items-center gap-2">
        Fundraising Milestones
        <span className="text-xs font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
          {sorted.filter(m => m.is_reached).length}/{sorted.length} reached
        </span>
      </h2>

      <div className="space-y-0">
        {sorted.map((m, i) => {
          const isReached = m.is_reached;
          const isCurrent = i === currentIdx;
          const isFuture = !isReached && !isCurrent;
          const pctToThis = isCurrent ? Math.min(100, Math.max(0, ((raised - (sorted[i - 1]?.amount || 0)) / (m.amount - (sorted[i - 1]?.amount || 0))) * 100)) : 0;
          const remaining = isReached ? 0 : Math.max(0, m.amount - raised);

          return (
            <div key={m.id || i} className="flex gap-4">
              {/* Connector line */}
              <div className="flex flex-col items-center">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 z-10 transition-all ${
                  isReached ? 'icon-green' : isCurrent ? 'bg-primary/10 border-2 border-primary' : 'bg-gray-100 border-2 border-gray-200'
                }`}>
                  {isReached
                    ? <MdCheckCircle className="text-white text-lg" />
                    : isCurrent
                      ? <MdAccessTime className="text-primary text-lg" />
                      : <MdRadioButtonUnchecked className="text-gray-300 text-lg" />
                  }
                </div>
                {i < sorted.length - 1 && (
                  <div className={`w-0.5 flex-1 my-1 ${isReached ? 'bg-primary' : 'bg-gray-200'}`} style={{ minHeight: '24px' }} />
                )}
              </div>

              {/* Content */}
              <div className={`flex-1 pb-5 ${i === sorted.length - 1 ? 'pb-0' : ''}`}>
                <div className="flex items-start justify-between gap-2 mb-1">
                  <div>
                    <p className={`text-sm font-bold ${isReached ? 'text-primary' : isCurrent ? 'text-dark' : 'text-gray-400'}`}>
                      {m.title}
                    </p>
                    {m.description && (
                      <p className={`text-xs mt-0.5 ${isFuture ? 'text-gray-300' : 'text-gray-500'}`}>{m.description}</p>
                    )}
                  </div>
                  <span className={`text-xs font-bold flex-shrink-0 ${isReached ? 'text-primary' : isCurrent ? 'text-dark' : 'text-gray-300'}`}>
                    {formatCurrency(m.amount)}
                  </span>
                </div>

                {isReached && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                    Reached! Thank you
                  </span>
                )}

                {isCurrent && (
                  <div className="mt-2">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-500">{Math.round(pctToThis)}% of this milestone</span>
                      <span className="text-primary font-semibold">{formatCurrency(remaining)} to go</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${pctToThis}%`, background: 'linear-gradient(90deg, #22c55e, #1a7a4a)' }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
