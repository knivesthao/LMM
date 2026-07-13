# Epic MegaGrants — Application

> Use this to fill out the Epic MegaGrants portal form at https://www.unrealengine.com/megagrants.
> All fields marked `*` are required. Character limits noted where applicable.

---

## *How did you hear about us?

Researching Unreal Engine applications in educational technology and international development. The MegaGrants program came up as the most aligned funding mechanism for projects that push real-time 3D into new, socially impactful domains.

---

## Project media link
> YouTube, GDrive, Dropbox, Vimeo, etc.

No project media exists yet — we are applying at the concept stage. This grant will fund the prototype that generates our first demo reel.

---

## Project build link
> github?

No public build yet. The repository will be created as the first deliverable in Month 1 of the grant period. We will host at github.com/admais/lmm.

---

## Project website
> subpage of admais.xyz

https://admais.xyz/lmm *(to be created — currently redirects to ADMAIS homepage)*

---

## *What phase is your project in?

**Concept.** No prototype exists yet. This MegaGrant funds the prototype build from the ground up.

---

## *Is your project currently in Unreal Engine or Unreal Editor for Fortnite?

**Unreal Engine 5** — not Unreal Editor for Fortnite (UEFN).

UEFN is a specialized version of UE for building and publishing content exclusively within the Fortnite ecosystem. LMM is building a standalone web and mobile platform — a creator tool that generates downloadable comics and interactive books distributed through our own digital library, not through Fortnite. UEFN does not support Pixel Streaming for web-based creator tools, does not allow headless rendering, and does not export content outside the Fortnite platform. We need the full Unreal Engine 5 for its Blueprint scripting, Movie Render Queue, Sequencer for animation, and mobile packaging pipeline.

---

## *Is your project open source and/or does it give back to the 3D community?

Yes — in three ways:

**1. Open-sourcing the UE pipeline automation.** We will open-source our Blueprint systems and pipeline scripts that drive automated scene assembly. The core innovation — a Blueprint orchestrator that reads structured scene data, spawns AI-generated assets into 3D environments, applies lighting and camera configurations, and renders via Movie Render Queue without human intervention — is a novel UE workflow. We will publish this as a UE plugin template on GitHub under an MIT license, with documentation and example scenes.

**2. Creating jobs and a digital media ecosystem in Southeast Asia.** We will train creators and content writers in Laos and the region on Unreal Engine — giving them globally marketable skills. Southeast Asia is home to millions of gamers already familiar with the UE visual style through popular titles. Our platform bridges that visual familiarity into education. By the end of this grant, we expect to have trained at least 10 creators on Unreal Engine fundamentals.

**3. Publishing free UE learning materials.** We will publish tutorials and documentation in Lao, English, and Thai covering UE content creation, Blueprint scripting, and AI/UE pipeline integration — lowering the barrier for entry-level creators in non-English-speaking markets.

---

## *Project elevator pitch (max 225 chars)

An AI-powered platform using Unreal Engine 5 to generate comics and interactive children's books for Lao and English learners — turning narration into 3D-rendered stories for underserved mobile readers across Southeast Asia.

---

## *Full project details

### The Problem

Laos faces an acute literacy crisis. A landlocked country of 7.5 million, only 23% of rural children achieve minimum reading proficiency by Grade 5. The average Lao child accesses fewer than one book per year outside of textbooks. Physical books are expensive to import and near-impossible to distribute to rural villages. Meanwhile, mobile phones reach over 80% of the population. The digital infrastructure exists — the content does not.

This pattern repeats across the region. Thailand's rural provinces face similar access gaps. English language learning — a gateway to economic opportunity across ASEAN — is bottlenecked by the same content shortage. Traditional publishing cannot close this gap. And even if it could, there simply aren't enough illustrators, writers, or publishers producing children's content in these languages.

### The Solution

We are building LMM (Laos Media Machine): a web-based content creation platform where Unreal Engine 5 serves as a literacy engine. A creator writes a story scene by scene in Lao, English, or Thai. AI reads the narration and extracts what each scene needs — characters, settings, lighting, camera angles — as structured data. AI image generation produces consistent character sprites and backgrounds. Unreal Engine assembles everything into fully rendered 3D scenes with dynamic lighting and cinematic presentation. The output is a lightweight, downloadable comic or interactive children's book that a student can read on a $50 Android phone, offline, in pieces small enough to download over a 2G connection.

