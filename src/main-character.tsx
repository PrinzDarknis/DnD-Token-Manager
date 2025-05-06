import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import "./index.css";

import { Owlbear } from "./owlbear";
import {
  CharacterManager,
  PuzzleEdit,
  PuzzleView,
  SettingsController,
  SoundBoard,
  TabManager,
  TimeManager,
} from "./components";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <TabManager
      gm={Owlbear.isGM()}
      tabs={[
        { name: "Character", content: <CharacterManager /> },
        { name: "⚙", content: <SettingsController /> },
        { name: "𝅘𝅥𝅮", content: <SoundBoard /> },
        { name: "☾", content: <TimeManager /> },
        { name: "⚄", content: <PuzzleView /> },
      ]}
      gmTabs={[{ name: "⚄⚙", content: <PuzzleEdit /> }]}
    />
  </StrictMode>
);
