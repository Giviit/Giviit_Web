import { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  MdCloudUpload, MdClose, MdAdd, MdArrowForward, MdArrowBack,
  MdShield, MdVerified, MdPeople, MdFlag, MdBolt, MdCake,
  MdCheckCircle, MdLock, MdCameraAlt, MdBadge, MdDragHandle,
} from 'react-icons/md';
import DashboardLayout from '../../components/DashboardLayout';
import CameraCaptureModal from '../../components/CameraCaptureModal';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { formatCurrency } from '../../utils/formatters';
import { COUNTRIES, NIGERIAN_STATES } from '../../utils/nigerianStates';

const CATEGORIES = ['medical', 'education', 'business', 'emergency', 'funeral', 'church', 'community', 'other'];
const MAX_GOAL_AMOUNT = 50000000;

const STEPS = [
  { id: 1, label: 'Identity Verification', icon: MdShield, desc: 'Verify who you are' },
  { id: 2, label: 'Campaign Details', icon: MdFlag, desc: 'Tell your story' },
  { id: 3, label: 'Images & Media', icon: MdCameraAlt, desc: 'Show your campaign' },
  { id: 4, label: 'Goals & Milestones', icon: MdCheckCircle, desc: 'Set fundraising targets' },
  { id: 5, label: 'Trust & Guarantor', icon: MdVerified, desc: 'Build donor trust' },
  { id: 6, label: 'Team & Special', icon: MdPeople, desc: 'Co-owners & birthday mode' },
  { id: 7, label: 'Review & Submit', icon: MdBadge, desc: 'Finalize your campaign' },
];

const BLANK_MILESTONE = { title: '', description: '', amount: '' };

const DRAFT_KEY = 'giviit_campaign_draft';

