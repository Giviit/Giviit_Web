import {
  MOCK_CAMPAIGNS,
  MOCK_DONATIONS,
  MOCK_UPDATES,
  MOCK_USERS,
  MOCK_WITHDRAWALS,
  MOCK_REPORTS,
  MOCK_ADMIN_STATS,
  MOCK_OFFLINE_DONATIONS,
  MOCK_PLEDGES,
} from '../mocks/data';

function delay(ms = 300) {
  return new Promise(r => setTimeout(r, ms));
}

function paginate(arr, page = 1, limit = 12) {
  const p = Number(page), l = Number(limit);
  const start = (p - 1) * l;
  return { items: arr.slice(start, start + l), total: arr.length, totalPages: Math.ceil(arr.length / l) };
}

export const mockHandlers = {
  // ── Campaigns ──────────────────────────────────────────────
  'GET /campaigns': async (params) => {
    await delay();
    let items = [...MOCK_CAMPAIGNS];
    if (params?.category) items = items.filter(c => c.category === params.category);
    if (params?.search) items = items.filter(c => c.title.toLowerCase().includes(params.search.toLowerCase()));
    if (params?.my === 'true') items = items.slice(0, 3);
    if (params?.birthday === 'true') items = items.filter(c => c.is_birthday);
    if (params?.sort === 'most_funded') items.sort((a, b) => b.raised_amount - a.raised_amount);
    if (params?.sort === 'urgent') items = items.filter(c => c.is_urgent).concat(items.filter(c => !c.is_urgent));
    const { items: campaigns, total, totalPages } = paginate(items, params?.page, params?.limit || 12);
    return { campaigns, total, totalPages, page: Number(params?.page || 1) };
  },

  'GET /campaigns/featured': async () => {
    await delay();
    return { campaigns: MOCK_CAMPAIGNS.filter(c => c.is_featured) };
  },

  'GET /campaigns/urgent': async () => {
    await delay();
    return { campaigns: MOCK_CAMPAIGNS.filter(c => c.is_urgent) };
  },

  'GET /campaigns/birthday': async () => {
    await delay();
    return { campaigns: MOCK_CAMPAIGNS.filter(c => c.is_birthday) };
  },

  'GET /campaigns/:slug': async (_, slug) => {
    await delay();
    const campaign = MOCK_CAMPAIGNS.find(c => c.slug === slug) || MOCK_CAMPAIGNS[0];
    return { campaign };
  },

  'GET /campaigns/:id/updates': async () => {
    await delay();
    return { updates: MOCK_UPDATES };
  },

  'GET /campaigns/:id/milestones': async (_, id) => {
    await delay();
    const c = MOCK_CAMPAIGNS.find(c => c.id === id) || MOCK_CAMPAIGNS[0];
    return { milestones: c.milestones || [] };
  },

  'GET /campaigns/:id/members': async (_, id) => {
    await delay();
    const c = MOCK_CAMPAIGNS.find(c => c.id === id) || MOCK_CAMPAIGNS[0];
    return { members: c.members || [] };
  },

  'POST /campaigns': async (body) => {
    await delay(500);
    return { campaign: { id: 'new-' + Date.now(), ...body, status: 'pending', raised_amount: 0, donor_count: 0 } };
  },

  'PUT /campaigns/:id': async (body) => {
    await delay(500);
    return { campaign: { ...body } };
  },

  'POST /campaigns/:id/appeal': async (body) => {
    await delay(500);
    return { message: 'Appeal submitted. We will review within 24–48 hours.' };
  },

  'POST /campaigns/:id/invite': async (body) => {
    await delay(400);
    return { message: `Invitation sent to ${body.email}` };
  },

  'DELETE /campaigns/:id/members/:userId': async () => {
    await delay(300);
    return { message: 'Co-owner removed' };
  },

  'POST /campaigns/:id/milestones': async (body) => {
    await delay(400);
    return { message: 'Milestones saved' };
  },

  'POST /campaigns/:id/guarantor': async (body) => {
    await delay(500);
    return { message: `Guarantor invitation sent to ${body.guarantor_email}` };
  },

  'GET /campaigns/vouch/:token': async () => {
    await delay();
    return { campaign: MOCK_CAMPAIGNS[0] };
  },

  'POST /campaigns/vouch/:token': async () => {
    await delay(500);
    return { message: 'Vouched successfully' };
  },

  'POST /campaigns/decline-vouch/:token': async () => {
    await delay(300);
    return { message: 'Declined' };
  },

  // ── Donations ──────────────────────────────────────────────
  'GET /donations/campaign/:id': async () => {
    await delay();
    return { donations: MOCK_DONATIONS, total: MOCK_DONATIONS.length };
  },

  'GET /donations/campaign/:id/diaspora': async () => {
    await delay();
    const diaspora = MOCK_DONATIONS.filter(d => d.donor_country && d.donor_currency !== 'NGN');
    return { diaspora_donors: diaspora };
  },

  'POST /donations/initiate': async (body) => {
    await delay(500);
    const ref = 'DEMO_' + Math.random().toString(36).substring(2, 12).toUpperCase();
    setTimeout(() => { window.location.href = `/donate/success?reference=${ref}&amount=${body.amount}`; }, 1000);
    return { authorization_url: '#', reference: ref };
  },

  'GET /donations/verify/:ref': async () => {
    await delay(800);
    const campaign = MOCK_CAMPAIGNS[0];
    return {
      status: 'success',
      donation: { id: 'd_demo', amount: 5000, paystack_status: 'success', donor_name: 'Demo User' },
      campaign,
    };
  },

  'POST /donations/offline': async (body) => {
    await delay(500);
    return { offline_donation: { id: 'od_new_' + Date.now(), ...body, created_at: new Date().toISOString() } };
  },

  'DELETE /donations/offline/:id': async () => {
    await delay(300);
    return { message: 'Deleted' };
  },

  'GET /donations/offline/:campaign_id': async () => {
    await delay();
    return { offline_donations: MOCK_OFFLINE_DONATIONS };
  },

  // ── Pledges ────────────────────────────────────────────────
  'POST /pledges': async (body) => {
    await delay(600);
    return { pledge: { id: 'pl_new_' + Date.now(), ...body, installments_paid: 0, status: 'active', created_at: new Date().toISOString() } };
  },

  'GET /pledges/campaign/:campaign_id': async () => {
    await delay();
    return { pledges: MOCK_PLEDGES, total: MOCK_PLEDGES.length };
  },

  'POST /pledges/:id/pay': async () => {
    await delay(500);
    const ref = 'PLEDGE_' + Math.random().toString(36).substring(2, 10).toUpperCase();
    setTimeout(() => { window.location.href = `/pledge/confirm?reference=${ref}`; }, 800);
    return { authorization_url: '#', reference: ref };
  },

  // ── Withdrawals ────────────────────────────────────────────
  'GET /withdrawals/my': async () => {
    await delay();
    return { withdrawals: MOCK_WITHDRAWALS.slice(0, 2) };
  },

  'POST /withdrawals': async (body) => {
    await delay(500);
    return { withdrawal: { id: 'w_new', ...body, status: 'pending', created_at: new Date().toISOString() } };
  },

  // ── Upload ─────────────────────────────────────────────────
  'POST /upload/image': async () => {
    await delay(800);
    const imgs = [
      'https://images.unsplash.com/photo-1585540083814-ea6ee8af9e4f?w=600&q=80',
      'https://images.unsplash.com/photo-1473649085228-583485e6e4d7?w=600&q=80',
      'https://images.unsplash.com/photo-1680713660046-67b7350ed679?w=600&q=80',
      'https://images.unsplash.com/photo-1687422808311-a776f467a468?w=600&q=80',
    ];
    return { url: imgs[Math.floor(Math.random() * imgs.length)] };
  },

  // ── Admin ──────────────────────────────────────────────────
  'GET /admin/dashboard': async () => { await delay(); return MOCK_ADMIN_STATS; },

  'GET /admin/campaigns': async (params) => {
    await delay();
    let items = [...MOCK_CAMPAIGNS];
    if (params?.status) items = items.filter(c => c.status === params.status);
    if (params?.search) items = items.filter(c => c.title.toLowerCase().includes(params.search.toLowerCase()));
    return { campaigns: items };
  },

  'PUT /admin/campaigns/:id/verify': async () => { await delay(300); return { campaign: { status: 'active', is_verified: true } }; },
  'PUT /admin/campaigns/:id/reject': async () => { await delay(300); return { campaign: { status: 'rejected' } }; },
  'PUT /admin/campaigns/:id/feature': async () => { await delay(300); return { campaign: { is_featured: true } }; },
  'PUT /admin/campaigns/:id/urgent': async () => { await delay(300); return { campaign: { is_urgent: true } }; },
  'GET /admin/withdrawals': async () => { await delay(); return { withdrawals: MOCK_WITHDRAWALS }; },
  'PUT /admin/withdrawals/:id/approve': async () => { await delay(500); return { withdrawal: { status: 'completed' } }; },
  'PUT /admin/withdrawals/:id/reject': async () => { await delay(300); return { withdrawal: { status: 'failed' } }; },
  'GET /admin/reports': async () => { await delay(); return { reports: MOCK_REPORTS }; },
  'PUT /admin/reports/:id/review': async () => { await delay(300); return { report: { status: 'reviewed' } }; },
  'GET /admin/users': async () => { await delay(); return { users: MOCK_USERS }; },
  'PUT /admin/users/:id/role': async (body) => { await delay(300); return { user: { role: body.role } }; },

  // ── Auth ───────────────────────────────────────────────────
  'GET /auth/me': async () => {
    await delay();
    return { user: JSON.parse(localStorage.getItem('mock_user') || 'null') };
  },

  'PUT /auth/profile': async (body) => {
    await delay(400);
    const current = JSON.parse(localStorage.getItem('mock_user') || '{}');
    const updated = { ...current, ...body };
    localStorage.setItem('mock_user', JSON.stringify(updated));
    return { user: updated };
  },

  'POST /auth/verify-identity': async (body) => {
    await delay(1000);
    const current = JSON.parse(localStorage.getItem('mock_user') || '{}');
    const updated = { ...current, verification_status: 'pending', ...body };
    localStorage.setItem('mock_user', JSON.stringify(updated));
    return { message: 'Verification documents submitted. Review takes 24-48 hours.' };
  },
};
