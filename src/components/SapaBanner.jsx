import { useState, useEffect, useRef } from 'react';
import { MdClose } from 'react-icons/md';
import { formatCurrency } from '../utils/formatters';

const QUICK_AMOUNTS = [100, 200, 500, 1000, 2000];

export default function SapaBanner({ onDonate, campaign }) {
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const shownRef = useRef(false);

  useEffect(() => {
    if (dismissed || shownRef.current) return;

    // Show after scrolling 70% of page
    const handleScroll = () => {
      const scrollPct = (window.scrollY + window.innerHeight) / document.body.scrollHeight;
      if (scrollPct > 0.7 && !shownRef.current) {
        shownRef.current = true;
        setVisible(true);
      }
    };

    // Also show on exit intent (mouse leaving top of page)
    const handleMouseLeave = (e) => {
      if (e.clientY < 20 && !shownRef.current) {
        shownRef.current = true;
        setVisible(true);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    document.addEventListener('mouseleave', handleMouseLeave);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [dismissed]);

  if (!visible || dismissed) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 p-4 sm:p-6 sm:max-w-sm sm:left-auto sm:right-6 sm:bottom-6">
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden" style={{ boxShadow: '0 8px 40px rgba(0,0,0,0.15)' }}>
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-50">
          <p className="text-sm font-black text-dark">Even ₦100 makes a difference</p>
          <button onClick={() => { setVisible(false); setDismissed(true); }} className="p-1 rounded-full hover:bg-gray-100 transition-colors">
            <MdClose className="text-gray-400 text-lg" />
          </button>
        </div>
        <div className="px-4 py-3">
          <p className="text-xs text-gray-500 mb-3 line-clamp-1">Supporting: {campaign.title}</p>
          <div className="grid grid-cols-5 gap-1.5 mb-3">
            {QUICK_AMOUNTS.map(amt => (
              <button
                key={amt}
                onClick={() => { setDismissed(true); setVisible(false); onDonate(amt); }}
                className="py-2 rounded-xl text-xs font-bold border-2 border-primary/20 text-primary hover:bg-primary hover:text-white hover:border-primary transition-all"
              >
                {amt >= 1000 ? `₦${amt/1000}k` : `₦${amt}`}
              </button>
            ))}
          </div>
          <button
            onClick={() => { setDismissed(true); setVisible(false); onDonate(); }}
            className="w-full py-2.5 rounded-xl text-sm font-bold text-white transition-all"
            style={{ background: 'linear-gradient(135deg, #22c55e, #1a7a4a)', boxShadow: '0 4px 12px rgba(26,122,74,0.3)' }}
          >
            Donate any amount
          </button>
          <p className="text-[10px] text-gray-400 text-center mt-2">No amount is too small. Every kobo counts.</p>
        </div>
      </div>
    </div>
  );
}

// Celebration toast messages
export function getSapaMessage(amount) {
  if (amount <= 500) return { msg: 'Every kobo counts! You just made a difference' };
  if (amount <= 5000) return { msg: "That's incredibly kind of you" };
  return { msg: "You're a hero! This changes everything" };
}
