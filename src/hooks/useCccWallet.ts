// This hook attempts to find and use any wallet connection methods
// from the @ckb-ccc/connector-react library
import { useState, useCallback } from "react";

export function useCccWallet() {
  const [signer, setSigner] = useState<any>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const connect = useCallback(async () => {
    setIsConnecting(true);
    setError(null);

    try {
      // Import CCC library dynamically to check available methods
      const { ccc } = await import("@ckb-ccc/connector-react");

      console.log("CCC Library exports:", Object.keys(ccc));

      // Try to find any connection-related methods in the ccc object
      const connectionMethods = Object.entries(ccc).filter(([key, value]) => {
        return (
          typeof value === "function" &&
          (key.toLowerCase().includes("select") ||
            key.toLowerCase().includes("connect") ||
            key.toLowerCase().includes("sign"))
        );
      });

      console.log(
        "Found connection methods:",
        connectionMethods.map(([key]) => key),
      );

      // Try each method
      for (const [methodName, method] of connectionMethods) {
        try {
          console.log(`Trying ${methodName}...`);
          const result = (method as Function)();

          // Check if result is a Promise
          if (result && typeof result.then === "function") {
            const awaitedResult = await result;
            if (awaitedResult) {
              setSigner(awaitedResult);
              return;
            }
          } else if (result) {
            setSigner(result);
            return;
          }
        } catch (e) {
          console.log(`Method ${methodName} failed:`, e);
        }
      }

      setError("No wallet connection method available in CCC library");
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      setError(`Error: ${errorMsg}`);
      console.error("Wallet connection error:", err);
    } finally {
      setIsConnecting(false);
    }
  }, []);

  const disconnect = useCallback(async () => {
    setSigner(null);
    setError(null);
  }, []);

  return {
    signer,
    isConnecting,
    error,
    connect,
    disconnect,
  };
}
