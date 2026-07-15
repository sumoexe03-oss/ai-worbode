import React, { useState } from "react";
import { WardrobeItem, UserProfile, GeneratedOutfit, ShoppingRecommendation, WornOutfit } from "../types";
import { FASHION_OCCASIONS, WEATHER_PRESETS } from "../data";
import { Sparkles, Sun, CloudRain, Star, Compass, ShoppingBag, Leaf, HelpCircle, Heart, Flame, AlertCircle, Calendar, Trash2, CheckCircle, Clock, AlertTriangle } from "lucide-react";

interface OutfitGeneratorProps {
  inventory: WardrobeItem[];
  profile: UserProfile;
}

export default function OutfitGenerator({
  inventory,
  profile
}: OutfitGeneratorProps) {
  const [occasion, setOccasion] = useState(FASHION_OCCASIONS[0]);
  const [weatherInput, setWeatherInput] = useState(WEATHER_PRESETS[0].val);
  const [timeOfDay, setTimeOfDay] = useState("Afternoon");
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [outfits, setOutfits] = useState<GeneratedOutfit[]>([]);
  const [shopping, setShopping] = useState<ShoppingRecommendation | null>(null);

  // Recently Worn Outfit History State
  const [recentlyWorn, setRecentlyWorn] = useState<WornOutfit[]>(() => {
    const saved = localStorage.getItem("ai-wardrobe-recently-worn");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to parse recently worn history", e);
      }
    }
    return [];
  });

  const handleLogOutfit = (outfit: GeneratedOutfit) => {
    const newRecord: WornOutfit = {
      id: `worn-${Date.now()}`,
      wornDate: new Date().toISOString(),
      name: outfit.name,
      top: outfit.top,
      bottom: outfit.bottom,
      outerwear: outfit.outerwear || "None",
      footwear: outfit.footwear,
      accessories: outfit.accessories || [],
      occasion: occasion
    };
    const updated = [newRecord, ...recentlyWorn];
    setRecentlyWorn(updated);
    localStorage.setItem("ai-wardrobe-recently-worn", JSON.stringify(updated));
  };

  const handleDeleteRecord = (id: string) => {
    const updated = recentlyWorn.filter((r) => r.id !== id);
    setRecentlyWorn(updated);
    localStorage.setItem("ai-wardrobe-recently-worn", JSON.stringify(updated));
  };

  const handleClearHistory = () => {
    if (window.confirm("Are you sure you want to clear your entire worn outfit history?")) {
      setRecentlyWorn([]);
      localStorage.removeItem("ai-wardrobe-recently-worn");
    }
  };

  const isSameItem = (a: string, b: string) => {
    if (!a || !b) return false;
    return a.trim().toLowerCase() === b.trim().toLowerCase();
  };

  const isAlreadyLogged = (outfit: GeneratedOutfit) => {
    const todayStr = new Date().toISOString().split("T")[0];
    return recentlyWorn.some(
      (r) =>
        isSameItem(r.top, outfit.top) &&
        isSameItem(r.bottom, outfit.bottom) &&
        isSameItem(r.outerwear, outfit.outerwear) &&
        isSameItem(r.footwear, outfit.footwear) &&
        r.wornDate.startsWith(todayStr)
    );
  };

  const getLastWornDaysAgo = (itemName: string): number | null => {
    if (!itemName || itemName === "None") return null;
    const matches = recentlyWorn.filter(
      (wo) =>
        isSameItem(wo.top, itemName) ||
        isSameItem(wo.bottom, itemName) ||
        isSameItem(wo.outerwear, itemName) ||
        isSameItem(wo.footwear, itemName)
    );
    if (matches.length === 0) return null;
    
    const timestamps = matches.map((m) => new Date(m.wornDate).getTime());
    const latestTime = Math.max(...timestamps);
    const diffTime = Date.now() - latestTime;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getCombinationLastWornDaysAgo = (top: string, bottom: string): number | null => {
    if (!top || !bottom) return null;
    const matches = recentlyWorn.filter(
      (wo) => isSameItem(wo.top, top) && isSameItem(wo.bottom, bottom)
    );
    if (matches.length === 0) return null;

    const timestamps = matches.map((m) => new Date(m.wornDate).getTime());
    const latestTime = Math.max(...timestamps);
    const diffTime = Date.now() - latestTime;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const formatLastWorn = (days: number): string => {
    if (days === 0) return "today";
    if (days === 1) return "yesterday";
    return `${days}d ago`;
  };

  // Loading statements to show in sequential fade
  const [loadingStep, setLoadingStep] = useState(0);

  const startLoadingStatements = () => {
    setLoadingStep(0);
    const intervals = [
      setTimeout(() => setLoadingStep(1), 1500),
      setTimeout(() => setLoadingStep(2), 3000),
      setTimeout(() => setLoadingStep(3), 4500)
    ];
    return () => intervals.forEach(clearTimeout);
  };

  const handleGenerate = async () => {
    setIsLoading(true);
    setError("");
    setOutfits([]);
    setShopping(null);
    const stopLoadingSeq = startLoadingStatements();

    try {
      const response = await fetch("/api/wardrobe/generate-outfits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          inventory,
          weather: weatherInput,
          occasion,
          timeOfDay,
          profile
        })
      });

      if (!response.ok) {
        throw new Error("Failed to receive tailored suggestions. Please verify server state.");
      }

      const data = await response.json();
      if (data.outfits) {
        setOutfits(data.outfits);
        setShopping(data.shoppingRecommendation || { needed: false, item: "", reason: "", estimatedPrice: "" });
      } else {
        throw new Error("No combination suggestions returned.");
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to generate styling suggestions.");
    } finally {
      setIsLoading(false);
      stopLoadingSeq();
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8" id="generator-section">
      {/* Left Column: Style Parameters & Recently Worn History */}
      <div className="lg:col-span-4 space-y-6 flex flex-col h-fit">
        {/* Parameters Panel */}
        <div className="bg-dark-900 border border-white/10 rounded-sm p-6 shadow-md space-y-6">
        <div>
          <h3 className="font-serif text-lg font-medium text-white flex items-center gap-2 italic">
            <Compass className="w-5 h-5 text-gold-500" />
            Style Scenario
          </h3>
          <p className="text-xs text-white/40 mt-1">Specify environmental conditions to optimize layering and styles.</p>
        </div>

        <div className="space-y-4">
          {/* Occasion */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-white/60 mb-2 font-mono">Target Occasion</label>
            <select
              value={occasion}
              onChange={(e) => setOccasion(e.target.value)}
              className="w-full bg-dark-850 border border-white/10 rounded-sm px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-gold-500 focus:border-gold-500 transition-all cursor-pointer"
            >
              {FASHION_OCCASIONS.map((occ) => (
                <option key={occ} value={occ}>{occ}</option>
              ))}
            </select>
          </div>

          {/* Weather Options */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-white/60 mb-2 font-mono">Current Weather Preset</label>
            <div className="grid grid-cols-1 gap-2 mb-2">
              {WEATHER_PRESETS.map((p) => (
                <button
                  key={p.label}
                  type="button"
                  onClick={() => setWeatherInput(p.val)}
                  className={`text-left px-3 py-2 text-xs rounded-sm border transition-all flex justify-between items-center cursor-pointer ${
                    weatherInput === p.val
                      ? "bg-gold-500 text-black border-gold-500 font-bold font-serif italic shadow-sm"
                      : "bg-dark-850 text-white/70 border-white/5 hover:bg-dark-800 hover:text-white"
                  }`}
                >
                  <span>{p.label}</span>
                  {p.label.includes("☀️") && <Sun className="w-3.5 h-3.5" />}
                  {p.label.includes("🌧️") && <CloudRain className="w-3.5 h-3.5" />}
                </button>
              ))}
            </div>
            
            {/* Custom weather fallback input */}
            <div className="mt-2.5">
              <label className="block text-[10px] font-semibold text-white/40 uppercase tracking-wide mb-1 font-mono">Or Describe Weather Customly</label>
              <input
                type="text"
                value={weatherInput}
                onChange={(e) => setWeatherInput(e.target.value)}
                placeholder="e.g. Rainy, humid wind, 18°C"
                className="w-full bg-dark-850 border border-white/10 rounded-sm px-3 py-1.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-gold-500"
              />
            </div>
          </div>

          {/* Time of Day */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-white/60 mb-2 font-mono">Time of Day</label>
            <div className="grid grid-cols-4 gap-1.5">
              {["Morning", "Afternoon", "Evening", "Night"].map((t) => (
                <button
                  type="button"
                  key={t}
                  onClick={() => setTimeOfDay(t)}
                  className={`px-1 py-2 text-xs rounded-sm border text-center font-semibold transition-all cursor-pointer ${
                    timeOfDay === t
                      ? "bg-gold-500 text-black border-gold-500 font-bold font-serif italic"
                      : "bg-dark-850 text-white/70 border-white/5 hover:bg-dark-800 hover:text-white"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Generate Button */}
          <button
            onClick={handleGenerate}
            disabled={isLoading}
            className="w-full bg-gold-500 hover:bg-gold-400 disabled:bg-white/10 disabled:text-white/30 text-black py-3 rounded-sm text-xs font-bold uppercase tracking-widest transition-all shadow-md flex items-center justify-center gap-2 mt-4 cursor-pointer disabled:cursor-not-allowed"
            id="style-me-btn"
          >
            <Sparkles className="w-4.5 h-4.5 text-black stroke-[3px] animate-pulse" />
            Style Me with AI!
          </button>
        </div>
      </div>
        
      {/* Recently Worn Log Widget */}
      <div className="bg-dark-900 border border-white/10 rounded-sm p-6 shadow-md space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-serif text-base font-medium text-white flex items-center gap-2 italic">
              <Clock className="w-4.5 h-4.5 text-gold-500" />
              Recently Worn Log
            </h3>
            {recentlyWorn.length > 0 && (
              <button
                onClick={handleClearHistory}
                className="text-[10px] text-red-400 hover:text-red-300 transition-colors uppercase tracking-wider font-bold cursor-pointer font-mono"
              >
                Clear
              </button>
            )}
          </div>
          <p className="text-xs text-white/40 leading-relaxed">
            Track logged outfits to maintain a fresh rotation and prevent styling repetition.
          </p>

          {recentlyWorn.length === 0 ? (
            <div className="border border-white/5 bg-dark-850 p-6 rounded-sm text-center flex flex-col items-center justify-center space-y-2">
              <Calendar className="w-8 h-8 text-white/10" />
              <p className="text-xs text-white/50 font-medium">No outfits logged yet</p>
              <p className="text-[10px] text-white/30 leading-relaxed max-w-[200px]">
                Click "Log as Worn" on any recommended outfit to track your styles.
              </p>
            </div>
          ) : (
            <div className="max-h-[380px] overflow-y-auto pr-1 space-y-3 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
              {recentlyWorn.map((item) => (
                <div
                  key={item.id}
                  className="bg-dark-850 border border-white/5 hover:border-white/10 p-3 rounded-sm text-xs relative group transition-all"
                >
                  {/* Delete Button */}
                  <button
                    onClick={() => handleDeleteRecord(item.id)}
                    className="absolute top-2.5 right-2.5 text-white/20 hover:text-red-400 p-1 rounded-sm transition-colors cursor-pointer"
                    title="Remove record"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>

                  <div className="space-y-1.5 pr-6">
                    <div className="flex flex-wrap items-center gap-x-1.5">
                      <span className="text-[10px] text-gold-500 font-mono font-bold tracking-wider">
                        {new Date(item.wornDate).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit"
                        })}
                      </span>
                      <span className="text-[9px] text-white/30 font-mono uppercase">
                        • {item.occasion}
                      </span>
                    </div>

                    <h4 className="font-serif italic font-medium text-white text-xs">
                      {item.name}
                    </h4>

                    {/* Wardrobe Items Representation */}
                    <div className="space-y-1 mt-1 pt-1.5 border-t border-white/5 text-[11px] text-white/60">
                      <div className="flex items-center gap-1.5 truncate">
                        <span className="text-white/30 font-mono text-[9px] w-10 flex-shrink-0">Top:</span>
                        <span className="text-white/80 truncate font-mono text-[10px]">{item.top}</span>
                      </div>
                      <div className="flex items-center gap-1.5 truncate">
                        <span className="text-white/30 font-mono text-[9px] w-10 flex-shrink-0">Bottom:</span>
                        <span className="text-white/80 truncate font-mono text-[10px]">{item.bottom}</span>
                      </div>
                      {item.outerwear && item.outerwear !== "None" && (
                        <div className="flex items-center gap-1.5 truncate">
                          <span className="text-white/30 font-mono text-[9px] w-10 flex-shrink-0">Outer:</span>
                          <span className="text-white/80 truncate font-mono text-[10px]">{item.outerwear}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1.5 truncate">
                        <span className="text-white/30 font-mono text-[9px] w-10 flex-shrink-0">Shoes:</span>
                        <span className="text-white/80 truncate font-mono text-[10px]">{item.footwear}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recommendations Results (Right) */}
      <div className="lg:col-span-8 space-y-6">
        {/* Default State */}
        {!isLoading && outfits.length === 0 && !error && (
          <div className="bg-dark-900 border border-white/10 rounded-sm p-12 text-center flex flex-col items-center justify-center min-h-[400px]">
            <Sparkles className="w-12 h-12 text-white/20 mb-3" />
            <h3 className="font-serif text-lg font-medium text-white italic">Your AI stylist is ready</h3>
            <p className="text-xs text-white/40 max-w-md mt-1 leading-relaxed">
              Select your target occasion, set the weather forecast, and click **"Style Me with AI"**.
              We will build highly sustainable, tailored styling matching your existing items first.
            </p>
          </div>
        )}

        {/* Loading Screen */}
        {isLoading && (
          <div className="bg-dark-900 border border-white/10 rounded-sm p-12 text-center flex flex-col items-center justify-center min-h-[400px] space-y-6">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-white/5 border-t-gold-500 rounded-full animate-spin"></div>
              <Sparkles className="w-6 h-6 text-gold-500 absolute inset-0 m-auto animate-pulse" />
            </div>
            
            <div className="space-y-2 max-w-sm">
              <h4 className="font-serif text-base font-semibold text-white italic">Curating Bespoke Outfits</h4>
              <div className="h-6 overflow-hidden relative">
                {loadingStep === 0 && (
                  <p className="text-xs text-white/50 animate-fade-in absolute inset-x-0 font-mono">Analyzing your {inventory.length} closet items...</p>
                )}
                {loadingStep === 1 && (
                  <p className="text-xs text-white/50 animate-fade-in absolute inset-x-0 font-mono">Filtering palettes matching "{profile.skinTone}"...</p>
                )}
                {loadingStep === 2 && (
                  <p className="text-xs text-white/50 animate-fade-in absolute inset-x-0 font-mono">Configuring thermal layers for "{weatherInput}"...</p>
                )}
                {loadingStep === 3 && (
                  <p className="text-xs text-white/50 animate-fade-in absolute inset-x-0 font-mono">Polishing accessories and footwear matches...</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 rounded-sm p-8 flex gap-3">
            <AlertCircle className="w-6 h-6 text-red-400 flex-shrink-0" />
            <div>
              <h4 className="text-sm font-semibold text-white">Styling Generation Failed</h4>
              <p className="text-xs text-white/70 mt-1">{error}</p>
              <button
                onClick={handleGenerate}
                className="mt-3 bg-red-500/20 hover:bg-red-500/30 text-red-200 border border-red-500/30 rounded-sm px-4 py-1.5 text-xs font-semibold transition-colors cursor-pointer"
              >
                Try Again
              </button>
            </div>
          </div>
        )}

        {/* Successful Outfits Output */}
        {outfits.length > 0 && (
          <div className="space-y-6 animate-fade-in" id="outfits-container">
            {/* Top Info Banner */}
            <div className="bg-dark-900 text-white border border-white/10 rounded-sm p-4 flex justify-between items-center shadow-sm">
              <div>
                <p className="text-[10px] uppercase tracking-widest text-gold-500 font-bold font-mono">Bespoke Curation</p>
                <h4 className="font-serif text-base font-semibold italic mt-0.5">{occasion} Outfit Options</h4>
              </div>
              <span className="text-[10px] bg-dark-950/80 px-2.5 py-1 rounded-sm border border-white/10 font-bold text-gold-500 tracking-wider uppercase font-mono">
                Weather: {weatherInput.split("(")[0]}
              </span>
            </div>

            {/* Outfits List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {outfits.map((outfit, idx) => {
                const comboWornDays = getCombinationLastWornDaysAgo(outfit.top, outfit.bottom);
                const isComboWorn = comboWornDays !== null;
                const topWornDays = getLastWornDaysAgo(outfit.top);
                const bottomWornDays = getLastWornDaysAgo(outfit.bottom);
                const outerWornDays = outfit.outerwear ? getLastWornDaysAgo(outfit.outerwear) : null;
                const shoesWornDays = getLastWornDaysAgo(outfit.footwear);

                return (
                  <div
                    key={outfit.name}
                    className="bg-dark-900 border border-white/5 rounded-sm overflow-hidden p-6 flex flex-col justify-between shadow-md hover:border-white/10 transition-all"
                  >
                    <div className="space-y-4">
                      {/* Outfit Title & Capsule Status */}
                      <div className="flex justify-between items-start gap-2">
                        <div>
                          <span className="text-[10px] font-bold text-white/40 font-mono">STYLE #{idx + 1}</span>
                          <h5 className="font-serif italic font-medium text-base text-white mt-0.5">{outfit.name}</h5>
                        </div>
                        <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                          {outfit.isCapsuleApproved && (
                            <span className="bg-emerald-500/10 text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded-sm border border-emerald-500/20 flex items-center gap-0.5 font-mono">
                              <Leaf className="w-3 h-3 text-emerald-400" />
                              Capsule approved
                            </span>
                          )}
                          {isComboWorn && (
                            <span className="bg-amber-500/15 text-amber-400 text-[9px] font-bold px-2 py-0.5 rounded-sm border border-amber-500/20 flex items-center gap-0.5 font-mono">
                              <AlertTriangle className="w-3 h-3 text-amber-400" />
                              Combo repeated ({formatLastWorn(comboWornDays!)})
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Wardrobe Items checklist representation */}
                      <div className="space-y-2 border-y border-white/10 py-3 text-xs">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 bg-white/30 rounded-full"></span>
                            <span className="text-white/40 font-medium w-16">Top:</span>
                            <span className="text-white/80">{outfit.top}</span>
                          </div>
                          {topWornDays !== null && (
                            <span className="text-[9px] text-amber-400 font-mono bg-amber-500/10 px-1.5 py-0.5 rounded-sm border border-amber-500/10 flex-shrink-0">
                              Worn {formatLastWorn(topWornDays!)}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 bg-white/30 rounded-full"></span>
                            <span className="text-white/40 font-medium w-16">Bottom:</span>
                            <span className="text-white/80">{outfit.bottom}</span>
                          </div>
                          {bottomWornDays !== null && (
                            <span className="text-[9px] text-amber-400 font-mono bg-amber-500/10 px-1.5 py-0.5 rounded-sm border border-amber-500/10 flex-shrink-0">
                              Worn {formatLastWorn(bottomWornDays!)}
                            </span>
                          )}
                        </div>

                        {outfit.outerwear && outfit.outerwear !== "None" && (
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <span className="w-1.5 h-1.5 bg-gold-500 rounded-full"></span>
                              <span className="text-white/40 font-medium w-16">Outer:</span>
                              <span className="text-white/80 font-medium">{outfit.outerwear}</span>
                            </div>
                            {outerWornDays !== null && (
                              <span className="text-[9px] text-amber-400 font-mono bg-amber-500/10 px-1.5 py-0.5 rounded-sm border border-amber-500/10 flex-shrink-0">
                                Worn {formatLastWorn(outerWornDays!)}
                              </span>
                            )}
                          </div>
                        )}

                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 bg-white/30 rounded-full"></span>
                            <span className="text-white/40 font-medium w-16">Footwear:</span>
                            <span className="text-white/80">{outfit.footwear}</span>
                          </div>
                          {shoesWornDays !== null && (
                            <span className="text-[9px] text-amber-400 font-mono bg-amber-500/10 px-1.5 py-0.5 rounded-sm border border-amber-500/10 flex-shrink-0">
                              Worn {formatLastWorn(shoesWornDays!)}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Accessories pill badges */}
                      {outfit.accessories && outfit.accessories.length > 0 && (
                        <div className="space-y-1.5">
                          <span className="text-[10px] font-semibold text-white/40 uppercase tracking-wide block">Accessorizing</span>
                          <div className="flex flex-wrap gap-1">
                            {outfit.accessories.map((acc) => (
                              <span key={acc} className="text-[9px] bg-dark-800 text-white/70 px-2.5 py-0.5 rounded-sm border border-white/5 font-mono">
                                {acc}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Stylist explanation */}
                      <div className="space-y-1.5">
                        <span className="text-[10px] font-semibold text-white/40 uppercase tracking-wide block">Stylist Reason</span>
                        <p className="text-xs text-white/70 leading-relaxed italic">"{outfit.stylingReason}"</p>
                      </div>
                    </div>

                    {/* Ratings & Suitability */}
                    <div className="mt-5 pt-3 border-t border-white/10 space-y-3">
                      <div className="flex justify-between text-xs">
                        <span className="text-white/40">Weather suitability:</span>
                        <span className="text-white/80 font-medium text-right">{outfit.suitability}</span>
                      </div>

                      <div className="flex items-center gap-4 bg-dark-950 p-2.5 rounded-sm border border-white/5">
                        <div className="flex-1 flex justify-between items-center text-xs">
                          <span className="text-white/40 flex items-center gap-1">
                            <Flame className="w-3.5 h-3.5 text-gold-500" /> Style
                          </span>
                          <span className="font-bold text-gold-500 font-mono">{outfit.styleScore}/10</span>
                        </div>
                        <div className="w-px h-6 bg-white/10"></div>
                        <div className="flex-1 flex justify-between items-center text-xs">
                          <span className="text-white/40 flex items-center gap-1">
                            <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500" /> Comfort
                          </span>
                          <span className="font-bold text-gold-500 font-mono">{outfit.comfortScore}/10</span>
                        </div>
                      </div>

                      {/* Log as Worn Action Button */}
                      <button
                        onClick={() => handleLogOutfit(outfit)}
                        disabled={isAlreadyLogged(outfit)}
                        className={`w-full mt-2 py-2.5 px-3 rounded-sm text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:cursor-not-allowed ${
                          isAlreadyLogged(outfit)
                            ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20"
                            : "bg-gold-500 hover:bg-gold-400 text-black border border-transparent shadow-md"
                        }`}
                      >
                        {isAlreadyLogged(outfit) ? (
                          <>
                            <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                            Logged as Worn!
                          </>
                        ) : (
                          <>
                            <Calendar className="w-3.5 h-3.5 text-black" />
                            Log as Worn Today
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Smart Shopping Section (Sustainability Goal) */}
            {shopping && (
              <div className="bg-dark-900 border border-gold-500/10 rounded-sm p-6 shadow-md flex flex-col sm:flex-row items-start gap-4">
                <div className="p-3 bg-dark-950 rounded-sm border border-white/10 text-gold-500 flex-shrink-0">
                  <ShoppingBag className="w-6 h-6" />
                </div>
                
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h5 className="font-serif font-semibold text-base text-white italic">AI Sustainable Shopping Verdict</h5>
                    {!shopping.needed ? (
                      <span className="bg-emerald-500/10 text-emerald-400 text-[9px] font-bold px-2 py-0.5 rounded-sm border border-emerald-500/20">
                        Zero Spending Needed! 🌿
                      </span>
                    ) : (
                      <span className="bg-gold-500/10 text-gold-400 text-[9px] font-bold px-2 py-0.5 rounded-sm border border-gold-500/20">
                        Capsule Missing Link
                      </span>
                    )}
                  </div>

                  {!shopping.needed ? (
                    <p className="text-xs text-white/70 leading-relaxed">
                      Your current wardrobe fully meets your styling needs for a **{occasion}**! No new clothing purchases are recommended. We love seeing you style creatively with what you already own. Keep rocking your capsule wardrobe.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      <p className="text-xs text-white/70 leading-relaxed">
                        To unlock maximum outfits, we recommend buying exactly **ONE** highly versatile piece:
                      </p>
                      <div className="bg-dark-950 p-3 rounded-sm border border-white/5 space-y-1 text-xs">
                        <p className="font-bold text-gold-500 font-serif italic text-sm">{shopping.item}</p>
                        <p className="text-white/40">Estimated Price: <strong className="text-white/80 font-normal">{shopping.estimatedPrice}</strong></p>
                        <p className="text-white/70 italic mt-1 font-normal">"{shopping.reason}"</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
