# FuelIQ 🏃 — AI-Powered Running Nutrition Coach

FuelIQ is a mobile-first React app that gives runners personalized pre, during, and post-run fueling plans powered by Claude AI. It learns from your post-run journals and adapts future recommendations to your body.

---

## Features

- **AI Fuel Plans** — personalized 6-window nutrition plans (2hr before → recovery)
- **Allergy-Safe** — 11 allergens flagged at profile setup; AI never recommends them
- **Post-Run Journal** — log exactly what you ate + rate performance, stomach, energy, hydration
- **AI Feedback** — coach analyzes your journal and gives specific actionable insights
- **Learning Loop** — past journal data feeds into every future fuel plan
- **Run History** — all runs + journals saved locally, expandable cards
- **Mobile-first** — clean white/black/red design, bottom tab bar, sticky headers

---

## Folder Structure

```
fueliq/
├── public/
│   └── index.html              # App shell HTML
├── src/
│   ├── App.jsx                 # Root router + state manager
│   ├── index.js                # React entry point
│   ├── index.css               # All global styles + design tokens
│   ├── components/
│   │   └── Shared.jsx          # Reusable UI: TabBar, ChipGroup, FuelCard, Avatar, etc.
│   ├── screens/
│   │   ├── OnboardScreen.jsx   # Welcome / splash
│   │   ├── ProfileScreen.jsx   # Setup: name, allergies, goals, dietary prefs
│   │   ├── DashboardScreen.jsx # Home: stats, CTA cards, recent runs
│   │   ├── PlannerScreen.jsx   # Run input form
│   │   ├── ResultsScreen.jsx   # AI-generated fuel plan (6 collapsible cards)
│   │   ├── JournalScreen.jsx   # Post-run food log + feel ratings + AI feedback
│   │   ├── HistoryScreen.jsx   # All past runs + expandable journals
│   │   └── SettingsScreen.jsx  # Notifications, allergy summary, clear data
│   └── utils/
│       └── storage.js          # localStorage helpers + Anthropic API calls
└── package.json
```

---

## Setup & Installation

### Prerequisites
- Node.js 16+ and npm
- An Anthropic API key (get one at https://console.anthropic.com)

### 1. Install dependencies

```bash
cd fueliq
npm install
```

### 2. Add your API key

For Vercel, add your key as a server-side environment variable:

```bash
ANTHROPIC_API_KEY=your_key_here
ANTHROPIC_MODEL=claude-sonnet-4-20250514
```

The app includes `api/anthropic.js`, a Vercel serverless function that calls Anthropic without exposing your key in browser code.

For local development without a backend, the app still works with fallback fuel plans. If you want live AI locally, run through Vercel dev or add your key as `REACT_APP_ANTHROPIC_KEY` knowing that client-side keys are visible in the browser.

### 3. Run the app

```bash
npm start
```

Opens at `http://localhost:3000`

### 4. Build for production

```bash
npm run build
```

Output goes to `/build` — deploy to Vercel, Netlify, or any static host.

---

## Deploying to Vercel (Recommended)

1. Push this folder to a GitHub repo, or drag the folder into Vercel.
2. Go to [vercel.com](https://vercel.com) → Add New → Project.
3. Select the project. Vercel should detect Create React App.
4. Add environment variable: `ANTHROPIC_API_KEY=your_key`.
5. Optionally add: `ANTHROPIC_MODEL=claude-sonnet-4-20250514`.
6. Deploy.

---

## Using a Backend Proxy (Production Best Practice)

This project already includes the proxy at `api/anthropic.js`. `src/utils/storage.js` calls `/api/anthropic` when no client-side development key is present.

---

## How the AI Learning Works

Every time you submit a Post-Run Journal:
1. Your ratings (performance, stomach, energy, hydration) and food log are saved to localStorage
2. The next time you generate a fuel plan, the last 6 journals are summarized and included in the AI prompt
3. Claude reads the patterns — e.g. "GI issues on high-intensity runs, energy crash at mile 8" — and adjusts food timing, portion sizes, and product recommendations accordingly

The more you journal, the smarter FuelIQ gets.

---

## Allergen Safety

At profile setup you select from 11 common allergens plus a free-text field. These are stored in your profile and injected into every AI prompt as a hard constraint:

> "CRITICAL — NEVER recommend these allergens: Peanuts, Dairy / Lactose. Non-negotiable for safety."

The AI feedback after journaling also flags if anything you ate could have triggered a reaction.

---

## Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| react | 18.x | UI framework |
| react-dom | 18.x | DOM rendering |
| react-scripts | 5.x | Create React App build tooling |

No other dependencies. No UI library. Pure CSS custom design system.

---

## License

MIT — build on it, ship it, make it yours.
