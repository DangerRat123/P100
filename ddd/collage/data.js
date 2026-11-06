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
    title: "Cell Block",
    alt: "Photograph of building one",
    facts: { Architect: "Unknown", Built: "1882-1883", Location: "Portsmouth Historic Dockyard" },
    text: [
      "The staircase had been removed and a modern staircase has been installed on the exterior as if to be removable. Glass block elements wouldn’t affect the listed part of the building.",
      "Contains 12 cells (Grade I listed), which are leased by the University of Portsmouth for small businesses in the Innovation connect network."
    ],
    credit: "Drawing: Xander Marsh"
  },
  {
    image: "images/02.png",
    title: "Mast Pond",
    alt: "Photograph of building two",
    facts: { Architect: "A E Scott", Built: "1800s", Location: "Portsmouth Historic Dockyard" },
    text: ["Boathouse 4 was constructed in the rapid rearmament leading up to WWII for the construction and maintenance of small naval boats. It was originally designed to extend as far as the Victory Gate, but was unfinished when war broke out, so it was finished with a temporary corrugated iron wall – which still remains. It hosted the construction of the X4 midget submarine, designed to place mines beneath German battleships. When the historic area was divided off from the active dockyard it was due to be replaced by a commercial building. The Portsmouth Society supported by SAVE Britain’s Heritage applied to list it. This was refused, but the Portsmouth Naval Base Property Trust found it too useful to demolish it. Its renovation was supported by the National Lottery Heritage Fund and Regional Growth Fund. It was repurposed as a Heritage Skills and Boatbuilding Centre; a mezzanine was added to display the small boat collection and a harbour view restaurant above lecture rooms and workshops."],
    credit: "Drawing: Xander Marsh"
  },
  {
    image: "images/03.png",
    title: "Omega Centre",
    alt: "Photograph of building three",
    facts: { Architect: "A H Ford", Built: "1881", Location: "Omega Street, Somerstown Portsmouth" },
    text: ["Owned by City of Portsmouth Elementary Education Foundation; Portsmouth Education Committee 2024. Proposed to be demolished for redevelopment for the Special Needs Secondary School. Currently occupied by Portsmouth Makers ceramics and printmaking studio, Heart of Portsmouth Boxing Academy, Portsmouth Art School, Pompey Pirates children’s literacy project. Omega Centre Trust formed 2022 to take on the building as a community asset with business plan and grant applications prepared; no response from the owners to date."],
    credit: "Drawing: Xander Marsh"
  },
  {
    image: "images/04.png",
    title: "Rivers Street Hall",
    alt: "Photograph of building four",
    facts: { Architect: "George Absalom", Built: "1868", Location: "Rivers Street, Somerstown, Portsmouth" },
    text: ["Somerstown Community Association; local people and the Portsmouth Society were formed to restore and convert it, with unemployed people taught building skills by a master craftsman. Building materials were salvaged from the city dump and a former pub in Winston Churchill Avenue. It was converted on a shoestring budget into a small theatre for touring companies including Hull Truck and a community space.  In 1977 its restoration won the national SAVE Britain’s Heritage Award of £2000 – awarded at Covent Garden Theatre.Later converted into architect’s office and homes by Portsmouth Housing Association."],
    credit: "Drawing: Xander Marsh"
  },
  {
    image: "images/05.png",
    title: "The Ship & Castle Pub",
    alt: "Photograph of building five",
    facts: { Architect: "AE Cogswell", Built: "1902", Location: "Corner of Queen Street and The Hard" },
    text: ["Hampshire County Council proposed to demolish it to widen the road at this crucial corner in 1973. The city engineer regarded it as ‘an obstacle to the free flow of traffic.’ Demolition would have destroyed the crucial pinch point at the end of Queen Street, revealing the panorama of Portsmouth harbour, the Historic Dockyard entrance and HMS Warrior as you turn the corner. The newly formed Portsmouth Society opposed demolition of a vital piece of townscape, backing a proposal to convert it into a restaurant. As a blighted property, HCC acquired the site, but over the next six years it deteriorated to just the outside walls. In 1979 it was rebuilt as a pub and restaurant."],
    credit: "Drawing: Xander Marsh"
  },
  {
    image: "images/06.png",
    title: "Building Six",
    alt: "Photograph of building six",
    facts: { Architect: "Name", Built: "Year", Location: "Street, town" },
    text: ["Information about building six."],
    credit: "Drawing: Xander Marsh"
  },
  {
    image: "images/07.png",
    title: "Building Seven",
    alt: "Photograph of building seven",
    facts: { Architect: "Name", Built: "Year", Location: "Street, town" },
    text: ["Information about building seven."],
    credit: "Drawing: Xander Marsh"
  },
  {
    image: "images/08.png",
    title: "Building Eight",
    alt: "Photograph of building eight",
    facts: { Architect: "Name", Built: "Year", Location: "Street, town" },
    text: ["Information about building eight."],
    credit: "Drawing: Xander Marsh"
  },
  {
    image: "images/09.png",
    title: "Building Nine",
    alt: "Photograph of building nine",
    facts: { Architect: "Name", Built: "Year", Location: "Street, town" },
    text: ["Information about building nine."],
    credit: "Drawing: Xander Marsh"
  },
  {
    image: "images/10.png",
    title: "Building Ten",
    alt: "Photograph of building ten",
    facts: { Architect: "Name", Built: "Year", Location: "Street, town" },
    text: ["Information about building ten."],
    credit: "Drawing: Xander Marsh"
  }
];
