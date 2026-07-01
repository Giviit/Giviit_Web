import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { MdClose } from 'react-icons/md';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';

const STORAGE_KEY = 'giviit_cookie_consent';
const CONSENT_VERSION = '1.0';
const ONE_YEAR_MS = 365 * 24 * 60 * 60 * 1000;

const DEFAULT_CONSENT = { essential: true, analytics: true, preferences: true };

function loadConsent() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function needsConsent(saved) {
  if (!saved) return true;
  if (saved.version !== CONSENT_VERSION) return true;
  if (!saved.timestamp || Date.now() - saved.timestamp > ONE_YEAR_MS) return true;
  return false;
}

// Best-effort only — Giviit doesn't bundle the PostHog SDK itself, so this
// is a no-op until/unless it's added elsewhere and exposes window.posthog.
function applyAnalyticsPreference(analyticsEnabled) {
  const posthog = window.posthog;
  if (!posthog) return;
  if (analyticsEnabled) posthog.opt_in_capturing?.();
  else posthog.opt_out_capturing?.();
}

export default function CookieBanner() {
  const { user } = useAuth();
  const [visible, setVisible] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [prefs, setPrefs] = useState(DEFAULT_CONSENT);

  useEffect(() => {
    const saved = loadConsent();
    if (needsConsent(saved)) {
      setVisible(true);
    } else {
      setPrefs({ essential: true, analytics: !!saved.analytics, preferences: !!saved.preferences });
      applyAnalyticsPreference(!!saved.analytics);
    }
  }, []);

  const persist = async (consent) => {
    const record = { ...consent, essential: true, timestamp: Date.now(), version: CONSENT_VERSION };
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(record)); } catch {}
    applyAnalyticsPreference(consent.analytics);
    if (user) {
      try { await api.put('/auth/profile', { cookie_consent: record }); } catch {}
    }
    setVisible(false);
    setExpanded(false);
  };

  const acceptAll = () => persist({ analytics: true, preferences: true });
  const rejectAll = () => persist({ analytics: false, preferences: false });
  const savePreferences = () => persist({ analytics: prefs.analytics, preferences: prefs.preferences });

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[9999] animate-slide-up">
      <div className="bg-white border-t border-gray-200 shadow-[0_-4px_24px_rgba(0,0,0,0.08)]">
        {!expanded ? (
          <div className="max-w-5xl mx-auto px-4 py-4 sm:py-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <p className="text-sm text-gray-600 leading-relaxed flex-1">
              We use cookies to improve your experience on Giviit. Read our{' '}
              <Link to="/cookie-policy" className="text-primary font-semibold hover:underline">Cookie Policy</Link>.
            </p>
            <div className="flex flex-wrap gap-2 w-full sm:w-auto">
              <button
                onClick={() => setExpanded(true)}
                className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Manage Preferences
              </button>
              <button
                onClick={rejectAll}
                className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Reject All
              </button>
              <button
                onClick={acceptAll}
                className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-white text-sm font-semibold transition-colors"
              >
                Accept All
              </button>
            </div>
          </div>
        ) : (
          <div className="max-w-2xl mx-auto px-4 py-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-dark text-base">Cookie Preferences</h2>
              <button onClick={() => setExpanded(false)} className="p-1.5 hover:bg-gray-100 rounded-full transition-colors">
                <MdClose className="text-lg text-gray-500" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex items-start justify-between gap-4 border-b border-gray-100 pb-4">
                <div>
                  <p className="font-semibold text-dark text-sm">Essential Cookies</p>
                  <p className="text-xs text-gray-500 mt-0.5">Required for the site to work. Cannot be disabled.</p>
                </div>
                <span className="flex-shrink-0 text-xs font-semibold px-2.5 py-1 rounded-full bg-gray-100 text-gray-500">Always On</span>
              </div>

              <div className="flex items-start justify-between gap-4 border-b border-gray-100 pb-4">
                <div>
                  <p className="font-semibold text-dark text-sm">Analytics Cookies</p>
                  <p className="text-xs text-gray-500 mt-0.5">Help us understand how people use Giviit so we can improve it.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={prefs.analytics}
                    onChange={(e) => setPrefs((p) => ({ ...p, analytics: e.target.checked }))}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary" />
                </label>
              </div>

              <div className="flex items-start justify-between gap-4 pb-1">
                <div>
                  <p className="font-semibold text-dark text-sm">Preference Cookies</p>
                  <p className="text-xs text-gray-500 mt-0.5">Remember your settings and customisations.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={prefs.preferences}
                    onChange={(e) => setPrefs((p) => ({ ...p, preferences: e.target.checked }))}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary" />
                </label>
              </div>
            </div>

            <button
              onClick={savePreferences}
              className="w-full mt-5 py-3 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold text-sm transition-colors"
            >
              Save Preferences
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
