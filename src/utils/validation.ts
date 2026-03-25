import { Invoice, ValidationResult } from "../types";

export function validateInvoice(data: Partial<Invoice>): ValidationResult {
  const errors: string[] = [];

  // Validate freelancer name
  if (!data.freelancerName || data.freelancerName.trim().length < 2) {
    errors.push("Freelancer name must be at least 2 characters long");
  }

  // Validate work description
  if (!data.workDescription || data.workDescription.trim().length < 10) {
    errors.push("Work description must be at least 10 characters long");
  }

  // Validate amount
  if (!data.amount || data.amount <= 0) {
    errors.push("Amount must be greater than 0");
  }
  if (data.amount && data.amount < 1) {
    errors.push("Minimum amount is 1 CKB");
  }
  if (data.amount && data.amount > 10000) {
    errors.push("Maximum amount is 10,000 CKB");
  }

  // Validate CKB address
  if (!data.ckbAddress) {
    errors.push("CKB address is required");
  } else if (!isValidCkbAddress(data.ckbAddress)) {
    errors.push("Invalid CKB address format");
  }

  return {
    isValid: errors.length === 0,
    errors,
    data: errors.length === 0 ? (data as Invoice) : undefined,
  };
}

function isValidCkbAddress(address: string): boolean {
  // CKB address validation - accepts both mainnet (ckb1) and testnet (ckt1) formats
  // CKB addresses are bech32 encoded with variable lengths
  const ckbAddressRegex = /^(ckb1|ckt1)[a-z0-9]{20,}$/;
  return ckbAddressRegex.test(address);
}
