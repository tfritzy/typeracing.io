import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

const STORAGE_KEY_DISMISSED = "typerace-redirect-dismissed";
const STORAGE_KEY_AUTO_REDIRECT = "typerace-auto-redirect";
const TARGET_URL = "https://typerace.io";

type BannerCopy = {
  title: string;
  messageBeforeLink: string;
  messageAfterLink: string;
  redirectLabel: string;
  ctaLabel: string;
  dismissLabel: string;
};

const DEFAULT_COPY: BannerCopy = {
  title: "Hey everyone!",
  messageBeforeLink:
    "I've built a new version of this website that I think you will like better. If it's missing anything, please let me know by opening an issue on its ",
  messageAfterLink: ".",
  redirectLabel: "Redirect next time",
  ctaLabel: "Take me there",
  dismissLabel: "Dismiss",
};

const TRANSLATED_COPY: Record<string, BannerCopy> = {
  english: DEFAULT_COPY,
  français: {
    title: "Salut tout le monde !",
    messageBeforeLink:
      "J'ai créé une nouvelle version de ce site que je pense que vous préférerez. S'il manque quoi que ce soit, dites-le-moi en ouvrant une issue sur son ",
    messageAfterLink: ".",
    redirectLabel: "Rediriger la prochaine fois",
    ctaLabel: "M'y emmener",
    dismissLabel: "Fermer",
  },
  español: {
    title: "¡Hola a todos!",
    messageBeforeLink:
      "He creado una nueva versión de este sitio web que creo que les gustará más. Si le falta algo, háganmelo saber abriendo un issue en su ",
    messageAfterLink: ".",
    redirectLabel: "Redirigir la próxima vez",
    ctaLabel: "Llévame allí",
    dismissLabel: "Cerrar",
  },
  deutsch: {
    title: "Hallo zusammen!",
    messageBeforeLink:
      "Ich habe eine neue Version dieser Website erstellt, die euch meiner Meinung nach besser gefallen wird. Wenn etwas fehlt, sagt mir bitte Bescheid, indem ihr ein Issue auf dem ",
    messageAfterLink: " eröffnet.",
    redirectLabel: "Nächstes Mal weiterleiten",
    ctaLabel: "Bring mich hin",
    dismissLabel: "Schließen",
  },
  italiano: {
    title: "Ciao a tutti!",
    messageBeforeLink:
      "Ho creato una nuova versione di questo sito che penso vi piacerà di più. Se manca qualcosa, fatemelo sapere aprendo una issue sul suo ",
    messageAfterLink: ".",
    redirectLabel: "Reindirizza la prossima volta",
    ctaLabel: "Portami lì",
    dismissLabel: "Chiudi",
  },
  português: {
    title: "Olá, pessoal!",
    messageBeforeLink:
      "Criei uma nova versão deste site que acho que vocês vão gostar mais. Se estiver faltando algo, por favor me avisem abrindo uma issue no ",
    messageAfterLink: ".",
    redirectLabel: "Redirecionar da próxima vez",
    ctaLabel: "Leve-me para lá",
    dismissLabel: "Fechar",
  },
  dutch: {
    title: "Hoi allemaal!",
    messageBeforeLink:
      "Ik heb een nieuwe versie van deze website gebouwd die jullie volgens mij beter zullen vinden. Als er iets ontbreekt, laat het me weten door een issue te openen op de ",
    messageAfterLink: ".",
    redirectLabel: "Volgende keer doorsturen",
    ctaLabel: "Breng me ernaartoe",
    dismissLabel: "Sluiten",
  },
  polski: {
    title: "Cześć wszystkim!",
    messageBeforeLink:
      "Stworzyłem nową wersję tej strony, która moim zdaniem bardziej wam się spodoba. Jeśli czegoś brakuje, dajcie mi znać, otwierając zgłoszenie na jej ",
    messageAfterLink: ".",
    redirectLabel: "Przekieruj następnym razem",
    ctaLabel: "Przenieś mnie tam",
    dismissLabel: "Zamknij",
  },
  русский: {
    title: "Всем привет!",
    messageBeforeLink:
      "Я сделал новую версию этого сайта, которая, думаю, понравится вам больше. Если в ней чего-то не хватает, дайте знать, открыв issue в её ",
    messageAfterLink: ".",
    redirectLabel: "Перенаправлять в следующий раз",
    ctaLabel: "Перейти туда",
    dismissLabel: "Закрыть",
  },
  हिंदी: {
    title: "सभी को नमस्ते!",
    messageBeforeLink:
      "मैंने इस वेबसाइट का एक नया संस्करण बनाया है जो मुझे लगता है आपको ज़्यादा पसंद आएगा। अगर इसमें कुछ कमी हो, तो कृपया उसके ",
    messageAfterLink: " पर issue खोलकर मुझे बताएं।",
    redirectLabel: "अगली बार रीडायरेक्ट करें",
    ctaLabel: "मुझे वहाँ ले चलो",
    dismissLabel: "बंद करें",
  },
};

function getPathMode(pathname: string): string | null {
  const [segment] = pathname.split("/").filter(Boolean);
  if (!segment) {
    return null;
  }

  return decodeURIComponent(segment);
}

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
  const location = useLocation();
  const mode = getPathMode(location.pathname);
  const copy = (mode && TRANSLATED_COPY[mode]) || DEFAULT_COPY;

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
              {copy.title}
            </h3>
            <p className="text-base-400 text-sm leading-normal">
              {copy.messageBeforeLink}
              <a
                className="text-accent underline"
                href="https://github.com/tfritzy/typerace.io/issues"
              >
                GitHub
              </a>
              {copy.messageAfterLink}
            </p>
          </div>
          <button
            onClick={handleDismiss}
            className="text-base-500 hover:text-white transition-colors p-1 -mr-2"
            aria-label={copy.dismissLabel}
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
              {copy.redirectLabel}
            </span>
          </label>

          <a
            href={TARGET_URL}
            className="px-4 py-2 bg-accent hover:bg-yellow-400 text-black text-sm font-bold rounded-lg transition-all active:scale-95 shadow-sm whitespace-nowrap"
          >
            {copy.ctaLabel}
          </a>
        </div>
      </div>
    </aside>
  );
}
