# FridgeChef — Codex Handoff Context

## Project Overview
FridgeChef is an AI-powered recipe discovery web app targeting US health & fitness market.
Users select/scan ingredients → AI generates recipes with nutrition facts, fitness tips, seasoning.

**Live URL:** https://fridgechef-blush.vercel.app  
**GitHub:** https://github.com/o165027096/fridgechef  
**Branch:** `main` (auto-deploys to Vercel Production)

---

## Tech Stack
- **Frontend:** Single HTML file (`public/index.html`) — plain HTML/CSS/JS, no frameworks
- **Backend:** Node.js serverless functions on Vercel (`api/` folder)
- **AI:** OpenAI `gpt-4o-mini` (recipes) + `gpt-4o` (fridge scan vision)
- **Cache:** Upstash Redis (server-side, 30-day TTL, saves tokens on repeated searches)
- **Client cache:** localStorage (7-day TTL, secondary layer)
- **Hosting:** Vercel (Hobby plan)

---

## Environment Variables (set in Vercel Dashboard)
```
OPENAI_API_KEY=sk-...
UPSTASH_REDIS_REST_URL=https://desired-albacore-93675.upstash.io
UPSTASH_REDIS_REST_TOKEN=...
```
Future (Week 2):
```
STRIPE_SECRET_KEY=sk_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

---

## File Structure
```
fridgechef/
├── public/
│   └── index.html          # Entire frontend (HTML + CSS + JS in one file)
├── api/
│   ├── recipes.js          # POST /api/recipes — OpenAI gpt-4o-mini recipe generation
│   ├── scan.js             # POST /api/scan — OpenAI gpt-4o vision fridge scan
│   ├── create-checkout.js  # TODO: Stripe checkout session (Phase 2)
│   ├── webhook.js          # TODO: Stripe webhook handler (Phase 2)
│   └── pro-status.js       # TODO: Check Pro subscription status (Phase 2)
├── vercel.json             # Routing + function timeout config
└── .env                    # Local dev only (not committed)
```

---

## What's Already Built (v2 Complete)

### Frontend Features
- [x] Daily Nutrition Tracker bar (always visible, calories/protein/carbs/fat progress bars)
- [x] Settings modal — set daily calorie/macro targets (stored in localStorage)
- [x] Fitness Goal selector — All / Lose Weight / Build Muscle / Maintain / Keto
- [x] Fridge photo scanner — tap to upload photo, AI detects ingredients
- [x] Ingredient tag selector (preset + manual add + AI-detected tags)
- [x] Dietary preference — Any / Low Calorie / Vegetarian / High Protein
- [x] Recipe count selector — 5 or 10 recipes
- [x] Per-page selector — 5 or 10 per page
- [x] Pagination with Prev/Next buttons
- [x] **Recipe cards — tap to open full-screen detail modal**
- [x] Recipe detail modal shows: description, fitness tip, nutrition facts panel (US label style), ingredient pills with quantities, seasoning pills with exact measurements, numbered instructions
- [x] "Log this meal" button — adds nutrition to daily tracker, persists across pagination
- [x] Amazon affiliate links per recipe (`tag=fridgechef-20` — REPLACE with real tag)
- [x] **★ 我的食譜 (Saved Recipes)** — save any recipe, accessible from home screen
- [x] **🔄 換一批 (Variety Refresh)** — bypass cache, generate different recipes
- [x] Freemium gate — 3 free recipe generations/day (localStorage)
- [x] Paywall modal on 4th attempt (UI complete, Stripe not yet connected)
- [x] Dark theme (#0f0f0f background, #1D9E75 primary green, 390px max-width)

### Backend Features
- [x] `POST /api/recipes` — OpenAI gpt-4o-mini, returns full recipe data
- [x] `POST /api/scan` — OpenAI gpt-4o vision, returns ingredient list
- [x] Server-side Redis cache (Upstash) — 30-day TTL, keyed by sorted ingredients+diet+goal+count
- [x] `variety=true` param bypasses cache and adds diverse prompt instruction
- [x] Vercel function timeouts: recipes=60s, scan=30s

### API Response Format (recipes)
```json
{
  "recipes": [{
    "name": "Recipe Name",
    "time": "25 mins",
    "difficulty": "Easy",
    "servings": 2,
    "description": "One sentence overview.",
    "fitness_tip": "Why this suits the fitness goal.",
    "ingredients": ["200g chicken breast", "2 cups rice"],
    "seasoning": ["1 tsp salt", "2 tbsp soy sauce"],
    "nutrition": {
      "calories": 450, "protein": 38, "carbs": 42,
      "fat": 9, "fiber": 3, "sugar": 2
    },
    "steps": ["Step 1.", "Step 2."]
  }],
  "fromCache": true
}
```

### localStorage Keys
| Key | Description |
|-----|-------------|
| `fc_goals` | `{calories, protein, carbs, fat}` — daily targets |
| `fc_logged_today` | `{date, items:[nutrition]}` — today's logged meals |
| `fc_daily_usage` | `{date, count}` — free usage counter (resets daily) |
| `fc_is_pro` | `"true"` \| `"false"` — Pro status |
| `fc_saved_recipes` | Array of full recipe objects — saved recipes |
| `fc_cache_*` | Client-side recipe cache (7-day TTL) |

---

## What's NOT Done Yet

### Week 2 — Stripe Integration (Priority)
- [ ] `api/create-checkout.js` — Stripe checkout session for $4.99/month Pro
- [ ] `api/webhook.js` — Stripe webhook to set Pro status in Upstash Redis
- [ ] `api/pro-status.js` — Frontend polls this on load to sync localStorage `fc_is_pro`
- [ ] Pro status should be stored in Upstash Redis (key: `pro:{user_identifier}`)
- [ ] Note: currently no user accounts, need to decide identifier (email from Stripe, device ID, etc.)

### Phase 2 — Nice to Have
- [ ] User accounts (authentication)
- [ ] Sync saved recipes to server (currently localStorage only)
- [ ] Weekly meal planner (7-day calendar drag-and-drop)
- [ ] Instacart/Walmart one-click ingredient ordering
- [ ] Social sharing (recipe card as image to Instagram/TikTok)
- [ ] Push notifications

---

## Monetization Status
| Stream | Status | Notes |
|--------|--------|-------|
| Amazon Associates | ⚠️ Needs real tag | Replace `fridgechef-20` in index.html with your actual Amazon Associates tag. Register at affiliate-program.amazon.com. Commission: ~1% grocery, ~4.5% kitchen |
| Stripe Pro $4.99/mo | ⚠️ UI done, backend TODO | Paywall modal triggers after 3 free uses/day. Needs Stripe integration (Week 2) |

---

## Design System
| Token | Value |
|-------|-------|
| Background | #0f0f0f |
| Surface | #1a1a1a |
| Primary green | #1D9E75 |
| Light green | #5DCAA5 |
| Protein blue | #378ADD |
| Carbs amber | #EF9F27 |
| Fat pink | #D4537E |
| Text secondary | #888888 |
| Max width | 390px |

---

## Key Architectural Decisions
1. **Single HTML file** — all frontend in `public/index.html`. No build step, no bundler.
2. **Two-layer cache** — localStorage (client) + Upstash Redis (server). Server cache saves tokens for all users searching same combination.
3. **No user database** — Phase 1 is localStorage-only. Saved recipes and usage tracking are device-local.
4. **Variety bypass** — `variety=true` skips Redis cache and adds diverse instruction to prompt, giving different results for same ingredients.
5. **All text in English** — UI labels are English, recipe content is English.

---

## Next Steps for Codex
1. Implement Stripe integration (see Week 2 above)
2. Replace Amazon tag `fridgechef-20` with real Associates tag
3. Consider adding user ID system before Stripe (email-based or anonymous device ID)
