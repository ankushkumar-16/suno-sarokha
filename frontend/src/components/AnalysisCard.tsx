"use client";

import { useState } from "react";
import { analyzeStream, AnalysisStatus, AnalysisResult } from "@/lib/api";

interface Props {
  onResult: (result: AnalysisResult) => void;
}

const STEPS: Record<string, string> = {
  reading_message: "Reading your message...",
  detecting_patterns: "Detecting scam patterns...",
  checking_entities: "Checking phone numbers, UPI IDs, amounts...",
  analyzing_risk: "Analyzing risk level...",
  preparing_actions: "Preparing safety actions...",
  complete: "Analysis complete",
};

export default function AnalysisCard({ onResult }: Props) {
  const [status, setStatus] = useState<AnalysisStatus | null>(null);

  return (
    <div className="mt-2">
      {status && (
        <div className="space-y-4">
          {/* Progress bar */}
          <div className="h-1 w-full overflow-hidden rounded-full bg-elevated">
            <div
              className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-700 ease-out"
              style={{ width: `${status.progress}%` }}
            />
          </div>
          {/* Steps */}
          <div className="space-y-1.5">
            {Object.entries(STEPS).map(([key, label]) => {
              const order = Object.keys(STEPS).indexOf(key);
              const currentOrder = Object.keys(STEPS).indexOf(status.step);
              const done = order < currentOrder;
              const active = key === status.step;
              return (
                <div
                  key={key}
                  className={`flex items-center gap-2.5 text-sm transition-colors ${active ? "text-accent" : done ? "text-muted" : "text-faint"}`}
                >
                  <span className={`h-1.5 w-1.5 rounded-full flex-shrink-0 ${done ? "bg-accent" : active ? "bg-accent" : "bg-elevated"}`} />
                  {label}
                </div>
              );
            })}
          </div>
          <p className="text-sm text-muted animate-pulse">
            {status.message}
          </p>
        </div>
      )}
    </div>
  );
}
