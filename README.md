# Customer Status Dashboard

Prototype web dashboard for Marketing and Supervisor teams using mock customer data only.

## Tech Stack

- React with Vite
- Tailwind CSS
- Recharts
- lucide-react icons
- Mock data array object only, no backend, no database, no real airline data

## Run Locally

```bash
npm install
npm run dev
```

Open the local URL shown by Vite, usually `http://127.0.0.1:5173`.

## Important Files

- `src/data/mockCustomers.js` contains all mock customer records.
- `src/App.jsx` contains the dashboard UI, filters, KPI calculation, table, detail card, and charts.
- `src/styles.css` loads Tailwind CSS and base font styling.

## Beginner Notes

- Filters use React `useState` to store search text, selected status, and selected risk level.
- `useMemo` recalculates the filtered customer list only when the filter values change.
- KPI cards and charts are calculated from `mockCustomers` so the same data drives the whole prototype.
