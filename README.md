# Hotelmode

A hotel product consumption recorder built with **Next.js 16**, **React 19**, and **Tailwind CSS 4**. Staff enter the remaining products used by guests during their stay, and each record is appended to a shared Excel file (`data.xlsx`). A separate product manager page keeps the catalog up to date without touching any code.

---

## Features

- **Guest Product Recording** — enter the products a guest has used (FS number, product, quantity) and save the record directly to Excel. Designed specifically for logging the rest of products consumed by guests.
- **Excel Output** — every saved entry is appended to `data.xlsx` with the product name, quantity, unit price, and total sum — ready to hand off or review without any extra processing.
- **Product Catalog Manager** — add, edit, or remove products and prices from the `/products` page. Changes are saved to `data/products.json` and instantly available in the entry form.
- **Dark / Light mode** — theme preference is stored in `localStorage` and respects the OS default on first visit.
- **Graceful fallback** — if `data/products.json` is empty or unreachable, the entry form falls back to a built-in product list so the app stays usable.

---

## Tech Stack

| Layer | Library / Tool |
|---|---|
| Framework | Next.js 16 (App Router) |
| UI | React 19 + Tailwind CSS 4 |
| Excel I/O | SheetJS (`xlsx` 0.18) |
| Language | TypeScript (pages) + JavaScript (API routes) |
| Runtime | Node.js (API routes use `runtime = "nodejs"`) |

---

## Project Structure

```
├── app/
│   ├── page.tsx                  # Home — Guest product entry form
│   ├── layout.tsx                # Root layout & metadata
│   ├── globals.css               # Global styles
│   ├── products/
│   │   └── page.tsx              # Product Manager page
│   └── api/
│       ├── products/
│       │   └── route.js          # GET / POST — read & update products.json
│       └── save/
│           └── route.js          # POST — append a row to data.xlsx
├── data/
│   └── products.json             # Product catalog (auto-created if missing)
├── data.xlsx                     # Excel workbook (auto-created on first save)
├── next.config.ts
├── package.json
└── tsconfig.json
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm (or yarn / pnpm)

### Install & Run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for Production

```bash
npm run build
npm start
```

---

## How It Works

### Entry Form (`/`)

1. Enter the guest's **FS** identifier.
2. Select the **Product** used from the dropdown (populated from `data/products.json`).
3. Choose the **Amount** (1 – 50).
4. Click **Save Entry**.

The API route (`POST /api/save`) looks up the product's unit price, calculates the total (`price × amount`), and appends a row to `data.xlsx`:

| fs | goods | amount | price | sums |
|---|---|---|---|---|

The FS field is preserved after saving so staff can quickly log multiple products for the same guest back to back.

### Product Manager (`/products`)

- Displays all products in an editable table with columns: **Value**, **Label**, **Excel Name**, **Price**.
- **Excel Name** is an optional override — when set, it is written to the `goods` column in the Excel file instead of the label.
- Click **Add product** to append a blank row, fill in the fields, then **Save changes** to persist to `data/products.json`.
- A stats bar shows the total product count, minimum price, and maximum price at a glance.

### API Routes

| Route | Method | Description |
|---|---|---|
| `/api/products` | `GET` | Returns the full product list from `data/products.json` |
| `/api/products` | `POST` | Upserts products by `value` key, sorts alphabetically, writes back to disk |
| `/api/save` | `POST` | Resolves product price, appends a row to `data.xlsx` |

---

## Data Files

Both data files are managed automatically:

- **`data/products.json`** — created as an empty array `[]` if it does not exist.
- **`data.xlsx`** — created as a new workbook on the first save if it does not exist.

> These files are excluded from version control via `.gitignore`. Back them up separately if needed.

---

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the development server |
| `npm run build` | Build for production |
| `npm start` | Start the production server |
| `npm run lint` | Run ESLint |
