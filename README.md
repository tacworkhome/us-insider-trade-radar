# US Insider Trade Radar (demo)

An architecture showcase extracted from a real production SEC Form 4 insider-trading
signal product. All companies, insiders, and transactions shown are fictional
fixture data — this repository ships with **no database, no auth, and no external
API calls**; everything runs on mock JSON and an in-memory repository.

## Tech stack

- **Next.js 14** (App Router) + React 18 + TypeScript (strict mode)
- **Tailwind CSS** for styling
- **next-intl** for i18n (English locale wired end-to-end; add another locale by
  dropping a `locales/<code>/common.json` file)
- **lightweight-charts** for the price/insider-trade chart, **Recharts** for the
  monthly buy/sell bar chart
- **Vitest** for unit tests
- **pnpm workspaces** monorepo: `apps/web` + `packages/shared`

## Architecture

```
UI (React components)
  -> ViewModel (React hook, e.g. useWatchlistViewModel)
    -> Application (use cases: AddToWatchlistUseCase, GetWatchlistUseCase, ...)
      -> Domain (WatchlistItem entity, value objects, repository interface)
        -> Infrastructure (InMemoryWatchlistRepository) -> in-memory Map
```

The watchlist feature is the fullest illustration of this: a domain entity and
value objects with invariants, application-layer use cases that orchestrate
them, a repository **interface** the application layer depends on, and an
in-memory repository that implements it — the same shape a real
Postgres/Supabase-backed repository would take, just swapped for a `Map`.

- `packages/shared/domain/watchlist/` — entity, value objects, repository
  interface, domain errors
- `packages/shared/application/watchlist/` — use cases, DTOs, mapper, limit
  service
- `packages/shared/infrastructure/watchlist/` — `InMemoryWatchlistRepository`
  (swap-in replacement for a real database-backed implementation)
- `packages/shared/presentation/watchlist/` — `useWatchlistViewModel` hook +
  a small DI container so tests/components can inject their own repository
- `apps/web/src/features/watchlist/components/` — UI components consuming
  the ViewModel

The signals and company-report slices follow the same UI → data flow, backed
by deterministic mock fixtures instead of a live pipeline
(`apps/web/src/mocks/`).

### On the "confidence score" and signal weights

`packages/shared/application/company/use-cases/GenerateCompanyReportUseCase.ts`
reproduces the *shape* of a rule-based insider-signal detector (cluster
buying, repeat buyers, buying-only windows, increasing purchase size) —
these are well-known, publicly-documented heuristics. The **scoring weights**
in `computeScore()` are explicitly simplified placeholders for this demo and
are called out in a comment; they are not the production system's actual
(proprietary) weighting.

## Highlights

- **Clean Architecture layering** — domain has zero framework/IO
  dependencies; application depends only on domain interfaces;
  infrastructure implements those interfaces; presentation/UI depends on
  application, never the other way around.
- **Repository pattern** — `IWatchlistRepository` is defined in the domain
  layer and implemented by `InMemoryWatchlistRepository` in this repo. A
  production deployment would swap in a database-backed implementation
  without touching a single use case.
- **TDD** — domain, application, and infrastructure code all ship with unit
  tests (43 tests total) written against the same interfaces the
  implementation exposes.
- **Strict TypeScript** — `strict: true`, `noUncheckedIndexedAccess: true`,
  no `any` in the ported code.

## Running locally

```bash
pnpm install
pnpm dev        # starts apps/web on http://localhost:3300
```

No environment variables are required — see `.env.example` for what a real
deployment would configure (all values in this demo are unused placeholders).

Pages:
- `/en` — landing page
- `/en/signals` — cluster-buy signal table (mock data)
- `/en/company/0009990001/report` — company insider-activity report + price
  chart with insider buy/sell markers
- `/en/watchlist` — add/remove companies or insiders, backed by the
  in-memory repository

## Running tests

```bash
pnpm test       # runs packages/shared's Vitest suite
```

## Project layout

```
apps/web/                      Next.js app router
  src/app/[locale]/            routed pages (signals, company report, watchlist)
  src/components/charts/       StockLineChart, InsiderActivityChart
  src/features/watchlist/      watchlist UI components
  src/mocks/                   fixture data (signals, company/price/transactions)
packages/shared/
  domain/watchlist/            entity, value objects, repository interface, errors
  application/watchlist/       use cases, DTOs, mapper, limit service
  application/company/         rule-based report use case (demo weights)
  infrastructure/watchlist/    in-memory repository implementations
  presentation/watchlist/      ViewModel hook + DI container
  types/, utils/               shared formatting/domain-adjacent helpers
locales/en/                    i18n message catalog
```
