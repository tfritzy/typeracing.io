const fs = require("fs");
const path = require("path");

// Import the modes configuration
const allModes = {
  phrases: [
    {
      type: "copypastas",
      description: "Copypastas, but no pasta",
      name: "Copypastas",
      icon: "/logos/spaghetti.svg",
      formatting: "normal",
    },
    {
      type: "shakespeare",
      description: "Famous Shakespeare lines",
      name: "Shakespeare",
      icon: "/logos/performing-arts.svg",
      formatting: "normal",
    },
  ],
  languages: [
    {
      type: "english",
      name: "English",
      description: "Phrases of common English words",
      icon: "/flags/GB.svg",
      formatting: "normal",
    },
    {
      type: "français",
      name: "Français",
      description: "Phrases of common French words",
      icon: "/flags/FR.svg",
      formatting: "normal",
    },
    {
      type: "español",
      name: "Español",
      description: "Phrases of common Spanish words",
      icon: "/flags/ES.svg",
      formatting: "normal",
    },
    {
      type: "deutsch",
      name: "Deutsch",
      description: "Phrases of common German words",
      icon: "/flags/DE.svg",
      formatting: "normal",
    },
    {
      type: "italiano",
      name: "Italiano",
      description: "Phrases of common Italian words",
      icon: "/flags/IT.svg",
      formatting: "normal",
    },
    {
      type: "português",
      name: "Português",
      description: "Phrases of common Portuguese words",
      icon: "/flags/PT.svg",
      formatting: "normal",
    },
    {
      type: "dutch",
      name: "Dutch",
      description: "Phrases of common Dutch words",
      icon: "/flags/NL.svg",
      formatting: "normal",
    },
    {
      type: "polski",
      name: "Polski",
      description: "Phrases of common Polish words",
      icon: "/flags/PL.svg",
      formatting: "normal",
    },
    {
      type: "русский",
      name: "Русский",
      description: "Phrases of common Russian words",
      icon: "/flags/RU.svg",
      formatting: "normal",
    },
    {
      type: "हिंदी",
      name: "हिंदी",
      description: "Phrases of common Hindi words",
      icon: "/flags/IN.svg",
      formatting: "normal",
    },
  ],
  programming: [
    {
      type: "python",
      name: "Python",
      description: "Snippets of python from real open source projects",
      icon: "/logos/python.png",
      formatting: "code",
    },
    {
      type: "csharp",
      name: "C#",
      description: "Snippets of csharp from real open source projects",
      icon: "/logos/csharp.svg",
      formatting: "code",
    },
    {
      type: "typescript",
      name: "TypeScript",
      description: "Snippets of TypeScript from real open source projects",
      icon: "/logos/typescript.svg",
      formatting: "code",
    },
  ],
};

const baseHtmlTemplate = `<!DOCTYPE html>
<html lang="{{LANG}}">
  <head>
    <meta charset="UTF-8" />
    <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
    <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
    <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
    <link rel="icon" type="image/x-icon" href="/favicon.ico" />
    <link rel="shortcut icon" href="favicon.ico" type="image/x-icon" />
    <link rel="manifest" href="/site.webmanifest" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    {{CANONICAL}}
    <meta name="theme-color" content="#fbbf24" />
    <title>{{TITLE}}</title>
    <meta
      name="description"
      content="{{DESCRIPTION}}"
    />
    <meta
      name="keywords"
      content="{{KEYWORDS}}"
    />
    <meta
      property="og:description"
      content="{{OG_DESCRIPTION}}"
    />
    {{ADDITIONAL_META}}
    <style>
      body {
        background-color: #242424;
        margin: 0;
      }
      #root {
        height: 100vh;
        background-color: #242424;
      }
      .sr-only {
        position: absolute;
        width: 1px;
        height: 1px;
        padding: 0;
        margin: -1px;
        overflow: hidden;
        clip: rect(0, 0, 0, 0);
        border: 0;
      }
    </style>
    {{STRUCTURED_DATA}}
  </head>
  <body>
    <div class="sr-only">
      <h1>{{SR_TITLE}}</h1>
      <h2>{{SR_SUBTITLE}}</h2>
      <p>{{SR_DESCRIPTION_1}}</p>
      <p>{{SR_DESCRIPTION_2}}</p>
    </div>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>`;

// Language mappings for HTML lang attribute
const languageMap = {
  english: "en",
  français: "fr",
  español: "es",
  deutsch: "de",
  italiano: "it",
  português: "pt",
  dutch: "nl",
  polski: "pl",
  русский: "ru",
  हिंदी: "hi",
  copypastas: "en",
  shakespeare: "en",
  python: "en",
  typescript: "en",
  csharp: "en",
};

