# LMM — Build Plan (Prompt-by-Prompt)

> **Build order:** Digital Library first → Creator Studio second.
> **Architecture:** Cloudflare (hosting) + Paperspace GPU (UE5) + OpenAI (LLM) + Replicate (image gen).
> See `cloud-architecture.md` for infrastructure details.
> Each prompt is self-contained — copy one at a time into a chat.
> **Status:** `⬜` not started, `🟡` in progress, `✅` done.

---

## PART A: Digital Library

### A1 — Scaffold the project
⬜

```
We're building LMM — a digital media library for comics and interactive children's books, primarily for Laos. Hosted on Cloudflare.

Start by scaffolding the entire project:

Tech stack:
- Cloudflare Pages for the web app (React SPA)
- Cloudflare Workers for the backend API
- Cloudflare R2 for content storage (images, comic scenes, books)
- Cloudflare D1 for the database (SQLite at the edge)

Deliverables:
- A "Hello World" React app deployed to Cloudflare Pages
- A Workers API that returns a JSON health check at GET /api/health
- A D1 database with a placeholder users table (id, phone_number, balance_credits, created_at)
- An R2 bucket named "lmm-content" created and accessible

Goal: all four Cloudflare services talking to each other. No UI yet — just infrastructure.
```

### A2 — User auth by phone number
⬜

```
Build phone number authentication for the LMM library.

Users in Laos register and log in with their phone number — no email, no password. Flow:
1. User enters phone number on login page
2. System generates a 6-digit code and logs it (SMS integration via Twilio can come later)
3. User enters code → authenticated
4. JWT stored in localStorage, sent with every API call

Build:
- /login — phone number input form
- /verify — code input form  
- GET /api/auth/request-code — generates + stores code in D1
- POST /api/auth/verify-code — checks code, returns JWT
- /library — redirect after login (placeholder for now)

D1: auth_codes table (phone_number, code, expires_at, attempts)
Edge cases: new vs returning user, code expiration (5 min), max 3 attempts.
```

### A3 — Content catalog (browse + search)
⬜

```
Build the content catalog for the digital library.

Users browse available comics and books, search, and filter by language (Lao, English) and reading level.

D1: content table (id, title, creator_name, language, reading_level, cover_image_url, price_kip, description, created_at)
Seed with 5 placeholder entries (hardcoded in a migration script).

Build:
- /library — grid of cover images with title, price, language badge
- /search — search bar with live filter results  
- /book/:id — detail page: cover, description, creator, price, "Buy" button

All content metadata via Workers API. Cover images are placeholder PNGs in R2 — we'll replace later.

Mobile-first — our users are on $50 Android phones.
```

### A4 — QR payment + WhatsApp confirmation flow
⬜

```
Build the purchase flow. Laos has no online payments — users pay by scanning a QR code, sending payment confirmation to WhatsApp, and we manually verify.

Flow:
1. User taps "Buy" on book detail → sees QR code, price in kip, WhatsApp number, instructions in Lao
2. User pays via bank app (scans QR), sends WhatsApp message with their phone number
3. Admin panel: admin sees pending payments, verifies WhatsApp message, clicks "Confirm"
4. System credits user balance + adds book to their purchased library

Build:
- /purchase/:id — shows QR + instructions + "I've paid" button (registers attempt)
- GET /api/admin/pending-payments — list pending
- POST /api/admin/confirm-payment/:id — confirms + credits user

D1: payments table (id, user_id, content_id, amount_kips, status, created_at)
     purchases table (user_id, content_id, purchased_at)

QR image is a static file in R2. WhatsApp number and instructions are configurable.
```

### A5 — Download system (chunked, offline-capable)
⬜

