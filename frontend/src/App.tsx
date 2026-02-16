import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './stores/authStore';
import LoginPage from './pages/auth/LoginPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import DashboardPage from './pages/dashboard/DashboardPage';
import ProductionPage from './pages/production/ProductionPage';
import InventoryPage from './pages/inventory/InventoryPage';
import SalesPage from './pages/sales/SalesPage';
import QualityPage from './pages/quality/QualityPage';
import AgropolePage from './pages/agropole/AgropolePage';
import MaintenancePage from './pages/maintenance/MaintenancePage';
import DeliveryPage from './pages/delivery/DeliveryPage';
import CostsPage from './pages/costs/CostsPage';
import MapPage from './pages/map/MapPage';
import PublicLayout from './components/public/PublicLayout';
import ProtectedRoute from './components/auth/ProtectedRoute';
import HomePage from './pages/public/HomePage';
import AboutPage from './pages/public/AboutPage';
import ContactPage from './pages/public/ContactPage';
import ServicesPage from './pages/public/ServicesPage';

function App() {
  const { isAuthenticated } = useAuthStore();

  return (
    <Router>
      <Routes>
        <Route element={<PublicLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/services" element={<ServicesPage />} />
          <Route path="/contact" element={<ContactPage />} />
        </Route>

        <Route 
          path="/login" 
          element={isAuthenticated ? <Navigate to="/app/dashboard" replace /> : <LoginPage />} 
        />
        <Route 
          path="/forgot-password" 
          element={isAuthenticated ? <Navigate to="/app/dashboard" replace /> : <ForgotPasswordPage />} 
        />
        
        <Route element={<ProtectedRoute />}>
          <Route path="/app/dashboard" element={<DashboardPage />} />
          <Route path="/app/production" element={<ProductionPage />} />
          <Route path="/app/inventory" element={<InventoryPage />} />
          <Route path="/app/sales" element={<SalesPage />} />
          <Route path="/app/quality" element={<QualityPage />} />
          <Route path="/app/agropole" element={<AgropolePage />} />
          <Route path="/app/maintenance" element={<MaintenancePage />} />
          <Route path="/app/delivery" element={<DeliveryPage />} />
          <Route path="/app/costs" element={<CostsPage />} />
          <Route path="/app/map" element={<MapPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;