function generateLanguageKeywords(mode) {
  if (mode.type === "english") {
    return "free typing games,typing,touch typing,wpm,typing software,typing game,typing practice,free typing program,typing skills";
  }

  const baseKeywords =
    "typing games,multiplayer typing,wpm test,typing practice,online typing competition";
  return `${mode.name} typing,${baseKeywords}`;
}

function generateCodeKeywords(mode) {
  return `${mode.name} typing practice,code typing game,programming speed test,${mode.name} learning,coding practice,developer typing skills,${mode.name} snippets,coding challenges`;
}

function generateStructuredData(mode, isCode = false) {
  const baseData = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: `TypeRacing.io - ${mode.name}`,
    url: `https://typeracing.io/${isCode ? "code/" : ""}${mode.type}`,
    description: mode.description,
    applicationCategory: isCode ? "Educational" : "Entertainment",
    operatingSystem: "Web Browser",
    keywords: isCode
      ? generateCodeKeywords(mode).split(",")
      : generateLanguageKeywords(mode).split(","),
    potentialAction: {
      "@type": "PlayAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `https://typeracing.io/${mode.type}/search`,
        inLanguage: languageMap[mode.type] || "en",
      },
    },
    about: {
      "@type": "Thing",
      name: isCode
        ? "Programming Language Typing Competition"
        : "Typing Speed Competition",
    },
  };

  if (isCode) {
    baseData.educationalLevel = "Professional";
    baseData.learningResourceType = "Interactive Game";
    baseData.teaches = [
      "Typing Speed",
      "Code Accuracy",
      `${mode.name} Language Familiarity`,
    ];
  }

  return `<script type="application/ld+json">
      ${JSON.stringify(baseData, null, 8)}
    </script>`;
}

function generateHtmlFile(mode, isCode = false) {
  const title = `${mode.name} - TypeRacing.io`;
  const lang = languageMap[mode.type] || "en";
  const canonical = `<link rel="canonical" href="https://typeracing.io/${
    isCode ? "code/" : ""
  }${mode.type}" />`;

  let description,
    keywords,
    ogDescription,
    srTitle,
    srSubtitle,
    srDescription1,
    srDescription2;

  if (isCode) {
    description = `Practice writing ${mode.name} while racing against other developers worldwide. Type real code snippets from open source libraries to improve your typing accuracy and get your hands out of the way of your brain.`;
    keywords = generateCodeKeywords(mode);
    ogDescription = `Live ${mode.name} Code Racing Competition`;
    srTitle = `typeracing.io - ${mode.name} Code Races`;
    srSubtitle = `Type ${mode.name} code snippets against others in real-time`;
    srDescription1 = `Practice typing ${mode.name} code with real-time matches against other players.`;
    srDescription2 =
      "Includes code samples from actual projects. Track your speed and accuracy while competing against players of similar skill levels.";
  } else {
    if (mode.type === "english") {
      description =
        "Test your typing skills against real live people from all over the world. Compete against your friends, track your wpm, and improve your skills.";
      ogDescription = "Live type racing competition";
      srTitle = "typeracing.io - Compete in online typing races";
      srSubtitle =
        "Improve your typing speed while racing against real players";
      srDescription1 =
        "typeracing.io is an online typing platform that allows you to race against other players from around the world in real-time.";
      srDescription2 =
        "In each race, you compete against opponents of similar skill levels, you'll find yourself motivated to improve your typing speed and accuracy to climb the leaderboards.";
    } else {
      const languageNames = {
        français: "French",
        español: "Spanish",
        deutsch: "German",
        italiano: "Italian",
        português: "Portuguese",
        dutch: "Dutch",
        polski: "Polish",
        русский: "Russian",
        हिंदी: "Hindi",
        copypastas: "internet copypastas",
        shakespeare: "Shakespeare's works",
      };

      const langName = languageNames[mode.type] || mode.name;
      description = `Test your typing skills with ${langName} against real people from all over the world. Compete against your friends, track your WPM and improve your skills.`;
      ogDescription = `Live type racing competition in ${langName}`;
      srTitle = `typeracing.io - Online Typing Races in ${mode.name}`;
      srSubtitle = `Improve your typing speed competing with players in real-time`;
      srDescription1 = `typeracing.io is an online typing platform that allows you to compete against other players from around the world in real-time.`;
      srDescription2 = `In each race, you compete against opponents of similar skill level, motivating you to improve your typing speed and accuracy to climb the rankings.`;
    }

    keywords = generateLanguageKeywords(mode);
  }

  const additionalMeta = isCode
    ? `<meta property="og:image" content="https://typeracing.io/og-image.png" />
    <meta property="og:url" content="https://typeracing.io/code/${mode.type}" />
    <meta property="og:type" content="website" />
    <meta property="og:title" content="typeracing.io - ${mode.name} Code Races" />`
    : "";

  const structuredData = generateStructuredData(mode, isCode);

  return baseHtmlTemplate
    .replace(/{{LANG}}/g, lang)
    .replace(/{{CANONICAL}}/g, canonical)
    .replace(/{{TITLE}}/g, title)
    .replace(/{{DESCRIPTION}}/g, description)
    .replace(/{{KEYWORDS}}/g, keywords)
    .replace(/{{OG_DESCRIPTION}}/g, ogDescription)
    .replace(/{{ADDITIONAL_META}}/g, additionalMeta)
    .replace(/{{STRUCTURED_DATA}}/g, structuredData)
    .replace(/{{SR_TITLE}}/g, srTitle)
    .replace(/{{SR_SUBTITLE}}/g, srSubtitle)
    .replace(/{{SR_DESCRIPTION_1}}/g, srDescription1)
    .replace(/{{SR_DESCRIPTION_2}}/g, srDescription2);
}

