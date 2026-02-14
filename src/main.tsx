import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./index.css";
import { SolarProvider } from "./context/SolarContext";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <SolarProvider>
        <App />
      </SolarProvider>
    </BrowserRouter>
  </React.StrictMode>,
);
