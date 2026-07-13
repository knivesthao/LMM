# AWS vs. GCP — Head-to-Head Cost Comparison

> For LMM: SPA, API, database + auth, content delivery, GPU compute.
> 12-month prototype phase. All prices USD.

---

## Service Mapping

| Layer | AWS | GCP |
|-------|-----|-----|
| SPA hosting | Amplify or S3 + CloudFront | Cloud Storage + Cloud CDN (or Cloud Run) |
| API gateway | API Gateway + Lambda | Cloud Run (serverless containers) |
| Database | RDS (Postgres) | Cloud SQL (Postgres) |
| Auth (phone) | Cognito (+ custom SMS via SNS) | Firebase Auth (built-in phone auth) |
| Content storage + CDN | S3 + CloudFront | Cloud Storage + Cloud CDN |
| GPU compute | EC2 G5 (A10G, 24GB VRAM) | G2 instance (L4 GPU, 24GB VRAM) |

---

## AWS — Full Breakdown

| Service | Configuration | Dev (100 hrs/mo GPU) | Prod (GPU always-on) | Annual |
|---------|--------------|---------------------|----------------------|--------|
| **S3 + CloudFront** (SPA) | Static site, <1GB, basic CDN | $1/mo | $3/mo | $25 |
| **S3 + CloudFront** (content) | ~2GB storage, ~500MB egress/mo | $3/mo | $20/mo | $140 |
| **API Gateway + Lambda** | ~15K req/mo, 128MB, 100ms avg | $1/mo | $5/mo | $40 |
| **RDS** (Postgres, db.t4g.micro) | 1 vCPU, 1GB RAM, 20GB SSD | $15/mo | $15/mo | $180 |
| **Cognito** | 200 MAU (phone via SNS) | $30/mo | $55/mo | $510 |
| **EC2 G5 (g5.xlarge)** | A10G 24GB, 4 vCPU, 16GB RAM | $101/mo ($1.01/hr) | $727/mo ($1.01/hr) | $4,968 |
| **Data transfer** | Ingress free, egress $0.09/GB | $2/mo | $15/mo | $100 |
| **Total** | | **$153/mo** | **$840/mo** | **~$5,963** |

### Notes

- **Cognito phone auth is expensive.** SMS via SNS costs $0.005–0.01/message in Laos. 200 users with 2 texts each (login + verify) = $2-4/mo. But Cognito's cost comes from MAU pricing: $0.0055/MAU after 50K. For 200 MAU, it's free on the MAU front. The real cost is SNS.
- **RDS minimum instance ($15/mo)** — cannot go lower or scale down. Single-AZ.
- **EC2 GPU** dominates the budget. On-demand at $1.01/hr. No spot discounts for GPU-heavy workloads because preemption kills rendering jobs. You can use Reserved Instances (1-year commit) to get ~$0.64/hr → annual $4,608 for GPU.
- **Egress fees** — 5MB comic downloaded 1,000 times = 5GB egress = $0.45. At 10K downloads/month = $4.50/mo. At scale this grows linearly.

---

## GCP — Full Breakdown

| Service | Configuration | Dev (100 hrs/mo GPU) | Prod (GPU always-on) | Annual |
|---------|--------------|---------------------|----------------------|--------|
| **Cloud Storage + Cloud CDN** (SPA) | Static site, <1GB | $1/mo | $3/mo | $25 |
| **Cloud Storage + Cloud CDN** (content) | ~2GB storage, ~500MB egress | $3/mo | $20/mo | $140 |
| **Cloud Run** (API backend) | 1 vCPU, 256MB, 100ms/call, 15K req/mo | $0 | $3/mo | $20 |
| **Cloud SQL** (Postgres, db-f1-micro) | 0.6 vCPU, 1.7GB RAM, 10GB SSD | $9/mo | $9/mo | $108 |
| **Firebase Auth** (phone) | 200 MAU, phone sign-in | $0 | $0 | $0 |
| **G2 Instance** (g2-standard-4) | L4 GPU 24GB, 4 vCPU, 16GB | $67/mo ($0.67/hr) | $485/mo ($0.67/hr) | $3,312 |
| **Data transfer** | Ingress free, egress $0.08–0.12/GB | $2/mo | $12/mo | $84 |
| **Total** | | **$82/mo** | **$532/mo** | **~$3,689** |

