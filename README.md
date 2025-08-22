# Inventory System — Local Storage Prototype

Lightweight React + Vite inventory prototype that stores items in the browser (Local Storage). Designed for demo and small-site usage: create, view, edit items, upload photos (saved as base64), generate printable QR codes (photo excluded), and view dashboard statistics.

## Features
- Create, read, update items saved to Local Storage.
- Upload an item photo (stored as base64).
- Generate printable QR codes for items (QR payload excludes photo data).
- Dashboard highlights items with missing required fields.
- Minimal, client-only app (no server required).

## Tech stack
- React 19 + Vite
- react-router-dom — routing
- qrcode.react — QR generation
- react-toastify — notifications
- Local Storage — persistent client-side storage

## Prerequisites
- Node.js v16+ and npm installed.

## Setup & run
1. Install dependencies
   - npm install

2. Start dev server
   - npm run dev

3. Open the app
   - Visit the URL shown by Vite (commonly http://localhost:5173)

## Available npm scripts
- npm run dev — start Vite dev server
- npm run build — build for production
- npm run preview — preview built app
- npm run lint — run ESLint

## Project layout (important files)
- index.html — app entry HTML
- src/main.jsx — React entry
- src/App.jsx — routes and layout
- src/App.css — app styles
- src/services/api.js — Local Storage API (CRUD + dashboard stats)
- src/pages/DashboardPage.jsx — dashboard & actionable list
- src/pages/ItemListPage.jsx — searchable list of items
- src/pages/ItemFormPage.jsx — create / edit / view item; photo upload; QR & print

## How the app works (concise)
- Data storage:
  - All items are stored under a single Local Storage key: `spring8_inventory_items`.
  - services/api.js provides read/write helpers and higher-level functions (getItems, getItem, createItem, updateItem, getDashboardStats).
- Item lifecycle:
  - Create: fill the form, optionally upload photo, save → app navigates to the saved item's view where you can print QR.
  - Edit: open an existing item, click "Edit Item", save → form switches to view mode.
  - View: read-only presentation with QR and photo preview (if present).
- QR generation:
  - The QR payload is a human-readable string built from item fields.
  - The photo of the item clicked with QR code pasted on it ,  is uploaded in the system later using the edit option .

## Important behavior notes
- Photo storage: photos are saved as base64 in Local Storage. Large images can fill Local Storage quickly — prefer small/resized photos.
- QR excludes photo: scanning produced QR codes will not contain or display the photo.
- Date handling: the purchase date uses YYYY-MM-DD and the create/edit logic ensures proper formatting.
- Dashboard reporting: items with missing photo, QR, location, or required final asset number (for high-value items) are flagged.

## Common workflows
- Register new item:
  1. Click "Register New Item".
  2. Fill fields. Upload a photo if needed (photo saved to Local Storage only).
  3. Click Save → you are redirected to the item view page with QR + Print option.
- Edit an item:
  1. Open item from list or dashboard.
  2. Click "Edit Item", make changes, Save → view mode returns and Print becomes available.
- Print QR:
  - From the item view page click "Print QR". The printed page shows item name, QR number and the QR graphic.

## Inspecting data & manual debugging

- Use the Console for errors; react-toastify will show user-facing messages.

## Troubleshooting
- Nothing displays on the list: confirm Local Storage entry exists and has valid JSON.
- QR not printing: ensure the item has a `qr_number` and you are on the item view (not edit) mode.
- Local Storage quota exceeded: remove large images or clear items to free space.

## Testing tips
- Manual: create items with/without photos, verify the dashboard flags missing fields, and scan a printed QR to confirm the payload contains no image.
- Linting: npm run lint


