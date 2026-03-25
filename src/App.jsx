import { startTransition, useEffect, useState } from "react";
import { ccc } from "@ckb-ccc/connector-react";
import ClientDashboard from "./components/ClientDashboard";
import Confirmation from "./components/Confirmation";
import FreelancerDashboard from "./components/FreelancerDashboard";
import InvoiceApproval from "./components/InvoiceApproval";
import InvoiceForm from "./components/InvoiceForm";
import Landing from "./components/Landing";
import QRDisplay from "./components/QRDisplay";
import QRScanner from "./components/QRScanner";
import RoleSelection from "./components/RoleSelection";
import { getUser } from "./lib/supabase";

const VIEW_BY_ROLE = {
  freelancer: "freelancer",
  client: "client",
};

function getDashboardView(role) {
  return VIEW_BY_ROLE[role] || "freelancer";
}

function truncateAddress(address) {
  if (!address) {
    return "";
  }

  return `${address.slice(0, 8)}...${address.slice(-6)}`;
}

function decodeInvoicePayload(encodedPayload) {
  const parsed = JSON.parse(atob(encodedPayload.replaceAll(" ", "+")));

  if (
    !parsed ||
    typeof parsed !== "object" ||
    !parsed.invoiceId ||
    !parsed.freelancerAddress ||
    !parsed.name ||
    !parsed.description
  ) {
    throw new Error("Invalid payment payload.");
  }

  const amount = Number(parsed.amount);
  if (Number.isNaN(amount) || amount < 61) {
    throw new Error("Invalid invoice amount in payment payload.");
  }

  return {
    invoiceId: String(parsed.invoiceId),
    freelancerAddress: String(parsed.freelancerAddress),
    name: String(parsed.name).trim(),
    description: String(parsed.description).trim(),
    amount,
  };
}

function getInitialPaymentState() {
  if (typeof window === "undefined") {
    return {
      error: "",
      hasQuery: false,
      invoice: null,
    };
  }

  const params = new URLSearchParams(window.location.search);
  const encodedPayload = params.get("d");

  if (!encodedPayload) {
    return {
      error: "",
      hasQuery: false,
      invoice: null,
    };
  }

  try {
    return {
      error: "",
      hasQuery: true,
      invoice: decodeInvoicePayload(encodedPayload),
    };
  } catch (error) {
    console.error(error);
    return {
      error: "Invalid payment link.",
      hasQuery: true,
      invoice: null,
    };
  }
}

