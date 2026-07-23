import { loadSiteContent } from "../content/site-content.js";

const page = document.body.dataset.page;
const storageKey = "academic-site-language";
const textContentCache = new Map();

let renderVersion = 0;
let siteContent = null;
let activeLightboxItems = [];
let activeLightboxIndex = 0;
let lastFocusedLightboxTrigger = null;

const lightboxLabels = {
  en: {
    close: "Close image",
    next: "Next image",
    previous: "Previous image",
    open: "Enlarge photo",
  },
  es: {
    close: "Cerrar imagen",
    next: "Imagen siguiente",
    previous: "Imagen anterior",
    open: "Ampliar foto",
  },
};

let activeLanguage = readStoredLanguage() || document.documentElement.lang || "en";

void initializeSite().catch(showSiteLoadError);

async function initializeSite() {
  siteContent = await loadSiteContent(page);

  if (!(activeLanguage in siteContent)) {
    activeLanguage = "en";
  }

  await renderSite();
  bindLanguageSwitch();
}

function readStoredLanguage() {
  try {
    return window.localStorage.getItem(storageKey) || "";
  } catch {
    return "";
  }
}

function storeLanguage(language) {
  try {
    window.localStorage.setItem(storageKey, language);
  } catch {
    // The language still changes for this visit when storage is unavailable.
  }
}

function showSiteLoadError(error) {
  console.error("The site content could not be loaded.", error);

  const main = document.querySelector("main");

  if (!main) {
    return;
  }

  const message = document.createElement("p");
  message.className = "site-load-error";
  message.setAttribute("role", "alert");
  message.textContent =
    activeLanguage === "es"
      ? "No se pudo cargar este contenido. Por favor, vuelve a intentarlo."
      : "This content could not be loaded. Please try again.";

  main.replaceChildren(message);
}

async function renderSite() {
  const currentRender = ++renderVersion;
  const copy = siteContent[activeLanguage];

  document.documentElement.lang = activeLanguage;
  document.title = pageTitle(copy);

  setText("brand-name", copy.shared.brandName);
  setText("footer-text", copy.shared.footerText);
  toggleFooter(copy.shared.footerText);
  renderNav(copy.shared.nav);
  updateLanguageButtons();

  if (page === "home") {
    await renderHome(copy.home, currentRender);
  }

  if (page === "research") {
    await renderResearch(copy.research, currentRender);
  }

  if (page === "teaching") {
    renderTeaching(copy.teaching);
  }

  if (page === "beyond") {
    await renderBeyond(copy.beyond, currentRender);
  }
}

function pageTitle(copy) {
  if (page === "home") {
    return copy.shared.brandName;
  }

  const sectionTitle = copy[page]?.title;
  return sectionTitle ? `${sectionTitle} | ${copy.shared.brandName}` : copy.shared.brandName;
}

function bindLanguageSwitch() {
  document.querySelectorAll("[data-lang-option]").forEach((button) => {
    button.addEventListener("click", () => {
      const nextLanguage = button.dataset.langOption;

      if (!(nextLanguage in siteContent)) {
        return;
      }

      activeLanguage = nextLanguage;
      storeLanguage(nextLanguage);
      void renderSite().catch(showSiteLoadError);
    });
  });
}

function renderNav(items) {
  const nav = document.getElementById("site-nav");

  if (!nav) {
    return;
  }

  nav.replaceChildren(
    ...items.map((item) => {
      const href = getAllowedHref(item.href);
      const link = document.createElement(href ? "a" : "span");

      link.textContent = item.label;

      if (href) {
        link.href = href;
      }

      if (item.id === page) {
        link.setAttribute("aria-current", "page");
      }

      return link;
    }),
  );
}

