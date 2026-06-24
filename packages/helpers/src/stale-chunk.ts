const STALE_CHUNK_RELOAD_PREFIX = "chp:stale-chunk-reload";
const STALE_CHUNK_HANDLER_KEY = "__chpStaleChunkHandlers";

const staleChunkPatterns = [
  /ChunkLoadError/i,
  /CSS_CHUNK_LOAD_FAILED/i,
  /vite:preloadError/i,
  /Failed to fetch dynamically imported module/i,
  /error loading dynamically imported module/i,
  /Importing a module script failed/i,
  /Failed to load module script/i,
  /Loading chunk [\w-]+ failed/i,
  /Unable to preload CSS for/i,
];

type StaleChunkEvent = Event & {
  payload?: unknown;
};

type StaleChunkWindow = Window &
  typeof globalThis & {
    [STALE_CHUNK_HANDLER_KEY]?: Record<string, boolean>;
  };

type StaleChunkReloadOptions = {
  appName: string;
};

function getErrorText(error: unknown) {
  if (error instanceof Error) {
    return `${error.name}: ${error.message}`;
  }

  if (typeof error === "string") {
    return error;
  }

  if (error && typeof error === "object") {
    const maybeError = error as { message?: unknown; name?: unknown };

    if (typeof maybeError.message === "string") {
      return [maybeError.name, maybeError.message].filter(Boolean).join(": ");
    }
  }

  return "";
}

function getReloadStorageKey(appName: string, error: unknown) {
  const errorText = getErrorText(error);
  const identifier = errorText || "unknown";

  return `${STALE_CHUNK_RELOAD_PREFIX}:${appName}:${hashText(identifier)}`;
}

function hashText(value: string) {
  let hash = 5381;

  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 33) ^ value.charCodeAt(index);
  }

  return (hash >>> 0).toString(36);
}

function shouldReloadAgain(storageKey: string) {
  try {
    if (window.sessionStorage.getItem(storageKey)) {
      return false;
    }

    window.sessionStorage.setItem(storageKey, "1");
    return true;
  } catch {
    return true;
  }
}

export function isStaleChunkError(error: unknown) {
  const errorText = getErrorText(error);

  return staleChunkPatterns.some((pattern) => pattern.test(errorText));
}

export function reloadForStaleChunkError(error: unknown, options: StaleChunkReloadOptions) {
  if (typeof window === "undefined" || !isStaleChunkError(error)) {
    return false;
  }

  const storageKey = getReloadStorageKey(options.appName, error);

  if (!shouldReloadAgain(storageKey)) {
    return false;
  }

  window.location.reload();
  return true;
}

export function registerStaleChunkReloadHandler(options: StaleChunkReloadOptions) {
  if (typeof window === "undefined") {
    return () => {};
  }

  const staleChunkWindow = window as StaleChunkWindow;
  staleChunkWindow[STALE_CHUNK_HANDLER_KEY] ??= {};

  if (staleChunkWindow[STALE_CHUNK_HANDLER_KEY][options.appName]) {
    return () => {};
  }

  staleChunkWindow[STALE_CHUNK_HANDLER_KEY][options.appName] = true;

  const handleReload = (event: StaleChunkEvent, error: unknown) => {
    if (reloadForStaleChunkError(error, options)) {
      event.preventDefault();
    }
  };

  const handleVitePreloadError = (event: StaleChunkEvent) => {
    const error = isStaleChunkError(event.payload) ? event.payload : event.type;

    handleReload(event, error);
  };

  const handleWindowError = (event: ErrorEvent) => {
    handleReload(event, event.error ?? event.message);
  };

  const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
    handleReload(event, event.reason);
  };

  window.addEventListener("vite:preloadError", handleVitePreloadError);
  window.addEventListener("error", handleWindowError);
  window.addEventListener("unhandledrejection", handleUnhandledRejection);

  return () => {
    window.removeEventListener("vite:preloadError", handleVitePreloadError);
    window.removeEventListener("error", handleWindowError);
    window.removeEventListener("unhandledrejection", handleUnhandledRejection);
    delete staleChunkWindow[STALE_CHUNK_HANDLER_KEY]?.[options.appName];
  };
}
