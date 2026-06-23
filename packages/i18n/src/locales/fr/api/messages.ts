/*eslint-disable*/ import type { Messages } from "@lingui/core";
export const messages = JSON.parse(
  '{"api.error.forbidden":["Vous devez être connecté pour effectuer cette action."],"api.error.internal":["Une erreur interne s’est produite."],"api.error.noIdProvided":["Aucun ID de tâche n’a été fourni."],"api.error.todoNotFound":["Tâche introuvable."],"api.error.validation":["La validation de la requête a échoué."]}',
) as Messages;
