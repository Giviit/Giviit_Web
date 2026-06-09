import { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MdPerson, MdEdit, MdSave, MdCameraAlt, MdVerified } from 'react-icons/md';
import DashboardLayout from '../../components/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import toast from 'react-hot-toast';

export default function Profile() {
  const { user, setUser } = useAuth();
  const queryClient = useQueryClient();
  const avatarRef = useRef();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    full_name: user?.full_name || '',
    phone: user?.phone || '',
    bank_name: user?.bank_name || '',
    bank_account_number: user?.bank_account_number || '',
    bank_account_name: user?.bank_account_name || '',
  });
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(user?.avatar_url || null);
  const [saving, setSaving] = useState(false);

  const handleChange = (field) => (e) => setForm(p => ({ ...p, [field]: e.target.value }));

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      let avatar_url = user?.avatar_url;
      if (avatarFile) {
        const reader = new FileReader();
        avatar_url = await new Promise((resolve, reject) => {
          reader.onload = async () => {
            const res = await api.post('/upload/image', { image: reader.result });
            resolve(res.data.url);
          };
          reader.onerror = reject;
          reader.readAsDataURL(avatarFile);
        });
      }

      const res = await api.put('/auth/profile', { ...form, avatar_url });
      setUser(res.data.user);
      toast.success('Profile updated!');
      setEditing(false);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const fields = [
    { key: 'full_name', label: 'Full Name', type: 'text' },
    { key: 'phone', label: 'Phone Number', type: 'tel' },
  ];

  const bankFields = [
    { key: 'bank_name', label: 'Bank Name', type: 'text', placeholder: 'GTBank' },
    { key: 'bank_account_number', label: 'Account Number', type: 'text', placeholder: '0123456789' },
    { key: 'bank_account_name', label: 'Account Name', type: 'text', placeholder: 'John Adeyemi' },
  ];

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black text-dark">Profile</h1>
          <p className="text-gray-500 text-sm mt-1">Manage your account information</p>
        </div>
        {!editing && (
          <button onClick={() => setEditing(true)} className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-white font-bold px-5 py-2.5 rounded-full text-sm transition-colors">
            <MdEdit /> Edit Profile
          </button>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-5 max-w-lg">
        {/* Avatar */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-5">
            <div className="relative">
              <div className="w-20 h-20 bg-primary/10 rounded-full overflow-hidden flex items-center justify-center">
                {avatarPreview ? (
                  <img src={avatarPreview} alt="" className="w-full h-full object-cover" />
                ) : (
                  <MdPerson className="text-primary text-4xl" />
                )}
              </div>
              {editing && (
                <button
                  type="button"
                  onClick={() => avatarRef.current?.click()}
                  className="absolute bottom-0 right-0 w-7 h-7 bg-primary text-white rounded-full flex items-center justify-center shadow-md"
                >
                  <MdCameraAlt className="text-xs" />
                </button>
              )}
              <input ref={avatarRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
            </div>
            <div>
              <p className="font-bold text-dark text-lg">{user?.full_name}</p>
              <p className="text-gray-500 text-sm">{user?.email}</p>
              {user?.bvn_verified && (
                <span className="inline-flex items-center gap-1 text-xs text-primary mt-1 font-medium">
                  <MdVerified /> Identity Verified
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Personal Info */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-4">
          <h2 className="font-bold text-dark">Personal Information</h2>
          {fields.map(({ key, label, type }) => (
            <div key={key}>
              <label className="block text-sm font-semibold text-dark mb-1.5">{label}</label>
              <input
                type={type}
                value={form[key]}
                onChange={handleChange(key)}
                disabled={!editing}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary outline-none text-sm disabled:bg-gray-50 disabled:text-gray-500"
              />
            </div>
          ))}
          <div>
            <label className="block text-sm font-semibold text-dark mb-1.5">Email</label>
            <input
              type="email"
              value={user?.email || ''}
              disabled
              className="w-full px-4 py-3 border-2 border-gray-100 rounded-xl text-sm bg-gray-50 text-gray-400"
            />
            <p className="text-xs text-gray-400 mt-1">Email cannot be changed</p>
          </div>
        </div>

        {/* Bank Details */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-4">
          <h2 className="font-bold text-dark">Bank Details</h2>
          <p className="text-sm text-gray-500">Used for receiving withdrawals</p>
          {bankFields.map(({ key, label, type, placeholder }) => (
            <div key={key}>
              <label className="block text-sm font-semibold text-dark mb-1.5">{label}</label>
              <input
                type={type}
                value={form[key]}
                onChange={handleChange(key)}
                disabled={!editing}
                placeholder={placeholder}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary outline-none text-sm disabled:bg-gray-50 disabled:text-gray-500"
              />
            </div>
          ))}
        </div>

        {editing && (
          <div className="flex gap-3">
            <button type="submit" disabled={saving}
              className="flex items-center gap-2 bg-primary hover:bg-primary/90 disabled:opacity-50 text-white font-bold px-6 py-3 rounded-xl text-sm transition-colors">
              <MdSave /> {saving ? 'Saving...' : 'Save Changes'}
            </button>
            <button type="button" onClick={() => setEditing(false)}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold px-6 py-3 rounded-xl text-sm transition-colors">
              Cancel
            </button>
          </div>
        )}
      </form>
    </DashboardLayout>
  );
}
