export class StopError extends Error {
  constructor(message: string) {
    super(message);
  }
}

/**
 * `StopErrorWithReply` is a special error that will be caught by the command center and reply the message to the user.
 */
export class StopErrorWithReply extends Error {
  constructor(message: string) {
    super(message);
  }
}
