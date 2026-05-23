import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { lazy, Suspense, useEffect } from 'react';
import { HelmetProvider } from 'react-helmet-async';
import { initPixel, trackPageView } from './services/pixel.service';
import { captureOrderOrigin } from './utils/orderOrigin';
import ProtectedRoute from './components/auth/ProtectedRoute.jsx';
import { FavoritesProvider } from './contexts/FavoritesContext';
import { CartProvider } from './contexts/CartContext';
import { OnboardingProvider } from './contexts/OnboardingContext';
const OnboardingCelebration = lazy(() => import('./components/onboarding/OnboardingCelebration'));
const OnboardingTour = lazy(() => import('./components/onboarding/OnboardingTour'));
const OnboardingFinish = lazy(() => import('./components/onboarding/OnboardingFinish'));
const AccountCreationPopup = lazy(() => import('./components/common/AccountCreationPopup'));

const HomePage = lazy(() => import('./pages/homePage'));
const Products = lazy(() => import('./pages/Products'));
const BookDetails = lazy(() => import('./pages/BookDetails'));
const CartCheckoutPage = lazy(() => import('./pages/CartCheckoutPage.jsx'));
const AuthPage = lazy(() => import('./pages/AuthPage.jsx'));
const AuthCallback = lazy(() => import('./pages/AuthCallback.jsx'));
const Profile = lazy(() => import('./pages/profile.jsx'));
const Orders = lazy(() => import('./components/profil/Orders.jsx'));
const Favorites = lazy(() => import('./components/profil/Favorites.jsx'));
const TeamPage = lazy(() => import('./pages/TeamPage'));
const PolitiquePage = lazy(() => import('./pages/PolitiquePage'));
const MentionsLegalesPage = lazy(() => import('./pages/MentionsLegalesPage'));
const ServiceClientPage = lazy(() => import('./pages/ServiceClientPage'));
const SalePage = lazy(() => import('./pages/SalePage.jsx'));
const TestPage = lazy(() => import('./pages/TestPage.jsx'));
const NotFound404 = lazy(() => import('./pages/NotFound404.jsx'));
const AccountDeactivated = lazy(() => import('./pages/AccountDeactivated.jsx'));

function PixelTracker() {
  const location = useLocation();

  useEffect(() => {
    initPixel();
    captureOrderOrigin();
  }, []);

  useEffect(() => {
    trackPageView();
  }, [location.pathname]);

  return null;
}

function App() {
  return (
    <HelmetProvider>
    <BrowserRouter>
      <PixelTracker />
      <FavoritesProvider>
        <CartProvider>
          <OnboardingProvider>
          <div className="min-h-screen min-w-screen bg-gray-50">
          <Suspense fallback={null}>
          <Routes>
          {/* Home page as entry point - Accessible to both guests and authenticated users */}
          <Route path="/" element={<HomePage />} />


          {/* auth page */}
          <Route path="/auth" element={<AuthPage />} />

          {/* OAuth callback route */}
          <Route path="/auth/callback" element={<AuthCallback />} />

          {/* Products catalog page */}
          <Route path="/products" element={<Products />} />
          <Route path="/allbooks" element={<Navigate to="/products" replace />} />

          {/* Packs redirect to products packs tab */}
          <Route path="/packs" element={<Navigate to="/products?tab=packs" replace />} />

          {/* Books on sale / promotions page */}
          <Route path="/promotions" element={<SalePage />} />

          {/* Book details page with dynamic ID */}
          <Route path="/books/:id" element={<BookDetails />} />

          {/* Cart and checkout page */}
          <Route path="/cart" element={<CartCheckoutPage />} />

          {/* Favorites page */}
          <Route path="/favorites" element={<Favorites />} />

          {/* orders page */}
          <Route path="/orders" element={<Orders />} />

          {/* Profile page */}
          <Route path="/profile" element={<Profile />} />

          {/* Team page */}
          <Route path="/team" element={<TeamPage />} />

          {/* Service Client page */}
          <Route path="/service-client" element={<ServiceClientPage />} />

          {/* Legal / Politique page */}
          <Route path="/politique" element={<PolitiquePage />} />

          {/* Mentions légales */}
          <Route path="/mentions-legales" element={<MentionsLegalesPage />} />

          {/* Test page for debugging */}
          <Route path="/test" element={<TestPage />} />

          {/* Account deactivated */}
          <Route path="/account-deactivated" element={<AccountDeactivated />} />

          {/* 404 Not Found - Catch all undefined routes */}
          <Route path="*" element={<NotFound404 />} />
        </Routes>
          </Suspense>
          </div>
          {/* Onboarding overlays — rendered at root so they cover all pages */}
          <OnboardingCelebration />
          <OnboardingTour />
          <OnboardingFinish />
          {/* Account creation prompt for non-authenticated visitors */}
          <AccountCreationPopup />
          </OnboardingProvider>
        </CartProvider>
      </FavoritesProvider>
    </BrowserRouter>
    </HelmetProvider>
  );
}

export default App;
