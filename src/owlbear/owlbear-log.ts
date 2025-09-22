import OBR from "@owlbear-rodeo/sdk";

import { LogLevel } from "../utils";

import { BROADCAST } from "./constants";
import { Owlbear } from ".";

interface LogMessageData {
  sender: string;
  level: LogLevel;
  message: string;
  args: unknown[];
}

const LogChannel = `${BROADCAST}/log`;

export class OwlbearLog {
  protected readonly ready: Promise<void>;
  constructor(ready: Promise<void>) {
    this.ready = ready;
    this.listenLogs();
  }

  async sendLog(
    level: LogLevel,
    message: string,
    args: unknown[]
  ): Promise<void> {
    if (!Owlbear.settings.get("debug-trace")) return;
    await this.ready;

    const log: LogMessageData = {
      sender: (await Owlbear.player.getMe()).name,
      level,
      message,
      args: JSON.parse(JSON.stringify(args)),
    };

    await OBR.broadcast.sendMessage(LogChannel, log, { destination: "REMOTE" });
  }

  protected async listenLogs() {
    await this.ready;
    if (!(await Owlbear.isGM())) return;

    OBR.broadcast.onMessage(LogChannel, ({ data }) => {
      if (!Owlbear.settings.get("debug-trace")) return;

      const { sender, level, message, args } = data as LogMessageData;
      const logMessage = `[${sender}] ${message}`;
      switch (level) {
        case LogLevel.ERROR:
          console.error(logMessage, ...args);
          break;
        case LogLevel.WARN:
          console.warn(logMessage, ...args);
          break;
        case LogLevel.INFO:
          console.info(logMessage, ...args);
          break;
        case LogLevel.DEBUG:
          console.debug(logMessage, ...args);
          break;
        case LogLevel.TRACE:
        default:
          console.trace(logMessage, ...args);
          break;
      }
    });
  }
}
