import { ErrorCodes } from '../types/errors.js';

const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/search';

/**
 * Resolve a free-text address to coordinates (OpenStreetMap Nominatim).
 * Does not throw: callers always get a result object suitable for API responses.
 *
 * @param {string} address
 * @returns {Promise<
 *   | { ok: true; lat: number; lng: number; formattedAddress: string }
 *   | { ok: false; error: string; message: string }
 * >}
 */
export async function geocodeAddress(address) {
  const trimmed = typeof address === 'string' ? address.trim() : '';
  if (!trimmed) {
    return { ok: false, error: ErrorCodes.GEOCODE_FAILED, message: 'Empty address' };
  }

  try {
    const url = new URL(NOMINATIM_URL);
    url.searchParams.set('format', 'json');
    url.searchParams.set('limit', '1');
    url.searchParams.set('countrycodes', 'us');
    url.searchParams.set('q', trimmed);

    const userAgent =
      process.env.NOMINATIM_USER_AGENT?.trim() || 'dispatch-solar-mapper/1.0 (take-home; contact local .env)';

    const res = await fetch(url, {
      headers: {
        'User-Agent': userAgent,
        'Accept-Language': 'en',
      },
    });

    if (!res.ok) {
      return {
        ok: false,
        error: ErrorCodes.GEOCODE_FAILED,
        message: `Geocoder returned HTTP ${res.status}`,
      };
    }

    const data = await res.json();
    if (!Array.isArray(data) || data.length === 0) {
      return {
        ok: false,
        error: ErrorCodes.GEOCODE_FAILED,
        message: 'Address could not be resolved',
      };
    }

    const hit = data[0];
    const lat = parseFloat(hit.lat);
    const lng = parseFloat(hit.lon);

    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      return {
        ok: false,
        error: ErrorCodes.GEOCODE_FAILED,
        message: 'Invalid coordinates from geocoder',
      };
    }

    return {
      ok: true,
      lat,
      lng,
      formattedAddress: typeof hit.display_name === 'string' ? hit.display_name : trimmed,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Geocoding failed';
    return { ok: false, error: ErrorCodes.GEOCODE_FAILED, message };
  }
}
