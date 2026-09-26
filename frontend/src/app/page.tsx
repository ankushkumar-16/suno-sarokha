import Link from "next/link";

export default function Home() {
  const features = [
    {
      icon: (
        <svg className="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
        </svg>
      ),
      title: "WhatsApp message",
      desc: "Paste suspicious text — UPI, OTP, emergency calls",
      href: "/analysis",
      interactive: true,
    },
    {
      icon: (
        <svg className="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
        </svg>
      ),
      title: "Voice note",
      desc: "Audio transcribe + analyze",
      href: null,
      interactive: false,
    },
    {
      icon: (
        <svg className="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      title: "Screenshot",
      desc: "Scam message screenshot upload",
      href: null,
      interactive: false,
    },
  ];

  const steps = [
    { n: "01", title: "Message paste karo", desc: "WhatsApp text, transcript, or OCR text" },
    { n: "02", title: "AI check karta hai", desc: "Patterns, entities, risk signals detect karta hai" },
    { n: "03", title: "Risk result milta hai", desc: "Score 0-100, scam type, 3 safe actions" },
    { n: "04", title: "Report download karo", desc: "Fraud evidence summary for cybercrime complaint" },
  ];

  return (
    <div className="relative">
      {/* Ambient glow orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -right-40 h-[500px] w-[500px] rounded-full bg-indigo-500/10 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-[600px] w-[600px] rounded-full bg-purple-500/8 blur-3xl" />
      </div>

      {/* Nav */}
      <nav className="relative z-10 flex h-16 items-center justify-between border-b border-theme px-6">
        <span className="text-sm font-semibold tracking-wide text-theme">Suno Suraksha</span>
        <Link href="/analysis" className="text-sm text-muted hover:text-theme transition-colors">
          Check message →
        </Link>
      </nav>

      {/* Hero */}
      <header className="relative z-10 pt-28 pb-20 text-center">
        <div className="mx-auto max-w-3xl px-6">
          {/* Badge */}
          <div className="mx-auto mb-6 flex max-w-xs items-center justify-center gap-2 rounded-full border border-theme/50 bg-elevated/60 px-4 py-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />
            <span className="text-xs text-muted">Hackathon Project — AI + Automation</span>
          </div>

          {/* Title */}
          <h1 className="font-sans text-5xl md:text-7xl font-extrabold leading-[1] tracking-tight text-balance text-theme">
            Suno
            <br />
            <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Suraksha
            </span>
          </h1>

          {/* Tagline */}
          <p className="mt-6 text-xl text-muted font-light">
            Pehle verify karo, phir pay karo.
          </p>

          {/* Desc */}
          <p className="mt-6 max-w-xl text-base leading-relaxed text-muted text-balance">
            AI-powered anti-scam copilot for Indian families. Suspicious WhatsApp message, voice note, or screenshot mila? Check karo — risk score, scam signals, aur safe actions milenge.
          </p>

          {/* CTA */}
          <div className="mt-10 flex flex-col items-center gap-4">
            <Link
              href="/analysis"
              className="group relative inline-flex h-12 w-64 items-center justify-center rounded-xl bg-accent text-base font-semibold text-white shadow-lg shadow-indigo-500/20 transition-all hover:bg-indigo-400 hover:shadow-indigo-500/30"
            >
              <span className="relative z-10">Check a message now</span>
              <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 transition-opacity group-hover:opacity-100 group-hover:animate-pulse" />
            </Link>
            <p className="text-xs text-faint">No signup required</p>
          </div>
        </div>
      </header>

      {/* Features */}
      <section className="relative z-10 border-t border-theme py-20">
        <div className="mx-auto grid max-w-5xl px-6 gap-6 md:grid-cols-3">
          {features.map((f, i) => (
            f.href ? (
              <Link key={i} href={f.href} className="group block">
                <div className="card p-6 card-interactive">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10 text-accent group-hover:bg-accent/20 transition-colors">
                    {f.icon}
                  </div>
                  <h2 className="mt-4 text-xl font-semibold text-theme group-hover:text-accent transition-colors">
                    {f.title}
                  </h2>
                  <p className="mt-2 text-sm text-muted">{f.desc}</p>
                </div>
              </Link>
            ) : (
              <div key={i} className="card p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-elevated text-muted">
                  {f.icon}
                </div>
                <h2 className="mt-4 text-xl font-semibold text-theme">{f.title}</h2>
                <p className="mt-2 text-sm text-muted">{f.desc}</p>
              </div>
            )
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="relative z-10 border-t border-theme py-20">
        <div className="mx-auto max-w-4xl px-6">
          <p className="mb-14 text-center text-xs text-faint uppercase tracking-[0.2em]">
            Kaise kaam karta hai
          </p>
          <div className="grid gap-8 md:grid-cols-4">
            {steps.map((s) => (
              <div key={s.n} className="text-center">
                <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-full bg-elevated border border-theme text-sm font-bold text-accent">
                  {s.n}
                </div>
                <h3 className="font-sans text-lg font-semibold text-theme">{s.title}</h3>
                <p className="mt-1.5 text-sm text-muted">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats strip */}
      <section className="relative z-10 border-t border-theme bg-elevated/40 py-12">
        <div className="mx-auto grid max-w-4xl grid-cols-3 divide-x divide-theme px-6 text-center">
          <div>
            <p className="text-3xl font-bold text-accent">100%</p>
            <p className="mt-1 text-xs text-muted">Offline — no data leaves your device</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-accent">&lt;2s</p>
            <p className="mt-1 text-xs text-muted">Average analysis time</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-accent">1930</p>
            <p className="mt-1 text-xs text-muted">Cybercrime helpline (India)</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-theme py-10 text-center">
        <div className="mx-auto max-w-2xl px-6">
          <p className="text-sm text-muted">
            Built for hackathon — Suno Suraksha
          </p>
          <p className="mt-2 text-xs text-faint">
            Asli police aapko call/message se arrest nahi karti.
            <br />
            National Cyber Crime Helpline: 1930
          </p>
        </div>
      </footer>
    </div>
  );
}
