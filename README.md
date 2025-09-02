# Notebook Budget

A cozy, hand‑written, notebook‑style money tracker. It smells like paper, flips like pages, and keeps your budget tidy without feeling like a spreadsheet.

## ✨ Highlights
- Double red margin lines and blue page rules for a real notebook vibe
- Smooth, page‑turn style tab transitions (snappy and gentle)
- Zero visual clutter: no hard borders, clean ink-like UI
- Mobile friendly from day one

## 📒 Home (Entries)
- Add Income/Expense with a single click
- Entries sorted in ascending date order (oldest → newest)
- Inline edit/delete
- Smart currency formatting (INR)
- Dates appear before the red margin lines (like notes in the margin!)

## 📈 Analytics
- Overview lines for Planned vs Actual (Income, Expense, Net)
- Category Breakdown stacked right under the overview (no extra tab)
- Simple, visible colors and clean tooltips

## 💡 Budget Planning
- Per‑category budgets with notebook‑style inputs (transparent, no chrome)
- Earned vs Spent labeling (Salary/Freelance count as Earned)
- Remaining/Left calculations per category
- Budget vs Actual bar chart (vivid colors and crisp lines)

## ⚙️ Settings
- Add/remove categories fast
- Import/Export all data as JSON (backup, sync, share)
- Clear all data (with confirmation)

## 🗃️ Data & Storage
- Local‑first: everything stored in the browser (localStorage)
- Export → a single JSON you can keep anywhere
- Import → drop the JSON back in and keep rolling

## 🧠 Quality of Life
- ResizeObserver warnings squashed for quieter consoles
- Light but expressive animations
- Intentional spacing so text starts after the double red lines

## 🛠️ Tech Stack
- React + TypeScript + Vite
- Tailwind + shadcn/ui components
- framer‑motion animations
- Recharts for graphs
- date‑fns for friendly dates

## 🚀 Local Development
- pnpm install
- pnpm dev (opens at http://localhost:8080)

Build output lives in `dist/spa`.

## 🔐 Notes
- No secrets in code; if you need environment vars, add them at deploy time.

Happy budgeting — and doodling in the margins! ✍️📘