function generateCodeIndexHtml() {
  const title = "typeracing.io - Code Racing";
  const description =
    "Practice typing out code while racing against other developers worldwide. Type real snippets from open source libraries to improve your typing accuracy and get your hands out of the way of your brain.";
  const keywords =
    "code typing practice, programming typing game, developer typing skills, coding speed test, programming practice, coding challenges, code snippets, typing test for programmers";
  const ogDescription = "Live Code Type Racing Competition";

  const structuredData = `<script type="application/ld+json">
      {
        "@context": "https://schema.org",
        "@type": "WebApplication",
        "name": "TypeRacing.io - Code Typing Challenge",
        "url": "https://typeracing.io/code",
        "description": "Practice writing code while racing against other developers worldwide. Improve your typing accuracy and speed with real code snippets from popular programming languages.",
        "applicationCategory": "Educational",
        "operatingSystem": "Web Browser",
        "keywords": [
          "code typing",
          "programming typing practice",
          "developer typing game",
          "coding speed test",
          "programming language typing",
          "developer skills"
        ],
        "potentialAction": {
          "@type": "PlayAction",
          "target": {
            "@type": "EntryPoint",
            "urlTemplate": "https://typeracing.io/{mode}/search",
            "inLanguage": "en"
          }
        },
        "about": {
          "@type": "Thing",
          "name": "Programming Language Typing Competition"
        },
        "educationalLevel": "Professional",
        "learningResourceType": "Interactive Game",
        "teaches": [
          "Typing Speed",
          "Code Accuracy",
          "Programming Language Familiarity"
        ]
      }
    </script>`;

  return baseHtmlTemplate
    .replace(/{{LANG}}/g, "en")
    .replace(
      /{{CANONICAL}}/g,
      '<link rel="canonical" href="https://typeracing.io/code" />'
    )
    .replace(/{{TITLE}}/g, title)
    .replace(/{{DESCRIPTION}}/g, description)
    .replace(/{{KEYWORDS}}/g, keywords)
    .replace(/{{OG_DESCRIPTION}}/g, ogDescription)
    .replace(
      /{{ADDITIONAL_META}}/g,
      `<meta property="og:image" content="https://typeracing.io/og-image.png" />
    <meta property="og:url" content="https://typeracing.io/code" />
    <meta property="og:type" content="website" />
    <meta property="og:title" content="typeracing.io - Code Type Races" />`
    )
    .replace(/{{STRUCTURED_DATA}}/g, structuredData)
    .replace(/{{SR_TITLE}}/g, "typeracing.io - Code Type Races")
    .replace(
      /{{SR_SUBTITLE}}/g,
      "Type programming code snippets against others in real-time"
    )
    .replace(
      /{{SR_DESCRIPTION_1}}/g,
      "Practice typing code with real-time matches against other developers."
    )
    .replace(
      /{{SR_DESCRIPTION_2}}/g,
      "Choose from multiple programming languages and practice with real code samples from actual projects. Track your speed and accuracy while competing against players of similar skill levels."
    );
}

