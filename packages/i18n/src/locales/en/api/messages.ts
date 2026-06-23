/*eslint-disable*/ import type { Messages } from "@lingui/core";
export const messages = JSON.parse(
  '{"api.error.forbidden":["You must be signed in to perform this action."],"api.error.internal":["An internal error occurred."],"api.error.noIdProvided":["No todo id was provided."],"api.error.todoNotFound":["Todo not found."],"api.error.validation":["Request validation failed."]}',
) as Messages;
