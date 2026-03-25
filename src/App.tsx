import { Routes, Route } from "react-router-dom";
import { InvoiceForm } from "./pages/InvoiceForm";
import { PaymentScanner } from "./pages/PaymentScanner";
import { Confirmation } from "./pages/Confirmation";
import { CccProvider } from "./providers/CccProvider";
import { WalletConnector } from "./components/WalletConnector";

function App() {
  return (
    <CccProvider>
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-primary-600">Swift</h1>
              <p className="text-sm text-gray-600">
                Turn invoices into instant payments
              </p>
            </div>
            <WalletConnector />
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<InvoiceForm />} />
            <Route path="/pay" element={<PaymentScanner />} />
            <Route path="/confirmation" element={<Confirmation />} />
          </Routes>
        </main>
      </div>
    </CccProvider>
  );
}

export default App;
