"use client";

import { useState, useRef } from "react";
import { analyzeStream, AnalysisResult } from "@/lib/api";

interface Props {
  onResult: (result: AnalysisResult) => void;
}

const INPUT_PLACEHOLDER = `Paste a suspicious WhatsApp message here...
Example: "Papa emergency ho gaya, accident ho gaya, please ₹25,000 bhejo, koi call mat karna. UPI: xyz@paytm"`

export default function InputPanel({ onResult }: Props) {
  const [input, setInput] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleAnalyze = async () => {
    if (!input.trim()) {
      setError("Message daalo pehle");
      return;
    }
    if (input.trim().length < 5) {
      setError("Message thoda bada hai — kam se kam 5 characters chahiye");
      return;
    }

    setAnalyzing(true);
    setError(null);

    try {
      await analyzeStream(input, () => {}, onResult);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Analysis failed — check API connection";
      setError(message);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleAnalyze();
    }
  };

  return (
    <div className="w-full max-w-xl">
      {/* Input area */}
      <div className="bg-suno-card border border-suno-border rounded-2xl overflow-hidden">
        {/* Header */}
        <div className="px-4 py-3 border-b border-suno-border bg-suno-dark/50 flex items-center justify-between">
          <span className="text-sm text-suno-muted">Scam message</span>
          <span className="text-xs text-suno-muted/60">Ctrl+Enter to analyze</span>
        </div>

        {/* Textarea */}
        <div className="p-4">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={INPUT_PLACEHOLDER}
            disabled={analyzing}
            rows={6}
            className="w-full bg-suno-dark border border-suno-border rounded-xl p-4 text-sm text-suno-text placeholder-suno-muted/40 resize-none focus:outline-none focus:border-suno-accent/50 focus:ring-1 focus:ring-suno-accent/20 transition-all duration-200"
          />
        </div>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-suno-border flex items-center justify-between bg-suno-dark/30">
          <span className="text-xs text-suno-muted">
            {input.length} characters
          </span>
          <button
            onClick={handleAnalyze}
            disabled={analyzing || !input.trim()}
            className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
              analyzing
                ? "bg-suno-border text-suno-muted cursor-not-allowed"
                : input.trim()
                ? "bg-suno-accent hover:bg-suno-accent/80 text-white shadow-lg shadow-suno-accent/20"
                : "bg-suno-border text-suno-muted cursor-not-allowed"
            }`}
          >
            {analyzing ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Analyzing...
              </span>
            ) : (
              "Check this"
            )}
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mt-3 p-3 bg-red-900/20 border border-red-500/30 rounded-lg text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Shortcut hint */}
      <div className="mt-2 text-xs text-suno-muted/50 text-center">
        Tip: Audio transcript ya screenshot text bhi paste kar sakte hain
      </div>
    </div>
  );
}
