// Fictional Prime Video Rebuild catalog.
// Video URLs point to Google's public sample MP4s (royalty-free, safe for demos).

const CLIP = (n) =>
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/' + n

const CLIPS = {
  blaze: CLIP('ForBiggerBlazes.mp4'),
  escape: CLIP('ForBiggerEscapes.mp4'),
  fun: CLIP('ForBiggerFun.mp4'),
  joyride: CLIP('ForBiggerJoyrides.mp4'),
  meltdown: CLIP('ForBiggerMeltdowns.mp4'),
  subaru: CLIP('SubaruOutbackOnStreetAndDirt.mp4'),
  bullrun: CLIP('WeAreGoingOnBullrun.mp4'),
  grand: CLIP('WhatCarCanYouGetForAGrand.mp4'),
  sintel: CLIP('Sintel.mp4'),
  steel: CLIP('TearsOfSteel.mp4'),
  bunny: CLIP('BigBuckBunny.mp4'),
  elephants: CLIP('ElephantsDream.mp4'),
}

export const TITLES = [
  {
    id: 'last-signal',
    title: 'The Last Signal',
    tagline: 'A Prime Original',
    year: 2026,
    rating: '16+',
    duration: '2h 08m',
    genres: ['Sci-Fi', 'Thriller'],
    isPrime: true,
    isFree: false,
    description:
      "When Earth's final communication satellite disappears, a young engineer begins a journey to discover why — and finds a signal no one was meant to hear.",
    poster:
      'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=600&q=80',
    backdrop:
      'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1600&q=80',
    videoUrl: CLIPS.steel,
    previewUrl: CLIPS.blaze,
    featured: true,
  },
  {
    id: 'night-shift',
    title: 'Night Shift',
    tagline: 'A Prime Original Series',
    year: 2026,
    rating: '18+',
    duration: 'S1 · 8 Episodes',
    genres: ['Drama', 'Mystery'],
    isPrime: true,
    isFree: false,
    description: 'A hospital night crew confronts a patient who knows things no one should know.',
    poster:
      'https://images.unsplash.com/photo-1518676590629-3dcbd9c5a5c9?auto=format&fit=crop&w=600&q=80',
    backdrop:
      'https://images.unsplash.com/photo-1518676590629-3dcbd9c5a5c9?auto=format&fit=crop&w=1600&q=80',
    videoUrl: CLIPS.elephants,
    previewUrl: CLIPS.escape,
  },
  {
    id: 'code-zero',
    title: 'Code Zero',
    tagline: 'A Prime Original',
    year: 2025,
    rating: '16+',
    duration: '1h 52m',
    genres: ['Sci-Fi', 'Action'],
    isPrime: true,
    isFree: false,
    description:
      'A rogue AI codes its own successor. The only person who can stop it wrote its first line.',
    poster:
      'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=600&q=80',
    backdrop:
      'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1600&q=80',
    videoUrl: CLIPS.bunny,
    previewUrl: CLIPS.fun,
  },
  {
    id: 'orbit',
    title: 'Orbit',
    tagline: 'A Prime Original',
    year: 2026,
    rating: 'PG',
    duration: '2h 04m',
    genres: ['Sci-Fi', 'Drama'],
    isPrime: true,
    isFree: false,
    description:
      "Two astronauts on a dying station must choose between saving themselves and saving what's below.",
    poster:
      'https://images.unsplash.com/photo-1446776877081-d282a0f896e2?auto=format&fit=crop&w=600&q=80',
    backdrop:
      'https://images.unsplash.com/photo-1446776877081-d282a0f896e2?auto=format&fit=crop&w=1600&q=80',
    videoUrl: CLIPS.sintel,
    previewUrl: CLIPS.joyride,
  },
  {
    id: 'the-deep',
    title: 'The Deep',
    tagline: 'A Prime Original',
    year: 2025,
    rating: '16+',
    duration: '1h 44m',
    genres: ['Thriller', 'Adventure'],
    isPrime: true,
    isFree: false,
    description: "A deep-sea mining crew drills into something that shouldn't exist.",
    poster:
      'https://images.unsplash.com/photo-1551244072-5d12893278ab?auto=format&fit=crop&w=600&q=80',
    backdrop:
      'https://images.unsplash.com/photo-1551244072-5d12893278ab?auto=format&fit=crop&w=1600&q=80',
    videoUrl: CLIPS.blaze,
    previewUrl: CLIPS.meltdown,
  },
  {
    id: 'paper-kingdom',
    title: 'Paper Kingdom',
    tagline: 'A Prime Original',
    year: 2026,
    rating: 'PG-13',
    duration: '1h 38m',
    genres: ['Drama'],
    isPrime: true,
    isFree: false,
    description: 'A small-town newspaper fights to survive its final print run.',
    poster:
      'https://images.unsplash.com/photo-1505686994434-e3cc5abf1330?auto=format&fit=crop&w=600&q=80',
    backdrop:
      'https://images.unsplash.com/photo-1505686994434-e3cc5abf1330?auto=format&fit=crop&w=1600&q=80',
    videoUrl: CLIPS.escape,
    previewUrl: CLIPS.grand,
  },
  {
    id: 'neon-city',
    title: 'Neon City',
    tagline: 'A Prime Original',
    year: 2025,
    rating: '18+',
    duration: '2h 12m',
    genres: ['Action', 'Sci-Fi'],
    isPrime: true,
    isFree: false,
    description: 'A detective in a city that never sleeps chases a ghost.',
    poster:
      'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80',
    backdrop:
      'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1600&q=80',
    videoUrl: CLIPS.joyride,
    previewUrl: CLIPS.bullrun,
  },
  {
    id: 'quiet-waters',
    title: 'Quiet Waters',
    tagline: 'A Prime Original',
    year: 2026,
    rating: 'PG',
    duration: '1h 29m',
    genres: ['Drama', 'Family'],
    isPrime: true,
    isFree: false,
    description: 'A family retreats to a lakehouse and finds a second chance.',
    poster:
      'https://images.unsplash.com/photo-1439066615861-d1af74d74000?auto=format&fit=crop&w=600&q=80',
    backdrop:
      'https://images.unsplash.com/photo-1439066615861-d1af74d74000?auto=format&fit=crop&w=1600&q=80',
    videoUrl: CLIPS.subaru,
    previewUrl: CLIPS.subaru,
  },
  {
    id: 'beyond-the-ridge',
    title: 'Beyond the Ridge',
    tagline: 'A Prime Original',
    year: 2025,
    rating: 'PG-13',
    duration: '1h 56m',
    genres: ['Adventure', 'Drama'],
    isPrime: true,
    isFree: false,
    description: 'Two climbers race a storm to reach the summit.',
    poster:
      'https://images.unsplash.com/photo-1454496522488-7a8e488e8606?auto=format&fit=crop&w=600&q=80',
    backdrop:
      'https://images.unsplash.com/photo-1454496522488-7a8e488e8606?auto=format&fit=crop&w=1600&q=80',
    videoUrl: CLIPS.meltdown,
    previewUrl: CLIPS.blaze,
  },
  {
    id: 'signal-lost',
    title: 'Signal Lost',
    tagline: 'Free with ads',
    year: 2024,
    rating: 'PG-13',
    duration: '1h 41m',
    genres: ['Sci-Fi', 'Mystery'],
    isPrime: false,
    isFree: true,
    description: 'A radio operator picks up a distress call from 30 years ago.',
    poster:
      'https://images.unsplash.com/photo-1502136969935-8d8eef54d77b?auto=format&fit=crop&w=600&q=80',
    backdrop:
      'https://images.unsplash.com/photo-1502136969935-8d8eef54d77b?auto=format&fit=crop&w=1600&q=80',
    videoUrl: CLIPS.fun,
    previewUrl: CLIPS.escape,
  },
  {
    id: 'northbound',
    title: 'Northbound',
    tagline: 'Free with ads',
    year: 2024,
    rating: 'PG',
    duration: '1h 34m',
    genres: ['Drama'],
    isPrime: false,
    isFree: true,
    description: 'A road trip across three borders and one long-lost friendship.',
    poster:
      'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?auto=format&fit=crop&w=600&q=80',
    backdrop:
      'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?auto=format&fit=crop&w=1600&q=80',
    videoUrl: CLIPS.bullrun,
    previewUrl: CLIPS.grand,
  },
  {
    id: 'red-horizon',
    title: 'Red Horizon',
    tagline: 'Free with ads',
    year: 2023,
    rating: '16+',
    duration: '2h 01m',
    genres: ['Action'],
    isPrime: false,
    isFree: true,
    description: 'A retired pilot is pulled back for one final mission.',
    poster:
      'https://images.unsplash.com/photo-1543536448-d209d2d13a1c?auto=format&fit=crop&w=600&q=80',
    backdrop:
      'https://images.unsplash.com/photo-1543536448-d209d2d13a1c?auto=format&fit=crop&w=1600&q=80',
    videoUrl: CLIPS.blaze,
    previewUrl: CLIPS.joyride,
  },
  {
    id: 'winter-light',
    title: 'Winter Light',
    tagline: 'Free with ads',
    year: 2024,
    rating: 'PG',
    duration: '1h 47m',
    genres: ['Drama', 'Family'],
    isPrime: false,
    isFree: true,
    description: 'A small village prepares for its first white Christmas in decades.',
    poster:
      'https://images.unsplash.com/photo-1483728642387-6c3bdd6c93e5?auto=format&fit=crop&w=600&q=80',
    backdrop:
      'https://images.unsplash.com/photo-1483728642387-6c3bdd6c93e5?auto=format&fit=crop&w=1600&q=80',
    videoUrl: CLIPS.subaru,
    previewUrl: CLIPS.meltdown,
  },
  {
    id: 'the-archive',
    title: 'The Archive',
    tagline: 'A Prime Original Series',
    year: 2026,
    rating: '16+',
    duration: 'S1 · 6 Episodes',
    genres: ['Mystery', 'Sci-Fi'],
    isPrime: true,
    isFree: false,
    description: 'A librarian discovers a book that writes itself.',
    poster:
      'https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&w=600&q=80',
    backdrop:
      'https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&w=1600&q=80',
    videoUrl: CLIPS.elephants,
    previewUrl: CLIPS.fun,
  },
  {
    id: 'paper-trail',
    title: 'Paper Trail',
    tagline: 'Free with ads',
    year: 2025,
    rating: 'PG-13',
    duration: '1h 39m',
    genres: ['Thriller'],
    isPrime: false,
    isFree: true,
    description: 'An accountant uncovers a decade of fraud.',
    poster:
      'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=600&q=80',
    backdrop:
      'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=1600&q=80',
    videoUrl: CLIPS.grand,
    previewUrl: CLIPS.escape,
  },
  {
    id: 'the-cartographer',
    title: 'The Cartographer',
    tagline: 'A Prime Original',
    year: 2025,
    rating: 'PG',
    duration: '1h 51m',
    genres: ['Adventure', 'Drama'],
    isPrime: true,
    isFree: false,
    description: 'A 19th-century mapmaker charts a coastline that shifts each night.',
    poster:
      'https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=600&q=80',
    backdrop:
      'https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=1600&q=80',
    videoUrl: CLIPS.sintel,
    previewUrl: CLIPS.blaze,
  },
]

export function getTitleById(id) {
  return TITLES.find((t) => t.id === id) || null
}

export function getFeatured() {
  return TITLES.find((t) => t.featured) || TITLES[0]
}

export function getPopularMovies() {
  return TITLES.filter((t) => t.isPrime && !t.duration.startsWith('S'))
}

export function getOriginals() {
  return TITLES.filter((t) => t.isPrime)
}

export function getFreeWithAds() {
  return TITLES.filter((t) => t.isFree)
}

export function getTVShows() {
  return TITLES.filter((t) => t.duration.startsWith('S'))
}

export function searchTitles(query) {
  const q = (query || '').toLowerCase().trim()
  if (!q) return []
  return TITLES.filter(
    (t) =>
      t.title.toLowerCase().includes(q) ||
      t.genres.some((g) => g.toLowerCase().includes(q)) ||
      t.description.toLowerCase().includes(q)
  )
}

export function getRecommendationsFor(id, limit = 4) {
  const base = getTitleById(id)
  if (!base) return []
  return TITLES.filter(
    (t) => t.id !== id && t.genres.some((g) => base.genres.includes(g))
  ).slice(0, limit)
}
