import { Owlbear, PROJEKT_IDENTIFIER } from "./owlbear";
import { Log } from "./utils";

Log.info("Init", `Setup Backgroundtasks: ${PROJEKT_IDENTIFIER}`);
Owlbear.setupBackground();