async function renderHome(copy, currentRender) {
  const [intro, news, updated] = await Promise.all([
    resolveParagraphContent(copy.intro),
    resolveNewsContent(copy.news),
    resolveInlineTextContent(copy.updated),
  ]);

  if (currentRender !== renderVersion) {
    return;
  }

  setText("home-title", copy.title);
  setTextOrHide("home-meta", copy.meta);
  renderParagraphs("home-intro", intro);
  renderContactItems("home-contact", copy.contact);
  renderLinkList("home-links", copy.links, "link-chip");
  renderPhoto(copy.photo);
  setText("news-title", copy.newsTitle);
  renderNews("news-list", news);
  setTextOrHide("news-updated", deriveUpdatedText(copy, updated));
}

async function renderResearch(copy, currentRender) {
  const entries = await resolvePaperEntries(copy.entries);

  if (currentRender !== renderVersion) {
    return;
  }

  setText("page-title", copy.title);
  setTextOrHide("page-summary", copy.summary);
  renderPaperEntries("research-list", entries, copy);
}

function renderTeaching(copy) {
  setText("page-title", copy.title);
  setTextOrHide("page-summary", copy.summary);
  setText("teaching-title", copy.teachingTitle);
  setText("talks-title", copy.talksTitle);
  renderEntries("teaching-list", copy.teachingEntries);
  renderEntries("talks-list", copy.talkEntries);
}

async function renderBeyond(copy, currentRender) {
  const sections = await resolveEssaySections(copy.sections);

  if (currentRender !== renderVersion) {
    return;
  }

  setText("page-title", copy.title);
  setTextOrHide("page-summary", copy.summary);
  renderEssaySections("beyond-sections", sections);
}

function renderPhoto(photo) {
  const node = document.getElementById("photo-frame");

  if (!node) {
    return;
  }

  const photoInner = document.createElement("div");
  const source = getSameOriginWebUrl(photo.src);

  photoInner.className = "photo-inner";
  node.classList.toggle("has-photo", Boolean(source));

  if (source) {
    const image = document.createElement("img");
    image.src = source.href;
    image.alt = photo.alt || "";
    image.decoding = "async";
    photoInner.append(image);
  } else {
    const placeholder = document.createElement("div");
    placeholder.className = "photo-placeholder";
    placeholder.textContent = photo.placeholder || "";
    photoInner.append(placeholder);
  }

  node.replaceChildren(photoInner);
}

function renderContactItems(id, items) {
  const node = document.getElementById(id);

  if (!node) {
    return;
  }

  node.replaceChildren(
    ...items.map((item) => {
      const href = getAllowedHref(item.href);
      const itemNode = document.createElement(href ? "a" : "span");

      itemNode.className = "contact-item";

      if (item.type === "email") {
        itemNode.textContent = obfuscateEmail(item.user, item.domain, activeLanguage);
        return itemNode;
      }

      if (href) {
        itemNode.href = href;
      }

      itemNode.textContent = item.text || "";
      return itemNode;
    }),
  );
}

function obfuscateEmail(user, domain, language) {
  const dotText = language === "es" ? " [punto] " : " [dot] ";
  const atText = language === "es" ? " [arroba] " : " [at] ";
  return `${user}${atText}${domain.replace(".", dotText)}`;
}

function renderLinkList(id, items, className) {
  const node = document.getElementById(id);

  if (!node) {
    return;
  }

  node.replaceChildren(
    ...items.map((item) => createLinkChip(item.label, item.href, className)),
  );
}

function renderNews(id, items) {
  const node = document.getElementById(id);

  if (!node) {
    return;
  }

  node.replaceChildren(
    ...items.map((item) => {
      const listItem = document.createElement("li");
      const textNode = document.createElement("span");

      listItem.className = "news-item";
      textNode.className = "news-text";

      appendInlineContent(textNode, item);
      listItem.append(textNode);

      return listItem;
    }),
  );
}

function renderEntries(id, items) {
  const node = document.getElementById(id);

  if (!node) {
    return;
  }

  node.replaceChildren(...items.map((item) => createEntryNode(item)));
}