The visual style of UE-rendered content gives us a powerful advantage: tens of millions of people across Southeast Asia already play games built with Unreal Engine. They know and trust this visual language. A child who has spent hours in UE-rendered worlds immediately recognizes and engages with educational content rendered through the same pipeline. We are meeting learners where their visual expectations already are.

LMM has four stages:

**Stage 1 — Creator Interface:** A web editor where creators write narratives. AI reads the story text (Lao, English, Thai) and automatically generates scene descriptions — what's happening, who's there, what the mood and lighting should be.

**Stage 2 — AI Scene Generation:** The scene descriptions drive AI image generation (Stable Diffusion with character consistency) to produce character sprites and background textures. A creator-approved reference sheet ensures a character on page 1 looks the same on page 20.

**Stage 3 — UE Scene Assembly:** Unreal Engine 5 reads the scene data and runs a fully automated Blueprint pipeline. It places AI-generated textures onto 3D character models and environments, configures dynamic lighting from scene parameters, positions cameras, applies a custom comic-style post-process shader, and renders final output via Movie Render Queue. For interactive books, Sequencer adds camera animation and character movement.

**Stage 4 — Distribution:** Rendered content is packaged in small per-scene chunks — a full 20-page comic targets under 5MB. Users download scene by scene. The mobile reader works offline after download. Authentication uses phone numbers (no email required). Payment integrates with local mobile money systems.

### Why This Matters for Epic

This project stretches Unreal Engine into territory it has never occupied: serving underserved readers through AI-assisted, real-time 3D content creation. It proves UE's versatility, opens a new adoption category (educational content creation for developing economies), showcases UE + AI integration as a product rather than a demo, and creates a replicable model across Southeast Asia. This is the bold, lateral use of UE that MegaGrants was created to champion.

---

## *Please tell us about some of the unique features of your project.

1. **AI-powered UE scene assembly pipeline.** An LLM converts freeform narration (Lao, English, Thai) into structured scene data. AI image generation produces consistent character art. A UE5 Blueprint orchestrator reads the scene data, spawns AI-generated assets into 3D environments, configures dynamic lighting, applies a custom comic-style post-process shader, and renders via Movie Render Queue — all automated. This turns UE into a programmable content factory.

2. **Consistent characters across entire stories.** AI-generated characters maintain visual identity across all scenes using reference sheets and generation constraints. A character on page 1 looks the same on page 20 — the hardest problem in AI visual storytelling, solved through UE's material system.

3. **UE-native visual style meets an existing audience.** Millions across Southeast Asia know the UE visual language through games. Learners engage with educational content that looks like the games they already love — reducing the adoption barrier by leveraging visual familiarity.

4. **Offline-first mobile distribution.** Content packaged in per-scene chunks under 500KB — users download scene by scene over unstable connections. Works on a $50 Android phone with no internet after download.

5. **A creator economy, not a content library.** Creators write, AI generates visuals, UE renders, the library delivers. Creators earn 70% of sales. The library grows organically as creators publish.

---

## *What funding range are you requesting for this project? (US Dollars)

**$50,000–$100,000**

We are requesting approximately $62,000 for a 12-month build. All development runs on a cloud GPU — we have no local machine capable of UE5. AI inference (LLM for scene parsing + Stable Diffusion for image generation) runs on the same GPU during idle time between renders, eliminating external API costs. Full cost estimates will be refined once prototype architecture is finalized, but the core breakdown is:

