import { HashRouter, Routes, Route, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { AuthProvider } from './contexts/AuthContext';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import Events from './pages/Events';
import Purchase from './pages/Purchase';
import MyTickets from './pages/MyTickets';
import Contact from './pages/Contact';
import Login from './pages/Login';
import Profile from './pages/Profile';
import NotFound from './pages/NotFound';
import Automacao from './pages/Automacao';

function ScrollToTop() {
  const location = useLocation();
  useEffect(() => {
    // Skip when navigating with an anchor (e.g. footer links to /automacao sections)
    if (location.state?.anchor) return;
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [location.pathname, location.key]);
  return null;
}

export default function App() {
  return (
    <AuthProvider>
      <HashRouter>
        <ScrollToTop />
        <div id="app" data-cy="app" className="flex flex-col min-h-screen">
          <Header />
          <div className="flex-1">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/eventos" element={<Events />} />
              <Route path="/comprar/:eventId" element={<Purchase />} />
              <Route path="/meus-ingressos" element={<MyTickets />} />
              <Route path="/contato" element={<Contact />} />
              <Route path="/login" element={<Login />} />
              <Route path="/perfil" element={<Profile />} />
              <Route path="/automacao" element={<Automacao />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
          <Footer />
        </div>
      </HashRouter>
    </AuthProvider>
  );
}
