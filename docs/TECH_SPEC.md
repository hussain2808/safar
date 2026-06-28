# Safar — Technical Specification

## Stack

| Layer | Choice |
|---|---|
| Framework | React 18 + TypeScript, built with Vite 5 |
| Routing | react-router-dom v6 (`BrowserRouter`) |
| Styling | Tailwind CSS v3, custom theme tokens in `tailwind.config.js` |
| Local state | Zustand (thin UI-only stores, e.g. search query, auth) |
| Local database | Dexie 4 (IndexedDB wrapper) + `dexie-react-hooks` (`useLiveQuery`) |
| Remote backend | Firebase: Auth (Google), Firestore, Storage |
| Search | Fuse.js (fuzzy matching with highlighted indices) |
| Animation | framer-motion (bottom sheets, drag-to-dismiss) |
| IDs | nanoid |
| Dates | date-fns |
| PWA | vite-plugin-pwa (Workbox), manifest + service worker, install/update banner |
| Package manager | pnpm |

Path alias: `@` → `src/`.

## Application shell

- `src/App.tsx` — top-level `BrowserRouter`, wraps everything in `AuthGate`, defines one route per module (`/hisaab/*`, `/amaanat/*`) plus the home route `/`. Renders the global `UpdateBanner` outside the auth gate's content tree but inside the router.
- `src/components/AuthGate.tsx` — blocks all routes until Firebase Auth resolves; shows `SignIn` (Google OAuth button) if unauthenticated, a loading splash while auth state is resolving, otherwise renders children.
- `src/store/auth.ts` — Zustand store holding `{ user, authLoading }`. `initAuth()` subscribes to `onAuthStateChanged`; on sign-in it runs each module's `syncOnLogin(uid)` then `retryPendingSync(uid)` via `Promise.all`. A `window.addEventListener('online', ...)` hook re-runs every module's retry function on reconnect.
- `src/app/` — home screen only: `Header`, `Greeting`, `ModuleGrid` (reads `mockData.ts`, navigates to `/${module.key}` on tap if `enabled`), `TodaysAttention`, `LifeSnapshot`, `RecentActivity`, `BottomNav`, `Fab`. `iconMap.ts` maps string icon keys to `lucide-react` components.

## Module architecture

Every feature module is self-contained under `src/modules/<name>/`:

```
modules/<name>/
  <Name>App.tsx          # route root: lazy-loaded pages, ErrorBoundary, Suspense, SyncStatusBanner
  types.ts                # entity + Result<T> types
  db/
    index.ts              # Dexie subclass, one IndexedDB database per module
    <entity>.ts            # CRUD: create/update/delete, fire-and-forget Firestore push
  sync/
    firestore.ts           # Firestore doc paths, pushX/deleteFirestoreX, syncOnLogin(uid)
    retryQueue.ts           # retryPendingSync(uid): sweeps pendingSync rows + pendingDeletes
  lib/                      # pure helpers (formatting, compression, status calculations)
  store/                    # Zustand UI state (e.g. search query)
  shared/components/        # EmptyState, Skeleton, BottomSheet, ErrorBoundary, SyncStatusBanner
  features/<feature>/
    components/
    hooks/
  pages/                    # route-level screens
```

A module can be removed by deleting its folder plus its one `<Route>` entry and `mockData.ts`/`BottomNav.tsx` references — no shared module-to-module imports.

### Local-first write pattern

Every entity write:
1. Writes to Dexie immediately with `pendingSync: true`.
2. Fires an async Firestore push in the background; on success, flips `pendingSync: false`.
3. On failure, the row stays `pendingSync: true` and is retried later — no error surfaces to the user mid-write.

Deletes:
1. Insert a row into the module's `pendingDeletes` table (`{ id, kind, targetId, createdAt }`).
2. Delete the local row.
3. Fire an async Firestore delete; on success, remove the `pendingDeletes` row.

`retryPendingSync(uid)` (called on login and on the `online` event) re-runs steps 2–3 for every row still flagged `pendingSync` and every row still in `pendingDeletes`, dispatching by `kind`.

### Result type

All CRUD functions return:
```ts
type Result<T> = { ok: true; data: T } | { ok: false; error: string };
```

## Data model

### Hisaab (`safar-hisaab-db`)
Books → Categories → Transactions, with Transaction photos. Photos are compressed client-side (canvas resize to a max width, JPEG thumbnail) before being stored as a `Blob` in Dexie and uploaded to Storage.

### Amaanat (`safar-amaanat-db`)
- `items` — `{ id, name, category, merchant?, purchaseDate?, purchasePrice?, photoIds[], documentIds[], serialNumber?, warrantyProvider?, warrantyExpiry?, notes?, createdAt, updatedAt, pendingSync? }`. `category` is one of `electronics | valuables | vehicles | property | records`.
- `photos` — compressed image blob + thumbnail, image-only (canvas-based compression cannot decode PDFs).
- `documents` — raw, uncompressed blob with arbitrary `mimeType` (invoices, receipts, manuals — frequently PDFs).
- `pendingDeletes` — `{ id, kind: 'item' | 'photo' | 'document', targetId, createdAt }`.

`warrantyStatus` (`expired | expiring_soon | active | none`) is computed client-side from `warrantyExpiry` vs. `Date.now()` (≤30 days = expiring soon) — no scheduled jobs or push notifications; reminders are purely a derived UI badge plus a "needs attention" list on the module's home page.

## Firebase

| Concern | Path / mechanism |
|---|---|
| Auth | Google provider via Firebase Auth |
| Firestore | per-module flat collections under `users/{uid}/...` (e.g. `amaanatItems`, `amaanatPhotos`, `amaanatDocuments`) |
| Storage | per-module binary paths under `users/{uid}/...` (e.g. `amaanat-photos/{id}`, `amaanat-documents/{id}`) |
| Security rules | both Firestore and Storage restrict all reads/writes to `request.auth.uid == uid` on the `users/{uid}/**` subtree — no cross-user access, no public access |
| Config | `src/lib/firebase.ts`, values from `VITE_FIREBASE_*` environment variables |
| Hosting | `firebase.json` — serves `dist/`, SPA rewrite (`**` → `/index.html`) |

## Build & deploy

- `pnpm dev` — Vite dev server.
- `pnpm build` — `tsc -b && vite build`; bundles are route-level code-split (`lazy()` per page); Workbox precaches built assets and registers a service worker with `registerType: 'prompt'` (update banner, not silent auto-update).
- Deploy: push to `main` triggers an automatic deploy (CI configured outside this repo's tracked files).

## Styling conventions

- Shared Safar shell tokens (used by the home screen and newer modules like Amaanat): `cream`, `brown`, `text.{primary,secondary,muted}`, `card.{bg,border}`, `icon.bg`, `accent.{orange,green,purple,pink,blue}.{bg,fg}`.
- Hisaab-specific tokens: CSS variables (`--color-bg-primary`, `--color-text-primary`, `--color-accent-button`, etc.) defined globally in `src/index.css`, exposed through Tailwind as `bg-bg-*`, `hisaabText-*`, `hisaabAccent-*`, `hisaabBorder-*`. These are dark-mode-flavored and intentionally scoped to Hisaab's visual identity; new modules should default to the shared tokens unless a module specifically needs a distinct look.
- Fonts: Playfair Display (serif, headings) and Inter (sans, body).
