import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null;

function requireSupabase() {
  if (!supabase) {
    throw new Error(
      "Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your environment.",
    );
  }

  return supabase;
}

export async function getUser(address) {
  if (!address) {
    return null;
  }

  const client = requireSupabase();
  const { data, error } = await client
    .from("users")
    .select("*")
    .eq("address", address)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data;
}

export async function createUser(address, name, role) {
  const client = requireSupabase();
  const { data, error } = await client
    .from("users")
    .insert({
      address,
      name: name.trim(),
      role,
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function createInvoice({
  freelancer_address,
  name,
  description,
  amount,
}) {
  const client = requireSupabase();
  const { data, error } = await client
    .from("invoices")
    .insert({
      freelancer_address,
      name: name.trim(),
      description: description.trim(),
      amount,
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function getFreelancerInvoices(address) {
  const client = requireSupabase();
  const { data, error } = await client
    .from("invoices")
    .select("*")
    .eq("freelancer_address", address)
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return data || [];
}

export async function getClientPayments(address) {
  const client = requireSupabase();
  const { data, error } = await client
    .from("invoices")
    .select("*")
    .eq("client_address", address)
    .eq("status", "paid")
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return data || [];
}

export async function resolveInvoiceForPayment({
  invoiceId,
  freelancerAddress,
  name,
  description,
  amount,
}) {
  const client = requireSupabase();

  if (invoiceId) {
    const { data, error } = await client
      .from("invoices")
      .select("*")
      .eq("id", invoiceId)
      .maybeSingle();

    if (error) {
      throw error;
    }

    if (data) {
      return data;
    }
  }

  const { data, error } = await client
    .from("invoices")
    .select("*")
    .eq("freelancer_address", freelancerAddress)
    .eq("status", "pending")
    .order("created_at", { ascending: false })
    .limit(20);

  if (error) {
    throw error;
  }

  const targetName = String(name || "").trim();
  const targetDescription = String(description || "").trim();
  const targetAmount = Number(amount);

  const matchedInvoice = (data || []).find((invoice) => {
    return (
      String(invoice.name || "").trim() === targetName &&
      String(invoice.description || "").trim() === targetDescription &&
      Math.abs(Number(invoice.amount) - targetAmount) < 1e-8
    );
  });

  if (matchedInvoice) {
    return matchedInvoice;
  }

  throw new Error(
    invoiceId
      ? `Invoice ${invoiceId} was not found in the current Supabase project.`
      : "Invoice was not found in the current Supabase project.",
  );
}

export async function markInvoicePaid(invoiceId, clientAddress, txHash) {
  if (!invoiceId) {
    throw new Error("Missing invoice id while saving payment.");
  }

  const client = requireSupabase();
  const { data, error } = await client
    .from("invoices")
    .update({
      status: "paid",
      client_address: clientAddress,
      tx_hash: txHash,
    })
    .eq("id", invoiceId)
    .select()
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!data) {
    throw new Error(
      `Invoice ${invoiceId} was not found while saving payment status.`,
    );
  }

  return data;
}
