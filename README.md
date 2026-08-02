# Mimuro

React Native anime streaming client (UI + app architecture).

> **Public source export:** this repo has **no content API**. Private content-provider code is stubbed. Use it to inspect structure, UI, and local features only.

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

## Getting started

```sh
npm install
npm start
```

Android:

```sh
npm run android
```

iOS:

```sh
bundle install
bundle exec pod install
npm run ios
```

Network content calls will fail by design — this public export does not include a content API.

## Note

Shared for inspection only. There is no backend in this repository, and private content-provider code is not published.
