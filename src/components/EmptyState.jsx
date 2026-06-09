import { MdSearchOff } from 'react-icons/md';

export default function EmptyState({ title = 'Nothing here yet', description = '', action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <MdSearchOff className="text-6xl text-gray-300 mb-4" />
      <h3 className="text-lg font-semibold text-gray-600 mb-1">{title}</h3>
      {description && <p className="text-gray-400 text-sm mb-4">{description}</p>}
      {action}
    </div>
  );
}
