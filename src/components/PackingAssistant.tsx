import React, { useState } from "react";
import { WardrobeItem, PackingItem, DailyOutfitPlan } from "../types";
import { Plane, Calendar, MapPin, CheckSquare, Briefcase, Activity, Compass, AlertCircle, RefreshCw } from "lucide-react";

interface PackingAssistantProps {
  inventory: WardrobeItem[];
}

export default function PackingAssistant({
  inventory
}: PackingAssistantProps) {
  const [destination, setDestination] = useState("");
  const [weather, setWeather] = useState("");
  const [duration, setDuration] = useState(3);
  const [activities, setActivities] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [packingList, setPackingList] = useState<PackingItem[]>([]);
  const [dailyPlans, setDailyPlans] = useState<DailyOutfitPlan[]>([]);
  const [packedItems, setPackedItems] = useState<string[]>([]);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!destination || !weather || !activities) {
      alert("Please fill out destination, weather, and activities.");
      return;
    }

    setIsLoading(true);
    setError("");
    setPackingList([]);
    setDailyPlans([]);
    setPackedItems([]);

    try {
      const response = await fetch("/api/wardrobe/packing-assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          destination,
          weather,
          durationDays: duration,
          activities,
          inventory
        })
      });

      if (!response.ok) {
        throw new Error("Failed to curate packing details. Please verify your connection.");
      }

      const data = await response.json();
      if (data.packingList && data.dailyOutfits) {
        setPackingList(data.packingList);
        setDailyPlans(data.dailyOutfits);
      } else {
        throw new Error("Invalid packing assistant response.");
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to create packing plan.");
    } finally {
      setIsLoading(false);
    }
  };

  const togglePack = (itemName: string) => {
    setPackedItems((prev) =>
      prev.includes(itemName) ? prev.filter((i) => i !== itemName) : [...prev, itemName]
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8" id="packing-section">
      {/* Parameters Form (Left) */}
      <form onSubmit={handleGenerate} className="lg:col-span-4 bg-dark-900 border border-white/10 rounded-sm p-6 shadow-md h-fit space-y-5">
        <div>
          <h3 className="font-serif text-lg font-medium text-white flex items-center gap-2 italic">
            <Plane className="w-5 h-5 text-gold-500" />
            Travel Planner
          </h3>
          <p className="text-xs text-white/40 mt-1">Design a lightweight mix-and-match travel capsule.</p>
        </div>

        <div className="space-y-4">
          {/* Destination */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-white/60 mb-1.5 font-mono">Destination</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-2.5 w-4 h-4 text-gold-500/60" />
              <input
                type="text"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                placeholder="e.g. Rome, Tokyo, Goa Beach"
                required
                className="w-full bg-dark-850 border border-white/10 rounded-sm pl-9 pr-3 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:ring-1 focus:ring-gold-500 focus:bg-dark-800 transition-all"
              />
            </div>
          </div>

          {/* Weather */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-white/60 mb-1.5 font-mono">Weather Conditions</label>
            <div className="relative">
              <Compass className="absolute left-3 top-2.5 w-4 h-4 text-gold-500/60" />
              <input
                type="text"
                value={weather}
                onChange={(e) => setWeather(e.target.value)}
                placeholder="e.g. Rainy, humid wind, 18°C"
                required
                className="w-full bg-dark-850 border border-white/10 rounded-sm pl-9 pr-3 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:ring-1 focus:ring-gold-500 focus:bg-dark-800 transition-all"
              />
            </div>
          </div>

          {/* Duration */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-white/60 mb-1.5 font-mono">Trip Duration (Days)</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-2.5 w-4 h-4 text-gold-500/60" />
              <input
                type="number"
                min="1"
                max="14"
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                required
                className="w-full bg-dark-850 border border-white/10 rounded-sm pl-9 pr-3 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:ring-1 focus:ring-gold-500 focus:bg-dark-800 transition-all"
              />
            </div>
          </div>

          {/* Activities */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-white/60 mb-1.5 font-mono">Activities & Dress Code</label>
            <div className="relative">
              <Activity className="absolute left-3 top-2.5 w-4 h-4 text-gold-500/60" />
              <textarea
                value={activities}
                onChange={(e) => setActivities(e.target.value)}
                placeholder="e.g. walking tours, elegant dinners, beach swim"
                rows={3}
                required
                className="w-full bg-dark-850 border border-white/10 rounded-sm pl-9 pr-3 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:ring-1 focus:ring-gold-500 focus:bg-dark-800 transition-all resize-none"
              />
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gold-500 hover:bg-gold-400 disabled:bg-white/10 disabled:text-white/30 text-black py-3 rounded-sm text-xs font-bold uppercase tracking-widest transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-black" />
                Folding clothes...
              </>
            ) : (
              "Generate Packing Plan"
            )}
          </button>
        </div>
      </form>

      {/* Results Checklist & Schedule (Right) */}
      <div className="lg:col-span-8 space-y-6">
        {/* Placeholder */}
        {!isLoading && packingList.length === 0 && !error && (
          <div className="bg-dark-900 border border-white/10 rounded-sm p-12 text-center flex flex-col items-center justify-center min-h-[400px]">
            <Briefcase className="w-12 h-12 text-white/20 mb-3" />
            <h3 className="font-serif text-lg font-medium text-white italic">Your Packing Assistant</h3>
            <p className="text-xs text-white/40 max-w-sm mt-1 mx-auto leading-relaxed">
              Tell us where you are traveling and for how long. We will build an eco-friendly packing plan using your existing clothes.
            </p>
          </div>
        )}

        {/* Loading */}
        {isLoading && (
          <div className="bg-dark-900 border border-white/10 rounded-sm p-12 text-center flex flex-col items-center justify-center min-h-[400px] space-y-4">
            <RefreshCw className="w-10 h-10 text-gold-500 animate-spin" />
            <h4 className="font-serif text-base font-semibold text-white italic">Packing Virtual Suitcase</h4>
            <p className="text-xs text-white/40">Selecting minimum pieces with maximum styling possibilities...</p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 rounded-sm p-8 flex gap-3">
            <AlertCircle className="w-6 h-6 text-red-400 flex-shrink-0" />
            <div>
              <h4 className="text-sm font-semibold text-white">Travel Curation Failed</h4>
              <p className="text-xs text-white/70 mt-1">{error}</p>
            </div>
          </div>
        )}

        {/* Content */}
        {packingList.length > 0 && (
          <div className="space-y-8 animate-fade-in" id="packing-results">
            {/* Header summary */}
            <div className="bg-dark-900 text-white border border-white/10 rounded-sm p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-gold-500 font-mono">Trip Capsule Checklist</span>
                <h4 className="font-serif text-base font-semibold italic mt-0.5">{destination} ({duration} Days)</h4>
              </div>
              <div className="text-xs text-white/40">
                Weather: <strong className="text-gold-500 font-medium font-mono text-[10px] uppercase tracking-wider">{weather}</strong>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              {/* Checklist column (Left) */}
              <div className="md:col-span-5 bg-dark-900 border border-white/10 rounded-sm p-5 space-y-4 shadow-md h-fit">
                <h5 className="font-serif text-sm font-semibold text-white flex items-center gap-2 pb-2 border-b border-white/10 italic">
                  <CheckSquare className="w-4.5 h-4.5 text-gold-500" />
                  What to pack:
                </h5>

                <div className="space-y-3.5 max-h-[450px] overflow-y-auto pr-1">
                  {packingList.map((pi) => (
                    <label
                      key={pi.item}
                      onClick={() => togglePack(pi.item)}
                      className={`flex items-start gap-3 p-2.5 rounded-sm border cursor-pointer transition-all ${
                        packedItems.includes(pi.item)
                          ? "bg-dark-950/45 border-white/5 line-through text-white/30 opacity-60"
                          : "bg-dark-850 border-white/10 hover:border-white/20 text-white/80"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={packedItems.includes(pi.item)}
                        onChange={() => {}} // toggled by parent label click
                        className="mt-0.5 accent-gold-500 w-3.5 h-3.5 flex-shrink-0"
                      />
                      <div className="text-xs leading-relaxed flex-1">
                        <div className="flex justify-between font-medium">
                          <span className="text-white/80">{pi.item}</span>
                          <span className="text-gold-500 font-bold font-mono">x{pi.quantity}</span>
                        </div>
                        <div className="flex items-center gap-1.5 mt-1 text-[10px]">
                          <span className="text-white/40 bg-dark-800 border border-white/5 px-1.5 py-0.2 rounded-sm font-mono text-[9px]">{pi.category}</span>
                          {pi.isCrucial && (
                            <span className="text-red-400 font-bold bg-red-500/10 border border-red-500/20 px-1 py-0.2 rounded-sm text-[9px] font-mono">CRUCIAL</span>
                          )}
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Day to Day schedule (Right) */}
              <div className="md:col-span-7 bg-dark-900 border border-white/10 rounded-sm p-5 space-y-4 shadow-md h-fit">
                <h5 className="font-serif text-sm font-semibold text-white flex items-center gap-2 pb-2 border-b border-white/10 italic">
                  <Calendar className="w-4.5 h-4.5 text-gold-500" />
                  Daily Styling Schedule:
                </h5>

                <div className="space-y-4 max-h-[450px] overflow-y-auto pr-1">
                  {dailyPlans.map((dp) => (
                    <div
                      key={dp.day}
                      className="bg-dark-850 border border-white/10 rounded-sm p-4 space-y-2 text-xs"
                    >
                      <div className="flex justify-between items-start gap-2">
                        <strong className="text-gold-500 text-xs font-semibold font-serif italic">{dp.day}</strong>
                        <span className="bg-dark-950 text-white/60 border border-white/5 px-1.5 py-0.5 rounded-sm text-[9px] font-medium font-mono max-w-[150px] truncate">{dp.activity}</span>
                      </div>
                      
                      <div className="space-y-1 mt-1 bg-dark-900 p-2.5 rounded-sm border border-white/5">
                        <span className="text-[10px] text-white/40 uppercase tracking-wider block font-bold font-mono">Outfit Plan</span>
                        <p className="text-white font-medium">{dp.outfit}</p>
                      </div>

                      <div className="space-y-0.5">
                        <span className="text-[10px] text-white/40 uppercase tracking-wider block font-bold font-mono">Travel Style Tip</span>
                        <p className="text-white/70 italic leading-relaxed">"{dp.stylingTips}"</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
