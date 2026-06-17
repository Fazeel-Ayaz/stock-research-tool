# Stock Research Tool

A personal stock investment research platform that analyzes publicly traded companies in **30 seconds**. Uses three independent valuation methods, automated business health checks, and macro context to inform investment decisions.

**Live Demo:** https://animated-snickerdoodle-de9280.netlify.app

---

## Features

### 📊 Valuation Analysis
- **P/E Method** — fair value based on earnings multiple (scaled to growth rate)
- **P/S Method** — fair value based on revenue multiple (scaled to profit margin)
- **EV/EBITDA Method** — enterprise value relative to operating profit (scaled to growth)
- **Analyst Target** — Wall Street consensus from Yahoo Finance
- **Margin of Safety** — discount/premium vs fair value

### 🏥 Business Health Check
- Revenue growth trend
- Profitability (EBITDA/gross margin)
- Debt level (vs EBITDA)
- Net profitability
- 0-10 health score with automated red flag detection

### 🌍 Macro Environment
- Federal Funds Rate
- 10-Year Treasury Yield
- CPI (inflation)
- Unemployment Rate
- Plain-English signals on market conditions

### 📰 Latest News
- Recent headlines with sentiment tagging (positive/negative/neutral)
- Source attribution and publish dates

### 📱 Mobile-First Design
- Fully responsive layout (desktop, tablet, mobile)
- Zero horizontal scrolling
- Touch-optimized inputs

### 💾 Notion Integration
- Automatically logs every analysis to a Notion database
- Tracks ticker, decision, fair value, health score, margin of safety, red flags
- Personal research archive over time

---

## Tech Stack

**Frontend**
- React 18 + Vite (fast dev server, ES modules)
- Tailwind CSS (utility-first, responsive)
- Tabler Icons (clean icon library)

**APIs & Data**
- Finnhub (stock fundamentals, metrics, news) — free tier
- Yahoo Finance (analyst targets) — free, no key needed
- Notion API (logging/archival)

**Deployment**
- Vercel (frontend) — auto-deploys on GitHub push
- Supabase Edge Functions (API proxies) — runs Finnhub & Yahoo Finance calls server-side to hide API keys

**Architecture**
```
├── src/
│   ├── components/      # React components (TickerInput, Report, sections)
│   ├── hooks/           # useAnalysis (data fetching orchestration)
│   ├── lib/
│   │   ├── fmp.js       # Finnhub data layer
│   │   ├── analysis.js  # Valuation logic, health checks, decision engine
│   │   └── notion.js    # Notion API integration
│   └── index.css        # Tailwind + custom animations
├── supabase/functions/  # Edge Function proxies
│   ├── finnhub-proxy/   # Finnhub API proxy (injects API key server-side)
│   └── yf-proxy/        # Yahoo Finance proxy (bypasses CORS)
└── vite.config.js       # Dev proxy for local testing
```

