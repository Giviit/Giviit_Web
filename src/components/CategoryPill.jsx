const CATEGORIES = [
  { value: 'all', label: 'All' },
  { value: 'medical', label: 'Medical' },
  { value: 'education', label: 'Education' },
  { value: 'business', label: 'Business' },
  { value: 'emergency', label: 'Emergency' },
  { value: 'funeral', label: 'Funeral' },
  { value: 'church', label: 'Church' },
  { value: 'community', label: 'Community' },
  { value: 'other', label: 'Other' },
];

export { CATEGORIES };

export default function CategoryPill({ value, label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-full text-sm font-medium transition-all border ${
        active
          ? 'bg-primary text-white border-primary'
          : 'bg-white text-gray-600 border-gray-200 hover:border-primary hover:text-primary'
      }`}
    >
      {label}
    </button>
  );
}
