import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { CharacterSelector } from "./components";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <CharacterSelector />
  </StrictMode>
);
