# Mimuro

React Native anime streaming client (UI + app architecture).

> **Public review build:** content provider / scrape API implementations are **intentionally stubbed**. This repo is for code review of structure, UI, and local features — not a redistributable working streamer.

## What’s included

- Screens, navigation, theming
- Continue watching, preferences, schedule reminders (local)
- Update check / share / Discord config
- Public Jikan MAL helper (optional metadata)

## What’s omitted

- Private content API hosts and endpoints
- HTML scrape / parser provider logic
- Download mapper provider
- Hardcoded player / comments provider origins

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

Without your private backend, network content calls will fail by design.

## Private backend (not published)

If you maintain a private fork, set:

- `MIMURO_API_BASE_URL`
- `MIMURO_SCHEDULE_API_BASE_URL`
- `MIMURO_PLAYER_ORIGIN` / `MIMURO_PLAYER_REFERER`
- `MIMURO_COMMENTS_BASE_URL` / `MIMURO_COMMENTS_AUTH_ORIGIN`

## License / intent

Shared for portfolio / code review. Do not treat this public export as a complete cloneable streaming service.
