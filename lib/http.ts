import { ZodError } from "zod";

export function jsonError(error: unknown): Response {
  if (error instanceof ZodError) {
    return Response.json(
      { error: "Invalid request", issues: error.issues },
      { status: 400 }
    );
  }

  return Response.json(
    { error: error instanceof Error ? error.message : "Unexpected error" },
    { status: 500 }
  );
}
