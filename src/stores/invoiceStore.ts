import { create } from "zustand";
import { Invoice, QRData, TransactionResult } from "../types";

interface InvoiceStore {
  // Current invoice being created
  currentInvoice: Invoice | null | undefined;

  // Generated QR data
  qrData: QRData | null | undefined;

  // Transaction result
  transactionResult: TransactionResult | null | undefined;

  // UI state
  isLoading: boolean;
  error: string | null;

  // Actions
  setCurrentInvoice: (invoice: Invoice | null | undefined) => void;
  setQrData: (qrData: QRData | null | undefined) => void;
  setTransactionResult: (result: TransactionResult | null | undefined) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

export const useInvoiceStore = create<InvoiceStore>((set) => ({
  currentInvoice: undefined,
  qrData: undefined,
  transactionResult: undefined,
  isLoading: false,
  error: null,

  setCurrentInvoice: (invoice) => set({ currentInvoice: invoice }),

  setQrData: (qrData) => set({ qrData }),

  setTransactionResult: (result) => set({ transactionResult: result }),

  setLoading: (loading) => set({ isLoading: loading }),

  setError: (error) => set({ error }),

  reset: () =>
    set({
      currentInvoice: undefined,
      qrData: undefined,
      transactionResult: undefined,
      isLoading: false,
      error: null,
    }),
}));
