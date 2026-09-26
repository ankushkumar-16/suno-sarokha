"use client";

import { useState, useCallback } from "react";
import InputPanel from "@/components/InputPanel";
import AnalysisCard from "@/components/AnalysisCard";
import ResultScreen from "@/components/ResultScreen";
import { AnalysisResult, AnalysisStatus } from "@/lib/api";

export default function AnalysisPage() {
  const [result, setResult] = useState<AnalysisResult | null>(null);

  const handleResult = useCallback((res: AnalysisResult) => {
    setResult(res);
  }, []);

  return (
    <div className="min-h-screen bg-suno-dark">
      {/* Header */}
      <header className="max-w-4xl mx-auto px-4 pt-8 pb-4">
        <Link href="/" className="inline-flex items-center gap-1 text-sm text-suno-muted hover:text-suno-text transition-colors mb-4">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to home
        </Link>
        <h1 className="text-2xl font-bold text-suno-text">Check this message</h1>
        <p className="text-sm text-suno-muted mt-1">
          Suspicious WhatsApp message paste karo — AI analyze karega
        </p>
      </header>

      {/* Main content */}
      <main className="max-w-4xl mx-auto px-4 pb-16">
        {/* Input panel */}
        <div className="mb-8">
          <InputPanel onResult={handleResult} />
        </div>

        {/* Analysis progress (shows during streaming) */}
        {!result && (
          <div className="mb-8">
            <AnalysisCard onResult={handleResult} />
          </div>
        )}

        {/* Result screen */}
        {result && (
          <div className="animate-fadeIn">
            <ResultScreen result={result} />
          </div>
        )}
      </main>

      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.4s ease-out;
        }
      `}</style>
    </div>
  );
}

// Fix Link import
import Link from "next/link";
