import { useState } from "react";
import { useCccContext } from "../providers/CccProvider";

export function WalletConnector() {
  const { open, disconnect, signerInfo, signer } = useCccContext();
  const [isConnecting, setIsConnecting] = useState(false);

  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      await open();
    } catch (error) {
      console.error("Failed to open wallet connector:", error);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      await disconnect();
    } catch (error) {
      console.error("Failed to disconnect wallet:", error);
    }
  };

  if (signerInfo && signer) {
    return (
      <div className="flex items-center space-x-4">
        <div className="text-sm">
          <span className="text-gray-600">Connected: </span>
          <span className="font-medium">{signerInfo.name || "CKB Wallet"}</span>
          {signerInfo.address && (
            <div className="text-xs text-gray-500 mt-1 truncate max-w-xs">
              {signerInfo.address}
            </div>
          )}
        </div>
        <button onClick={handleDisconnect} className="btn-secondary text-sm">
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <div>
      <button
        onClick={handleConnect}
        disabled={isConnecting}
        className="btn-primary text-sm disabled:opacity-50"
      >
        {isConnecting ? "Connecting..." : "Connect Wallet"}
      </button>
    </div>
  );
}
