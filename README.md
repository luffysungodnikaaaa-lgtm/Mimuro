# Mimuro

React Native anime streaming client for **Android** (UI + app architecture).

> **Public source export:** this repo has **no content API**. Private content-provider code is stubbed. Use it to inspect structure, UI, and local features only.

Currently targets **Android only**.

## What’s included

- Screens, navigation, theming
- Continue watching, preferences, schedule reminders (local)
- Update check / share / Discord config
- Public Jikan MAL helper (optional metadata)

## What’s omitted

- Content API hosts and endpoints
- Content provider / parser logic
- Download mapper provider
- Hardcoded player provider origins

Stubbed modules live under `src/api/` and throw:

`Private content API is not included in this public repository.`

## Getting started (Android)

```sh
npm install
npm start
```

```sh
npm run android
```

Network content calls will fail by design — this public export does not include a content API.
