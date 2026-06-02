import { MdWarning } from 'react-icons/md';

export default function UrgentBadge() {
  return (
    <span className="inline-flex items-center gap-1 bg-red-100 text-red-600 text-xs font-semibold px-1.5 py-0.5 rounded-full">
      <MdWarning />
      Urgent
    </span>
  );
}
