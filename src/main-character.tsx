import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import {
  CharacterManager,
  SettingsController,
  SoundBoard,
  TabManager,
  TimeManager,
} from "./components";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <TabManager
      tabs={[
        { name: "Character", content: <CharacterManager /> },
        { name: "⚙", content: <SettingsController /> },
        { name: "𝅘𝅥𝅮", content: <SoundBoard /> },
        { name: "☾", content: <TimeManager /> },
      ]}
    />
  </StrictMode>
);