function loadDraft() {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export default function CreateCampaign() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const coverInputRef = useRef();
  const galleryInputRef = useRef();
  const selfieInputRef = useRef();
  const idDocInputRef = useRef();
  const draft = useRef(loadDraft()).current;

  const [step, setStep] = useState(draft?.step || 1);
  const [loading, setLoading] = useState(false);

  // ── Step 1: Identity ──
  // selfieFile/selfiePreview/idDocFile/idDocPreview are never persisted —
  // browsers can't restore File objects or blob: URLs across a reload, so
  // those are intentionally left blank and re-collected from the user.
  const [identity, setIdentity] = useState({
    nin: draft?.identity?.nin || '', selfieFile: null, selfiePreview: null,
    idDocFile: null, idDocPreview: null, agreed: draft?.identity?.agreed || false,
  });
  const [showCamera, setShowCamera] = useState(false);

  // ── Step 2: Campaign info ──
  const [form, setForm] = useState(draft?.form || {
    title: '', category: '', goal_amount: '', deadline: '',
    description: '', story: '', is_urgent: false,
    urgency_reason: '', urgency_deadline: '',
    facebook_handle: '', instagram_handle: '', twitter_handle: '',
    creator_country: 'NG', creator_state: '', creator_city: '',
  });
  const [prefilled, setPrefilled] = useState(false);
  const [countrySearch, setCountrySearch] = useState('');
  const [countryDropdownOpen, setCountryDropdownOpen] = useState(false);

  // Returning creators shouldn't have to re-type where they're fundraising
  // from or re-add their social handles — silently pull them from the
  // creator's most recent campaign if this is a fresh (non-draft) form.
  useEffect(() => {
    if (draft) return;
    api.get('/campaigns?my=true').then((res) => {
      const last = res.data.campaigns?.[0];
      if (!last) return;
      const fillable = ['creator_state', 'creator_city', 'facebook_handle', 'instagram_handle', 'twitter_handle'];
      const hasAnything = fillable.some((f) => last[f]) || (last.creator_country && last.creator_country !== 'NG');
      if (!hasAnything) return;
      setForm((p) => ({
        ...p,
        creator_country: last.creator_country || p.creator_country,
        creator_state: last.creator_state || p.creator_state,
        creator_city: last.creator_city || p.creator_city,
        facebook_handle: last.facebook_handle || p.facebook_handle,
        instagram_handle: last.instagram_handle || p.instagram_handle,
        twitter_handle: last.twitter_handle || p.twitter_handle,
      }));
      setPrefilled(true);
    }).catch(() => {});
  }, []);
  // Non-urgent campaigns don't need a deadline at all — this just gates
  // whether the date picker is shown, separate from form.deadline itself.
  const [wantsDeadline, setWantsDeadline] = useState(!!draft?.form?.deadline);

  // ── Step 3: Images (not persisted — see note above) ──
  const [coverImage, setCoverImage] = useState(null);
  const [coverPreview, setCoverPreview] = useState(null);
  const [gallery, setGallery] = useState([]);
  const [galleryPreviews, setGalleryPreviews] = useState([]);

  // ── Step 4: Milestones ──
  const [milestones, setMilestones] = useState(draft?.milestones || []);

  // ── Step 5: Guarantor ──
  const [guarantor, setGuarantor] = useState(draft?.guarantor || {
    guarantor_name: '', guarantor_email: '', guarantor_phone: '', guarantor_relationship: '',
  });

  // ── Step 6: Team + Birthday + Prayer Wall ──
  const [coOwnerEmails, setCoOwnerEmails] = useState(draft?.coOwnerEmails || ['']);
  const [birthday, setBirthday] = useState(draft?.birthday || { is_birthday: false, birthday_date: '', birthday_person_name: '' });
  const [prayerWallEnabled, setPrayerWallEnabled] = useState(draft?.prayerWallEnabled || false);

  // Let the user know their text was restored, but images/selfie/ID were not.
  useEffect(() => {
    if (draft) {
      toast('Restored your unfinished campaign. Please re-add your selfie, ID photo, and images — those can\'t be saved across a reload.', { duration: 7000, icon: '📝' });
    }
  }, []);

  // Auto-save everything that *can* survive a reload, on every change.
  useEffect(() => {
    const data = {
      step,
      identity: { nin: identity.nin, agreed: identity.agreed },
      form, milestones, guarantor, coOwnerEmails, birthday, prayerWallEnabled,
    };
    try { localStorage.setItem(DRAFT_KEY, JSON.stringify(data)); } catch {}
  }, [step, identity.nin, identity.agreed, form, milestones, guarantor, coOwnerEmails, birthday, prayerWallEnabled]);

  const set = (setter) => (field) => (e) => {
    const val = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setter(p => ({ ...p, [field]: val }));
  };

  // ── Image handlers ──
  const handleCoverChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { toast.error('Image must be under 5MB'); return; }
    setCoverImage(file);
    setCoverPreview(URL.createObjectURL(file));
  };

  const handleGalleryChange = (e) => {
    const files = Array.from(e.target.files).slice(0, 5 - gallery.length);
    setGallery(prev => [...prev, ...files]);
    setGalleryPreviews(prev => [...prev, ...files.map(f => URL.createObjectURL(f))]);
  };

  const handleSelfie = (e) => {
    const file = e.target.files[0];
    if (file) { setIdentity(p => ({ ...p, selfieFile: file, selfiePreview: URL.createObjectURL(file) })); }
  };

  const handleCameraCapture = (file, previewUrl) => {
    setIdentity(p => ({ ...p, selfieFile: file, selfiePreview: previewUrl }));
    setShowCamera(false);
  };

  const handleIdDoc = (e) => {
    const file = e.target.files[0];
    if (file) { setIdentity(p => ({ ...p, idDocFile: file, idDocPreview: URL.createObjectURL(file) })); }
  };

  // ── Milestone helpers ──
  const addMilestone = () => {
    if (milestones.length >= 5) { toast.error('Maximum 5 milestones'); return; }
    setMilestones(p => [...p, { ...BLANK_MILESTONE }]);
  };
  const updateMilestone = (i, field, val) => setMilestones(p => p.map((m, idx) => idx === i ? { ...m, [field]: val } : m));
  const removeMilestone = (i) => setMilestones(p => p.filter((_, idx) => idx !== i));

  // ── Upload helper ──
  const uploadImage = async (file) => {
    const reader = new FileReader();
    return new Promise((resolve, reject) => {
      reader.onload = async () => {
        try {
          const res = await api.post('/upload/image', { image: reader.result });
          resolve(res.data.url);
        } catch (err) { reject(err); }
      };
      reader.readAsDataURL(file);
    });
  };

  // ── Step validation ──
  const canProceed = () => {
    if (step === 1) return identity.nin.length === 11 && !!identity.selfieFile && !!identity.idDocFile && identity.agreed;
    if (step === 2) return form.title && form.category && form.goal_amount && form.description && form.story && Number(form.goal_amount) <= MAX_GOAL_AMOUNT && (!form.is_urgent || !!form.deadline);
    if (step === 3) return !!coverImage || !!coverPreview;
    if (step === 4) return milestones.every(m => !m.amount || Number(m.amount) <= Number(form.goal_amount || 0));
    return true;
  };

  // ── Submit ──
  const handleSubmit = async () => {
    if (!identity.selfieFile || !identity.idDocFile) {
      toast.error('Please re-add your selfie and ID photo — they can\'t be restored after a page reload.');
      setStep(1);
      return;
    }
    if (!coverImage) {
      toast.error('Please re-select your cover image — it can\'t be restored after a page reload.');
      setStep(3);
      return;
    }

    setLoading(true);
    try {
      // Upload identity documents to Cloudinary, then submit for review
      const [selfie_url, id_document_url] = await Promise.all([
        uploadImage(identity.selfieFile),
        uploadImage(identity.idDocFile),
      ]);
      await api.post('/auth/verify-identity', {
        nin: identity.nin,
        selfie_url,
        id_document_url,
        identity_agreement_accepted: identity.agreed,
      });

      // Upload images
      let cover_image = '';
      if (coverImage) cover_image = await uploadImage(coverImage);
      let galleryUrls = [];
      if (gallery.length) galleryUrls = await Promise.all(gallery.map(uploadImage));

      // Build payload
      const payload = {
        ...form,
        ...birthday,
        prayer_wall_enabled: prayerWallEnabled,
        goal_amount: Number(form.goal_amount),
        cover_image,
        gallery: galleryUrls,
        deadline: form.deadline || null,
        urgency_deadline: form.is_urgent && form.urgency_deadline ? form.urgency_deadline : null,
        urgency_reason: form.is_urgent ? form.urgency_reason : null,
        // Guarantor
        ...guarantor,
      };

      const res = await api.post('/campaigns', payload);
      const campaignId = res.data.campaign?.id || 'new';

      // Save milestones
      if (milestones.filter(m => m.title && m.amount).length > 0) {
        await api.post(`/campaigns/${campaignId}/milestones`, {
          milestones: milestones.filter(m => m.title && m.amount).map((m, i) => ({ ...m, amount: Number(m.amount), order_index: i }))
        });
      }

      // Invite co-owners
      const validEmails = coOwnerEmails.filter(e => e.trim() && e.includes('@'));
      for (const email of validEmails) {
        await api.post(`/campaigns/${campaignId}/invite`, { email });
      }

      localStorage.removeItem(DRAFT_KEY);
      toast.success('Campaign submitted for review! You\'ll hear back within 24–48 hours.');
      navigate('/dashboard/campaigns');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to create campaign');
    } finally {
      setLoading(false);
    }
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-black text-dark">Create Campaign</h1>
          <p className="text-gray-500 text-sm mt-0.5">Complete all steps to submit your campaign for review</p>
        </div>

        {/* Step progress */}
        <div className="mb-6 overflow-x-auto scrollbar-hide">
          <div className="flex gap-1 min-w-max pb-1">
            {STEPS.map((s) => (
              <button key={s.id} onClick={() => step > s.id && setStep(s.id)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                  step === s.id ? 'bg-primary text-white shadow-md shadow-primary/25' :
                  step > s.id ? 'bg-green-50 text-green-700 border border-green-200' :
                  'bg-gray-100 text-gray-400'
                }`}>
                {step > s.id ? <MdCheckCircle className="text-sm" /> : <s.icon className="text-sm" />}
                <span className="hidden sm:inline">{s.label}</span>
                <span className="sm:hidden">{s.id}</span>
              </button>
            ))}
          </div>
        </div>

        {/* ── STEP 1: Identity Verification ── */}
        {step === 1 && (
          <div className="space-y-5">
            <div className="border-l-4 border-primary pl-4 py-1">
              <p className="text-sm font-semibold text-dark">Identity Verification Required</p>
              <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
                To protect donors and prevent fraud, we require all campaign creators to verify their identity before publishing.
              </p>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4 shadow-sm">
              <h3 className="font-bold text-dark">NIN Verification</h3>

              <div>
                <label className="block text-sm font-semibold text-dark mb-1.5">NIN (National ID Number) <span className="text-red-500">*</span></label>
                <input
                  value={identity.nin}
                  onChange={e => setIdentity(p => ({ ...p, nin: e.target.value.replace(/\D/g,'').slice(0,11) }))}
                  placeholder="11-digit NIN"
                  maxLength={11}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-mono tracking-widest"
                />
                <p className="text-xs text-gray-400 mt-1">{identity.nin.length}/11 digits</p>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4 shadow-sm">
              <h3 className="font-bold text-dark">Identity Documents</h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Selfie */}
                <div>
                  <label className="block text-sm font-semibold text-dark mb-1.5">Selfie Photo <span className="text-red-500">*</span></label>
                  {identity.selfiePreview ? (
                    <div className="relative rounded-xl overflow-hidden h-32 bg-gray-100">
                      <img src={identity.selfiePreview} alt="" className="w-full h-full object-cover" />
                      <button type="button" onClick={() => setIdentity(p => ({ ...p, selfieFile: null, selfiePreview: null }))}
                        className="absolute top-2 right-2 w-7 h-7 bg-black/50 text-white rounded-full flex items-center justify-center">
                        <MdClose className="text-sm" />
                      </button>
                    </div>
                  ) : (
                    <button type="button" onClick={() => setShowCamera(true)}
                      className="w-full h-32 border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center gap-2 hover:border-primary hover:bg-green-50 transition-all">
                      <MdCameraAlt className="text-3xl text-gray-400" />
                      <p className="text-xs text-gray-500">Open camera to capture</p>
                    </button>
                  )}
                  <input ref={selfieInputRef} type="file" accept="image/*" capture="user" className="hidden" onChange={handleSelfie} />
                </div>

                {/* ID Document */}
                <div>
                  <label className="block text-sm font-semibold text-dark mb-1.5">Government ID <span className="text-red-500">*</span></label>
                  {identity.idDocPreview ? (
                    <div className="relative rounded-xl overflow-hidden h-32 bg-gray-100">
                      <img src={identity.idDocPreview} alt="" className="w-full h-full object-cover" />
                      <button type="button" onClick={() => setIdentity(p => ({ ...p, idDocFile: null, idDocPreview: null }))}
                        className="absolute top-2 right-2 w-7 h-7 bg-black/50 text-white rounded-full flex items-center justify-center">
                        <MdClose className="text-sm" />
                      </button>
                    </div>
                  ) : (
                    <button type="button" onClick={() => idDocInputRef.current?.click()}
                      className="w-full h-32 border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center gap-2 hover:border-primary hover:bg-green-50 transition-all">
                      <MdBadge className="text-3xl text-gray-400" />
                      <p className="text-xs text-gray-500">NIN slip, Voter card, or Passport</p>
                    </button>
                  )}
                  <input ref={idDocInputRef} type="file" accept="image/*" className="hidden" onChange={handleIdDoc} />
                </div>
              </div>

              <p className="text-xs text-gray-400 bg-gray-50 rounded-xl p-3 leading-relaxed">
                <MdLock className="inline mr-1 text-primary" />
                Your documents are encrypted and only seen by our verification team. They are never shown publicly.
              </p>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
              <label className={`flex items-start gap-3 cursor-pointer rounded-xl border p-3 transition-colors ${identity.agreed ? 'border-primary bg-primary/5' : 'border-gray-200'}`}>
                <input type="checkbox" checked={identity.agreed} onChange={e => setIdentity(p => ({ ...p, agreed: e.target.checked }))} className="w-4 h-4 mt-0.5 accent-primary flex-shrink-0" />
                <span className="text-sm text-gray-600 leading-relaxed">
                  I confirm that all information I provide is accurate and true. I understand that providing false information or running a fraudulent campaign may result in account suspension, fund freezing, and legal action. I agree to Giviit's{' '}
                  <Link to="/terms" target="_blank" rel="noopener noreferrer" className="text-primary underline hover:opacity-75">Terms of Service</Link>
                  {' '}and{' '}
                  <Link to="/terms#prohibited" target="_blank" rel="noopener noreferrer" className="text-primary underline hover:opacity-75">Anti-Fraud Policy</Link>.
                  <span className="text-red-500"> *</span>
                </span>
              </label>
            </div>

            {/* Anti-fraud checks display */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Anti-Fraud Checks Applied to All Campaigns</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {[
                  'NIN Verification', 'Document + Selfie Match',
                  'Bank Account Verification', 'Phone Number OTP',
                  'Campaign Document Review', 'AI Fraud Detection',
                  'Community Report System', 'Guarantor Vouching',
                  'Fund Escrow Protection', 'Withdrawal Audit Trail',
                ].map(check => (
                  <div key={check} className="flex items-center gap-2 text-xs text-gray-600">
                    <MdCheckCircle className="text-primary text-sm flex-shrink-0" />
                    {check}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── STEP 2: Campaign Details ── */}
        {step === 2 && (
          <div className="space-y-5">
            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm space-y-4">
              <h3 className="font-bold text-dark">Basic Information</h3>

              <div>
                <label className="block text-sm font-semibold text-dark mb-1.5">Campaign Title <span className="text-red-500">*</span></label>
                <input type="text" value={form.title} onChange={set(setForm)('title')}
                  placeholder="e.g. Help John fund his surgery"
                  maxLength={120}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary outline-none text-sm" />
                <p className="text-xs text-gray-400 mt-1">{form.title.length}/120</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-dark mb-1.5">Category <span className="text-red-500">*</span></label>
                  <select value={form.category} onChange={set(setForm)('category')}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary outline-none text-sm bg-white capitalize">
                    <option value="">Select category</option>
                    {CATEGORIES.map(c => <option key={c} value={c} className="capitalize">{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-dark mb-1.5">Goal Amount (₦) <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">₦</span>
                    <input type="number" value={form.goal_amount} onChange={set(setForm)('goal_amount')}
                      placeholder="500,000" min="1000" max={MAX_GOAL_AMOUNT}
                      className={`w-full pl-8 pr-4 py-3 border-2 rounded-xl outline-none text-sm ${
                        Number(form.goal_amount) > MAX_GOAL_AMOUNT ? 'border-red-300 bg-red-50 focus:border-red-400' : 'border-gray-200 focus:border-primary'
                      }`} />
                  </div>
                  {Number(form.goal_amount) > MAX_GOAL_AMOUNT ? (
                    <p className="text-xs text-red-500 mt-1">
                      Campaign goals are capped at {formatCurrency(MAX_GOAL_AMOUNT)}. Need more? Contact admin at support@giviit.ng.
                    </p>
                  ) : (
                    <p className="text-xs text-gray-400 mt-1">Maximum {formatCurrency(MAX_GOAL_AMOUNT)} per campaign.</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-dark mb-1.5">
                    Deadline {form.is_urgent ? <span className="text-red-500">*</span> : <span className="text-gray-400 font-normal">(optional)</span>}
                  </label>
                  {form.is_urgent ? (
                    <>
                      <input type="date" value={form.deadline} onChange={set(setForm)('deadline')} min={today}
                        className={`w-full px-4 py-3 border-2 rounded-xl outline-none text-sm ${!form.deadline ? 'border-red-300 bg-red-50 focus:border-red-400' : 'border-gray-200 focus:border-primary'}`} />
                      <p className="text-xs text-gray-400 mt-1">Urgent campaigns must have a deadline.</p>
                    </>
                  ) : (
                    <>
                      <label className="flex items-center gap-2 mb-2 cursor-pointer">
                        <input type="checkbox" checked={wantsDeadline}
                          onChange={e => {
                            setWantsDeadline(e.target.checked);
                            if (!e.target.checked) setForm(p => ({ ...p, deadline: '' }));
                          }}
                          className="w-4 h-4 accent-primary" />
                        <span className="text-xs text-gray-600">I want to set an end date</span>
                      </label>
                      {wantsDeadline && (
                        <input type="date" value={form.deadline} onChange={set(setForm)('deadline')} min={today}
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary outline-none text-sm" />
                      )}
                      {!wantsDeadline && (
                        <p className="text-xs text-gray-400">Your campaign will run with no end date until you close it or it's fully funded.</p>
                      )}
                    </>
                  )}
                </div>
                <div className="flex items-center gap-3 pt-6">
                  <input type="checkbox" id="is_urgent" checked={form.is_urgent} onChange={set(setForm)('is_urgent')} className="w-4 h-4 accent-primary" />
                  <label htmlFor="is_urgent" className="text-sm font-semibold text-dark cursor-pointer">
                    Mark as Urgent
                    <p className="text-xs font-normal text-gray-400">Gets extra homepage visibility</p>
                  </label>
                </div>
              </div>

              {/* Urgency fields */}
              {form.is_urgent && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-gray-100 pt-4">
                  <div>
                    <label className="block text-sm font-semibold text-dark mb-1.5">
                      <MdBolt className="inline text-red-500 mr-1" />Urgency Deadline
                    </label>
                    <input type="datetime-local" value={form.urgency_deadline} onChange={set(setForm)('urgency_deadline')} min={today}
                      className="w-full px-4 py-3 border-2 border-red-200 rounded-xl focus:border-red-400 outline-none text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-dark mb-1.5">Reason for urgency</label>
                    <input value={form.urgency_reason} onChange={set(setForm)('urgency_reason')}
                      placeholder="e.g. Surgery scheduled for next Monday"
                      className="w-full px-4 py-3 border-2 border-red-200 rounded-xl focus:border-red-400 outline-none text-sm" />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-dark mb-1.5">Short Description <span className="text-red-500">*</span></label>
                <textarea value={form.description} onChange={set(setForm)('description')}
                  placeholder="A brief summary (shown in campaign preview cards)" rows={2} maxLength={200}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary outline-none text-sm resize-none" />
                <p className="text-xs text-gray-400 mt-1">{form.description.length}/200</p>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
              <h3 className="font-bold text-dark mb-1">Campaign Story <span className="text-red-500">*</span></h3>
              <p className="text-xs text-gray-400 mb-3">Campaigns with detailed stories raise 3× more. Be honest, specific and personal.</p>
              <textarea value={form.story} onChange={set(setForm)('story')}
                placeholder="Tell your full story. Who needs help? What happened? What will the money be used for? Include names and specific details."
                rows={10} required
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary outline-none text-sm resize-none" />
              <p className="text-xs text-gray-400 mt-1">{form.story.length} characters</p>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm space-y-4">
              <div>
                <h3 className="font-bold text-dark">Where are you creating this campaign from?</h3>
                <p className="text-xs text-gray-400 mt-0.5">This helps donors find local campaigns</p>
              </div>
              {prefilled && (
                <p className="text-xs text-primary bg-primary/5 rounded-lg px-3 py-2">Pre-filled from your profile. You can change this.</p>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="relative">
                  <label className="block text-sm font-semibold text-dark mb-1.5">Country</label>
                  <input
                    value={countryDropdownOpen ? countrySearch : (COUNTRIES.find(c => c.code === form.creator_country)?.name || '')}
                    onChange={(e) => setCountrySearch(e.target.value)}
                    onFocus={() => { setCountryDropdownOpen(true); setCountrySearch(''); }}
                    placeholder="Search country..."
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary outline-none text-sm"
                  />
                  {countryDropdownOpen && (
                    <div className="absolute z-20 mt-1 w-full max-h-52 overflow-y-auto bg-white border border-gray-200 rounded-xl shadow-lg">
                      {COUNTRIES.filter(c => c.name.toLowerCase().includes(countrySearch.toLowerCase())).map((c) => (
                        <button key={c.code} type="button"
                          onClick={() => {
                            setForm(p => ({ ...p, creator_country: c.code, creator_state: c.code === p.creator_country ? p.creator_state : '' }));
                            setCountryDropdownOpen(false);
                          }}
                          className="w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors flex items-center justify-between">
                          <span className="text-dark">{c.name}</span>
                          <span className="text-gray-400 text-xs font-mono">{c.code}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-dark mb-1.5">{form.creator_country === 'NG' ? 'State' : 'State/Region'}</label>
                  {form.creator_country === 'NG' ? (
                    <select value={form.creator_state} onChange={set(setForm)('creator_state')}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary outline-none text-sm bg-white">
                      <option value="">Select state</option>
                      {NIGERIAN_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  ) : (
                    <input value={form.creator_state} onChange={set(setForm)('creator_state')}
                      placeholder="e.g. London"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary outline-none text-sm" />
                  )}
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-dark mb-1.5">City <span className="text-gray-400 font-normal">(optional)</span></label>
                <input value={form.creator_city} onChange={set(setForm)('creator_city')}
                  placeholder="e.g. Ikeja"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary outline-none text-sm" />
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm space-y-4">
              <div>
                <h3 className="font-bold text-dark">Social Media <span className="text-gray-400 font-normal text-sm">(Optional)</span></h3>
                <p className="text-xs text-gray-400 mt-0.5">Help donors follow your journey</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { field: 'facebook_handle', label: 'Facebook handle' },
                  { field: 'instagram_handle', label: 'Instagram handle' },
                  { field: 'twitter_handle', label: 'Twitter / X handle' },
                ].map(({ field, label }) => (
                  <div key={field}>
                    <label className="block text-sm font-semibold text-dark mb-1.5">{label}</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-medium">@</span>
                      <input value={form[field]} onChange={set(setForm)(field)} maxLength={50}
                        placeholder="yourhandle"
                        className="w-full pl-8 pr-3 py-3 border-2 border-gray-200 rounded-xl focus:border-primary outline-none text-sm" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── STEP 3: Images ── */}
        {step === 3 && (
          <div className="space-y-5">
            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm space-y-5">
              <h3 className="font-bold text-dark">Campaign Images</h3>
              <p className="text-xs text-gray-400 -mt-3">Campaigns with clear, real photos raise significantly more. Use actual photos, not stock images.</p>

              {/* Cover */}
              <div>
                <label className="block text-sm font-semibold text-dark mb-2">Cover Image <span className="text-red-500">*</span></label>
                {coverPreview ? (
                  <div className="relative rounded-xl overflow-hidden h-52 bg-gray-100">
                    <img src={coverPreview} alt="" className="w-full h-full object-cover" />
                    <button type="button" onClick={() => { setCoverImage(null); setCoverPreview(null); }}
                      className="absolute top-2 right-2 w-7 h-7 bg-black/50 text-white rounded-full flex items-center justify-center">
                      <MdClose className="text-sm" />
                    </button>
                  </div>
                ) : (
                  <button type="button" onClick={() => coverInputRef.current?.click()}
                    className="w-full h-48 border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center gap-2 hover:border-primary hover:bg-green-50 transition-all">
                    <MdCloudUpload className="text-4xl text-gray-400" />
                    <p className="text-sm text-gray-500 font-medium">Click to upload cover image</p>
                    <p className="text-xs text-gray-400">PNG, JPG up to 5MB</p>
                  </button>
                )}
                <input ref={coverInputRef} type="file" accept="image/*" className="hidden" onChange={handleCoverChange} />
              </div>

              {/* Gallery */}
              <div>
                <label className="block text-sm font-semibold text-dark mb-2">Additional Photos (up to 5)</label>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                  {galleryPreviews.map((preview, idx) => (
                    <div key={idx} className="relative aspect-square rounded-xl overflow-hidden bg-gray-100">
                      <img src={preview} alt="" className="w-full h-full object-cover" />
                      <button type="button" onClick={() => { setGallery(p => p.filter((_, i) => i !== idx)); setGalleryPreviews(p => p.filter((_, i) => i !== idx)); }}
                        className="absolute top-1 right-1 w-5 h-5 bg-black/50 text-white rounded-full flex items-center justify-center">
                        <MdClose className="text-xs" />
                      </button>
                    </div>
                  ))}
                  {gallery.length < 5 && (
                    <button type="button" onClick={() => galleryInputRef.current?.click()}
                      className="aspect-square border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center gap-1 hover:border-primary hover:bg-green-50 transition-all">
                      <MdAdd className="text-2xl text-gray-400" />
                      <p className="text-xs text-gray-400">Add</p>
                    </button>
                  )}
                </div>
                <input ref={galleryInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleGalleryChange} />
              </div>
            </div>
          </div>
        )}

        {/* ── STEP 4: Milestones ── */}
        {step === 4 && (
          <div className="space-y-5">
            <div className="border-l-4 border-primary pl-4 py-1">
              <p className="text-sm font-semibold text-dark">Why add milestones?</p>
              <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
                Milestones break your goal into clear stages so donors know exactly where their money goes.
              </p>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-dark">Milestones (Optional)</h3>
                {milestones.length < 5 && (
                  <button type="button" onClick={addMilestone}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-primary/10 text-primary text-sm font-semibold hover:bg-primary/20 transition-colors">
                    <MdAdd className="text-base" /> Add Milestone
                  </button>
                )}
              </div>

              {milestones.length === 0 ? (
                <button type="button" onClick={addMilestone}
                  className="w-full py-8 border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center gap-2 hover:border-primary hover:bg-green-50 transition-all">
                  <MdAdd className="text-3xl text-gray-400" />
                  <p className="text-sm text-gray-500">Add your first milestone</p>
                  <p className="text-xs text-gray-400">e.g. Hospital Deposit — ₦500,000</p>
                </button>
              ) : (
                <div className="space-y-4">
                  {milestones.map((m, i) => (
                    <div key={i} className="border border-gray-200 rounded-2xl p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-6 h-6 rounded-full bg-primary text-white text-xs font-black flex items-center justify-center flex-shrink-0">{i + 1}</div>
                        <span className="text-sm font-semibold text-dark">Milestone {i + 1}</span>
                        <button type="button" onClick={() => removeMilestone(i)} className="ml-auto p-1 hover:bg-red-50 rounded-lg">
                          <MdClose className="text-gray-400 text-lg hover:text-red-500" />
                        </button>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-semibold text-dark mb-1">Title <span className="text-red-500">*</span></label>
                          <input value={m.title} onChange={e => updateMilestone(i, 'title', e.target.value)}
                            placeholder="e.g. Hospital Deposit"
                            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-dark mb-1">Amount (₦) <span className="text-red-500">*</span></label>
                          <input type="number" value={m.amount} onChange={e => updateMilestone(i, 'amount', e.target.value)}
                            placeholder="e.g. 500000" min="100" max={form.goal_amount || undefined}
                            className={`w-full border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 ${
                              m.amount && Number(m.amount) > Number(form.goal_amount || 0)
                                ? 'border-red-300 bg-red-50 focus:ring-red-500/20'
                                : 'border-gray-200 focus:ring-primary/20 focus:border-primary'
                            }`} />
                          {m.amount && Number(m.amount) > Number(form.goal_amount || 0) && (
                            <p className="text-[11px] text-red-500 mt-1">Cannot exceed your campaign goal of {formatCurrency(form.goal_amount)}</p>
                          )}
                        </div>
                      </div>
                      <div className="mt-2">
                        <label className="block text-xs font-semibold text-dark mb-1">Description (optional)</label>
                        <input value={m.description} onChange={e => updateMilestone(i, 'description', e.target.value)}
                          placeholder="What will this fund exactly?"
                          className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── STEP 5: Guarantor ── */}
        {step === 5 && (
          <div className="space-y-5">
            <div className="border-l-4 border-primary pl-4 py-1">
              <p className="text-sm font-semibold text-dark">Why a Guarantor?</p>
              <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
                A guarantor is a trusted person — doctor, pastor, community leader, or employer — who publicly vouches for your campaign. Donors are more likely to give when someone credible stands behind you.
              </p>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm space-y-4">
              <h3 className="font-bold text-dark">Guarantor Details <span className="text-gray-400 font-normal text-sm">(Optional but Recommended)</span></h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-dark mb-1.5">Guarantor's Full Name</label>
                  <input value={guarantor.guarantor_name} onChange={set(setGuarantor)('guarantor_name')}
                    placeholder="Dr. Kelechi Nnamdi"
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-dark mb-1.5">Relationship to You</label>
                  <input value={guarantor.guarantor_relationship} onChange={set(setGuarantor)('guarantor_relationship')}
                    placeholder="Family Doctor, Pastor, Employer..."
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-dark mb-1.5">Guarantor's Email</label>
                  <input type="email" value={guarantor.guarantor_email} onChange={set(setGuarantor)('guarantor_email')}
                    placeholder="guarantor@email.com"
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
                  <p className="text-xs text-gray-400 mt-1">They'll get an email to vouch for your campaign</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-dark mb-1.5">Guarantor's Phone</label>
                  <input type="tel" value={guarantor.guarantor_phone} onChange={set(setGuarantor)('guarantor_phone')}
                    placeholder="08012345678"
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── STEP 6: Team + Birthday ── */}
        {step === 6 && (
          <div className="space-y-5">
            {/* Co-owners */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm space-y-4">
              <h3 className="font-bold text-dark flex items-center gap-2"><MdPeople className="text-primary" /> Ajo Mode — Invite Co-owners (Optional)</h3>
              <p className="text-xs text-gray-400">Co-owners can post updates and view donations, but only you can withdraw funds.</p>

              <div className="space-y-2">
                {coOwnerEmails.map((email, i) => (
                  <div key={i} className="flex gap-2">
                    <input type="email" value={email} onChange={e => setCoOwnerEmails(p => p.map((v, j) => j === i ? e.target.value : v))}
                      placeholder={`Co-owner ${i + 1} email`}
                      className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
                    {coOwnerEmails.length > 1 && (
                      <button type="button" onClick={() => setCoOwnerEmails(p => p.filter((_, j) => j !== i))} className="p-2.5 hover:bg-red-50 rounded-xl">
                        <MdClose className="text-gray-400 hover:text-red-500" />
                      </button>
                    )}
                  </div>
                ))}
                {coOwnerEmails.length < 5 && (
                  <button type="button" onClick={() => setCoOwnerEmails(p => [...p, ''])}
                    className="flex items-center gap-1.5 text-sm text-primary font-semibold hover:underline">
                    <MdAdd /> Add another co-owner
                  </button>
                )}
              </div>
            </div>

            {/* Prayer Wall */}
            <div className={`rounded-2xl border p-5 shadow-sm transition-colors ${prayerWallEnabled ? 'bg-amber-50 border-amber-200' : 'bg-white border-gray-100'}`}>
              <div className="flex items-start gap-3">
                <span className="text-2xl mt-0.5">🙏</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <h3 className="font-bold text-dark text-sm">Prayer Wall</h3>
                      <p className="text-xs text-gray-400 mt-0.5">
                        Donors can leave a short prayer or encouragement when they give. It appears as a public wall on your campaign — completely optional.
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                      <input type="checkbox" className="sr-only peer" checked={prayerWallEnabled}
                        onChange={e => setPrayerWallEnabled(e.target.checked)} />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
                    </label>
                  </div>

                  {prayerWallEnabled && (
                    <div className="mt-4 rounded-xl overflow-hidden border border-amber-200/80" style={{ background: 'linear-gradient(135deg,#fffbeb,#fef3c7)' }}>
                      <div className="px-4 py-3 border-b border-amber-200/60 flex items-center gap-2">
                        <span className="text-base">📿</span>
                        <span className="font-bold text-amber-900 text-xs">Prayer Wall</span>
                        <span className="text-amber-600 text-[10px] ml-auto">appears on your campaign page</span>
                      </div>
                      <div className="p-3 space-y-2">
                        {[
                          { name: 'Anonymous', text: 'Father Lord, bless this cause. Amen.' },
                          { name: 'Tunde F.', text: 'Lord Jesus, let this family not mourn. In Jesus name.' },
                        ].map(p => (
                          <div key={p.name} className="flex gap-2.5 items-start">
                            <div className="w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center text-[10px] font-bold text-amber-700"
                              style={{ background: 'linear-gradient(135deg,#fbbf24,#f59e0b)' }}>
                              {p.name.charAt(0)}
                            </div>
                            <div>
                              <p className="text-[10px] font-semibold text-amber-900">{p.name}</p>
                              <p className="text-[10px] text-amber-800 italic">"{p.text}"</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Birthday mode */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm space-y-4">
              <div className="flex items-center gap-3">
                <MdCake className="text-pink-500 text-xl" />
                <div className="flex-1">
                  <h3 className="font-bold text-dark">Birthday Fundraiser Mode</h3>
                  <p className="text-xs text-gray-400">Special UI and viral birthday sharing for your campaign</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" checked={birthday.is_birthday}
                    onChange={e => setBirthday(p => ({ ...p, is_birthday: e.target.checked }))} />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-pink-500"></div>
                </label>
              </div>

              {birthday.is_birthday && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-gray-100 pt-4">
                  <div>
                    <label className="block text-sm font-semibold text-dark mb-1.5">Whose birthday?</label>
                    <input value={birthday.birthday_person_name} onChange={set(setBirthday)('birthday_person_name')}
                      placeholder="e.g. Emeka Obi"
                      className="w-full border border-pink-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-pink-400" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-dark mb-1.5">Birthday Date</label>
                    <input type="date" value={birthday.birthday_date} onChange={set(setBirthday)('birthday_date')}
                      className="w-full border border-pink-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-pink-400" />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── STEP 7: Review ── */}
        {step === 7 && (
          <div className="space-y-5">
            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm space-y-4">
              <h3 className="font-bold text-dark">Campaign Summary</h3>

              {coverPreview && (
                <div className="relative h-40 rounded-xl overflow-hidden">
                  <img src={coverPreview} alt="" className="w-full h-full object-cover" />
                </div>
              )}

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="col-span-2">
                  <p className="text-gray-400 text-xs font-medium uppercase tracking-wide">Title</p>
                  <p className="font-bold text-dark mt-0.5">{form.title || '—'}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs font-medium uppercase tracking-wide">Goal</p>
                  <p className="font-bold text-dark mt-0.5">{form.goal_amount ? formatCurrency(Number(form.goal_amount)) : '—'}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs font-medium uppercase tracking-wide">Category</p>
                  <p className="font-bold text-dark mt-0.5 capitalize">{form.category || '—'}</p>
                </div>
                {form.is_urgent && (
                  <div className="col-span-2">
                    <p className="text-gray-400 text-xs font-medium uppercase tracking-wide">Urgency</p>
                    <p className="text-red-600 font-semibold text-xs mt-0.5">{form.urgency_reason}</p>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap gap-2">
                {milestones.filter(m => m.title).length > 0 && (
                  <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full font-semibold">{milestones.filter(m => m.title).length} milestones</span>
                )}
                {guarantor.guarantor_name && (
                  <span className="text-xs bg-green-50 text-green-700 px-2 py-1 rounded-full font-semibold border border-green-200">Guarantor added</span>
                )}
                {coOwnerEmails.filter(e => e.trim() && e.includes('@')).length > 0 && (
                  <span className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-full font-semibold border border-blue-200">
                    {coOwnerEmails.filter(e => e.trim() && e.includes('@')).length} co-owner{coOwnerEmails.filter(e => e.trim() && e.includes('@')).length > 1 ? 's' : ''}
                  </span>
                )}
                {birthday.is_birthday && (
                  <span className="text-xs bg-pink-50 text-pink-700 px-2 py-1 rounded-full font-semibold border border-pink-200 inline-flex items-center gap-1"><MdCake className="text-sm" /> Birthday Campaign</span>
                )}
                {form.is_urgent && campaign?.urgency_deadline && (
                  <span className="text-xs bg-red-50 text-red-700 px-2 py-1 rounded-full font-semibold border border-red-200">Urgency Timer</span>
                )}
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
              <p className="text-xs font-bold text-amber-800 mb-2">What happens after you submit?</p>
              <div className="space-y-1.5 text-xs text-amber-700">
                <p>1. Our team verifies your identity documents (24–48 hours)</p>
                <p>2. Campaign content is reviewed for authenticity</p>
                <p>3. Guarantor is contacted (if you added one)</p>
                <p>4. Campaign goes live when approved</p>
                <p>5. You'll be notified by email at every stage</p>
              </div>
            </div>

            <button type="button" onClick={handleSubmit} disabled={loading}
              className="w-full py-4 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold text-base flex items-center justify-center gap-2 transition-colors disabled:opacity-60">
              {loading ? (
                <><span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Uploading & Submitting...</>
              ) : (
                <>Submit Campaign for Review <MdArrowForward className="text-lg" /></>
              )}
            </button>
          </div>
        )}

        {/* Navigation */}
        {step < 7 && (
          <div className="flex gap-3 mt-6">
            {step > 1 && (
              <button type="button" onClick={() => setStep(step - 1)}
                className="flex-1 py-3 border border-gray-200 rounded-2xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors flex items-center justify-center gap-1">
                <MdArrowBack /> Back
              </button>
            )}
            <button type="button" onClick={() => {
              if (canProceed() || step >= 5) { setStep(step + 1); return; }
              if (step === 1 && !identity.agreed) { toast.error('Please confirm the accuracy of your information and accept the Anti-Fraud Policy to continue.'); return; }
              if (step === 2 && form.is_urgent && !form.deadline) { toast.error('Urgent campaigns must have a deadline date and time'); return; }
              if (step === 2 && Number(form.goal_amount) > MAX_GOAL_AMOUNT) { toast.error(`Campaign goals are capped at ${formatCurrency(MAX_GOAL_AMOUNT)}. Need more? Contact admin at support@giviit.ng.`); return; }
              if (step === 4) { toast.error("A milestone amount can't exceed your overall campaign goal."); return; }
              toast.error('Please complete all required fields');
            }}
              className="flex-1 py-3 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold text-sm flex items-center justify-center gap-1 transition-colors">
              Next <MdArrowForward />
            </button>
          </div>
        )}
      </div>

      <CameraCaptureModal
        open={showCamera}
        onClose={() => setShowCamera(false)}
        onCapture={handleCameraCapture}
        onFallbackUpload={() => selfieInputRef.current?.click()}
      />
    </DashboardLayout>
  );
}

