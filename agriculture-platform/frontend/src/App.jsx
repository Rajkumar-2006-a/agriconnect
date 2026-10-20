import React from 'react';
import './styles/premium-ui.css';
import { BrowserRouter, Navigate, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Protected from './components/Protected';
import ErrorBoundary from './components/ErrorBoundary';
import { useAuth } from './context/AuthContext';
import { About } from './pages/Pages';
import CartPage from './pages/CartPage';
import { ProductDetailPage, EquipmentDetailPage } from './pages/DetailPages';
import FarmerDashboardMain from './pages/FarmerDashboardMain';
import RentalOwnerDashboard from './pages/RentalOwnerDashboard';
import EquipmentRental from './pages/EquipmentRental';
import SimpleAuth from './pages/SimpleAuth';
import BuyerMarketplace from './pages/BuyerMarketplace';
import FarmerCommunity from './pages/FarmerCommunity';
import AdminDashboard from './pages/AdminDashboard';
import BuyerOrders from './pages/BuyerOrders';
import FertilizerPricePage from './pages/FertilizerPricePage';
import GovernmentSchemesPage from './pages/GovernmentSchemesPage';
import AgriChatbot from './components/AgriChatbot';

function DashboardPage() {
  const { user } = useAuth();
  if (user?.role === 'buyer') return <Navigate to="/products" replace />;
  if (user?.role === 'admin') return <AdminDashboard />;
  if (user?.role === 'rentalOwner') return <RentalOwnerDashboard />;
  return (
    <ErrorBoundary>
      <FarmerDashboardMain />
    </ErrorBoundary>
  );
}

function FertilizerRoute() {
  const { user } = useAuth();
  if (user?.role === 'farmer') {
    return (
      <ErrorBoundary>
        <FarmerDashboardMain initialSection="fertilizers" />
      </ErrorBoundary>
    );
  }
  return (
    <ErrorBoundary>
      <FertilizerPricePage />
    </ErrorBoundary>
  );
}

function SchemeRoute() {
  const { user } = useAuth();
  if (user?.role === 'farmer') {
    return (
      <ErrorBoundary>
        <FarmerDashboardMain initialSection="schemes" />
      </ErrorBoundary>
    );
  }
  return (
    <ErrorBoundary>
      <GovernmentSchemesPage />
    </ErrorBoundary>
  );
}

function EquipmentRoute() {
  const { user } = useAuth();
  if (user?.role === 'farmer') {
    return (
      <ErrorBoundary>
        <FarmerDashboardMain initialSection="equipment" />
      </ErrorBoundary>
    );
  }
  return (
    <ErrorBoundary>
      <EquipmentRental />
    </ErrorBoundary>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <Layout>
          <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/about" element={<About />} />
            <Route path="/login" element={<SimpleAuth mode="login" />} />
            <Route path="/register" element={<SimpleAuth mode="register" />} />
            <Route path="/products" element={<BuyerMarketplace />} />
            <Route path="/products/:id" element={<ProductDetailPage />} />
            <Route path="/purchases" element={<Protected roles={['buyer']}><BuyerOrders /></Protected>} />
            <Route path="/equipment" element={<EquipmentRoute />} />
            <Route path="/equipment/:id" element={<EquipmentDetailPage />} />
            <Route path="/community" element={<FarmerCommunity />} />
            <Route path="/fertilizers" element={<FertilizerRoute />} />
            <Route path="/schemes" element={<SchemeRoute />} />
            <Route path="/cart" element={<Protected roles={['buyer']}><CartPage /></Protected>} />
            <Route path="/admin" element={<Protected roles={['admin']}><AdminDashboard /></Protected>} />
            <Route path="/dashboard" element={<Protected><DashboardPage /></Protected>} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </Layout>
        {/* Global Floating AI Assistant Widget */}
        <AgriChatbot />
      </ErrorBoundary>
    </BrowserRouter>
  );
}
