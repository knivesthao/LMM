# LMM — Hosting Cost Analysis

> Goal: Find the cheapest way to host LMM for a Lao audience. Compare complete stacks, not individual services.

---

## What We Actually Need (12-month prototype)

| Layer | What it does | Traffic / scale |
|-------|-------------|-----------------|
| **SPA hosting** | Serve the React frontend (library + creator studio) | ~100 beta users, 5–10 creators |
| **Content delivery** | Serve rendered comics/books (images) | ~40 titles, ~5MB each, downloaded by 100 users |
| **API gateway** | Route requests, validate auth, queue render jobs | ~500 req/day |
| **Database + Auth** | Users, content metadata, purchases, phone auth | ~200 users |
| **GPU compute** | UE5 rendering + Llama 3 + SDXL (6 months dev, 6 months prod) | 100 hrs/mo dev, daily rendering in prod |

---

## Stack Comparison

### Stack A: Cloudflare + Supabase + Paperspace (current)

| Layer | Service | Monthly cost (dev) | Monthly cost (prod) | Annual |
|-------|---------|-------------------|---------------------|--------|
| SPA | Cloudflare Pages | $0 | $0 | $0 |
| CDN + storage | R2 | ~$1 | ~$5 | ~$50 |
| API gateway | Workers | $0 | $0 | $0 |
| Database + auth | Supabase free tier | $0 | $0 → $25/pro | $25–300 |
| GPU | Paperspace P5000 | ~$78 (on-demand) | $461 (monthly plan) | $3,617 |
| **Annual total** | | | | **~$3,700–4,000** |

**Pros:** Near-zero fixed infrastructure costs. R2 has no egress fees — media delivery costs nothing regardless of downloads. Paperspace is the cheapest GPU option.
**Cons:** Split across 3 providers. Need to manage Supabase + Cloudflare + Paperspace independently. No unified billing.

---

### Stack B: AWS (full stack)

| Layer | Service | Monthly cost (dev) | Monthly cost (prod) | Annual |
|-------|---------|-------------------|---------------------|--------|
| SPA | S3 + CloudFront | ~$1 | ~$5 | ~$50 |
| CDN + storage | S3 + CloudFront | ~$2 | ~$15 + egress | ~$200 |
| API gateway | API Gateway + Lambda | ~$1 | ~$10 | ~$80 |
| Database + auth | RDS (Postgres) + Cognito | ~$30 | ~$60 | ~$600 |
| GPU | EC2 G5 (A10G) | ~$800 ($1.01/hr × 100hrs) | $4,800 ($1.01/hr × 24/7) | $33,600 |
| **Annual total** | | | | **~$4000 (dev) or $34,000 (full GPU prod)** |

**Pros:** Everything in one AWS account. Lambda + API Gateway is solid. Cognito for phone auth?
**Cons:** Backsolve — doesn't have built-in phone auth. EC2 GPU is 2.5x Paperspace. Content egress costs ($0.09/GB) — a 5MB comic downloaded 10,000 times = $4.50 in egress. At scale this adds up. RDS minimum instance alone is ~$15/mo even when idle.

AWS is 8-10x more expensive than the current stack for GPU, plus egress fees kill the content delivery economics.

---

### Stack C: GCP (full stack)

| Layer | Service | Monthly cost (dev) | Monthly cost (prod) | Annual |
|-------|---------|-------------------|---------------------|--------|
| SPA | Cloud Storage + Cloud CDN | ~$1 | ~$5 | ~$50 |
| CDN + storage | Cloud Storage + Cloud CDN | ~$2 | ~$15 | ~$200 |
| API gateway | Cloud Run | $0 | ~$15 | ~$100 |
| Database + auth | Cloud SQL + Firebase Auth | ~$30 | ~$60 | ~$600 |
| GPU | G2 instance (L4 GPU) | ~$560 (0.70/hr × 100hrs) | ~$3,360 (0.70/hr) | $23,520 |
| **Annual total** | | | | **~$24,500** |

**Pros:** Firebase Auth has built-in phone auth (like Supabase). Cloud Run is solid serverless. GCP has the most AI/ML services if we expand.
**Cons:** GPU costs are 4x Paperspace. Cloud SQL minimum instance is ~$7/mo but limited. Content egress similar to AWS. Firebase free tier is generous but caps at 10K auth/month.

GCP is better than AWS for auth (Firebase), but GPU costs are still high and egress fees hurt at scale.

---

### Stack D: Cloudflare + Supabase + GCP GPU only

| Layer | Service | Monthly cost (dev) | Monthly cost (prod) | Annual |
|-------|---------|-------------------|---------------------|--------|
| SPA | Cloudflare Pages | $0 | $0 | $0 |
| CDN + storage | R2 | ~$1 | ~$5 | ~$50 |
| API gateway | Workers | $0 | $0 | $0 |
| Database + auth | Supabase | $0 | $0 → $25/pro | $25–300 |
| GPU | GCP G2 (L4) | ~$560 | ~$3,360 | $23,520 |
| **Annual total** | | | | **~$23,900** |

---

### Stack E: Cloudflare + Supabase + RunPod GPU (cheaper than Paperspace)

Paperspace isn't the cheapest GPU out there. **RunPod** offers A40 GPUs (48GB VRAM) at ~$0.44/hr, and A5000 (24GB) at ~$0.29/hr — significantly cheaper than Paperspace's $0.78/hr for similar cards.

| Layer | Service | Monthly cost (dev) | Monthly cost (prod) | Annual |
|-------|---------|-------------------|---------------------|--------|
| SPA | Cloudflare Pages | $0 | $0 | $0 |
| CDN + storage | R2 | ~$1 | ~$5 | ~$50 |
| API gateway | Workers | $0 | $0 | $0 |
| Database + auth | Supabase | $0 | $0 → $25/pro | $25–300 |
| GPU | RunPod A5000 | ~$29 (on-demand, 100hrs) | ~$174 (monthly plan) | $1,392 |
| **Annual total** | | | | **~$1,700** |

**Pros:** Cheapest GPU by far. R2 still has no egress. All infrastructure costs near zero.
**Cons:** RunPod is newer/less proven than Paperspace. Need to verify UE5 runs on their instances.

---

## Verdict

**Stack E (Cloudflare + Supabase + RunPod) is the cheapest at ~$1,700/yr.** That's 20x cheaper than a full AWS stack and 14x cheaper than GCP.

| Stack | Annual cost | Why |
|-------|------------|-----|
| **E: CF + Supabase + RunPod** | **~$1,700** | Cheapest GPU ($0.29/hr) + free egress |
| A: CF + Supabase + Paperspace | ~$3,700 | Mid GPU ($0.78/hr) + free egress |
| B: AWS full stack | ~$34,000 | 10x GPU + egress fees |
| C: GCP full stack | ~$24,500 | 4x GPU + egress fees |
| D: CF + Supabase + GCP GPU | ~$23,900 | Same GPU cost as full GCP |

**The current stack (A) is already 10x cheaper than AWS/GCP.** Switching to RunPod (E) would nearly halve the GPU cost. The only reason to go full AWS/GCP is if you need everything in one account for compliance or convenience — but at 10-20x the cost.

All full-cloud stacks lose on egress because R2 is the only storage with zero egress fees. For a media library serving downloads in Southeast Asia, that's the deal-breaker.
