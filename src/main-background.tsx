import { Owlbear, PROJEKT_IDENTIFIER } from "./owlbear";
import { Log } from "./utils";

// direct import: the components barrel would pull React into the background
import { Sounds } from "./components/sound/sound-board/sound-board.constant";

Log.info("Init", `Setup Backgroundtasks: ${PROJEKT_IDENTIFIER}`);
Owlbear.setupBackground(Sounds);
