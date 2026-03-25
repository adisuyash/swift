import { useState, useEffect } from "react";
import { Invoice } from "../types";
import { validateInvoice } from "../utils/validation";
import { CkbService } from "../services/ckb";
import { QrService } from "../services/qr";
import { useInvoiceStore } from "../stores/invoiceStore";
import { useCccSigner } from "../providers/CccProvider";
import { QRDisplay } from "../components/QRDisplay";

export function InvoiceForm() {
  const signer = useCccSigner();
  const { setCurrentInvoice, setQrData, setLoading, setError, error } =
    useInvoiceStore();

  const [formData, setFormData] = useState<Partial<Invoice>>({
    freelancerName: "",
    workDescription: "",
    amount: 0,
    ckbAddress: "",
  });
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [qrImageUrl, setQrImageUrl] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Auto-populate address when wallet connects
  useEffect(() => {
    if (signer) {
      const populateAddress = async () => {
        try {
          const address = await signer.getRecommendedAddress();
          handleInputChange("ckbAddress", address);
        } catch (error) {
          console.error("Failed to get wallet address:", error);
        }
      };
      populateAddress();
    }
  }, [signer]);

  const handleInputChange = (field: keyof Invoice, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear validation errors for this field
    setValidationErrors((prev) =>
      prev.filter(
        (error) => !error.toLowerCase().includes(field.toLowerCase()),
      ),
    );
  };

  const handleGenerateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setValidationErrors([]);

    const validation = validateInvoice(formData);

    if (!validation.isValid) {
      setValidationErrors(validation.errors);
      setIsSubmitting(false);
      return;
    }

    if (!signer) {
      setValidationErrors(["Please connect your wallet first"]);
      setIsSubmitting(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Create complete invoice object
      const invoice: Invoice = {
        id: Date.now().toString(),
        freelancerName: validation.data!.freelancerName!,
        workDescription: validation.data!.workDescription!,
        amount: validation.data!.amount!,
        ckbAddress: validation.data!.ckbAddress!,
        createdAt: new Date(),
      };

      // Initialize CKB service and set wallet address
      const ckbService = new CkbService();

      // Store the signer address for transaction building
      ckbService.setSigner(signer);

      // Generate QR code
      const qrImage = await QrService.generateQRCode(invoice);

      // Update store and state
      setCurrentInvoice(invoice);
      setQrData({ invoice, unsignedTransaction: "", fee: 0 }); // Placeholder, not used now
      setQrImageUrl(qrImage);
    } catch (error) {
      console.error("Error generating invoice:", error);
      setValidationErrors(["Failed to generate invoice. Please try again."]);
    } finally {
      setIsSubmitting(false);
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFormData({
      freelancerName: "",
      workDescription: "",
      amount: 0,
      ckbAddress: "",
    });
    setValidationErrors([]);
    setQrImageUrl("");
    setCurrentInvoice(undefined);
    setQrData(undefined);
  };

  // Show QR display if generated
  if (qrImageUrl && formData.freelancerName) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="mb-6 flex justify-between items-center">
          <h2 className="text-xl font-semibold">Invoice Generated</h2>
          <button onClick={handleReset} className="btn-secondary">
            Create New Invoice
          </button>
        </div>
        <QRDisplay
          qrData={{
            invoice: formData as Invoice,
            unsignedTransaction: "",
            fee: 0.001,
          }}
          qrImageUrl={qrImageUrl}
        />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="card">
        <h2 className="text-xl font-semibold mb-6">Create Invoice</h2>

        {!signer && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-yellow-800">
              Connect your wallet to create and pay invoices
            </p>
          </div>
        )}

        <form onSubmit={handleGenerateInvoice} className="space-y-6">
          <div>
            <label
              htmlFor="freelancerName"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Your Name
            </label>
            <input
              type="text"
              id="freelancerName"
              value={formData.freelancerName}
              onChange={(e) =>
                handleInputChange("freelancerName", e.target.value)
              }
              className="input-field"
              placeholder="Enter your name"
              required
            />
          </div>

          <div>
            <label
              htmlFor="workDescription"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Work Description
            </label>
            <textarea
              id="workDescription"
              value={formData.workDescription}
              onChange={(e) =>
                handleInputChange("workDescription", e.target.value)
              }
              className="input-field min-h-[100px] resize-y"
              placeholder="Describe the work completed"
              required
            />
          </div>

          <div>
            <label
              htmlFor="amount"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Amount (CKB)
            </label>
            <input
              type="number"
              id="amount"
              value={formData.amount || ""}
              onChange={(e) =>
                handleInputChange("amount", parseFloat(e.target.value) || 0)
              }
              className="input-field"
              placeholder="Enter amount in CKB"
              min="1"
              step="0.00000001"
              required
            />
          </div>

          <div>
            <label
              htmlFor="ckbAddress"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Your CKB Address {signer ? "(Auto-filled from wallet)" : ""}
            </label>
            <input
              type="text"
              id="ckbAddress"
              value={formData.ckbAddress}
              onChange={(e) => handleInputChange("ckbAddress", e.target.value)}
              className="input-field"
              placeholder={signer ? "Address will be auto-filled" : "ckb1q..."}
              required
              readOnly={!!signer}
            />
            {signer && (
              <p className="mt-1 text-xs text-gray-500">
                Address automatically populated from your connected wallet
              </p>
            )}
          </div>

          {validationErrors.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h3 className="text-sm font-medium text-red-800 mb-2">
                Please fix the following errors:
              </h3>
              <ul className="text-sm text-red-700 space-y-1">
                {validationErrors.map((error, index) => (
                  <li key={index}>• {error}</li>
                ))}
              </ul>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting || !signer}
            className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Creating Invoice..." : "Generate Invoice"}
          </button>
        </form>
      </div>
    </div>
  );
}
