import QRCode from "qrcode";
import { Invoice } from "../types";

export class QrService {
  static async generateQRCode(invoice: Invoice): Promise<string> {
    try {
      // Create CKB payment URI for wallet compatibility
      const memo = `Invoice ${invoice.id} from ${invoice.freelancerName}`;
      const uri = `ckb:${invoice.ckbAddress}?amount=${invoice.amount}&memo=${encodeURIComponent(memo)}&description=${encodeURIComponent(invoice.workDescription)}`;

      // Generate QR code as data URL with higher error correction
      const qrDataUrl = await QRCode.toDataURL(uri, {
        width: 300,
        margin: 2,
        errorCorrectionLevel: "H", // High error correction for better scanning
        type: "image/png",
        color: {
          dark: "#000000",
          light: "#FFFFFF",
        },
      });

      console.log("QR Code URI:", uri);
      return qrDataUrl;
    } catch (error) {
      console.error("Error generating QR code:", error);
      throw new Error("Failed to generate QR code");
    }
  }

  static parseQRData(qrString: string): Invoice {
    try {
      // Check if it's a CKB URI
      if (qrString.startsWith("ckb:")) {
        const url = new URL(qrString);
        const address = url.pathname.slice(1); // Remove leading /
        const amount = parseFloat(url.searchParams.get("amount") || "0");
        const memo = url.searchParams.get("memo") || "";
        const description = url.searchParams.get("description") || "";

        // Extract id and name from memo if possible
        const memoParts = memo.split(" from ");
        const id =
          memoParts[0]?.replace("Invoice ", "") || Date.now().toString();
        const freelancerName = memoParts[1] || "Unknown";

        return {
          id,
          freelancerName,
          workDescription: description,
          amount,
          ckbAddress: address,
          createdAt: new Date(),
        };
      } else {
        // Fallback to JSON parsing for backward compatibility
        const parsed = JSON.parse(qrString);
        return {
          id: parsed.id,
          freelancerName: parsed.name || "Unknown",
          workDescription: parsed.description || "",
          amount: parsed.amount,
          ckbAddress: parsed.address,
          createdAt: new Date(),
        };
      }
    } catch (error) {
      console.error("Error parsing QR data:", error);
      throw new Error("Invalid QR code format");
    }
  }
}
