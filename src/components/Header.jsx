import { useState, useRef, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function UserAvatar({ name }) {
  const initials = (name || 'U')
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();
  return (
    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
      {initials}
    </div>
  );
}

function UserMenu({ user, onClose }) {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const items = [
    { id: 'menu-profile', label: 'Meu Perfil', icon: '👤', to: '/perfil' },
    { id: 'menu-orders', label: 'Minhas Compras', icon: '🎫', to: '/perfil?tab=orders' },
    { id: 'menu-tickets', label: 'Meus Ingressos', icon: '🎟️', to: '/meus-ingressos' },
  ];

  const handleNav = (to) => {
    navigate(to);
    onClose();
  };

  return (
    <div
      id="user-dropdown"
      data-cy="user-dropdown"
      className="absolute right-0 top-full mt-2 w-60 bg-[#1a1a2e] border border-purple-900/40 rounded-2xl shadow-2xl shadow-purple-900/30 overflow-hidden z-50"
    >
      {/* User info header */}
      <div className="px-4 py-3 border-b border-purple-900/30 flex items-center gap-3">
        <UserAvatar name={user.name} />
        <div className="min-w-0">
          <p className="text-white font-bold text-sm truncate">{user.name}</p>
          <p className="text-gray-400 text-xs truncate">{user.email}</p>
        </div>
      </div>

      {/* Nav items */}
      <div className="py-2">
        {items.map((item) => (
          <button
            key={item.id}
            id={item.id}
            data-cy={item.id}
            onClick={() => handleNav(item.to)}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-purple-700/20 transition-colors text-left"
          >
            <span>{item.icon}</span>
            {item.label}
          </button>
        ))}
      </div>

      {/* Logout */}
      <div className="border-t border-purple-900/30 py-2">
        <button
          id="header-logout-btn"
          data-cy="header-logout-btn"
          onClick={() => { logout(); navigate('/'); onClose(); }}
          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:text-red-300 hover:bg-red-900/10 transition-colors text-left"
        >
          <span>🚪</span>
          Sair da conta
        </button>
      </div>
    </div>
  );
}

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();
  const userMenuRef = useRef(null);

  // Close user menu when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const navItems = [
    { to: '/', label: 'Início', id: 'nav-home' },
    { to: '/eventos', label: 'Eventos', id: 'nav-eventos' },
    { to: '/contato', label: 'Contato', id: 'nav-contato' },
    { to: '/automacao', label: '🤖 Automação QA', id: 'nav-automacao' },
  ];

  return (
    <header id="header" data-cy="header" className="sticky top-0 z-50 bg-[#0f0f1a]/95 backdrop-blur-sm border-b border-purple-900/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <button
            id="logo-btn"
            data-cy="logo"
            onClick={() => navigate('/')}
            className="flex items-center gap-2 group"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-purple-900/50">
              ST
            </div>
            <span className="text-white font-bold text-xl tracking-tight hidden sm:block">
              Show<span className="text-purple-400">Tickets</span>
            </span>
          </button>

          {/* Desktop Nav */}
          <nav id="desktop-nav" data-cy="desktop-nav" className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                id={item.id}
                data-cy={item.id}
                className={({ isActive }) =>
                  `px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-purple-700/30 text-purple-300'
                      : 'text-gray-300 hover:text-white hover:bg-white/5'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {!user ? (
              <>
                <button
                  id="header-login-btn"
                  data-cy="header-login-btn"
                  onClick={() => navigate('/login')}
                  className="hidden sm:block text-gray-300 hover:text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors hover:bg-white/5"
                >
                  Entrar
                </button>
                <button
                  id="buy-tickets-cta"
                  data-cy="buy-tickets-cta"
                  onClick={() => navigate('/eventos')}
                  className="hidden sm:flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-all duration-200 shadow-lg shadow-purple-900/40"
                >
                  <span>🎫</span>
                  Comprar Ingressos
                </button>
              </>
            ) : (
              /* User avatar + dropdown */
              <div ref={userMenuRef} className="relative hidden sm:block">
                <button
                  id="user-menu-btn"
                  data-cy="user-menu-btn"
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-white/5 transition-colors"
                >
                  <UserAvatar name={user.name} />
                  <span className="text-white text-sm font-semibold max-w-[100px] truncate hidden lg:block">
                    {user.name.split(' ')[0]}
                  </span>
                  <svg
                    className={`w-4 h-4 text-gray-400 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`}
                    fill="none" viewBox="0 0 24 24" stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {userMenuOpen && <UserMenu user={user} onClose={() => setUserMenuOpen(false)} />}
              </div>
            )}

            {/* Mobile menu button */}
            <button
              id="mobile-menu-btn"
              data-cy="mobile-menu-btn"
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden p-2 text-gray-300 hover:text-white transition-colors"
              aria-label="Menu"
            >
              {menuOpen ? (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div id="mobile-menu" data-cy="mobile-menu" className="md:hidden pb-4 space-y-1">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                id={`mobile-${item.id}`}
                data-cy={`mobile-${item.id}`}
                onClick={() => setMenuOpen(false)}
                className={({ isActive }) =>
                  `flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-purple-700/30 text-purple-300'
                      : 'text-gray-300 hover:text-white hover:bg-white/5'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}

            {user ? (
              <>
                <NavLink
                  to="/perfil"
                  id="mobile-nav-perfil"
                  data-cy="mobile-nav-perfil"
                  onClick={() => setMenuOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                      isActive ? 'bg-purple-700/30 text-purple-300' : 'text-gray-300 hover:text-white hover:bg-white/5'
                    }`
                  }
                >
                  <UserAvatar name={user.name} />
                  <span>{user.name.split(' ')[0]}</span>
                </NavLink>
              </>
            ) : (
              <div className="flex gap-2 mt-2">
                <button
                  id="mobile-login-btn"
                  data-cy="mobile-login-btn"
                  onClick={() => { navigate('/login'); setMenuOpen(false); }}
                  className="flex-1 bg-white/10 border border-white/20 text-white text-sm font-semibold px-4 py-3 rounded-xl transition-all"
                >
                  Entrar
                </button>
                <button
                  id="mobile-buy-btn"
                  data-cy="mobile-buy-btn"
                  onClick={() => { navigate('/eventos'); setMenuOpen(false); }}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm font-semibold px-4 py-3 rounded-xl transition-all"
                >
                  🎫 Comprar
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
