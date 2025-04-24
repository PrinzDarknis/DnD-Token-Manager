import { LogLevel } from "./log-level.enum";

export class Logger {
  logLevel: LogLevel = LogLevel.TRACE;

  protected log(
    level: LogLevel,
    source: string,
    message: string,
    ...args: unknown[]
  ) {
    if (level < this.logLevel) return;

    const info = `[${source}] ${message}${args && args.length > 0 ? ":" : ""}`;

    switch (level) {
      case LogLevel.TRACE:
        console.trace(info, ...args);
        return;
      case LogLevel.DEBUG:
        console.debug(info, ...args);
        return;
      case LogLevel.INFO:
        console.log(info, ...args);
        return;
      case LogLevel.WARN:
        console.warn(info, ...args);
        return;
      case LogLevel.ERROR:
        console.error(info, ...args);
        return;

      default:
        break;
    }
  }

  trace(source: string, message: string, ...args: unknown[]) {
    this.log(LogLevel.TRACE, source, message, args);
  }

  debug(source: string, message: string, ...args: unknown[]) {
    this.log(LogLevel.DEBUG, source, message, args);
  }

  info(source: string, message: string, ...args: unknown[]) {
    this.log(LogLevel.INFO, source, message, args);
  }

  warn(source: string, message: string, ...args: unknown[]) {
    this.log(LogLevel.WARN, source, message, args);
  }

  error(source: string, message: string, ...args: unknown[]) {
    this.log(LogLevel.ERROR, source, message, args);
  }

  exception(e: unknown) {
    console.error(e);
  }
}
