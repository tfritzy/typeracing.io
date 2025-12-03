import { useEffect, useState } from "react";

const STORAGE_KEY_DISMISSED = "typerace-redirect-dismissed";
const STORAGE_KEY_AUTO_REDIRECT = "typerace-auto-redirect";
const TARGET_URL = "https://typerace.io";

export function RedirectBanner() {
  const [isDismissed, setIsDismissed] = useState(true); // Start hidden to avoid flash
  const [autoRedirect, setAutoRedirect] = useState(false);

  useEffect(() => {
    // Check localStorage on mount
    const dismissed = localStorage.getItem(STORAGE_KEY_DISMISSED) === "true";
    const shouldRedirect =
      localStorage.getItem(STORAGE_KEY_AUTO_REDIRECT) === "true";

    if (shouldRedirect) {
      window.location.href = TARGET_URL;
      return;
    }

    setIsDismissed(dismissed);
    setAutoRedirect(shouldRedirect);
  }, []);

  const handleDismiss = () => {
    localStorage.setItem(STORAGE_KEY_DISMISSED, "true");
    setIsDismissed(true);
  };

  const handleAutoRedirectChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const checked = event.target.checked;
    setAutoRedirect(checked);
    localStorage.setItem(STORAGE_KEY_AUTO_REDIRECT, checked.toString());

    if (checked) {
      // Redirect immediately when enabled
      window.location.href = TARGET_URL;
    }
  };

  if (isDismissed) {
    return null;
  }

  return (
    <aside
      role="complementary"
      aria-label="Website update notification"
      className="fixed top-16 right-4 z-50 max-w-sm bg-base-800 border border-base-700 rounded-lg shadow-lg shadow-black/25 p-4"
    >
      <div className="flex flex-col gap-3">
        <div className="flex items-start justify-between gap-2">
          <p className="text-base-300 text-sm leading-relaxed">
            I've built a new version of this website at{" "}
            <a
              href={TARGET_URL}
              rel="noopener"
              className="text-accent hover:text-yellow-400 underline font-semibold"
            >
              typerace.io
            </a>
          </p>
          <button
            onClick={handleDismiss}
            className="text-base-500 hover:text-base-300 transition-colors flex-shrink-0"
            aria-label="Dismiss notification"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <label className="flex items-center gap-2 cursor-pointer text-base-400 text-sm hover:text-base-300 transition-colors">
          <input
            type="checkbox"
            checked={autoRedirect}
            onChange={handleAutoRedirectChange}
            className="w-4 h-4 rounded border-base-600 bg-base-700 accent-accent cursor-pointer"
          />
          <span>Always redirect me to typerace.io</span>
        </label>
      </div>
    </aside>
  );
}
