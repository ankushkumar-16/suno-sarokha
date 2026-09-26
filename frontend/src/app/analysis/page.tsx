"use client";

import { useState } from "react";
import Link from "next/link";
import InputPanel from "@/components/InputPanel";
import AnalysisCard from "@/components/AnalysisCard";
import ResultScreen from "@/components/ResultScreen";
import { AnalysisResult, AnalysisStatus } from "@/lib/api";

export default function AnalysisPage() {
  const [result, setResult] = useState<AnalysisResult | null>(null);

  const handleResult = (res: AnalysisResult) => {
    setResult(res);
  };

  return (
    <div className="relative min-h-screen">
      {/* Ambient glow */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute -top-40 -right-40 h-[500px] w-[500px] rounded-full bg-indigo-500/8 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-[600px] w-[600px] rounded-full bg-purple-500/6 blur-3xl" />
      </div>

      {/* Top bar */}
      <header className="flex h-14 items-center justify-between border-b border-theme px-6">
        <Link href="/" className="text-sm text-faint hover:text-theme transition-colors">
          ← Back
        </Link>
        <span className="text-xs text-faint">Suno Suraksha</span>
      </header>

      {/* Heading */}
      <main className="mx-auto max-w-2xl px-6 pb-24 pt-20">
        <div className="mb-10">
          <p className="text-xs text-faint uppercase tracking-[0.2em]">Check</p>
          <h1 className="mt-2 text-4xl font-bold text-theme">Check this message</h1>
          <p className="mt-3 max-w-lg text-base text-muted">
            Suspicious WhatsApp message paste karo — AI analyze karega
          </p>
        </div>

        {/* Input */}
        <div className="mb-6">
          <InputPanel onResult={handleResult} />
        </div>

        {/* Progress */}
        {!result && (
          <div className="mb-6">
            <AnalysisCard onResult={handleResult} />
          </div>
        )}

        {/* Result */}
        {result && (
          <div className="animate-fade-up">
            <ResultScreen result={result} />
          </div>
        )}
      </main>
    </div>
  );
}
