import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const scrollTop = () => window.scrollTo({ top: 0, behavior: 'instant' });

function NavLink({ to, children, id, dataCy, state }) {
  return (
    <Link
      to={to}
      state={state}
      id={id}
      data-cy={dataCy}
      onClick={scrollTop}
      className="text-gray-400 hover:text-purple-300 text-sm transition-colors"
    >
      {children}
    </Link>
  );
}

export default function Footer() {
  const { user } = useAuth();
  return (
    <footer id="footer" data-cy="footer" className="bg-[#080810] border-t border-purple-900/30 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-white font-bold text-lg">
                ST
              </div>
              <span className="text-white font-bold text-xl">
                Show<span className="text-purple-400">Tickets</span>
              </span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              A plataforma mais confiável para compra de ingressos de shows e eventos no Brasil.
            </p>
            <div className="flex gap-3 mt-4">
              {['instagram', 'twitter', 'facebook', 'youtube'].map((s) => (
                <a
                  key={s}
                  href="#"
                  id={`social-${s}`}
                  data-cy={`social-${s}`}
                  onClick={(e) => e.preventDefault()}
                  className="w-9 h-9 rounded-lg bg-white/5 hover:bg-purple-700/30 flex items-center justify-center text-gray-400 hover:text-purple-300 transition-all"
                  aria-label={s}
                >
                  <span className="text-xs font-bold uppercase">{s[0]}</span>
                </a>
              ))}
            </div>
          </div>

          {/* Navegação */}
          <div>
            <h3 className="text-white font-semibold text-sm mb-4 uppercase tracking-wider">Navegação</h3>
            <ul className="space-y-2">
              {[
                { to: '/', label: 'Início' },
                { to: '/eventos', label: 'Todos os Eventos' },
                { to: '/meus-ingressos', label: 'Meus Ingressos' },
                { to: user ? '/perfil' : '/login?redirect=/perfil', label: 'Meu Perfil' },
                { to: '/contato', label: 'Contato' },
              ].map((item) => (
                <li key={item.to}>
                  <NavLink to={item.to}>{item.label}</NavLink>
                </li>
              ))}
            </ul>
          </div>

          {/* Categorias */}
          <div>
            <h3 className="text-white font-semibold text-sm mb-4 uppercase tracking-wider">Categorias</h3>
            <ul className="space-y-2">
              {['Rock', 'Sertanejo', 'Eletrônica', 'Pagode', 'Forró', 'MPB'].map((cat) => (
                <li key={cat}>
                  <NavLink to={`/eventos?categoria=${cat.toLowerCase()}`}>{cat}</NavLink>
                </li>
              ))}
            </ul>
          </div>

          {/* Suporte + Playground */}
          <div>
            <h3 className="text-white font-semibold text-sm mb-4 uppercase tracking-wider">Suporte</h3>
            <ul className="space-y-2">
              {[
                'Central de Ajuda',
                'Política de Reembolso',
                'Termos de Uso',
                'Privacidade',
                'Acessibilidade',
              ].map((item) => (
                <li key={item}>
                  <a href="#" onClick={(e) => e.preventDefault()} className="text-gray-400 hover:text-purple-300 text-sm transition-colors">
                    {item}
                  </a>
                </li>
              ))}
            </ul>

            <h3 className="text-white font-semibold text-sm mt-6 mb-3 uppercase tracking-wider flex items-center gap-2">
              <span>🤖</span> Playground Automação
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  id="footer-automacao-link"
                  data-cy="footer-automacao-link"
                  to="/automacao"
                  state={{ anchor: 'selectors-title' }}
                  onClick={scrollTop}
                  className="text-purple-400 hover:text-purple-300 text-sm transition-colors font-medium"
                >
                  Referência de Seletores
                </Link>
              </li>
              <li>
                <Link
                  id="footer-reset-link"
                  data-cy="footer-reset-link"
                  to="/automacao"
                  state={{ anchor: 'reset-state-card' }}
                  onClick={scrollTop}
                  className="text-purple-400 hover:text-purple-300 text-sm transition-colors font-medium"
                >
                  Resetar Estado
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-purple-900/30 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-gray-500 text-xs">
            © 2026 QA TEST TEMPLATE. Todos os direitos reservados. Projeto demonstrativo.
          </p>
          <div className="flex items-center gap-4">
            <span className="text-gray-500 text-xs">Formas de pagamento:</span>
            <div className="flex gap-2">
              {['Visa', 'MC', 'PIX', 'Boleto'].map((method) => (
                <span
                  key={method}
                  className="bg-white/10 text-gray-300 text-xs px-2 py-1 rounded font-medium"
                >
                  {method}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