```
Build the content download system. Media must work on unstable 2G connections in rural Laos.

Requirements:
- Full 20-page comic under 5MB total
- Content split into per-scene chunks (~200-300KB each)
- User downloads scene 1, starts reading while scene 2 downloads in background
- Connection drops → resume, no restart from beginning
- Downloaded content stored in IndexedDB, available offline

Build:
- GET /api/content/:id/manifest — returns list of scene chunks with URLs and sizes
- R2 folder per title: /content/{id}/scene_01.webp, scene_02.webp, ..., manifest.json
- /read/:id — reader page:
  - Fetches manifest, downloads scenes one at a time with progress bar
  - Stores each scene in IndexedDB after download
  - Swipe/scroll between scenes, no internet needed after download
- PWA setup: manifest.json + Service Worker + "Add to Home Screen"

Test with 3-5 placeholder scenes in R2.
```

### A6 — User library (purchased content)
⬜

```
Build the "My Library" section. Purchased content appears here. Users see what they own, what's downloaded, and read offline.

Build:
- /my-library — grid of purchased titles
  - Each card: cover, title, download status (cloud = not downloaded, checkmark = downloaded)
  - Tap opens reader, long-press offers "Remove download"
- GET /api/my-library — returns user's purchases (joined with content table)
- Download status from IndexedDB (checked on page load)

Library works offline — shows cached data from last online session.
```

---

## PART B: Creator Studio

### B1 — Set up Paperspace GPU + UE5
⬜

```
Provision the cloud GPU where all UE5 development and rendering will happen.

1. Create Paperspace account (paperspace.com)
2. Provision a P5000 GPU machine: 16GB VRAM, 30GB RAM, 8 vCPU, $0.78/hr on-demand
3. Install Unreal Engine 5 on it
4. Install Python 3 + Flask (for the REST API that will control UE5)
5. Set up remote desktop access (Paperspace provides this)
6. Verify UE5 launches and runs headless
7. Build a health check script: launch UE5 in headless mode, render a blank scene, exit
8. Configure auto-shutdown after 30 min of inactivity (save money)

Goal: you can remote into the GPU, run UE5, and trigger renders programmatically.
```

### B2 — UE5 Blueprint orchestrator (first render test)
⬜

```
Build the UE5 pipeline on the Paperspace GPU. This turns a scene description into a rendered image.

Inside UE5:
1. **Base mesh library** — ~20 simple 3D models:
   - 2 characters (boy, girl — generic shapes)
   - 5 background elements (tree, house, rice field, market stall, temple silhouette)
   - Sky/lighting rig (DirectionalLight, SkyLight, ExponentialHeightFog)
   - CineCameraActor pointing at the stage

2. **Blueprint Orchestrator** (Level Blueprint):
   - Reads a JSON file from disk
   - Spawns character + background meshes at specified positions
   - Configures lighting from JSON parameters
   - Positions camera
   - Renders via Movie Render Queue
   - Saves output PNG to disk

3. **Test with a hardcoded JSON scene** — verify a rendered image appears.

Goal: UE5 on the cloud GPU reads a scene description → produces a rendered output, no human interaction.
```

### B3 — Self-host Llama 3 on Paperspace (narration → scene JSON)
⬜

```
Set up a self-hosted LLM on the Paperspace GPU to convert story narration into structured scene data. No external API costs — runs on the same GPU during idle time between UE5 renders.

Install and configure:
1. Install Ollama: curl -fsSL https://ollama.com/install.sh | sh
2. Pull Llama 3.1 8B: ollama pull llama3.1:8b
   - This is a quantized model that runs in ~6GB VRAM — fits alongside UE5 on the P5000 (16GB)
3. Start the Ollama API server: ollama serve
   - This exposes a local REST API at port 11434
4. Test it: curl http://localhost:11434/api/chat with a simple prompt

Build the system prompt — this is the most important part. The prompt tells the model:
- Break narration into logical panels/scenes
- For each panel: characters present, positions on a defined stage grid, expressions, background elements, lighting mood, camera framing
- Output EXACT JSON matching our UE5 Blueprint format
- Coordinates must be within the defined stage area

Build the Python bridge (runs on the Paperspace machine):
- A simple Flask endpoint: POST /api/parse-narration
- Accepts: { "narration": "A boy walks through a rice field at sunset..." }
- Calls Ollama at http://localhost:11434/api/chat with narration + system prompt
- Returns the parsed scene JSON

Test with a sample narration → verify it returns valid JSON.
```

