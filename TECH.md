# Safar — Technical Specification

**Version:** 0.3 (draft)
**Date:** June 2026

> Safar (سفر) — "journey". Life as a continuous journey; Nazara, Hisaab, Things, and (later) Journey are its chapters.

---

## 0. Context — Existing Prototypes & Current Scope

Two standalone apps already exist under `sain/` and are reference material for Safar:

| | Hisaab | Nazara |
|---|---|---|
| Framework | Vite + React | Next.js 15 (App Router) |
| Database | Dexie (IndexedDB) + Firestore sync | Firestore only (`persistentLocalCache`) |
| Styling | Tailwind | Inline styles / CSS modules, no Tailwind |
| Status | Production-ish, in active use | Design prototype with mock data |

**Decisions made:**
- **App name: Safar**, not Bayt. Home screen, app shell, manifest, Firebase project name all use Safar.
- **Build framework: Vite**, not Next.js. Hisaab's offline-first Dexie sync engine is the harder, already-proven piece — not worth redoing. Nazara is UI/design only at this stage (mock data, no Dexie layer), so porting its components/styles into Vite/Tailwind is the cheaper direction.
- **Design language: Nazara's**, applied globally across Safar, not just its own module. Cream/brown warm palette, Playfair serif headlines + Inter body, soft-bordered cards, gold accents — see the home screen mock in `designs/home-screen.png` (to be added).
- **Firebase project: new, shared.** Neither existing project is reused as-is — see §5.
- **Current build scope: Hisaab only.** Nazara, Things, and Journey are shown on the home screen as module cards (per the design) but are placeholders/not-yet-built. Things vs. Documents split, and whether Journey ships at all, are deferred — don't build either yet.

---

## 1. Guiding Principle

Local-first, instant, offline-capable. Same philosophy as Hisaab: no spinners, no network dependency for core flows, sync is a background concern not a blocker.

---

## 2. Module Lineup (current thinking — see §0 caveats)

| Module | Purpose | Status |
|---|---|---|
| **Hisaab** | Finance & assets (cash book, net worth) | **Active build target** |
| **Nazara** | Memories (photos, timeline, anniversaries) | Design reference only, not built |
| **Things** | Inventory & warranties (possibly absorbs Documents) | Placeholder card, not built |
| **Journey** | Trips/experiences | Placeholder card, not built — skipped for now |
| Documents | Passport/ID/insurance expiry tracking | Undecided — folds into Things, or stays separate. Decide before building either. |

Home screen ships all four module cards (Nazara, Hisaab, Things, Journey) per the design, even though only Hisaab is functional — the other three can be disabled/"coming soon" tap states until built.

---

## 3. Architecture

```
┌──────────────────────────────────────────────────────┐
│                      Client (PWA)                     │
│   Vite + React 18 + TypeScript                        │
│   ├── React Router (module routing)                   │
│   ├── Zustand (per-module UI state)                    │
│   ├── Dexie.js (IndexedDB — per-module tables)          │
│   └── Tailwind + Framer Motion                          │
├──────────────────────────────────────────────────────┤
│                  Shared Core (packages)                │
│   ├── ui/        shared components (buttons, sheets,   │
│   │               inputs, photo picker, date picker)    │
│   ├── theme/      Nazara-derived design tokens           │
│   ├── db/         Dexie schema base, sync engine         │
│   ├── auth/       Firebase auth wrapper, user context    │
│   ├── storage/    photo compression + Firebase Storage   │
│   └── search/     Fuse.js cross-module search index      │
├──────────────────────────────────────────────────────┤
│                 Firebase (shared project)               │
│   ├── Auth          single sign-in across all modules    │
│   ├── Firestore     one collection set per module,        │
│   │                 scoped under /users/{uid}/{module}    │
│   ├── Storage       /users/{uid}/{module}/{file}           │
│   └── Hosting       single static SPA, CDN, free SSL        │
└──────────────────────────────────────────────────────┘
```

**Single app, not micro-frontends.** Modules are route-level code (`/nazara`, `/hisaab`, `/things`, `/journey`), each with its own Dexie tables and Firestore subcollection, but one build, one deploy, one auth session. This keeps the door open to peel a module off later without a rewrite — but only Hisaab is wired up for real right now.

---

## 4. Repo Structure

```
safar/
├── src/
│   ├── app/                # routing, home screen, global search, shell/nav
│   ├── modules/
│   │   └── hisaab/         # ported from existing Hisaab repo — the only active module
│   ├── shared/
│   │   ├── components/     # ported from Hisaab/src/components, restyled to Nazara's design system
│   │   ├── theme/          # ported from Nazara: colors, fonts (Playfair/Inter), card/badge styles
│   │   ├── db/             # Dexie base + per-module schema registration
│   │   ├── sync/           # ported from Hisaab/src/sync
│   │   ├── lib/
│   │   └── types/
│   ├── store/               # global stores (auth, theme, nav)
│   └── main.tsx
├── designs/                  # home screen + future module mocks
├── firestore.rules
├── firebase.json
└── vite.config.ts
```

