export function formatCurrency(amount) {
  if (amount === null || amount === undefined) return '₦0';
  return '₦' + Number(amount).toLocaleString('en-NG');
}

export function formatDaysLeft(deadline) {
  if (!deadline) return 'No deadline';
  const now = new Date();
  const end = new Date(deadline);
  if (end < now) return 'Campaign ended';
  const diff = Math.ceil((end - now) / (1000 * 60 * 60 * 24));
  return `${diff} day${diff !== 1 ? 's' : ''} left`;
}

export function formatProgress(raised, goal) {
  if (!goal || goal === 0) return 0;
  const pct = Math.round((Number(raised) / Number(goal)) * 100);
  // A real donation against a huge goal can round down to a literal 0%,
  // making the bar look completely empty even though progress was made.
  if (Number(raised) > 0 && pct === 0) return 1;
  return Math.min(100, pct);
}

export function formatTimeAgo(date) {
  const now = new Date();
  const d = new Date(date);
  const seconds = Math.floor((now - d) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  return `${Math.floor(months / 12)}y ago`;
}

export function stripEmoji(str) {
  if (!str) return str;
  return str.replace(/\p{Extended_Pictographic}/gu, '');
}

// Points at the backend's server-rendered preview page, not the SPA route directly —
// link unfurlers on WhatsApp/Facebook/Telegram don't run JS, so only a server-rendered
// page can show the campaign's actual cover image instead of a generic logo.
export function getCampaignShareUrl(campaign) {
  const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  const backendOrigin = apiBase.replace(/\/api\/?$/, '');
  return `${backendOrigin}/share/campaign/${campaign.slug}`;
}

export function buildWhatsAppUrl(campaign) {
  const name = campaign.title;
  const raised = formatCurrency(campaign.raised_amount);
  const goal = formatCurrency(campaign.goal_amount);
  const url = getCampaignShareUrl(campaign);
  const text = `Help "${name}" reach their goal! They've raised ${raised} of ${goal}. Every donation counts. Donate here: ${url}`;
  return `https://wa.me/?text=${encodeURIComponent(text)}`;
}
