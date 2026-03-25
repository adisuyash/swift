import { ccc } from "@ckb-ccc/connector-react";

export default function Landing() {
  const { open } = ccc.useCcc();

  return (
    <section className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-slate-950/40 px-6 py-12 sm:px-10 lg:px-14 lg:py-16">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(0,212,170,0.18),_transparent_32%),radial-gradient(circle_at_bottom_right,_rgba(14,165,233,0.14),_transparent_28%)]" />

      <div className="relative grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
        <div className="max-w-2xl">
          <span className="mb-5 inline-flex rounded-full border border-brand/20 bg-brand/10 px-4 py-2 text-sm font-medium text-brand">
            CKB Testnet Invoicing
          </span>

          <h1 className="max-w-xl text-4xl font-bold leading-tight text-white sm:text-5xl lg:text-6xl">
            Invoices that pay instantly
          </h1>

          <p className="mt-5 max-w-2xl text-lg leading-8 text-gray-300">
            Create invoice → QR → client scans → paid. No addresses. No
            errors.
          </p>

          <button
            type="button"
            onClick={() => open()}
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-brand px-6 py-3 text-base font-semibold text-slate-950 transition hover:scale-[1.01] hover:shadow-[0_0_35px_rgba(0,212,170,0.3)]"
          >
            Connect Wallet
            <span className="text-xl leading-none">↗</span>
          </button>
        </div>

        <div className="glass-panel brand-frame rounded-[2rem] p-6">
          <div className="rounded-[1.75rem] border border-white/10 bg-slate-950/70 p-6">
            <div className="flex items-center justify-between">
              <span className="text-sm uppercase tracking-[0.24em] text-gray-400">
                Payment Loop
              </span>
              <span className="rounded-full border border-brand/20 bg-brand/10 px-3 py-1 text-xs font-semibold text-brand">
                Live on Testnet
              </span>
            </div>

            <div className="mt-8 space-y-4">
              {[
                "Freelancer creates a clean invoice",
                "Swift turns it into a branded QR code",
                "Client scans, approves, and pays on CKB",
              ].map((item, index) => (
                <div
                  key={item}
                  className="flex items-start gap-4 rounded-2xl border border-white/8 bg-white/5 p-4"
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-brand/15 font-semibold text-brand">
                    0{index + 1}
                  </span>
                  <p className="pt-1 text-sm leading-6 text-gray-200">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