| Category | Estimated | Detail |
|----------|-----------|--------|
| Personnel — AI Developer (1 FTE, 12 mo) | $18,000 | UE5 Blueprint scripting, AI pipeline integration, full-stack web development, mobile packaging. All technical development — uses AI assistance throughout. |
| Personnel — Operations Manager (1 FTE, 12 mo) | $18,000 | Studio space management, creator recruitment and outreach, school partnerships, marketing, payment integration coordination, content operations. |
| Personnel — QA / Content Writers (part-time, 2 people, months 5–12) | $8,000 | Part-time QA testing during later phases. Also write and produce our first content titles — real Lao stories that validate the pipeline with authentic local material. |
| Studio Space | $5,000 | Rent for content creation and team workspace in Vientiane |
| Equipment | $3,000 | Development and testing devices, content creation tools |
| Paperspace GPU — UE5 development (months 1–5) | $390 | Cloud GPU for UE5 development. P5000 (16GB VRAM) at $0.78/hr on-demand. Estimated 100 hours/month × 5 months. Also runs self-hosted Llama 3 (scene parsing) + Stable Diffusion (image gen) during idle time between renders — no external AI API costs. |
| Paperspace GPU — UE5 + AI inference (months 6–12) | $3,227 | Monthly plan ($461/mo × 7 mo) once creators are actively generating content. Always-on GPU handles UE5 rendering, Llama 3 LLM calls, and Stable Diffusion image generation on the same machine. |
| Web Hosting + CDN + Domain | $800 | Cloudflare Pages (free), Workers (free tier), R2 storage (~$50), Supabase (free tier for prototype), domain (~$10) |
| Content Commissioning | $3,000 | Flat fees to Lao creators for initial library titles beyond what in-house QA/writers produce |
| Estimated Taxes (reserve) | $2,700 | Grant recipient is ADMAIS Laos. Corporate tax ~20%. Most expenses deductible — conservative reserve on projected net profit. |
| **Total** | **~$62,117** | |

**Note on items not shown:**
- PWA mobile client development → part of AI Developer's scope (in salary)
- Device testing → developer's local machine + Android emulators (no separate cost)
- Training and workshops → part of Operations Manager's role (in salary)

**If award is lower:**

| Award | Scope |
|-------|-------|
| $25,000–$50,000 | Core UE + AI pipeline functional, Lao-only, reduced content library, shorter timeline |
| $10,000–$25,000 | Minimum viable pipeline: UE renders AI-generated comic strips from text input, sample content only |

---

## *How do you plan to use the funds for the project?

The funds cover a 12-month build (September 2026 – August 2027) across four phases:

**Phase 1 — Foundation (Months 1–2):** Set up UE5 development environment. Integrate LLM API for Lao and English scene parsing. Deploy self-hosted Stable Diffusion with ControlNet for consistent character generation. Build the initial Blueprint orchestrator skeleton. AI Developer begins training on UE Pixel Streaming and MRQ pipeline automation.

**Phase 2 — Core Pipeline (Months 3–5):** Complete the Blueprint orchestrator — reads structured scene data, spawns AI-generated assets onto 3D character models and environments, configures lighting and cameras, applies the custom comic post-process shader, renders via Movie Render Queue. Build library of base meshes representing Lao and Thai visual contexts. Achieve the first end-to-end pipeline test: text narration in Lao → UE-rendered comic strip.

**Phase 3 — Creator Tool + Alpha Testing (Months 6–9):** Build the web-based creator interface. Design the create-and-publish flow. Onboard 5 Lao creators for alpha testing. QA/Content Writers begin part-time — testing pipeline output quality and writing our first original stories. Iterate on pipeline quality based on real creator feedback.

**Phase 4 — Launch + Content Library (Months 10–12):** Produce initial library of 30+ comics and 10+ interactive books in Lao and English. Conduct user testing with Lao students. Train ADMAIS Laos team to operate platform independently. Publish open-source Blueprint plugin to GitHub under MIT license. Launch platform with 100 beta users.

---

## Have you secured additional funding for this project?

**No.** This MegaGrant will be the sole funding source for the prototype build. The grant recipient will be ADMAIS (Laos) — the entity operating the project on the ground. ADMAIS Laos is an early-stage company with no existing revenue to absorb project costs. Every dollar of the budget — from developer salary to web hosting to LLM API calls — needs to come from this grant. ADMAIS US provides technical oversight and AI/UE development support as a partner. Post-launch, the platform will generate revenue through creator subscriptions and content sales, reaching break-even within 18 months of launch.
