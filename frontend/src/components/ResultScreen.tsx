"use client";

import { AnalysisResult } from "@/lib/api";

interface Props {
  result: AnalysisResult;
}

const RISK_BARS: Record<string, { gradient: string; label: string; badgeBg: string; scoreColor: string }> = {
  safe:     { gradient: "from-green-500 to-emerald-500",  label: "Safe",          badgeBg: "bg-green-500/10 text-green-400",  scoreColor: "text-green-400" },
  low:      { gradient: "from-green-500 to-emerald-500",  label: "Low risk",      badgeBg: "bg-green-500/10 text-green-400",  scoreColor: "text-green-400" },
  medium:   { gradient: "from-yellow-500 to-orange-500",  label: "Medium risk",   badgeBg: "bg-yellow-500/10 text-yellow-400", scoreColor: "text-yellow-400" },
  high:     { gradient: "from-orange-500 to-red-500",     label: "High risk",     badgeBg: "bg-orange-500/10 text-orange-400", scoreColor: "text-orange-400" },
  critical: { gradient: "from-red-500 to-rose-600",       label: "Critical",      badgeBg: "bg-red-500/10 text-red-400",      scoreColor: "text-red-400" },
};

const SCAM_LABELS: Record<string, string> = {
  impersonation: "Family Impersonation Scam",
  otp_scam: "OTP / Verification Scam",
  digital_arrest: "Digital Arrest / Police Impersonation",
  investment_scam: "Investment / Double Money Scam",
  phishing: "Phishing Scam",
  unknown_scam: "Suspicious Activity",
  unknown: "No clear scam pattern",
};

export default function ResultScreen({ result }: Props) {
  const r = RISK_BARS[result.risk_level] || RISK_BARS.safe;

  return (
    <div>
      {/* ── Risk score card ── */}
      <div className="card p-8">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs text-faint uppercase tracking-widest">Risk Score</p>
            <div className="mt-2 flex items-baseline gap-1">
              <span className={`text-6xl font-extrabold leading-none transition-colors ${r.scoreColor}`}>
                {result.risk_score}
              </span>
              <span className="text-xl text-faint">/100</span>
            </div>
            <p className="mt-2 text-sm text-muted">
              {SCAM_LABELS[result.scam_type] || result.scam_type}
            </p>
          </div>
          <span className={`text-xs font-semibold px-3 py-1.5 rounded-full border ${r.badgeBg}`}>
            {r.label}
          </span>
        </div>

        {/* Score bar */}
        <div className="mt-6 h-2 w-full overflow-hidden rounded-full bg-elevated">
          <div
            className={`h-full rounded-full bg-gradient-to-r ${r.gradient} transition-all duration-1000 ease-out`}
            style={{ width: `${result.risk_score}%` }}
          />
        </div>

        <p className="mt-5 text-base leading-relaxed text-muted">
          {result.summary}
        </p>
      </div>

      {/* ── Red flags ── */}
      {result.signals.length > 0 && (
        <div className="card p-6">
          <div className="mb-4 flex items-center gap-2 text-xs text-faint uppercase tracking-widest">
            <span className="h-2 w-2 rounded-full bg-danger" />
            Detected red flags ({result.signals.length})
          </div>
          <div className="space-y-3">
            {result.signals.map((sig, i) => (
              <div key={i} className="flex gap-3 p-3 rounded-xl bg-elevated/50">
                <span className={`mt-1.5 h-2 w-2 rounded-full flex-shrink-0 ${
                  sig.severity === "critical" ? "bg-red-500" :
                  sig.severity === "high" ? "bg-orange-500" :
                  "bg-yellow-500"
                }`} />
                <div>
                  <p className="text-sm font-medium text-theme">{sig.signal}</p>
                  <p className="mt-0.5 text-sm text-muted">{sig.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Extracted entities ── */}
      {Object.keys(result.extracted_entities).length > 0 && (
        <div className="card p-6">
          <div className="mb-4 flex items-center gap-2 text-xs text-faint uppercase tracking-widest">
            <span className="h-2 w-2 rounded-full bg-accent" />
            Extracted details
          </div>
          <div className="space-y-3">
            {(result.extracted_entities.phone_numbers as string[]) && (
              <div>
                <p className="text-xs text-faint mb-1">Phone numbers</p>
                <p className="text-sm text-theme font-mono">{(result.extracted_entities.phone_numbers as string[]).join(", ")}</p>
              </div>
            )}
            {(result.extracted_entities.upi_ids as string[]) && (
              <div>
                <p className="text-xs text-faint mb-1">UPI IDs</p>
                <p className="text-sm text-theme font-mono">{(result.extracted_entities.upi_ids as string[]).join(", ")}</p>
              </div>
            )}
            {(result.extracted_entities.amounts_inr as string[]) && (
              <div>
                <p className="text-xs text-faint mb-1">Amounts (INR)</p>
                <p className="text-sm text-theme">₹{(result.extracted_entities.amounts_inr as string[]).join(", ₹")}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Safe actions ── */}
      <div className="card p-6">
        <div className="mb-4 flex items-center gap-2 text-xs text-faint uppercase tracking-widest">
          <span className="h-2 w-2 rounded-full bg-safe-color" />
          Safe actions — abhi ye karo
        </div>
        <div className="space-y-3">
          {result.safe_actions.map((action, i) => (
            <div key={i} className="flex gap-3">
              <span className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-accent/30 text-xs font-bold text-accent">
                {i + 1}
              </span>
              <p className="text-sm text-muted leading-relaxed">{action}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Warning ── */}
      {result.warning_text && (
        <div className="card p-6 border-warning/30">
          <p className="text-xs text-warning mb-2 font-semibold uppercase tracking-widest">⚠️ WARNING</p>
          <pre className="text-sm text-muted whitespace-pre-wrap leading-relaxed font-mono">
            {result.warning_text}
          </pre>
        </div>
      )}

      {/* ── Download ── */}
      <div className="mt-6">
        <button
          onClick={() => {
            const blob = new Blob([JSON.stringify(result.evidence_report, null, 2)], { type: "application/json" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `suno-suraksha-report-${Date.now()}.json`;
            a.click();
            URL.revokeObjectURL(url);
          }}
          className="w-full flex items-center justify-center gap-2 py-3.5 px-6 text-sm font-semibold text-muted transition-colors hover:text-theme border border-theme rounded-xl hover:border-accent/30"
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Download Fraud Evidence Report
        </button>
      </div>
    </div>
  );
}
