import { useEffect, useState } from "react";
import { getClientPayments } from "../lib/supabase";

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

export default function ClientDashboard({
  user,
  onScan,
  onSwitchToFreelancer,
}) {
  const [payments, setPayments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadPayments() {
      setIsLoading(true);
      setError("");

      try {
        const rows = await getClientPayments(user.address);
        if (!cancelled) {
          setPayments(rows);
        }
      } catch (loadError) {
        if (!cancelled) {
          console.error(loadError);
          setError(loadError.message || "Unable to load payments.");
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    loadPayments();

    return () => {
      cancelled = true;
    };
  }, [user.address]);

  return (
    <section className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
      <div className="glass-panel rounded-[2rem] p-6 sm:p-8">
        <span className="inline-flex rounded-full border border-brand/20 bg-brand/10 px-4 py-2 text-sm font-medium text-brand">
          Client Mode
        </span>
        <h2 className="mt-5 text-3xl font-bold text-white">Hey {user.name} 👋</h2>
        <p className="mt-3 text-base leading-7 text-gray-300">
          Scan a freelancer QR, review the payment request, and approve it from
          your connected CKB wallet.
        </p>

        <button
          type="button"
          onClick={onScan}
          className="mt-8 inline-flex rounded-full bg-brand px-6 py-3 text-sm font-semibold text-slate-950 transition hover:scale-[1.01]"
        >
          Scan &amp; Pay
        </button>

        <button
          type="button"
          onClick={onSwitchToFreelancer}
          className="mt-6 block text-sm font-medium text-brand transition hover:text-brand/80"
        >
          Switch to Freelancer mode
        </button>
      </div>

      <div className="glass-panel rounded-[2rem] p-6 sm:p-8">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-gray-500">
              Payment History
            </p>
            <h3 className="mt-2 text-2xl font-semibold text-white">
              Recent payments
            </h3>
          </div>
          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-sm text-gray-300">
            {payments.length} total
          </span>
        </div>

        {isLoading ? (
          <p className="mt-6 text-sm text-gray-400">Loading payments...</p>
        ) : null}

        {error ? (
          <p className="mt-6 rounded-2xl border border-red-400/25 bg-red-500/10 px-4 py-3 text-sm text-red-100">
            {error}
          </p>
        ) : null}

        {!isLoading && !error && payments.length === 0 ? (
          <div className="mt-6 rounded-[1.75rem] border border-dashed border-white/10 bg-slate-950/60 p-6 text-sm text-gray-400">
            No payments yet. Scan a Swift QR invoice to complete your first one.
          </div>
        ) : null}

        <div className="mt-6 space-y-4">
          {payments.map((payment) => (
            <article
              key={payment.id}
              className="rounded-[1.75rem] border border-white/10 bg-slate-950/65 p-5"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-lg font-semibold text-white">
                    {payment.description}
                  </p>
                  <p className="mt-2 text-sm text-gray-400">{payment.name}</p>
                </div>

                <p className="text-xl font-semibold text-brand">
                  {amountFormatter.format(payment.amount)} CKB
                </p>
              </div>

              {payment.tx_hash ? (
                <div className="mt-5 flex flex-col gap-2 text-sm">
                  <span className="mono break-all text-gray-300">
                    {truncateHash(payment.tx_hash)}
                  </span>
                  <a
                    href={`https://testnet.explorer.nervos.org/transaction/${payment.tx_hash}`}
                    target="_blank"
                    rel="noreferrer"
                    className="font-semibold text-brand transition hover:text-brand/80"
                  >
                    View on Explorer
                  </a>
                </div>
              ) : null}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
