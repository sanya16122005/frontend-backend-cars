import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import CarsPage from './pages/CarsPage';
import CarDetailPage from './pages/CarDetailPage';
import UsersPage from './pages/UsersPage';
import PrivateRoute from './components/PrivateRoute';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login"    element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/cars"     element={<PrivateRoute><CarsPage /></PrivateRoute>} />
        <Route path="/cars/:id" element={<PrivateRoute><CarDetailPage /></PrivateRoute>} />
        {/* UsersPage доступна только admin */}
        <Route path="/users"    element={<PrivateRoute requiredRoles={['admin']}><UsersPage /></PrivateRoute>} />
        <Route path="*"         element={<Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  );
}
