import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./app/styles/index.css";
import "swiper/swiper-bundle.css";
import "flatpickr/dist/flatpickr.css";
import "@/app/i18n";
import { App } from "@/app";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
