import { Link, useParams, Navigate } from 'react-router-dom';
import { MdArrowBack, MdAccessTime, MdCalendarToday, MdArrowForward } from 'react-icons/md';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { BLOG_POSTS } from '../mocks/blogData';

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-NG', { year: 'numeric', month: 'long', day: 'numeric' });
}

export default function BlogPostPage() {
  const { slug } = useParams();
  const post = BLOG_POSTS.find(p => p.slug === slug);

  if (!post) return <Navigate to="/blog" replace />;

  const related = BLOG_POSTS.filter(p => p.id !== post.id && (p.category === post.category || p.featured)).slice(0, 3);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Hero image */}
      <div className="relative h-[340px] sm:h-[480px] overflow-hidden">
        <img src={post.cover} alt={post.title} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 max-w-3xl mx-auto px-4 sm:px-6 pb-10">
          <Link to="/blog" className="inline-flex items-center gap-1 text-white/70 hover:text-white text-sm mb-4 transition-colors">
            <MdArrowBack className="text-base" /> Back to Blog
          </Link>
          <span className="inline-block bg-primary text-white text-xs font-bold px-3 py-1 rounded-full mb-3">
            {post.category}
          </span>
          <h1 className="text-white font-black text-2xl sm:text-4xl leading-tight">{post.title}</h1>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">

        {/* Author + meta */}
        <div className="flex flex-wrap items-center gap-4 pb-6 border-b border-gray-200 mb-8">
          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
            <span className="text-white font-bold text-sm">{post.author.name.charAt(0)}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-gray-900 text-sm">{post.author.name}</p>
            <p className="text-gray-400 text-xs">{post.author.role}</p>
          </div>
          <div className="flex items-center gap-4 text-gray-400 text-xs">
            <span className="flex items-center gap-1"><MdCalendarToday className="text-sm" />{formatDate(post.date)}</span>
            <span className="flex items-center gap-1"><MdAccessTime className="text-sm" />{post.read_time} min read</span>
          </div>
        </div>

        {/* Excerpt */}
        <p className="text-lg text-gray-600 leading-relaxed font-medium mb-8 border-l-4 border-primary pl-5">
          {post.excerpt}
        </p>

        {/* Body */}
        <div
          className="prose prose-lg max-w-none text-gray-700 leading-relaxed
            prose-headings:font-black prose-headings:text-gray-900 prose-headings:mt-8 prose-headings:mb-3
            prose-h2:text-xl prose-h2:border-b prose-h2:border-gray-100 prose-h2:pb-2
            prose-p:mb-4 prose-ul:my-4 prose-li:mb-1 prose-li:text-gray-700
            prose-strong:text-gray-900 prose-em:text-gray-600"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mt-10 pt-6 border-t border-gray-200">
          {post.tags.map(tag => (
            <span key={tag} className="bg-gray-100 text-gray-600 text-xs font-semibold px-3 py-1.5 rounded-full capitalize">
              #{tag}
            </span>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-10 rounded-2xl p-7 text-center"
          style={{ background: 'linear-gradient(135deg, #f0fdf4, #dcfce7)', border: '1px solid #bbf7d0' }}>
          <h3 className="font-black text-gray-900 text-xl mb-2">Ready to make a difference?</h3>
          <p className="text-gray-600 text-sm mb-5">Start a campaign or donate to causes that matter to you.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/campaigns" className="bg-primary text-white font-bold px-6 py-3 rounded-xl text-sm hover:bg-primary/90 transition-colors">
              Browse Campaigns
            </Link>
            <Link to="/dashboard/campaigns/create" className="bg-white border-2 border-primary text-primary font-bold px-6 py-3 rounded-xl text-sm hover:bg-primary/5 transition-colors">
              Start a Campaign
            </Link>
          </div>
        </div>
      </div>

      {/* Related posts */}
      {related.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-black text-gray-900">More from the Blog</h2>
            <Link to="/blog" className="text-primary text-sm font-semibold flex items-center gap-1 hover:gap-2 transition-all">
              View all <MdArrowForward />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {related.map(p => (
              <Link key={p.id} to={`/blog/${p.slug}`} className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md border border-gray-100 transition-all hover:-translate-y-0.5 flex flex-col">
                <div className="h-40 overflow-hidden bg-gray-100">
                  <img src={p.cover} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
                <div className="p-4 flex flex-col flex-1">
                  <span className="text-[11px] font-bold text-primary mb-1">{p.category}</span>
                  <h4 className="font-bold text-gray-900 text-sm line-clamp-2 group-hover:text-primary transition-colors flex-1">{p.title}</h4>
                  <p className="text-xs text-gray-400 mt-2 flex items-center gap-1"><MdAccessTime className="text-xs" />{p.read_time} min read</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
