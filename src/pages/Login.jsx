import { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { formatCPF, formatPhone } from '../utils/mockPayment';

function LoginForm({ onSuccess }) {
  const { login } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handle = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.email || !form.password) { setError('Preencha todos os campos.'); return; }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 600));
    const result = login(form.email, form.password);
    setLoading(false);
    if (result.success) onSuccess();
    else setError(result.error);
  };

  return (
    <form id="login-form" data-cy="login-form" onSubmit={handle} noValidate className="space-y-4">
      <div>
        <label htmlFor="login-email" className="block text-gray-300 text-sm font-medium mb-2">
          E-mail
        </label>
        <input
          id="login-email"
          data-cy="login-email"
          type="email"
          placeholder="seu@email.com"
          value={form.email}
          onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
          className="w-full bg-[#0f0f1a] border border-purple-900/40 focus:border-purple-500 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none transition-colors"
        />
      </div>
      <div>
        <label htmlFor="login-password" className="block text-gray-300 text-sm font-medium mb-2">
          Senha
        </label>
        <input
          id="login-password"
          data-cy="login-password"
          type="password"
          placeholder="••••••••"
          value={form.password}
          onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
          className="w-full bg-[#0f0f1a] border border-purple-900/40 focus:border-purple-500 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none transition-colors"
        />
      </div>

      {error && (
        <div id="login-error" data-cy="login-error" className="bg-red-900/20 border border-red-700/40 rounded-xl p-3">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      <button
        id="login-submit-btn"
        data-cy="login-submit-btn"
        type="submit"
        disabled={loading}
        className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 disabled:opacity-50 text-white font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2"
      >
        {loading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : null}
        {loading ? 'Entrando...' : 'Entrar'}
      </button>

      <div className="bg-blue-900/20 border border-blue-700/30 rounded-xl p-3 mt-2">
        <p className="text-blue-300 text-xs font-medium mb-1">💡 Conta de demonstração:</p>
        <p className="text-blue-400/80 text-xs">Cadastre-se para criar uma conta ou use qualquer e-mail já registrado. Nenhum dado é armazenado em servidores ou compartilhado com terceiros — tudo fica salvo apenas na sua própria máquina.</p>
      </div>
    </form>
  );
}

function RegisterForm({ onSuccess }) {
  const { register } = useAuth();
  const [form, setForm] = useState({
    name: '', email: '', cpf: '', phone: '', birthdate: '', password: '', confirmPassword: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Nome é obrigatório';
    if (!form.email.trim()) e.email = 'E-mail é obrigatório';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'E-mail inválido';
    if (!form.cpf.trim()) e.cpf = 'CPF é obrigatório';
    else if (form.cpf.replace(/\D/g, '').length < 11) e.cpf = 'CPF inválido';
    if (!form.phone.trim()) e.phone = 'Telefone é obrigatório';
    if (!form.birthdate) e.birthdate = 'Data de nascimento obrigatória';
    if (!form.password) e.password = 'Senha é obrigatória';
    else if (form.password.length < 6) e.password = 'Mínimo 6 caracteres';
    if (form.password !== form.confirmPassword) e.confirmPassword = 'Senhas não conferem';
    return e;
  };

  const handle = async (e) => {
    e.preventDefault();
    setApiError('');
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 700));
    const result = register(form);
    setLoading(false);
    if (result.success) onSuccess();
    else setApiError(result.error);
  };

  const fields = [
    { id: 'reg-name', key: 'name', label: 'Nome Completo', type: 'text', placeholder: 'João da Silva', full: true },
    { id: 'reg-email', key: 'email', label: 'E-mail', type: 'email', placeholder: 'seu@email.com' },
    { id: 'reg-cpf', key: 'cpf', label: 'CPF', type: 'text', placeholder: '000.000.000-00' },
    { id: 'reg-phone', key: 'phone', label: 'Telefone', type: 'tel', placeholder: '(11) 99999-9999' },
    { id: 'reg-birthdate', key: 'birthdate', label: 'Data de Nascimento', type: 'date', placeholder: '' },
    { id: 'reg-password', key: 'password', label: 'Senha', type: 'password', placeholder: '••••••••' },
    { id: 'reg-confirm-password', key: 'confirmPassword', label: 'Confirmar Senha', type: 'password', placeholder: '••••••••' },
  ];

  return (
    <form id="register-form" data-cy="register-form" onSubmit={handle} noValidate className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {fields.map((f) => (
          <div key={f.key} className={f.full ? 'sm:col-span-2' : ''}>
            <label htmlFor={f.id} className="block text-gray-300 text-sm font-medium mb-2">
              {f.label} <span className="text-pink-500">*</span>
            </label>
            <input
              id={f.id}
              data-cy={f.id}
              type={f.type}
              placeholder={f.placeholder}
              value={form[f.key]}
              onChange={(e) => {
                let v = e.target.value;
                if (f.key === 'cpf') v = formatCPF(v);
                if (f.key === 'phone') v = formatPhone(v);
                set(f.key, v);
              }}
              className={`w-full bg-[#0f0f1a] border rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none transition-colors ${
                errors[f.key] ? 'border-red-500 focus:border-red-400' : 'border-purple-900/40 focus:border-purple-500'
              }`}
            />
            {errors[f.key] && (
              <p id={`error-${f.id}`} data-cy={`error-${f.id}`} className="text-red-400 text-xs mt-1">
                {errors[f.key]}
              </p>
            )}
          </div>
        ))}
      </div>

      {apiError && (
        <div id="register-api-error" data-cy="register-api-error" className="bg-red-900/20 border border-red-700/40 rounded-xl p-3">
          <p className="text-red-400 text-sm">{apiError}</p>
        </div>
      )}

      <button
        id="register-submit-btn"
        data-cy="register-submit-btn"
        type="submit"
        disabled={loading}
        className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 disabled:opacity-50 text-white font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2"
      >
        {loading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : null}
        {loading ? 'Criando conta...' : 'Criar Conta Grátis'}
      </button>
    </form>
  );
}

