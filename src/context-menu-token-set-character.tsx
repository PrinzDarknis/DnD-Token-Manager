import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { CharacterSelect } from "./components";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <CharacterSelect />
  </StrictMode>
);
