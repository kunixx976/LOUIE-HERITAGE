import { useEffect, useState } from "react";

const STORAGE_KEY = "louie-cookie-preferences-v1";

type CookiePreferences = {
  optionalAnalytics: boolean;
};

function readPreferences(): CookiePreferences | null {
  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (!stored) return null;
  const value = JSON.parse(stored) as Partial<CookiePreferences>;
  return typeof value.optionalAnalytics === "boolean"
    ? { optionalAnalytics: value.optionalAnalytics }
    : null;
}

export function CookieConsent() {
  const [preferences, setPreferences] = useState<CookiePreferences | null>(null);
  const [ready, setReady] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [optionalAnalytics, setOptionalAnalytics] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    try {
      const current = readPreferences();
      setPreferences(current);
      setOptionalAnalytics(current?.optionalAnalytics ?? false);
    } catch (cause) {
      console.error("Unable to read cookie preferences.", cause);
      setError("We couldn't read your saved preferences. Please choose again.");
    } finally {
      setReady(true);
    }

    const openSettings = () => {
      setOptionalAnalytics(preferences?.optionalAnalytics ?? false);
      setSettingsOpen(true);
    };
    window.addEventListener("louie:open-cookie-settings", openSettings);
    return () => window.removeEventListener("louie:open-cookie-settings", openSettings);
  }, [preferences?.optionalAnalytics]);

  function savePreferences(allowOptionalAnalytics: boolean) {
    const next = { optionalAnalytics: allowOptionalAnalytics };
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      setPreferences(next);
      setOptionalAnalytics(allowOptionalAnalytics);
      setSettingsOpen(false);
      setError("");
    } catch (cause) {
      console.error("Unable to save cookie preferences.", cause);
      setError("We couldn't save your choice. Check your browser storage settings and try again.");
    }
  }

  if (!ready || (preferences && !settingsOpen)) return null;

  return (
    <aside
      role="region"
      aria-label="Cookie preferences"
      className="fixed inset-x-4 bottom-4 z-[70] mx-auto max-w-2xl rounded-[10px] border border-border bg-background p-5 shadow-xl md:inset-x-auto md:right-6 md:bottom-6"
    >
      <h2 className="font-display text-xl">Cookie preferences</h2>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        Essential storage keeps your bag and sign-in working. Optional analytics are not currently
        active on this site. You can decline them or change your choice later.
      </p>

      {settingsOpen ? (
        <div className="mt-4">
          <label className="flex items-start gap-3 text-sm">
            <input
              type="checkbox"
              checked={optionalAnalytics}
              onChange={(event) => setOptionalAnalytics(event.target.checked)}
              className="mt-1 accent-black"
            />
            <span>
              <span className="block">Optional analytics</span>
              <span className="mt-1 block text-xs text-muted-foreground">
                Currently inactive. This preference will be respected if analytics are added.
              </span>
            </span>
          </label>
          <button
            type="button"
            onClick={() => savePreferences(optionalAnalytics)}
            className="mt-5 rounded-[8px] bg-foreground px-6 py-3 text-[11px] font-medium uppercase tracking-[0.14em] text-background"
          >
            Save preferences
          </button>
        </div>
      ) : (
        <div className="mt-5 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => savePreferences(false)}
            className="rounded-[8px] border border-border px-5 py-3 text-[11px] font-medium uppercase tracking-[0.12em]"
          >
            Necessary only
          </button>
          <button
            type="button"
            onClick={() => {
              setOptionalAnalytics(preferences?.optionalAnalytics ?? false);
              setSettingsOpen(true);
            }}
            className="rounded-[8px] border border-border px-5 py-3 text-[11px] font-medium uppercase tracking-[0.12em]"
          >
            Customize
          </button>
          <button
            type="button"
            onClick={() => savePreferences(true)}
            className="rounded-[8px] bg-foreground px-5 py-3 text-[11px] font-medium uppercase tracking-[0.12em] text-background"
          >
            Allow optional
          </button>
        </div>
      )}

      {error ? (
        <p role="alert" className="mt-3 text-xs text-destructive">
          {error}
        </p>
      ) : null}
    </aside>
  );
}
