import { useState } from 'react';
import { Link } from 'react-router-dom';
import { MdAccessTime, MdArrowForward } from 'react-icons/md';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { BLOG_POSTS, BLOG_CATEGORIES } from '../mocks/blogData';

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-NG', { year: 'numeric', month: 'long', day: 'numeric' });
}

function PostCard({ post, featured = false }) {
  if (featured) {
    return (
      <Link to={`/blog/${post.slug}`} className="group relative rounded-3xl overflow-hidden block" style={{ minHeight: 420 }}>
        <img src={post.cover} alt={post.title} className="w-full h-full object-cover absolute inset-0 group-hover:scale-105 transition-transform duration-700" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
        <div className="absolute inset-0 flex flex-col justify-end p-8">
          <span className="inline-block bg-primary text-white text-xs font-bold px-3 py-1 rounded-full mb-3 w-fit">
            {post.category}
          </span>
          <h2 className="text-white font-black text-2xl sm:text-3xl leading-tight mb-3 group-hover:underline underline-offset-4 decoration-primary">
            {post.title}
          </h2>
          <p className="text-white/80 text-sm mb-4 line-clamp-2">{post.excerpt}</p>
          <div className="flex items-center gap-4 text-white/60 text-xs">
            <span className="font-semibold text-white/90">{post.author.name}</span>
            <span>{formatDate(post.date)}</span>
            <span className="flex items-center gap-1"><MdAccessTime className="text-sm" /> {post.read_time} min read</span>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link to={`/blog/${post.slug}`} className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg border border-gray-100 transition-all duration-200 hover:-translate-y-1 flex flex-col">
      <div className="relative h-48 overflow-hidden bg-gray-100">
        <img src={post.cover} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-gray-700 text-[11px] font-bold px-2.5 py-0.5 rounded-full">
          {post.category}
        </span>
      </div>
      <div className="p-5 flex flex-col flex-1">
        <h3 className="font-bold text-gray-900 text-base leading-snug mb-2 line-clamp-2 group-hover:text-primary transition-colors">
          {post.title}
        </h3>
        <p className="text-gray-500 text-sm line-clamp-3 mb-4 flex-1">{post.excerpt}</p>
        <div className="flex items-center justify-between pt-3 border-t border-gray-50">
          <div>
            <p className="text-xs font-semibold text-gray-700">{post.author.name}</p>
            <p className="text-[11px] text-gray-400">{formatDate(post.date)}</p>
          </div>
          <span className="flex items-center gap-1 text-[11px] text-gray-400">
            <MdAccessTime className="text-xs" /> {post.read_time} min
          </span>
        </div>
      </div>
    </Link>
  );
}

export default function BlogPage() {
  const [activeCategory, setActiveCategory] = useState('All');

  const featured = BLOG_POSTS.filter(p => p.featured);
  const filtered = activeCategory === 'All'
    ? BLOG_POSTS.filter(p => !p.featured)
    : BLOG_POSTS.filter(p => p.category === activeCategory && !p.featured);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Hero */}
      <div className="pt-24 pb-12 bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="inline-block bg-primary/10 text-primary text-xs font-bold px-3 py-1 rounded-full mb-4 uppercase tracking-widest">
            Blog & News
          </span>
          <h1 className="text-4xl sm:text-5xl font-black text-gray-900 mb-4">
            Stories, Tips & Insights
          </h1>
          <p className="text-gray-500 text-lg max-w-2xl mx-auto">
            Guides for campaign creators, donor tips, success stories, and everything happening in Nigeria's crowdfunding community.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

        {/* Featured posts */}
        {featured.length > 0 && (
          <section className="mb-14">
            <h2 className="text-xl font-black text-gray-900 mb-6">Featured</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {featured.map(p => <PostCard key={p.id} post={p} featured />)}
            </div>
          </section>
        )}

        {/* Category filter */}
        <div className="flex gap-2 flex-wrap mb-8">
          {BLOG_CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                activeCategory === cat
                  ? 'bg-primary text-white shadow-sm'
                  : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Post grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(p => <PostCard key={p.id} post={p} />)}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-16 text-gray-400">
            <p className="text-lg font-semibold">No posts in this category yet.</p>
            <p className="text-sm mt-1">Check back soon.</p>
          </div>
        )}

        {/* Newsletter CTA */}
        <div className="mt-16 rounded-3xl overflow-hidden relative text-center py-16 px-6"
          style={{ background: 'linear-gradient(135deg, #1a7a4a 0%, #22c55e 100%)' }}>
          <h3 className="text-white font-black text-2xl sm:text-3xl mb-3">Stay in the Loop</h3>
          <p className="text-white/80 mb-8 max-w-md mx-auto">Get the latest tips, success stories, and platform updates delivered to your inbox. No spam, ever.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-5 py-3 rounded-xl text-sm outline-none focus:ring-2 focus:ring-white/30"
            />
            <button className="bg-white text-primary font-bold px-6 py-3 rounded-xl text-sm hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 flex-shrink-0">
              Subscribe <MdArrowForward />
            </button>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
