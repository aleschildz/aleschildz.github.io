const paperTagsEn = [
  { id: "preprint", label: "preprint" },
  { id: "conference", label: "conference" },
  { id: "journal", label: "journal" },
  { id: "workshop", label: "workshop" },
  { id: "report", label: "report" },
];

const paperTagsEs = [
  { id: "preprint", label: "preprint" },
  { id: "conference", label: "conferencia" },
  { id: "journal", label: "revista" },
  { id: "workshop", label: "workshop" },
  { id: "report", label: "reporte" },
];

const paperEntries = {
  type: "txt",
  path: "content/text/research/papers.txt",
};

const highlightedAuthor = "María Alejandra Schild";

export const researchContent = {
  en: {
    title: "Publications",
    summary: "",
    tagLegend: paperTagsEn,
    entries: paperEntries,
    highlightedAuthor,
    paperLinkLabel: "Paper",
    emptyText: "Papers and preprints will appear here soon.",
  },
  es: {
    title: "Publicaciones",
    summary: "",
    tagLegend: paperTagsEs,
    entries: paperEntries,
    highlightedAuthor,
    paperLinkLabel: "Artículo",
    emptyText: "Pronto aparecerán aquí papers y preprints.",
  },
};