---

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- Finnhub API key (free at [finnhub.io](https://finnhub.io))
- Notion API token (optional, for logging)
- Supabase project (optional, for production deployment)

### Local Setup

1. **Clone the repo**
   ```bash
   git clone https://github.com/Fazeel-Ayaz/stock-research-tool.git
   cd stock-research-tool
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create `.env` file**
   ```
   VITE_FH_API_KEY=your_finnhub_key
   VITE_NOTION_TOKEN=your_notion_token (optional)
   VITE_NOTION_DATABASE_ID=bdb4c00c9ff54bb8ba649ffbe3ccb7b5 (if using Notion)
   VITE_SUPABASE_URL=https://your-project.supabase.co (production only)
   VITE_SUPABASE_ANON_KEY=your_anon_key (production only)
   ```

4. **Start dev server**
   ```bash
   npm run dev
   ```
   Opens at http://localhost:5173

5. **Build for production**
   ```bash
   npm run build
   # Output in `dist/` directory
   ```

---

## How It Works

### Valuation Logic

The tool calculates **fair value** by averaging three independent methods:

1. **P/E Method**
   - Derives EPS from current price ÷ P/E ratio (both reliable on free tier)
   - Target P/E scales with growth rate
     - Revenue growth ≥25% → target P/E = min(current × 0.95, 55)
     - Revenue growth 15–25% → target P/E = min(current × 0.90, 38)
     - Revenue growth 8–15% → target P/E = min(current × 0.85, 25)
     - Revenue growth <8% → target P/E = min(current × 0.80, 18)
   - Fair value = EPS × target P/E

2. **P/S Method**
   - Target P/S scales with profit margin
     - Margin ≥35% → 10x (e.g., MSFT)
     - Margin 25–35% → 7x (e.g., Google)
     - Margin 15–25% → 4.5x
     - Margin 5–15% → 2.5x
     - Margin <5% → 1.5x
   - Fair value = (Revenue ÷ shares) × target P/S

3. **EV/EBITDA Method**
   - Target multiple scales with growth rate
     - Revenue growth ≥25% → 25x
     - Revenue growth 18–25% → 20x
     - Revenue growth 12–18% → 16x
     - Revenue growth 6–12% → 12x
     - Revenue growth <6% → 9x
   - Fair value = (EBITDA × target multiple - net debt) ÷ shares

4. **Analyst Target** (Wall Street consensus)
   - Sourced from Yahoo Finance
   - Average 12-month price target
   - Best-effort (some stocks may not have coverage)

**Final Fair Value** = average of available estimates

### Decision Logic

| Decision | Criteria |
|----------|----------|
| **BUY** | Margin of safety ≥25% AND health score ≥7 |
| **CONDITIONAL** | Margin of safety ≥15% AND health score ≥5 |
| **HOLD** | Stock is fairly valued (MoS near 0%) |
| **AVOID** | Stock ≥5% overvalued OR health score <5 with red flags |

---

## Limitations

- **Not for banks/REITs/utilities** — valuation framework is calibrated for mainstream equities
- **EBITDA approximation** — Finnhub free tier doesn't provide EBITDA margin directly; uses operating margin as proxy
- **Trailing data** — uses TTM (trailing twelve months); forward guidance not included
- **Analyst targets optional** — if Yahoo Finance is rate-limited, fair value averages 3 methods instead of 4
- **Fair value is a range** — the tool uses conservative assumptions; two analysts can reach different conclusions with the same data

---

## Deployment

### Vercel (Frontend)

1. Push code to GitHub
2. Go to [vercel.com](https://vercel.com) → New Project
3. Import your GitHub repo
4. Add environment variables (Settings → Environment Variables):
   - `VITE_FH_API_KEY`
   - `VITE_NOTION_TOKEN`
   - `VITE_NOTION_DATABASE_ID`
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
5. Click Deploy

Automatic redeploy on every GitHub push.

### Supabase Edge Functions (API Proxies)

1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Install Supabase CLI: `brew install supabase/tap/supabase`
3. Link your project:
   ```bash
   supabase login
   supabase link --project-ref your-project-ref
   ```
4. Set the Finnhub API key as a secret:
   ```bash
   supabase secrets set FINNHUB_API_KEY=your_finnhub_key
   ```
5. Deploy the functions:
   ```bash
   supabase functions deploy finnhub-proxy --no-verify-jwt
   supabase functions deploy yf-proxy --no-verify-jwt
   ```
6. Update `.env` with your Supabase URL and anon key

---

## Disclaimer

**This tool is for educational and personal research purposes only.** It is not financial advice. Fair value estimates use simplified models with assumptions that may not apply to all companies or sectors. Always verify independently before making investment decisions. Past performance does not guarantee future results.

---

## License

MIT — feel free to fork, modify, and use for personal projects.

---

## Contact & Feedback

- **GitHub Issues:** Report bugs or suggest features
- **Live Demo:** https://animated-snickerdoodle-de9280.netlify.app

---

**Built during Vibe Coding World Cup 2026**
