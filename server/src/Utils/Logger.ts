export enum LogLevel {
  DEBUG,
  INFO,
  WARN,
  ERROR,
  FATAL,
}

export default class Logger {
  private static currentLogLevel: LogLevel = Number(process.env.LOG_LEVEL) | 1;

  public static info(msg: string, obj?: unknown): void {
    if (this.currentLogLevel <= LogLevel.INFO) {
      console.log(msg, obj || "");
    }
  }

  public static error(msg: string, obj?: unknown): void {
    if (this.currentLogLevel <= LogLevel.INFO) {
      console.error(msg, obj || "");
    }
  }
  public static warn(msg: string, obj?: unknown): void {
    if (this.currentLogLevel <= LogLevel.INFO) {
      console.warn(msg, obj || "");
    }
  }
  public static debug(msg: string, obj?: unknown): void {
    if (this.currentLogLevel <= LogLevel.INFO) {
      console.debug(msg, obj || "");
    }
  }
  public static fatal(msg: string, obj?: unknown): void {
    if (this.currentLogLevel <= LogLevel.INFO) {
      console.error(msg, obj || "");
    }
  }
}
