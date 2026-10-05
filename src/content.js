/*
  357 Green deck content: the only file you need to edit to change copy,
  stats, images or slide order.

  - Slides play in the order of the `slides` array. Move, add or delete
    entries freely; layout code never needs to change.
  - `type` picks the layout (see src/slides/). Each type documents the fields
    it reads at the top of its file.
  - `id` becomes the slide's deep link: …/#project-overview
  - `section` puts the slide under one of the menu sections below. The menu
    jumps to the first slide of each section.
  - `theme` is "dark" (charcoal) or "light" (white). It sets the colour of the
    navigation arrows and the progress bar.
  - `ref` is the slide number in the static PDF deck, kept for comparison.
  - Image paths are relative to public/. To swap an image, replace the file
    in public/assets/ and keep the same name.
  - Copy may contain <b> and <br>. Everything else is plain text.
  - `placeholder: true` marks content still waiting on real data. It is drawn
    with a dashed "Placeholder" label so it can't be mistaken for final.
*/

export const sections = [
  { id: 'development', label: 'Development' },
  { id: 'location', label: 'Location' },
  { id: 'architecture', label: 'Architecture' },
  { id: 'tenant-experience', label: 'Tenant Experience' },
  { id: 'programming', label: 'Programming' },
  { id: 'views', label: 'Views' },
  { id: 'floor-plans', label: 'Floor Plans' },
]

export const slides = [
  {
    id: 'cover',
    ref: 1,
    type: 'cover',
    theme: 'dark',
    logo: 'assets/logos/357-green.svg',
    tagline: 'The next Fulton Marke’t Landmark.',
    partners: [
      { src: 'assets/logos/onni.png', alt: 'Onni Group' },
      { src: 'assets/logos/stream.svg', alt: 'Stream Realty Partners' },
    ],
  },

  {
    id: 'project-overview',
    ref: 4,
    type: 'overview',
    theme: 'dark',
    title: 'Project Overview',
    subtitle: '30-Stories / 824,000 SF',
    image: { src: 'assets/renders/tower-street.jpg', alt: '357 Green tower seen from the street at the Halsted Street bridge' },
    // Two columns, read row by row: left, right, left, right…
    stats: [
      { value: '34,600 SF', detail: 'Typical <b>low-rise</b> floor plate' },
      { value: '43,000 SF Amenities', detail: '10,000 SF on Floor 2<br>33,000 SF on Floor 29' },
      { value: '29,500 SF', detail: 'Typical <b>high-rise</b> floor plate' },
      { value: 'Penthouse Restaurant', detail: 'Floor 29' },
      { value: '13’3” slab-to-slab heights', detail: 'Office Floors' },
      { value: 'Dialtone Bodega<br>& Coffee House' },
      { value: '300 SF Private Terraces', detail: 'On every office floor' },
      { value: '450 Parking Stalls', detail: 'Levels 3-7' },
    ],
  },

  {
    id: 'fulton-market',
    ref: 9,
    type: 'location',
    section: 'location',
    theme: 'dark',
    eyebrow: 'Location',
    title: 'Fulton Market',
    background: 'assets/photos/fulton-market-aerial.jpg',
    stats: [
      { value: '120 +', label: 'Restaurants, bars &<br>cafés in the district' },
      { value: '##', label: 'Hotels in the district', placeholder: true },
      { value: '##', label: 'Hotels in the district', placeholder: true },
    ],
    neighborsLabel: 'HQ Neighbors',
    neighbors: [
      { src: 'assets/logos/mcdonalds.png', alt: 'McDonald’s', width: 56 },
      { src: 'assets/logos/wpp.png', alt: 'WPP', width: 121 },
      { src: 'assets/logos/bcg.svg', alt: 'BCG', width: 92 },
      { src: 'assets/logos/john-deere.png', alt: 'John Deere', width: 103 },
      { src: 'assets/logos/sidley.png', alt: 'Sidley', width: 104 },
    ],
    // Paste an embeddable map URL here (Google My Maps, Mapbox, etc.).
    // Left empty, the slot shows the "MAP" placeholder from the static deck.
    map: { url: '', title: 'Fulton Market neighborhood map' },
  },

  {
    id: 'amenities-wellness',
    ref: 30,
    type: 'amenities',
    section: 'tenant-experience',
    theme: 'light',
    eyebrow: 'Tenant Experience',
    eyebrowAccent: 'Levels 2 & 15',
    title: 'Amenities & Wellness',
    stat: { value: '38,000 SF', label: 'across two amenity floors' },
    body: 'A full amenity floor anchors the tower’s mid-rise: a tenant lounge, outdoor terrace and state-of-the-art, spa-inspired wellness center. An 11,000 SF second-floor lounge and conference center spill onto a spacious patio overlooking the Paseo.',
    cards: [
      {
        title: 'Lounge & Conference Center',
        link: 'View more photos',
        photos: [
          { src: 'assets/renders/l2-paseo-lounge.jpg', caption: 'Level 2: Paseo Lounge' },
          { src: 'assets/renders/l2-conferencing.jpg', caption: 'Level 2: Conferencing' },
        ],
      },
      {
        title: 'Terrace',
        link: 'View more photos',
        photos: [
          { src: 'assets/renders/l2-terrace.jpg', caption: 'Level 2: Terrace' },
        ],
      },
      {
        title: 'Wellness Studio',
        link: 'View more photos',
        photos: [
          { src: 'assets/renders/l15-wellness-spa.jpg', caption: 'Level 15: Wellness Spa' },
          { src: 'assets/renders/l15-fitness-studio.jpg', caption: 'Level 15: Fitness Studio' },
          { src: 'assets/renders/l15-yoga-studio.jpg', caption: 'Level 15: Yoga Studio' },
        ],
      },
    ],
  },
]
