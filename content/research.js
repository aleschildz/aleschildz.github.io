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

export const researchContent = {
  en: {
    title: "Research & Publications",
    summary: "",
    tagLegend: paperTagsEn,
    entries: paperEntries,
    emptyText: "Papers and preprints will appear here soon.",
  },
  es: {
    title: "Investigación y publicaciones",
    summary: "",
    tagLegend: paperTagsEs,
    entries: paperEntries,
    emptyText: "Pronto aparecerán aquí papers y preprints.",
  },
};
