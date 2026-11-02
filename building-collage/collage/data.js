/* =====================================================================
   EDIT THIS FILE to add your buildings.

   For each building:
     image  – path to the picture inside the /images folder
     title  – the building's name (shown big in the panel)
     facts  – optional short label/value pairs (architect, date, place…)
     text   – your paragraphs, one string per paragraph
     credit – optional photo credit / source line
     alt    – short description of the image for screen readers

   Add or remove entries freely – the collage lays itself out for any number.
   If an image file is missing, a placeholder drawing is shown instead.
   ===================================================================== */

window.SETTINGS = {
  title: "Building Collage",   // shown as a cut-out ransom-note title, top left
  seed: 7,                     // change this number for a different starting arrangement
  idleSeconds: 90,             // after this long untouched, the work resets & starts drifting (0 = never)
  attractMode: true,           // gently tour the buildings while nobody is using it
  words: ["SITE", "PLAN", "N\u00b0", "ELEVATION", "1:200", "fig.", "archive", "\u2192", "section", "walk"]
};

window.BUILDINGS = [
  {
    image: "images/01.jpg",
    title: "Building One",
    alt: "Photograph of building one",
    facts: { Architect: "Name", Built: "Year", Location: "Street, town" },
    text: [
      "Replace this with what you know about the building. Each string in this list becomes its own paragraph.",
      "A second paragraph can carry stories, memories, history or anything else you've gathered."
    ],
    credit: "Photo: your name"
  },
  {
    image: "images/02.jpg",
    title: "Building Two",
    alt: "Photograph of building two",
    facts: { Architect: "Name", Built: "Year", Location: "Street, town" },
    text: ["Information about building two."],
    credit: ""
  },
  {
    image: "images/03.jpg",
    title: "Building Three",
    alt: "Photograph of building three",
    facts: { Architect: "Name", Built: "Year", Location: "Street, town" },
    text: ["Information about building three."],
    credit: ""
  },
  {
    image: "images/04.jpg",
    title: "Building Four",
    alt: "Photograph of building four",
    facts: { Architect: "Name", Built: "Year", Location: "Street, town" },
    text: ["Information about building four."],
    credit: ""
  },
  {
    image: "images/05.jpg",
    title: "Building Five",
    alt: "Photograph of building five",
    facts: { Architect: "Name", Built: "Year", Location: "Street, town" },
    text: ["Information about building five."],
    credit: ""
  },
  {
    image: "images/06.jpg",
    title: "Building Six",
    alt: "Photograph of building six",
    facts: { Architect: "Name", Built: "Year", Location: "Street, town" },
    text: ["Information about building six."],
    credit: ""
  },
  {
    image: "images/07.jpg",
    title: "Building Seven",
    alt: "Photograph of building seven",
    facts: { Architect: "Name", Built: "Year", Location: "Street, town" },
    text: ["Information about building seven."],
    credit: ""
  },
  {
    image: "images/08.jpg",
    title: "Building Eight",
    alt: "Photograph of building eight",
    facts: { Architect: "Name", Built: "Year", Location: "Street, town" },
    text: ["Information about building eight."],
    credit: ""
  },
  {
    image: "images/09.jpg",
    title: "Building Nine",
    alt: "Photograph of building nine",
    facts: { Architect: "Name", Built: "Year", Location: "Street, town" },
    text: ["Information about building nine."],
    credit: ""
  },
  {
    image: "images/10.jpg",
    title: "Building Ten",
    alt: "Photograph of building ten",
    facts: { Architect: "Name", Built: "Year", Location: "Street, town" },
    text: ["Information about building ten."],
    credit: ""
  }
];
