# Dispatch Solar Mapper

Local full-stack take-home app for mapping candidate U.S. sites, resolving addresses to coordinates, and estimating solar production with NREL PVWatts.

## Stack

- Frontend: React + Vite + React Router + Leaflet (`react-leaflet`)
- Backend: Node.js + Express
- External APIs:
  - OpenStreetMap Nominatim (address geocoding)
  - NREL Solar Resource API
  - NREL PVWatts v8

## Project structure

```text
dispatch-solar-mapper/
├── client/
│   └── src/
│       ├── api/
│       ├── components/
│       └── pages/
├── server/
│   ├── data/
│   ├── routes/
│   ├── services/
│   └── types/
├── package.json
└── readme.md
```

## Architecture notes

### Backend layering

- `routes/` handles HTTP concerns only (status codes + response mapping)
- `services/` contains business flow and provider adapters:
  - `siteRegistry.js` -> load site records from `server/data/sites.json`
  - `geocoding.js` -> address to lat/lng
  - `solarResource.js` -> NREL solar resource fetch
  - `pvwatts.js` -> NREL PVWatts fetch
  - `siteList.js` / `siteDetail.js` -> orchestration use-cases
- `types/errors.js` defines stable API error codes

### Frontend layering

- `pages/` owns route-level behavior and UI states
- `components/` owns reusable rendering units (e.g. map view)
- `api/` wraps HTTP calls and normalizes response branches for pages

## Setup

### 1) Install dependencies

```bash
npm install
npm install --prefix server
npm install --prefix client
```

### 2) Configure environment

Copy `server/.env.example` to `server/.env` and set values as needed:

```env
PORT=3006
NOMINATIM_USER_AGENT=dispatch-solar-mapper/1.0 (your-email@example.com)
NREL_API_KEY=DEMO_KEY
```

### 3) Run app

From repo root:

```bash
npm run dev
```

- Frontend: [http://localhost:5173](http://localhost:5173)
- Backend: [http://localhost:3001](http://localhost:3001)

## API endpoints

### `GET /api/sites`

Returns all configured sites, each enriched with `lat`/`lng` when geocoding succeeds.
If geocoding fails for a row, `lat` and `lng` are `null` and a `geocode` error object is included.

### `GET /api/sites/:id`

Response branches:

- `200` full/partial success with detail payload:
  - `site`
  - `solarResource` (`ok: true|false`)
  - `pvwatts` (`ok: true|false`)
- `404` if unknown site id (`NOT_FOUND`)
- `422` if address cannot be geocoded (`GEOCODE_FAILED`)

## Design decisions

- Keep routes thin and orchestration in services for maintainability.
- Use structured result objects (`ok` + `error` + `message`) for predictable UI handling.
- Prefer partial success once a site is geocoded so detail pages still provide value if one downstream service fails.
- Keep site catalog editable via a single file: `server/data/sites.json`.

## Assumptions for v1

- PVWatts defaults:
  - system capacity: `4 kW`
  - tilt: `20`
  - azimuth: `180`
  - losses: `14%`
  - array type: `1`
  - module type: `1`
  - dc/ac ratio: `1.2`
  - inverter efficiency: `96%`
  - gcr: `0.4`
- Nominatim calls are intentionally paced in list flow to be polite for small take-home traffic.
