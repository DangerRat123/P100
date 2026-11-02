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
  title: "Collage",            // browser tab title only \u2013 nothing is shown on screen
  seed: 7,                     // change this number for a different arrangement
  idleSeconds: 90,             // after this long untouched, the work resets & drifts (0 = never)
  attractMode: true,           // slowly tour the buildings while nobody is using it
  colourOnTouch: true,         // photos are black & white until touched/selected (false = always b&w)
  hint: "Drag \u2014 Tap \u2014 Move",  // tiny caption bottom-left, fades after first touch ("" = none)

  // small pencil captions and notes scattered on the paper
  captions: ["fig. 01", "pl. iv", "elevation", "section a\u2013a", "1:200", "north", "plan", "detail", "archive", "site"],
  notes: ["entrance", "facade", "looking west", "rear", "corner", "courtyard"]
};

window.BUILDINGS = [
  {
    image: "images/01.png",
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
    image: "images/02.png",
    title: "Building Two",
    alt: "Photograph of building two",
    facts: { Architect: "Name", Built: "Year", Location: "Street, town" },
    text: ["Information about building two."],
    credit: ""
  },
  {
    image: "images/03.png",
    title: "Building Three",
    alt: "Photograph of building three",
    facts: { Architect: "Name", Built: "Year", Location: "Street, town" },
    text: ["Information about building three."],
    credit: ""
  },
  {
    image: "images/04.png",
    title: "Building Four",
    alt: "Photograph of building four",
    facts: { Architect: "Name", Built: "Year", Location: "Street, town" },
    text: ["Information about building four."],
    credit: ""
  },
  {
    image: "images/05.png",
    title: "Building Five",
    alt: "Photograph of building five",
    facts: { Architect: "Name", Built: "Year", Location: "Street, town" },
    text: ["Information about building five."],
    credit: ""
  },
  {
    image: "images/06.png",
    title: "Building Six",
    alt: "Photograph of building six",
    facts: { Architect: "Name", Built: "Year", Location: "Street, town" },
    text: ["Information about building six."],
    credit: ""
  },
  {
    image: "images/07.png",
    title: "Building Seven",
    alt: "Photograph of building seven",
    facts: { Architect: "Name", Built: "Year", Location: "Street, town" },
    text: ["Information about building seven."],
    credit: ""
  },
  {
    image: "images/08.png",
    title: "Building Eight",
    alt: "Photograph of building eight",
    facts: { Architect: "Name", Built: "Year", Location: "Street, town" },
    text: ["Information about building eight."],
    credit: ""
  },
  {
    image: "images/09.png",
    title: "Building Nine",
    alt: "Photograph of building nine",
    facts: { Architect: "Name", Built: "Year", Location: "Street, town" },
    text: ["Information about building nine."],
    credit: ""
  },
  {
    image: "images/10.png",
    title: "Building Ten",
    alt: "Photograph of building ten",
    facts: { Architect: "Name", Built: "Year", Location: "Street, town" },
    text: ["Information about building ten."],
    credit: ""
  }
];
