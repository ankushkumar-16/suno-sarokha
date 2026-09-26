import Link from "next/link";
import { Suspense } from "react";

export default function Home() {
  return (
    <div className="min-h-screen bg-suno-dark">
      {/* Hero section */}
      <header className="max-w-4xl mx-auto px-4 pt-12 pb-8 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-suno-accent/10 border border-suno-accent/20 text-suno-accent text-xs font-medium mb-4">
          <span className="w-1.5 h-1.5 rounded-full bg-suno-accent animate-pulse" />
          Hackathon Project — AI + Automation
        </div>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-suno-text mb-3">
          Suno Sarokha
        </h1>
        <p className="text-lg text-suno-muted font-medium">
          Pehle verify karo, phir pay karo
        </p>
        <p className="mt-4 text-sm text-suno-muted max-w-xl mx-auto leading-relaxed">
          AI-powered anti-scam copilot for Indian families.
          Suspicious WhatsApp message, voice note, ya screenshot mila?
          Check karo — risk score, scam signals, aur safe actions milenge.
        </p>
      </header>

      {/* Three input options */}
      <section className="max-w-4xl mx-auto px-4 pb-12">
        <div className="grid md:grid-cols-3 gap-4">
          {/* Option 1: WhatsApp text */}
          <Link href="/analysis" className="group block">
            <div className="bg-suno-card border border-suno-border rounded-2xl p-5 text-center hover:border-suno-accent/30 hover:shadow-lg hover:shadow-suno-accent/5 transition-all duration-300">
              <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-suno-accent/10 flex items-center justify-center group-hover:bg-suno-accent/20 transition-colors">
                <svg className="w-6 h-6 text-suno-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
              </div>
              <h3 className="text-sm font-semibold text-suno-text mb-1">
                WhatsApp message
              </h3>
              <p className="text-xs text-suno-muted">
                Paste suspicious text — UPI, OTP, emergency calls
              </p>
            </div>
          </Link>

          {/* Option 2: Voice note */}
          <div className="group block">
            <div className="bg-suno-card border border-suno-border rounded-2xl p-5 text-center opacity-60">
              <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-suno-warning/10 flex items-center justify-center">
                <svg className="w-6 h-6 text-suno-warning" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
              </div>
              <h3 className="text-sm font-semibold text-suno-text mb-1">
                Voice note
              </h3>
              <p className="text-xs text-suno-muted">
                Audio transcribe + analyze
                <br />
                <span className="text-suno-accent/60">(Whisper pending)</span>
              </p>
            </div>
          </div>

          {/* Option 3: Screenshot */}
          <div className="group block">
            <div className="bg-suno-card border border-suno-border rounded-2xl p-5 text-center opacity-60">
              <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-suno-safe/10 flex items-center justify-center">
                <svg className="w-6 h-6 text-suno-safe" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-sm font-semibold text-suno-text mb-1">
                Screenshot
              </h3>
              <p className="text-xs text-suno-muted">
                Scam message screenshot upload
                <br />
                <span className="text-suno-accent/60">(OCR pending)</span>
              </p>
            </div>
          </div>
        </div>

        <p className="text-xs text-suno-muted/50 text-center mt-3">
          Audio aur screenshot features production me integrate honge — abhi text analysis available hai
        </p>
      </section>

      {/* How it works */}
      <section className="max-w-4xl mx-auto px-4 pb-16">
        <h2 className="text-sm font-semibold text-suno-text text-center mb-6">
          Kaise kaam karta hai
        </h2>
        <div className="grid md:grid-cols-4 gap-3">
          {[
            { num: "1", label: "Message paste karo", desc: "WhatsApp text, transcript, ya OCR text" },
            { num: "2", label: "AI check karta hai", desc: "Patterns, entities, risk signals detect karta hai" },
            { num: "3", label: "Risk result milta hai", desc: "Score 0-100, scam type, 3 safe actions" },
            { num: "4", label: "Report download karo", desc: "Fraud evidence summary cybercrime complaint ke liye" },
          ].map((step) => (
            <div
              key={step.num}
              className="bg-suno-card border border-suno-border rounded-xl p-4 text-center"
            >
              <div className="w-8 h-8 mx-auto mb-2 rounded-full bg-suno-accent/10 flex items-center justify-center">
                <span className="text-sm font-bold text-suno-accent">{step.num}</span>
              </div>
              <p className="text-sm font-medium text-suno-text mb-1">{step.label}</p>
              <p className="text-xs text-suno-muted">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Tagline footer */}
      <footer className="max-w-4xl mx-auto px-4 pb-8 text-center">
        <p className="text-sm text-suno-muted/60">
          Built for hackathon —{" "}
          <span className="text-suno-muted">Suno Sarokha</span>
        </p>
        <p className="text-xs text-suno-muted/40 mt-1">
          Asli police aapko call/message se arrest nahi karti.
          <br />
          National Cyber Crime Helpline: 1930
        </p>
      </footer>
    </div>
  );
}