### Notes

- **Firebase Auth is free for phone sign-in** up to 10K auths/month. This is GCP's biggest win — AWS Cognito + SNS costs money per SMS.
- **Cloud Run scales to zero** — you pay nothing when there are no requests. AWS Lambda is similar, but Cloud Run supports long-running requests (up to 60 min) whereas Lambda maxes at 15 min. Cloud Run is better for our render queue polling.
- **Cloud SQL db-f1-micro** is the cheapest Postgres instance. Shared CPU, burstable, but sufficient for prototype (~200 users). $9/mo is the floor — can't go lower. AWS RDS floors at $15/mo.
- **G2 L4 GPU** at $0.67/hr. With 1-year committed use discount (25%): ~$0.50/hr → $3,600/yr. Cheaper than AWS's A10G at $1.01/hr.
- **No spot GPU** on G2 — these are on-demand only.

---

## Side-by-Side

| | AWS | GCP | Winner |
|---|-----|-----|--------|
| **SPA hosting** | $25/yr | $25/yr | Tie |
| **Content delivery** | $140/yr | $140/yr | Tie |
| **API backend** | $40/yr | $20/yr | GCP (Cloud Run free tier) |
| **Database** | $180/yr | $108/yr | GCP ($9/mo vs. $15/mo) |
| **Auth (phone)** | $510/yr | **$0/yr** | GCP by a mile |
| **GPU compute** | $4,968/yr (dev+prod) | $3,312/yr (dev+prod) | GCP ($0.67/hr vs. $1.01/hr) |
| **Egress** | $100/yr | $84/yr | Tie |
| **Annual total** | **~$5,963** | **~$3,689** | **GCP** |

---

## Scale Projection (Year 2 — 1,000 users, 200 titles, daily GPU usage)

| | AWS (year 2) | GCP (year 2) |
|---|-------------|-------------|
| Database | $360 ($30/mo) | $240 ($20/mo) |
| Auth | $1,200 | $0 (still under 10K auths/mo) |
| GPU (reserved, 1yr) | $5,616 | $3,600 |
| Content egress (50GB/mo) | $540 | $480 |
| **Annual** | **~$9,500** | **~$6,200** |

---

## The Case for GCP

1. **Firebase Auth is the killer feature.** Built-in phone auth with zero cost for our user volume. AWS requires stitching Cognito + SNS + Lambda triggers — costs money and engineering time.
2. **G2 L4 GPU is 33% cheaper than AWS A10G** and has the same 24GB VRAM.
3. **Cloud Run** can handle our long-running render queue polling (up to 60 min execution) — Lambda caps at 15 min.
4. **$2,274/year cheaper** than AWS at prototype scale, gap widens at production scale.

## The Case for AWS

1. **EC2 spot instances can occasionally slash GPU costs** (up to 70% off). But GPU spot instances are frequently interrupted — risky for rendering jobs that take 5+ minutes.
2. **Better GPU availability** — GCP's G2 instances have limited regional availability. AWS has G5 in more regions.
3. **More GPU options** — AWS has A10G, A100, H100 if you need to scale up. GCP's GPU lineup is smaller.

---

## Verdict

**GCP wins on cost at every scale.** Firebase Auth alone saves $500+/year. GPU is 33% cheaper. Database is $72/yr cheaper. Cloud Run is free for our usage.

The only reason to choose AWS would be GPU availability (if G2 instances aren't available in your preferred region) or if you already have AWS credits/expertise.

At $3,689/year, GCP is still ~2x more expensive than the current Paperspace + Cloudflare stack ($1,700–3,700). But if you need a single cloud provider, GCP is the better choice.
