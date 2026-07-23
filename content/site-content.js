const pageLoaders = {
  home: () => import("./home.js").then((module) => module.homeContent),
  research: () => import("./research.js").then((module) => module.researchContent),
  teaching: () => import("./teaching.js").then((module) => module.teachingContent),
  beyond: () => import("./beyond.js").then((module) => module.beyondContent),
};

export async function loadSiteContent(page) {
  const loadPage = pageLoaders[page];

  if (!loadPage) {
    throw new Error(`Unknown site page: ${page}`);
  }

  const [{ sharedContent }, pageContent] = await Promise.all([
    import("./shared.js"),
    loadPage(),
  ]);

  return {
    en: {
      shared: sharedContent.en,
      [page]: pageContent.en,
    },
    es: {
      shared: sharedContent.es,
      [page]: pageContent.es,
    },
  };
}
