# Memora — Technical Specs

A private, invite-only web app where college friend-groups capture, store, and share memories as photos. Built cheap now, designed to scale.

> Made for **Batch 2024–28**. The code lives in the [project root](../).

---

## 1. Product overview

- **Who:** college friends / batch groups.
- **What:** upload, store, browse, and share photo memories inside private groups.
- **Privacy:** invite-only groups.
- **Media:** images only (no video).

---

## 2. Stack

### Frontend
| Piece | Tool |
|-------|------|
| Framework | Next.js 16 (App Router) |
| UI library | React 19 |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| Backend client | Supabase JS client (`@supabase/supabase-js`, `@supabase/ssr`) |

### Backend (Supabase — managed, no separate server)
| Piece | Tool |
|-------|------|
| Database | Postgres |
| Auth | Supabase Auth (Google sign-in) |
| File storage | Supabase Storage |
| Security | Row-Level Security (RLS) + `SECURITY DEFINER` functions |
| Server logic | Next.js Route Handlers + server actions |

### Hosting
| Piece | Tool |
|-------|------|
| App hosting | Vercel (free) |
| Code | GitHub |

---

## 3. Who does what

- **I (engineer) handle:** all code, Postgres tables, security rules, Supabase wiring.
- **You (owner) handle (when reminded):** creating the Supabase account, Google sign-in credentials, GitHub + Vercel accounts, and pasting secret keys.
- Principle: **you own the keys, I build the house.**

---

## 4. Roles (per group)

| Role       | View | Upload | Comment/Like | Delete any post | Manage members |
|------------|:----:|:------:|:------------:|:---------------:|:--------------:|
| Admin      |  ✅  |  ✅    |     ✅       |       ✅        |      ✅        |
| Moderator  |  ✅  |  ✅    |     ✅       |       ✅        |      ❌        |
| Member     |  ✅  |  ✅    |     ✅       |    own only     |      ❌        |
| Viewer     |  ✅  |  ❌    |     ✅       |       ❌        |      ❌        |

Role is stored **per group** (you can be Admin in one group, Viewer in another).

---

## 5. Data model

```
User ── belongs to many ──► Groups (via Membership, which holds the ROLE)
Group ── has many ──► Albums (optional)
Group ── has many ──► Memories (image + caption)
Memory ── optionally in ──► Album
Memory ── has many ──► Comments
Memory ── has many ──► Likes
Group ── has many ──► Invites (each carries a role)
```

### Tables (as built — see [`supabase/`](../supabase/))

| Table | Key columns |
|-------|-------------|
| `profiles` | id, name, avatar_url, bio, created_at |
| `groups` | id, name, description, cover_color, created_by, created_at |
| `memberships` | group_id, user_id, role, joined_at |
| `albums` | id, group_id, title, created_by, created_at |
| `memories` | id, group_id, album_id (nullable), uploader_id, image_url, caption, created_at |
| `comments` | id, memory_id, user_id, body, created_at |
| `likes` | memory_id, user_id (one per user per memory) |
| `invites` | id, group_id, token, role, expires_at, created_by, created_at |
| `feedback` | id, name, email, rating, message, user_id, created_at |

### SQL migrations (run in order, each safe to re-run)

| File | Adds |
|------|------|
| `01_schema.sql`     | profiles, groups, memberships, invites + helper functions + new-user trigger |
| `02_policies.sql`   | RLS policies |
| `03_functions.sql`  | sanctioned create-group / join-group write functions |
| `04_memories.sql`   | memories table + Storage bucket & rules |
| `05_management.sql` | group editing, member management, profile |
| `06_albums.sql`     | albums |
| `07_social.sql`     | likes & comments |
| `08_feedback.sql`   | landing-page feedback |

---

## 6. Screens / routes

| Screen | Route |
|--------|-------|
| Landing (+ feedback form) | `/` |
| Login — "Continue with Google" | `/login` |
| OAuth callback | `/auth/callback` |
| Join a group via invite | `/join/[token]` |
| My Groups (+ create group) | `/groups` |
| Group feed (grid, newest first) | `/groups/[id]` |
| Memory view (photo, caption, likes, comments) | `/groups/[id]/memory/[memoryId]` |
| Group settings (edit, members & roles, danger zone) | `/groups/[id]/settings` |
| Profile (name, avatar, bio) | `/profile` |

Upload and album creation happen via modals on the feed.
The app shell adds a search bar, theme toggle, notifications bell, and user menu.

---

## 7. Permissions summary (enforced by RLS)

- Only **group members** can read that group's memories/albums/comments/likes.
- Only **Member+ (not Viewer)** can upload memories.
- Only **Admin** can manage members and create invite links.
- A user can like a memory **once**.
- A user can delete/edit **their own** content; Mods/Admins can delete any.
- Membership roles can't be forged — joining/creating go through `SECURITY DEFINER` functions.
- Anyone (even logged-out) can submit landing-page feedback; submissions are read in the dashboard.

---

## 8. Build status (each phase is shippable)

| Phase | What | Account needed | Status |
|-------|------|----------------|--------|
| 1 | Project scaffold + UI shell | none | ✅ Done |
| 2 | Google login + profiles | Supabase + Google | ✅ Done |
| 3 | Create group + invite link + join | Supabase | ✅ Done |
| 4 | Upload image + caption + group feed | Supabase Storage | ✅ Done |
| 5 | Albums | Supabase | ✅ Done |
| 6 | Likes & comments | Supabase | ✅ Done |
| — | Group management + profile editing | Supabase | ✅ Done |
| — | Landing page + feedback | Supabase | ✅ Done |
| 7 | Public share links | Supabase | ⬜ Not yet |
| 8 | Deploy online | GitHub + Vercel | ⬜ Not yet |

**Extras shipped beyond the original spec:** dark/light theme toggle, feed search,
notifications bell (UI), group cover color + auto banner, role-carrying invites,
animated mobile-friendly UI.

---

## 9. Constraints / decisions locked in

- Images only (no video).
- Invite-only privacy.
- Albums optional; feed is default.
- Free tiers first; reasonable per-image size limit to protect quota.
- Per-group roles.

---

## 10. Reminders for the owner (you)

- ✅ **Supabase + Google sign-in** — set up and in use.
- ✅ **GitHub** — code is committed.
- ⏰ **Before deploy (Phase 8):** create a **Vercel** account, import the repo, and
  paste the two `NEXT_PUBLIC_SUPABASE_*` env vars. I'll guide every click.

---

## 11. Future (not in MVP)

- Public share links (Phase 7).
- Real notifications (wire up the bell).
- Mobile app.
- Deeper search / AI photo tagging.
- Migrate storage to Cloudflare R2 at scale.
