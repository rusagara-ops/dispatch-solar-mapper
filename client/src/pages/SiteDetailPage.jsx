import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { fetchSiteById } from '../api/sites.js';

export default function SiteDetailPage() {
  const { id } = useParams();
  const [detail, setDetail] = useState(null);
  const [geocodeFailure, setGeocodeFailure] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const result = await fetchSiteById(id);
        if (cancelled) return;

        if (result.kind === 'not_found') {
          setNotFound(true);
        } else if (result.kind === 'geocode_failed') {
          setGeocodeFailure(result);
        } else {
          setDetail(result.detail);
        }
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Request failed');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) return <p style={{ padding: 16 }}>Loading…</p>;

  if (error) {
    return (
      <div style={{ padding: 16 }}>
        <p>{error}</p>
        <Link to="/">Back to map</Link>
      </div>
    );
  }

  if (notFound) {
    return (
      <div style={{ padding: 16 }}>
        <p>Site not found.</p>
        <Link to="/">Back to map</Link>
      </div>
    );
  }

  if (geocodeFailure) {
    const { site: partial, message } = geocodeFailure;
    return (
      <div style={{ padding: 16, maxWidth: 560 }}>
        <Link to="/">← Map</Link>
        <h1>{partial?.name ?? 'Site'}</h1>
        <p style={{ color: '#555' }}>{partial?.address}</p>
        <p style={{ marginTop: 16, padding: 12, background: '#fff4f4', border: '1px solid #e8b4b4' }}>
          <strong>Location unavailable</strong>
          <br />
          {message}
        </p>
        <p style={{ marginTop: 12, fontSize: 14, color: '#666' }}>
          The site record exists, but the address could not be turned into coordinates. You can still correct the
          address in <code>server/data/sites.json</code> and reload.
        </p>
      </div>
    );
  }

  const site = detail?.site;
  const pvwatts = detail?.pvwatts;
  const solar = detail?.solarResource;
  const assumptions = {
    systemCapacityKw: pvwatts?.data?.inputs?.system_capacity ?? 4,
    tilt: pvwatts?.data?.inputs?.tilt ?? 20,
    azimuth: pvwatts?.data?.inputs?.azimuth ?? 180,
    losses: pvwatts?.data?.inputs?.losses ?? 14,
    arrayType: pvwatts?.data?.inputs?.array_type ?? 1,
    moduleType: pvwatts?.data?.inputs?.module_type ?? 1,
    dcAcRatio: pvwatts?.data?.inputs?.dc_ac_ratio ?? 1.2,
    invEff: pvwatts?.data?.inputs?.inv_eff ?? 96,
    gcr: pvwatts?.data?.inputs?.gcr ?? 0.4,
  };

  return (
    <div style={{ padding: 16, maxWidth: 560 }}>
      <Link to="/">← Map</Link>
      <h1>{site.name}</h1>
      <dl style={{ margin: '16px 0', display: 'grid', rowGap: 8, columnGap: 16 }}>
        <div>
          <dt style={{ fontWeight: 600, marginBottom: 4 }}>Address on file</dt>
          <dd style={{ margin: 0 }}>{site.address}</dd>
        </div>
        <div>
          <dt style={{ fontWeight: 600, marginBottom: 4 }}>Resolved location</dt>
          <dd style={{ margin: 0 }}>{site.formattedAddress}</dd>
        </div>
        <div>
          <dt style={{ fontWeight: 600, marginBottom: 4 }}>Coordinates</dt>
          <dd style={{ margin: 0 }}>
            {site.lat.toFixed(5)}, {site.lng.toFixed(5)}
          </dd>
        </div>
        <div>
          <dt style={{ fontWeight: 600, marginBottom: 4 }}>Solar resource</dt>
          <dd style={{ margin: 0 }}>
            {solar?.ok ? 'Retrieved' : `Unavailable: ${solar?.message ?? 'Unknown error'}`}
          </dd>
        </div>
        <div>
          <dt style={{ fontWeight: 600, marginBottom: 4 }}>PVWatts estimate</dt>
          <dd style={{ margin: 0 }}>
            {pvwatts?.ok
              ? `${Math.round(pvwatts.data?.outputs?.ac_annual ?? 0).toLocaleString()} kWh/year`
              : `Unavailable: ${pvwatts?.message ?? 'Unknown error'}`}
          </dd>
        </div>
      </dl>
      <section style={{ marginTop: 20 }}>
        <h2 style={{ fontSize: 18, marginBottom: 10 }}>PVWatts assumptions (v1 defaults)</h2>
        <ul style={{ margin: 0, paddingLeft: 18, lineHeight: 1.5 }}>
          <li>System capacity: {assumptions.systemCapacityKw} kW</li>
          <li>Tilt: {assumptions.tilt} deg</li>
          <li>Azimuth: {assumptions.azimuth} deg (south-facing)</li>
          <li>Losses: {assumptions.losses}%</li>
          <li>Array type: {assumptions.arrayType}</li>
          <li>Module type: {assumptions.moduleType}</li>
          <li>DC/AC ratio: {assumptions.dcAcRatio}</li>
          <li>Inverter efficiency: {assumptions.invEff}%</li>
          <li>Ground coverage ratio: {assumptions.gcr}</li>
        </ul>
      </section>
    </div>
  );
}
