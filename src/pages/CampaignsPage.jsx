import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { MdSearch, MdTune, MdClose } from 'react-icons/md';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import CampaignCard from '../components/CampaignCard';
import CampaignCardSkeleton from '../components/CampaignCardSkeleton';
import CategoryPill, { CATEGORIES } from '../components/CategoryPill';
import EmptyState from '../components/EmptyState';
import api from '../utils/api';
import { Link } from 'react-router-dom';

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'most_funded', label: 'Most Funded' },
  { value: 'urgent', label: 'Urgent' },
  { value: 'ending_soon', label: 'Ending Soon' },
];

export default function CampaignsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchInput, setSearchInput] = useState(searchParams.get('search') || '');
  const [category, setCategory] = useState(searchParams.get('category') || 'all');
  const [sort, setSort] = useState(searchParams.get('sort') || 'newest');
  const [page, setPage] = useState(1);

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['campaigns', category, sort, searchInput, page],
    queryFn: () =>
      api.get('/campaigns', {
        params: {
          category: category === 'all' ? undefined : category,
          sort,
          search: searchInput || undefined,
          page,
          limit: 12,
        },
      }).then(r => r.data),
    keepPreviousData: true,
    staleTime: 2 * 60 * 1000,
  });

  useEffect(() => {
    const params = {};
    if (category !== 'all') params.category = category;
    if (sort !== 'newest') params.sort = sort;
    if (searchInput) params.search = searchInput;
    setSearchParams(params, { replace: true });
    setPage(1);
  }, [category, sort, searchInput]);

  const campaigns = data?.campaigns || [];
  const total = data?.total || 0;
  const totalPages = data?.totalPages || 1;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Header */}
      <div className="bg-dark pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-black text-white mb-2">All Campaigns</h1>
          <p className="text-gray-400">
            {total > 0 ? `${total.toLocaleString()} campaigns found` : 'Discover and support campaigns'}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search + Sort */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-6 flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xl" />
            <input
              type="text"
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              placeholder="Search campaigns..."
              className="w-full pl-10 pr-10 py-2.5 border-2 border-gray-200 rounded-xl focus:border-primary outline-none text-sm"
            />
            {searchInput && (
              <button onClick={() => setSearchInput('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                <MdClose />
              </button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <MdTune className="text-gray-400" />
            <select
              value={sort}
              onChange={e => setSort(e.target.value)}
              className="border-2 border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:border-primary outline-none bg-white"
            >
              {SORT_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Category pills */}
        <div className="flex flex-wrap gap-2 mb-8">
          {CATEGORIES.map(({ value, label }) => (
            <CategoryPill
              key={value}
              value={value}
              label={label}
              active={category === value}
              onClick={() => setCategory(value)}
            />
          ))}
        </div>

        {/* Results */}
        {isLoading ? (
          <div className="grid grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {Array(12).fill(0).map((_, i) => <CampaignCardSkeleton key={i} />)}
          </div>
        ) : campaigns.length === 0 ? (
          <EmptyState
            title="No campaigns found"
            description="Try adjusting your search or filters"
            action={
              <button onClick={() => { setSearchInput(''); setCategory('all'); }} className="bg-primary text-white px-6 py-2.5 rounded-full text-sm font-semibold">
                Clear Filters
              </button>
            }
          />
        ) : (
          <>
            <div className={`grid grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 transition-opacity ${isFetching ? 'opacity-60' : 'opacity-100'}`}>
              {campaigns.map(c => <CampaignCard key={c.id} campaign={c} />)}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-10">
                <button
                  disabled={page === 1}
                  onClick={() => setPage(p => p - 1)}
                  className="px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium disabled:opacity-40 hover:bg-gray-50 transition-colors"
                >
                  Previous
                </button>
                {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => i + 1).map(p => (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${
                      page === p ? 'bg-primary text-white' : 'border border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    {p}
                  </button>
                ))}
                <button
                  disabled={page === totalPages}
                  onClick={() => setPage(p => p + 1)}
                  className="px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium disabled:opacity-40 hover:bg-gray-50 transition-colors"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>

      <Footer />
    </div>
  );
}