export default function App() {
  const [initialPaymentState] = useState(() => getInitialPaymentState());
  const { open } = ccc.useCcc();
  const signer = ccc.useSigner();
  const [view, setView] = useState(
    initialPaymentState.invoice ? "approve" : "landing",
  );
  const [user, setUser] = useState(null);
  const [currentInvoice, setCurrentInvoice] = useState(
    initialPaymentState.invoice,
  );
  const [currentQR, setCurrentQR] = useState(null);
  const [currentPaymentURL, setCurrentPaymentURL] = useState(null);
  const [txHash, setTxHash] = useState(null);
  const [walletAddress, setWalletAddress] = useState("");
  const [isSyncingWallet, setIsSyncingWallet] = useState(false);
  const [appError, setAppError] = useState(initialPaymentState.error);
  const [deepLinkInvoice, setDeepLinkInvoice] = useState(
    initialPaymentState.invoice,
  );

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const encodedPayload = params.get("d");

    if (!encodedPayload) {
      return;
    }

    try {
      const invoice = decodeInvoicePayload(encodedPayload);
      setDeepLinkInvoice(invoice);
      setCurrentInvoice(invoice);
      setView("approve");
      setAppError("");
    } catch (error) {
      console.error(error);
      setDeepLinkInvoice(null);
      setCurrentInvoice(null);
      setView("landing");
      setAppError("Invalid payment link.");
    }

    window.history.replaceState({}, "", "/");
  }, []);

  useEffect(() => {
    let cancelled = false;

    if (!signer) {
      setWalletAddress("");
      setUser(null);
      setCurrentQR(null);
      setCurrentPaymentURL(null);
      setTxHash(null);
      setAppError(initialPaymentState.error);
      setView(deepLinkInvoice ? "approve" : "landing");
      setIsSyncingWallet(false);
      return undefined;
    }

    async function syncUser() {
      setIsSyncingWallet(true);
      setAppError("");

      try {
        const address = await signer.getRecommendedAddress();

        if (cancelled) {
          return;
        }

        setWalletAddress(address);
        const existingUser = await getUser(address);

        if (cancelled) {
          return;
        }

        startTransition(() => {
          setCurrentQR(null);
          setCurrentPaymentURL(null);
          setTxHash(null);

          if (deepLinkInvoice) {
            setCurrentInvoice((current) => current || deepLinkInvoice);
            setUser(existingUser || null);
            setView("approve");
            return;
          }

          setCurrentInvoice(null);

          if (existingUser) {
            setUser(existingUser);
            setView(getDashboardView(existingUser.role));
            return;
          }

          setUser(null);
          setView("role");
        });
      } catch (error) {
        if (!cancelled) {
          console.error(error);
          setAppError(error.message || "Unable to sync wallet state.");
          setView(deepLinkInvoice ? "approve" : "landing");
        }
      } finally {
        if (!cancelled) {
          setIsSyncingWallet(false);
        }
      }
    }

    syncUser();

    return () => {
      cancelled = true;
    };
  }, [deepLinkInvoice, initialPaymentState.error, signer]);

  const handleGoHome = () => {
    startTransition(() => {
      setDeepLinkInvoice(null);
      setCurrentInvoice(null);
      setCurrentQR(null);
      setCurrentPaymentURL(null);
      setTxHash(null);

      if (user) {
        setView(getDashboardView(user.role));
        return;
      }

      setView("landing");
    });
  };

  const handleRoleComplete = (nextUser) => {
    startTransition(() => {
      setUser(nextUser);
      setView(deepLinkInvoice ? "approve" : getDashboardView(nextUser.role));
      setAppError("");
    });
  };

  const handleInvoiceReady = (invoice, qrDataURL, paymentURL) => {
    startTransition(() => {
      setDeepLinkInvoice(null);
      setCurrentInvoice(invoice);
      setCurrentQR(qrDataURL);
      setCurrentPaymentURL(paymentURL);
      setView("qr");
    });
  };

  const handleScanned = (invoicePayload) => {
    startTransition(() => {
      setDeepLinkInvoice(null);
      setCurrentInvoice(invoicePayload);
      setView("approve");
      setAppError("");
    });
  };

  const handleConfirmed = (nextTxHash) => {
    startTransition(() => {
      setDeepLinkInvoice(null);
      setTxHash(nextTxHash);
      setView("confirm");
    });
  };

  const handleRoleSwitch = (nextRole) => {
    startTransition(() => {
      setDeepLinkInvoice(null);
      setUser((currentUser) =>
        currentUser
          ? {
              ...currentUser,
              role: nextRole,
            }
          : currentUser,
      );
      setCurrentInvoice(null);
      setCurrentQR(null);
      setCurrentPaymentURL(null);
      setTxHash(null);
      setView(getDashboardView(nextRole));
    });
  };

  const handleResetDashboard = () => {
    startTransition(() => {
      setDeepLinkInvoice(null);
      setCurrentInvoice(null);
      setCurrentQR(null);
      setCurrentPaymentURL(null);
      setTxHash(null);
      setView(getDashboardView(user?.role));
    });
  };

  const headerLabel =
    signer && walletAddress ? truncateAddress(walletAddress) : "Connect Wallet";

  let content = <Landing />;

  if (view === "role") {
    content = (
      <RoleSelection
        walletAddress={walletAddress}
        onComplete={handleRoleComplete}
      />
    );
  }

  if (view === "freelancer" && user) {
    content = (
      <FreelancerDashboard
        user={user}
        onCreateInvoice={() => setView("create")}
        onSwitchToClient={() => handleRoleSwitch("client")}
      />
    );
  }

  if (view === "create" && user) {
    content = <InvoiceForm user={user} onInvoiceReady={handleInvoiceReady} />;
  }

  if (view === "qr" && currentInvoice && currentQR && currentPaymentURL) {
    content = (
      <QRDisplay
        invoice={currentInvoice}
        qrDataURL={currentQR}
        paymentURL={currentPaymentURL}
        onBack={() => setView("freelancer")}
      />
    );
  }

  if (view === "client" && user) {
    content = (
      <ClientDashboard
        user={user}
        onScan={() => setView("scan")}
        onSwitchToFreelancer={() => handleRoleSwitch("freelancer")}
      />
    );
  }

  if (view === "scan") {
    content = <QRScanner onScanned={handleScanned} />;
  }

  if (view === "approve" && currentInvoice) {
    content = (
      <InvoiceApproval
        invoice={currentInvoice}
        signer={signer}
        clientUser={user}
        onConfirmed={handleConfirmed}
      />
    );
  }

  if (view === "confirm" && txHash) {
    content = <Confirmation txHash={txHash} onReset={handleResetDashboard} />;
  }

  return (
    <div className="min-h-screen px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col">
        <header className="glass-panel mb-8 flex flex-col gap-4 rounded-[2rem] px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-7">
          <button
            type="button"
            onClick={handleGoHome}
            className="flex items-center gap-3 text-left transition hover:opacity-85"
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand/20 text-xl text-brand">
              ⚡
            </span>
            <span>
              <span className="block text-2xl font-bold tracking-tight">
                Swift
              </span>
              <span className="block text-sm text-gray-400">
                CKB testnet invoice payments
              </span>
            </span>
          </button>

          <div className="flex items-center gap-3 self-start sm:self-auto">
            {isSyncingWallet ? (
              <span className="rounded-full border border-brand/25 bg-brand/10 px-3 py-2 text-sm text-brand">
                Syncing wallet...
              </span>
            ) : null}

            <button
              type="button"
              onClick={() => open()}
              className="inline-flex items-center gap-2 rounded-full border border-brand/35 bg-brand/10 px-4 py-2.5 text-sm font-semibold text-brand transition hover:border-brand hover:bg-brand/20"
            >
              <span
                className={`h-2.5 w-2.5 rounded-full ${
                  signer ? "bg-brand" : "bg-gray-500"
                }`}
              />
              {headerLabel}
            </button>
          </div>
        </header>

        {appError ? (
          <div className="mb-6 rounded-3xl border border-red-400/25 bg-red-500/10 px-5 py-4 text-sm text-red-100">
            {appError}
          </div>
        ) : null}

        <main className="flex-1">{content}</main>
      </div>
    </div>
  );
}
