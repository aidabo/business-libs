# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Package Overview

**`@ghost-next/estate`** — A React component library for real estate landing/business pages. Built as a Vite library targeting the StackPage page-builder system. Components are registered in the host app's `ComponentsProvider` via `EstateComponents` (component map) and `EstateDefaultProps` (default props map).

## Commands

```bash
# Development (Vite dev server)
yarn dev

# Build (type check + bundle)
yarn build                           # tsc && vite build

# Preview production build
yarn preview
```

## Architecture

### Component Pattern
- **14 presentational components** under `src/`, each a default-exported React FC with an exported `{ComponentName}Props` interface
- Every component accepts optional `backgroundColor`, `fontSize`, `className`, `style` props, merged as `{ backgroundColor, fontSize, ...style }`
- Components read translated text via `useT()` (custom hook, not react-i18next)

### Entry Point (`src/index.ts`)
Exports two named maps for StackPage integration:
- **`EstateComponents`** — component registry (used in `ComponentsProvider`)
- **`EstateDefaultProps`** — default props with realistic sample data (used in `componentPropsProvider`)
- Also re-exports `EstateProvider`

### Translation System
- **`src/contexts/EstateContext.tsx`** — React context providing `t: (key: string) => string`
- **`src/hooks/useTranslation.ts`** — thin `useT()` wrapper around the context
- Parent app wraps components with `<EstateProvider t={translateFn}>` where `translateFn` is locale-aware
- Falls back to returning the key itself if provider is missing (with a console.warn)

### Build Configuration
- **Vite library mode** — entry `src/index.ts`, name `Estate`, outputs `dist/estate.umd.js` + `dist/estate.es.js`
- **vite-plugin-dts** generates `dist/index.d.ts` with type declarations
- **tsc** runs first for type checking (`noEmit: true`), Vite handles bundling
- Externals: `react`, `react-dom`, `tailwindcss` (peer dependencies)
- Path alias: `@/*` → `./src/*`

### Components
| Component | Description |
|-----------|-------------|
| HeroSection | Full-width hero with background image, title, subtitle, optional search bar |
| PropertyCard | Property listing card (vertical or horizontal variant) |
| PropertyGrid | Grid layout of PropertyCards with configurable columns (2-4) |
| SearchBar | Inline search input with button |
| SearchResult | Search results grid with count header, empty state |
| AgentCard | Real estate agent profile card |
| InquiryForm | Contact form with name/email/phone/message, POSTs to `/api/estate/send-mail` |
| SaleHero | "Sell your home" hero section with CTA |
| SaleProcess | Step-by-step selling process |
| SaleInquiry | Property valuation request form |
| CompanyFeatures | Features/benefits section |
| ContactSection | Company contact info card |
| PromoBanner | Colored promotional banner with CTA |
| OfferDetail | Promotional offer detail with terms and expiration |
| EstateProvider | Context provider wrapping all components |

### State & Side Effects
- No global state library (local `useState` in form components)
- `InquiryForm` has built-in API call with loading/success/error states and auto-reset
- Components are fully controlled via props — no internal data fetching
