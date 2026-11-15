Subject: IIT Delhi – Founding AI Engineer - 2027

**Prototype:** <your Vercel link> (best on a phone; add to home screen)
**Repo:** https://github.com/goldfish-ez/ENAM-project
**AI build history:** https://claude.ai/code/session_01GPY31jQmnQzy9CySbk5G1J

---

## What I built

FINN is a mobile-first agent built on one idea: **an investor's scarce resource is attention, so every screen answers "does this need me, and who can help me understand it?"**

- **Push (Today).** BSE filings across a 15-stock portfolio are clustered into *stories*, not listed as filings. A QIP, an NCD allotment and a CP issue become "Persistent raised ₹11,865 cr in 10 days". Stories are scored for materiality *relative to the company* (raise size vs market cap, penalty vs revenue), then tiered into **Needs you / Worth a glance / Routine (folded)**. The window defaults to 24h and can be switched to 3d, 7d or 30d. Results get a first-cut QoQ/YoY table (Revenue, EBITDA, PBT, PAT, margin in bps, other-income flags). A management change gets the person's career and education plus your way in through the network. Price/volume alerts use thresholds the investor sets, and filing types can be set to alert, digest or hide. A **spoken 60-second brief** uses the phone's own speech engine.
- **Pull (Ask → research).** One box takes a company, a person, a theme or a question. Research on any NSE ticker is grounded only in primary sources. Numbers come straight from the standardised statements, deterministically: trajectory, leverage, cash conversion, receivable days. The centrepiece is **promised vs delivered**: management's own targets from the last four calls, with verbatim quotes, checked against reported numbers. On Persistent, FINN shows the $2B revenue aspiration *at risk*, the +200–300 bps margin promise *slipping* (15.0% vs ~16.6–17.7% implied), and how the language softened from "committed to our goal" to "aspiration".
- **Network.** It isn't a contact list. It is a graph of careers and education. It finds overlaps with year precision ("Overlapped at UTI AMC, 2013–18 while Leo was MD"), second-degree paths to executives in the news, who to call for a company (alumni > people at rivals, customers or suppliers > theme experts), portfolio coverage with blind spots, an expertise map, and *reasons to reconnect* (your quiet contact's ex-employer just made news, with a one-tap drafted note). It is woven into every Push card and every research page.

## Key decisions and tradeoffs

1. **Deterministic where it can be, LLM where judgement is needed.** Classification is rules-first (~90% of filings, free). Materiality, results tables, network reasoning and research numbers are code, so every claim is checkable. Models are used for three things: extracting facts from material filings, extracting guidance from transcripts, and the promised-vs-delivered synthesis.
2. **Network reasons must be facts, not vibes.** "Aditi worked at ICICI Bank during Bagchi's six years as ED" beats an embedding similarity score. Paths are ranked by relationship strength × overlap × recency. Current employees are flagged with a SEBI insider-trading (PIT) caution (no unpublished price-sensitive information).
3. **Snapshot + live, never a blank screen.** A git-committed snapshot is refreshed by cron, so the app runs even if a source is down. If data is >36h stale, windows anchor to the snapshot time and say so. Pull fetches live per request.
4. **Thin but working.** Three layers, each with a few workflows done properly, rather than eight half-built research sections.

## Architecture

**Data pipelines.** A GitHub Action at 19:00 IST on weekdays runs `refresh.ts`. It pulls Yahoo EOD prices, the BSE announcements API (30 days per scrip) and screener.in financials and document links. It classifies filings, extracts facts for *material* filings only, and commits `data/snapshot/*.json`; Vercel redeploys. Linking: filings key on BSE scrip ↔ NSE symbol. People in filings resolve against the people registry by name today. In production that becomes name + employer + tenure matching with a confidence score and a human confirm for low-confidence links. The screener parser is shared by the cron and live Pull.

**Security & privacy.** The network is the investor's private data. In production: per-user encrypted store (Postgres with row-level security, KMS-wrapped keys); never sent to a model except the minimum fields for a single request; never used for training (enterprise API terms). Personal data stored is limited to professional facts (roles, tenures, schools) and relationship metadata the investor enters. Profiles of public people come only from filings and public reporting, cited. Contacts are imported with consent (the investor's own export, or a consented LinkedIn/Google contacts connection under their terms, not scraping). Stale or deleted contacts are purged within 30 days, and the investor gets an export/delete control. Insider caution is built into the product.

**LLMs and agents.** A two-tier router (`lib/llm.ts`): **Gemini 3.5 Flash-Lite** for bulk extraction, **Gemini 3.8 Flash** only for the synthesis step. Transcripts are keyword-chunked to ≤14k characters before the model sees them, and calls are cached by content hash, so a filing or transcript is paid for once. A full live research run is about 5 calls and fractions of a cent, and the app shows the cost on each research page. The research flow is a fixed plan with tool steps (fetch → parse → extract → synthesise), not a free-roaming agent, because reliability beats autonomy for this job. Prompts forbid outside knowledge; quotes must come from the extracted text.

**Cloud.** Vercel for the Next.js app and serverless APIs (60s budget for live research), GitHub Actions for cron and storage of the snapshot, Gemini API. All free tier.

**Sources used.** Market data, filings and fundamentals are real (13–14 Nov 2026). Executive profiles come from public reporting, cited. **Investor contacts are synthetic**, built to overlap realistically with the portfolio. For real use I'd ingest the investor's own LinkedIn data export (their data, their consent) rather than scrape profiles.

## Deliberately left out

Intraday data, broker/news feeds (primary-only by design), annual-report parsing for segment mix (screener tables were enough to prove the engine), auth and multi-user storage, push notifications (the PWA is ready for Web Push), and NSE as a second filings source (BSE coverage is equivalent for listed names).

## Where I'd take it next

1. **Memory per company:** keep the guidance ledger alive across quarters, so every new transcript updates it automatically.
2. **Network ingestion:** LinkedIn export + calendar + email metadata (consented) to keep relationship strength and last-contact current without manual entry.
3. **Pre-meeting pack:** before a meeting on the calendar, auto-assemble the person dossier, open questions from the guidance ledger, and who in the network to call first.
4. **Feedback loop:** "Done" and "not useful" taps tune materiality weights per investor.
