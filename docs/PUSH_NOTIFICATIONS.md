# Push Notifications — Cross-Module Brainstorm

Status: **not yet built.** Nazara's standalone push notifications (Vercel Cron + Next API routes) were dropped during the migration into Safar as a known v1 gap. This doc captures the use cases and architecture direction for when we pick this up.

## Use cases by module

**Nazara (memories)**
- "On this day" yearly anniversary reminders (birthdays, first-day-of-school, etc.) — was Nazara's original core notification use case
- Upcoming anniversary in N days (e.g. "Mariyam's birthday in 3 days")
- Recurring memory reminders (`type: 'recurring'` records)

**Sanad (documents)**
- Document expiring soon (passport, Emirates ID, visa, license) — X days before expiry
- Document expired (overdue nudge)

**Amaanat (assets/warranties)**
- Warranty expiring soon
- Insurance/AMC renewal due
- Scheduled maintenance reminder for an asset

**Hisaab (finance)**
- Recurring transaction reminder (rent due, EMI due) — if/when recurring transactions exist
- Budget threshold alert (e.g. "80% of monthly budget spent")
- Low balance / negative balance alert on a book

**Cross-module / Safar shell**
- Daily/weekly digest ("3 things need your attention" — pulls from all modules' "attention" items, similar to the existing `attentionItems` mock on Home)
- Sync conflict or failed-sync-for-too-long alert (multi-module already has `pendingSync` tracking)

## Architecture direction

Safar is a PWA, not separate per-module native apps. We should build **one shared push subsystem**, not let each module reinvent it:

- Single FCM token per device, single service worker, single notification-permission prompt (requested once at the Safar shell level, not per-module)
- Each module just registers "what to notify about and when" against that shared layer, rather than repeating Nazara's old per-app Vercel Cron + Next API routes pattern
- Needs a scheduling/cron mechanism on the backend (Safar has no Vercel Cron equivalent yet — this is the main open question: Cloud Functions scheduled trigger? Firebase Cloud Messaging + Cloud Scheduler?)

## Open questions (decide before building)

- Which of the above use cases are actually wanted for v1 vs. later?
- Where does the "what to notify about and when" registration live per module — a shared `notifications` Firestore collection? A convention each module's sync layer writes to?
- Notification permission UX — prompt at first sign-in, or contextually per-module when a user first hits a notification-worthy feature?
