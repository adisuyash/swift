import QRCode from "qrcode";
import { Invoice, QRData } from "../types";

export class QrService {
  static async generateQRCode(txJson: string): Promise<string> {
    try {
      // Generate QR code with transaction JSON for CKBull compatibility
      const qrDataUrl = await QRCode.toDataURL(txJson, {
        width: 300,
        margin: 2,
        errorCorrectionLevel: "H", // High error correction for better scanning
        type: "image/png",
        color: {
          dark: "#000000",
          light: "#FFFFFF",
        },
      });

      console.log("QR Code Transaction JSON length:", txJson.length);
      return qrDataUrl;
    } catch (error) {
      console.error("Error generating QR code:", error);
      throw new Error("Failed to generate QR code");
    }
  }

  static parseQRData(qrString: string): QRData {
    try {
      const tx = JSON.parse(qrString);

      const toQRData = (invoice: Invoice): QRData => ({
        invoice,
        unsignedTransaction: "",
        fee: 0.001,
      });

      // Check if it's a transaction skeleton (Lumos format)
      if (tx.outputs && tx.outputs[0]?.cellOutput) {
        // Extract invoice from Lumos transaction skeleton
        const output = tx.outputs[0].cellOutput;
        const address = output.lock.args;
        const capacity = parseInt(output.capacity, 16) / 100000000; // Convert shannons to CKB

        // Parse invoice data from output data
        let invoiceData: any = {};
        if (tx.outputs[0].data !== "0x") {
          try {
            const hexData = tx.outputs[0].data.startsWith("0x")
              ? tx.outputs[0].data.slice(2)
              : tx.outputs[0].data;
            const strData = Buffer.from(hexData, "hex").toString();
            invoiceData = JSON.parse(strData);
          } catch (e) {
            console.warn(
              "Could not parse invoice data from transaction skeleton",
            );
          }
        }

        return toQRData({
          id: invoiceData.invoiceId || Date.now().toString(),
          freelancerName: invoiceData.freelancerName || "Unknown",
          workDescription: invoiceData.workDescription || "",
          amount: capacity,
          ckbAddress: address,
          createdAt: invoiceData.createdAt
            ? new Date(invoiceData.createdAt)
            : new Date(),
        });
      }

      // Check if it's a basic transaction object
      if (tx.outputs && tx.outputsData) {
        // Extract invoice from basic transaction
        const output = tx.outputs[0];
        const address = output.lock.args;
        const capacity = parseInt(output.capacity, 16) / 100000000; // Convert shannons to CKB

        // Parse invoice data from outputsData
        let invoiceData: any = {};
        if (tx.outputsData[0] !== "0x") {
          try {
            const hexData = tx.outputsData[0].startsWith("0x")
              ? tx.outputsData[0].slice(2)
              : tx.outputsData[0];
            const strData = Buffer.from(hexData, "hex").toString();
            invoiceData = JSON.parse(strData);
          } catch (e) {
            console.warn("Could not parse invoice data from transaction");
          }
        }

        return toQRData({
          id: invoiceData.invoiceId || Date.now().toString(),
          freelancerName: invoiceData.freelancerName || "Unknown",
          workDescription: invoiceData.workDescription || "",
          amount: capacity,
          ckbAddress: address,
          createdAt: invoiceData.createdAt
            ? new Date(invoiceData.createdAt)
            : new Date(),
        });
      }

      // Fallback to URI parsing
      if (qrString.startsWith("ckb:")) {
        const url = new URL(qrString);
        const address = url.pathname.slice(1);
        const amount = parseFloat(url.searchParams.get("amount") || "0");
        const memo = url.searchParams.get("memo") || "";
        const description = url.searchParams.get("description") || "";

        const memoParts = memo.split(" from ");
        const id =
          memoParts[0]?.replace("Invoice ", "") || Date.now().toString();
        const freelancerName = memoParts[1] || "Unknown";

        return toQRData({
          id,
          freelancerName,
          workDescription: description,
          amount,
          ckbAddress: address,
          createdAt: new Date(),
        });
      }

      // Fallback to old JSON format
      const parsed = JSON.parse(qrString);
      return toQRData({
        id: parsed.id,
        freelancerName: parsed.name || "Unknown",
        workDescription: parsed.description || "",
        amount: parsed.amount,
        ckbAddress: parsed.address,
        createdAt: new Date(),
      });
    } catch (error) {
      console.error("Error parsing QR data:", error);
      throw new Error("Invalid QR code format");
    }
  }
}
