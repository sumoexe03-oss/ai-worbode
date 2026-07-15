import React, { useState, useEffect } from "react";
import { WardrobeItem, UserProfile } from "./types";
import { INITIAL_WARDROBE, INITIAL_PROFILE } from "./data";

// Sub-components
import StyleProfileModal from "./components/StyleProfileModal";
import WardrobeManager from "./components/WardrobeManager";
import OutfitGenerator from "./components/OutfitGenerator";
import PackingAssistant from "./components/PackingAssistant";
import FashionAdvisor from "./components/FashionAdvisor";

// Icons
import { 
  Sparkles, 
  Shirt, 
  Compass, 
  Plane, 
  HelpCircle, 
  Leaf, 
  SlidersHorizontal, 
  User, 
  Info, 
  Heart,
  Flame,
  Award,
  Trash2,
  Calendar
} from "lucide-react";

export default function App() {
  const [inventory, setInventory] = useState<WardrobeItem[]>([]);
  const [profile, setProfile] = useState<UserProfile>(INITIAL_PROFILE);
  const [activeTab, setActiveTab] = useState<"wardrobe" | "style-me" | "packing" | "advisor" | "capsule">("wardrobe");
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  // Load state from LocalStorage on mount
  useEffect(() => {
    const savedInventory = localStorage.getItem("ai-wardrobe-inventory");
    if (savedInventory) {
      try {
        setInventory(JSON.parse(savedInventory));
      } catch (e) {
        console.error("Failed to parse wardrobe inventory from localStorage", e);
        setInventory(INITIAL_WARDROBE);
      }
    } else {
      setInventory(INITIAL_WARDROBE);
      localStorage.setItem("ai-wardrobe-inventory", JSON.stringify(INITIAL_WARDROBE));
    }

    const savedProfile = localStorage.getItem("ai-wardrobe-profile");
    if (savedProfile) {
      try {
        setProfile(JSON.parse(savedProfile));
      } catch (e) {
        console.error("Failed to parse profile from localStorage", e);
        setProfile(INITIAL_PROFILE);
      }
    } else {
      setProfile(INITIAL_PROFILE);
      localStorage.setItem("ai-wardrobe-profile", JSON.stringify(INITIAL_PROFILE));
    }
  }, []);

  // Update localStorage when inventory changes
  const handleAddItem = (newItem: Omit<WardrobeItem, "id" | "createdAt">) => {
    const itemWithId: WardrobeItem = {
      ...newItem,
      id: `item-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    const updated = [itemWithId, ...inventory];
    setInventory(updated);
    localStorage.setItem("ai-wardrobe-inventory", JSON.stringify(updated));
  };

  const handleRemoveItem = (id: string) => {
    const updated = inventory.filter((item) => item.id !== id);
    setInventory(updated);
    localStorage.setItem("ai-wardrobe-inventory", JSON.stringify(updated));
  };

  // Update localStorage when profile changes
  const handleSaveProfile = (updatedProfile: UserProfile) => {
    setProfile(updatedProfile);
    localStorage.setItem("ai-wardrobe-profile", JSON.stringify(updatedProfile));
  };

  // Dynamic Statistics Calculations for Capsule Hub
  const totalItems = inventory.length;
  const averageVersatility = totalItems > 0 
    ? Math.round((inventory.reduce((acc, curr) => acc + curr.versatilityScore, 0) / totalItems) * 10) / 10 
    : 0;

  // Sustainability score out of 100
  // Higher versatility and moderate count represents higher sustainability
  const sustainabilityScore = Math.min(
    100,
    Math.round(
      (averageVersatility * 6) + 
      (totalItems < 20 ? 40 : totalItems < 35 ? 30 : 15) + 
      (profile.preferredBrands.length > 0 ? 10 : 0)
    )
  );

  return (
    <div className="min-h-screen bg-dark-950 text-white font-sans flex flex-col justify-between" id="app-root">
      
      {/* 1. Header / Profile Bar */}
      <header className="bg-dark-850 border-b border-white/10 sticky top-0 z-40 shadow-md" id="app-header">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          
          {/* Logo Brand */}
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 bg-gold-500 flex items-center justify-center rounded-sm font-serif text-black font-bold text-xl shadow-md">
              W
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="font-serif italic text-2xl tracking-tight text-gold-500">AI Wardrobe</h1>
                <span className="bg-gold-500/10 text-[#C5A059] text-[9px] font-bold px-1.5 py-0.5 rounded-sm border border-[#C5A059]/20 uppercase tracking-wide font-mono">Sustainable</span>
              </div>
              <p className="text-xs text-white/40 mt-0.5">Your intelligent, eco-friendly styling assistant</p>
            </div>
          </div>

          {/* User Profile Status Strip */}
          <div className="flex items-center gap-4 bg-dark-900 border border-white/10 p-2 rounded-sm text-xs max-w-full overflow-x-auto">
            <div className="flex items-center gap-1.5 px-2 flex-shrink-0">
              <User className="w-4 h-4 text-gold-500" />
              <span className="text-white/40 font-medium">Style Profile:</span>
              <strong className="text-white font-semibold">{profile.gender} • {profile.fashionStyle}</strong>
            </div>

            <div className="w-px h-5 bg-white/10 flex-shrink-0"></div>

            <div className="flex items-center gap-1.5 px-2 flex-shrink-0">
              <span className="text-white/40 font-medium">Capsule items:</span>
              <strong className="text-white font-semibold">{totalItems}</strong>
            </div>

            <button
              onClick={() => setIsProfileModalOpen(true)}
              className="bg-dark-800 hover:bg-dark-700 border border-white/10 px-3 py-1.5 rounded-sm text-xs font-semibold text-gold-500 flex items-center gap-1 transition-colors flex-shrink-0 cursor-pointer"
              id="edit-profile-btn"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-gold-500" />
              Tune Persona
            </button>
          </div>
        </div>
      </header>

      {/* 2. Main Workspace Layout */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8" id="app-workspace">
        
        {/* Navigation Tabs Bar */}
        <div className="flex border-b border-white/10 overflow-x-auto scrollbar-none gap-2 bg-dark-900 p-1.5 rounded-sm border border-white/10 shadow-md" id="navigation-tabs">
          <button
            onClick={() => setActiveTab("wardrobe")}
            className={`flex items-center gap-2 px-4 py-2 rounded-sm text-xs font-semibold uppercase tracking-widest transition-all whitespace-nowrap cursor-pointer ${
              activeTab === "wardrobe"
                ? "bg-gold-500 text-black font-bold font-serif italic"
                : "text-white/50 hover:text-white hover:bg-white/5"
            }`}
            id="tab-wardrobe"
          >
            <Shirt className="w-4 h-4" />
            Wardrobe Closet
          </button>

          <button
            onClick={() => setActiveTab("style-me")}
            className={`flex items-center gap-2 px-4 py-2 rounded-sm text-xs font-semibold uppercase tracking-widest transition-all whitespace-nowrap cursor-pointer ${
              activeTab === "style-me"
                ? "bg-gold-500 text-black font-bold font-serif italic"
                : "text-white/50 hover:text-white hover:bg-white/5"
            }`}
            id="tab-style-me"
          >
            <Compass className="w-4 h-4" />
            Style Me Generator
          </button>

          <button
            onClick={() => setActiveTab("packing")}
            className={`flex items-center gap-2 px-4 py-2 rounded-sm text-xs font-semibold uppercase tracking-widest transition-all whitespace-nowrap cursor-pointer ${
              activeTab === "packing"
                ? "bg-gold-500 text-black font-bold font-serif italic"
                : "text-white/50 hover:text-white hover:bg-white/5"
            }`}
            id="tab-packing"
          >
            <Plane className="w-4 h-4" />
            Packing Planner
          </button>

          <button
            onClick={() => setActiveTab("advisor")}
            className={`flex items-center gap-2 px-4 py-2 rounded-sm text-xs font-semibold uppercase tracking-widest transition-all whitespace-nowrap cursor-pointer ${
              activeTab === "advisor"
                ? "bg-gold-500 text-black font-bold font-serif italic"
                : "text-white/50 hover:text-white hover:bg-white/5"
            }`}
            id="tab-advisor"
          >
            <HelpCircle className="w-4 h-4" />
            Style Advisor Desk
          </button>

          <button
            onClick={() => setActiveTab("capsule")}
            className={`flex items-center gap-2 px-4 py-2 rounded-sm text-xs font-semibold uppercase tracking-widest transition-all whitespace-nowrap cursor-pointer ${
              activeTab === "capsule"
                ? "bg-gold-500 text-black font-bold font-serif italic"
                : "text-gold-500 hover:text-gold-400 hover:bg-white/5"
            }`}
            id="tab-capsule"
          >
            <Leaf className="w-4 h-4 text-gold-500" />
            Capsule Hub
          </button>
        </div>

        {/* Workspace Panels Router */}
        <div className="bg-transparent" id="tab-content-container">
          
          {/* A. WARDROBE MANAGE */}
          {activeTab === "wardrobe" && (
            <div className="animate-fade-in">
              <WardrobeManager
                items={inventory}
                onAddItem={handleAddItem}
                onRemoveItem={handleRemoveItem}
              />
            </div>
          )}

          {/* B. OUTFIT GENERATOR */}
          {activeTab === "style-me" && (
            <div className="animate-fade-in">
              <OutfitGenerator
                inventory={inventory}
                profile={profile}
              />
            </div>
          )}

          {/* C. PACKING PLANNER */}
          {activeTab === "packing" && (
            <div className="animate-fade-in">
              <PackingAssistant
                inventory={inventory}
              />
            </div>
          )}

          {/* D. STYLE ADVISOR DESK */}
          {activeTab === "advisor" && (
            <div className="animate-fade-in">
              <FashionAdvisor
                inventory={inventory}
                profile={profile}
              />
            </div>
          )}

          {/* E. CAPSULE HUB (SUSTAINABILITY SCORES) */}
          {activeTab === "capsule" && (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 animate-fade-in" id="capsule-hub-panel">
              
              {/* Left Column stats */}
              <div className="md:col-span-4 bg-dark-900 border border-white/10 rounded-sm p-6 shadow-md h-fit space-y-6">
                <div>
                  <h3 className="font-serif italic text-lg font-medium text-gold-500 flex items-center gap-2">
                    <Leaf className="w-5 h-5 text-gold-500" />
                    Closet Eco-Metrics
                  </h3>
                  <p className="text-xs text-white/40 mt-1">Calculated in real-time based on your wardrobe density and item reuse ratings.</p>
                </div>

                <div className="space-y-4">
                  {/* Closet Sustainability score gauge */}
                  <div className="bg-dark-800 rounded-sm p-4 border border-white/5 text-center space-y-1">
                    <span className="text-[10px] uppercase tracking-widest font-bold text-gold-500">Capsule Sustainability Index</span>
                    <p className="text-3xl font-serif italic font-bold text-[#C5A059]">{sustainabilityScore}%</p>
                    <div className="w-full bg-white/5 h-1 rounded-full overflow-hidden mt-2.5 border border-white/10">
                      <div className="bg-gold-500 h-full transition-all duration-1000" style={{ width: `${sustainabilityScore}%` }}></div>
                    </div>
                    <span className="block text-[10px] text-white/40 mt-2">Excellent rating! Fewer items with high versatility limits retail carbon emissions.</span>
                  </div>

                  {/* Wardrobe density */}
                  <div className="grid grid-cols-2 gap-3 text-center">
                    <div className="bg-dark-800 rounded-sm p-3 border border-white/5">
                      <span className="text-[9px] uppercase tracking-widest font-bold text-white/40 block mb-0.5">Avg Versatility</span>
                      <strong className="text-lg text-white font-serif italic">{averageVersatility}/10</strong>
                    </div>
                    <div className="bg-dark-800 rounded-sm p-3 border border-white/5">
                      <span className="text-[9px] uppercase tracking-widest font-bold text-white/40 block mb-0.5">Garments Count</span>
                      <strong className="text-lg text-white font-serif italic">{totalItems}</strong>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column guides */}
              <div className="md:col-span-8 bg-dark-900 border border-white/10 rounded-sm p-6 shadow-md space-y-6">
                <div>
                  <h3 className="font-serif italic text-lg font-medium text-gold-500 flex items-center gap-2">
                    <Award className="w-5 h-5 text-gold-500" />
                    Sustainable Capsule Guidelines
                  </h3>
                  <p className="text-xs text-white/40 mt-1">Simple practical methods to reuse your existing clothes, protect the environment, and style with absolute confidence.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Guideline 1 */}
                  <div className="border border-white/5 rounded-sm p-4 space-y-1.5 bg-dark-800/40">
                    <h4 className="text-xs font-semibold text-white flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 bg-gold-500 rounded-full"></span>
                      1. Build a Capsule Closet
                    </h4>
                    <p className="text-xs text-white/60 leading-relaxed">
                      Aim to restrict your wardrobe to 30-40 highly versatile, premium garments. Pair standard neutral shades (beige, white, grey, black) with subtle texture blocks to unlock hundreds of combinations easily.
                    </p>
                  </div>

                  {/* Guideline 2 */}
                  <div className="border border-white/5 rounded-sm p-4 space-y-1.5 bg-dark-800/40">
                    <h4 className="text-xs font-semibold text-white flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 bg-gold-500 rounded-full"></span>
                      2. Reuse & Mix Creatively
                    </h4>
                    <p className="text-xs text-white/60 leading-relaxed">
                      Before shopping, try to layer your items differently. A classic white collared shirt can be styled under an autumn cardigan, worn open over a crop top, or paired elegantly with formal trousers.
                    </p>
                  </div>

                  {/* Guideline 3 */}
                  <div className="border border-white/5 rounded-sm p-4 space-y-1.5 bg-dark-800/40">
                    <h4 className="text-xs font-semibold text-white flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 bg-gold-500 rounded-full"></span>
                      3. Buy Less, Buy Better
                    </h4>
                    <p className="text-xs text-white/60 leading-relaxed">
                      Invest in premium quality fabrics like organic cotton, pure silk, and merino wool. They endure washes, feel exceptionally comfortable against the skin, and remain stylish across years of seasonal shifts.
                    </p>
                  </div>

                  {/* Guideline 4 */}
                  <div className="border border-white/5 rounded-sm p-4 space-y-1.5 bg-dark-800/40">
                    <h4 className="text-xs font-semibold text-white flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 bg-gold-500 rounded-full"></span>
                      4. Conscious Circularity
                    </h4>
                    <p className="text-xs text-white/60 leading-relaxed">
                      Donate or resell items you haven't worn in 12 months. This maintains wardrobe freshness without creating waste, keeps garments in active circular use, and reduces environmental clutter.
                    </p>
                  </div>
                </div>

                {/* Brands we love matching with */}
                <div className="bg-gradient-to-br from-dark-800 to-dark-750 text-white rounded-sm p-4 border border-white/10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <h4 className="font-serif italic text-sm font-medium text-gold-500">Your Selected Sustainable Brands</h4>
                    <p className="text-[11px] text-white/40 mt-0.5">We track and suggest compatible additions from these eco-conscious manufacturers.</p>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {profile.preferredBrands.map((b) => (
                      <span key={b} className="bg-white/5 text-white/80 text-[10px] font-semibold px-2.5 py-1 rounded-sm border border-white/10">
                        {b}
                      </span>
                    ))}
                    {profile.preferredBrands.length === 0 && (
                      <span className="text-[10px] text-white/40 italic">No brands selected yet. Click "Tune Persona" to add brands.</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </main>

      {/* 3. Footer */}
      <footer className="bg-dark-850 border-t border-white/10 py-6 text-center text-xs text-white/40" id="app-footer">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 AI Wardrobe Stylist. Encouraging thoughtful style, circular reuse, and low consumption.</p>
          <div className="flex items-center gap-4 text-[11px] text-white/50 font-medium">
            <span className="flex items-center gap-1 text-gold-500">
              <Leaf className="w-3.5 h-3.5 text-gold-500" />
              100% Eco-conscious recommendations
            </span>
          </div>
        </div>
      </footer>

      {/* Profile Settings Modal */}
      <StyleProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        profile={profile}
        onSave={handleSaveProfile}
      />
    </div>
  );
}
