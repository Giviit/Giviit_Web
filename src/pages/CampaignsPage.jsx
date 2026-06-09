import { useState, useEffect, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  MdSearch, MdClose, MdLocalHospital, MdSchool, MdBusiness,
  MdWarning, MdFavorite, MdChurch, MdGroups, MdStar,
  MdArrowForward, MdBolt, MdGridView, MdChevronLeft, MdChevronRight,
} from 'react-icons/md';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import CampaignCard from '../components/CampaignCard';
import CampaignCardSkeleton from '../components/CampaignCardSkeleton';
import EmptyState from '../components/EmptyState';
import api from '../utils/api';

/* ─── constants ────────────────────────────────────────────────────── */
const CATEGORY_TABS = [
  { value: 'all',       label: 'All Campaigns', icon: MdGridView,      iconColor: 'text-gray-500',   activeBg: 'bg-dark' },
  { value: 'medical',   label: 'Medical',        icon: MdLocalHospital, iconColor: 'text-red-500',    activeBg: 'bg-red-500' },
  { value: 'education', label: 'Education',      icon: MdSchool,        iconColor: 'text-blue-500',   activeBg: 'bg-blue-500' },
  { value: 'business',  label: 'Business',       icon: MdBusiness,      iconColor: 'text-amber-500',  activeBg: 'bg-amber-500' },
  { value: 'emergency', label: 'Emergency',      icon: MdBolt,          iconColor: 'text-orange-500', activeBg: 'bg-orange-500' },
  { value: 'funeral',   label: 'Memorial',       icon: MdFavorite,      iconColor: 'text-purple-500', activeBg: 'bg-purple-500' },
  { value: 'church',    label: 'Faith',          icon: MdChurch,        iconColor: 'text-indigo-500', activeBg: 'bg-indigo-500' },
  { value: 'community', label: 'Community',      icon: MdGroups,        iconColor: 'text-green-600',  activeBg: 'bg-green-600' },
  { value: 'other',     label: 'Other',          icon: MdStar,          iconColor: 'text-gray-400',   activeBg: 'bg-gray-500' },
];

const SORT_OPTIONS = [
  { value: 'newest',     label: 'Newest' },
  { value: 'most_funded', label: 'Most Funded' },
  { value: 'urgent',     label: 'Urgent' },
  { value: 'ending_soon', label: 'Ending Soon' },
];

/* ─── Pagination helper ────────────────────────────────────────────── */
function getPageRange(current, total) {
  const delta = 2;
  const range = [];
  for (let i = Math.max(1, current - delta); i <= Math.min(total, current + delta); i++) {
    range.push(i);
  }
  if (range[0] > 1) {
    if (range[0] > 2) range.unshift('…');
    range.unshift(1);
  }
  if (range[range.length - 1] < total) {
    if (range[range.length - 1] < total - 1) range.push('…');
    range.push(total);
  }
  return range;
}

