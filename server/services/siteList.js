import { listSites } from './siteRegistry.js';
import { geocodeAddress } from './geocoding.js';

/** Pause between Nominatim calls to respect usage policy (~1 req/s). */
const NOMINATIM_GAP_MS = Number(process.env.NOMINATIM_GAP_MS) || 1100;

function delay(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

/**
 * Full payload for GET /api/sites: registry rows plus geocoding.
 * Sequential geocoding keeps Nominatim-friendly traffic for small site lists.
 *
 * @returns {Promise<object[]>}
 */
export async function buildSitesListResponse() {
  const sites = listSites();
  const out = [];

  for (let i = 0; i < sites.length; i++) {
    const site = sites[i];
    const geo = await geocodeAddress(site.address);

    if (geo.ok) {
      out.push({
        ...site,
        lat: geo.lat,
        lng: geo.lng,
        formattedAddress: geo.formattedAddress,
      });
    } else {
      out.push({
        ...site,
        lat: null,
        lng: null,
        geocode: {
          ok: false,
          error: geo.error,
          message: geo.message,
        },
      });
    }

    if (i < sites.length - 1) {
      await delay(NOMINATIM_GAP_MS);
    }
  }

  return out;
}
