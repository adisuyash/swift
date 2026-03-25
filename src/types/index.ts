export interface Invoice {
  id: string;
  freelancerName: string;
  workDescription: string;
  amount: number;
  ckbAddress: string;
  createdAt: Date;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  data?: Partial<Invoice>;
}

export interface QRData {
  invoice: Invoice;
  unsignedTransaction: string;
  fee: number;
}

export interface TransactionResult {
  hash: string;
  explorerUrl: string;
  status: "pending" | "confirmed" | "failed";
}

export interface CkbullSignInResponse {
  id: number;
  signInToken: string;
  status:
    | "pending"
    | "signed"
    | "declined"
    | "request_expired"
    | "session_expired";
  createdAt: string;
  expiresAt: string;
  sessionExpiresAt: string;
  metadata?: {
    address?: string;
    network?: string;
  };
}

export interface CkbullTransactionRequestResponse {
  id: number;
  status: "pending" | "signed" | "declined" | "expired";
  signInToken: string;
  transaction?: any;
  signedTransaction?: string;
  createdAt: string;
  expiresAt: string;
}