function renderPaperEntries(id, items, copy) {
  const node = document.getElementById(id);

  if (!node) {
    return;
  }

  const tagLabels = new Map(
    (copy.tagLegend || []).map((tag) => [normalizePaperTag(tag.id), tag.label]),
  );

  node.classList.toggle("is-empty", !items.length);

  if (!items.length) {
    const empty = document.createElement("p");
    empty.className = "paper-empty";
    empty.textContent = copy.emptyText || "";
    node.replaceChildren(empty);
    return;
  }

  node.replaceChildren(...items.map((item) => createPaperEntryNode(item, tagLabels)));
}

function createPaperEntryNode(item, tagLabels) {
  const article = document.createElement("article");
  const entryTop = document.createElement("div");
  const title = document.createElement("h2");
  const tag = normalizePaperTag(item.tag || "preprint");

  article.className = "entry paper-entry";
  entryTop.className = "entry-top";
  title.className = "entry-title paper-title";

  const paperHref = getAllowedHref(item.href);

  if (paperHref) {
    const link = document.createElement("a");
    link.href = paperHref;
    link.textContent = item.title;
    title.append(link);
  } else {
    title.textContent = item.title;
  }

  entryTop.append(title, createPaperTag(tag, tagLabels.get(tag) || tag));
  article.append(entryTop);

  if (item.authors) {
    const authors = document.createElement("p");
    authors.className = "entry-meta paper-authors";
    authors.textContent = item.authors;
    article.append(authors);
  }

  if (item.venue || item.year) {
    const venue = document.createElement("p");
    venue.className = "entry-context paper-venue";
    venue.textContent = [item.venue, item.year].filter(Boolean).join(" · ");
    article.append(venue);
  }

  if (item.highlight) {
    const highlight = document.createElement("p");
    highlight.className = "paper-highlight";
    highlight.textContent = item.highlight;
    article.append(highlight);
  }

  return article;
}

function createPaperTag(tag, label) {
  const status = document.createElement("span");

  status.className = "status-pill paper-tag";
  status.dataset.tag = normalizePaperTag(tag);
  status.textContent = label;

  return status;
}

function createEntryNode(item) {
  const article = document.createElement("article");
  const entryTop = document.createElement("div");
  const title = document.createElement("h2");

  article.className = "entry";
  entryTop.className = "entry-top";
  title.className = "entry-title";
  title.textContent = item.title;

  entryTop.append(title);

  if (item.status) {
    const status = document.createElement("span");
    status.className = "status-pill";
    status.textContent = item.status;
    entryTop.append(status);
  }

  article.append(entryTop);

  if (item.meta) {
    const meta = document.createElement("p");
    meta.className = "entry-meta";
    meta.textContent = item.meta;
    article.append(meta);
  }

  if (item.description) {
    const description = document.createElement("p");
    description.className = "entry-context";
    appendInlineContent(description, item.description);
    article.append(description);
  }

  if (item.links?.length) {
    const links = document.createElement("div");
    links.className = "entry-links";
    links.replaceChildren(
      ...item.links.map((link) => createLinkChip(link.label, link.href, "entry-link")),
    );
    article.append(links);
  }

  if (item.note?.length) {
    article.append(createEntryDetails(item));
  }

  return article;
}

function createEntryDetails(item) {
  const details = document.createElement("details");
  const summary = document.createElement("summary");
  const note = document.createElement("div");

  details.className = "entry-details";
  summary.textContent = item.noteTitle || "Notes";
  note.className = "entry-note";

  item.note.forEach((paragraph) => {
    const paragraphNode = document.createElement("p");
    appendInlineContent(paragraphNode, paragraph);
    note.append(paragraphNode);
  });

  details.append(summary, note);
  return details;
}

async function resolveEssaySections(sections) {
  return Promise.all(
    (sections || []).map(async (section) => ({
      ...section,
      paragraphs: await resolveParagraphContent(section.paragraphs),
      bookList: await resolveBookListContent(section.bookList),
    })),
  );
}

