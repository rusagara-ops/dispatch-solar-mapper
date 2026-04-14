import { ErrorCodes } from '../types/errors.js';

const NREL_BASE_URL = 'https://developer.nrel.gov/api/solar/solar_resource/v1.json';

/**
 * Coordinates -> solar resource payload.
 * Returns a structured result instead of throwing for expected API failures.
 *
 * @param {number} lat
 * @param {number} lng
 */
export async function getSolarResource(lat, lng) {
  const apiKey = process.env.NREL_API_KEY || 'DEMO_KEY';

  try {
    const url = new URL(NREL_BASE_URL);
    url.searchParams.set('api_key', apiKey);
    url.searchParams.set('lat', String(lat));
    url.searchParams.set('lon', String(lng));

    const res = await fetch(url);
    if (!res.ok) {
      return {
        ok: false,
        error: ErrorCodes.SOLAR_FAILED,
        message: `Solar resource API returned HTTP ${res.status}`,
      };
    }

    const payload = await res.json();
    if (payload?.errors?.length) {
      return {
        ok: false,
        error: ErrorCodes.SOLAR_FAILED,
        message: payload.errors[0],
      };
    }

    return {
      ok: true,
      data: payload?.outputs ?? null,
    };
  } catch (err) {
    return {
      ok: false,
      error: ErrorCodes.SOLAR_FAILED,
      message: err instanceof Error ? err.message : 'Solar resource request failed',
    };
  }
}
