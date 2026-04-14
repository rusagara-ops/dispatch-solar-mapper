import { Routes, Route, Navigate } from 'react-router-dom';
import MapPage from './pages/MapPage.jsx';
import SiteDetailPage from './pages/SiteDetailPage.jsx';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<MapPage />} />
      <Route path="/sites/:id" element={<SiteDetailPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
