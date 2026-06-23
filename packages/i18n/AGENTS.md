# Package `@repo/i18n` (packages/i18n)

## Purpose

Shared i18n package providing locale constants, request locale resolution, Lingui helpers, and compiled catalogs.

## Exports

- `.` - locale constants, base i18n setup, and catalog loading helpers
- `./react` - React provider wrapper and Lingui React exports
- `./server` - request header locale resolution helpers
- `./locales/{locale}/{catalog}/messages` - compiled message catalogs

## Supported Locales

- `en`
- `es`
- `fr`

## Notes

- Keep message IDs stable to preserve translation continuity.
- `x-locale` is preferred over `accept-language` when both are present.
