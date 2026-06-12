<div align="center">

# 📸 Memora

**A private, invite-only space where college friend-groups keep their memories together.**

Upload photos, organize them into albums, like and comment — all inside private groups that only invited members can see.

### 🔗 [**Live Demo → memora-three-nu.vercel.app**](https://memora-three-nu.vercel.app/)

Made with ❤️ for **Batch 2024–28**

![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-38BDF8?logo=tailwindcss&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-Postgres%20%7C%20Auth%20%7C%20Storage-3FCF8E?logo=supabase&logoColor=white)
![Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?logo=vercel)

</div>

---

## ✨ What is Memora?

Group chats lose your photos. Shared drives are messy. **Memora** is a small, private
home for a friend-group's memories — sign in with Google, join your group through an
invite link, and everyone's photos live in one clean, scrollable feed.

Try it live: **[memora-three-nu.vercel.app](https://memora-three-nu.vercel.app/)** 👈

---

## 🎯 Features

- 🔐 **Google sign-in only** — fast, secure, no passwords to remember.
- 👥 **Invite-only groups** — join through an invite link; each link carries a role.
- 🖼️ **Photo feed** — post a memory straight into the group, newest first.
- 📁 **Albums / events** — optionally group photos (e.g. *"Goa Trip 2025"*).
- ❤️ **Likes & 💬 comments** on every memory.
- 🛠️ **Group management** — edit the group, manage members & roles, leave or delete a group.
- 🔍 **Search** the feed, 🌓 **dark / light theme**, and a polished, animated, mobile-friendly UI.

### Roles (set per group)

| Role | View | Upload | Like / Comment | Delete any post | Manage members |
|------|:----:|:------:|:--------------:|:---------------:|:--------------:|
| **Admin** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Moderator** | ✅ | ✅ | ✅ | ✅ | ❌ |
| **Member** | ✅ | ✅ | ✅ | own only | ❌ |
| **Viewer** | ✅ | ❌ | ✅ | ❌ | ❌ |

You can be an Admin in one group and a Viewer in another — roles live per group.

---

## 🧱 Tech stack

| Area | Tool |
|------|------|
| Framework | **Next.js 16** (App Router) + **React 19** |
| Language | **TypeScript** |
| Styling | **Tailwind CSS v4** |
| Auth | **Supabase Auth** (Google) |
| Database | **Supabase Postgres** + Row-Level Security |
| Media storage | **Supabase Storage** |
| Hosting | **Vercel** |

> Privacy is enforced in the database itself: Row-Level Security means only a group's
> members can ever read that group's memories — not just hidden in the UI.

---

## 🚀 Run it locally

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

Copy the example env file and fill in your Supabase project values
(Supabase dashboard → Project Settings → Data API / API Keys):

```bash
cp .env.local.example .env.local
```

```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR-PROJECT-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR-PUBLIC-ANON-KEY
```

### 3. Set up the database

In the Supabase dashboard → **SQL Editor**, run the migration files in
[`supabase/`](supabase/) **in order** (each is safe to re-run):

| File | Adds |
|------|------|
| `01_schema.sql`     | profiles, groups, memberships, invites + helper functions |
| `02_policies.sql`   | Row-Level Security policies |
| `03_functions.sql`  | sanctioned create-group / join-group write functions |
| `04_memories.sql`   | memories table + Storage bucket & rules |
| `05_management.sql` | group editing, member management, profile |
| `06_albums.sql`     | albums |
| `07_social.sql`     | likes & comments |
| `08_feedback.sql`   | landing-page feedback |

You'll also need a **Google OAuth credential** wired into Supabase Auth
(Supabase dashboard → Authentication → Providers → Google).

### 4. Start the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## 📜 Scripts

| Command | Does |
|---------|------|
| `npm run dev` | Start the dev server |
| `npm run build` | Production build |
| `npm run start` | Run the production build |
| `npm run lint` | Lint with ESLint |

---

## 🗂️ Project layout

```
src/
  app/                  Next.js App Router routes
    page.tsx            Landing page (+ feedback form)
    login/              "Continue with Google"
    auth/callback/      OAuth callback handler
    join/[token]/       Join a group via invite link
    (app)/              Authenticated app shell
      groups/           My groups + per-group feed, memory view, settings
      profile/          Edit profile
  components/           UI (feed, upload, comments, members, theme, search…)
  lib/                  Data access + Supabase clients
    supabase/           Browser / server / middleware clients
supabase/               SQL migrations (run in order)
```

---

## ☁️ Deploy

Memora is deployed on **Vercel** at
[memora-three-nu.vercel.app](https://memora-three-nu.vercel.app/).

To deploy your own copy: push to GitHub, import the repo into Vercel, and add the two
`NEXT_PUBLIC_SUPABASE_*` environment variables in the project settings. Vercel
redeploys on every push.

---

<div align="center">

📋 Roadmap → [plan.md](../plan.md) · 📐 Technical spec → [specs.md](../specs.md)

</div>