export default function Login() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const redirect = searchParams.get('redirect') || '/';
  const initialTab = searchParams.get('tab') === 'register' ? 'register' : 'login';
  const [tab, setTab] = useState(initialTab);

  if (user) { navigate(redirect, { replace: true }); return null; }

  const onSuccess = () => navigate(redirect, { replace: true });

  return (
    <main id="login-page" data-cy="login-page" className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-purple-900/50">
              ST
            </div>
          </div>
          <h1 className="text-white text-3xl font-black mb-1">
            {tab === 'login' ? 'Bem-vindo de volta!' : 'Crie sua conta'}
          </h1>
          <p className="text-gray-400">
            {tab === 'login'
              ? 'Entre para acessar seus ingressos e continuar comprando.'
              : 'É rápido, gratuito e seguro.'}
          </p>
        </div>

        {/* Card */}
        <div className="bg-[#13131f] border border-purple-900/30 rounded-2xl overflow-hidden shadow-2xl shadow-purple-900/20">
          {/* Tabs */}
          <div id="auth-tabs" data-cy="auth-tabs" className="flex border-b border-purple-900/30">
            {[
              { id: 'tab-login', value: 'login', label: 'Entrar' },
              { id: 'tab-register', value: 'register', label: 'Criar Conta' },
            ].map((t) => (
              <button
                key={t.value}
                id={t.id}
                data-cy={t.id}
                data-active={tab === t.value}
                onClick={() => setTab(t.value)}
                className={`flex-1 py-4 text-sm font-bold transition-all ${
                  tab === t.value
                    ? 'text-white border-b-2 border-purple-500 bg-purple-900/10'
                    : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Form */}
          <div className="p-6 md:p-8">
            {tab === 'login' ? (
              <LoginForm onSuccess={onSuccess} />
            ) : (
              <RegisterForm onSuccess={onSuccess} />
            )}
          </div>

          {/* Footer */}
          <div className="px-6 md:px-8 pb-6 text-center">
            <p className="text-gray-500 text-sm">
              {tab === 'login' ? (
                <>
                  Não tem conta?{' '}
                  <button
                    id="switch-to-register"
                    data-cy="switch-to-register"
                    onClick={() => setTab('register')}
                    className="text-purple-400 hover:text-purple-300 font-semibold transition-colors"
                  >
                    Cadastre-se grátis
                  </button>
                </>
              ) : (
                <>
                  Já tem conta?{' '}
                  <button
                    id="switch-to-login"
                    data-cy="switch-to-login"
                    onClick={() => setTab('login')}
                    className="text-purple-400 hover:text-purple-300 font-semibold transition-colors"
                  >
                    Entrar
                  </button>
                </>
              )}
            </p>
          </div>
        </div>

        {/* Back */}
        <div className="text-center mt-6">
          <Link
            id="back-to-events-link"
            data-cy="back-to-events-link"
            to="/eventos"
            className="text-gray-500 hover:text-gray-300 text-sm transition-colors"
          >
            ← Voltar para eventos
          </Link>
        </div>
      </div>
    </main>
  );
}
