import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

// Set up larger limit for base64 image uploads
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

// Initialize Google Gemini API securely on the server
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;

if (apiKey) {
  ai = new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
} else {
  console.warn("WARNING: GEMINI_API_KEY environment variable is not set. AI services will be unavailable.");
}

// Helper to check AI availability
function getAIClient(res: express.Response) {
  if (!ai) {
    res.status(503).json({
      error: "AI service is currently unavailable. Please verify that the Gemini API key is configured in the Secrets panel."
    });
    return null;
  }
  return ai;
}

// ----------------- API ROUTES -----------------

// API healthcheck
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", aiConfigured: !!ai });
});

// 1. Analyze Clothes Image (Image Understanding)
app.post("/api/wardrobe/analyze-image", async (req, res) => {
  const client = getAIClient(res);
  if (!client) return;

  try {
    const { imageBase64, mimeType = "image/jpeg" } = req.body;
    if (!imageBase64) {
      res.status(400).json({ error: "Missing required parameter: imageBase64" });
      return;
    }

    // Clean base64 string if it contains the data prefix
    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, "");

    const imagePart = {
      inlineData: {
        mimeType,
        data: base64Data,
      },
    };

    const textPart = {
      text: `Analyze this clothing item and return a structured JSON description. Focus on precision. Identify:
      - The high-level category (must be exactly one of: Tops, Bottoms, Dresses, Footwear, Accessories, Outerwear)
      - Specific subcategory (e.g., "leather jacket", "mom jeans", "crop top", "sneakers")
      - Dominant color (e.g., "Olive Green", "Navy Blue")
      - Color palette (suggest 3-5 colors that would match beautifully with this item)
      - Material (estimate based on texture: e.g., "Cotton Denim", "Knitted Wool", "Smooth Silk", "Synthetic Polyester", "Leather")
      - Pattern (e.g., "Solid", "Plaid", "Striped", "Floral", "Graphic")
      - Default Fashion Style (e.g., "Casual", "Minimalist", "Streetwear", "Formal", "Vintage", "Preppy")
      - Versatility Score (integer from 1 to 10 rating how easy it is to pair with other styles)
      - Occasions (list 2-4 suitable events like College, Office, Wedding, Date, Party, Gym, Festivals, Travel)
      - Suggested item types to pair this with (e.g., "High-waisted white trousers", "Black leather boots", "Gold chain necklace")`
    };

    const response = await client.models.generateContent({
      model: "gemini-3.5-flash",
      contents: { parts: [imagePart, textPart] },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            category: { type: Type.STRING },
            subcategory: { type: Type.STRING },
            color: { type: Type.STRING },
            colorPalette: { type: Type.ARRAY, items: { type: Type.STRING } },
            material: { type: Type.STRING },
            pattern: { type: Type.STRING },
            style: { type: Type.STRING },
            versatilityScore: { type: Type.INTEGER },
            occasions: { type: Type.ARRAY, items: { type: Type.STRING } },
            suggestedMatches: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: [
            "category", "subcategory", "color", "colorPalette", "material",
            "pattern", "style", "versatilityScore", "occasions", "suggestedMatches"
          ]
        }
      }
    });

    const parsedResponse = JSON.parse(response.text || "{}");
    res.json(parsedResponse);
  } catch (err: any) {
    console.error("Error in analyze-image API:", err);
    res.status(500).json({ error: err.message || "Failed to analyze clothing image" });
  }
});