function renderEssaySections(id, sections) {
  const node = document.getElementById(id);

  if (!node) {
    return;
  }

  node.replaceChildren(...sections.map((section) => createEssaySection(section)));
}

function createEssaySection(section) {
  const sectionNode = document.createElement("section");
  const title = document.createElement("h2");

  sectionNode.className = "essay-section";

  if (section.id) {
    sectionNode.id = section.id;
  }

  title.textContent = section.title;
  sectionNode.append(title);

  (section.paragraphs || []).forEach((paragraph) => {
    const paragraphNode = document.createElement("p");
    appendInlineContent(paragraphNode, paragraph);
    sectionNode.append(paragraphNode);
  });

  if (section.gallery?.length) {
    sectionNode.append(createImageGallery(section.gallery));
  }

  if (section.bookList?.length) {
    sectionNode.append(createBookList(section.bookList));
  }

  return sectionNode;
}

function createBookList(items) {
  const list = document.createElement("ul");

  list.className = "book-list";

  items.forEach((item) => {
    const listItem = document.createElement("li");
    const author = document.createElement("span");
    const separator = document.createElement("span");
    const title = document.createElement("span");

    author.className = "book-author";
    separator.className = "book-separator";
    title.className = "book-title";

    author.textContent = item.author;
    separator.textContent = " — ";
    title.textContent = item.title;

    listItem.append(author, separator, title);
    list.append(listItem);
  });

  return list;
}

function createImageGallery(images) {
  const gallery = document.createElement("div");
  const labels = lightboxLabels[activeLanguage] || lightboxLabels.en;
  const safeImages = images
    .map((image) => {
      const source = getSameOriginWebUrl(image.src);

      if (!source) {
        return null;
      }

      return {
        ...image,
        src: source.href,
      };
    })
    .filter(Boolean);

  gallery.className = "image-gallery";

  safeImages.forEach((image, index) => {
    const button = document.createElement("button");
    const thumbnail = document.createElement("img");

    button.className = "image-gallery-button";
    button.type = "button";
    button.setAttribute("aria-label", `${labels.open}: ${image.caption || image.alt}`);
    button.addEventListener("click", () => openImageLightbox(safeImages, index, button));

    thumbnail.src = image.src;
    thumbnail.alt = image.alt;
    thumbnail.loading = "lazy";
    thumbnail.decoding = "async";

    button.append(thumbnail);
    gallery.append(button);
  });

  return gallery;
}

// The lightbox is created only when a visitor opens a gallery image.
// This keeps normal page rendering simple while still supporting keyboard use.
function openImageLightbox(images, index, trigger) {
  const lightbox = getImageLightbox();

  activeLightboxItems = images;
  activeLightboxIndex = index;
  lastFocusedLightboxTrigger = trigger;

  lightbox.hidden = false;
  document.body.classList.add("has-lightbox");
  updateLightboxLabels(lightbox);
  renderLightboxImage(lightbox);
  lightbox.querySelector("[data-lightbox-action='close']")?.focus();
}

function closeImageLightbox() {
  const lightbox = document.getElementById("image-lightbox");

  if (!lightbox || lightbox.hidden) {
    return;
  }

  lightbox.hidden = true;
  document.body.classList.remove("has-lightbox");
  activeLightboxItems = [];

  if (lastFocusedLightboxTrigger instanceof HTMLElement) {
    lastFocusedLightboxTrigger.focus();
  }

  lastFocusedLightboxTrigger = null;
}

