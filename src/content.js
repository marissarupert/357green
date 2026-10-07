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
    plan: { src: 'assets/plans/testfit-lowrise-open.jpg', alt: 'Low-rise open office test fit', box: [923, 129, 831, 906] },
  },
  'low-perimeter': {
    rise: 'low', layout: 'perimeter', title: 'Perimeter Office',
    seats: '103 Seats', seatsDetail: '25 workstations · 77 offices (50 perimeter) · reception',
    rsf: '312 RSF/seat', area: '31,070 USF · 32,230 RSF',
    plan: { src: 'assets/plans/testfit-lowrise-perimeter.jpg', alt: 'Low-rise perimeter office test fit', box: [929, 116, 909, 940] },
  },
  'high-open': {
    rise: 'high', layout: 'open', title: 'Open Office',
    seats: '222 Seats', seatsDetail: '207 workstations · 14 offices · reception',
    rsf: '124 RSF/seat', area: '26,610 USF · 27,650 RSF',
    plan: { src: 'assets/plans/testfit-highrise-open.jpg', alt: 'High-rise open office test fit', box: [917, 98, 876, 945] },
  },
  'high-perimeter': {
    rise: 'high', layout: 'perimeter', title: 'Perimeter Office',
    seats: '90 Seats', seatsDetail: '27 workstations · 63 offices (42 perimeter) ·<br>reception',
    rsf: '307 RSF/seat', area: '26,610 USF · 27,650 RSF',
    plan: { src: 'assets/plans/testfit-highrise-perimeter.jpg', alt: 'High-rise perimeter office test fit', box: [933, 99, 861, 929] },
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
    background: 'assets/renders/aerial-view.jpg',
    tagline: ['Chicago’s next', 'landmark.'],
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
    video: { src: '', poster: 'assets/renders/halsted-looking-west.jpg', zoom: 1.042, focus: '44% 67.7%' },
  },

  {
    id: 'the-new-standard',
    ref: 3,
    type: 'intro',
    theme: 'dark',
    title: 'The New<br>Standard',
    body: 'The office market has entered a new phase. Progressive, employee-centric organizations now prioritize quality as the most important workplace criterion, for the benefit of people, culture, and, simply put, the joy of work. Fulton Market has entered a new phase, too. It’s now a mature submarket with a single premier office development site remaining, 357 Green.',
    kicker: 'Take the opportunity to make a forever mark on Chicago’s skyline.',
    image: { src: 'assets/renders/new-standard.jpg', alt: '357 Green tower at sunset against the Chicago skyline', focus: '50% 30%' },
    bleed: true,
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
      { value: '34,600 SF', detail: 'Typical <b>low-rise</b> floor plate<br>Floors 8-15' },
      { value: '43,000 SF Amenities', detail: '10,000 SF on Floor 2<br>33,000 SF on Floor 29' },
      { value: '29,500 SF', detail: 'Typical <b>high-rise</b> floor plate<br>Floors 16-28' },
      { value: 'Penthouse Restaurant', detail: 'Floor 29' },
      { value: '13’3” slab-to-slab heights', detail: 'Office Floors' },
      { value: 'Dialtone Bodega<br>& Coffee House' },
      { value: '300 SF Private Terraces', detail: 'On every office floor' },
      { value: '450 Parking Stalls', detail: 'Levels 3-7' },
      { value: 'Timeline', detail: 'Base building turnover 24 months following lease execution', wide: true },
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
    // SCB case studies. `focus` picks which part of each photo shows in the
    // tall frame (object-position).
    photos: [
      { src: 'assets/photos/scb-10-120-south-riverside.jpg', caption: '10 & 120 South Riverside', focus: '62% 50%' },
      { src: 'assets/photos/scb-tribune-tower.jpg', caption: 'Tribune Tower', focus: '50% 40%' },
      { src: 'assets/photos/scb-harrison-street.jpg', caption: 'Harrison Street', focus: '68% 50%' },
      { src: 'assets/photos/scb-the-bell.jpg', caption: 'The Bell', focus: '50% 12%' },
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
      { value: '12', label: 'Hotels in the district' },
      // The source deck repeats "## Hotels in the district" here; add the real
      // second stat back once it's known.
    ],
    // Walk times from Green & Kinzie (Chicago YIMBY on 360 N Green, across the
    // street); Metra range is for Fulton Market. Colours are the lines' own.
    transitLabel: 'Transit',
    transit: [
      { lines: ['#00a1de'], name: 'Blue Line · Grand', detail: '4 min walk' },
      { lines: ['#009b3a', '#e27ea6'], name: 'Green & Pink Lines · Morgan', detail: '7 min walk' },
      { lines: ['#4f7bbf'], name: 'Metra · Ogilvie & Union Station', detail: '15–20 min walk' },
      { lines: [], name: 'Kennedy Expressway (I-90/94)', detail: 'Alongside the site' },
    ],
    neighborsLabel: 'HQ Neighbors',
    neighbors: [
      { src: 'assets/logos/mcdonalds.png', alt: 'McDonald’s', height: 52 },
      { src: 'assets/logos/wpp.png', alt: 'WPP', height: 38, whiten: true },
      { src: 'assets/logos/bcg.svg', alt: 'BCG', height: 40, whiten: true },
      { src: 'assets/logos/john-deere.png', alt: 'John Deere', height: 64 },
      { src: 'assets/logos/sidley.png', alt: 'Sidley', height: 30 },
    ],
    // Embedded interactive map (Stream GIS, ArcGIS Instant App). Swap the URL
    // to change it; left empty, the slot shows the static deck's "MAP" box.
    map: {
      url: 'https://streamgis.maps.arcgis.com/apps/instant/basic/index.html?appid=3d12fababd414716a631c254206783e6',
      title: 'Fulton Market neighborhood map',
    },
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
    type: 'elevation',
    section: 'architecture',
    theme: 'light',
    eyebrow: 'Architecture Elevation',
    // Positions below are in px on the source drawing (2000 × 1053).
    fit: { scale: 0.86, x: 100, y: 63.6 },
    drawings: [
      { src: 'assets/diagrams/elevation-west.jpg', alt: 'Narrow tower elevation', box: [178, 44, 472, 968] },
      { src: 'assets/diagrams/elevation-east.jpg', alt: 'Broad tower elevation', box: [1000, 44, 768, 968] },
    ],
    ground: [5, 1995, 1013],
    dims: { x: [192, 1789], top: 35 },
    levelLines: [[50, 255], [1772, 1960]],
    levels: [
      { label: 'T/ Screen Wall', value: '484\' - 6"', y: 48 },
      { label: 'Building Height', value: '439\' - 6"', y: 169, note: '29 – Penthouse Restaurant' },
      { label: 'Amenity', value: '213\' - 6"', y: 586, note: 'Amenity Floor – 15' },
      { label: 'T/ Parking', value: '108\' - 6"', y: 798 },
    ],
    labelX: 770,
    callouts: [
      { text: 'Architectural glass and<br>warm metal panel system<br>at mechanical enclosure', y: 110, dots: [464, 1038], anchor: 'last' },
      { text: 'Warm metal panel cladding', y: 764, dots: [463, 1037] },
    ],
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
      { src: 'assets/diagrams/materiality-cladding.jpg', alt: 'Tower cladding module', box: [40, 370, 491, 531] },
      { src: 'assets/diagrams/materiality-terraces.jpg', alt: 'Tower cladding at terraces', box: [1248, 370, 522, 531] },
    ],
    // at = label top-left, line = [x1, x2, y], dot = [x, y] (stage px; dots
    // sit where the source drawings put their leader-line dots)
    callouts: [
      { label: 'Primary vertical profile', at: [720, 447], line: [348, 712, 470], dot: [348, 470] },
      { label: 'Secondary vertical profile', at: [722, 502], line: [241, 712, 525], dot: [241, 525] },
      { label: 'Clear glass guardrail', at: [722, 570], line: [931, 1403, 593], dot: [1403, 593] },
      { label: 'Metal spandrel', at: [722, 621], line: [879, 1370, 644], dot: [1370, 644] },
      { label: 'Spandrel glass horizontal', at: [722, 674], line: [215, 710, 697], dot: [215, 697] },
      { label: 'Vision glass high performance<br>low-e coating', at: [722, 778], line: [251, 706, 801], dot: [251, 801] },
    ],
    notes: [
      { title: 'Tower Cladding', body: '2 story module provides texture at<br>larger scale for tower', x: 57, y: 921 },
      { title: 'Tower Cladding at Terraces', body: 'Glass facade continues along one side so terraces feel carved<br>away from overall mass and offer all-season utility', x: 1056, y: 921 },
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
    // Positions in stage px, scaled from the source drawings (section at 0.514).
    drawing: { src: 'assets/diagrams/building-section.jpg', alt: 'Building section through the tower', box: [444, 345, 996, 715] },
    detail: { src: 'assets/diagrams/section-detail.jpg', alt: 'Typical office floor section, 13’3” to bottom of slab', box: [50, 428, 394, 484] },
    ring: [753, 606, 42, 44],
    zones: [
      { key: 'office', label: 'Office', swatch: '#becad5', src: 'assets/diagrams/section-zone-office.png', box: [701,  345,  252,  715] },
      { key: 'amenity', label: 'Amenity', swatch: '#b77859', src: 'assets/diagrams/section-zone-amenity.png', box: [701,  345,  252,  715] },
      { key: 'parking', label: 'Parking', swatch: '#8d9899', src: 'assets/diagrams/section-zone-parking.png', box: [701,  345,  252,  715] },
      { key: 'mech', label: 'Mech', swatch: '#c4bab4', src: 'assets/diagrams/section-zone-mech.png', box: [701,  345,  252,  715] },
    ],
    callouts: [
      { text: 'Rooftop Lounge and Roof Deck', y: 434, x1: 945, x2: 1221, x: 1229 },
      { text: 'Full Amenity Floor with Tenant Lounge, Terrace and State of the Art “Spa Inspired” Wellness Center', y: 709, x1: 945, x2: 1221, x: 1229 },
      { text: 'Alternative Amenity Floor Location', y: 849, x1: 945, x2: 1221, x: 1229 },
      { text: '2nd Floor Conference Center', y: 963, x1: 945, x2: 1221, x: 1229 },
    ],
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
    clouds: ['assets/renders/clouds-far.png', 'assets/renders/clouds-near.png'],
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
    axo: true, // interactive podium axo (src/lib/podium.js) in place of the paseo diagram
  },

  {
    id: 'plaza-ascent',
    ref: 20,
    type: 'keyed',
    section: 'tenant-experience',
    theme: 'light',
    eyebrow: 'Tenant Experience',
    title: 'Plaza & Ascent',
    drawing: 'plaza-ascent', // src/assets/svg/plaza-ascent.svg, redrawn from the section diagram
    // Add spot: [x, y] (stage px) to each item once the keyed site plan arrives.
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
    image: { src: 'assets/renders/lobby-retail.jpg', alt: 'Lobby and retail at the base of the tower', focus: '24% 50%' },
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
      { swatch: '#b77859', label: 'Retail' },
      { swatch: '#bccad5', label: 'Lobby' },
      { swatch: '#8d9899', label: 'Loading Dock / Service Entry' },
    ],
    image: { src: 'assets/plans/lobby.jpg', alt: 'Ground floor plan', box: [796, 70, 1038, 844] },
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
      { swatch: '#b77859', label: 'Paseo Lounge and Conference' },
      { swatch: '#bccad5', label: 'Paseo + Terrace' },
      { swatch: '#8d9899', label: 'Parking Entry' },
    ],
    image: { src: 'assets/plans/second-floor.jpg', alt: 'Second floor amenity plan', box: [784, 70, 1062, 844] },
  },

  // ---------- closing ----------
  {
    id: 'thank-you',
    ref: 46,
    type: 'contact',
    theme: 'dark',
    title: 'Join the New Standard',
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
