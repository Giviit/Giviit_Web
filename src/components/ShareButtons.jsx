import { FaWhatsapp, FaFacebook, FaTwitter } from 'react-icons/fa';
import { MdContentCopy, MdCheck } from 'react-icons/md';
import { useState } from 'react';
import { buildWhatsAppUrl } from '../utils/formatters';

export default function ShareButtons({ campaign }) {
  const [copied, setCopied] = useState(false);
  const pageUrl = window.location.href;
  const waUrl = buildWhatsAppUrl(campaign, window.location.origin);
  const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(pageUrl)}`;
  const twUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(`Support "${campaign.title}" on Giviit`)}&url=${encodeURIComponent(pageUrl)}`;

  const copyLink = () => {
    navigator.clipboard.writeText(pageUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-wrap gap-2">
      <a
        href={waUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
      >
        <FaWhatsapp className="text-lg" />
        Share on WhatsApp
      </a>
      <a
        href={fbUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
      >
        <FaFacebook />
        Facebook
      </a>
      <a
        href={twUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 bg-sky-500 hover:bg-sky-600 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
      >
        <FaTwitter />
        Twitter
      </a>
      <button
        onClick={copyLink}
        className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
      >
        {copied ? <MdCheck className="text-primary" /> : <MdContentCopy />}
        {copied ? 'Copied!' : 'Copy Link'}
      </button>
    </div>
  );
}

