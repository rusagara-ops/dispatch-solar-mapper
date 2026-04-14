const base = '/api/sites';

export async function fetchSites() {
  const res = await fetch(base);
  if (!res.ok) throw new Error(`Failed to load sites (${res.status})`);
  const data = await res.json();
  // Accept both array and { sites: [...] } payloads to avoid runtime crashes during local port mixups.
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.sites)) return data.sites;
  throw new Error('Unexpected site list response shape');
}

/**
 * @param {string} id
 * @returns {Promise<
 *   | {
 *       kind: 'ok';
 *       detail: {
 *         site: { id: string; name: string; address: string; lat: number; lng: number; formattedAddress: string };
 *         solarResource: { ok: boolean; data?: object; error?: string; message?: string };
 *         pvwatts: { ok: boolean; data?: object; error?: string; message?: string };
 *       };
 *     }
 *   | { kind: 'not_found'; error?: string; message?: string }
 *   | { kind: 'geocode_failed'; error: string; message: string; site: { id: string; name: string; address: string } }
 * >}
 */
export async function fetchSiteById(id) {
  const res = await fetch(`${base}/${encodeURIComponent(id)}`);
  let data = {};
  try {
    data = await res.json();
  } catch {
    /* non-JSON body */
  }

  if (res.status === 404) {
    return { kind: 'not_found', error: data.error, message: data.message };
  }

  if (res.status === 422) {
    return {
      kind: 'geocode_failed',
      error: data.error ?? 'GEOCODE_FAILED',
      message: data.message ?? 'Address could not be resolved',
      site: data.site,
    };
  }

  if (!res.ok) {
    throw new Error(data.message || `Failed to load site (${res.status})`);
  }

  return { kind: 'ok', detail: data };
}
