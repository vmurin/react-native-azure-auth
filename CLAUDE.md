# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

React Native library implementing Azure AD OAuth2 V2.0 authentication. Provides token cache, authorization code grant with PKCE, silent token acquisition, and MS Graph API requests. Uses native modules (`SFSafariViewController` on iOS, Chrome Custom Tabs on Android) for the auth browser flow.

## Commands

- **Run all tests:** `yarn test` (or `npm test`) — runs Jest
- **Run a single test file:** `npx jest src/token/__tests__/scope.spec.js`
- **Run tests matching a name:** `npx jest -t "test name pattern"`

There is no separate build step — the library ships plain JS (ES modules with Babel transforms at consumer side). No lint script is configured in package.json; ESLint config exists at `.eslintrc.js`.

## Architecture

Entry point: `src/index.js` — exports the `AzureAuth` class, which composes two main subsystems:

- **`Auth`** (`src/auth/index.js`) — Core authentication logic. Builds authorize/logout URLs, exchanges authorization codes for tokens, refreshes tokens, performs silent token acquisition via cache, and wraps MS Graph API calls. Uses `Client` for HTTP and `TokenCache` for persistence.
- **`WebAuth`** (`src/webauth/index.js`) — Browser-based interactive auth. Drives the native in-app browser via `Agent`, constructs the full OAuth2 authorize URL with PKCE (code_challenge_method: plain), parses the redirect URL fragment response, exchanges the code, and saves tokens to cache.

Supporting modules:

- **`Agent`** (`src/webauth/agent.js`) — Bridge to native modules (`NativeModules.AzureAuth`). Opens the auth browser, listens for redirect URL via `Linking`, and generates PKCE/OAuth parameters (nonce, state, verifier) natively.
- **`Client`** (`src/networking/index.js`) — HTTP client using `fetch`. Handles URL construction, form-encoded POST bodies, Bearer auth, and JSON/blob response parsing.
- **`TokenCache`** (`src/token/cache.js`) — Singleton token cache backed by `@react-native-async-storage/async-storage`. Stores/retrieves access and refresh tokens with scope-aware key management. Handles scope intersection removal on save.
- **`Scope`** (`src/token/scope.js`) — Normalizes, sorts, and compares OAuth scopes. Always prepends `offline_access openid profile` as basic scope.
- **`BaseTokenItem` / `AccessTokenItem` / `RefreshTokenItem`** (`src/token/`) — Token model classes. `BaseTokenItem` decodes ID tokens (via `jwt-decode`), generates cache keys. `AccessTokenItem` adds expiration tracking.
- **`AuthError`** (`src/auth/authError.js`) — Error class wrapping Azure AD error responses.

Type definitions are in `types/index.d.ts` (manually maintained, not generated).

## Code Style

- 4-space indentation, single quotes, no semicolons (enforced by ESLint)
- ES module imports (`import`/`export`)
- Unix line endings
- Mocks live in `src/__mocks__/` (React Native, AsyncStorage, Linking)
- Tests use `*.spec.js` suffix in `__tests__/` directories colocated with source
