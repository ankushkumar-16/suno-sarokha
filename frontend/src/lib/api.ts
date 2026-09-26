export const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

export async function analyzeText(content: string, mediaType: string = "text"): Promise<AnalysisResult> {
  const res = await fetch(`${API_BASE}/api/v1/analyze`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      content,
      media_type: mediaType,
      metadata: {},
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Analysis failed" }));
    throw new Error(err.detail || "Analysis failed");
  }

  return res.json();
}

export async function analyzeStream(
  content: string,
  onStatus: (status: AnalysisStatus) => void,
  onResult: (result: AnalysisResult) => void
): Promise<void> {
  const res = await fetch(`${API_BASE}/api/v1/analyze/stream`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      content,
      media_type: "text",
      metadata: {},
    }),
  });

  if (!res.ok) throw new Error("Stream failed");

  const reader = res.body?.getReader();
  if (!reader) throw new Error("No response body");

  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n\n");
    buffer = lines.pop() || "";

    for (const line of lines) {
      if (line.startsWith("data: ")) {
        const data = line.slice(6);
        try {
          const parsed = JSON.parse(data);
          if (parsed.risk_score !== undefined) {
            onResult(parsed as AnalysisResult);
          } else if (parsed.step) {
            onStatus(parsed as AnalysisStatus);
          }
        } catch {
          // Skip malformed SSE frames
        }
      }
    }
  }
}

export interface AnalysisResult {
  risk_score: number;
  risk_level: string;
  scam_type: string;
  is_likely_scam: boolean;
  summary: string;
  signals: Array<{
    signal: string;
    description: string;
    severity: string;
  }>;
  extracted_entities: Record<string, unknown>;
  safe_actions: string[];
  warning_text: string;
  evidence_report: Record<string, unknown>;
}

export interface AnalysisStatus {
  step: string;
  message: string;
  progress: number;
}
