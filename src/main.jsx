import ReactDOM from "react-dom/client";
import { ccc } from "@ckb-ccc/connector-react";
import App from "./App";
import "./index.css";

const client = new ccc.ClientPublicTestnet();

ReactDOM.createRoot(document.getElementById("root")).render(
  <ccc.Provider defaultClient={client}>
    <App />
  </ccc.Provider>,
);