/* ─── Page ─────────────────────────────────────────────────────────── */
export default function CampaignsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchInput, setSearchInput] = useState(searchParams.get('search') || '');
  const [category, setCategory] = useState(searchParams.get('category') || 'all');
  const [sort, setSort] = useState(searchParams.get('sort') || 'newest');
  const [page, setPage] = useState(1);
  const tabBarRef = useRef(null);
  const topRef = useRef(null);

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

  const activeCat = CATEGORY_TABS.find(c => c.value === category);
  const ActiveCatIcon = activeCat?.icon;
  const hasFilters = category !== 'all' || searchInput;

  const handlePageChange = (p) => {
    setPage(p);
    topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="min-h-screen bg-[#f9f6f1]" ref={topRef}>
      <Navbar />

      {/* ── HERO / SEARCH HEADER ── */}
      <div className="bg-dark relative overflow-hidden pt-16">
        <div
          className="absolute inset-0 opacity-[0.04] pointer-events-none"
          style={{ backgroundImage: 'radial-gradient(circle, #f5a623 1px, transparent 1px)', backgroundSize: '30px 30px' }}
        />
        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-dark to-transparent" />

        <div className="relative max-w-3xl mx-auto px-6 sm:px-10 py-16 sm:py-20 text-center">
          <span className="inline-flex items-center gap-2 bg-white/10 border border-white/15 text-white/60 text-xs font-bold px-4 py-1.5 rounded-full mb-6 uppercase tracking-widest">
            <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
            {total > 0 ? `${total.toLocaleString()} live campaigns` : 'Live campaigns'}
          </span>

          <h1 className="font-black text-white mb-3" style={{ fontSize: 'clamp(2.2rem, 6vw, 3.6rem)', letterSpacing: '-0.03em', lineHeight: 1.1 }}>
            Find a Campaign
            <br />
            <span className="text-accent">to Support</span>
          </h1>
          <p className="text-gray-400 mb-10 text-base sm:text-lg">
            Every campaign is verified by our team. Browse, filter, and give with confidence.
          </p>

          {/* Search bar */}
          <div className="relative">
            <MdSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl pointer-events-none" />
            <input
              type="text"
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              placeholder="Search by title, story, or cause…"
              className="w-full pl-12 pr-12 py-4 bg-white/10 border border-white/15 text-white placeholder:text-gray-500 rounded-2xl focus:outline-none focus:border-accent focus:bg-white/15 transition-all text-sm backdrop-blur-sm"
            />
            {searchInput && (
              <button
                onClick={() => setSearchInput('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
              >
                <MdClose className="text-lg" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── STICKY FILTER BAR ── */}
      <div className="bg-white border-b border-gray-100 sticky top-16 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide py-3" ref={tabBarRef}>
            {/* Category tabs */}
            {CATEGORY_TABS.map(({ value, label, icon: Icon, iconColor, activeBg }) => (
              <button
                key={value}
                onClick={() => setCategory(value)}
                className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs sm:text-sm font-semibold whitespace-nowrap transition-all flex-shrink-0 ${
                  category === value
                    ? `${activeBg} text-white shadow-sm`
                    : 'text-gray-500 hover:text-dark bg-gray-100 hover:bg-gray-200'
                }`}
              >
                <Icon className={`text-sm ${category === value ? 'text-white' : iconColor}`} />
                {label}
              </button>
            ))}

            {/* Separator */}
            <div className="w-px h-5 bg-gray-200 mx-1 flex-shrink-0" />

            {/* Sort pills */}
            {SORT_OPTIONS.map(({ value, label }) => (
              <button
                key={value}
                onClick={() => setSort(value)}
                className={`px-4 py-2 rounded-full text-xs sm:text-sm font-semibold whitespace-nowrap transition-all flex-shrink-0 ${
                  sort === value
                    ? 'bg-dark text-white'
                    : 'text-gray-500 hover:text-dark bg-gray-100 hover:bg-gray-200'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── MAIN CONTENT ── */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-10">

        {/* Results meta bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-7">
          <div className="flex items-center flex-wrap gap-2">
            {isLoading ? (
              <div className="h-5 bg-gray-200 rounded w-32 animate-pulse" />
            ) : (
              <span className="text-dark font-black text-sm">
                {total > 0 ? `${total.toLocaleString()} campaign${total !== 1 ? 's' : ''}` : 'No campaigns'}
              </span>
            )}

            {/* Active filter chips */}
            {category !== 'all' && (
              <span className={`inline-flex items-center gap-1.5 ${activeCat?.activeBg || 'bg-primary'} text-white text-xs font-bold px-3 py-1 rounded-full`}>
                {ActiveCatIcon && <ActiveCatIcon className="text-xs" />}
                {activeCat?.label}
                <button
                  onClick={() => setCategory('all')}
                  className="hover:bg-white/20 rounded-full p-0.5 transition-colors ml-0.5"
                >
                  <MdClose className="text-[10px]" />
                </button>
              </span>
            )}

            {searchInput && (
              <span className="inline-flex items-center gap-1.5 bg-gray-200 text-gray-700 text-xs font-bold px-3 py-1 rounded-full">
                <MdSearch className="text-xs" />
                "{searchInput}"
                <button onClick={() => setSearchInput('')} className="hover:bg-gray-300 rounded-full p-0.5 transition-colors ml-0.5">
                  <MdClose className="text-[10px]" />
                </button>
              </span>
            )}

            {hasFilters && (
              <button
                onClick={() => { setSearchInput(''); setCategory('all'); setSort('newest'); }}
                className="text-gray-400 hover:text-red-500 text-xs font-semibold transition-colors underline underline-offset-2"
              >
                Clear all
              </button>
            )}
          </div>

          <Link
            to="/register"
            className="inline-flex items-center gap-2 bg-accent hover:bg-accent/90 text-white font-bold px-5 py-2.5 rounded-full text-sm transition-all hover:scale-105 shadow-md shadow-accent/20 flex-shrink-0"
          >
            Start a Campaign <MdArrowForward className="text-sm" />
          </Link>
        </div>

        {/* Grid */}
        {isLoading ? (
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-5">
            {Array(12).fill(0).map((_, i) => <CampaignCardSkeleton key={i} />)}
          </div>
        ) : campaigns.length === 0 ? (
          <div className="py-20">
            <EmptyState
              title="No campaigns found"
              description={
                hasFilters
                  ? 'Try adjusting your search or clearing the filters'
                  : 'No campaigns are live right now — check back soon'
              }
              action={
                hasFilters && (
                  <button
                    onClick={() => { setSearchInput(''); setCategory('all'); }}
                    className="bg-dark text-white px-6 py-2.5 rounded-full text-sm font-semibold hover:bg-primary transition-colors"
                  >
                    Clear Filters
                  </button>
                )
              }
            />
          </div>
        ) : (
          <>
            <div className={`grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-5 transition-opacity duration-200 ${isFetching ? 'opacity-50' : 'opacity-100'}`}>
              {campaigns.map(c => <CampaignCard key={c.id} campaign={c} />)}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-14 flex flex-col sm:flex-row items-center justify-between gap-4 pt-8 border-t border-gray-200">
                <p className="text-gray-500 text-sm">
                  Page <span className="font-bold text-dark">{page}</span> of <span className="font-bold text-dark">{totalPages}</span>
                  {' '}·{' '}{total.toLocaleString()} campaigns
                </p>

                <div className="flex items-center gap-1.5">
                  <button
                    disabled={page === 1}
                    onClick={() => handlePageChange(page - 1)}
                    className="w-9 h-9 rounded-xl border border-gray-200 flex items-center justify-center hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    <MdChevronLeft className="text-lg text-gray-600" />
                  </button>

                  {getPageRange(page, totalPages).map((p, i) =>
                    p === '…' ? (
                      <span key={`ellipsis-${i}`} className="w-9 h-9 flex items-center justify-center text-gray-400 text-sm">…</span>
                    ) : (
                      <button
                        key={p}
                        onClick={() => handlePageChange(p)}
                        className={`w-9 h-9 rounded-xl text-sm font-semibold transition-all ${
                          page === p
                            ? 'bg-dark text-white shadow-sm'
                            : 'border border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300'
                        }`}
                      >
                        {p}
                      </button>
                    )
                  )}

                  <button
                    disabled={page === totalPages}
                    onClick={() => handlePageChange(page + 1)}
                    className="w-9 h-9 rounded-xl border border-gray-200 flex items-center justify-center hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    <MdChevronRight className="text-lg text-gray-600" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {/* Bottom CTA strip */}
        {!isLoading && campaigns.length > 0 && (
          <div className="mt-16 bg-dark rounded-3xl p-8 sm:p-10 flex flex-col sm:flex-row items-center gap-6 justify-between">
            <div>
              <p className="font-black text-white text-xl sm:text-2xl leading-tight mb-1">
                Don't see your cause here?
              </p>
              <p className="text-gray-400 text-sm">Start your own campaign — it takes under 5 minutes and is completely free.</p>
            </div>
            <Link
              to="/register"
              className="inline-flex items-center gap-2 bg-accent hover:bg-accent/90 text-white font-bold px-8 py-4 rounded-full transition-all hover:scale-105 shadow-lg shadow-accent/20 text-sm flex-shrink-0"
            >
              Start a Campaign <MdArrowForward />
            </Link>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