`modules/nazara`, `modules/things`, `modules/journey` get added only when each is actually scoped to build — not stubbed in advance.

---

## 5. Data Model

Firestore path convention — everything scoped under the user, modules are siblings:

```
/users/{uid}
  /hisaab_entries/{entryId}
  /hisaab_books/{bookId}
```

Only Hisaab's collections exist for now. Future modules add their own siblings (`nazara_memories`, `things_items`, etc.) following the same pattern when they're built — no need to pre-design schemas for modules that aren't scoped yet.

Dexie mirrors this 1:1 locally — one IndexedDB database (`safar`), one table per collection above, keyed the same way (`entryId`, etc.) so Hisaab's existing sync engine pattern (local write → queue → Firestore push, Firestore listener → local upsert) carries over directly.

Shared base record shape (for when global search/dashboard widgets matter — i.e. once a second module exists):

```ts
interface SafarRecord {
  id: string;
  module: string;      // 'hisaab' for now; open string so future modules don't require a union update here
  title: string;
  date: string;         // ISO, the record's "primary" date
  tags?: string[];
  notes?: string;
  photoIds?: string[];
  updatedAt: number;
  deletedAt?: number;   // soft delete, same pattern as Hisaab
}
```

---

## 6. Auth & Security

- **New, shared Firebase project** — not Hisaab's, not Nazara's. Both existing projects have rules/data shaped around a single module's schema; a clean project avoids retrofitting either one. Hisaab's existing data gets exported/imported into the new project as part of the port.
- Firebase Auth, Google Sign-In (matches Hisaab's current flow) — single account, ready for more modules later.
- Firestore rules: all reads/writes scoped to `request.auth.uid == resource.data.ownerId` under `/users/{uid}/**`. No cross-user reads, no public collections.
- No family sharing in v1 — rules are single-owner only, written so a `sharedWith: uid[]` field can be added later without restructuring paths.
- Biometric/PIN app-lock is a client-side gate (WebAuthn or a PIN stored in IndexedDB, not a Firebase feature) — local-only, doesn't block Firestore access if bypassed; treat as a UX deterrent, not a real security boundary, until a v2 server-side check exists.

---

## 7. Hisaab Porting Plan

| Hisaab path | Becomes |
|---|---|
| `src/db/` | `src/shared/db/` (generalized) + `src/modules/hisaab/db/` (entry/book schema) |
| `src/sync/` | `src/shared/sync/` (made module-agnostic, ready for future modules even though only Hisaab uses it now) |
| `src/features/*` | `src/modules/hisaab/features/*` |
| `src/components/*` (generic) | `src/shared/components/*`, restyled to Nazara's design tokens |
| `src/store/*` (cashbook-specific) | `src/modules/hisaab/store/*` |

Porting order: copy Hisaab's `db`, `sync`, and generic `components` first as the shared core skeleton (restyle to the new theme as you go), then move Hisaab's own features into `modules/hisaab` against that skeleton.

---

## 8. Build Order (current scope only)

1. **Design system** — extract Nazara's theme (`globals.css` tokens, Playfair/Inter, card/badge styles) into `shared/theme/`, rebuilt for Tailwind.
2. **Home screen** — build the actual screen from the provided design: module grid (4 cards, only Hisaab tappable), Today's Attention, Life Snapshot, Recent Activity, FAB. Other three cards route to a "coming soon" state.
3. **Shared core** — Dexie base, sync engine, auth, shell/nav — styled with the design system from step 1.
4. **Hisaab module** — ported in (logic from the Vite app, restyled to match), wired into the home screen's Life Snapshot / Recent Activity / Today's Attention (spend this month, net worth).
5. *(Deferred, not scheduled)* Nazara, Things, Documents, Journey — built only once each is individually scoped.

---

## 9. Open Questions

- **Documents vs. Things**: fold Documents into Things, or keep separate? Decide before building either — affects the data model and the home screen's "Today's Attention" source (it currently shows a passport-expiry item with no module behind it yet).
- **Journey scope**: skipped for now — no spec exists for what it tracks (itineraries? expenses-in-trip? both?). Revisit when prioritized.
- Notifications (expiry reminders): web push via FCM, or local-only via `Notification` API + periodic background sync? Only relevant once Things/Documents exist.
- Biometric unlock: WebAuthn vs. simple PIN — not blocking for Hisaab-only scope, but worth deciding before app-lock is built.
- Photo storage limits: relevant once Nazara is scoped (likely many photos per record/album) — not a Hisaab concern today.
