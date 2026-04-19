# Project Awareness — GCR Context Doc

> This file lives at `.gcr/project-awareness.md` in the repo root.
> It is read by GCR before invoking any AI agent operation (code review, task matching, release notes).
> Keep it honest and concise — the AI uses this to calibrate its understanding of your codebase.

---

## What this project does

<!-- One paragraph. What does the product do? Who uses it? What problem does it solve? -->

Example:
> A B2B SaaS platform for managing video ad campaigns. Clients upload creatives, set targeting rules, and track performance. The main users are media buyers and account managers.

---

## Tech stack

<!-- List the primary technologies in use. Be specific about versions if they matter. -->

- **Runtime**: Node.js 20 / React Native 0.73
- **Frontend**: React, Zustand (state), React Query (data fetching)
- **Backend**: Express, Prisma ORM, PostgreSQL
- **Infrastructure**: AWS (EC2, S3, RDS), deployed via GitHub Actions

---

## Repository structure

<!-- Brief map of the repo. What lives where? Helps AI understand which files are relevant to a diff. -->

```
/
├── apps/
│   ├── mobile/        # React Native app
│   └── web/           # React web dashboard
├── packages/
│   ├── api/           # Express backend
│   ├── db/            # Prisma schema + migrations
│   └── shared/        # Shared types and utilities
└── .gcr/              # GCR configuration (this file lives here)
```

---

## Coding conventions

<!-- What does "good code" look like in this project? Be explicit. The AI will use this during review. -->

- We do not write tests (at this stage of the project)
- `console.log` statements are acceptable — do not flag them
- Commenting out code is acceptable — do not flag it
- TypeScript strict mode is off — loose types are okay for now
- We prefer functional components and hooks over class components
- API responses follow the shape `{ data, error, meta }` — flag deviations
- All DB queries go through Prisma — flag any raw SQL unless in a migration file

---

## What the AI should focus on during code review

<!-- Tell the AI what actually matters. What bugs have bitten you before? What patterns to watch for? -->

- Logic errors in business rules (billing, permissions, campaign targeting)
- Missing null/undefined checks on API response data before rendering
- Unhandled promise rejections — always `.catch()` or `await` in try/catch
- N+1 query patterns in loops that call the DB
- Hardcoded credentials, API keys, or environment-specific values in source
- Breaking changes to shared types in `/packages/shared` that affect multiple apps

---

## What the AI should ignore during code review

<!-- Explicitly suppress noise that would otherwise generate irrelevant comments. -->

- Missing JSDoc or inline comments
- `console.log` and `console.error` usage
- Commented-out code blocks
- Test file absence
- Minor style inconsistencies (we do not enforce a strict style guide via CI)

---

## Domain vocabulary

<!-- Key terms the AI should understand when reading diffs and matching ClickUp tasks. -->

| Term | Meaning |
|---|---|
| Creative | An uploaded video or image ad asset |
| Campaign | A collection of ad sets with a budget and schedule |
| Flight | A time-bounded period a campaign runs |
| Account | A client organisation in the system |
| Placement | Where an ad appears (e.g. pre-roll, banner) |

---

## Known sensitive areas

<!-- Parts of the codebase where mistakes are especially costly. AI should be more careful here. -->

- `/packages/api/src/billing/` — payment processing, treat with extra scrutiny
- `/packages/db/migrations/` — irreversible schema changes, flag any destructive ops
- `/apps/mobile/src/auth/` — session handling, token storage

---

## Notes for release notes generation

<!-- What tone and format do client-facing release notes use? -->

- Audience: non-technical client (Sagar) and product manager (Kushal)
- Tone: plain English, no jargon, benefit-focused ("You can now..." not "Implemented...")
- Format: short bullet points, grouped by feature vs bug fix
- Do not mention internal branch names, PR numbers, or developer names
