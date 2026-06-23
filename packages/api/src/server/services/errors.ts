import type { I18nInstance } from "@repo/i18n";
import { TRPCError } from "@trpc/server";
import { Schema } from "effect";

export class DatabaseError extends Schema.TaggedErrorClass<DatabaseError>()("DatabaseError", {
  cause: Schema.Unknown,
  message: Schema.optional(Schema.String),
}) {}

export class MissingTodoIdError extends Schema.TaggedErrorClass<MissingTodoIdError>()(
  "MissingTodoIdError",
  {},
) {}

export class ValidationError extends Schema.TaggedErrorClass<ValidationError>()("ValidationError", {
  message: Schema.String,
}) {}

type TRPCErrorCode = TRPCError["code"];

type ErrorMapping = {
  code: TRPCErrorCode;
  messageKey: string;
};

const ERROR_MAPPINGS: Record<string, ErrorMapping> = {
  DatabaseError: {
    code: "INTERNAL_SERVER_ERROR",
    messageKey: "api.error.internal",
  },
  MissingTodoIdError: {
    code: "BAD_REQUEST",
    messageKey: "api.error.noIdProvided",
  },
  TodoNotFoundError: {
    code: "NOT_FOUND",
    messageKey: "api.error.todoNotFound",
  },
  ValidationError: {
    code: "BAD_REQUEST",
    messageKey: "api.error.validation",
  },
};

const FALLBACK_MESSAGES: Record<string, string> = {
  "api.error.forbidden": "You must be signed in to perform this action.",
  "api.error.internal": "An internal error occurred.",
  "api.error.noIdProvided": "No todo id was provided.",
  "api.error.todoNotFound": "Todo not found.",
  "api.error.validation": "Request validation failed.",
};

export const translateApiMessage = (i18n: I18nInstance, messageKey: string) => {
  const translated = i18n._(messageKey);
  return translated === messageKey ? (FALLBACK_MESSAGES[messageKey] ?? messageKey) : translated;
};

export const wrapDatabaseError = (error: unknown) =>
  new DatabaseError({
    cause: error,
    message: error instanceof Error ? error.message : "Unknown database error",
  });

export const isTaggedError = (error: unknown): error is { _tag: string; message?: string } =>
  error !== null &&
  typeof error === "object" &&
  "_tag" in error &&
  typeof (error as { _tag: unknown })._tag === "string";

export const mapDomainErrorToTRPC = (
  error: { _tag: string; message?: string },
  i18n: I18nInstance,
) => {
  const mapping = ERROR_MAPPINGS[error._tag];

  if (!mapping) {
    return new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: error.message ?? translateApiMessage(i18n, "api.error.internal"),
      cause: error,
    });
  }

  return new TRPCError({
    code: mapping.code,
    message:
      error._tag === "ValidationError" && error.message
        ? error.message
        : translateApiMessage(i18n, mapping.messageKey),
    cause: error,
  });
};