function getImageLightbox() {
  const existingLightbox = document.getElementById("image-lightbox");

  if (existingLightbox) {
    return existingLightbox;
  }

  const lightbox = document.createElement("div");
  const frame = document.createElement("figure");
  const image = document.createElement("img");
  const caption = document.createElement("figcaption");
  const closeButton = createLightboxButton("close", "x");
  const previousButton = createLightboxButton("previous", "<");
  const nextButton = createLightboxButton("next", ">");

  lightbox.id = "image-lightbox";
  lightbox.className = "image-lightbox";
  lightbox.hidden = true;
  lightbox.setAttribute("role", "dialog");
  lightbox.setAttribute("aria-modal", "true");

  frame.className = "image-lightbox-frame";
  image.className = "image-lightbox-image";
  caption.className = "image-lightbox-caption";
  closeButton.classList.add("image-lightbox-close");
  previousButton.classList.add("image-lightbox-previous");
  nextButton.classList.add("image-lightbox-next");

  frame.append(image, caption);
  lightbox.append(closeButton, previousButton, frame, nextButton);

  lightbox.addEventListener("click", handleLightboxClick);
  document.addEventListener("keydown", handleLightboxKeydown);
  document.body.append(lightbox);

  return lightbox;
}

function createLightboxButton(action, label) {
  const button = document.createElement("button");

  button.className = "image-lightbox-button";
  button.type = "button";
  button.dataset.lightboxAction = action;
  button.textContent = label;

  return button;
}

function handleLightboxClick(event) {
  const actionNode =
    event.target instanceof Element
      ? event.target.closest("[data-lightbox-action]")
      : null;
  const action = actionNode?.dataset.lightboxAction;

  if (!action && event.target.id === "image-lightbox") {
    closeImageLightbox();
    return;
  }

  if (action === "close") {
    closeImageLightbox();
  }

  if (action === "previous") {
    showAdjacentLightboxImage(-1);
  }

  if (action === "next") {
    showAdjacentLightboxImage(1);
  }
}

function handleLightboxKeydown(event) {
  const lightbox = document.getElementById("image-lightbox");

  if (!lightbox || lightbox.hidden) {
    return;
  }

  if (event.key === "Escape") {
    closeImageLightbox();
  }

  if (event.key === "ArrowLeft") {
    showAdjacentLightboxImage(-1);
  }

  if (event.key === "ArrowRight") {
    showAdjacentLightboxImage(1);
  }
}

function showAdjacentLightboxImage(step) {
  const lightbox = document.getElementById("image-lightbox");

  if (!lightbox || !activeLightboxItems.length) {
    return;
  }

  activeLightboxIndex =
    (activeLightboxIndex + step + activeLightboxItems.length) %
    activeLightboxItems.length;
  renderLightboxImage(lightbox);
}

function renderLightboxImage(lightbox) {
  const item = activeLightboxItems[activeLightboxIndex];
  const image = lightbox.querySelector(".image-lightbox-image");
  const caption = lightbox.querySelector(".image-lightbox-caption");
  const hasNavigation = activeLightboxItems.length > 1;
  const source = getSameOriginWebUrl(item?.src);

  if (!item || !image || !caption || !source) {
    closeImageLightbox();
    return;
  }

  image.src = source.href;
  image.alt = item.alt || "";
  caption.textContent = item.caption || "";
  caption.hidden = !item.caption;

  lightbox
    .querySelectorAll("[data-lightbox-action='previous'], [data-lightbox-action='next']")
    .forEach((button) => {
      button.hidden = !hasNavigation;
    });
}

function updateLightboxLabels(lightbox) {
  const labels = lightboxLabels[activeLanguage] || lightboxLabels.en;

  lightbox.querySelector("[data-lightbox-action='close']")?.setAttribute(
    "aria-label",
    labels.close,
  );
  lightbox.querySelector("[data-lightbox-action='previous']")?.setAttribute(
    "aria-label",
    labels.previous,
  );
  lightbox.querySelector("[data-lightbox-action='next']")?.setAttribute(
    "aria-label",
    labels.next,
  );
}

function renderParagraphs(id, paragraphs) {
  const node = document.getElementById(id);

  if (!node) {
    return;
  }

  node.replaceChildren(
    ...paragraphs.map((paragraph) => {
      const paragraphNode = document.createElement("p");
      appendInlineContent(paragraphNode, paragraph);
      return paragraphNode;
    }),
  );
}

