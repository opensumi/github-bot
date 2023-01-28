export function assert(expr: any, message: any) {
  if (!Boolean(expr)) {
    if (message instanceof Error) {
      throw message;
    }
    throw new Error(message || 'unknown assertion error');
  }
}
