"use client";

import { useState } from "react";
import { analyzeStream, AnalysisResult, AnalysisStatus } from "@/lib/api";

interface Props {
  onResult: (result: AnalysisResult) => void;
}

export default function AnalysisCard({ onResult }: Props) {
  const [status, setStatus] = useState<AnalysisStatus | null>(null);
  const [error, setError] = useState<string | null>(null);

  const steps: Record<string, string> = {
    reading_message: "Reading your message...",
    detecting_patterns: "Detecting scam patterns...",
    checking_entities: "Checking phone numbers, UPI IDs, amounts...",
    analyzing_risk: "Analyzing risk level...",
    preparing_actions: "Preparing safety actions...",
    complete: "Analysis complete",
  };

  return (
    <div className="bg-suno-card border border-suno-border rounded-2xl p-6 w-full max-w-xl">
      {status && (
        <div className="space-y-4">
          {/* Progress bar */}
          <div className="w-full bg-suno-border rounded-full h-2 overflow-hidden">
            <div
              className="h-full bg-suno-accent rounded-full transition-all duration-500 ease-out"
              style={{ width: `${status.progress}%` }}
            />
          </div>

          {/* Step indicator */}
          <div className="flex flex-col gap-2">
            {Object.entries(steps).map(([key, label]) => {
              const isActive = status.step === key;
              const isDone = steps[key] === steps[status.step] ||
                Object.keys(steps).indexOf(key) < Object.keys(steps).indexOf(status.step);
              return (
                <div
                  key={key}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-300 ${
                    isActive
                      ? "bg-suno-accent/10 border border-suno-accent/30"
                      : isDone
                      ? "text-suno-muted"
                      : "text-suno-muted/40"
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                      isActive
                        ? "bg-suno-accent text-white"
                        : isDone
                        ? "bg-suno-safe text-white"
                        : "bg-suno-border text-suno-muted"
                    }`}
                  >
                    {isDone ? "✓" : isActive ? "◉" : "○"}
                  </div>
                  <span className="text-sm font-medium">{label}</span>
                </div>
              );
            })}
          </div>

          {/* Current status message */}
          <div className="mt-4 p-3 bg-suno-dark/50 rounded-lg border border-suno-border">
            <p className="text-sm text-suno-muted animate-pulse">
              {status.message}
            </p>
          </div>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-900/20 border border-red-500/30 rounded-lg text-red-400 text-sm">
          {error}
        </div>
      )}

      <style jsx>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        .animate-pulse {
          animation: pulse 1.5s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
