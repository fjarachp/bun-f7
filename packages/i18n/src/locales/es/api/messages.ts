/*eslint-disable*/ import type { Messages } from "@lingui/core";
export const messages = JSON.parse(
  '{"api.error.forbidden":["Debes iniciar sesión para realizar esta acción."],"api.error.internal":["Ocurrió un error interno."],"api.error.noIdProvided":["No se proporcionó un ID de tarea."],"api.error.todoNotFound":["Tarea no encontrada."],"api.error.validation":["La validación de la solicitud falló."]}',
) as Messages;
