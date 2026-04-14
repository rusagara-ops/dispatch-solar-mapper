import { useEffect, useState } from 'react';
import MapView from '../components/MapView.jsx';
import { fetchSites } from '../api/sites.js';

export default function MapPage() {
  const [sites, setSites] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await fetchSites();
        if (!cancelled) setSites(data);
      } catch (e) {
        if (!cancelled) setError(e.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <p style={{ padding: 16 }}>
        Loading sites… Geocoding runs on the server (about a second per site), so this can take a few seconds.
      </p>
    );
  }
  if (error) return <p style={{ padding: 16 }}>Error: {error}</p>;

  const failedGeocode = sites.filter((s) => s.geocode?.ok === false).length;

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <header style={{ padding: '8px 16px', borderBottom: '1px solid #ddd' }}>
        <strong>Solar sites</strong>
        <span style={{ marginLeft: 8, color: '#666', fontSize: 14 }}>
          Markers use <code>lat</code>/<code>lng</code> from <code>GET /api/sites</code>.
          {failedGeocode > 0 ? (
            <span style={{ color: '#a61b1b', marginLeft: 8 }}>
              {failedGeocode} site(s) could not be geocoded.
            </span>
          ) : null}
        </span>
      </header>
      <div style={{ flex: 1, minHeight: 0 }}>
        <MapView sites={sites} />
      </div>
    </div>
  );
}
