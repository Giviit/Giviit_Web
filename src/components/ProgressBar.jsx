export default function ProgressBar({ percentage, className = '', urgent = false }) {
  const pct = Math.min(100, Math.max(0, percentage));
  const barStyle = urgent
    ? { background: 'linear-gradient(90deg, #ef4444, #dc2626)', boxShadow: '0 0 8px rgba(239,68,68,0.4)' }
    : { background: 'linear-gradient(90deg, #22c55e, #1a7a4a)' };

  return (
    <div className={`w-full bg-gray-200 rounded-full h-2 overflow-hidden ${className}`}>
      <div
        className="h-2 rounded-full transition-all duration-700 ease-out"
        style={{ width: `${pct}%`, ...barStyle }}
      />
    </div>
  );
}
