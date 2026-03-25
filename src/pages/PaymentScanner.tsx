import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { QrService } from "../services/qr";
import { CkbService } from "../services/ckb";
import { CkbullService } from "../services/ckbull";
import { useInvoiceStore } from "../stores/invoiceStore";
import { useCccSigner } from "../providers/CccProvider";
import { Html5QrcodeScanner } from "html5-qrcode";

export function PaymentScanner() {
  const navigate = useNavigate();
  const signer = useCccSigner();
  const { setTransactionResult, setLoading, setError, error } =
    useInvoiceStore();

  const [isScanning, setIsScanning] = useState(false);
  const [qrData, setQrData] = useState<string>("");
  const [parsedInvoice, setParsedInvoice] = useState<any>(null);
  const [scanError, setScanError] = useState<string>("");
  const [isApproving, setIsApproving] = useState(false);
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(console.error);
      }
    };
  }, []);

  const handleScanSuccess = (decodedText: string) => {
    try {
      const parsed = QrService.parseQRData(decodedText);
      setQrData(decodedText);
      setParsedInvoice(parsed);
      setIsScanning(false);
      setScanError("");
      // Stop scanner
      if (scannerRef.current) {
        scannerRef.current.clear().catch(console.error);
      }
    } catch (error) {
      setScanError("Invalid QR code format");
    }
  };

  const handleScanError = (errorMessage: string) => {
    // Ignore scan errors, just keep scanning
    console.log("Scan error:", errorMessage);
  };

  const startScanning = () => {
    setIsScanning(true);
    setScanError("");
    // Initialize QR scanner
    scannerRef.current = new Html5QrcodeScanner(
      "qr-reader",
      { fps: 10, qrbox: { width: 250, height: 250 } },
      false,
    );
    scannerRef.current.render(handleScanSuccess, handleScanError);
  };

  const handleManualInput = (e: React.FormEvent) => {
    e.preventDefault();
    if (qrData.trim()) {
      handleScanSuccess(qrData.trim());
    }
  };

  const handleApprovePayment = async () => {
    if (!signer || !parsedInvoice) {
      setScanError("Please connect your wallet first");
      return;
    }

    setIsApproving(true);
    setLoading(true);
    setError(null);

    try {
      // Initialize CKB service with signer
      const ckbService = new CkbService();
      ckbService.setSigner(signer);

      // Determine invoice object (legacy or QRData shape)
      const targetInvoice = parsedInvoice.invoice || parsedInvoice;

      // Build payment transaction
      const unsignedTx =
        await ckbService.buildPaymentTransaction(targetInvoice);

      // Sign and broadcast transaction
      const result = await ckbService.signAndBroadcast(unsignedTx);

      // Update store and navigate to confirmation
      setTransactionResult(result);
      navigate("/confirmation");
    } catch (error) {
      console.error("Error approving payment:", error);
      setScanError("Failed to process payment. Please try again.");
    } finally {
      setIsApproving(false);
      setLoading(false);
    }
  };

  const handleApproveWithCkbull = async () => {
    if (!parsedInvoice) {
      setScanError("No invoice to pay");
      return;
    }

    setIsApproving(true);
    setLoading(true);
    setError(null);

    try {
      const targetInvoice = parsedInvoice.invoice || parsedInvoice;
      const ckbullService = new CkbullService();
      const result = await ckbullService.payUsingCkbull(targetInvoice);
      setTransactionResult(result);
      navigate("/confirmation");
    } catch (error) {
      console.error("Error with CKBull payment:", error);
      setScanError("CKBull payment failed. Please check wallet and try again.");
    } finally {
      setIsApproving(false);
      setLoading(false);
    }
  };

  const handleReset = () => {
    setQrData("");
    setParsedInvoice(null);
    setScanError("");
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="card">
        <h2 className="text-xl font-semibold mb-6">Scan Invoice QR Code</h2>

        {isScanning && (
          <div className="space-y-4">
            <p className="text-gray-600">
              Position the QR code within the camera view
            </p>
            <div id="qr-reader" className="w-full max-w-md mx-auto"></div>
            <button
              onClick={() => {
                setIsScanning(false);
                if (scannerRef.current) {
                  scannerRef.current.clear().catch(console.error);
                }
              }}
              className="btn-secondary w-full"
            >
              Cancel Scanning
            </button>
          </div>
        )}

        {!isScanning && !parsedInvoice && (
          <div className="space-y-4">
            <p className="text-gray-600">
              Scan the QR code from the invoice to review and pay
            </p>

            {!signer && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm text-yellow-800">
                  Connect your wallet to pay invoices
                </p>
              </div>
            )}

            <button
              onClick={startScanning}
              disabled={!signer}
              className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Start Camera Scanner
            </button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">
                  Or paste QR data manually
                </span>
              </div>
            </div>

            <form onSubmit={handleManualInput} className="space-y-4">
              <textarea
                value={qrData}
                onChange={(e) => setQrData(e.target.value)}
                placeholder="Paste QR code data here..."
                className="input-field min-h-[100px] resize-y"
              />
              <button
                type="submit"
                disabled={!qrData.trim()}
                className="btn-secondary w-full disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Process QR Data
              </button>
            </form>
          </div>
        )}

        {isScanning && (
          <div className="space-y-4">
            <div className="bg-gray-100 rounded-lg p-8 text-center">
              <div className="animate-pulse">
                <div className="w-64 h-64 bg-gray-300 rounded-lg mx-auto mb-4"></div>
                <p className="text-gray-600">Camera scanner active...</p>
              </div>
            </div>
            <button
              onClick={() => setIsScanning(false)}
              className="btn-secondary w-full"
            >
              Cancel Scanning
            </button>
          </div>
        )}

        {parsedInvoice && (
          <div className="space-y-6">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="text-sm font-medium text-green-800 mb-2">
                Invoice Scanned Successfully!
              </h3>
              <p className="text-sm text-green-700">
                Review the invoice details below:
              </p>
            </div>

            {/* Invoice Review */}
            <div className="card">
              <h3 className="text-lg font-semibold mb-4">Invoice Details</h3>

              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Freelancer:</span>
                  <span className="font-medium">
                    {parsedInvoice.invoice.freelancerName}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600">Work:</span>
                  <span className="font-medium text-right max-w-xs">
                    {parsedInvoice.invoice.workDescription}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600">Amount:</span>
                  <span className="font-medium">
                    {parsedInvoice.invoice.amount} CKB
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600">Network Fee:</span>
                  <span className="font-medium">{parsedInvoice.fee} CKB</span>
                </div>

                <div className="border-t pt-3">
                  <div className="flex justify-between">
                    <span className="text-gray-900 font-semibold">Total:</span>
                    <span className="font-bold text-primary-600">
                      {(
                        parsedInvoice.invoice.amount + parsedInvoice.fee
                      ).toFixed(8)}{" "}
                      CKB
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Details */}
            <div className="card">
              <h3 className="text-lg font-semibold mb-4">
                Payment Information
              </h3>

              <div className="space-y-3">
                <div>
                  <label className="text-sm text-gray-600">Paying From:</label>
                  <div className="mt-1">
                    {signer ? (
                      <div className="text-sm font-medium">
                        {signer.name} Wallet
                      </div>
                    ) : (
                      <div className="text-sm text-red-600">
                        No wallet connected
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="text-sm text-gray-600">
                    Recipient Address:
                  </label>
                  <div className="mt-1">
                    <code className="text-xs bg-gray-100 px-3 py-2 rounded border font-mono break-all">
                      {parsedInvoice.invoice.ckbAddress}
                    </code>
                  </div>
                </div>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            <div className="flex flex-col gap-3">
              <div className="grid grid-cols-2 gap-3">
                <button onClick={handleReset} className="btn-secondary">
                  Scan Different Invoice
                </button>
                <button
                  onClick={handleApprovePayment}
                  disabled={isApproving || !signer}
                  className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isApproving ? "Processing Payment..." : "Approve & Pay"}
                </button>
              </div>

              <button
                onClick={handleApproveWithCkbull}
                disabled={isApproving}
                className="btn-accent w-full disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isApproving
                  ? "Processing with CKBull..."
                  : "Pay with CKBull Signer"}
              </button>
            </div>
          </div>
        )}

        {scanError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h3 className="text-sm font-medium text-red-800 mb-2">Error</h3>
            <p className="text-sm text-red-700">{scanError}</p>
            <button
              onClick={() => setScanError("")}
              className="btn-secondary mt-4"
            >
              Try Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
