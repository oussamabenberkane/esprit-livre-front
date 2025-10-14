import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomePage from './pages/homePage';
import AllBooks from './pages/AllBooks';
import BookDetails from './pages/BookDetails';
import CartCheckoutPage from './pages/CartCheckoutPage.jsx';
import AuthPage from './pages/AuthPage.jsx';
import Profile from './pages/profile.jsx';
import Orders from './components/profil/Orders.jsx';
import Favorites from './components/profil/Favorites.jsx';
import TeamPage from './pages/TeamPage';
import ServiceClientPage from './pages/ServiceClientPage';

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen min-w-screen bg-gray-50">
        <Routes>
          {/* Home page as entry point */}
          <Route path="/" element={<Favorites/>} />

          {/* All books catalog page */}
          <Route path="/allbooks" element={<AllBooks />} />

          {/* Book details page with dynamic ID */}
          <Route path="/books/:id" element={<BookDetails />} />

          {/* Cart and checkout page */}
          <Route path="/cart" element={<CartCheckoutPage />} />

          {/* Team page */}
          <Route path="/team" element={<TeamPage />} />

          {/* Service Client page */}
          <Route path="/service-client" element={<ServiceClientPage />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;