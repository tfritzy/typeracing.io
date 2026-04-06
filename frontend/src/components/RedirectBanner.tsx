import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { validLanguageModes, validProgrammingModes } from "../modes";

const STORAGE_KEY_DISMISSED = "typerace-redirect-dismissed";
const STORAGE_KEY_AUTO_REDIRECT = "typerace-auto-redirect";
const BASE_TARGET_URL = "https://typerace.io";

type BannerStrings = {
  message: string;
  redirectLabel: string;
};

const translations: Record<string, BannerStrings> = {
  english: {
    message: "I've built a new version of this website at",
    redirectLabel: "Always redirect me to typerace.io",
  },
  français: {
    message: "J'ai créé une nouvelle version de ce site sur",
    redirectLabel: "Toujours me rediriger vers typerace.io",
  },
  español: {
    message: "He creado una nueva versión de este sitio en",
    redirectLabel: "Siempre redirigirme a typerace.io",
  },
  deutsch: {
    message: "Ich habe eine neue Version dieser Website erstellt auf",
    redirectLabel: "Immer zu typerace.io weiterleiten",
  },
  italiano: {
    message: "Ho creato una nuova versione di questo sito su",
    redirectLabel: "Reindirizzami sempre su typerace.io",
  },
  português: {
    message: "Criei uma nova versão deste site em",
    redirectLabel: "Sempre me redirecionar para typerace.io",
  },
  dutch: {
    message: "Ik heb een nieuwe versie van deze website gebouwd op",
    redirectLabel: "Stuur mij altijd door naar typerace.io",
  },
  polski: {
    message: "Stworzyłem nową wersję tej strony na",
    redirectLabel: "Zawsze przekierowuj mnie na typerace.io",
  },
  русский: {
    message: "Я создал новую версию этого сайта на",
    redirectLabel: "Всегда перенаправлять меня на typerace.io",
  },
  हिंदी: {
    message: "मैंने इस वेबसाइट का नया संस्करण बनाया है",
    redirectLabel: "हमेशा मुझे typerace.io पर रीडायरेक्ट करें",
  },
};

const defaultStrings: BannerStrings = translations["english"];

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
    // Ignore storage errors (e.g., private browsing mode)
  }
}

function getTargetUrl(pathname: string): string {
  const segments = pathname.split("/").filter(Boolean);
  const first = segments[0] ? decodeURIComponent(segments[0]) : "";

  if (first === "code" && segments[1]) {
    const mode = decodeURIComponent(segments[1]);
    if (validProgrammingModes.has(mode)) {
      return `${BASE_TARGET_URL}/code/${mode}`;
    }
    return `${BASE_TARGET_URL}/code`;
  }

  if (validLanguageModes.has(first)) {
    return `${BASE_TARGET_URL}/${first}`;
  }

  return BASE_TARGET_URL;
}

function getCurrentLanguage(pathname: string): string | undefined {
  const segments = pathname.split("/").filter(Boolean);
  const first = segments[0] ? decodeURIComponent(segments[0]) : "";

  if (validLanguageModes.has(first)) {
    return first;
  }

  return undefined;
}

export function RedirectBanner() {
  const [isDismissed, setIsDismissed] = useState(true); // Start hidden to avoid flash
  const [autoRedirect, setAutoRedirect] = useState(false);
  const location = useLocation();

  const targetUrl = getTargetUrl(location.pathname);
  const currentLanguage = getCurrentLanguage(location.pathname);
  const strings = (currentLanguage && translations[currentLanguage]) || defaultStrings;

  useEffect(() => {
    // Check localStorage on mount
    const dismissed = getStorageItem(STORAGE_KEY_DISMISSED) === "true";
    const shouldRedirect = getStorageItem(STORAGE_KEY_AUTO_REDIRECT) === "true";

    if (shouldRedirect) {
      // Full page navigation to external domain (intentional, not using React Router)
      window.location.href = getTargetUrl(window.location.pathname);
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

    if (checked) {
      // Full page navigation to external domain (intentional, not using React Router)
      window.location.href = targetUrl;
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
            {strings.message}{" "}
            <a
              href={targetUrl}
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
          <span>{strings.redirectLabel}</span>
        </label>
      </div>
    </aside>
  );
}
