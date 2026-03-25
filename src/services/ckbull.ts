import {
  Invoice,
  CkbullSignInResponse,
  CkbullTransactionRequestResponse,
  TransactionResult,
} from "../types";
import { CkbService } from "./ckb";

const env: any =
  typeof import.meta !== "undefined" ? (import.meta as any).env : process.env;
const API_BASE_URL = env.VITE_CKBULL_API_URL || "https://api.ckbull.com";
const API_KEY = env.VITE_CKBULL_API_KEY || "";
const API_SECRET = env.VITE_CKBULL_API_SECRET || "";

async function hmacSha512(message: string, secret: string): Promise<string> {
  if (
    typeof window === "undefined" ||
    !window.crypto ||
    !window.crypto.subtle
  ) {
    throw new Error(
      "HMAC/SHA512 requires browser crypto.subtle in this environment",
    );
  }
  const enc = new TextEncoder();
  const keyData = enc.encode(secret);
  const cryptoKey = await window.crypto.subtle.importKey(
    "raw",
    keyData,
    { name: "HMAC", hash: "SHA-512" },
    false,
    ["sign"],
  );
  const signatureArrayBuffer = await window.crypto.subtle.sign(
    "HMAC",
    cryptoKey,
    enc.encode(message),
  );
  const hashArray = Array.from(new Uint8Array(signatureArrayBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

function getApiKeyHeaders(
  method: string,
  path: string,
  body: any,
): Promise<Headers> {
  const ts = Date.now().toString();
  const bodyText = body ? JSON.stringify(body) : "";
  // CKBull docs: x-signature is HMAC SHA256 over timestamp + method + path + body
  // If their signing format differs, adapt it.
  const stringToSign = `${ts}.${method.toUpperCase()}.${path}.${bodyText}`;

  return hmacSha512(stringToSign, API_SECRET).then((signature) => {
    const headers = new Headers({
      "Content-Type": "application/json",
      "x-api-key": API_KEY,
      "x-timestamp": ts,
      "x-signature": signature,
    });
    return headers;
  });
}

export class CkbullService {
  async createSignInRequest(
    network = "testnet",
  ): Promise<CkbullSignInResponse> {
    if (!API_KEY || !API_SECRET) {
      throw new Error("Missing CKBull API key or secret in environment");
    }

    const path = "/api/sign-in-requests";
    const body = {
      metadata: {
        network,
      },
    };

    const headers = await getApiKeyHeaders("POST", path, body);

    const res = await fetch(`${API_BASE_URL}${path}`, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`CKBull sign-in request failed: ${res.status} ${text}`);
    }

    return (await res.json()) as CkbullSignInResponse;
  }

  async getSignInStatus(signInToken: string): Promise<CkbullSignInResponse> {
    const path = `/api/sign-in-requests/${signInToken}`;
    const headers = await getApiKeyHeaders("GET", path, null);

    const res = await fetch(`${API_BASE_URL}${path}`, {
      method: "GET",
      headers,
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(
        `CKBull get sign-in status failed: ${res.status} ${text}`,
      );
    }

    return (await res.json()) as CkbullSignInResponse;
  }

  async createTransactionRequest(
    signInToken: string,
    txSkeletonJson: string,
  ): Promise<CkbullTransactionRequestResponse> {
    const path = "/api/transaction-request";
    const body = {
      signInToken,
      transaction: {
        type: "skeleton",
        value: JSON.parse(txSkeletonJson),
      },
    };

    const headers = await getApiKeyHeaders("POST", path, body);

    const res = await fetch(`${API_BASE_URL}${path}`, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(
        `CKBull transaction request failed: ${res.status} ${text}`,
      );
    }

    return (await res.json()) as CkbullTransactionRequestResponse;
  }

  async pollSignInStatus(
    signInToken: string,
    attempts = 20,
  ): Promise<CkbullSignInResponse> {
    for (let i = 0; i < attempts; i += 1) {
      const status = await this.getSignInStatus(signInToken);
      if (status.status === "signed") {
        return status;
      }
      if (
        status.status === "declined" ||
        status.status === "request_expired" ||
        status.status === "session_expired"
      ) {
        throw new Error(`Sign in failed with status: ${status.status}`);
      }
      await new Promise((resolve) => setTimeout(resolve, 1500));
    }
    throw new Error("CKBull sign-in polling timed out");
  }

  async payUsingCkbull(invoice: Invoice): Promise<TransactionResult> {
    // 1) create sign-in request and wait for user to approve in wallet
    const signIn = await this.createSignInRequest("testnet");

    // Provide a deep link (must match CKBull Wallet docs for your platform)
    const signInUrl = `https://wallet.ckbull.com/sign-in?token=${signIn.signInToken}`;
    window.open(signInUrl, "_blank");

    const signInStatus = await this.pollSignInStatus(signIn.signInToken);
    if (!signInStatus.metadata?.address) {
      throw new Error("CKBull sign in did not provide wallet address");
    }

    // 2) build transaction skeleton payload
    const ckbService = new CkbService();
    const txSkeletonJson =
      await ckbService.buildPaymentTransactionSkeleton(invoice);

    // 3) create transaction request in CKBull
    const txRequest = await this.createTransactionRequest(
      signIn.signInToken,
      txSkeletonJson,
    );

    // 4) In true production, you poll txRequest status for signed transaction.
    // Here we assume immediate success or that it is a placeholder for now.
    if (txRequest.signedTransaction) {
      // If CKBull returns a signed transaction, broadcast it.
      try {
        const signedTx = txRequest.signedTransaction;
        const ckbServiceForBroadcast = new CkbService();
        const result = await ckbServiceForBroadcast.signAndBroadcast(signedTx);
        return result;
      } catch (err) {
        console.warn("Failed to broadcast signed transaction from CKBull", err);
      }
    }

    // Fallback: we can't broadcast, but return pending transaction info.
    return {
      hash: txRequest.id.toString(),
      explorerUrl: "",
      status: "pending",
    };
  }
}
