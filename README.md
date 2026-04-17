# FootballHub

FootballHub is a football companion web app built around a single-club experience.

Instead of asking users to follow multiple favorite teams, the current product starts with one decision: choose one club at the beginning, then load a focused dashboard centered entirely on that team. The app is designed to make the experience feel personal, calm, and context-driven rather than like a generic fixture list.

---

## Overview

The project explores a product question more than a pure data question:

- What should a fan see first when they open a football app?
- How can one team page feel like a daily destination instead of just a stats dump?
- How can standings pressure, form, and upcoming fixtures be surfaced without overwhelming the user?

FootballHub answers those questions with a selected-team flow, a club dashboard, and a lightweight rules-based context layer.

---

## Current State

The app currently includes:

- **Single-team onboarding**
  - On first load, the user chooses one club from the supported leagues.
- **Selected-team persistence**
  - The chosen club is stored locally so returning users are brought back into their team experience.
- **Club dashboard**
  - The main page loads data specifically for the selected club, including summary context, recent form, upcoming fixtures, standings position, and squad information.
- **Team-themed experience**
  - The interface adapts styling and presentation around the selected club.
- **Standings view**
  - Users can open a league table that supports the selected-team experience rather than replacing it.

Right now the experience is intentionally focused: enter the app, choose a club, and stay inside that club's daily dashboard.

---

## Product Direction

The current direction for FootballHub is:

> a football app that helps one fan follow one team more intelligently every day.

That means the product is less about broad browsing across many teams and more about creating a premium-feeling dashboard for a user's chosen club.

The current implementation emphasizes:

- a strong first-run team selection flow
- a focused club dashboard
- concise context cards powered by match and standings data
- a simple summary layer that explains why the current moment matters

---

## Why It Was Built This Way

A few design decisions shape the current version:

### 1. One team, not many

The app no longer centers on multiple favorites. Choosing one club creates a clearer product identity and makes the homepage feel more intentional.

### 2. Context over volume

Rather than showing everything from every competition, the app tries to surface the most relevant information for the selected club.

### 3. Dashboard as the main destination

The selected team's page is the product. Navigation and supporting pages exist to strengthen that experience, not to compete with it.

### 4. Practical API usage

FootballHub uses the free football-data.org API tier, so the app is built to stay useful while keeping requests relatively efficient.

---

## Technical Stack

- **Frontend:** React + Vite
- **Data Fetching / Caching:** TanStack Query
- **Styling:** Tailwind CSS
- **Routing:** React Router
- **Icons:** Lucide React
- **Data Source:** football-data.org

---

## Current User Flow

1. Open the app.
2. Choose one club from the supported leagues.
3. Enter a club dashboard tailored to that team.
4. Review summary context, standings pressure, upcoming matches, and squad information.
5. Return later and continue from the same selected club.

---

## Supported Experience

At the moment, the main experience is built around clubs from:

- Premier League
- La Liga

The selected club drives the dashboard content and, where available, the related standings context.

---

## Constraints and Tradeoffs

This project intentionally works within a few limitations:

- The app uses a **free API tier**, so requests need to stay efficient.
- The summary/context layer is **rules-based**, not predictive or AI-driven.
- The product is intentionally **single-team-first**, so broader multi-team exploration is no longer the primary use case.
- Some sections remain intentionally lightweight because the current API does not provide richer event or player-performance depth.

These constraints help keep the project realistic while still allowing the product direction to feel distinct.

---

## What Could Be Improved Next

Some natural next steps for the project would be:

### Smarter team context

- better interpretation of recent form
- stronger match importance logic
- more nuanced standings-pressure narratives
- richer editorial-style summaries

### Stronger preference management

- easier switching between selected clubs
- clearer re-selection or reset controls
- better first-run explanation of what the dashboard includes

### Richer club pages

- expanded squad details
- more match-by-match context
- additional competition coverage where the data supports it

### Production polish

- stronger error states and empty states
- more loading skeletons
- better test coverage
- a backend/cache layer to reduce direct client-side API pressure

---

## Why This Project Matters to Me

The goal of FootballHub is not just to display football data. The goal is to shape that data into an experience that feels focused, personal, and worth revisiting.

That is why the project currently emphasizes:

- product flow
- information hierarchy
- club identity
- contextual summaries

more than breadth for its own sake.

---

## Screenshots

![Homepage - Header](./screenshots/home-1.png)
![Club Dashboard](./screenshots/home-2.png)
![Today Context](./screenshots/home-3.png)
![League Selection View](./screenshots/home-4.png)
![Standings Page](./screenshots/teams-page.png)
![Team Selection](./screenshots/favorites-selection.png)

---

## Live Demo

<!-- Add deployed demo link here -->
<!-- Example:
https://footballhub.vercel.app
-->

---

## Installation

```bash
git clone https://github.com/bryanpartida/footballhub.git
cd footballhub
npm install
npm run dev
```

---

## Environment Variables

Create a `.env.local` file in the project root:

```bash
VITE_FOOTBALL_DATA_TOKEN=your_api_key_here
```