// Generate all HTML files
function generateAllFiles() {
  const outputDir = "./";

  // Generate main index.html (English mode with special title)
  const englishMode = allModes.languages.find((m) => m.type === "english");
  const mainIndexHtml = baseHtmlTemplate
    .replace(/{{LANG}}/g, "en")
    .replace(/{{CANONICAL}}/g, "")
    .replace(/{{TITLE}}/g, "typeracing.io - Multiplayer typing races")
    .replace(
      /{{DESCRIPTION}}/g,
      "Test your typing skills against real live people from all over the world. Compete against your friends, track your wpm, and improve your skills."
    )
    .replace(
      /{{KEYWORDS}}/g,
      "free typing games,typing,touch typing,wpm,typing software,typing game,typing practice,free typing program,typing skills"
    )
    .replace(/{{OG_DESCRIPTION}}/g, "Live type racing competition")
    .replace(/{{ADDITIONAL_META}}/g, "")
    .replace(/{{STRUCTURED_DATA}}/g, generateStructuredData(englishMode))
    .replace(/{{SR_TITLE}}/g, "typeracing.io - Compete in online typing races")
    .replace(
      /{{SR_SUBTITLE}}/g,
      "Improve your typing speed while racing against real players"
    )
    .replace(
      /{{SR_DESCRIPTION_1}}/g,
      "typeracing.io is an online typing platform that allows you to race against other players from around the world in real-time."
    )
    .replace(
      /{{SR_DESCRIPTION_2}}/g,
      "In each race, you compete against opponents of similar skill levels, you'll find yourself motivated to improve your typing speed and accuracy to climb the leaderboards."
    );

  fs.writeFileSync(path.join(outputDir, "index.html"), mainIndexHtml);
  console.log("Generated index.html");

  // Generate language mode files (excluding english since it's index.html)
  [
    ...allModes.languages.filter((m) => m.type !== "english"),
    ...allModes.phrases,
  ].forEach((mode) => {
    const html = generateHtmlFile(mode, false);
    const filename = `${mode.type}.html`;
    fs.writeFileSync(path.join(outputDir, filename), html);
    console.log(`Generated ${filename}`);
  });

  // Generate programming mode files
  allModes.programming.forEach((mode) => {
    const html = generateHtmlFile(mode, true);
    const filename = `${mode.type}.html`;
    fs.writeFileSync(path.join(outputDir, filename), html);
    console.log(`Generated ${filename}`);
  });

  // Generate code.html
  const codeIndexHtml = generateCodeIndexHtml();
  fs.writeFileSync(path.join(outputDir, "code.html"), codeIndexHtml);
  console.log("Generated code.html");

  // Generate 404.html
  const notFoundHtml = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Page Not Found - typeracing.io</title>
    <style>
      body {
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
          Helvetica, Arial, sans-serif;
        background-color: #242424;
        color: #d6d3d1;
        text-align: center;
        padding: 50px 20px;
        margin: 0;
      }
      h1 {
        font-size: 32px;
      }
      p {
        color: #a8a29e;
        margin-bottom: 30px;
      }
      a {
        color: #f0b100;
        text-decoration: none;
      }
      a:hover {
        text-decoration: underline;
      }
    </style>
  </head>
  <body>
    <h1>404 - Page Not Found</h1>
    <p>The page you were looking for doesn't exist.</p>
    <a href="/">Return to Homepage</a>
  </body>
</html>`;

  fs.writeFileSync(path.join(outputDir, "404.html"), notFoundHtml);
  console.log("Generated 404.html");

  console.log("All HTML files generated successfully!");
}

// Update vite.config.ts input configuration
function updateViteConfig() {
  const viteConfigPath = "./vite.config.ts";

  // Generate input object for all modes
  const inputObject = {
    main: "index.html",
  };

  [
    ...allModes.languages.filter((m) => m.type !== "english"),
    ...allModes.phrases,
  ].forEach((mode) => {
    inputObject[mode.type] = `${mode.type}.html`;
  });

  allModes.programming.forEach((mode) => {
    inputObject[mode.type] = `${mode.type}.html`;
  });

  inputObject.code = "code.html";
  inputObject["404"] = "404.html";

  const viteConfigContent = `import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@shared": path.resolve(__dirname, "../shared"),
    },
  },
  build: {
    rollupOptions: {
      input: ${JSON.stringify(inputObject, null, 8)},
    },
  },
});`;

  fs.writeFileSync(viteConfigPath, viteConfigContent);
  console.log("Updated vite.config.ts");
}

// Run the generation
generateAllFiles();
updateViteConfig();
