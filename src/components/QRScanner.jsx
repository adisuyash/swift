import { useEffect, useEffectEvent, useRef, useState } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";

function normalizeInvoicePayload(rawValue) {
  const trimmedValue = rawValue.trim();

  if (!trimmedValue) {
    throw new Error("QR data was empty.");
  }

  let decodedValue = trimmedValue;

  try {
    const url = new URL(trimmedValue);
    const encodedPayload = url.searchParams.get("d");

    if (!encodedPayload) {
      throw new Error("Swift payment link is missing invoice data.");
    }

    decodedValue = atob(encodedPayload.replaceAll(" ", "+"));
  } catch (error) {
    if (!(error instanceof TypeError)) {
      throw error;
    }
  }

  let parsed;

  try {
    parsed = JSON.parse(decodedValue);
  } catch {
    throw new Error("QR data was not a valid Swift payment link.");
  }

  if (!parsed || typeof parsed !== "object") {
    throw new Error("QR payload was empty.");
  }

  const requiredKeys = [
    "invoiceId",
    "freelancerAddress",
    "name",
    "description",
    "amount",
  ];

  for (const key of requiredKeys) {
    if (!(key in parsed)) {
      throw new Error(`QR payload is missing "${key}".`);
    }
  }

  if (
    typeof parsed.freelancerAddress !== "string" ||
    !parsed.freelancerAddress.startsWith("ckt1") ||
    parsed.freelancerAddress.length < 40
  ) {
    throw new Error("Freelancer address in QR payload is invalid.");
  }

  const amount = Number(parsed.amount);
  if (Number.isNaN(amount) || amount < 61) {
    throw new Error("Invoice amount in QR payload is invalid.");
  }

  return {
    invoiceId: String(parsed.invoiceId),
    freelancerAddress: parsed.freelancerAddress,
    name: String(parsed.name).trim(),
    description: String(parsed.description).trim(),
    amount,
  };
}

export default function QRScanner({ onScanned }) {
  const scannerRef = useRef(null);
  const resolvedRef = useRef(false);
  const [error, setError] = useState("");
  const [pasteMode, setPasteMode] = useState(false);
  const [pasteValue, setPasteValue] = useState("");

  const handleDecodedValue = useEffectEvent((rawValue) => {
    try {
      const payload = normalizeInvoicePayload(rawValue);
      resolvedRef.current = true;
      setError("");

      if (scannerRef.current) {
        scannerRef.current.clear().catch(() => {});
      }

      onScanned(payload);
    } catch (scanError) {
      setError(scanError.message || "Could not read invoice payload.");
    }
  });

  useEffect(() => {
    const scanner = new Html5QrcodeScanner(
      "qr-reader",
      {
        fps: 10,
        qrbox: 250,
      },
      false,
    );

    scannerRef.current = scanner;
    resolvedRef.current = false;
    scanner.render(
      (decodedText) => {
        if (resolvedRef.current) {
          return;
        }

        handleDecodedValue(decodedText);
      },
      () => {},
    );

    return () => {
      resolvedRef.current = true;

      if (scannerRef.current) {
        scannerRef.current.clear().catch(() => {});
      }
    };
  }, [handleDecodedValue]);

  function handlePasteSubmit() {
    handleDecodedValue(pasteValue);
  }

  return (
    <section className="mx-auto max-w-5xl">
      <div className="glass-panel rounded-[2rem] p-6 sm:p-8">
        <div className="grid gap-8 lg:grid-cols-[1fr_0.9fr]">
          <div>
            <span className="inline-flex rounded-full border border-brand/20 bg-brand/10 px-4 py-2 text-sm font-medium text-brand">
              Scan Invoice
            </span>
            <h2 className="mt-5 text-3xl font-bold text-white">
              Scan the freelancer QR
            </h2>
            <p className="mt-3 text-base leading-7 text-gray-300">
              The primary flow is opening the Swift payment link from the QR.
              Use this in-app scanner only as a fallback if camera scanning is
              needed inside the app.
            </p>

            <div className="mt-8 rounded-[1.75rem] border border-white/10 bg-slate-950/70 p-4">
              <div id="qr-reader" />
            </div>
          </div>

          <div className="rounded-[1.75rem] border border-white/10 bg-slate-950/60 p-5">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold text-white">
                Paste fallback
              </h3>
              <button
                type="button"
                onClick={() => setPasteMode((current) => !current)}
                className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-brand transition hover:border-brand/30"
              >
                {pasteMode ? "Hide" : "Use paste mode"}
              </button>
            </div>

            {pasteMode ? (
              <div className="mt-5">
                <textarea
                  value={pasteValue}
                  onChange={(event) => setPasteValue(event.target.value)}
                  rows={10}
                  placeholder="https://your-swift-app.vercel.app/pay?d=..."
                  className="mono w-full rounded-2xl border border-white/10 bg-gray-800 px-4 py-3 text-sm text-white outline-none transition focus:border-brand"
                />

                <button
                  type="button"
                  onClick={handlePasteSubmit}
                  className="mt-4 inline-flex rounded-full bg-brand px-5 py-3 text-sm font-semibold text-slate-950 transition hover:scale-[1.01]"
                >
                  Parse pasted link
                </button>
              </div>
            ) : (
              <p className="mt-5 text-sm leading-6 text-gray-400">
                Toggle paste mode if your camera is unavailable or you want to
                test a copied Swift payment link directly.
              </p>
            )}

            {error ? (
              <p className="mt-5 rounded-2xl border border-red-400/25 bg-red-500/10 px-4 py-3 text-sm text-red-100">
                {error}
              </p>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
