import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.tsx";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { ccc } from "@ckb-ccc/connector-react";
import "./index.css";

// Log available CCC methods for debugging
const cccKeys = Object.keys(ccc || {});
console.log("CCC Library exports available:", cccKeys);
console.log("Total exports:", cccKeys.length);

// Log what methods are actually functions
const cccFunctions = cccKeys.filter(
  (key) => typeof (ccc as any)[key] === "function",
);
console.log("CCC functions:", cccFunctions);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ErrorBoundary>
  </React.StrictMode>,
);
