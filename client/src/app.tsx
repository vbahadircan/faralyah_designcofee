import { Route, Routes } from 'react-router';
import { Layout } from './components/layout';
import { HomePage } from './pages/home-page';
import { NotFoundPage } from './pages/not-found-page';

export function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
