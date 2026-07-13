# LMM — Revised Infrastructure

> **Updated:** Supabase replaces D1 + Workers auth. Cloudinary evaluated vs. R2.

---

## Stack Decision

| Layer | Choice | Why |
|-------|--------|-----|
| **SPA Hosting** | Cloudflare Pages | Free, SE Asia edges, no config |
| **Database + Auth** | **Supabase** | Postgres, phone auth built-in, row-level security, real-time subscriptions, storage buckets. Replaces D1 + hand-rolled Workers auth (A2 + chunks of C1). |
| **API Gateway** | Cloudflare Workers | Routes requests, lightweight ops. Does NOT run long tasks. |
| **GPU + Render Pipeline** | Paperspace P5000 | UE5 rendering, Llama 3 (scene parsing), SDXL (image gen), Python Flask API that manages render jobs |
| **Content Storage + Delivery** | **Cloudflare R2** | Stores rendered comics/books. Serves via CDN. No egress fees. |

---

## What Stays, What Changes

| Before | After | Why |
|--------|-------|-----|
| D1 database | **Supabase Postgres** | Real SQL, migrations, row-level security, built-in API |
| Workers phone auth (A2) | **Supabase Auth** | Built-in phone auth with SMS, magic links, JWT — no code needed |
| Workers API (all logic) | **Workers + Paperspace split** | Workers: lightweight routing. Paperspace Flask API: heavy render pipeline |
| R2 for content | **R2 for content** | Unchanged — no egress fees, CDN included |
| Cloudinary | **Not needed** | R2 already serves images via CDN with no egress. UE5 renders final output — no server-side transformations needed. |

---

## Is Cloudflare Workers Sufficient?

**For the backend API — yes, mostly.** Here's what Workers handles well and what it can't:

### What Workers CAN do (fits the 30s execution limit + 128MB memory)

| Task | Worker's Role |
|------|--------------|
| Route requests to Supabase | ✅ POST /api/content → forward to Supabase REST API |
| Validate JWTs | ✅ Extract Supabase JWT from header, verify, reject if invalid |
| Queue a render | ✅ POST /api/render → send request to Paperspace Flask API, return `{ job_id }` immediately (no waiting) |
| Poll render status | ✅ GET /api/render/:job_id → forward to Paperspace Flask API, return status |
| Update Supabase rows | ✅ Mutate user purchases, content metadata, payment confirmations |
| Serve content metadata | ✅ GET /api/content, /api/library → query Supabase, return JSON |

### What Workers CANNOT do (requires Paperspace's Python API)

| Task | Why Workers fails |
|------|-------------------|
| Run a UE5 render | Requires GPU + UE5 binary |
| Wait for a minutes-long render | 30-second execution limit |
| Run Llama 3 inference | Requires GPU + ~6GB VRAM |
| Process/compress rendered images | Needs Python + Pillow + FFmpeg, too heavy for Workers |

**The split:** Workers is the API gateway + data layer. Paperspace's local Flask API is the compute layer. They talk to each other over HTTP.

---

## The Flow You Described — Corrected

Your flow was:
> Cloudflare (editor) → Paperspace (rendering) → Cloudflare (moves models) → Cloudinary (stores models)

A few corrections:

**1. Cloudinary isn't needed.** UE5 renders the final 2D output (comic pages, book scenes). These are just PNGs. R2 stores them and serves them via CDN with no egress fees. Cloudinary adds image transformations we don't need (UE5 already renders at the correct size/format) and introduces egress costs.

**2. There's no "moving of 3D object models" back to Cloudflare.** The 3D models (base character meshes, environments) stay on the Paperspace GPU — they're used for rendering, not served to end users. Users only ever download the final 2D rendered comic/book.

### Actual flow:

```
                    Cloudflare                    Paperspace GPU              Supabase
                    ─────────                    ──────────────              ────────

Creator logs in ───► Pages (SPA) ──── auth ───────────────────────────────► Auth
                                      │
Creator writes ────► Pages (SPA)      │
story                                  │
                                      ▼
                               Workers API
                               POST /api/render ────► Flask API 
                                                       │
                                                       ├── Llama 3 (parse scene)
                                                       ├── SDXL (generate images)
                                                       ├── UE5 (assemble + render)
                                                       │
                                                       ▼
                                                  Output: PNGs + manifest
                                                       │
                                                       ├──► Upload to R2 ──► CDN
                                                       │
                                                       │                  Supabase
                                                       └──► Insert metadata ───► content table

Creator previews ◄── Pages (SPA) ◄── Workers API ◄── returns R2 URL

User buys book ───► Pages (SPA) ──────────────────────────────────────────► purchases table
                                                                           payment table

User downloads ───► Pages (SPA) ◄── R2 (content) via CDN
```

---

## What This Actually Replaces (from the Build Plan)

Supabase replaces three entire prompts:

| Build Plan Prompt | Replaced By |
|-------------------|-------------|
| **A2** — User auth by phone number | Supabase Auth — no code, built-in phone auth |
| **A3** — Content catalog (partially) | Supabase REST API auto-generates CRUD endpoints from schema |
| **C1** — Admin panel (partially) | Supabase dashboard — built-in table editor, query editor |

Workers still handles the render queue and connects everything, but it's a thin layer — no heavy logic.

---

## Cost Impact

| Item | Before | After | Savings |
|------|--------|-------|---------|
| Database | D1 (free) | Supabase free tier (500MB DB, 50K users) | Same |
| Auth | Built from scratch (dev time) | Supabase Auth built-in | ~2-3 prompts worth of dev time |
| SMS for auth | Twilio integration needed | Supabase includes SMS auth | Dev time |

Supabase free tier covers the prototype entirely. $25/mo Pro when we exceed 50K users.