// 2. Outfit Generator (Bespoke combinations based on Weather, Occasion, Preferences & existing Wardrobe)
app.post("/api/wardrobe/generate-outfits", async (req, res) => {
  const client = getAIClient(res);
  if (!client) return;

  try {
    const { 
      inventory = [], 
      weather = "Sunny, 22°C", 
      occasion = "Casual", 
      timeOfDay = "Afternoon",
      profile = {} 
    } = req.body;

    const inventoryDescription = inventory.length > 0 
      ? inventory.map((item: any) => `- [${item.category}] ${item.color} ${item.pattern !== "Solid" ? item.pattern + " " : ""}${item.subcategory} (Material: ${item.material}, Style: ${item.style})`).join("\n")
      : "The user's inventory is empty. Base suggestions on standard classic clothing items that most people should own, and explain how they can build a capsule wardrobe.";

    const profileText = `
    User Profile:
    - Gender: ${profile.gender || "Not specified"}
    - Body Type: ${profile.bodyType || "Not specified"}
    - Skin Tone / Color Preferences: ${profile.skinTone || "Not specified"}
    - Favorite Colors: ${profile.favoriteColors ? profile.favoriteColors.join(", ") : "Not specified"}
    - Fashion Style Choice: ${profile.fashionStyle || "Casual / Minimalist"}
    - Budget: ${profile.budget || "Affordable"}
    `;

    const prompt = `You are "AI Wardrobe", a friendly, premium personal stylist and fashion wizard.
    Analyze the user's wardrobe items and profile parameters to recommend 2 to 3 beautiful outfit combinations for the following conditions:
    - Occasion: ${occasion}
    - Weather: ${weather}
    - Time of day: ${timeOfDay}
    
    ${profileText}
    
    Here is the user's existing wardrobe items:
    ${inventoryDescription}
    
    Your goal is to be SUSTAINABLE. Favor reusing clothes the user already owns first. 
    Provide up to 3 outfit combinations. If the user's inventory is sufficient, recommend combinations exclusively using existing items.
    
    Only if the existing inventory is missing key elements (like outerwear for cold weather, or appropriate formal wear), suggest buying ONE new, budget-friendly, sustainable item. Detail why it will unlock multiple matches in their existing wardrobe.
    
    Return a structured JSON with the schema described below. Explain your styling choices clearly with confident, stylish reasons (e.g., why colors match or how layering works). Ensure styling score and comfort score are detailed.`;

    const response = await client.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            outfits: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  top: { type: Type.STRING, description: "Describe the top. State if it is from the existing inventory or standard capsule piece." },
                  bottom: { type: Type.STRING, description: "Describe the bottom. State if it is from the existing inventory." },
                  outerwear: { type: Type.STRING, description: "Outerwear description if needed, or 'None'" },
                  footwear: { type: Type.STRING, description: "Footwear description" },
                  accessories: { type: Type.ARRAY, items: { type: Type.STRING } },
                  stylingReason: { type: Type.STRING },
                  styleScore: { type: Type.INTEGER, description: "Style rating 1-10" },
                  comfortScore: { type: Type.INTEGER, description: "Comfort rating 1-10" },
                  suitability: { type: Type.STRING, description: "Why it matches this weather and event code" },
                  isCapsuleApproved: { type: Type.BOOLEAN }
                },
                required: [
                  "name", "top", "bottom", "outerwear", "footwear", "accessories", 
                  "stylingReason", "styleScore", "comfortScore", "suitability", "isCapsuleApproved"
                ]
              }
            },
            shoppingRecommendation: {
              type: Type.OBJECT,
              properties: {
                needed: { type: Type.BOOLEAN, description: "Is a new purchase recommended?" },
                item: { type: Type.STRING, description: "Name of recommended item to buy, or empty" },
                reason: { type: Type.STRING, description: "Sustainibility logic of purchase, or empty" },
                estimatedPrice: { type: Type.STRING, description: "Price level, e.g., '$20 - $35', or empty" }
              },
              required: ["needed", "item", "reason", "estimatedPrice"]
            }
          },
          required: ["outfits", "shoppingRecommendation"]
        }
      }
    });

    const parsedResponse = JSON.parse(response.text || "{}");
    res.json(parsedResponse);
  } catch (err: any) {
    console.error("Error in generate-outfits API:", err);
    res.status(500).json({ error: err.message || "Failed to generate outfits" });
  }
});

