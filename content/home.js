export const homeContent = {
  en: {
    title: "Hi! I'm Alejandra",
    meta: "Santiago, Chile",
    intro: {
      type: "txt",
      path: "content/text/home/intro.en.txt",
      fallback: [
        "I am María Alejandra Schild, based in Santiago, Chile. This website is a place to gather my research, teaching, talks, and a few things beyond academic work.",
        "I want it to stay simple, clear, and pleasant to read, while gradually becoming a useful home for papers, materials, and other notes I may want to share.",
      ],
    },
    contact: [{ type: "email", user: "aleschildz", domain: "uc.cl" }],
    links: [
      {
        label: "LinkedIn",
        href: "https://www.linkedin.com/in/maría-alejandra-schild-9a3277403",
      },
      { label: "GitHub", href: "https://github.com/aleschildz" },
      {
        label: "Google Scholar",
        href: "https://scholar.google.com/citations?user=yf-qYlEAAAAJ&hl=en",
      },
      {
        label: "CV (EN)",
        href: "assets/documents/maria-alejandra-schild-cv-en.pdf",
      },
      {
        label: "CV (ES)",
        href: "assets/documents/maria-alejandra-schild-cv-es.pdf",
      },
    ],
    photo: {
      src: "assets/images/maria-alejandra-schild.jpg",
      alt: "Portrait of María Alejandra Schild",
      placeholder: "Add your photo here",
    },
    newsTitle: "News",
    news: {
      type: "txt",
      path: "content/text/home/news.en.txt",
      fallback: [
        "Homepage updated with portrait and first personal details.",
        "First visual direction for the site defined.",
      ],
    },
    updated: {
      type: "txt",
      path: "content/text/home/updated.en.txt",
      fallback: "April 2026",
    },
    updatedPrefix: "Last updated: ",
  },
  es: {
    title: "¡Hola! Me llamo Alejandra",
    meta: "Santiago, Chile",
    intro: {
      type: "txt",
      path: "content/text/home/intro.es.txt",
      fallback: [
        "Soy María Alejandra Schild y vivo en Santiago, Chile. Esta página quiere reunir mi investigación, mi docencia, mis charlas y también algunas cosas que quedan un poco más allá del trabajo académico.",
        "Me gustaría que siguiera siendo simple, clara y agradable de recorrer, y que con el tiempo se convirtiera en un lugar útil para compartir papers, materiales y otras notas.",
      ],
    },
    contact: [{ type: "email", user: "aleschildz", domain: "uc.cl" }],
    links: [
      {
        label: "LinkedIn",
        href: "https://www.linkedin.com/in/maría-alejandra-schild-9a3277403",
      },
      { label: "GitHub", href: "https://github.com/aleschildz" },
      {
        label: "Google Scholar",
        href: "https://scholar.google.com/citations?user=yf-qYlEAAAAJ&hl=en",
      },
      {
        label: "CV (EN)",
        href: "assets/documents/maria-alejandra-schild-cv-en.pdf",
      },
      {
        label: "CV (ES)",
        href: "assets/documents/maria-alejandra-schild-cv-es.pdf",
      },
    ],
    photo: {
      src: "assets/images/maria-alejandra-schild.jpg",
      alt: "Retrato de María Alejandra Schild",
      placeholder: "Aquí puede ir tu foto",
    },
    newsTitle: "Novedades",
    news: {
      type: "txt",
      path: "content/text/home/news.es.txt",
      fallback: [
        "La portada se actualizó con foto y primeros datos personales.",
        "Se definió la primera dirección visual del sitio.",
      ],
    },
    updated: {
      type: "txt",
      path: "content/text/home/updated.es.txt",
      fallback: "abril de 2026",
    },
    updatedPrefix: "Última actualización: ",
  },
};
