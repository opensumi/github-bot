export class Logger {
  public static instance(): Logger {
    if (!Logger._instance) {
      Logger._instance = new Logger();
    }
    return Logger._instance;
  }

  private static _instance: Logger;

  private constructor() {
    //
  }

  public info(...args: any[]) {
    console.log(...args);
  }

  public error(...args: any[]) {
    console.error(...args);
  }

  public warn(...args: any[]) {
    console.warn(...args);
  }

  public debug(...args: any[]) {
    console.debug(...args);
  }
}
