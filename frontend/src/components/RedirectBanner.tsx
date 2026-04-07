import { useEffect, useState } from "react";

const STORAGE_KEY_DISMISSED = "typerace-redirect-dismissed";
const STORAGE_KEY_AUTO_REDIRECT = "typerace-auto-redirect";
const TARGET_URL = "https://typerace.io";

function getStorageItem(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function setStorageItem(key: string, value: string): void {
  try {
    localStorage.setItem(key, value);
  } catch {
    // Ignore storage errors
  }
}

export function RedirectBanner() {
  const [isDismissed, setIsDismissed] = useState(true);
  const [autoRedirect, setAutoRedirect] = useState(false);

  useEffect(() => {
    const dismissed = getStorageItem(STORAGE_KEY_DISMISSED) === "true";
    const shouldRedirect = getStorageItem(STORAGE_KEY_AUTO_REDIRECT) === "true";

    if (shouldRedirect) {
      window.location.href = TARGET_URL;
      return;
    }

    setIsDismissed(dismissed);
    setAutoRedirect(shouldRedirect);
  }, []);

  const handleDismiss = () => {
    setStorageItem(STORAGE_KEY_DISMISSED, "true");
    setIsDismissed(true);
  };

  const handleAutoRedirectChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const checked = event.target.checked;
    setAutoRedirect(checked);
    setStorageItem(STORAGE_KEY_AUTO_REDIRECT, checked.toString());
  };

  if (isDismissed) {
    return null;
  }

  return (
    <aside
      role="complementary"
      className="fixed top-16 right-4 z-50 w-full max-w-[340px] bg-base-800 border border-base-700 rounded-xl shadow-2xl p-5 antialiased"
    >
      <div className="flex flex-col gap-5">
        {/* Header: Title and Close */}
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <h3 className="text-white font-bold text-base tracking-tight">
              Hey everyone!
            </h3>
            <p className="text-base-400 text-sm leading-normal">
              I've built a new version of this website that I think you will like better. If it's missing anything, please let me know by opening an issue on its <a className="text-accent underline" href="https://github.com/tfritzy/typerace.io/issues">github</a> 
            </p>
          </div>
          <button
            onClick={handleDismiss}
            className="text-base-500 hover:text-white transition-colors p-1 -mr-2"
            aria-label="Dismiss"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Footer: Controls */}
        <div className="flex items-center justify-between gap-4">
          <label className="flex items-center gap-2 cursor-pointer group">
            <input
              type="checkbox"
              checked={autoRedirect}
              onChange={handleAutoRedirectChange}
              className="w-4 h-4 rounded border-base-600 bg-base-700 accent-accent cursor-pointer transition-colors"
            />
            <span className="text-base-400 text-[13px] group-hover:text-base-300 select-none">
              Redirect next time
            </span>
          </label>

          <a
            href={TARGET_URL}
            className="px-4 py-2 bg-accent hover:bg-yellow-400 text-black text-sm font-bold rounded-lg transition-all active:scale-95 shadow-sm whitespace-nowrap"
          >
            Take me there
          </a>
        </div>
      </div>
    </aside>
  );
}