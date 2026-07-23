const valdiviaPhotos = [
  {
    file: "costanera.jpg",
    caption: {
      en: "Sea lions on the waterfront",
      es: "lobos marinos en la costanera",
    },
    alt: {
      en: "Valdivia's riverside waterfront with sea lions by the water.",
      es: "Costanera de Valdivia junto al río, con lobos marinos junto al agua.",
    },
  },
  {
    file: "saval.jpg",
    caption: {
      en: "Saval Park",
      es: "parque Saval",
    },
    alt: {
      en: "A wetland and wooded area in Saval, Valdivia.",
      es: "Humedal y bosque en la Saval, Valdivia.",
    },
  },
  {
    file: "oncol.jpg",
    caption: {
      en: "Summit of Oncol Park",
      es: "cima del parque Oncol",
    },
    alt: {
      en: "A misty view over the forested hills of Oncol near Valdivia.",
      es: "Vista con neblina sobre los cerros boscosos de Oncol, cerca de Valdivia.",
    },
  },
  {
    file: "pilolcura.jpg",
    caption: {
      en: "Pilolcura Beach",
      es: "playa Pilolcura",
    },
    alt: {
      en: "Rock formations and ocean at Pilolcura, on the coast near Valdivia.",
      es: "Formaciones rocosas y mar en Pilolcura, en la costa cerca de Valdivia.",
    },
  },
];

function valdiviaGallery(language) {
  return valdiviaPhotos.map((photo) => ({
    src: `assets/images/valdivia/${photo.file}`,
    caption: photo.caption[language],
    alt: photo.alt[language],
  }));
}

export const beyondContent = {
  en: {
    title: "More",
    summary: "",
    sections: [
      {
        id: "valdivia",
        title: "Valdivia",
        paragraphs: {
          type: "txt",
          path: "content/text/beyond/valdivia.en.txt",
        },
        gallery: valdiviaGallery("en"),
      },
      {
        id: "favorite-books",
        title: "My favorite books",
        paragraphs: {
          type: "txt",
          path: "content/text/beyond/books-genres.en.txt",
        },
        bookList: {
          type: "txt",
          path: "content/text/beyond/books-list.en.txt",
        },
      },
    ],
  },
  es: {
    title: "Más",
    summary: "",
    sections: [
      {
        id: "valdivia",
        title: "Valdivia",
        paragraphs: {
          type: "txt",
          path: "content/text/beyond/valdivia.es.txt",
        },
        gallery: valdiviaGallery("es"),
      },
      {
        id: "favorite-books",
        title: "Mis libros favoritos",
        paragraphs: {
          type: "txt",
          path: "content/text/beyond/books-genres.es.txt",
        },
        bookList: {
          type: "txt",
          path: "content/text/beyond/books-list.es.txt",
        },
      },
    ],
  },
};
