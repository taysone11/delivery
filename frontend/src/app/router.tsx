import { Navigate, Route, Routes } from 'react-router-dom';

import { HomePage } from '../pages/HomePage/HomePage';

export function AppRouter(): JSX.Element {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
