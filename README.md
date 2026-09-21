# SAVE 90-Day Transition Clock

**Paste (1) whether you received a servicer 90-day notice (yes / no / unsure), (2) notice date if yes, (3) view date → one shareable card:**  
giant **days-left** badge · **Past deadline** · **Waiting for notice** · **auto-enroll = Standard or Tiered Standard if you do nothing** strip (ED language) · **Sep 29 2026** first-wave earliest cliff · StudentAid.gov/idr + court-actions pointer.

Brand on the surface: **SAVE 90-Day Transition Clock** only.

**Not plan advice. Not forgiveness advice. Not a servicer tool.** Your notice controls your deadline. We never invent a payment $ or a “best” plan. User-pasted notice flags only — zero FSA / servicer scrape.

## Hypothesis

SAVE borrowers panic “is my 90 days up?” while friends in later tranches still wait. Flip that into a **notice-date-honest share clock** — without recommending IBR vs PAYE vs RAP or scraping StudentAid.gov. Success = “paste your notice date — how many days left?” shares before Sep 29 and on each notice wave.

## How to test (local)

```bash
cd kb/mde/save-90day-clock
npm run build          # copies assets → dist/
npm run verify         # Jul1→Sep29 math + waiting/past/unsure/empty + brand-clean
# either open the file:
open index.html        # or dist/index.html
# or serve:
npm start              # http://localhost:4244
```

Manual checklist:

1. Open the page → click **Jul 1 notice → Sep 29 first-wave** → giant **16 days left** (as of Sep 13 view), auto-enroll strip, Sep 29 first-wave chip, ED / BI / SLP footer.
2. Click **Waiting for notice** → Waiting for notice badge · no invented deadline.
3. Click **Past deadline** → Past deadline badge (Jul 1 notice · Oct 1 view).
4. Click **Unsure notice** → Unsure · check notice · no invented date.
5. Click **Mid-wave · Aug 15 notice** → later deadline (Nov 13) · days left from view.
6. Click **Empty / missing dates** → honest miss (notice yes without date).
7. Paste your own notice flag + dates → **Show transition clock**.
8. Missing view date → honest status (no invented days left).
9. **Copy summary** → clipboard has countdown + auto-enroll + ED cites.
10. **Share link** → `#p=` restores the card.
11. **Export PNG** → dark clock card with days-left / past / waiting text + **disclaimer** on the face.
12. Surface brand is **SAVE 90-Day Transition Clock** only (no Conglomerate / personal names).

### GitHub Pages

This folder is static-ready. Point Pages at `/` of a dedicated repo (or `/docs` after copying `dist/`), with `index.html` at the site root. Relative paths (`styles.css`, `app.js`) work on project pages. The site footer includes a Fazier launch backlink (`https://fazier.com/`) so the free-listing badge check can see it on the live Pages URL.

```bash
npm run build   # optional artifact in dist/
```

Do **not** create the public repo or post from this build step — Steward handles Pages + distro. Distro stays product-linked only (e.g. r/StudentLoans, r/personalfinance in the Sep 15–30 first-wave window, then wave refreshes). **No sock accounts.** No “ED is stealing your forgiveness” farms. No refinance affiliate hard-sell on share PNG.

## Seed cohort (MVP)

Labeled teaching dates — not live servicer scrapes. Never invent a borrower’s payment $ or “best” plan.

| Chip | Inputs | Teaching point |
|------|--------|----------------|
| Jul 1 notice → Sep 29 first-wave | notice yes · 2026-07-01 · view 2026-09-13 | ~16 days left; first-wave cliff |
| Waiting for notice | notice no · view 2026-09-13 | No invented deadline |
| Past deadline | notice yes · Jul 1 · view 2026-10-01 | Past notice+90 |
| Unsure notice | notice unsure · view 2026-09-13 | Check letter — no invented date |
| Mid-wave · Aug 15 notice | notice yes · 2026-08-15 · view 2026-09-13 | Later tranche · Nov 13 deadline |
| Empty / missing dates | notice yes · blank notice date | Honest miss |

## Calendar logic (public ED framing)

| Rule | Framing |
|------|---------|
| Deadline | **Notice date + 90 calendar days** when notice = yes and date present |
| Waiting | Notice = no → **Waiting for notice** — no invented deadline |
| Unsure | Notice = unsure → honest unsure — check servicer letter/email |
| First-wave cliff | **Sep 29 2026** earliest (ED June 2026 court filing / SLP; BI Sep 10) |
| Auto-enroll | If you do nothing → **Standard or Tiered Standard** (ED language — not a plan recommendation) |
| Pointers | StudentAid.gov/idr · studentaid.gov court-actions |
| Payment / plan | **Never invent** payment $ or “best” plan |

## Ads pathway (ad-only free utility — do not spend yet)

| Path | Notes |
|------|--------|
| **Revenue (primary)** | **AdSense / display under the card + “what is the SAVE 90-day transition notice?” explainer** (not inside the PNG). Inventory spikes Sep 15–Oct 15 and on each public notice-wave headline. Justified when sessions cover hosting. Free card forever — **no paywall**, no Gumroad. |
| **Brand-safe** | Informational clock + public ED / BI / SLP cites. **Not** plan-choice, consolidation, or forgiveness advice. Ads **not** inside PNG. **Hard avoid** private-refinance / debt-relief lead-gen affiliates. StudentAid.gov pointers only. |
| **Sponsorship (later)** | Optional nonprofit borrower-education sponsorship only if brand-safe. |
| **Acquisition (gated)** | Google “SAVE plan 90 day deadline September 29” / “SAVE auto enroll Standard repayment” + Reddit promo week of Sep 15. Creative = “Paste your notice date — days left before auto-enroll?”. Max CPA abort ~$0.30–0.50 without a completed share. Debit/cash only. **Spend only after one organic StudentLoans-thread test.** |
| **UTM** | Example: `?utm_source=reddit&utm_medium=organic&utm_campaign=save_90day_clock_mvp` |
| **Tracking** | Card gens + share clicks (GoatCounter path when Pages is live). |
| **Abort sketch** | Pause paid if CPA exceeds band without share / “how many days left?” replies. |

**No spend from this ready_for_pages step.** Ads are the monetization path (**ad-only OK**).

## Product constraints

- Single static site (no backend).
- **Flags only from user paste** (or labeled seeds). Never invent payment $, eligibility beyond paste, or a “best” plan.
- Brand: **SAVE 90-Day Transition Clock** only on surface.
- Days-left / Past deadline / Waiting for notice text-labeled (not color-only). Disclaimer always visible on page + share PNG.
- Share = URL hash + PNG + copy summary.
- No FSA login. No servicer scrape. No plan picker. No forgiveness advice. No sock farms.

## Files

| Path | Role |
|------|------|
| `index.html` | App shell (GitHub Pages entry) |
| `app.js` | Notice+90 math, auto-enroll strip, seeds, card, share hash, PNG |
| `styles.css` | SAVE 90-Day Transition Clock UI |
| `scripts/build.js` | `npm run build` → `dist/` |
| `scripts/verify.js` | `npm run verify` — Jul1→Sep29 + honest states |
| `package.json` | build / start / preview / verify scripts |

## Opportunity

Internal card: `opp_finance_save_90day_clock` (consumer finance / student loans).  
Experiment stub: `institutions/mde/experiments/exp_save_90day_clock.md`.
