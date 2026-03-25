export default function Confirmation({ txHash, onReset }) {
  return (
    <section className="mx-auto max-w-3xl">
      <div className="glass-panel brand-frame rounded-[2rem] p-6 text-center sm:p-10">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-brand/15 text-4xl text-brand">
          🎉
        </div>

        <h2 className="mt-6 text-3xl font-bold text-white">
          Payment confirmed
        </h2>
        <p className="mt-3 text-base leading-7 text-gray-300">
          The transaction was broadcast to CKB testnet. You can inspect the hash
          below or head back to your dashboard.
        </p>

        <div className="mono mt-8 rounded-[1.75rem] border border-white/10 bg-slate-950/70 px-5 py-4 text-left text-sm text-gray-200">
          <span className="block break-all">{txHash}</span>
        </div>

        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <a
            href={`https://testnet.explorer.nervos.org/transaction/${txHash}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex rounded-full border border-brand/30 bg-brand/10 px-5 py-3 text-sm font-semibold text-brand transition hover:border-brand hover:bg-brand/15"
          >
            View on Explorer
          </a>

          <button
            type="button"
            onClick={onReset}
            className="inline-flex rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:border-brand/30 hover:text-brand"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    </section>
  );
}
