# Memora — Project Plan

A private, invite-only web app where college friend-groups capture, store, and share their memories as photos. Built cheap now, designed to scale.

> Made for **Batch 2024–28**. The code lives in the [project root](../).

---

## 1. What we are building (MVP)

- **Google sign-in only** — fast, secure, no passwords.
- **Invite-only groups** — you join a group via an invite link (each link carries a role).
- **Images only** (no videos) — simpler storage, cleaner memory management.
- **Group feed** — post a photo straight into the group, album optional.
- **Albums / events** — optionally organize photos (e.g. "Goa Trip 2025").
- **Captions, likes, comments** on every memory.
- **Group management** — edit group details, manage members & roles, leave or delete a group.

---

## 2. Roles (per group)

A user's role lives **per group** (you can be Admin in one group, Viewer in another).

| Role       | View | Upload | Comment/Like | Delete any post | Manage members |
|------------|:----:|:------:|:------------:|:---------------:|:--------------:|
| Admin      |  ✅  |  ✅    |     ✅       |       ✅        |      ✅        |
| Moderator  |  ✅  |  ✅    |     ✅       |       ✅        |      ❌        |
| Member     |  ✅  |  ✅    |     ✅       |    own only     |      ❌        |
| Viewer     |  ✅  |  ❌    |     ✅       |       ❌        |      ❌        |

---

## 3. Tech stack (cheap now, scales later)

| Need            | Tool                        | Why |
|-----------------|-----------------------------|-----|
| Frontend        | **Next.js 16 (React 19)**   | Popular, huge community, free hosting |
| Language        | **TypeScript**              | Safer code, fewer runtime bugs |
| Styling         | **Tailwind CSS v4**         | Fast, consistent, themeable styling |
| Auth            | **Supabase Auth (Google)**  | Google login built-in, free |
| Database        | **Supabase Postgres**       | Real SQL DB, scales, free tier |
| Media storage   | **Supabase Storage**        | Free now, S3-compatible → migrate to Cloudflare R2 later |
| Access control  | **Postgres Row-Level Security** | "Only group members see group memories" enforced in the DB |
| Hosting         | **Vercel**                  | Free, deploys on every git push |

One platform, one login, free to start, clear upgrade path.

---

## 4. Data model

```
User ── belongs to many ──► Groups (via Membership, which holds the ROLE)
Group ── has many ──► Albums (optional, e.g. "Goa Trip 2025")
Group ── has many ──► Memories (image + caption)
Memory ── optionally in ──► Album
Memory ── has many ──► Comments
Memory ── has many ──► Likes
Group ── has many ──► Invites (links that let new people join, each with a role)
```

**Tables (as built):**
- `profiles` — id, name, avatar_url, bio
- `groups` — id, name, description, cover_color, created_by
- `memberships` — group_id, user_id, role, joined_at
- `albums` — id, group_id, title, created_by
- `memories` — id, group_id, album_id (nullable), uploader_id, image_url, caption, created_at
- `comments` — id, memory_id, user_id, body, created_at
- `likes` — memory_id, user_id  (one like per user per memory)
- `invites` — id, group_id, token, role, expires_at, created_by
- `feedback` — id, name, email, rating, message, user_id (landing-page feedback)

---

## 5. Build order & status (each phase is shippable)

| Phase | What | Status |
|-------|------|--------|
| 1 | Foundation: Google login → profile → create group → invite link | ✅ Done |
| 2 | Core memories: upload image + caption → group feed gallery | ✅ Done |
| 3 | Organize: albums / events | ✅ Done |
| 4 | Social: likes & comments | ✅ Done |
| 5 | Management: edit group, members & roles, leave/delete group, profile | ✅ Done |
| 6 | Landing page + feedback form | ✅ Done |
| 7 | Public share links (per-memory / per-album) | ⬜ Not yet |
| 8 | Deploy online (GitHub + Vercel) | ⬜ Not yet |

**Extras shipped beyond the original MVP plan:**
- Dark / light **theme toggle**.
- **Search** bar that filters the current feed.
- **Notifications** bell (UI in place; wiring to real activity pending).
- Group **cover color** + auto banner from the latest memory.
- Invite links that **carry a role**.
- Polished, animated, mobile-friendly UI.

---

## 6. Accounts you'll need to create (all free)

1. **Supabase** account → new project (gives DB + auth + storage). ✅ in use
2. **Google Cloud** project → OAuth credentials (for Google sign-in). ✅ in use
3. **GitHub** account → store the code. ✅ done
4. **Vercel** account → connect your GitHub repo for hosting. ⬜ when we deploy

---

## 7. Constraints / decisions locked in

- Images only (no video).
- Free storage tier first; per-image size kept reasonable to protect the quota.
- Invite-only privacy model.
- Albums are optional; feed is the default.
- Roles are per-group.

---

## 8. Open / future ideas (not in MVP)

- Public share links (Phase 7).
- Real notifications (wire up the bell).
- Mobile app (after web is proven).
- Face/AI tagging, deeper search.
- Migrate storage to Cloudflare R2 when you scale.
