# 6. Budget Request

## Total Requested: $35,000 — Duration: 6 months

| Category | Item | Detail | Cost |
|----------|------|--------|-----:|
| **Personnel** | UE Developer (1 FTE, 6 months) | Blueprint scripting, Pixel Streaming pipeline, MRQ automation, mobile packaging | $12,000 |
| | AI/ML Engineer (0.5 FTE, 6 months) | LLM pipeline implementation, Stable Diffusion + ControlNet deployment, TTS integration | $6,000 |
| | Laos Operations Lead (1 FTE, 4 months) | Creator recruitment, school partnerships, user testing coordination, payment integration | $4,000 |
| | Community Manager (0.5 FTE, 4 months) | Creator onboarding, training materials in Lao, support, feedback collection | $2,000 |
| **Infrastructure** | Cloud GPU (AWS G5) | Pixel Streaming instance + batch rendering: ~$0.80/hr × 500 hours | $400 |
| | CDN + Storage | CloudFront edge distribution in SE Asia, S3 for content origin + metadata | $300 |
| | Web app hosting | React SPA + REST API on low-cost t3a instance | $200 |
| **API Costs** | LLM (GPT-4o) | ~100,000 scene generations × $0.01 (cached, batched) | $1,000 |
| | Image Generation (SDXL) | Self-hosted on existing GPU — marginal compute only | $100 |
| | TTS (ElevenLabs / Coqui) | ~5,000 minutes Lao + English narration | $500 |
| **Content** | Initial Library Creation | 30 comics + 10 interactive books: flat fees to Lao creators for commission work | $5,000 |
| **Mobile** | PWA Development | Offline Service Worker, IndexedDB sync, QR payment interop | $1,500 |
| | Device Testing | Remote device lab access (BrowserStack or similar) for 20 low-end Android devices | $500 |
| **Operations** | Training & Workshops | 2 workshops in Vientiane + 3 rural schools: facilitator fees, materials, transport | $1,000 |
| | Contingency (10%) | Unforeseen technical or operational costs | $3,500 |
| | **Total** | | **$38,000** |

*Note: Total slightly exceeds 35K guideline. Core scope (bold items) fits within 35K. Contingency and optional scope items can be deferred based on grant amount.*

## Budget Notes

- **Personnel costs reflect local rates.** Laos-based roles (Operations Lead, Community Manager) are valued at Lao market rates ($500–1,000/month), not US rates. This is intentional and sustainable — our Laos office operates full-time on a local cost structure that a $35K grant can significantly extend.
- **GPU costs are low because we use ephemeral instances.** The Pixel Streaming instance only runs when a creator is actively editing. The rendering instance only runs during batch publish. No GPU runs idle. The budget assumes ~500 total GPU hours over 6 months.
- **AI API costs are low because the LLM call is narrow.** We are not generating text — we are generating JSON scene structures from narration. Each call is ~500 tokens, heavily cacheable (common scene types share prompts).
- **Content creation fees go to Lao creators.** The initial library of 40 titles serves as both the launch catalog and the proof-of-concept for the creator economy model. Creators are paid a flat fee per title.
- **Contingency is a standard 10% buffer.** Epic prefers to see realistic budgets with contingency rather than bare-bones requests that bust immediately.

## If Award Is Lower (Cost-Reduction Options)

| Reduced To | What Changes |
|-----------|--------------|
| **$25,000** | Reduce UE dev to 4 months, eliminate contingency, self-host LLM (Llama 3) instead of GPT-4o, reduce initial library to 20 titles |
| **$15,000** | Core prototype only: UE + AI pipeline functional, web creator live, 5 sample titles. Digital library and mobile features deferred. Operating on existing ADMAIS infrastructure. |
| **$10,000** | Stretch goal: This represents the minimum viable grant to add AI-powered content creation to ADMAIS's existing service offerings. Extends existing client work into the educational media space. |
