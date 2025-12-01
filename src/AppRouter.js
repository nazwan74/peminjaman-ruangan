import { Routes, Route } from 'react-router-dom';
import Login from './pages/login';
import Signup from './pages/signup';
import Home from './pages/user/Home';
import Booking from './pages/user/Booking';
import RiwayatPeminjaman from './pages/user/RiwayatPeminjaman';
import Dashboard from './pages/cms/Dashboard';
import AddAdmin from './pages/cms/AddAdmin';
import AddRoom from './pages/cms/AddRoom';
import MonitoringPeminjaman from './pages/cms/MonitoringPeminjaman';
import ManajemenUser from './pages/cms/ManajemenUser';
import PrivateRoute from './utils/PrivateRoute';
// import halaman lain sesuai kebutuhan

function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route
        path="/home"
        element={
          <PrivateRoute>
            <Home />
          </PrivateRoute>
        }
      />
      <Route
        path="/booking"
        element={
          <PrivateRoute>
            <Booking />
          </PrivateRoute>
        }
      />
      <Route
        path="/riwayat"
        element={
          <PrivateRoute>
            <RiwayatPeminjaman />
          </PrivateRoute>
        }
      />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      {/* CMS routes - protected, only admin */}
      <Route
        path="/cms/dashboard"
        element={
          <PrivateRoute requiredRole="admin">
            <Dashboard />
          </PrivateRoute>
        }
      />

      <Route
        path="/cms/add-admin"
        element={
          <PrivateRoute requiredRole="admin">
            <AddAdmin />
          </PrivateRoute>
        }
      />

      <Route
        path="/cms/add-room"
        element={
          <PrivateRoute requiredRole="admin">
            <AddRoom />
          </PrivateRoute>
        }
      />

      <Route
        path="/cms/monitoring"
        element={
          <PrivateRoute requiredRole="admin">
            <MonitoringPeminjaman />
          </PrivateRoute>
        }
      />

      <Route
        path="/cms/manajemen-user"
        element={
          <PrivateRoute requiredRole="admin">
            <ManajemenUser />
          </PrivateRoute>
        }
      />

      {/* Route lainnya di sini */}
    </Routes>
  );
}

export default AppRouter;