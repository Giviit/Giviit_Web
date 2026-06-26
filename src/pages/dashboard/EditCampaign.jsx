import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { MdArrowBack, MdSave } from 'react-icons/md';
import DashboardLayout from '../../components/DashboardLayout';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import { stripEmoji, formatCurrency } from '../../utils/formatters';
import LoadingSpinner from '../../components/LoadingSpinner';

const CATEGORIES = ['medical', 'education', 'business', 'emergency', 'funeral', 'church', 'community', 'other'];
const MAX_GOAL_AMOUNT = 50000000;

export default function EditCampaign() {
  const { id } = useParams();
  const navigate = useNavigate();

  // Fetch campaign data
  const { data, isLoading } = useQuery({
    queryKey: ['campaign-edit', id],
    queryFn: () => api.get('/campaigns?my=true').then(r => {
      const c = r.data.campaigns?.find(c => c.id === id);
      return c || r.data.campaigns?.[0];
    }),
  });

  const [form, setForm] = useState({
    title: '', category: '', goal_amount: '',
    deadline: '', description: '', story: '', is_urgent: false,
    prayer_wall_enabled: false,
  });
  const [loading, setLoading] = useState(false);

  // Populate form when data loads
  useEffect(() => {
    if (data) {
      setForm({
        title: data.title || '',
        category: data.category || '',
        goal_amount: data.goal_amount?.toString() || '',
        deadline: data.deadline ? data.deadline.split('T')[0] : '',
        description: data.description || '',
        story: data.story?.replace(/<[^>]+>/g, '') || '',
        is_urgent: data.is_urgent || false,
        prayer_wall_enabled: data.prayer_wall_enabled || false,
      });
    }
  }, [data]);

  const handleChange = (field) => (e) => {
    const val = e.target.type === 'checkbox' ? e.target.checked : stripEmoji(e.target.value);
    setForm(p => ({ ...p, [field]: val }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.category || !form.goal_amount || !form.description) {
      toast.error('Please fill all required fields');
      return;
    }
    if (Number(form.goal_amount) > MAX_GOAL_AMOUNT) {
      toast.error(`Campaign goals are capped at ${formatCurrency(MAX_GOAL_AMOUNT)}. Need more? Contact admin at support@giviit.ng.`);
      return;
    }
    setLoading(true);
    try {
      await api.put(`/campaigns/${id}`, {
        ...form,
        goal_amount: Number(form.goal_amount),
        story: `<p>${form.story}</p>`,
      });
      toast.success('Campaign updated successfully');
      navigate('/dashboard/campaigns');
    } catch {
      toast.error('Failed to update campaign');
    } finally {
      setLoading(false);
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="py-16"><LoadingSpinner /></div>
      </DashboardLayout>
    );
  }

  const today = new Date().toISOString().split('T')[0];

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto">
        <button
          onClick={() => navigate('/dashboard/campaigns')}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-dark transition-colors mb-6"
        >
          <MdArrowBack /> Back to My Campaigns
        </button>

        <div className="mb-6">
          <h1 className="text-2xl font-black text-dark">Edit Campaign</h1>
          <p className="text-gray-500 text-sm mt-1">Update your campaign details</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Title */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <label className="block text-sm font-bold text-dark mb-1.5">
              Campaign Title <span className="text-red-500">*</span>
            </label>
            <input
              value={form.title}
              onChange={handleChange('title')}
              placeholder="e.g. Help John recover from surgery"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
              maxLength={120}
            />
            <p className="text-xs text-gray-400 mt-1">{form.title.length}/120 characters</p>
          </div>

          {/* Category & Goal */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-dark mb-1.5">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                value={form.category}
                onChange={handleChange('category')}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white capitalize"
              >
                <option value="">Select category</option>
                {CATEGORIES.map(c => (
                  <option key={c} value={c} className="capitalize">{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-dark mb-1.5">
                Funding Goal (₦) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={form.goal_amount}
                onChange={handleChange('goal_amount')}
                placeholder="e.g. 500000"
                min="1000"
                max={MAX_GOAL_AMOUNT}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
              />
              <p className="text-xs text-gray-400 mt-1">Maximum {formatCurrency(MAX_GOAL_AMOUNT)} per campaign.</p>
            </div>
          </div>

          {/* Deadline & Urgent */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-dark mb-1.5">Campaign Deadline (optional)</label>
              <input
                type="date"
                value={form.deadline}
                onChange={handleChange('deadline')}
                min={today}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
              />
            </div>
            <div className="flex items-center gap-3 pt-6">
              <input
                id="is_urgent"
                type="checkbox"
                checked={form.is_urgent}
                onChange={handleChange('is_urgent')}
                className="w-4 h-4 accent-primary"
              />
              <label htmlFor="is_urgent" className="text-sm font-semibold text-dark cursor-pointer">
                Mark as Urgent
                <p className="text-xs font-normal text-gray-400">Urgent campaigns get extra visibility</p>
              </label>
            </div>
          </div>

          {/* Description */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <label className="block text-sm font-bold text-dark mb-1.5">
              Short Description <span className="text-red-500">*</span>
            </label>
            <textarea
              value={form.description}
              onChange={handleChange('description')}
              placeholder="A brief summary of your campaign (shown in campaign cards)"
              rows={3}
              maxLength={200}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
            />
            <p className="text-xs text-gray-400 mt-1">{form.description.length}/200 characters</p>
          </div>

          {/* Story */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <label className="block text-sm font-bold text-dark mb-1.5">Full Story</label>
            <textarea
              value={form.story}
              onChange={handleChange('story')}
              placeholder="Tell donors the full story. Be detailed and honest — campaigns with detailed stories raise 3x more."
              rows={8}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
            />
          </div>

          {/* Prayer Wall */}
          <div className={`rounded-2xl border p-5 transition-colors ${form.prayer_wall_enabled ? 'bg-amber-50 border-amber-200' : 'bg-white border-gray-100'}`}>
            <div className="flex items-center gap-3">
              <span className="text-xl">🙏</span>
              <div className="flex-1">
                <p className="font-bold text-dark text-sm">Prayer Wall</p>
                <p className="text-xs text-gray-400">Donors can leave a prayer or encouragement on your campaign page. Off by default.</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                <input type="checkbox" className="sr-only peer" checked={form.prayer_wall_enabled}
                  onChange={handleChange('prayer_wall_enabled')} />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
              </label>
            </div>
            {form.prayer_wall_enabled && (
              <p className="text-xs text-amber-700 font-medium mt-3 flex items-center gap-1.5">
                <span>✓</span> Prayer Wall is enabled — donors can leave prayers when they give.
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => navigate('/dashboard/campaigns')}
              className="flex-1 py-3 border border-gray-200 rounded-2xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 rounded-2xl text-white font-bold text-sm flex items-center justify-center gap-2 transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-60"
              style={{ background: 'linear-gradient(135deg, #22c55e, #1a7a4a)', boxShadow: '0 4px 15px rgba(26,122,74,0.3)' }}
            >
              {loading ? 'Saving...' : <><MdSave className="text-lg" /> Save Changes</>}
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
