export function getErrorMessage(error: unknown, fallback?: string): string {
  if (error instanceof Error) {
    return error.message || fallback || "Unknown error occurred";
  }
  if (typeof error === "string") {
    return error || fallback || "Unknown error occurred";
  }
  return fallback || "Unknown error occurred";
}