// 3. Packing Assistant (Build packing lists + daily wear planner)
app.post("/api/wardrobe/packing-assistant", async (req, res) => {
  const client = getAIClient(res);
  if (!client) return;

  try {
    const { 
      destination = "Paris", 
      weather = "Spring, Rain 15°C", 
      durationDays = 3, 
      activities = "Sightseeing, dinner, walking", 
      inventory = [] 
    } = req.body;

    const inventoryDescription = inventory.length > 0 
      ? inventory.map((item: any) => `- [${item.category}] ${item.color} ${item.subcategory}`).join("\n")
      : "Standard capsule pieces.";

    const prompt = `You are a professional travel packing consultant. 
    Prepare an smart, minimal, capsule-wardrobe packing list for a trip to:
    - Destination: ${destination}
    - Weather conditions: ${weather}
    - Duration: ${durationDays} days
    - Activities: ${activities}

    User's existing wardrobe to pull from:
    ${inventoryDescription}

    Provide a packing list of specific clothing items from the user's wardrobe, plus essential toiletries and other smart items.
    Also, plan individual outfits for each day of the trip (e.g. Day 1, Day 2, Day 3) detailing top, bottom, outerwear, and styling tips that optimize re-wearing pieces creatively (sustainable fashion).
    
    Return a structured JSON with packingList and dailyOutfits arrays.`;

    const response = await client.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            packingList: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  item: { type: Type.STRING, description: "e.g., 'White Linen Top' or 'Comfortable Sneakers'" },
                  category: { type: Type.STRING, description: "e.g., Clothing, Footwear, Toiletries, Tech, Accessories" },
                  quantity: { type: Type.INTEGER },
                  isCrucial: { type: Type.BOOLEAN, description: "Is this item essential?" }
                },
                required: ["item", "category", "quantity", "isCrucial"]
              }
            },
            dailyOutfits: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  day: { type: Type.STRING, description: "e.g., 'Day 1: Arrival & Exploring'" },
                  activity: { type: Type.STRING },
                  outfit: { type: Type.STRING, description: "Complete top, bottom, outer, shoes combination" },
                  stylingTips: { type: Type.STRING, description: "Practical advice on layering, comfort, or transition" }
                },
                required: ["day", "activity", "outfit", "stylingTips"]
              }
            }
          },
          required: ["packingList", "dailyOutfits"]
        }
      }
    });

    const parsedResponse = JSON.parse(response.text || "{}");
    res.json(parsedResponse);
  } catch (err: any) {
    console.error("Error in packing-assistant API:", err);
    res.status(500).json({ error: err.message || "Failed to generate packing list" });
  }
});

// 4. Personalized Styling Advice (Q&A/Tips on layering, styling, color matching, and sustainability)
app.post("/api/wardrobe/advice", async (req, res) => {
  const client = getAIClient(res);
  if (!client) return;

  try {
    const { 
      question = "How do I layer clothes for autumn?", 
      inventory = [], 
      profile = {} 
    } = req.body;

    const inventoryDescription = inventory.length > 0 
      ? inventory.map((item: any) => `- [${item.category}] ${item.color} ${item.subcategory}`).join("\n")
      : "Standard casual wardrobe.";

    const prompt = `You are a senior fashion editor and sustainability advocate. 
    Answer the following fashion query: "${question}"
    
    Context:
    - User's Fashion Style Preference: ${profile.fashionStyle || "Casual"}
    - User's Skin Tone / Color Palette: ${profile.skinTone || "Not specified"}
    - User's existing items:
    ${inventoryDescription}
    
    Provide custom, professional styling advice tailored to their question and existing pieces. Explain why specific combinations work, how they can mix colors, the mechanics of layering, accessory suggestions, and seasonal trends to look out for. Encourage sustainable reuse of their items.
    
    Return a structured JSON.`;

    const response = await client.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            advice: { type: Type.STRING, description: "A comprehensive markdown explanation with elegant formatting answering the user's styling question." },
            colorTips: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Specific tips about color matching and pairings." },
            layeringGuide: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Concrete advice on combining and stacking items (inner, mid, outer layer)." },
            seasonalTrends: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Key fashion trends relevant to this styling advice." },
            accessoriesAdvice: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Suggestions for watches, jewelry, bags, or belts to tie the look together." }
          },
          required: ["advice", "colorTips", "layeringGuide", "seasonalTrends", "accessoriesAdvice"]
        }
      }
    });

    const parsedResponse = JSON.parse(response.text || "{}");
    res.json(parsedResponse);
  } catch (err: any) {
    console.error("Error in advice API:", err);
    res.status(500).json({ error: err.message || "Failed to generate styling advice" });
  }
});

// ----------------- VITE DEVELOPMENT / PRODUCTION SETUP -----------------

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT} with environment ${process.env.NODE_ENV || "development"}`);
  });
}

startServer();
