import { useState } from "react";
import QRCode from "qrcode";
import { createInvoice } from "../lib/supabase";
import { validateInvoice } from "../utils/validateInvoice";

export default function InvoiceForm({ user, onInvoiceReady }) {
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("61");
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  async function handleCreateInvoice() {
    const validation = validateInvoice({
      name: user.name,
      description,
      address: user.address,
      amount,
    });

    if (!validation.valid) {
      setError(validation.reason);
      return;
    }

    setIsSaving(true);
    setError("");

    try {
      const invoice = await createInvoice({
        freelancer_address: user.address,
        name: validation.payload.name,
        description: validation.payload.description,
        amount: validation.payload.amount,
      });

      const payload = btoa(
        JSON.stringify({
          invoiceId: invoice.id,
          freelancerAddress: user.address,
          name: user.name,
          description: validation.payload.description,
          amount: validation.payload.amount,
        }),
      );

      const appUrl = (
        import.meta.env.VITE_APP_URL || window.location.origin
      ).replace(/\/$/, "");
      const paymentURL = `${appUrl}/pay?d=${payload}`;
      const qrDataURL = await QRCode.toDataURL(paymentURL, {
        width: 300,
        color: {
          dark: "#00d4aa",
          light: "#0a0a0f",
        },
      });

      onInvoiceReady(invoice, qrDataURL, paymentURL);
    } catch (saveError) {
      console.error(saveError);
      setError(saveError.message || "Unable to create invoice.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <section className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-[0.8fr_1.2fr]">
      <div className="glass-panel rounded-[2rem] p-6 sm:p-8">
        <span className="inline-flex rounded-full border border-brand/20 bg-brand/10 px-4 py-2 text-sm font-medium text-brand">
          New Invoice
        </span>
        <h2 className="mt-5 text-3xl font-bold text-white">
          Send a clean payment request
        </h2>
        <p className="mt-3 text-base leading-7 text-gray-300">
          Swift will validate the invoice, store it in Supabase, and turn it
          into a payment link your client can scan or open on testnet.
        </p>

        <div className="mt-8 space-y-5">
          <div>
            <label className="text-sm font-medium text-gray-300">Name</label>
            <input
              readOnly
              value={user.name}
              className="mt-3 w-full rounded-2xl border border-white/10 bg-gray-800 px-4 py-3 text-base text-gray-200 outline-none"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-300">
              Freelancer Address
            </label>
            <textarea
              readOnly
              value={user.address}
              rows={3}
              className="mono mt-3 w-full rounded-2xl border border-white/10 bg-gray-800 px-4 py-3 text-sm text-gray-200 outline-none"
            />
          </div>
        </div>
      </div>

      <div className="glass-panel rounded-[2rem] p-6 sm:p-8">
        <div>
          <label className="text-sm font-medium text-gray-300">
            Work description
          </label>
          <textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Design review and smart contract QA"
            rows={5}
            className="mt-3 w-full rounded-2xl border border-white/10 bg-gray-800 px-4 py-3 text-base text-white outline-none transition focus:border-brand"
          />
        </div>

        <div className="mt-6">
          <label className="text-sm font-medium text-gray-300">
            Amount (CKB)
          </label>
          <input
            type="number"
            min="61"
            step="0.01"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            className="mt-3 w-full rounded-2xl border border-white/10 bg-gray-800 px-4 py-3 text-base text-white outline-none transition focus:border-brand"
          />
          <p className="mt-2 text-sm text-gray-500">
            Minimum invoice amount is 61 CKB to satisfy testnet cell capacity.
          </p>
        </div>

        {error ? (
          <p className="mt-6 rounded-2xl border border-red-400/25 bg-red-500/10 px-4 py-3 text-sm text-red-100">
            {error}
          </p>
        ) : null}

        <button
          type="button"
          onClick={handleCreateInvoice}
          disabled={isSaving}
          className="mt-8 inline-flex rounded-full bg-brand px-6 py-3 text-sm font-semibold text-slate-950 transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isSaving ? "Saving invoice..." : "Create QR Invoice"}
        </button>
      </div>
    </section>
  );
}
