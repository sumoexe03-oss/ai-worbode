import React, { useState } from "react";
import { UserProfile } from "../types";
import { GENDERS, BODY_TYPES, SKIN_TONES, FASHION_STYLES } from "../data";
import { X, Heart, Sparkles, User, ShieldCheck } from "lucide-react";

interface StyleProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
  onSave: (updatedProfile: UserProfile) => void;
}

export default function StyleProfileModal({
  isOpen,
  onClose,
  profile,
  onSave
}: StyleProfileModalProps) {
  const [editedProfile, setEditedProfile] = useState<UserProfile>({ ...profile });
  const [newColor, setNewColor] = useState("");
  const [newBrand, setNewBrand] = useState("");

  if (!isOpen) return null;

  const handleInputChange = (field: keyof UserProfile, value: any) => {
    setEditedProfile((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  const addColor = () => {
    if (newColor.trim() && !editedProfile.favoriteColors.includes(newColor.trim())) {
      setEditedProfile((prev) => ({
        ...prev,
        favoriteColors: [...prev.favoriteColors, newColor.trim()]
      }));
      setNewColor("");
    }
  };

  const removeColor = (color: string) => {
    setEditedProfile((prev) => ({
      ...prev,
      favoriteColors: prev.favoriteColors.filter((c) => c !== color)
    }));
  };

  const addBrand = () => {
    if (newBrand.trim() && !editedProfile.preferredBrands.includes(newBrand.trim())) {
      setEditedProfile((prev) => ({
        ...prev,
        preferredBrands: [...prev.preferredBrands, newBrand.trim()]
      }));
      setNewBrand("");
    }
  };

  const removeBrand = (brand: string) => {
    setEditedProfile((prev) => ({
      ...prev,
      preferredBrands: prev.preferredBrands.filter((b) => b !== brand)
    }));
  };

  const handleSave = () => {
    onSave(editedProfile);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in" id="profile-modal-overlay">
      <div className="bg-dark-900 border border-white/10 rounded-sm shadow-2xl w-full max-w-2xl overflow-hidden max-h-[90vh] flex flex-col" id="profile-modal-container">
        {/* Header */}
        <div className="bg-dark-950 px-6 py-4 flex items-center justify-between border-b border-white/10 text-white">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-gold-500" />
            <h3 className="font-serif italic text-lg font-medium tracking-wide text-white">Customize Style Profile</h3>
          </div>
          <button
            onClick={onClose}
            className="text-white/40 hover:text-white transition-colors p-1 rounded-sm hover:bg-white/5 cursor-pointer"
            id="close-profile-modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          <div className="bg-dark-850 rounded-sm p-4 flex gap-3 items-start border border-white/5">
            <User className="w-5 h-5 text-gold-500 mt-0.5" />
            <div>
              <h4 className="text-sm font-serif italic text-white">Why customize your profile?</h4>
              <p className="text-xs text-white/60 mt-1 leading-relaxed">
                AI Wardrobe tailors its matches, color suggestions, and fit ratings specifically to your body shape, skin undertone, and aesthetic style choice.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Gender / Expression */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-white/60 mb-2 font-mono">Gender / Styling Code</label>
              <select
                value={editedProfile.gender}
                onChange={(e) => handleInputChange("gender", e.target.value)}
                className="w-full bg-dark-850 border border-white/10 rounded-sm px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-gold-500 focus:border-gold-500 focus:bg-dark-800 transition-all cursor-pointer"
              >
                {GENDERS.map((g) => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </div>

            {/* Body Shape */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-white/60 mb-2 font-mono">Body Shape / Fit Profile</label>
              <select
                value={editedProfile.bodyType}
                onChange={(e) => handleInputChange("bodyType", e.target.value)}
                className="w-full bg-dark-850 border border-white/10 rounded-sm px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-gold-500 focus:border-gold-500 focus:bg-dark-800 transition-all cursor-pointer"
              >
                {BODY_TYPES.map((bt) => (
                  <option key={bt} value={bt}>{bt}</option>
                ))}
              </select>
            </div>

            {/* Skin Undertone */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-white/60 mb-2 font-mono">Skin Undertone / Palette Match</label>
              <select
                value={editedProfile.skinTone}
                onChange={(e) => handleInputChange("skinTone", e.target.value)}
                className="w-full bg-dark-850 border border-white/10 rounded-sm px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-gold-500 focus:border-gold-500 focus:bg-dark-800 transition-all cursor-pointer"
              >
                {SKIN_TONES.map((st) => (
                  <option key={st} value={st}>{st}</option>
                ))}
              </select>
            </div>

            {/* Style Aesthetic */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-white/60 mb-2 font-mono">Primary Fashion Style</label>
              <select
                value={editedProfile.fashionStyle}
                onChange={(e) => handleInputChange("fashionStyle", e.target.value)}
                className="w-full bg-dark-850 border border-white/10 rounded-sm px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-gold-500 focus:border-gold-500 focus:bg-dark-800 transition-all cursor-pointer"
              >
                {FASHION_STYLES.map((fs) => (
                  <option key={fs} value={fs}>{fs}</option>
                ))}
              </select>
            </div>

            {/* Clothing Size */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-white/60 mb-2 font-mono">Typical Clothing Size</label>
              <input
                type="text"
                value={editedProfile.clothingSize}
                onChange={(e) => handleInputChange("clothingSize", e.target.value)}
                placeholder="e.g. M, US 6, EU 38"
                className="w-full bg-dark-850 border border-white/10 rounded-sm px-3 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:ring-1 focus:ring-gold-500 focus:border-gold-500 focus:bg-dark-800 transition-all"
              />
            </div>

            {/* Budget preference */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-white/60 mb-2 font-mono">Budget Target</label>
              <input
                type="text"
                value={editedProfile.budget}
                onChange={(e) => handleInputChange("budget", e.target.value)}
                placeholder="e.g. Affordable, Moderate, Eco-friendly"
                className="w-full bg-dark-850 border border-white/10 rounded-sm px-3 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:ring-1 focus:ring-gold-500 focus:border-gold-500 focus:bg-dark-800 transition-all"
              />
            </div>
          </div>

          {/* Favorite Colors Tag Editor */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-white/60 mb-2 font-mono">Favorite Colors</label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={newColor}
                onChange={(e) => setNewColor(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addColor()}
                placeholder="Add color (e.g. Sage, Crimson)"
                className="flex-1 bg-dark-850 border border-white/10 rounded-sm px-3 py-1.5 text-sm text-white placeholder-white/30 focus:outline-none focus:ring-1 focus:ring-gold-500 focus:border-gold-500 focus:bg-dark-800 transition-all"
              />
              <button
                type="button"
                onClick={addColor}
                className="bg-gold-500 hover:bg-gold-400 text-black rounded-sm px-4 py-1.5 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5 mt-2">
              {editedProfile.favoriteColors.map((color) => (
                <span
                  key={color}
                  className="inline-flex items-center gap-1 bg-dark-800 text-white/85 text-xs px-2.5 py-1 rounded-sm border border-white/5 font-mono"
                >
                  {color}
                  <button
                    onClick={() => removeColor(color)}
                    className="text-white/40 hover:text-white transition-colors ml-1 cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
              {editedProfile.favoriteColors.length === 0 && (
                <span className="text-xs text-white/40 italic">No favorite colors added.</span>
              )}
            </div>
          </div>

          {/* Preferred Brands */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-white/60 mb-2 font-mono">Preferred Brands (Capsule / Sustainable focuses)</label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={newBrand}
                onChange={(e) => setNewBrand(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addBrand()}
                placeholder="Add brand (e.g. Zara, Everlane)"
                className="flex-1 bg-dark-850 border border-white/10 rounded-sm px-3 py-1.5 text-sm text-white placeholder-white/30 focus:outline-none focus:ring-1 focus:ring-gold-500 focus:border-gold-500 focus:bg-dark-800 transition-all"
              />
              <button
                type="button"
                onClick={addBrand}
                className="bg-gold-500 hover:bg-gold-400 text-black rounded-sm px-4 py-1.5 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5 mt-2">
              {editedProfile.preferredBrands.map((brand) => (
                <span
                  key={brand}
                  className="inline-flex items-center gap-1 bg-gold-500/10 text-gold-400 text-xs px-2.5 py-1 rounded-sm border border-gold-500/20 font-mono"
                >
                  <Heart className="w-3 h-3 fill-gold-500 text-gold-500 flex-shrink-0" />
                  {brand}
                  <button
                    onClick={() => removeBrand(brand)}
                    className="text-gold-400 hover:text-gold-300 transition-colors ml-1 cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
              {editedProfile.preferredBrands.length === 0 && (
                <span className="text-xs text-white/40 italic">No brands added.</span>
              )}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="bg-dark-950 px-6 py-4 flex justify-end gap-3 border-t border-white/10">
          <button
            onClick={onClose}
            className="border border-white/10 hover:bg-white/5 text-white/70 font-semibold rounded-sm px-4 py-2 text-xs uppercase tracking-wider transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="bg-gold-500 hover:bg-gold-400 text-black font-bold rounded-sm px-5 py-2 text-xs uppercase tracking-widest shadow-md transition-colors flex items-center gap-2 cursor-pointer"
            id="save-style-profile"
          >
            <ShieldCheck className="w-4 h-4" />
            Save Profile Settings
          </button>
        </div>
      </div>
    </div>
  );
}
