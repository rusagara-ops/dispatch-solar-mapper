import { ErrorCodes } from '../types/errors.js';

const PVWATTS_BASE_URL = 'https://developer.nrel.gov/api/pvwatts/v8.json';

/**
 * v1 defaults keep PVWatts usage simple and explicit.
 * @param {{ lat: number; lng: number; systemCapacityKw?: number; tilt?: number; azimuth?: number }} input
 */
export async function getPvwattsEstimate(input) {
  const apiKey = process.env.NREL_API_KEY || 'DEMO_KEY';
  const params = {
    systemCapacityKw: input.systemCapacityKw ?? 4,
    moduleType: 1,
    losses: 14,
    arrayType: 1,
    tilt: input.tilt ?? 20,
    azimuth: input.azimuth ?? 180,
    dcAcRatio: 1.2,
    invEff: 96,
    gcr: 0.4,
  };

  try {
    const url = new URL(PVWATTS_BASE_URL);
    url.searchParams.set('api_key', apiKey);
    url.searchParams.set('lat', String(input.lat));
    url.searchParams.set('lon', String(input.lng));
    url.searchParams.set('system_capacity', String(params.systemCapacityKw));
    url.searchParams.set('module_type', String(params.moduleType));
    url.searchParams.set('losses', String(params.losses));
    url.searchParams.set('array_type', String(params.arrayType));
    url.searchParams.set('tilt', String(params.tilt));
    url.searchParams.set('azimuth', String(params.azimuth));
    url.searchParams.set('dc_ac_ratio', String(params.dcAcRatio));
    url.searchParams.set('inv_eff', String(params.invEff));
    url.searchParams.set('gcr', String(params.gcr));
    url.searchParams.set('timeframe', 'monthly');

    const res = await fetch(url);
    if (!res.ok) {
      return {
        ok: false,
        error: ErrorCodes.PVWATTS_FAILED,
        message: `PVWatts API returned HTTP ${res.status}`,
      };
    }

    const payload = await res.json();
    if (payload?.errors?.length) {
      return {
        ok: false,
        error: ErrorCodes.PVWATTS_FAILED,
        message: payload.errors[0],
      };
    }

    return {
      ok: true,
      data: {
        inputs: payload?.inputs ?? null,
        outputs: payload?.outputs ?? null,
        stationInfo: payload?.station_info ?? null,
      },
    };
  } catch (err) {
    return {
      ok: false,
      error: ErrorCodes.PVWATTS_FAILED,
      message: err instanceof Error ? err.message : 'PVWatts request failed',
    };
  }
}
