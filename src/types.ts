export type WardrobeCategory = 'Tops' | 'Bottoms' | 'Dresses' | 'Footwear' | 'Accessories' | 'Outerwear';

export interface WardrobeItem {
  id: string;
  category: WardrobeCategory;
  subcategory: string;
  color: string;
  colorPalette: string[];
  material: string;
  pattern: string;
  style: string;
  versatilityScore: number;
  occasions: string[];
  suggestedMatches: string[];
  imageUrl?: string;
  createdAt: string;
}

export interface UserProfile {
  gender: string;
  bodyType: string;
  skinTone: string;
  favoriteColors: string[];
  fashionStyle: string;
  clothingSize: string;
  preferredBrands: string[];
  budget: string;
  frequentEvents: string[];
}

export interface GeneratedOutfit {
  name: string;
  top: string;
  bottom: string;
  outerwear: string;
  footwear: string;
  accessories: string[];
  stylingReason: string;
  styleScore: number;
  comfortScore: number;
  suitability: string;
  isCapsuleApproved: boolean;
}

export interface WornOutfit {
  id: string;
  wornDate: string;
  name: string;
  top: string;
  bottom: string;
  outerwear: string;
  footwear: string;
  accessories: string[];
  occasion: string;
}

export interface ShoppingRecommendation {
  needed: boolean;
  item: string;
  reason: string;
  estimatedPrice: string;
}

export interface OutfitGenerationResponse {
  outfits: GeneratedOutfit[];
  shoppingRecommendation: ShoppingRecommendation;
}

export interface PackingItem {
  item: string;
  category: string;
  quantity: number;
  isCrucial: boolean;
}

export interface DailyOutfitPlan {
  day: string;
  activity: string;
  outfit: string;
  stylingTips: string;
}

export interface PackingResponse {
  packingList: PackingItem[];
  dailyOutfits: DailyOutfitPlan[];
}

export interface AdviceResponse {
  advice: string;
  colorTips: string[];
  layeringGuide: string[];
  seasonalTrends: string[];
  accessoriesAdvice: string[];
}
