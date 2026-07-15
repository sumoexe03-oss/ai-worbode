import React, { useState, useRef } from "react";
import { WardrobeItem, WardrobeCategory } from "../types";
import { Plus, Trash2, SlidersHorizontal, Image as ImageIcon, Sparkles, AlertCircle, CheckCircle, Search, Upload, Info } from "lucide-react";

interface WardrobeManagerProps {
  items: WardrobeItem[];
  onAddItem: (item: Omit<WardrobeItem, "id" | "createdAt">) => void;
  onRemoveItem: (id: string) => void;
}

// Unsplash Preset image options to let users play with AI analysis instantly without having files ready
const PRESET_CLOTHES = [
  {
    name: "Classic Beige Trench Coat",
    url: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=600&auto=format&fit=crop&q=80",
    description: "Tan coat perfect for layering"
  },
  {
    name: "Structured Plaid Pleated Skirt",
    url: "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=600&auto=format&fit=crop&q=80",
    description: "Autumnal styled pattern skirt"
  },
  {
    name: "Crimson Red Silk Blouse",
    url: "https://images.unsplash.com/photo-1603252109303-2751441dd157?w=600&auto=format&fit=crop&q=80",
    description: "Vibrant dress shirt in mulberry red"
  },
  {
    name: "Cozy Charcoal Knit Sweater",
    url: "https://images.unsplash.com/photo-1614975058789-41316d0e2e9c?w=600&auto=format&fit=crop&q=80",
    description: "Thick winter knitwear wool blend"
  }
];

