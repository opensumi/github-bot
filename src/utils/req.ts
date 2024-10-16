export function getHostOrigin(req: Request) {
  const url = new URL(req.url);
  const origin = url.origin;
  return origin;
}
