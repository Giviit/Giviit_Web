import { MdVerified } from 'react-icons/md';

export default function VerifiedBadge({ size = 'sm' }) {
  const sizes = { sm: 'text-xs px-1.5 py-0.5', md: 'text-sm px-2 py-1' };
  return (
    <span className={`inline-flex items-center gap-1 bg-green-100 text-primary font-semibold rounded-full ${sizes[size]}`}>
      <MdVerified className="text-primary" />
      Verified
    </span>
  );
}
