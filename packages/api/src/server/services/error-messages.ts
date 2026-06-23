import type { I18nInstance } from "@repo/i18n";

/**
 * Static declarations for Lingui extraction. Runtime error mapping translates
 * these keys dynamically, so the literal calls keep API catalog entries alive.
 */
export const declareApiErrorMessages = (i18n: I18nInstance) => {
  i18n._({
    id: "api.error.forbidden",
    message: "You must be signed in to perform this action.",
  });
  i18n._({
    id: "api.error.internal",
    message: "An internal error occurred.",
  });
  i18n._({
    id: "api.error.noIdProvided",
    message: "No todo id was provided.",
  });
  i18n._({
    id: "api.error.todoNotFound",
    message: "Todo not found.",
  });
  i18n._({
    id: "api.error.validation",
    message: "Request validation failed.",
  });
};
