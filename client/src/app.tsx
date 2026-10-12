import { Route, Routes } from 'react-router';
import { Layout } from './components/layout';
import { AdminLayout } from './pages/admin/admin-layout';
import { CampaignsAdminPage } from './pages/admin/campaigns-admin-page';
import { LoginPage } from './pages/admin/login-page';
import { MenuAdminPage } from './pages/admin/menu-admin-page';
import { SettingsAdminPage } from './pages/admin/settings-admin-page';
import { CampaignsPage } from './pages/campaigns-page';
import { MenuPage } from './pages/menu-page';
import { NotFoundPage } from './pages/not-found-page';
import { WelcomePage } from './pages/welcome-page';

export function App() {
  return (
    <Routes>
      <Route index element={<WelcomePage />} />
      <Route element={<Layout />}>
        <Route path="menu" element={<MenuPage />} />
        <Route path="kampanyalar" element={<CampaignsPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
      <Route path="admin/giris" element={<LoginPage />} />
      <Route path="admin" element={<AdminLayout />}>
        <Route index element={<MenuAdminPage />} />
        <Route path="kampanyalar" element={<CampaignsAdminPage />} />
        <Route path="ayarlar" element={<SettingsAdminPage />} />
      </Route>
    </Routes>
  );
}
