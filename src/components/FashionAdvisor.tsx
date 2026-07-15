import React, { useState } from "react";
import { WardrobeItem, UserProfile } from "../types";
import Markdown from "react-markdown";
import { HelpCircle, Sparkles, MessageSquare, List, RefreshCw, Layers, Award, TrendingUp, Compass, AlertCircle } from "lucide-react";

interface FashionAdvisorProps {
  inventory: WardrobeItem[];
  profile: UserProfile;
}

const CONTEXT_QUESTIONS = [
  "How can I construct a capsule wardrobe with only 12 pieces?",
  "How do I match warm skin undertone with forest green and beige?",
  "What's the best way to layer clothes for a damp rainy 12°C college day?",
  "How do I accessorize a minimalist charcoal denim look creatively?"
];

export default function FashionAdvisor({
  inventory,
  profile
}: FashionAdvisorProps) {
  const [question, setQuestion] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [response, setResponse] = useState<{
    advice: string;
    colorTips: string[];
    layeringGuide: string[];
    seasonalTrends: string[];
    accessoriesAdvice: string[];
  } | null>(null);

  const handleConsult = async (selectedQuestion?: string) => {
    const activeQuestion = selectedQuestion || question;
    if (!activeQuestion.trim()) {
      alert("Please select or type a styling query.");
      return;
    }

    setIsLoading(true);
    setError("");
    setResponse(null);

    try {
      const res = await fetch("/api/wardrobe/advice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: activeQuestion,
          inventory,
          profile
        })
      });

      if (!res.ok) {
        throw new Error("Unable to contact your personal fashion consultant. Check connection.");
      }

      const data = await res.json();
      if (data.advice) {
        setResponse(data);
        if (!selectedQuestion) setQuestion(""); // Clear custom input on success
      } else {
        throw new Error("Invalid advice structure returned.");
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to retrieve fashion suggestions.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6" id="advisor-section">
      {/* Upper header */}
      <div className="bg-dark-900 border border-white/10 rounded-sm p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-md">
        <div className="space-y-1">
          <h2 className="text-xl font-serif text-white font-semibold tracking-tight flex items-center gap-2 italic">
            <Sparkles className="w-5 h-5 text-gold-500 animate-pulse" />
            AI Style Advisor & Sustainability Desk
          </h2>
          <p className="text-xs text-white/40">
            Ask questions on color matching, layering, seasonal trends, and capsule building. Tailored to what you own.
          </p>
        </div>
      </div>

      {/* Main Container */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Input Column (Left) */}
        <div className="lg:col-span-4 bg-dark-900 border border-white/10 rounded-sm p-6 shadow-md h-fit space-y-6">
          <div className="space-y-1">
            <h3 className="font-serif text-sm font-semibold text-white flex items-center gap-2 italic">
              <MessageSquare className="w-4.5 h-4.5 text-gold-500" />
              Ask your Stylist
            </h3>
            <p className="text-[11px] text-white/40">Type or pick a curated clothing topic below.</p>
          </div>

          {/* Quick topics select list */}
          <div className="space-y-2">
            <span className="block text-[10px] font-bold text-white/60 uppercase tracking-widest font-mono">Suggested Topics</span>
            <div className="flex flex-col gap-1.5">
              {CONTEXT_QUESTIONS.map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => handleConsult(q)}
                  disabled={isLoading}
                  className="text-left bg-dark-850 hover:bg-dark-800 border border-white/5 p-2.5 rounded-sm text-xs text-white/70 transition-all font-medium hover:text-white disabled:opacity-50 cursor-pointer"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>

          <div className="w-full border-t border-white/10 my-4"></div>

          {/* Custom text input */}
          <div className="space-y-2">
            <span className="block text-[10px] font-bold text-white/60 uppercase tracking-widest font-mono">Custom Query</span>
            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="e.g. How do I match an olive green top with charcoal jeans for an evening date?"
              rows={4}
              className="w-full bg-dark-850 border border-white/10 rounded-sm p-3 text-xs text-white placeholder-white/30 focus:outline-none focus:ring-1 focus:ring-gold-500 focus:bg-dark-800 transition-all resize-none"
            />
            <button
              onClick={() => handleConsult()}
              disabled={isLoading || !question.trim()}
              className="w-full bg-gold-500 hover:bg-gold-400 disabled:bg-white/10 disabled:text-white/30 text-black py-3 rounded-sm text-xs font-bold uppercase tracking-widest transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-black" />
                  Stylist is drafting...
                </>
              ) : (
                "Consult Fashion Advisor"
              )}
            </button>
          </div>
        </div>

        {/* Results Desk (Right) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Placeholder */}
          {!isLoading && !response && !error && (
            <div className="bg-dark-900 border border-white/10 rounded-sm p-12 text-center flex flex-col items-center justify-center min-h-[400px]">
              <HelpCircle className="w-12 h-12 text-white/20 mb-3" />
              <h3 className="font-serif text-lg font-medium text-white italic">Your AI Styling Studio</h3>
              <p className="text-xs text-white/40 max-w-sm mt-1 mx-auto leading-relaxed">
                Choose a suggested topic or write your personal style dilemma. We will analyze your active wardrobe for creative answers!
              </p>
            </div>
          )}

          {/* Loading */}
          {isLoading && (
            <div className="bg-dark-900 border border-white/10 rounded-sm p-12 text-center flex flex-col items-center justify-center min-h-[400px] space-y-4">
              <RefreshCw className="w-10 h-10 text-gold-500 animate-spin" />
              <h4 className="font-serif text-base font-semibold text-white italic">Styling Consultation</h4>
              <p className="text-xs text-white/40">Gemini is looking up color theory, clothing drape, and sustainable capsule combinations...</p>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 rounded-sm p-8 flex gap-3">
              <AlertCircle className="w-6 h-6 text-red-400 flex-shrink-0" />
              <div>
                <h4 className="text-sm font-semibold text-white">Consultation Error</h4>
                <p className="text-xs text-white/70 mt-1">{error}</p>
              </div>
            </div>
          )}

          {/* Output Presentation */}
          {response && (
            <div className="space-y-6 animate-fade-in" id="advice-results">
              {/* Primary Advice */}
              <div className="bg-dark-900 border border-white/10 rounded-sm p-6 shadow-md">
                <span className="text-[10px] font-bold text-gold-500 uppercase tracking-widest font-mono">Curated Fashion Bulletin</span>
                <div className="markdown-body text-white/80 text-xs mt-3 leading-relaxed prose prose-invert max-w-none">
                  <Markdown>{response.advice}</Markdown>
                </div>
              </div>

              {/* Subsidiary trait sections */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Layering & Color */}
                <div className="bg-dark-900 border border-white/10 rounded-sm p-5 space-y-3 shadow-md">
                  <h4 className="font-serif text-xs font-bold text-white uppercase tracking-widest flex items-center gap-1.5 pb-2 border-b border-white/10 font-mono">
                    <Layers className="w-3.5 h-3.5 text-gold-500" />
                    Layering & Color Pairing
                  </h4>
                  <ul className="space-y-2 text-xs text-white/70">
                    {response.colorTips.map((tip, i) => (
                      <li key={i} className="flex gap-2 items-start">
                        <span className="text-gold-500 text-sm mt-[-2px]">•</span>
                        <span>{tip}</span>
                      </li>
                    ))}
                    {response.layeringGuide.map((layer, i) => (
                      <li key={i} className="flex gap-2 items-start">
                        <span className="text-gold-400 text-sm mt-[-2px]">•</span>
                        <span>{layer}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Trends & Accessories */}
                <div className="bg-dark-900 border border-white/10 rounded-sm p-5 space-y-3 shadow-md">
                  <h4 className="font-serif text-xs font-bold text-white uppercase tracking-widest flex items-center gap-1.5 pb-2 border-b border-white/10 font-mono">
                    <TrendingUp className="w-3.5 h-3.5 text-gold-500" />
                    Trends & Accessories Advice
                  </h4>
                  <ul className="space-y-2 text-xs text-white/70">
                    {response.seasonalTrends.map((trend, i) => (
                      <li key={i} className="flex gap-2 items-start">
                        <span className="text-gold-500 text-sm mt-[-2px]">•</span>
                        <span>{trend}</span>
                      </li>
                    ))}
                    {response.accessoriesAdvice.map((acc, i) => (
                      <li key={i} className="flex gap-2 items-start">
                        <span className="text-gold-400 text-sm mt-[-2px]">•</span>
                        <span>{acc}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
