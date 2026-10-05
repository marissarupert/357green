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

// Test fits share one data set so the toggles on slides 36–39 can swap
// between them in place. `show` on each slide picks its default.
const testFits = {
  'low-open': {
    rise: 'low', layout: 'open', title: 'Open Office',
    seats: '275 Seats', seatsDetail: '256 workstations  - 18 offices - reception',
    rsf: '117 RSF/ Seat', area: '31,070 USF · 32,230 RSF',
    plan: { src: 'assets/plans/testfit-lowrise-open.jpg', alt: 'Low-rise open office test fit', box: [896, 113, 879, 917] },
  },
  'low-perimeter': {
    rise: 'low', layout: 'perimeter', title: 'Perimeter Office',
    seats: '103 Seats', seatsDetail: '25 workstations · 77 offices (50 perimeter) · reception',
    rsf: '312 RSF/seat', area: '31,070 USF · 32,230 RSF',
    plan: { src: 'assets/plans/testfit-lowrise-perimeter.jpg', alt: 'Low-rise perimeter office test fit', box: [934, 76, 915, 984] },
  },
  'high-open': {
    rise: 'high', layout: 'open', title: 'Open Office',
    seats: '222 Seats', seatsDetail: '207 workstations · 14 offices · reception',
    rsf: '124 RSF/seat', area: '26,610 USF · 27,650 RSF',
    plan: { src: 'assets/plans/testfit-highrise-open.jpg', alt: 'High-rise open office test fit', box: [905, 79, 993, 992] },
  },
  'high-perimeter': {
    rise: 'high', layout: 'perimeter', title: 'Perimeter Office',
    seats: '90 Seats', seatsDetail: '27 workstations · 63 offices (42 perimeter) ·<br>reception',
    rsf: '307 RSF/seat', area: '26,610 USF · 27,650 RSF',
    plan: { src: 'assets/plans/testfit-highrise-perimeter.jpg', alt: 'High-rise perimeter office test fit', box: [929, 61, 987, 1004] },
  },
}

// Panoramas shared by the two Views slides. The static deck tags slide 42's
// east view "HIGH-RISE", but the photo itself is captioned "View East |
// Mid-Rise", so it is labelled Mid-Rise here.
const views = [
  { id: 'east-high', direction: 'east', height: 'high-rise', label: 'View East | High-Rise', src: 'assets/views/east-high-rise.jpg' },
  { id: 'west-high', direction: 'west', height: 'high-rise', label: 'View West | High-Rise', src: 'assets/views/west-high-rise.jpg' },
  { id: 'east-mid', direction: 'east', height: 'mid-rise', label: 'View East | Mid-Rise', src: 'assets/views/east-mid-rise.jpg' },
  { id: 'west-mid', direction: 'west', height: 'mid-rise', label: 'View West | Mid-Rise', src: 'assets/views/west-mid-rise.jpg' },
]

export const sections = [
  { id: 'development', label: 'Development' },
  { id: 'location', label: 'Location' },
  { id: 'architecture', label: 'Architecture' },
  { id: 'tenant-experience', label: 'Tenant Experience' },
  { id: 'programming', label: 'Programming' },
  { id: 'views', label: 'Views' },
  { id: 'floor-plans', label: 'Floor Plans' },
]

const render = (id, ref, section, label, src, extra = {}) =>
  ({ id, ref, type: 'render', section, theme: 'dark', label, image: { src }, ...extra })

