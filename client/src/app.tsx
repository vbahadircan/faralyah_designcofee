import { Route, Routes } from 'react-router';
import { Layout } from './components/layout';
import { tr } from './content/tr';
import { ComingSoonPage } from './pages/coming-soon-page';
import { MenuPage } from './pages/menu-page';
import { NotFoundPage } from './pages/not-found-page';
import { OffersPage } from './pages/offers-page';
import { WelcomeAltPage } from './pages/welcome-alt-page';
import { WelcomePage } from './pages/welcome-page';

export function App() {
  return (
    <Routes>
      <Route index element={<WelcomePage />} />
      <Route path="onizleme" element={<WelcomeAltPage />} />
      <Route element={<Layout />}>
        <Route path="menu" element={<MenuPage />} />
        <Route path="etkinlikler" element={<ComingSoonPage title={tr.activities.title} />} />
        <Route path="etkinlikler-kampanyalar" element={<OffersPage />} />
        <Route path="kampanyalar" element={<OffersPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