### B4 — Self-host Stable Diffusion on Paperspace (image generation)
⬜

```
Set up AI image generation on the Paperspace GPU. Runs on the same GPU during idle time between UE5 renders. Zero external API costs.

Install and configure:
1. Install ComfyUI (popular SD interface): git clone https://github.com/comfyanonymous/ComfyUI
2. It runs on the same Paperspace GPU — uses VRAM when UE5 isn't rendering
3. Download SDXL model: sd_xl_base_1.0.safetensors
4. Download IP-Adapter model (for character consistency across scenes)
5. Start ComfyUI with the --listen flag so the API is accessible: python main.py --listen
6. Test it: open the ComfyUI web interface and generate a test image from a prompt

Build the ControlNet workflow for character consistency:
- When a creator uploads or approves a character reference image, store it
- Subsequent generations use IP-Adapter + ControlNet to match the reference
- This ensures a character on page 1 looks the same on page 20

The Python bridge (same Flask API from B3) gets another endpoint:
- POST /api/generate-images
- Accepts: { "character_prompts": [...], "background_prompts": [...] }
- Calls ComfyUI's local API to generate each image
- Returns generated image URLs

For the prototype, you can also use UE5's built-in materials (solid colors, procedural textures) instead of AI-generated images. The AI image gen is optional until you need original art.
```

### B5 — Comic post-process shader
⬜

```
Build the custom comic post-process material in UE5 on the Paperspace GPU.

The rendered output should look like a comic book, not photorealistic 3D. Build a post-process material:

1. **Edge detection** — bold black outlines on geometry edges
2. **Cel shading** — quantize lighting into flat color bands (3-4 levels)
3. **Halftone screen** — dot patterns in shadow areas (printed comic look)
4. **Color palette** — restrict to warm, illustrated children's book palette

Build as a UE Material (post-process domain), applied to the Post Process Volume automatically by the Blueprint orchestrator before rendering.

Test: render same scene with and without shader — comic version should look like a graphic novel page.
```

### B6 — Creator web app (Cloudflare)
⬜

```
Build the web-based creator studio. Creators log in, write stories, preview AI output, publish.

Build on Cloudflare Pages:

**1. Studio Dashboard (/studio)**
- List of creator's projects (comics and books in progress)
- "New Comic" and "New Book" buttons
- Each project: title, last edited, status (draft/published)

**2. Comic Editor (/studio/comic/:id)**
- Panel-by-panel editor:
  - Left: text input per panel — creator writes narration in Lao or English
  - Right: preview — rendered panel output
- "Add Panel" button
- "Generate" per panel → sends narration, triggers full pipeline (OpenAI → Replicate → Paperspace GPU), returns preview
- Drag/drop to reorder panels
- Metadata: title, description, language, reading level, price in kip

**3. Book Editor (/studio/book/:id)**
- Same as comic but scene-based (for interactive books)
- Each scene: narration + optional "animation direction" field

**4. Project Settings (/studio/settings/:id)**
- Edit metadata, preview full comic/book, "Publish" button

D1: projects + scenes tables
API: CRUD endpoints for projects/scenes. POST /api/studio/generate → triggers full pipeline.
```

### B7 — Connect Creator Studio to the rendering pipeline
⬜

