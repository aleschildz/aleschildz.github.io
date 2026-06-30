export async function loadSiteContent(version = "") {
  const modules = await Promise.all([
    importVersioned("./beyond.js", version),
    importVersioned("./home.js", version),
    importVersioned("./research.js", version),
    importVersioned("./shared.js", version),
    importVersioned("./teaching.js", version),
  ]);

  const [beyondModule, homeModule, researchModule, sharedModule, teachingModule] = modules;
  const beyondContent = beyondModule.beyondContent;
  const homeContent = homeModule.homeContent;
  const researchContent = researchModule.researchContent;
  const sharedContent = sharedModule.sharedContent;
  const teachingContent = teachingModule.teachingContent;

  return {
    en: {
      shared: sharedContent.en,
      home: homeContent.en,
      research: researchContent.en,
      teaching: teachingContent.en,
      beyond: beyondContent.en,
    },
    es: {
      shared: sharedContent.es,
      home: homeContent.es,
      research: researchContent.es,
      teaching: teachingContent.es,
      beyond: beyondContent.es,
    },
  };
}

async function importVersioned(path, version) {
  const url = new URL(path, import.meta.url);

  if (version) {
    url.searchParams.set("v", version);
  }

  return import(url.href);
}