export default function WardrobeManager({
  items,
  onAddItem,
  onRemoveItem
}: WardrobeManagerProps) {
  const [activeTab, setActiveTab] = useState<WardrobeCategory | "All">("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  
  // New item form state
  const [newCategory, setNewCategory] = useState<WardrobeCategory>("Tops");
  const [newSubcategory, setNewSubcategory] = useState("");
  const [newColor, setNewColor] = useState("");
  const [newMaterial, setNewMaterial] = useState("");
  const [newPattern, setNewPattern] = useState("Solid");
  const [newStyle, setNewStyle] = useState("Casual");
  const [newVersatility, setNewVersatility] = useState(7);
  const [newOccasions, setNewOccasions] = useState<string[]>([]);
  const [newMatches, setNewMatches] = useState<string[]>([]);
  const [newImageUrl, setNewImageUrl] = useState("");

  // Sub-input states for array builders
  const [tempOccasion, setTempOccasion] = useState("");
  const [tempMatch, setTempMatch] = useState("");

  // AI analysis state
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState("");
  const [analysisSuccess, setAnalysisSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const categories: (WardrobeCategory | "All")[] = ["All", "Tops", "Bottoms", "Dresses", "Footwear", "Accessories", "Outerwear"];

  const filteredItems = items.filter((item) => {
    const matchesCategory = activeTab === "All" || item.category === activeTab;
    const matchesSearch = 
      item.subcategory.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.color.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.material.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.style.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Handle manual additions
  const addOccasionTag = () => {
    if (tempOccasion.trim() && !newOccasions.includes(tempOccasion.trim())) {
      setNewOccasions([...newOccasions, tempOccasion.trim()]);
      setTempOccasion("");
    }
  };

  const addMatchTag = () => {
    if (tempMatch.trim() && !newMatches.includes(tempMatch.trim())) {
      setNewMatches([...newMatches, tempMatch.trim()]);
      setTempMatch("");
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubcategory || !newColor || !newMaterial) {
      alert("Please fill in subcategory, color, and material.");
      return;
    }
    onAddItem({
      category: newCategory,
      subcategory: newSubcategory,
      color: newColor,
      colorPalette: [newColor, "Beige", "Black", "Navy"],
      material: newMaterial,
      pattern: newPattern,
      style: newStyle,
      versatilityScore: Number(newVersatility),
      occasions: newOccasions.length > 0 ? newOccasions : ["Casual"],
      suggestedMatches: newMatches,
      imageUrl: newImageUrl || "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=500&auto=format&fit=crop&q=60"
    });
    resetForm();
  };

  const resetForm = () => {
    setIsAdding(false);
    setNewCategory("Tops");
    setNewSubcategory("");
    setNewColor("");
    setNewMaterial("");
    setNewPattern("Solid");
    setNewStyle("Casual");
    setNewVersatility(7);
    setNewOccasions([]);
    setNewMatches([]);
    setNewImageUrl("");
    setAnalysisError("");
    setAnalysisSuccess(false);
  };

  // Convert image file or URL into a base64 representation and call Gemini
  const triggerImageAnalysis = async (base64Str: string, originalUrl?: string) => {
    setIsAnalyzing(true);
    setAnalysisError("");
    setAnalysisSuccess(false);

    try {
      const response = await fetch("/api/wardrobe/analyze-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageBase64: base64Str,
          mimeType: "image/jpeg"
        })
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Analysis request failed.");
      }

      const data = await response.json();
      
      // Successfully analyzed! Map values to the form states
      if (data.category) {
        setNewCategory(data.category);
        setNewSubcategory(data.subcategory || "");
        setNewColor(data.color || "");
        setNewMaterial(data.material || "");
        setNewPattern(data.pattern || "Solid");
        setNewStyle(data.style || "Casual");
        setNewVersatility(data.versatilityScore || 7);
        setNewOccasions(data.occasions || []);
        setNewMatches(data.suggestedMatches || []);
        if (originalUrl) {
          setNewImageUrl(originalUrl);
        }
        setAnalysisSuccess(true);
      } else {
        throw new Error("Unable to parse clothing traits.");
      }
    } catch (err: any) {
      console.error(err);
      setAnalysisError(err.message || "Something went wrong during AI analysis. Please configure manually.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  // 1. Analyze an uploaded file
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setNewImageUrl(base64String); // Show preview using the base64 URI
      triggerImageAnalysis(base64String);
    };
    reader.readAsDataURL(file);
  };

  // 2. Analyze from Unsplash presets (Uses server proxy to download and base64-encode, or we can fetch directly & convert)
  const handlePresetSelect = async (presetUrl: string) => {
    setIsAnalyzing(true);
    setAnalysisError("");
    setNewImageUrl(presetUrl);

    try {
      // Convert URL to Base64 in frontend
      const res = await fetch(presetUrl);
      const blob = await res.blob();
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        triggerImageAnalysis(base64String, presetUrl);
      };
      reader.readAsDataURL(blob);
    } catch (err) {
      console.warn("Direct blob convert failed due to CORS, attempting server proxy / manual fallback", err);
      // Fallback: fetch standard properties simulated or fetch image base64 if needed.
      // Let's create an elegant helper or let them know they can test file uploads.
      setAnalysisError("Cross-origin image loading blocked. Please upload a local image file instead for full AI analysis.");
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-6" id="wardrobe-section">
      {/* Title Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-serif text-white italic tracking-tight">Your Wardrobe Closet</h2>
          <p className="text-xs text-white/40 mt-1">
            Analyze, catalog, and browse items you own. Re-use items sustainably.
          </p>
        </div>
        {!isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className="bg-gold-500 hover:bg-gold-400 text-black px-4 py-2 rounded-sm text-xs font-bold uppercase tracking-widest transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
            id="add-clothes-btn"
          >
            <Plus className="w-4 h-4 text-black stroke-[3px]" />
            Catalog New Item
          </button>
        )}
      </div>

      {/* Adding Panel (Form & AI Analyzer) */}
      {isAdding && (
        <div className="bg-dark-900 border border-white/10 rounded-sm shadow-md overflow-hidden p-6 space-y-6 animate-slide-up">
          <div className="flex justify-between items-center pb-4 border-b border-white/10">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-gold-500 animate-pulse" />
              <h3 className="font-serif italic text-lg font-medium text-gold-500">AI Visual Wardrobe Cataloger</h3>
            </div>
            <button
              onClick={resetForm}
              className="text-white/40 hover:text-white text-xs font-semibold tracking-wider uppercase transition-colors cursor-pointer"
            >
              Cancel Cataloging
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Visual AI Section (Left) */}
            <div className="lg:col-span-5 space-y-4">
              <span className="block text-[10px] font-bold uppercase tracking-widest text-gold-500 font-mono">
                Step 1: Upload or Choose a Preset
              </span>

              {/* Upload Dropzone */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border border-dashed border-white/10 hover:border-white/30 rounded-sm p-6 text-center cursor-pointer transition-colors space-y-2 bg-dark-850 flex flex-col items-center justify-center min-h-[160px]"
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept="image/*"
                  className="hidden"
                />
                <div className="p-2.5 bg-dark-800 rounded-full border border-white/5 text-white/70">
                  <Upload className="w-5 h-5 text-gold-500" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white">Click to upload your clothing image</p>
                  <p className="text-xs text-white/40 mt-1 font-mono">Supports PNG, JPG, JPEG up to 5MB</p>
                </div>
              </div>

              {/* OR Presets Selection */}
              <div className="space-y-2">
                <div className="flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5 text-gold-500/70" />
                  <p className="text-xs font-semibold text-white/50">Quick Test: Click a preset style to let Gemini analyze it</p>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {PRESET_CLOTHES.map((preset) => (
                    <button
                      type="button"
                      key={preset.name}
                      onClick={() => handlePresetSelect(preset.url)}
                      disabled={isAnalyzing}
                      className="group flex gap-2 items-center text-left bg-dark-850 hover:bg-dark-800 p-2 rounded-sm border border-white/5 transition-all text-xs disabled:opacity-50 cursor-pointer"
                    >
                      <img
                        src={preset.url}
                        alt={preset.name}
                        className="w-10 h-10 object-cover rounded-sm flex-shrink-0"
                        referrerPolicy="no-referrer"
                      />
                      <div className="overflow-hidden">
                        <p className="font-semibold text-white/80 truncate group-hover:text-gold-500">{preset.name}</p>
                        <p className="text-white/40 truncate text-[10px]">{preset.description}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Status & Feedback */}
              {isAnalyzing && (
                <div className="bg-gold-500/10 text-gold-400 text-xs px-4 py-3 border border-gold-500/20 rounded-sm flex items-center gap-2 animate-pulse">
                  <Sparkles className="w-4 h-4 text-gold-500 animate-spin" />
                  <div>
                    <p className="font-bold uppercase tracking-wider text-[10px] font-mono text-gold-500">AI Fashion Analyst is working...</p>
                    <p className="text-white/70 mt-0.5">Detecting fabric weave, material blend, style scores, and matching color schemes.</p>
                  </div>
                </div>
              )}

              {analysisError && (
                <div className="bg-red-500/10 text-red-400 text-xs px-4 py-3 border border-red-500/20 rounded-sm flex gap-2">
                  <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                  <div>
                    <p className="font-bold uppercase tracking-wider text-[10px] font-mono text-red-400">AI Assistant warning</p>
                    <p className="text-white/70 mt-0.5">{analysisError}</p>
                  </div>
                </div>
              )}

              {analysisSuccess && (
                <div className="bg-emerald-500/10 text-emerald-400 text-xs px-4 py-3 border border-emerald-500/20 rounded-sm flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  <div>
                    <p className="font-bold uppercase tracking-wider text-[10px] font-mono text-emerald-400">AI Traits detected successfully!</p>
                    <p className="text-white/70 mt-0.5">Gemini filled in the form. Review the details on the right and click "Confirm".</p>
                  </div>
                </div>
              )}

              {/* Preview image if available */}
              {newImageUrl && (
                <div className="space-y-1.5 border border-white/10 rounded-sm overflow-hidden p-2 bg-dark-850">
                  <span className="block text-[10px] uppercase tracking-wider font-semibold text-white/40 px-1">Selected Piece Preview</span>
                  <img
                    src={newImageUrl}
                    alt="Clothing Item Preview"
                    className="w-full h-56 object-cover rounded-sm border border-white/5"
                    referrerPolicy="no-referrer"
                  />
                </div>
              )}
            </div>

            {/* Manual Confirmation Form (Right) */}
            <form onSubmit={handleManualSubmit} className="lg:col-span-7 space-y-4">
              <span className="block text-[10px] font-bold uppercase tracking-widest text-gold-500 font-mono">
                Step 2: Confirm Clothing Specifications
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Category Selection */}
                <div>
                  <label className="block text-xs text-white/60 mb-1 font-semibold">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as WardrobeCategory)}
                    className="w-full bg-dark-850 border border-white/10 rounded-sm px-3 py-1.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-gold-500 focus:border-gold-500 cursor-pointer"
                  >
                    {categories.filter(c => c !== "All").map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                {/* Subcategory */}
                <div>
                  <label className="block text-xs text-white/60 mb-1 font-semibold">Item Subcategory Name</label>
                  <input
                    type="text"
                    value={newSubcategory}
                    onChange={(e) => setNewSubcategory(e.target.value)}
                    placeholder="e.g. Linen Blouse, Denim Jacket"
                    required
                    className="w-full bg-dark-850 border border-white/10 rounded-sm px-3 py-1.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-gold-500 focus:border-gold-500"
                  />
                </div>

                {/* Dominant Color */}
                <div>
                  <label className="block text-xs text-white/60 mb-1 font-semibold">Dominant Color</label>
                  <input
                    type="text"
                    value={newColor}
                    onChange={(e) => setNewColor(e.target.value)}
                    placeholder="e.g. Navy Blue, Olive Green"
                    required
                    className="w-full bg-dark-850 border border-white/10 rounded-sm px-3 py-1.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-gold-500 focus:border-gold-500"
                  />
                </div>

                {/* Material */}
                <div>
                  <label className="block text-xs text-white/60 mb-1 font-semibold">Fabric / Material</label>
                  <input
                    type="text"
                    value={newMaterial}
                    onChange={(e) => setNewMaterial(e.target.value)}
                    placeholder="e.g. 100% Cotton, Thick Silk, Wool Blend"
                    required
                    className="w-full bg-dark-850 border border-white/10 rounded-sm px-3 py-1.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-gold-500 focus:border-gold-500"
                  />
                </div>

                {/* Pattern */}
                <div>
                  <label className="block text-xs text-white/60 mb-1 font-semibold">Pattern</label>
                  <input
                    type="text"
                    value={newPattern}
                    onChange={(e) => setNewPattern(e.target.value)}
                    placeholder="e.g. Solid, Striped, Plaid, Floral"
                    className="w-full bg-dark-850 border border-white/10 rounded-sm px-3 py-1.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-gold-500 focus:border-gold-500"
                  />
                </div>

                {/* Default Style */}
                <div>
                  <label className="block text-xs text-white/60 mb-1 font-semibold">Fashion Style Vibe</label>
                  <input
                    type="text"
                    value={newStyle}
                    onChange={(e) => setNewStyle(e.target.value)}
                    placeholder="e.g. Minimalist, Vintage, Streetwear"
                    className="w-full bg-dark-850 border border-white/10 rounded-sm px-3 py-1.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-gold-500 focus:border-gold-500"
                  />
                </div>

                {/* Versatility rating */}
                <div className="sm:col-span-2">
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-xs text-white/60 font-semibold">Versatility Rating (1-10)</label>
                    <span className="text-xs font-bold text-gold-500">{newVersatility}/10</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={newVersatility}
                    onChange={(e) => setNewVersatility(Number(e.target.value))}
                    className="w-full h-1 bg-white/10 rounded-sm appearance-none cursor-pointer accent-gold-500"
                  />
                  <span className="block text-[10px] text-white/40 mt-1.5">10 means matches almost anything, 1 means highly specific single use.</span>
                </div>
              </div>

              {/* Occasions Tag Editor */}
              <div className="space-y-1.5">
                <label className="block text-xs text-white/60 font-semibold">Occasions (Suitable for)</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={tempOccasion}
                    onChange={(e) => setTempOccasion(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addOccasionTag())}
                    placeholder="Add e.g. College, Office, Date"
                    className="flex-1 bg-dark-850 border border-white/10 rounded-sm px-3 py-1.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-gold-500"
                  />
                  <button
                    type="button"
                    onClick={addOccasionTag}
                    className="bg-dark-800 border border-white/10 rounded-sm px-3 text-sm font-medium text-white hover:bg-dark-750 cursor-pointer"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-1">
                  {newOccasions.map((o) => (
                    <span key={o} className="bg-dark-800 text-white text-[11px] font-medium px-2 py-0.5 rounded-sm border border-white/10 flex items-center gap-1">
                      {o}
                      <button type="button" onClick={() => setNewOccasions(newOccasions.filter((occ) => occ !== o))} className="text-white/40 hover:text-white">×</button>
                    </span>
                  ))}
                  {newOccasions.length === 0 && <span className="text-xs text-white/40 italic">At least 1 occasion is recommended.</span>}
                </div>
              </div>

              {/* Matching Suggested items */}
              <div className="space-y-1.5">
                <label className="block text-xs text-white/60 font-semibold">Pairing Suggestions (Suggest matching items)</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={tempMatch}
                    onChange={(e) => setTempMatch(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addMatchTag())}
                    placeholder="Add e.g. White linen shirt, Chelsea boots"
                    className="flex-1 bg-dark-850 border border-white/10 rounded-sm px-3 py-1.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-gold-500"
                  />
                  <button
                    type="button"
                    onClick={addMatchTag}
                    className="bg-dark-800 border border-white/10 rounded-sm px-3 text-sm font-medium text-white hover:bg-dark-750 cursor-pointer"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-1">
                  {newMatches.map((m) => (
                    <span key={m} className="bg-dark-800 text-white text-[11px] px-2 py-0.5 rounded-sm border border-white/10 flex items-center gap-1">
                      {m}
                      <button type="button" onClick={() => setNewMatches(newMatches.filter((match) => match !== m))} className="text-white/40 hover:text-white">×</button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 border border-white/10 hover:bg-white/5 text-white/80 text-sm font-medium rounded-sm transition-colors cursor-pointer"
                >
                  Clear Details
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#C5A059] hover:bg-[#D4B570] text-black font-bold uppercase text-xs tracking-widest rounded-sm shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
                  id="confirm-catalog-btn"
                >
                  <CheckCircle className="w-4 h-4 text-black stroke-[3px]" />
                  Confirm and Catalog
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Grid Filtering Tabs */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between bg-dark-900 border border-white/10 rounded-sm p-4 shadow-md" id="wardrobe-filters">
        {/* Category Selector */}
        <div className="flex flex-wrap gap-1 max-w-full overflow-x-auto">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveTab(cat)}
              className={`px-3 py-1.5 rounded-sm text-xs font-semibold tracking-widest uppercase transition-all cursor-pointer ${
                activeTab === cat
                  ? "bg-gold-500 text-black font-bold font-serif italic shadow-sm"
                  : "text-white/40 hover:bg-white/5 hover:text-white"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-white/30" />
          <input
            type="text"
            placeholder="Search color, material..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-dark-850 border border-white/10 rounded-sm pl-9 pr-4 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-gold-500 focus:bg-dark-800 transition-all"
          />
        </div>
      </div>

      {/* Wardrobe Items Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6" id="wardrobe-items-grid">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            className="bg-dark-900 border border-white/5 rounded-sm overflow-hidden shadow-md hover:shadow-lg hover:border-white/10 transition-all group flex flex-col h-full"
            id={`item-${item.id}`}
          >
            {/* Image Frame */}
            <div className="relative aspect-[4/5] bg-dark-950 overflow-hidden flex items-center justify-center border-b border-white/5">
              {item.imageUrl ? (
                <img
                  src={item.imageUrl}
                  alt={item.subcategory}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="flex flex-col items-center justify-center text-white/20">
                  <ImageIcon className="w-8 h-8 mb-1 opacity-50" />
                  <span className="text-[10px] uppercase font-mono">No visual asset</span>
                </div>
              )}
              {/* Category Badge */}
              <span className="absolute top-3 left-3 bg-dark-950/95 backdrop-blur-md text-[10px] font-bold text-gold-500 uppercase tracking-widest px-2 py-0.5 rounded-sm shadow-md border border-white/10">
                {item.category}
              </span>
              {/* Delete Button */}
              <button
                onClick={() => onRemoveItem(item.id)}
                className="absolute top-3 right-3 p-1.5 bg-dark-950/95 border border-white/10 hover:bg-red-500/20 hover:text-red-400 text-white/50 rounded-full shadow-md transition-all hover:scale-110 cursor-pointer"
                title="Remove Item"
                id={`delete-btn-${item.id}`}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Content Details */}
            <div className="p-4 flex-1 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start">
                  <h4 className="font-serif italic text-sm font-medium text-white leading-tight group-hover:text-gold-500 transition-colors">
                    {item.subcategory}
                  </h4>
                  <div className="bg-gold-500/10 text-gold-400 text-[10px] font-bold px-1.5 py-0.5 rounded-sm border border-gold-500/20 flex items-center gap-0.5 font-mono" title="Versatility Rating">
                    V: {item.versatilityScore}
                  </div>
                </div>

                {/* Sub specifications list */}
                <div className="grid grid-cols-2 gap-y-1 gap-x-2 mt-2.5 text-[11px] text-white/50 border-t border-white/10 pt-2.5">
                  <div>
                    <span className="text-white/30">Color:</span> <strong className="text-white/80 truncate block font-normal">{item.color}</strong>
                  </div>
                  <div>
                    <span className="text-white/30">Pattern:</span> <strong className="text-white/80 truncate block font-normal">{item.pattern}</strong>
                  </div>
                  <div className="col-span-2">
                    <span className="text-white/30">Fabric:</span> <strong className="text-white/80 truncate block font-normal">{item.material}</strong>
                  </div>
                </div>

                {/* Occasions list */}
                {item.occasions && item.occasions.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-3">
                    {item.occasions.slice(0, 3).map((occ) => (
                      <span
                        key={occ}
                        className="text-[9px] font-semibold tracking-wider uppercase px-1.5 py-0.5 bg-dark-800 text-white/70 rounded-sm border border-white/5 font-mono"
                      >
                        {occ}
                      </span>
                    ))}
                    {item.occasions.length > 3 && (
                      <span className="text-[9px] text-white/40 font-bold px-1 font-mono">+ {item.occasions.length - 3}</span>
                    )}
                  </div>
                )}
              </div>

              {/* Matches list summary */}
              {item.suggestedMatches && item.suggestedMatches.length > 0 && (
                <div className="mt-3.5 pt-2.5 border-t border-white/5 text-[10px] text-white/40 bg-dark-850/40 -mx-4 -mb-4 p-3 rounded-b-sm">
                  <span className="font-bold text-gold-500 text-[9px] uppercase tracking-widest block mb-1">Stylist matches:</span>
                  <p className="text-white/70 italic truncate">Pairs with {item.suggestedMatches.join(", ")}</p>
                </div>
              )}
            </div>
          </div>
        ))}

        {filteredItems.length === 0 && (
          <div className="col-span-full py-16 text-center border border-dashed border-white/10 rounded-sm bg-dark-900">
            <ImageIcon className="w-10 h-10 text-white/20 mx-auto mb-2" />
            <h4 className="text-sm font-serif italic text-white">No clothes cataloged in this filter</h4>
            <p className="text-xs text-white/40 mt-1 max-w-sm mx-auto">
              We couldn't find items matching "{searchQuery}" in Category "{activeTab}". Try adding one or selecting "All".
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
