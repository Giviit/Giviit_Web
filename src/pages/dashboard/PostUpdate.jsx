import { useState, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { MdArrowBack, MdCloudUpload, MdClose } from 'react-icons/md';
import DashboardLayout from '../../components/DashboardLayout';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import { stripEmoji } from '../../utils/formatters';

export default function PostUpdate() {
  const { id } = useParams();
  const navigate = useNavigate();
  const imgRef = useRef();
  const [form, setForm] = useState({ title: '', content: '' });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      let image_url = null;
      if (imageFile) {
        const reader = new FileReader();
        image_url = await new Promise((res, rej) => {
          reader.onload = async () => {
            const r = await api.post('/upload/image', { image: reader.result });
            res(r.data.url);
          };
          reader.onerror = rej;
          reader.readAsDataURL(imageFile);
        });
      }
      await api.post(`/campaigns/${id}/update`, { ...form, image_url });
      toast.success('Update posted!');
      navigate(`/dashboard/campaigns/${id}`);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to post update');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="mb-8">
        <Link to={`/dashboard/campaigns/${id}`} className="inline-flex items-center gap-1 text-gray-500 hover:text-primary text-sm mb-3 transition-colors">
          <MdArrowBack /> Back to campaign
        </Link>
        <h1 className="text-2xl font-black text-dark">Post Update</h1>
        <p className="text-gray-500 text-sm mt-1">Keep your donors informed about your progress</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5 max-w-lg">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-dark mb-1.5">Update Title</label>
            <input type="text" value={form.title} onChange={e => setForm(p => ({ ...p, title: stripEmoji(e.target.value) }))} required
              placeholder="e.g., Surgery completed successfully!"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary outline-none text-sm" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-dark mb-1.5">Content</label>
            <textarea value={form.content} onChange={e => setForm(p => ({ ...p, content: stripEmoji(e.target.value) }))} required
              placeholder="Share details about your progress with your donors..."
              rows={6} className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary outline-none text-sm resize-none" />
          </div>

          <div>
            <label className="block text-sm font-semibold text-dark mb-2">Photo (optional)</label>
            {imagePreview ? (
              <div className="relative rounded-xl overflow-hidden h-40 bg-gray-100">
                <img src={imagePreview} alt="" className="w-full h-full object-cover" />
                <button type="button" onClick={() => { setImageFile(null); setImagePreview(null); }}
                  className="absolute top-2 right-2 w-7 h-7 bg-black/50 text-white rounded-full flex items-center justify-center hover:bg-black/70">
                  <MdClose className="text-sm" />
                </button>
              </div>
            ) : (
              <button type="button" onClick={() => imgRef.current?.click()}
                className="w-full h-32 border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center gap-2 hover:border-primary hover:bg-green-50 transition-all">
                <MdCloudUpload className="text-2xl text-gray-400" />
                <p className="text-sm text-gray-400">Click to add a photo</p>
              </button>
            )}
            <input ref={imgRef} type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
          </div>
        </div>

        <button type="submit" disabled={loading}
          className="w-full bg-primary hover:bg-primary/90 disabled:opacity-50 text-white font-bold py-4 rounded-xl text-sm transition-colors flex items-center justify-center gap-2">
          {loading ? (
            <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Posting...</>
          ) : 'Post Update'}
        </button>
      </form>
    </DashboardLayout>
  );
}
