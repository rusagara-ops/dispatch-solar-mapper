import { getSiteById } from './siteRegistry.js';
import { geocodeAddress } from './geocoding.js';
import { ErrorCodes } from '../types/errors.js';
import { getSolarResource } from './solarResource.js';
import { getPvwattsEstimate } from './pvwatts.js';

/**
 * Build the GET /api/sites/:id payload.
 *
 * @param {string} id
 * @returns {Promise<
 *   | { type: 'not_found' }
 *   | { type: 'geocode_failed'; error: string; message: string; site: { id: string; name: string; address: string } }
 *   | {
 *       type: 'ok';
 *       detail: {
 *         site: { id: string; name: string; address: string; lat: number; lng: number; formattedAddress: string };
 *         solarResource: { ok: true; data: object | null } | { ok: false; error: string; message: string };
 *         pvwatts: { ok: true; data: object | null } | { ok: false; error: string; message: string };
 *       };
 *     }
 * >}
 */
export async function buildSiteDetailResponse(id) {
  const site = getSiteById(id);
  if (!site) {
    return { type: 'not_found' };
  }

  const geo = await geocodeAddress(site.address);

  if (!geo.ok) {
    return {
      type: 'geocode_failed',
      error: geo.error ?? ErrorCodes.GEOCODE_FAILED,
      message: geo.message ?? 'Address could not be resolved',
      site: {
        id: site.id,
        name: site.name,
        address: site.address,
      },
    };
  }

  const detailSite = {
    id: site.id,
    name: site.name,
    address: site.address,
    lat: geo.lat,
    lng: geo.lng,
    formattedAddress: geo.formattedAddress,
  };

  // These two calls are independent once lat/lng are known.
  const [solarResource, pvwatts] = await Promise.all([
    getSolarResource(geo.lat, geo.lng),
    getPvwattsEstimate({ lat: geo.lat, lng: geo.lng }),
  ]);

  return {
    type: 'ok',
    detail: {
      site: detailSite,
      solarResource: solarResource.ok
        ? { ok: true, data: solarResource.data }
        : {
            ok: false,
            error: solarResource.error ?? ErrorCodes.SOLAR_FAILED,
            message: solarResource.message ?? 'Solar resource unavailable',
          },
      pvwatts: pvwatts.ok
        ? { ok: true, data: pvwatts.data }
        : {
            ok: false,
            error: pvwatts.error ?? ErrorCodes.PVWATTS_FAILED,
            message: pvwatts.message ?? 'PVWatts unavailable',
          },
    },
  };
}
