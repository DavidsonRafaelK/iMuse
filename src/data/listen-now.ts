export type Track = {
  title: string;
  highlighted?: boolean;
};

export type ListenNowItem = {
  id: string;
  title: string;
  artist: string;
  description: string;
  genre: string;
  year: string;
  image: string;
  releaseDate: string;
  duration: string;
  copyright: string;
  tracks: Track[];
};

export const listenNowItems: ListenNowItem[] = [
  {
    id: "1",
    title: "Midnight Drive",
    artist: "Wren Halley",
    description: "Chill, late-night beats built for empty streets.",
    genre: "Lo-fi",
    year: "2026",
    image:
      "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=400&q=60",
    releaseDate: "August 14, 2026",
    duration: "8 songs, 27 minutes",
    copyright: "℗ 2026 Wren Halley under exclusive license to Nightbloom Records",
    tracks: [
      { title: "Empty Streets", highlighted: true },
      { title: "Rearview", highlighted: true },
      { title: "Streetlights" },
      { title: "Midnight Drive" },
      { title: "Low Beams" },
      { title: "Quiet Exit" },
      { title: "Static Radio" },
      { title: "Home By Sunrise" },
    ],
  },
  {
    id: "2",
    title: "Golden Hour",
    artist: "Nova Rae",
    description: "Sun-soaked pop hooks with a feel-good glow.",
    genre: "Pop",
    year: "2026",
    image:
      "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=400&q=60",
    releaseDate: "July 2, 2026",
    duration: "10 songs, 33 minutes",
    copyright: "℗ 2026 Nova Rae under exclusive license to Coastline Music",
    tracks: [
      { title: "Golden Hour", highlighted: true },
      { title: "Sunburnt", highlighted: true },
      { title: "Better in the Light" },
      { title: "Warm Static" },
      { title: "Afterglow" },
      { title: "Slow Fade" },
      { title: "Postcards" },
      { title: "Halfway Home" },
      { title: "Tan Lines" },
      { title: "Last Light" },
    ],
  },
  {
    id: "3",
    title: "Keys & Strings",
    artist: "The Night Owls",
    description: "Warm jazz textures for a slow, easy evening.",
    genre: "Jazz",
    year: "2025",
    image:
      "https://images.unsplash.com/photo-1493246507139-91e8fad9978e?auto=format&fit=crop&w=400&q=60",
    releaseDate: "November 9, 2025",
    duration: "7 songs, 31 minutes",
    copyright: "℗ 2025 The Night Owls under exclusive license to Blue Room Records",
    tracks: [
      { title: "Keys & Strings", highlighted: true },
      { title: "Late Set", highlighted: true },
      { title: "Smoky Room" },
      { title: "Brushwork" },
      { title: "Last Call" },
      { title: "Blue Note" },
      { title: "Closing Time" },
    ],
  },
  {
    id: "4",
    title: "Stage Lights",
    artist: "Corner Store",
    description: "Big guitars and bigger choruses, arena-ready.",
    genre: "Rock",
    year: "2026",
    image:
      "https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&w=400&q=60",
    releaseDate: "March 21, 2026",
    duration: "9 songs, 36 minutes",
    copyright: "℗ 2026 Corner Store under exclusive license to Amplitude Records",
    tracks: [
      { title: "Stage Lights", highlighted: true },
      { title: "Encore", highlighted: true },
      { title: "Sold Out" },
      { title: "Backstage" },
      { title: "Feedback" },
      { title: "Front Row" },
      { title: "One More Song" },
      { title: "House Lights Up" },
      { title: "Last Chord" },
    ],
  },
  {
    id: "5",
    title: "Neon Nights",
    artist: "Kito Ren",
    description: "Retro synths and driving basslines after dark.",
    genre: "Synthwave",
    year: "2026",
    image:
      "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=400&q=60",
    releaseDate: "May 30, 2026",
    duration: "8 songs, 29 minutes",
    copyright: "℗ 2026 Kito Ren under exclusive license to Gridline Audio",
    tracks: [
      { title: "Neon Nights", highlighted: true },
      { title: "Drive Mode", highlighted: true },
      { title: "Skyline" },
      { title: "Chrome" },
      { title: "Night Shift" },
      { title: "Afterhours" },
      { title: "Rewind" },
      { title: "Fade to Neon" },
    ],
  },
  {
    id: "6",
    title: "Sunday Morning",
    artist: "Iris Calloway",
    description: "Gentle acoustic tracks to ease into the day.",
    genre: "Acoustic",
    year: "2025",
    image:
      "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=400&q=60",
    releaseDate: "October 5, 2025",
    duration: "6 songs, 22 minutes",
    copyright: "℗ 2025 Iris Calloway under exclusive license to Quiet House Records",
    tracks: [
      { title: "Sunday Morning", highlighted: true },
      { title: "Coffee & Rain", highlighted: true },
      { title: "Window Seat" },
      { title: "Soft Light" },
      { title: "Slow Start" },
      { title: "Still Here" },
    ],
  },
  {
    id: "7",
    title: "Bass Drop",
    artist: "DJ Wavelength",
    description: "High-energy EDM built to keep the floor moving.",
    genre: "EDM",
    year: "2026",
    image:
      "https://images.unsplash.com/photo-1493246507139-91e8fad9978e?auto=format&fit=crop&w=400&q=60",
    releaseDate: "June 18, 2026",
    duration: "11 songs, 41 minutes",
    copyright: "℗ 2026 DJ Wavelength under exclusive license to Pulse Records",
    tracks: [
      { title: "Bass Drop", highlighted: true },
      { title: "Overdrive", highlighted: true },
      { title: "Strobe" },
      { title: "Floor Shaker" },
      { title: "Redline" },
      { title: "Peak Hour" },
      { title: "Encore Drop" },
      { title: "Last Call" },
      { title: "Aftermath" },
      { title: "Sunrise Set" },
      { title: "Reload" },
    ],
  },
  {
    id: "8",
    title: "Late Night Vibes",
    artist: "Marina Cole",
    description: "Smooth R&B grooves for winding down slow.",
    genre: "R&B",
    year: "2026",
    image:
      "https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&w=400&q=60",
    releaseDate: "September 12, 2026",
    duration: "9 songs, 34 minutes",
    copyright: "℗ 2026 Marina Cole under exclusive license to Velvet Hour Music",
    tracks: [
      { title: "Late Night Vibes", highlighted: true },
      { title: "Slow Dance", highlighted: true },
      { title: "Low Light" },
      { title: "Closer" },
      { title: "Text Back" },
      { title: "3AM" },
      { title: "Still Up" },
      { title: "Wind Down" },
      { title: "Til Morning" },
    ],
  },
];
