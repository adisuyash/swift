import { Invoice, TransactionResult } from "../types";

export class CkbService {
  private client: any = null;
  private signer: any = null;

  constructor(client?: any) {
    this.client = client || null;
  }

  setClient(client: any) {
    this.client = client;
  }

  setSigner(signer: any) {
    this.signer = signer;
  }

  private stringToHex(str: string): string {
    // Convert string to hex for browser compatibility
    let hex = "";
    for (let i = 0; i < str.length; i++) {
      hex += str.charCodeAt(i).toString(16).padStart(2, "0");
    }
    return "0x" + hex;
  }

  async buildPaymentTransactionSkeleton(invoice: Invoice): Promise<string> {
    try {
      // Create a Lumos TransactionSkeleton compatible with CKBull/Peersyst SDK
      const skeleton = {
        cellProvider: null,
        cellDeps: [],
        headerDeps: [],
        inputs: [], // Wallet will populate this
        outputs: [
          {
            cellOutput: {
              lock: {
                codeHash:
                  "0x9bd7e06f3ecf4be0f2fcd2188b23f1b9fcc88e5d4b65a8637b17723bbda3cce8",
                hashType: "type",
                args: invoice.ckbAddress,
              },
              type: null,
              capacity: `0x${Math.floor(invoice.amount * 100000000).toString(16)}`, // Convert CKB to shannons
            },
            data: "0x",
            outPoint: null,
            blockHash: null,
          },
        ],
        witnesses: [],
        fixedEntries: [],
        signingEntries: [],
        inputSinces: {},
      };

      // Add invoice metadata to output data
      const invoiceData = JSON.stringify({
        invoiceId: invoice.id,
        freelancerName: invoice.freelancerName,
        workDescription: invoice.workDescription,
        createdAt: invoice.createdAt.toISOString(),
      });

      skeleton.outputs[0].data = this.stringToHex(invoiceData);

      return JSON.stringify(skeleton);
    } catch (error) {
      console.error("Error building payment transaction skeleton:", error);
      throw new Error("Failed to build payment transaction skeleton");
    }
  }

  async buildPaymentTransaction(invoice: Invoice): Promise<string> {
    return this.buildPaymentTransactionSkeleton(invoice);
  }

  async signAndBroadcast(unsignedTx: string): Promise<TransactionResult> {
    if (!this.signer) {
      throw new Error("No signer available");
    }

    try {
      const tx = JSON.parse(unsignedTx);

      // Sign the transaction using CCC signer
      const signedTx = await this.signer.signTransaction(tx);

      // Send the transaction to the network
      const txHash = await this.signer.sendTransaction(signedTx);

      const explorerUrl = `https://testnet.explorer.nervos.org/transaction/${txHash}`;

      return {
        hash: txHash,
        explorerUrl,
        status: "pending",
      };
    } catch (error) {
      console.error("Error signing and broadcasting:", error);
      throw new Error("Failed to broadcast transaction");
    }
  }

  async getTransactionStatus(
    hash: string,
  ): Promise<"pending" | "confirmed" | "failed"> {
    if (!this.client) {
      throw new Error("No client available");
    }

    try {
      const tx = await this.client.getTransaction(hash);

      if (!tx) {
        return "failed";
      }

      // For now, assume all transactions are pending
      // In a real implementation, you'd check the block number or status
      return "pending";
    } catch (error) {
      console.error("Error checking transaction status:", error);
      return "failed";
    }
  }

  async getBalance(_address: string): Promise<string> {
    // For now, return a placeholder balance
    // In a real implementation, you'd query the blockchain
    return "1000.0"; // 1000 CKB placeholder
  }
}
