export enum LogLevel {
  DEBUG,
  INFO,
  WARN,
  ERROR,
  FATAL,
}

export class Logger {
  private currentLogLevel: LogLevel = Number(process.env.LOG_LEVEL) | 1;

  public info(msg: string, obj?: Record<string, any>): void {
    if (this.currentLogLevel <= LogLevel.INFO) {
      console.log(msg, obj || ""); // think how to aVOID UNDEFINED IN LOGS
    }
  }

  public error(msg: string): void {}
  public warn(msg: string): void {}
  public debug(msg: string): void {}
  public fatal(msg: string): void {}
}
