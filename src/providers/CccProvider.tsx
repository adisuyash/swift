import { createContext, useContext, ReactNode } from "react";
import { Provider, useCcc, useSigner } from "@ckb-ccc/connector-react";

interface CccContextType {
  open: () => unknown;
  disconnect: () => unknown;
  setClient: (client: any) => unknown;
  client: any;
  wallet?: any;
  signerInfo?: any;
  signer?: any;
}

const CccContext = createContext<CccContextType | null>(null);

interface CccProviderProps {
  children: ReactNode;
}

export function CccProvider({ children }: CccProviderProps) {
  return (
    <Provider>
      <CccProviderInner>{children}</CccProviderInner>
    </Provider>
  );
}

function CccProviderInner({ children }: { children: ReactNode }) {
  const cccData = useCcc();
  const signer = useSigner();

  const contextValue = {
    ...cccData,
    signer,
  };

  return (
    <CccContext.Provider value={contextValue}>{children}</CccContext.Provider>
  );
}

export function useCccContext() {
  const context = useContext(CccContext);
  if (!context) {
    throw new Error("useCccContext must be used within CccProvider");
  }
  return context;
}

export function useCccSigner() {
  const context = useCccContext();
  return context.signer;
}

export function useCccAccount() {
  const context = useCccContext();
  return context.signerInfo;
}
