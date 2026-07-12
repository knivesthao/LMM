# 7. Milestone Plan & Timeline

**Period:** September 2026 — February 2027 (6 months, aligned with Epic Cycle 2 notice period)

## Phase Breakdown

```
Month 1  │  Month 2  │  Month 3  │  Month 4  │  Month 5  │  Month 6
─────────┼───────────┼───────────┼───────────┼───────────┼───────────
Found-   │  Core UE  │  AI Pipe- │  Creator  │  Content  │  Launch +
ation    │  Pipeline │  line     │  Web App  │  Library  │  Handoff
         │           │  Integr.  │  + Mobile │  + Field  │
         │           │           │           │  Testing  │
```

| Phase | Months | Deliverables | Team |
|-------|--------|-------------|------|
| **1. Foundation** | 1 (Sep) | UE5 headless instance provisioned, Pixel Streaming server deployed, ADMAIS cloud infra set up, Stable Diffusion + ControlNet on GPU, LLM API integration started, GitHub project board operational | US dev lead + Laos ops lead (kickoff planning) |
| **2. Core UE Pipeline** | 2 (Oct-Nov) | Level Blueprint orchestrator functional, base mesh library (~50 assets) created, comic post-process shader v1, MRQ export automated for image sequences, first test scene renders successfully from Blueprint trigger | US dev lead (full-time) |
| **3. AI Integration** | 3 (Nov-Dec) | LLM → JSON scene struct pipeline functional, character consistency system (IP-Adapter) working, image-to-mesh material workflow complete, TTS integration renders first narration audio, end-to-end pipeline test: text prompt → rendered output | US dev lead + AI engineer |
| **4. Creator Web App + Mobile** | 4 (Dec-Jan) | React SPA built with Pixel Streaming client, create/publish flow UI complete, PWA Service Worker with offline caching, chunked download system, QR payment interop (BCEL One sandbox), 5 Lao creators onboarded for alpha testing | US dev lead + Laos community manager |
| **5. Content Library + Field Testing** | 5 (Jan-Feb) | 30 comics + 10 interactive books commissioned from Lao creators, 3 rural school testing sessions (readability, comprehension, engagement), Lao-language narration QA, device compatibility testing on 10 low-end Android models, iteration based on field feedback | Laos ops lead + community manager + creators |
| **6. Launch + Handoff** | 6 (Feb) | Digital library opens (100 beta users via Lao phone number), published titles available for download, ADMAIS operations team trained to run platform independently, post-grant sustainability plan activated (creator subscriptions), final report and open-source documentation published | All hands |

## Key Milestones

| Milestone | Target Date | Success Criterion |
|-----------|-------------|-------------------|
| M1: First UE-rendered comic strip from AI input | Oct 31 | A creator writes a 4-panel story → AI generates consistent characters → UE renders publishable output |
| M2: End-to-end pipeline demo | Dec 15 | Full flow works: narration → LLM → image gen → UE assembly → MRQ render → chunked package stored on CDN |
| M3: Creator tool live with alpha users | Jan 15 | 5 Lao creators have published at least 1 title each through the web creator |
| M4: Field test complete | Feb 15 | 3 rural schools report: content downloaded offline, children engaged, comprehension scores measured (baseline vs. post-reading) |
| M5: Public launch | Feb 28 | 100 beta users, 40+ titles in library, platform handed to ADMAIS operations team |

## Post-Grant Trajectory (Not Funded by Epic)

```
Q3 2027 │ Native mobile apps (iOS/Android/Chinese stores)
        │ Creator subscription tiers live
        │ Self-sustaining revenue from 70/30 content splits
        │
Q4 2027 │ ISIF Asia grant application (if applicable)
        │ Expansion to Cambodia (Khmer language content)
        │ 500+ active users, 200+ titles
```