```
Connect the Cloudflare creator app to the Paperspace GPU rendering pipeline.

When a creator hits "Generate", the full chain fires on the single GPU machine:
Llama 3 (scene parse) → Stable Diffusion (image gen) → UE5 (render) → R2 → preview.

Build the orchestration Worker:

**POST /api/studio/generate**
1. Receives { scene_text, project_id, scene_number }
2. Calls Paperspace GPU REST API: POST /parse-narration (B3 — self-hosted Llama 3) → scene JSON
3. Calls Paperspace GPU REST API: POST /generate-images (B4 — self-hosted SD) → image URLs
4. Calls Paperspace GPU REST API: POST /render — scene JSON + image URLs → Blueprint → MRQ render
5. Returns { job_id, status: "processing" }

**Paperspace GPU REST API** (Python Flask, runs on the GPU machine):
- POST /parse-narration — calls Ollama (Llama 3) → returns scene JSON
- POST /generate-images — calls ComfyUI (Stable Diffusion) → returns image URLs
- POST /render — queues a UE5 render job, waits for idle GPU, runs Blueprint → MRQ, uploads output to R2
- All three share the same GPU. Rendering gets priority; AI inference queues during idle time.
- GET /render/:job_id — returns status + result R2 URL

**Frontend polling:**
- After "Generate" — polls GET /api/studio/generation-status/:job_id every 5 seconds
- Shows loading states: "Reading story..." → "Creating characters..." → "Building scene..." → "Rendering..."
- When complete → displays rendered preview in editor

Expect 2-5 min per scene. GPU queues AI inference between render jobs.
```

---

## PART C: Admin + Infrastructure

### C1 — Admin panel
⬜

```
Simple admin panel for the platform.

Build on Cloudflare Pages: /admin

Pages:
1. **Payment confirmations** — table of pending QR/WhatsApp payments (A4). Confirm/Reject buttons.
2. **Generation queue** — monitor rendering pipeline (B7). Filter by status.
3. **Content management** — list all published content, edit metadata, unpublish.
4. **User management** — list users, view purchase history.

Protect admin routes: check a hardcoded admin password in the JWT.
Functional, not pretty — internal tool.
```

### C2 — PWA + Mobile optimizations
⬜

```
Make the library installable as a PWA and optimized for low-end Android.

1. manifest.json — app name, icons, theme color, display: standalone
2. Service Worker — caches app shell (HTML, CSS, JS) for offline launch
3. "Add to Home Screen" prompt after first login
4. All images WebP with lazy loading
5. Touch targets ≥ 48px, readable on 4.5" screen at 320px
6. API calls: timeout + retry (3x with exponential backoff)
7. Loading states + error messages in Lao
8. Offline banner when Service Worker detects no connection

Test: Chrome DevTools → Moto G4, 2G throttling. App loads under 3 seconds.
```

### C3 — Content packaging + upload pipeline
⬜

```
Build the content packaging pipeline on the Paperspace GPU.

When a creator publishes, the system:
1. Takes rendered image sequence from MRQ output
2. Compresses each to WebP (quality 75, max width 800px)
3. Full 20-panel comic under 5MB total
4. Generates manifest.json with scene files, sizes, order
5. Uploads all to R2: /content/{id}/scene_{n}.webp + manifest.json + cover.webp
6. Inserts metadata into D1 content table

Build as a Python script on the Paperspace GPU machine that:
- Takes a folder path of rendered images
- Takes metadata as arguments
- Runs WebP compression (Pillow)
- Uploads to R2 (Cloudflare SDK)
- Inserts metadata via Workers API

Runs as manual step during prototype — creator publishes → dev runs script → content appears in library.
```

## Status Tracking

```
PART A: Digital Library
⬜ A1 — Scaffold the project (Cloudflare Pages + Workers + R2 + D1)
⬜ A2 — User auth by phone number
⬜ A3 — Content catalog (browse + search)
⬜ A4 — QR payment + WhatsApp confirmation flow
⬜ A5 — Download system (chunked, offline-capable)
⬜ A6 — User library (purchased content)

PART B: Creator Studio
⬜ B1 — Set up Paperspace GPU + UE5
⬜ B2 — UE5 Blueprint orchestrator (first render test)
⬜ B3 — LLM integration (narration → scene JSON)
⬜ B4 — AI image generation (Replicate API)
⬜ B5 — Comic post-process shader
⬜ B6 — Creator web app (Cloudflare)
⬜ B7 — Connect Creator Studio to rendering pipeline

PART C: Admin + Infrastructure
⬜ C1 — Admin panel
⬜ C2 — PWA + Mobile optimizations
⬜ C3 — Content packaging + upload pipeline
```
