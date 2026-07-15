import { WardrobeItem, UserProfile } from "./types";

export const INITIAL_WARDROBE: WardrobeItem[] = [
  {
    id: "item-1",
    category: "Tops",
    subcategory: "Classic White Tee",
    color: "Off-White",
    colorPalette: ["Navy Blue", "Black", "Beige", "Olive Green"],
    material: "Organic Cotton",
    pattern: "Solid",
    style: "Minimalist",
    versatilityScore: 10,
    occasions: ["College", "Casual", "Travel", "Gym"],
    suggestedMatches: ["High-waisted blue jeans", "Beige chinos", "Black leather jacket"],
    imageUrl: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=500&auto=format&fit=crop&q=60",
    createdAt: new Date().toISOString()
  },
  {
    id: "item-2",
    category: "Outerwear",
    subcategory: "Classic Denim Jacket",
    color: "Indigo Blue",
    colorPalette: ["White", "Grey", "Black", "Tan"],
    material: "Heavy Cotton Denim",
    pattern: "Solid",
    style: "Streetwear",
    versatilityScore: 9,
    occasions: ["College", "Travel", "Casual", "Date"],
    suggestedMatches: ["White t-shirt", "Black slim jeans", "Brown boots"],
    imageUrl: "https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=500&auto=format&fit=crop&q=60",
    createdAt: new Date().toISOString()
  },
  {
    id: "item-3",
    category: "Bottoms",
    subcategory: "Tailored Slim-fit Chinos",
    color: "Sand Beige",
    colorPalette: ["White", "Navy Blue", "Forest Green", "Burgundy"],
    material: "Cotton Twill",
    pattern: "Solid",
    style: "Casual",
    versatilityScore: 8,
    occasions: ["Office", "College", "Date", "Interview"],
    suggestedMatches: ["White linen shirt", "Navy blazer", "Brown loafers"],
    imageUrl: "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=500&auto=format&fit=crop&q=60",
    createdAt: new Date().toISOString()
  },
  {
    id: "item-4",
    category: "Footwear",
    subcategory: "Minimalist Leather Sneakers",
    color: "Clean White",
    colorPalette: ["All colors", "Navy Blue", "Beige", "Black"],
    material: "Full-Grain Leather",
    pattern: "Solid",
    style: "Minimalist",
    versatilityScore: 10,
    occasions: ["College", "Casual", "Office", "Travel"],
    suggestedMatches: ["Sand chinos", "Blue jeans", "Summer dresses"],
    imageUrl: "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=500&auto=format&fit=crop&q=60",
    createdAt: new Date().toISOString()
  },
  {
    id: "item-5",
    category: "Bottoms",
    subcategory: "High-Rise Straight Jeans",
    color: "Charcoal Black",
    colorPalette: ["White", "Grey", "Sage Green", "Emerald"],
    material: "Structured Denim",
    pattern: "Solid",
    style: "Casual",
    versatilityScore: 9,
    occasions: ["Casual", "College", "Party", "Date"],
    suggestedMatches: ["Cropped sweater", "Heeled boots", "Denim jacket"],
    imageUrl: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=500&auto=format&fit=crop&q=60",
    createdAt: new Date().toISOString()
  },
  {
    id: "item-6",
    category: "Dresses",
    subcategory: "Elegant Silk Slip Dress",
    color: "Emerald Green",
    colorPalette: ["Gold", "Black", "Nude Beige", "Cream"],
    material: "Mulberry Silk",
    pattern: "Solid",
    style: "Vintage",
    versatilityScore: 7,
    occasions: ["Wedding", "Date", "Party", "Festivals"],
    suggestedMatches: ["Strappy gold heels", "Oversized white blazer", "Pearl necklace"],
    imageUrl: "https://images.unsplash.com/photo-1485462537746-965f33f7f6a7?w=500&auto=format&fit=crop&q=60",
    createdAt: new Date().toISOString()
  },
  {
    id: "item-7",
    category: "Accessories",
    subcategory: "Vintage Leather Watch",
    color: "Cognac Brown",
    colorPalette: ["Gold", "Silver", "Beige", "Navy Blue"],
    material: "Italian Leather",
    pattern: "Solid",
    style: "Vintage",
    versatilityScore: 9,
    occasions: ["Office", "Interview", "Date", "Wedding"],
    suggestedMatches: ["Beige trench coat", "Blue linen shirt"],
    imageUrl: "https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=500&auto=format&fit=crop&q=60",
    createdAt: new Date().toISOString()
  }
];

export const INITIAL_PROFILE: UserProfile = {
  gender: "Female",
  bodyType: "Hourglass",
  skinTone: "Warm Undertones",
  favoriteColors: ["Olive Green", "Off-White", "Charcoal", "Emerald"],
  fashionStyle: "Minimalist & Chic",
  clothingSize: "Medium",
  preferredBrands: ["Everlane", "Uniqlo", "Zara", "Patagonia"],
  budget: "Moderate & Eco-friendly",
  frequentEvents: ["Office", "Date Night", "Weekend Travel", "Coffee Shops"]
};

export const FASHION_OCCASIONS = [
  "Casual Hangout",
  "College / University",
  "Office / Smart Casual",
  "Job Interview",
  "Romantic Date",
  "Cocktail Party",
  "Wedding Guest",
  "Weekend Travel",
  "Gym / Workout",
  "Festivals & Concerts"
];

export const FASHION_STYLES = [
  "Minimalist & Elegant",
  "Casual & Cozy",
  "Smart Professional",
  "Streetwear & Edgy",
  "Vintage / Retro Chic",
  "Traditional / Festival",
  "Athleisure / Sporty",
  "Bohemian / Free Spirit",
  "Classic Preppy"
];

export const GENDERS = ["Female", "Male", "Non-binary", "Prefer not to say"];

export const BODY_TYPES = [
  "Hourglass",
  "Rectangle",
  "Pear-shaped",
  "Apple-shaped",
  "Inverted Triangle",
  "Athletic",
  "Tall & Slim",
  "Plus Size"
];

export const SKIN_TONES = [
  "Cool Pale / Fair Undertones",
  "Neutral Light / Medium Undertones",
  "Warm Olive / Tan Undertones",
  "Rich Deep Undertones"
];

export const WEATHER_PRESETS = [
  { label: "☀️ Sunny & Warm (24°C / 75°F)", val: "Sunny, Warm, 24°C (75°F)" },
  { label: "⛅ Cool & Autumnal (15°C / 59°F)", val: "Cool, Breezy Autumn, 15°C (59°F)" },
  { label: "❄️ Winter Chill (4°C / 39°F)", val: "Very Cold, Winter Snow, 4°C (39°F)" },
  { label: "🌧️ Rain & Damp (12°C / 53°F)", val: "Rainy, Humid, 12°C (53°F)" },
  { label: "🥵 Hot & Humid (32°C / 90°F)", val: "Extremely Hot, Humid, 32°C (90°F)" }
];