async function resolveParagraphContent(content) {
  if (Array.isArray(content)) {
    return content;
  }

  if (content?.type === "txt" && content.path) {
    const text = await loadTextContent(content.path);
    const paragraphs = parseParagraphText(text);

    if (paragraphs.length) {
      return paragraphs;
    }

    return content.fallback || [];
  }

  return [];
}

async function resolveBookListContent(content) {
  if (Array.isArray(content)) {
    return content;
  }

  if (content?.type === "txt" && content.path) {
    const text = await loadTextContent(content.path);
    const entries = parseBookListText(text);

    if (entries.length) {
      return entries;
    }

    return content.fallback || [];
  }

  return [];
}

async function resolveNewsContent(content) {
  if (Array.isArray(content)) {
    return content;
  }

  if (content?.type === "txt" && content.path) {
    const text = await loadTextContent(content.path);
    const entries = parseNewsText(text);

    if (entries.length) {
      return entries;
    }

    return content.fallback || [];
  }

  return [];
}

async function resolvePaperEntries(content) {
  if (Array.isArray(content)) {
    return content;
  }

  if (content?.type === "txt" && content.path) {
    const text = await loadTextContent(content.path);
    const entries = parsePaperEntriesText(text);

    if (entries.length) {
      return entries;
    }

    return content.fallback || [];
  }

  return [];
}

async function resolveInlineTextContent(content) {
  if (typeof content === "string") {
    return content;
  }

  if (content?.type === "txt" && content.path) {
    const text = await loadTextContent(content.path);
    const line = text.trim();

    if (line) {
      return line;
    }

    return content.fallback || "";
  }

  return "";
}

async function loadTextContent(path) {
  const url = getSameOriginWebUrl(path);

  if (!url) {
    throw new Error(`Refused to load non-local text content: ${path}`);
  }

  if (!textContentCache.has(url.href)) {
    const request = fetch(url).then((response) => {
      if (!response.ok) {
        throw new Error(`Failed to load ${path}`);
      }

      return response.text();
    });

    textContentCache.set(url.href, request);
  }

  return textContentCache.get(url.href);
}

function parseParagraphText(text) {
  return text
    .split(/\n\s*\n/g)
    .map((paragraph) => paragraph.replace(/\s*\n\s*/g, " ").trim())
    .filter(Boolean);
}

function parseBookListText(text) {
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith("#"))
    .map((line) => {
      const [author, ...titleParts] = line.split(/\s+[-–—]\s+/);
      const title = titleParts.join(" - ").trim();

      if (!title) {
        return null;
      }

      return {
        author: author.trim(),
        title,
      };
    })
    .filter(Boolean);
}

function parseNewsText(text) {
  return text
    .split(/\n\s*---\s*\n/g)
    .map((block) => {
      const item = block.replace(/\s*\n\s*/g, " ").trim();
      return item || null;
    })
    .filter(Boolean);
}

function parsePaperEntriesText(text) {
  return text
    .split(/\n\s*---\s*\n/g)
    .map(parsePaperBlock)
    .filter(Boolean);
}

function parsePaperBlock(block) {
  const fields = {};
  let currentKey = "";

  block.split("\n").forEach((line) => {
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith("#")) {
      return;
    }

    const match = /^([A-Za-z][A-Za-z0-9 _-]*):\s*(.*)$/.exec(trimmed);

    if (match) {
      currentKey = normalizePaperField(match[1]);
      fields[currentKey] = match[2].trim();
      return;
    }

    if (currentKey) {
      fields[currentKey] = `${fields[currentKey]} ${trimmed}`.trim();
    }
  });

  const getField = (...keys) =>
    keys.map((key) => fields[normalizePaperField(key)]).find(Boolean) || "";
  const title = getField("title");

  if (!title) {
    return null;
  }

  return {
    title,
    href: getField("url", "href", "link", "arxiv"),
    authors: getField("authors", "author"),
    venue: getField("venue", "instance", "publication", "where"),
    year: getField("year"),
    tag: normalizePaperTag(getField("tag", "type", "status") || "preprint"),
    highlight: getField("highlight", "award", "note"),
  };
}