export const slides = [
  // ---------- opening ----------
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
    id: 'video',
    ref: 2,
    type: 'video',
    theme: 'dark',
    // Drop the film in public/assets/video/ and set src, e.g. 'assets/video/357-green.mp4'
    video: { src: '', poster: 'assets/renders/halsted-looking-west.jpg', zoom: 1.042, focus: '44% 67.7%', label: 'Video Animation' },
  },

  {
    id: 'the-new-standard',
    ref: 3,
    type: 'intro',
    theme: 'dark',
    title: 'The New<br>Standard',
    body: 'The office market has entered a new phase. Progressive, employee-centric organizations now prioritize quality as the most important workplace criterion, for the benefit of people, culture, and, simply put, the joy of work. Fulton Market has entered a new phase, too. It’s now a mature submarket with a single premier office development site remaining, 357 Green.',
    kicker: 'Take the opportunity to make a forever mark on Chicago’s skyline.',
    image: { src: 'assets/renders/tower-sunset.jpg', alt: '357 Green tower at sunset against the Chicago skyline' },
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
  // ---------- 01 Development ----------
  { id: 'development', ref: 5, type: 'divider', section: 'development', theme: 'dark', number: '01', title: 'Development' },

  {
    id: 'onni-group',
    ref: 6,
    type: 'iconStats',
    section: 'development',
    theme: 'light',
    eyebrow: 'Developer',
    title: 'Onni Group',
    headline: '19 Million SF Developed',
    stats: [
      { icon: 'assets/icons/apartments.svg', value: '11,200', label: 'Apartment units' },
      { icon: 'assets/icons/homes.svg', value: '15,000', label: 'Homes' },
      { icon: 'assets/icons/crane.svg', value: '28 + M SF', label: 'In current development<br>pipeline' },
      { icon: 'assets/icons/globe.svg', value: '3 Countries and 7 States', label: 'Onni’s development<br>footprint' },
    ],
    // Carousel: Onni office case studies. `focus` picks which part
    // of a landscape photo shows in the tall frame (object-position).
    photos: [
      { src: 'assets/photos/onni-200-north-lasalle.jpg', caption: '200 North LaSalle', focus: '66% 50%' },
      { src: 'assets/photos/onni-700-w-chicago.jpg', caption: '700 W Chicago', focus: '50% 50%' },
      { src: 'assets/photos/onni-550-west-van-buren.jpg', caption: '550 West Van Buren', focus: '50% 50%' },
      { src: 'assets/photos/onni-225-randolph.jpg', caption: '225 Randolph', focus: '51% 50%' },
    ],
  },

  {
    id: 'scb-architects',
    ref: 7,
    type: 'bullets',
    section: 'development',
    theme: 'dark',
    eyebrow: 'Architect',
    title: 'SCB Architects',
    subtitle: 'A Chicago Legacy Since 1931',
    bullets: [
      'Significant New Development Track Record',
      'Diverse skillset across office, hospitality and<br>residential',
      'Award-winning local team',
    ],
    photos: [
      { src: 'assets/photos/scb-chicago.jpg', alt: 'Chicago’s Tribune Tower and Michigan Avenue at dusk' },
      // SCB's Chicago case studies (from scb.com). Swap each placeholder for
      // { src: 'assets/photos/<file>.jpg', caption, focus } once supplied.
      { placeholder: 'photo from scb.com', caption: '135 South LaSalle' },
      { placeholder: 'photo from scb.com', caption: '210 N Carpenter' },
      { placeholder: 'photo from scb.com', caption: 'Canal Station' },
    ],
  },

  // ---------- 02 Location ----------
  { id: 'location', ref: 8, type: 'divider', section: 'location', theme: 'dark', number: '02', title: 'Location' },

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
  // ---------- 03 Architecture ----------
  { id: 'architecture', ref: 10, type: 'divider', section: 'architecture', theme: 'dark', number: '03', title: 'Architecture' },

  {
    id: 'shaped-by-the-site',
    ref: 11,
    type: 'features',
    section: 'architecture',
    theme: 'light',
    eyebrow: 'Architecture',
    title: 'Shaped By the Site',
    features: [
      { title: 'A new gateway', body: '30 stories rising at Fulton Market’s gateway, shaped by the site’s unique geometry.' },
      { title: 'Show-stopping paseo', body: 'Gorgeous landscaped pedestrian path links Halsted Street to Green Street,<br>creating a new plaza and placemaking moment.' },
      { title: 'Terraces on every floor', body: 'Setbacks step the tower into varying floor-plate sizes, creating private corner<br>terraces that offer spectacular skyline views.' },
      { title: 'A refined skin', body: 'Warm horizontal metal profiles and glass give the tower a distinct, identifiable texture,<br>differentiating it from its peers and harnessing the warmth and character of the neighborhood.' },
    ],
    image: { src: 'assets/renders/aerial-top.jpg', alt: 'Aerial render of 357 Green showing its terraces and rooftop' },
  },

  {
    id: 'elevation',
    ref: 12,
    type: 'diagram',
    section: 'architecture',
    theme: 'light',
    eyebrow: 'Architecture Elevation',
    image: { src: 'assets/diagrams/elevation.jpg', alt: 'Tower elevation drawings' },
  },

  {
    id: 'elevated-materiality',
    ref: 13,
    type: 'callouts',
    section: 'architecture',
    theme: 'light',
    eyebrow: 'Architecture',
    title: 'Elevated Materiality',
    diagrams: [
      { src: 'assets/diagrams/materiality-cladding.jpg', alt: 'Tower cladding module', box: [0, 400, 485, 442] },
      { src: 'assets/diagrams/materiality-terraces.jpg', alt: 'Tower cladding at terraces', box: [1234, 395, 559, 444] },
    ],
    // at = label top-left, line = [x1, x2, y], dot = [x, y] (stage px, from the static deck)
    callouts: [
      { label: 'Primary vertical profile', at: [720, 441], line: [436, 713, 464], dot: [434, 463] },
      { label: 'Secondary vertical profile', at: [722, 490], line: [373, 712, 508], dot: [371, 507] },
      { label: 'Clear glass guardrail', at: [722, 548], line: [931, 1382, 567], dot: [1385, 567] },
      { label: 'Metal spandrel', at: [722, 598], line: [879, 1356, 622], dot: [1359, 622] },
      { label: 'Spandrel glass horizontal', at: [722, 656], line: [366, 710, 679], dot: [366, 679] },
      { label: 'Vision glass high performance<br>low-e coating', at: [722, 739], line: [362, 706, 762], dot: [362, 762] },
    ],
    notes: [
      { title: 'Tower Cladding', body: '2 story module provides texture at<br>larger scale for tower', x: 57, y: 889 },
      { title: 'Tower Cladding at Terraces', body: 'Glass facade continues along one side so terraces feel carved<br>away from overall mass and offer all-season utility', x: 1056, y: 895 },
    ],
  },

  render('aerial-view', 14, 'architecture', 'Aerial View', 'assets/renders/aerial-view.jpg'),
  render('view-from-expressway', 15, 'architecture', 'View From Expressway', 'assets/renders/view-from-expressway.jpg'),

  {
    id: 'building-section',
    ref: 16,
    type: 'section',
    section: 'architecture',
    theme: 'light',
    eyebrow: 'Architecture',
    title: 'Building Section',
    image: { src: 'assets/diagrams/building-section.jpg', alt: 'Building section drawing' },
    // Zone highlighting needs a layered or higher-resolution section.
    legendNote: 'Placeholder · interactive zone legend needs a higher-resolution section',
  },

  {
    id: 'sustainability',
    ref: 17,
    type: 'featureGrid',
    section: 'architecture',
    theme: 'dark',
    eyebrow: 'Sustainability',
    title: 'Built well by design',
    background: 'assets/renders/sustainability.jpg',
    features: [
      { title: 'Lifestyle & Wellness', body: 'Accessible terraces and green space,<br>with the paseo open to the public.' },
      { title: 'Energy', body: 'A high-performance facade with<br>optimized heating and cooling.' },
      { title: 'Water', body: 'Green roofs and efficient<br>sanitary fixtures throughout.' },
    ],
    badges: [
      { src: 'assets/logos/leed-gold.png', alt: 'LEED Gold' },
      { src: 'assets/logos/well.png', alt: 'WELL' },
    ],
  },

  // ---------- 04 Tenant Experience ----------
  { id: 'tenant-experience', ref: 18, type: 'divider', section: 'tenant-experience', theme: 'dark', number: '04', title: 'Tenant Experience' },

  {
    id: 'built-to-connect',
    ref: 19,
    type: 'split',
    variant: 'diagram',
    section: 'tenant-experience',
    theme: 'light',
    eyebrow: 'Tenant Experience',
    title: 'Built to Connect',
    body: 'A key feature of 357 Green is the paseo: a public pedestrian path that descends from Halsted Street to Green Street, threading through the podium and opening onto an activated plaza. It’s a placemaking front door for both the building and the block.',
    image: { src: 'assets/diagrams/paseo.jpg', alt: 'Site plan of the paseo connecting Halsted Street and Green Street' },
  },

  {
    id: 'plaza-ascent',
    ref: 20,
    type: 'keyed',
    section: 'tenant-experience',
    theme: 'light',
    eyebrow: 'Tenant Experience',
    title: 'Plaza & Ascent',
    image: { src: 'assets/diagrams/plaza-ascent.png', alt: 'Section through the plaza and ascent' },
    // Add spot: [x, y] (stage px) to each item once the keyed diagram arrives.
    items: [
      { n: '01', label: 'Trees match neighboring<br>developments' },
      { n: '02', label: 'Herringbone<br>patterned pavers' },
      { n: '03', label: 'Raised planter with<br>perimeter seating' },
      { n: '04', label: 'Tiered bench seating' },
      { n: '05', label: '25-foot ascent from<br>Green to Halsted' },
      { n: '06', label: 'Metra buffer planting<br>and wall' },
      { n: '07', label: 'Public elevator entry' },
      { n: '08', label: 'Balcony overlooking deck' },
      { n: '09', label: 'Built-in bench seating' },
      { n: '10', label: 'Broom finish<br>concrete sidewalk' },
      { n: '11', label: 'Flush parkway planter' },
    ],
  },

  render('halsted-looking-west', 21, 'tenant-experience', 'View of Halsted Looking West', 'assets/renders/halsted-looking-west.jpg'),
  render('green-street', 22, 'tenant-experience', 'View of Green Street', 'assets/renders/green-street.jpg'),
  render('level-2-terrace', 23, 'tenant-experience', 'Level 2: Terrace', 'assets/renders/l2-terrace.jpg', { zoom: 1.372, focus: '50% 60%' }),
  render('level-15-coffee-bar', 24, 'tenant-experience', 'Level 15: Coffee Bar & Co-Work Lounge', 'assets/renders/l15-coffee-bar.jpg'),
  render('level-15-game-lounge', 25, 'tenant-experience', 'Level 15: Game Lounge', 'assets/renders/l15-game-lounge.jpg'),
  render('level-15-fitness-studio', 26, 'tenant-experience', 'Level 15: Fitness Studio', 'assets/renders/l15-fitness-studio.jpg'),
  render('level-15-yoga-studio', 27, 'tenant-experience', 'Level 15: Yoga Studio', 'assets/renders/l15-yoga-studio.jpg'),
  render('green-street-looking-east', 28, 'tenant-experience', 'View of Green Street Looking East', 'assets/renders/green-street-looking-east.jpg'),

  {
    id: 'lobby-retail',
    ref: 29,
    type: 'split',
    section: 'tenant-experience',
    theme: 'light',
    eyebrow: 'Tenant Experience',
    eyebrowAccent: 'Ground Floor',
    title: 'Lobby & Retail',
    body: 'A warm, daylit arrival sequence wraps ~7,300 SF of street-activating retail beneath the tower, animating the corner of Green, Kinzie and Halsted.',
    image: { src: 'assets/renders/lobby-retail.jpg', alt: 'Lobby and retail at the base of the tower' },
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
  render('level-2-paseo-lounge', 31, 'tenant-experience', 'Level 2: Paseo Lounge', 'assets/renders/l2-paseo-lounge.jpg', { zoom: 1.032, focus: '50.3% 49.2%' }),
  render('level-15-wellness-spa', 32, 'tenant-experience', 'Level 15: Wellness Spa', 'assets/renders/l15-wellness-spa.jpg', { zoom: 1.026, focus: '12.9% 0%' }),
  render('level-2-conferencing', 33, 'tenant-experience', 'Level 2: Conferencing', 'assets/renders/l2-conferencing.jpg'),

  // ---------- 05 Programming ----------
  { id: 'programming', ref: 34, type: 'divider', section: 'programming', theme: 'dark', number: '05', title: 'Programming' },

  {
    id: 'how-it-fits',
    ref: 35,
    type: 'programming',
    section: 'programming',
    theme: 'light',
    eyebrow: 'Programming',
    title: 'How It Fits',
    columns: [
      {
        heading: 'Low Rise',
        rows: [
          { name: 'Open Office', meta: '275 seats • 117 RSF Per Seat', target: 'low-rise-open-office' },
          { name: 'Perimeter Office', meta: '103 seats · 312 RSF per seat', target: 'low-rise-perimeter-office' },
        ],
      },
      {
        heading: 'High Rise',
        rows: [
          { name: 'Open Office', meta: '222 seats · 124 RSF per seat', target: 'high-rise-open-office' },
          { name: 'Perimeter Office', meta: '90 seats · 307 RSF per seat', target: 'high-rise-perimeter-office' },
        ],
      },
    ],
  },

  { id: 'low-rise-open-office', ref: 36, type: 'testfit', section: 'programming', theme: 'light', eyebrow: 'Programming', fits: testFits, show: 'low-open' },
  { id: 'low-rise-perimeter-office', ref: 37, type: 'testfit', section: 'programming', theme: 'light', eyebrow: 'Programming', fits: testFits, show: 'low-perimeter' },
  { id: 'high-rise-open-office', ref: 38, type: 'testfit', section: 'programming', theme: 'light', eyebrow: 'Programming', fits: testFits, show: 'high-open' },
  { id: 'high-rise-perimeter-office', ref: 39, type: 'testfit', section: 'programming', theme: 'light', eyebrow: 'Programming', fits: testFits, show: 'high-perimeter' },

  // ---------- 06 Views ----------
  { id: 'views', ref: 40, type: 'divider', section: 'views', theme: 'dark', number: '06', title: 'Views' },
  { id: 'views-high-rise', ref: 41, type: 'views', section: 'views', theme: 'light', views, show: ['east-high', 'west-high'], strips: [[0, 526], [552, 528]] },
  { id: 'views-mid-rise', ref: 42, type: 'views', section: 'views', theme: 'light', views, show: ['east-mid', 'west-mid'], strips: [[0, 493], [557, 523]] },

  // ---------- 07 Floor Plans ----------
  { id: 'floor-plans', ref: 43, type: 'divider', section: 'floor-plans', theme: 'dark', number: '07', title: 'Floor Plans' },

  {
    id: 'lobby-plan',
    ref: 44,
    type: 'floorplan',
    section: 'floor-plans',
    theme: 'light',
    eyebrow: 'Floor Plans',
    title: 'Lobby',
    legend: [
      { swatch: '#ae9ac1', label: 'Retail' },
      { swatch: '#fdfbbc', label: 'Lobby' },
      { swatch: '#d3d3d3', label: 'Back of house, trash, loading' },
    ],
    image: { src: 'assets/plans/lobby.jpg', alt: 'Ground floor plan', box: [745, -3, 1177, 1005] },
  },

  {
    id: 'second-floor-plan',
    ref: 45,
    type: 'floorplan',
    section: 'floor-plans',
    theme: 'light',
    eyebrow: 'Floor Plans',
    title: 'Second Floor',
    subtitle: 'Amenity Footprint',
    legend: [
      { swatch: '#f8c5a8', label: 'Amenity and patio' },
      { swatch: '#ffffff', label: 'Open to below', outline: true },
      { swatch: '#caba8c', label: 'Terrace and landscape' },
    ],
    image: { src: 'assets/plans/second-floor.jpg', alt: 'Second floor amenity plan', box: [716, -1, 1207, 974] },
  },

  // ---------- closing ----------
  {
    id: 'thank-you',
    ref: 46,
    type: 'contact',
    theme: 'dark',
    title: 'Thank you',
    firm: 'Leasing • Stream Realty Partners, Chicago',
    logos: [
      { src: 'assets/logos/onni.png', alt: 'Onni Group' },
      { src: 'assets/logos/stream.svg', alt: 'Stream Realty Partners' },
    ],
    people: [
      { name: 'Benjamin Cleveland', role: 'Executive Vice President', phone: '312.448.6221', email: 'ben.cleveland@streamrealty.com' },
      { name: 'Mark Gunderson', role: 'Executive Vice President', phone: '312.448.8645', email: 'mark.gunderson@streamrealty.com' },
      { name: 'Jack McKinney Jr.', role: 'Managing Director', phone: '312.448.6218', email: 'jack.mckinneyjr@streamrealty.com' },
    ],
  },
]
