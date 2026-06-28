# Safar

**"The story of your journey."**

Safar is a personal life-management PWA — a single cream-and-brown home shell that hosts a set of self-contained modules, each covering one area of personal record-keeping. Data is local-first (IndexedDB via Dexie) with background sync to Firebase, so every module works fully offline and reconciles automatically when the device reconnects.

## Architecture

- **Shell**: React + TypeScript + Vite, Tailwind for styling, React Router for navigation. The home screen (`src/app/`) shows a module grid, today's-attention summary, a life snapshot, and recent activity, all driven by `src/app/mockData.ts`.
- **Auth**: Google sign-in via Firebase Auth, gating the entire app (`src/components/AuthGate.tsx`). On login, every module's local data is synced from Firestore; on reconnect, pending local changes are retried.
- **Modules**: each lives under `src/modules/<name>/` as a fully self-contained slice — its own Dexie database, CRUD layer, Firestore sync + retry queue, pages, and components. A module can be deleted by removing its folder and its one route/nav entry.
- **Sync pattern**: every write sets a `pendingSync` flag immediately and pushes to Firestore in the background; failures stay queued (`pendingDeletes` table for removals) and are retried on login or on the browser's `online` event. A `SyncStatusBanner` surfaces unsynced counts with a manual retry action.
- **Deployment**: auto-deploys on push to `main`.

## Modules

### Hisaab — Finance & Assets
Tracks money: books (accounts/ledgers), transactions, categories, and receipt photos. Includes CSV import, fuzzy search across transactions, and balance summaries per book.

### Amaanat — Everything entrusted to your care
A personal ownership/asset vault. Tracks owned items (electronics, valuables, vehicles, property, records) with purchase details, multiple photos, invoice/receipt attachments (PDF or image), warranty provider and expiry. Surfaces a "needs attention" view for items with expiring or expired warranties, supports category filtering, a category/timeline view toggle, and fuzzy search by name, merchant, or serial number.

### Planned / not yet built
- **Nazara** — memories (photos/moments).
- **Journey** — trip planning and travel history.

## Key conventions
- **`Result<T>`** (`{ ok: true; data: T } | { ok: false; error: string }`) is the return type for all CRUD functions across modules.
- **Photos vs. documents**: photo entities are compressed (canvas resize + thumbnail) and image-only; documents (invoices, receipts, manuals) store the raw blob uncompressed to support PDFs.
- **Theming**: Hisaab uses its own dark-leaning CSS-variable theme scoped to `.hisaab-root`; newer modules (Amaanat) reuse the shared cream/brown Safar shell tokens directly rather than introducing a new theme.
