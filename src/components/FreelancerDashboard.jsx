import { useEffect, useState } from "react";
import { getFreelancerInvoices } from "../lib/supabase";

const amountFormatter = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

function truncateHash(hash) {
  if (!hash) {
    return "";
  }

  return `${hash.slice(0, 10)}...${hash.slice(-8)}`;
}

export default function FreelancerDashboard({
  user,
  onCreateInvoice,
  onSwitchToClient,
}) {
  const [invoices, setInvoices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadInvoices() {
      setIsLoading(true);
      setError("");

      try {
        const rows = await getFreelancerInvoices(user.address);
        if (!cancelled) {
          setInvoices(rows);
        }
      } catch (loadError) {
        if (!cancelled) {
          console.error(loadError);
          setError(loadError.message || "Unable to load invoices.");
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    loadInvoices();

    return () => {
      cancelled = true;
    };
  }, [user.address]);

  return (
    <section className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
      <div className="glass-panel rounded-[2rem] p-6 sm:p-8">
        <span className="inline-flex rounded-full border border-brand/20 bg-brand/10 px-4 py-2 text-sm font-medium text-brand">
          Freelancer Mode
        </span>
        <h2 className="mt-5 text-3xl font-bold text-white">Hey {user.name} 👋</h2>
        <p className="mt-3 text-base leading-7 text-gray-300">
          Build invoices for your client, turn them into a QR code, and keep
          track of what is still pending versus what already landed on-chain.
        </p>

        <button
          type="button"
          onClick={onCreateInvoice}
          className="mt-8 inline-flex rounded-full bg-brand px-6 py-3 text-sm font-semibold text-slate-950 transition hover:scale-[1.01]"
        >
          Create Invoice
        </button>

        <button
          type="button"
          onClick={onSwitchToClient}
          className="mt-6 block text-sm font-medium text-brand transition hover:text-brand/80"
        >
          Switch to Client mode
        </button>
      </div>

      <div className="glass-panel rounded-[2rem] p-6 sm:p-8">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-gray-500">
              Invoice History
            </p>
            <h3 className="mt-2 text-2xl font-semibold text-white">
              Recent invoices
            </h3>
          </div>
          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-sm text-gray-300">
            {invoices.length} total
          </span>
        </div>

        {isLoading ? (
          <p className="mt-6 text-sm text-gray-400">Loading invoices...</p>
        ) : null}

        {error ? (
          <p className="mt-6 rounded-2xl border border-red-400/25 bg-red-500/10 px-4 py-3 text-sm text-red-100">
            {error}
          </p>
        ) : null}

        {!isLoading && !error && invoices.length === 0 ? (
          <div className="mt-6 rounded-[1.75rem] border border-dashed border-white/10 bg-slate-950/60 p-6 text-sm text-gray-400">
            No invoices yet. Create your first one to generate a QR payment
            request.
          </div>
        ) : null}

        <div className="mt-6 space-y-4">
          {invoices.map((invoice) => (
            <article
              key={invoice.id}
              className="rounded-[1.75rem] border border-white/10 bg-slate-950/65 p-5"
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-lg font-semibold text-white">
                    {invoice.description}
                  </p>
                  <p className="mt-2 text-sm text-gray-400">{invoice.name}</p>
                </div>

                <span
                  className={`inline-flex self-start rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] ${
                    invoice.status === "paid"
                      ? "bg-green-500/15 text-green-300"
                      : "bg-yellow-500/15 text-yellow-200"
                  }`}
                >
                  {invoice.status}
                </span>
              </div>

              <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xl font-semibold text-brand">
                  {amountFormatter.format(invoice.amount)} CKB
                </p>

                {invoice.status === "paid" && invoice.tx_hash ? (
                  <div className="flex flex-col gap-2 text-sm">
                    <span className="mono break-all text-gray-300">
                      {truncateHash(invoice.tx_hash)}
                    </span>
                    <a
                      href={`https://testnet.explorer.nervos.org/transaction/${invoice.tx_hash}`}
                      target="_blank"
                      rel="noreferrer"
                      className="font-semibold text-brand transition hover:text-brand/80"
                    >
                      View on Explorer
                    </a>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">
                    Waiting for client payment
                  </p>
                )}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
