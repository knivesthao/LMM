# LMM — Cloud GPU Architecture

> **Constraint:** No local machine that can run UE5. All UE5 + AI work happens on a single Paperspace GPU.
> **Principle:** Self-host everything on the same machine. Zero external API costs.
>
> **One GPU machine handles:** UE5 rendering, Llama 3 (scene parsing), Stable Diffusion (image generation).
> All three share the Paperspace P5000 (16GB VRAM). UE5 rendering gets priority; AI inference runs during idle time.

---

## Architecture Overview

```
CREATOR                     CLOUDFLARE                         PAPERSAPCE GPU (single machine)
─────────                   ──────────                         ─────────────────────────────
                                                               
Creator writes    ──►  Cloudflare Pages (React)                ┌──────────────────────────┐
story in browser         SPA                                   │  UE5 Blueprint Engine     │
                           │                                    │  (headless, MRQ render)   │
                           ▼                                    │                           │
                      Workers API                 ────────►    │  Ollama (Llama 3.1 8B)   │
                      (queue manager)              POST /api    │  (narration → scene JSON)│
                           │                      parse, gen,   │                           │
                           │                      render        │  ComfyUI (Stable Diff.)  │
                           └──── IP to Workers ───► jobs         │  (image generation)      │
                                                               └───────────┬───────────────┘
                                                                           │
                                                                           ▼
                                                                    Rendered images
                                                                    uploaded to R2
```

## What Changed (vs. previous API-based plan)

| Before | After | Savings |
|--------|-------|---------|
| OpenAI API for narration → JSON | **Llama 3.1 8B self-hosted** on Paperspace GPU via Ollama | $1,500/yr |
| Replicate API for image generation | **Stable Diffusion self-hosted** on Paperspace GPU via ComfyUI | $1,500/yr |
| External APIs to manage | Zero API keys, one machine | Time + complexity |

## How the GPU Shares Work

The Paperspace P5000 has 16GB VRAM. Tasks take turns:

| Task | VRAM Needed | When It Runs |
|------|------------|-------------|
| UE5 rendering | ~4-6GB | On demand — a creator hits "Generate" |
| Llama 3 (via Ollama) | ~6GB | During idle time between renders |
| Stable Diffusion (via ComfyUI) | ~8GB | During idle time between renders |

During development, UE5 is open in the editor most of the time. AI tasks queue and wait until the editor is minimized or the render completes.

In production (always-on monthly plan), the GPU runs all three seamlessly. A render job pauses AI inference, runs the render (30 sec - 2 min), then AI inference resumes.