function normalizePaperField(value) {
  return value.toLowerCase().replace(/[\s_-]+/g, "");
}

function normalizePaperTag(value = "") {
  const tag = value.toLowerCase().trim();
  const aliases = {
    arxiv: "preprint",
    article: "journal",
    conf: "conference",
    proceedings: "conference",
    "pre-print": "preprint",
  };

  return (aliases[tag] || tag || "preprint").replace(/\s+/g, "-");
}

function appendInlineContent(node, text) {
  const parts = parseInlineMarkdownLinks(text);

  if (!parts.length) {
    node.textContent = text;
    return;
  }

  parts.forEach((part) => {
    if (part.type === "link") {
      const link = document.createElement("a");
      link.href = part.href;
      link.textContent = part.label;
      node.appendChild(link);
      return;
    }

    node.appendChild(document.createTextNode(part.text));
  });
}

function deriveUpdatedText(copy, updatedValue) {
  if (updatedValue && copy.updatedPrefix) {
    return `${copy.updatedPrefix}${updatedValue}`;
  }

  return copy.updatedText || "";
}

function parseInlineMarkdownLinks(text) {
  const pattern = /\[([^\]]+)\]\(([^)]+)\)/g;
  const parts = [];
  let lastIndex = 0;

  for (const match of text.matchAll(pattern)) {
    const [raw, label, href] = match;
    const start = match.index ?? 0;

    if (start > lastIndex) {
      parts.push({
        type: "text",
        text: text.slice(lastIndex, start),
      });
    }

    const allowedHref = getAllowedHref(href);

    if (allowedHref) {
      parts.push({
        type: "link",
        label,
        href: allowedHref,
      });
    } else {
      parts.push({
        type: "text",
        text: raw,
      });
    }

    lastIndex = start + raw.length;
  }

  if (lastIndex < text.length) {
    parts.push({
      type: "text",
      text: text.slice(lastIndex),
    });
  }

  return parts;
}

function getAllowedHref(value) {
  if (typeof value !== "string" || !value.trim()) {
    return "";
  }

  try {
    const url = new URL(value, window.location.href);
    const isSecureWebLink = url.protocol === "https:";
    const isEmailLink = url.protocol === "mailto:";
    const isLocalPreviewLink =
      url.protocol === "http:" && url.origin === window.location.origin;

    return isSecureWebLink || isEmailLink || isLocalPreviewLink ? value : "";
  } catch {
    return "";
  }
}

function getSameOriginWebUrl(value) {
  if (typeof value !== "string" || !value.trim()) {
    return null;
  }

  try {
    const url = new URL(value, window.location.href);
    const isWebUrl = url.protocol === "http:" || url.protocol === "https:";

    return isWebUrl && url.origin === window.location.origin ? url : null;
  } catch {
    return null;
  }
}

function toggleFooter(value) {
  const footer = document.getElementById("footer-shell");

  if (!footer) {
    return;
  }

  footer.classList.toggle("is-hidden", !value);
}

function updateLanguageButtons() {
  document.querySelectorAll("[data-lang-option]").forEach((button) => {
    const isActive = button.dataset.langOption === activeLanguage;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });
}

function createLinkChip(label, href, className) {
  const allowedHref = getAllowedHref(href);
  const chip = document.createElement(allowedHref ? "a" : "span");

  chip.className = className;
  chip.textContent = label;

  if (allowedHref) {
    chip.href = allowedHref;
  } else {
    chip.classList.add("is-disabled");
  }

  return chip;
}

function setText(id, value) {
  const node = document.getElementById(id);

  if (!node) {
    return;
  }

  node.textContent = value;
}

function setTextOrHide(id, value) {
  const node = document.getElementById(id);

  if (!node) {
    return;
  }

  node.textContent = value || "";
  node.hidden = !value;
}
