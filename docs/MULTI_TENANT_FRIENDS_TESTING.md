# Friends Testing on Their Own Firebase — Brainstorm

Status: **idea stage, not designed or built.** Captures the goal and the direction we landed on so we can pick this back up later.

## Goal

Friends who saw Safar want their own version to actually use. Not trying to productize/sell it yet — treat this as an opportunity to test the app end-to-end with real users on real data, without it costing anything or putting all their data in your Firebase project.

Constraint: you're on Firebase Spark (free) plan and don't want to host everyone's data/usage under your own project (Firestore/Storage/Auth quota all shared if they used your config). Each friend should bring their own free Firebase project instead.

## Direction discussed

**Runtime-configurable Firebase config**, not per-friend builds/deploys:

- Ship one shared build/URL of the app (same as today).
- On first run (no config saved yet), show a one-time "connect your Firebase project" setup screen instead of going straight to the Google sign-in screen.
- Friend pastes their own Firebase project's client config (`apiKey`, `authDomain`, `projectId`, `storageBucket`, `messagingSenderId`, `appId` — all public-safe values, fine to handle client-side, not secrets).
- App initializes the Firebase SDK dynamically from that stored config (persisted to `localStorage`/IndexedDB) instead of the hardcoded `VITE_FIREBASE_*` env vars currently in [src/lib/firebase.ts](../src/lib/firebase.ts).
- From then on the app behaves identically — sign-in, Firestore sync, Storage — just pointed at their project.

Friend-side one-time setup (you'd write a short guide for this):
1. Create a free Firebase project.
2. Enable Google Auth provider.
3. Enable Firestore + Storage.
4. Copy your `firestore.rules` / `storage.rules` into their project (same security model, scoped to their own users).
5. Paste their config into the app's setup screen.

## Tradeoff vs. alternative (separate deploys per friend)

| | Runtime-configurable config | Per-friend deploy (your build, their `.env`) |
|---|---|---|
| Your ongoing effort | None after building the setup screen once | Maintain N separate Hosting deployments forever |
| Friend's one-time effort | ~10 min in Firebase console + paste config | None (you do it for them) |
| Shared URL/build | Yes, one for everyone | No, one per friend |

Runtime-configurable is the better fit given you don't want to maintain N deployments and this is explicitly a testing exercise, not a product to operate long-term.

## Open questions / not yet decided

- Where does the config screen live in the app shell — gate the whole app before the existing Google sign-in screen, or a separate "Settings → Switch Firebase project" path for power users?
- Validation: how do we confirm the pasted config is well-formed / actually reachable before committing to it (vs. silently breaking sign-in)?
- Do we also need to template-ize `firestore.rules`/`storage.rules` so friends can just copy-paste via Firebase CLI, or is manual console setup acceptable for a handful of friends?
- Should there be a way to reset/clear the stored config (e.g. "Disconnect Firebase project" in Settings) if a friend wants to start over or switch?
- Not in scope per the "just testing" framing: no central backend to manage/track multiple friends' distributions — each friend's instance is fully independent.
