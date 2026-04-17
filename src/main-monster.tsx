import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import "./index.css";

import { Owlbear } from "./owlbear";
import { MonsterDictionary, TabManager } from "./components";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <TabManager
      gm={Owlbear.isGM()}
      tabs={[
        { name: "Selection", content: <div>Selection</div> },
        { name: "Collection", content: <div>Collection</div> },
        { name: "Dictionary", content: <MonsterDictionary /> },
      ]}
      gmTabs={[]}
    />
  </StrictMode>,
);
