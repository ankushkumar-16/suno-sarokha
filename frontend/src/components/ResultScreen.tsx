"use client";

import { AnalysisResult } from "@/lib/api";

interface Props {
  result: AnalysisResult;
}

const RISK_COLORS: Record<string, { bg: string; border: string; text: string }> = {
  safe: { bg: "bg-green-900/20", border: "border-green-500/30", text: "text-green-400" },
  low: { bg: "bg-green-900/20", border: "border-green-500/30", text: "text-green-400" },
  medium: { bg: "bg-yellow-900/20", border: "border-yellow-500/30", text: "text-yellow-400" },
  high: { bg: "bg-red-900/20", border: "border-red-500/30", text: "text-red-400" },
  critical: { bg: "bg-red-900/30", border: "border-red-500/50", text: "text-red-300" },
};

export default function ResultScreen({ result }: Props) {
  const colors = RISK_COLORS[result.risk_level] || RISK_COLORS.safe;

  const scamTypeLabels: Record<string, string> = {
    impersonation: "Family Impersonation Scam",
    otp_scam: "OTP / Verification Scam",
    digital_arrest: "Digital Arrest / Police Impersonation",
    investment_scam: "Investment / Double Money Scam",
    phishing: "Phishing Scam",
    unknown_scam: "Suspicious Activity",
    unknown: "No clear scam pattern",
  };

  return (
    <div className="space-y-6 w-full max-w-xl">
      {/* Risk score card */}
      <div className={`${colors.bg} ${colors.border} border rounded-2xl p-6`}>
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-sm text-suno-muted mb-1">Risk Level</p>
            <h2 className={`text-3xl font-bold ${colors.text}`}>
              {result.risk_score}
              <span className="text-lg ml-1 text-suno-muted">/100</span>
            </h2>
          </div>
          <div className="text-right">
            <p className={`text-xs font-medium px-2 py-1 rounded-full ${colors.bg} ${colors.text} border ${colors.border}`}>
              {result.risk_level.toUpperCase()}
            </p>
            <p className="text-xs text-suno-muted mt-1">
              {scamTypeLabels[result.scam_type] || result.scam_type}
            </p>
          </div>
        </div>

        {/* Summary */}
        <p className="text-sm text-suno-text leading-relaxed">
          {result.summary}
        </p>
      </div>

      {/* Red flags */}
      {result.signals.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-suno-text mb-3 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-suno-danger" />
            Detected red flags ({result.signals.length})
          </h3>
          <div className="space-y-2">
            {result.signals.map((sig, i) => (
              <div
                key={i}
                className="flex items-start gap-3 p-3 bg-suno-card border border-suno-border rounded-xl"
              >
                <div
                  className={`w-2 h-2 mt-1.5 rounded-full flex-shrink-0 ${
                    sig.severity === "critical"
                      ? "bg-red-500"
                      : sig.severity === "high"
                      ? "bg-orange-500"
                      : "bg-yellow-500"
                  }`}
                />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-suno-text">{sig.signal}</p>
                  <p className="text-xs text-suno-muted mt-0.5">{sig.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Extracted entities */}
      {Object.keys(result.extracted_entities).length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-suno-text mb-3 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-suno-accent" />
            Extracted details
          </h3>
          <div className="bg-suno-card border border-suno-border rounded-xl p-4">
            {(result.extracted_entities.phone_numbers as string[]) && (
              <div className="mb-2">
                <p className="text-xs text-suno-muted mb-1">Phone numbers</p>
                <p className="text-sm text-suno-text font-mono">
                  {(result.extracted_entities.phone_numbers as string[]).join(", ")}
                </p>
              </div>
            )}
            {(result.extracted_entities.upi_ids as string[]) && (
              <div className="mb-2">
                <p className="text-xs text-suno-muted mb-1">UPI IDs</p>
                <p className="text-sm text-suno-text font-mono">
                  {(result.extracted_entities.upi_ids as string[]).join(", ")}
                </p>
              </div>
            )}
            {(result.extracted_entities.amounts_inr as string[]) && (
              <div>
                <p className="text-xs text-suno-muted mb-1">Amounts (INR)</p>
                <p className="text-sm text-suno-text">
                  ₹{(result.extracted_entities.amounts_inr as string[]).join(", ₹")}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Safe actions */}
      <div>
        <h3 className="text-sm font-semibold text-suno-text mb-3 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-suno-safe" />
          Safe actions — abhi ye karo
        </h3>
        <div className="space-y-2">
          {result.safe_actions.map((action, i) => (
            <div
              key={i}
              className="flex items-start gap-3 p-3 bg-suno-card border border-suno-border rounded-xl group hover:border-suno-safe/30 transition-colors duration-200"
            >
              <span className="w-6 h-6 rounded-full bg-suno-safe/20 text-suno-safe flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                {i + 1}
              </span>
              <p className="text-sm text-suno-text leading-relaxed">{action}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Warning text */}
      {result.warning_text && (
        <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-2xl p-4">
          <p className="text-xs font-semibold text-yellow-400 mb-2">⚠️ WARNING</p>
          <pre className="text-sm text-yellow-200 whitespace-pre-wrap font-sans leading-relaxed">
            {result.warning_text}
          </pre>
        </div>
      )}

      {/* Report button */}
      <button
        onClick={() => {
          const report = result.evidence_report;
          const blob = new Blob([
            JSON.stringify(report, null, 2),
          ], { type: "application/json" });
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = `suno-sarokha-report-${Date.now()}.json`;
          a.click();
          URL.revokeObjectURL(url);
        }}
        className="w-full py-3 px-4 bg-suno-accent hover:bg-suno-accent/80 text-white rounded-xl font-semibold transition-all duration-200 shadow-lg shadow-suno-accent/20 flex items-center justify-center gap-2"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        Download Fraud Evidence Report
      </button>
    </div>
  );
}
