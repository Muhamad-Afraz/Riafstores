export async function readJsonBody(request: Request) {
  try {
    const body: unknown = await request.json();
    if (typeof body !== "object" || body === null || Array.isArray(body)) {
      return null;
    }
    return body as Record<string, unknown>;
  } catch {
    return null;
  }
}

export function readString(value: unknown) {
  return typeof value === "string" ? value : "";
}

export function readBoolean(value: unknown, fallback = false) {
  return typeof value === "boolean" ? value : fallback;
}
