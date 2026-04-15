function safeStringify(value: unknown) {
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}

function createRichError(
  message: string,
  extra?: Record<string, unknown>
): Error {
  const error = new Error(message) as Error & Record<string, unknown>;
  if (extra) Object.assign(error, extra);
  return error;
}

export function normalizeHookError(err: unknown): Error {
  if (err instanceof Error) return err;
  if (typeof err === "string") return new Error(err);

  if (err && typeof err === "object") {
    const record = err as Record<string, any>;
    const nestedMessage =
      record.message ??
      record.reason ??
      record.error?.message ??
      record.data?.message;

    if (typeof nestedMessage === "string" && nestedMessage.length > 0) {
      return createRichError(nestedMessage, record);
    }

    return createRichError(safeStringify(err), record);
  }

  return new Error(String(err));
}
