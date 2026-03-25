import { useState } from "react";
import { transferCKB } from "../ckb/transaction";
import { markInvoicePaid, resolveInvoiceForPayment } from "../lib/supabase";

const amountFormatter = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

export default function InvoiceApproval({
  invoice,
  signer,
  clientUser,
  onConfirmed,
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleApprove() {
    if (!signer) {
      setError("Connect wallet to pay.");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const invoiceRecord = await resolveInvoiceForPayment({
        invoiceId: invoice.invoiceId || invoice.id,
        freelancerAddress: invoice.freelancerAddress,
        name: invoice.name,
        description: invoice.description,
        amount: invoice.amount,
      });
      const clientAddress =
        clientUser?.address || (await signer.getRecommendedAddress());
      const txHash = await transferCKB(
        signer,
        invoice.freelancerAddress,
        invoice.amount,
      );

      await markInvoicePaid(invoiceRecord.id, clientAddress, txHash);
      onConfirmed(txHash);
    } catch (paymentError) {
      console.error(paymentError);
      setError(paymentError.message || "Payment failed.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="mx-auto max-w-4xl">
      <div className="glass-panel rounded-[2rem] p-6 sm:p-8">
        <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
          <div>
            <span className="inline-flex rounded-full border border-brand/20 bg-brand/10 px-4 py-2 text-sm font-medium text-brand">
              Review Payment
            </span>
            <h2 className="mt-5 text-3xl font-bold text-white">
              Approve this invoice
            </h2>
            <p className="mt-3 text-base leading-7 text-gray-300">
              Double-check the freelancer details before signing. Payment will
              be broadcast to CKB testnet from your connected wallet.
            </p>

            <div className="mt-8 rounded-[1.75rem] border border-yellow-400/20 bg-yellow-500/10 p-5 text-sm leading-6 text-yellow-100">
              Testnet only. Use faucet funds and verify the transaction on the
              Nervos testnet explorer after approval.
            </div>
          </div>

          <div className="rounded-[1.75rem] border border-white/10 bg-slate-950/70 p-5">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-gray-500">
              Invoice
            </p>
            <h3 className="mt-4 text-2xl font-semibold text-white">
              {invoice.name}
            </h3>
            <p className="mt-3 text-sm leading-6 text-gray-300">
              {invoice.description}
            </p>

            <div className="mt-6 rounded-2xl border border-brand/20 bg-brand/10 px-4 py-4">
              <p className="text-xs uppercase tracking-[0.22em] text-brand/80">
                Amount
              </p>
              <p className="mt-2 text-3xl font-bold text-brand">
                {amountFormatter.format(invoice.amount)} CKB
              </p>
            </div>

            <p className="mt-5 text-sm leading-6 text-gray-400">
              The invoice amount goes to the freelancer. Network fee is paid
              separately by the client wallet and is not added to the invoice
              total.
            </p>

            {!signer ? (
              <p className="mt-5 rounded-2xl border border-yellow-400/20 bg-yellow-500/10 px-4 py-3 text-sm text-yellow-100">
                Connect wallet to pay.
              </p>
            ) : null}

            {error ? (
              <p className="mt-5 rounded-2xl border border-red-400/25 bg-red-500/10 px-4 py-3 text-sm text-red-100">
                {error}
              </p>
            ) : null}

            <button
              type="button"
              onClick={handleApprove}
              disabled={!signer || isSubmitting}
              className="mt-6 inline-flex rounded-full bg-brand px-6 py-3 text-sm font-semibold text-slate-950 transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSubmitting ? "Signing & Broadcasting..." : "Approve Payment"}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
