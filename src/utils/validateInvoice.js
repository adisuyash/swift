export function validateInvoice({ name, description, address, amount }) {
  if (!name || name.trim().length === 0) {
    return {
      valid: false,
      reason: "Name is required",
      payload: null,
    };
  }

  if (!description || description.trim().length === 0) {
    return {
      valid: false,
      reason: "Work description is required",
      payload: null,
    };
  }

  if (!address || !address.startsWith("ckt1") || address.length < 40) {
    return {
      valid: false,
      reason: "Invalid CKB testnet address (must start with ckt1)",
      payload: null,
    };
  }

  const amt = parseFloat(amount);
  if (Number.isNaN(amt) || amt < 61) {
    return {
      valid: false,
      reason: "Amount must be at least 61 CKB (minimum cell capacity)",
      payload: null,
    };
  }

  return {
    valid: true,
    reason: "",
    payload: {
      name: name.trim(),
      description: description.trim(),
      address,
      amount: amt,
    },
  };
}
