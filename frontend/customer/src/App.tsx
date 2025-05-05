import { Routes, Route } from 'react-router-dom';
import { Suspense, lazy, useEffect, useState } from 'react';
import { Container, Spinner } from 'react-bootstrap';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { SocketProvider } from './contexts/SocketContext';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import ProtectedRoute from './components/auth/ProtectedRoute';
import { getCanteenSettings } from './services/settingsService';

// Lazy load pages for better performance
const HomePage = lazy(() => import('./pages/HomePage'));
const MenuPage = lazy(() => import('./pages/MenuPage'));
const CartPage = lazy(() => import('./pages/CartPage'));
const CheckoutPage = lazy(() => import('./pages/CheckoutPage'));
const OrdersPage = lazy(() => import('./pages/OrdersPage'));
const OrderDetailsPage = lazy(() => import('./pages/OrderDetailsPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));

function App() {
  const [isCanteenOpen, setIsCanteenOpen] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchCanteenStatus = async () => {
      try {
        const settings = await getCanteenSettings();
        setIsCanteenOpen(settings.isOpen);
      } catch (error) {
        console.error('Failed to fetch canteen settings:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCanteenStatus();
  }, []);

  if (isLoading) {
    return (
      <Container className="d-flex justify-content-center align-items-center vh-100">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </Container>
    );
  }

  return (
    <AuthProvider>
      <SocketProvider>
        <CartProvider>
          <div className="d-flex flex-column min-vh-100">
            <Header isCanteenOpen={isCanteenOpen} />
            <main className="flex-grow-1 py-4">
              <Container>
                {!isCanteenOpen && (
                  <div className="alert alert-warning text-center mb-4">
                    <strong>Notice:</strong> The canteen is currently closed. You can browse the menu, but ordering is disabled.
                  </div>
                )}
                <Suspense
                  fallback={
                    <div className="text-center py-5">
                      <Spinner animation="border" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </Spinner>
                    </div>
                  }
                >
                  <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/menu" element={<MenuPage />} />
                    <Route path="/cart" element={<CartPage isCanteenOpen={isCanteenOpen} />} />
                    <Route
                      path="/checkout"
                      element={
                        <ProtectedRoute>
                          <CheckoutPage isCanteenOpen={isCanteenOpen} />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/orders"
                      element={
                        <ProtectedRoute>
                          <OrdersPage />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/orders/:id"
                      element={
                        <ProtectedRoute>
                          <OrderDetailsPage />
                        </ProtectedRoute>
                      }
                    />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />
                    <Route
                      path="/profile"
                      element={
                        <ProtectedRoute>
                          <ProfilePage />
                        </ProtectedRoute>
                      }
                    />
                    <Route path="*" element={<NotFoundPage />} />
                  </Routes>
                </Suspense>
              </Container>
            </main>
            <Footer />
          </div>
        </CartProvider>
      </SocketProvider>
    </AuthProvider>
  );
}

export default App;
