import { NextResponse } from "next/server";
import { ZodError } from "zod";

type SuccessResponse<T> = {
  readonly success: true;
  readonly data: T;
};

type FailureResponse = {
  readonly success: false;
  readonly error: {
    readonly code: string;
    readonly message: string;
    readonly details?: unknown;
  };
};

export function jsonOk<T>(data: T, init?: ResponseInit) {
  return NextResponse.json<SuccessResponse<T>>({ success: true, data }, init);
}

export function jsonError(code: string, message: string, status = 400, details?: unknown) {
  return NextResponse.json<FailureResponse>(
    {
      success: false,
      error: {
        code,
        message,
        details,
      },
    },
    { status },
  );
}

export function jsonFromError(error: unknown) {
  if (error instanceof ZodError) {
    return jsonError("VALIDATION_ERROR", "Request validation failed.", 422, error.flatten());
  }

  if (error instanceof Error && error.message.startsWith("Missing required environment variable")) {
    return jsonError("SERVICE_UNCONFIGURED", error.message, 503);
  }

  if (
    error instanceof Error &&
    (error.message.includes("GoogleGenerativeAI") ||
      error.message.includes("GEMINI_API_KEY") ||
      error.message.includes("Gemini") ||
      error.message.includes("API key"))
  ) {
    return jsonError(
      "AI_PROVIDER_ERROR",
      "Gemini copilot generation failed. Check GEMINI_API_KEY and provider connectivity.",
      502,
    );
  }

  if (error instanceof Error && error.message === "Invalid MongoDB object id.") {
    return jsonError("INVALID_ID", "The requested resource id is invalid.", 400);
  }

  if (error instanceof Error && error.name === "EscrowInsufficientError") {
    return jsonError("ESCROW_INSUFFICIENT", error.message, 409);
  }

  if (error instanceof Error && error.name === "SubmissionRejectedError") {
    return jsonError("SUBMISSION_NOT_ACCEPTED", error.message, 409);
  }

  if (error instanceof Error && error.name === "ReviewForbiddenError") {
    return jsonError("REVIEW_FORBIDDEN", error.message, 403);
  }

  if (error instanceof Error && error.message.startsWith("Pinata upload failed")) {
    return jsonError("STORAGE_UPLOAD_FAILED", error.message, 502);
  }

  if (error instanceof Error && error.message.includes("IPFS CID")) {
    return jsonError("STORAGE_INVALID_RESPONSE", error.message, 502);
  }

  return jsonError("INTERNAL_ERROR", "The request could not be completed.", 500);
}
