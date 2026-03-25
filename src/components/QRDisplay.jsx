import { useState } from "react";

const amountFormatter = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

export default function QRDisplay({ invoice, qrDataURL, paymentURL, onBack }) {
  const [copyStatus, setCopyStatus] = useState("Copy Link");

  async function handleCopyLink() {
    try {
      await navigator.clipboard.writeText(paymentURL);
      setCopyStatus("Copied");
    } catch (error) {
      console.error(error);
      setCopyStatus("Copy Failed");
    }
  }

  return (
    <section className="mx-auto max-w-4xl">
      <div className="glass-panel rounded-[2rem] p-6 sm:p-8">
        <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
          <div>
            <span className="inline-flex rounded-full border border-brand/20 bg-brand/10 px-4 py-2 text-sm font-medium text-brand">
              Invoice Ready
            </span>
            <h2 className="mt-5 text-3xl font-bold text-white">
              Share with your client
            </h2>
            <p className="mt-3 text-base leading-7 text-gray-300">
              The QR contains a Swift payment link. Your client can scan it or
              use the same URL in WhatsApp, email, or SMS.
            </p>

            <div className="mt-8 rounded-[1.75rem] border border-white/10 bg-slate-950/70 p-5">
              <p className="text-sm font-semibold text-white">{invoice.name}</p>
              <p className="mt-3 text-sm leading-6 text-gray-300">
                {invoice.description}
              </p>
              <p className="mt-5 text-2xl font-semibold text-brand">
                {amountFormatter.format(invoice.amount)} CKB
              </p>
            </div>

            <button
              type="button"
              onClick={onBack}
              className="mt-8 inline-flex rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:border-brand/30 hover:text-brand"
            >
              Back
            </button>
          </div>

          <div className="flex flex-col items-center">
            <div className="brand-frame rounded-[2rem] border border-brand/20 bg-slate-950 p-6">
              <img
                src={qrDataURL}
                alt="Invoice QR code"
                className="h-[300px] w-[300px] rounded-2xl"
              />
            </div>

            <div className="mt-5 w-full max-w-[360px]">
              <label className="mb-2 block text-sm font-medium text-gray-300">
                Share link
              </label>
              <div className="flex flex-col gap-3 sm:flex-row">
                <input
                  readOnly
                  value={paymentURL}
                  onFocus={(event) => event.target.select()}
                  className="mono w-full rounded-2xl border border-white/10 bg-gray-800 px-4 py-3 text-sm text-gray-200 outline-none"
                />
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="rounded-full border border-brand/30 bg-brand/10 px-5 py-3 text-sm font-semibold text-brand transition hover:border-brand hover:bg-brand/15"
                >
                  {copyStatus}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
