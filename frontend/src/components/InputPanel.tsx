"use client";

import { useState, useRef } from "react";
import { analyzeStream, AnalysisStatus, AnalysisResult } from "@/lib/api";

interface Props {
  onResult: (result: AnalysisResult) => void;
}

const PLACEHOLDER =
  "Paste a suspicious WhatsApp message here...\n\nExample:\n\"Papa emergency ho gaya, accident ho gaya, please INR 25000 bhejo, koi call mat karna. UPI: xyz@paytm\"";

type Mode = "text" | "audio" | "screenshot";

const MODES: Array<{ key: Mode; label: string; colorClass: string; iconPath: string }> = [
  {
    key: "text",
    label: "Text",
    colorClass: "bg-accent/10 text-accent border-accent/20",
    iconPath: "M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z",
  },
  {
    key: "audio",
    label: "Voice note",
    colorClass: "bg-warning/10 text-warning border-warning/20",
    iconPath: "M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z",
  },
  {
    key: "screenshot",
    label: "Screenshot",
    colorClass: "bg-safe-color/10 text-safe-color border-safe-color/20",
    iconPath: "M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z",
  },
];

export default function InputPanel({ onResult }: Props) {
  const [mode, setMode] = useState<Mode>("text");
  const [input, setInput] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

  const analyze = async () => {
    if (!input.trim()) { setError("Message daalo pehle"); return; }
    if (input.trim().length < 5) { setError("Message thoda bada hai — kam se kam 5 characters chahiye"); return; }
    setAnalyzing(true);
    setError(null);
    try {
      await analyzeStream(input, () => {}, onResult);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Analysis failed — check API connection");
    } finally {
      setAnalyzing(false);
    }
  };

  const handleUpload = async (f: File) => {
    setAnalyzing(true);
    setError(null);
    setFile(f);
    try {
      const form = new FormData();
      form.append("file", f);
      const isImage = f.type.startsWith("image/");
      const endpoint = isImage ? "/api/v1/upload/screenshot" : "/api/v1/upload/audio";
      const res = await fetch(API + endpoint, { method: "POST", body: form });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.detail || "Upload failed");
      }
      const data = await res.json();
      if (isImage && data.extracted_text && !data.extracted_text.startsWith("(")) {
        setInput(data.extracted_text);
        await analyzeStream(data.extracted_text, () => {}, onResult);
      } else if (isImage) {
        setError("Screenshot save ho gaya — OCR abhi integrate ho raha hai. Text paste karke analyze kar sakte hain.");
      } else {
        setError("Audio upload ho gaya — " + f.name + ". Transcription (Whisper) abhi integrate ho raha hai.");
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setAnalyzing(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > 50 * 1024 * 1024) { setError("File 50MB se bada nahi ho sakta"); return; }
    if (f.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (ev) => setPreview(ev.target?.result as string);
      reader.readAsDataURL(f);
    }
    handleUpload(f);
    e.target.value = "";
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      analyze();
    }
  };

  const activeMode = MODES.find((m) => m.key === mode)!;

  return (
    <div className="mt-4">
      {/* Mode tabs */}
      <div className="flex gap-1 border-b border-theme">
        {MODES.map((m) => (
          <button
            key={m.key}
            onClick={() => { setMode(m.key); setError(null); setPreview(null); setFile(null); }}
            className={`relative px-5 py-3 text-sm font-medium transition-colors ${
              mode === m.key
                ? "text-theme"
                : "text-faint hover:text-muted"
            }`}
          >
            {mode === m.key && (
              <div className={`absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-accent to-purple-500`} />
            )}
            <span className="relative z-10 flex items-center gap-2">
              <svg className={`h-4 w-4 rounded border ${m.colorClass}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d={m.iconPath} />
              </svg>
              {m.label}
            </span>
          </button>
        ))}
      </div>

      {/* Text mode */}
      {mode === "text" && (
        <div className="card mt-4 p-5">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder={PLACEHOLDER}
            disabled={analyzing}
            rows={7}
            className="w-full resize-none bg-elevated border border-theme rounded-xl p-4 text-base text-theme placeholder:text-faint/60 focus:outline-none focus:border-accent/40 focus:ring-1 focus:ring-accent/20 disabled:opacity-50 transition-colors font-mono text-sm leading-relaxed"
          />
          <div className="mt-4 flex items-center justify-between">
            <span className="text-xs text-faint font-mono">{input.length} characters</span>
            <button
              onClick={analyze}
              disabled={analyzing || !input.trim()}
              className={`px-6 py-2.5 text-sm font-semibold transition-all ${
                analyzing
                  ? "bg-elevated text-faint cursor-not-allowed"
                  : input.trim()
                  ? "bg-accent hover:bg-indigo-400 text-white shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30"
                  : "bg-elevated text-faint cursor-not-allowed"
              }`}
            >
              {analyzing ? (
                <span className="flex items-center gap-2">
                  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Analyzing...
                </span>
              ) : "Check this"}
            </button>
          </div>
        </div>
      )}

      {/* Audio mode */}
      {mode === "audio" && (
        <div className="card mt-4 p-8 text-center">
          <div className="flex flex-col items-center gap-4">
            <div className={`flex h-16 w-16 items-center justify-center rounded-2xl border ${activeMode.colorClass}`}>
              <svg className="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d={activeMode.iconPath} />
              </svg>
            </div>
            <p className="text-base font-medium text-theme">Voice note select karo</p>
            <p className="text-xs text-faint">MP3, WAV, OGG, M4A — max 50MB</p>
          </div>

          {file && <p className="mt-4 text-xs text-muted font-mono">{file.name}</p>}

          {preview && (
            <div className="mt-4 flex justify-center">
              <img src={preview} alt="preview" className="h-24 w-24 rounded-xl border border-theme object-cover" />
            </div>
          )}

          <input
            ref={fileRef}
            type="file"
            accept="audio/*,.mp3,.wav,.ogg,.m4a,.aac,.flac"
            onChange={handleFileChange}
            disabled={analyzing}
            className="hidden"
          />
          <button
            onClick={() => fileRef.current?.click()}
            disabled={analyzing}
            className={`mt-6 w-full py-3 text-sm font-semibold transition-all ${
              analyzing
                ? "bg-elevated text-faint cursor-not-allowed"
                : "bg-accent hover:bg-indigo-400 text-white shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30"
            }`}
          >
            {analyzing ? "Uploading..." : "Select Voice Note"}
          </button>

          {error && <p className="mt-3 text-xs text-danger">{error}</p>}
          <p className="mt-4 text-xs text-faint/60">
            Audio transcription (Whisper) abhi integrate ho raha hai — file upload ho jayegi
          </p>
        </div>
      )}

      {/* Screenshot mode */}
      {mode === "screenshot" && (
        <div className="card mt-4 p-8 text-center">
          <div className="flex flex-col items-center gap-4">
            <div className={`flex h-16 w-16 items-center justify-center rounded-2xl border ${activeMode.colorClass}`}>
              <svg className="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d={activeMode.iconPath} />
              </svg>
            </div>
            <p className="text-base font-medium text-theme">Screenshot upload karo</p>
            <p className="text-xs text-faint">JPG, PNG, WebP — max 10MB</p>
          </div>

          {preview && (
            <div className="mt-4 flex justify-center">
              <img src={preview} alt="screenshot" className="h-36 w-48 rounded-xl border border-theme object-cover shadow-lg" />
            </div>
          )}

          {file && <p className="mt-4 text-xs text-muted font-mono">{file.name}</p>}

          <input
            type="file"
            accept="image/*,.jpg,.jpeg,.png,.webp"
            onChange={handleFileChange}
            disabled={analyzing}
            className="hidden"
          />
          <button
            onClick={() => fileRef.current?.click()}
            disabled={analyzing}
            className={`mt-6 w-full py-3 text-sm font-semibold transition-all ${
              analyzing
                ? "bg-elevated text-faint cursor-not-allowed"
                : "bg-accent hover:bg-indigo-400 text-white shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30"
            }`}
          >
            {analyzing ? "Uploading..." : "Select Screenshot"}
          </button>

          {error && <p className="mt-3 text-xs text-danger">{error}</p>}
          <p className="mt-4 text-xs text-faint/60">
            OCR abhi integrate ho raha hai — text extract hoke analyze hoga
          </p>
        </div>
      )}
    </div>
  );
}
