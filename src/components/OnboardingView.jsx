import React, { useState, useEffect } from 'react';
import {
  simpleHash,
  checkSlugAvailability,
  createBlankPortfolio,
  authenticateWithGoogleOAuth2,
} from '../services/authAndPortfolioStore';

/**
 * Pantalla 1 (Página Principal `/`): Inicio, Registro e Inicio de Sesión
 * Incluye monitoreo de estado de la ventana emergente de Google OAuth 2.0 para liberar
 * el botón automáticamente si el usuario cierra el popup sin seleccionar cuenta.
 */
export default function OnboardingView({
  db,
  onLoginSuccess,
  onRegisterNewPortfolio,
  onNavigate,
}) {
  const [authMode, setAuthMode] = useState('login'); // 'login' | 'register' | 'recover'
  const [slugInput, setSlugInput] = useState('mi-portafolio');
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [feedbackMsg, setFeedbackMsg] = useState('');
  const [oauthLoading, setOauthLoading] = useState(false);

  const slugCheck = checkSlugAvailability(db, slugInput);

  // Trigger reactivo adicional en el componente: revisa el estado del botón de Google OAuth
  // cuando la ventana principal recupera el foco o pasan más de 900ms tras cerrar el popup.
  useEffect(() => {
    if (!oauthLoading) return undefined;

    let focusTimeout = null;
    const checkPopupClosedOnFocus = () => {
      if (focusTimeout) clearTimeout(focusTimeout);
      focusTimeout = setTimeout(() => {
        setOauthLoading((prev) => (prev ? false : prev));
      }, 900);
    };

    window.addEventListener('focus', checkPopupClosedOnFocus);
    return () => {
      if (focusTimeout) clearTimeout(focusTimeout);
      window.removeEventListener('focus', checkPopupClosedOnFocus);
    };
  }, [oauthLoading]);

  const passwordStrength =
    passwordInput.length >= 10
      ? { label: 'Seguridad alta', color: 'text-secondary' }
      : passwordInput.length >= 6
      ? { label: 'Seguridad media', color: 'text-on-surface-variant' }
      : { label: 'Mín. 8 caracteres', color: 'text-outline' };

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMsg('');
    setFeedbackMsg('');

    const cleanEmail = emailInput.trim().toLowerCase();

    if (authMode === 'recover') {
      setFeedbackMsg(
        `Si el correo ${cleanEmail} está registrado, recibirá instrucciones o puede solicitar restablecimiento al administrador.`
      );
      return;
    }

    // MODO INICIAR SESIÓN
    if (authMode === 'login') {
      const enteredHash = simpleHash(passwordInput);

      // 1. Verificar si es el Super Administrador
      if (
        cleanEmail === (db.admin_config?.email || '').toLowerCase() &&
        enteredHash === db.admin_config?.password_hash
      ) {
        onLoginSuccess(
          {
            role: 'ADMIN',
            email: cleanEmail,
            authenticatedAt: new Date().toISOString(),
          },
          'admin'
        );
        return;
      }

      // 2. Verificar si es propietario de algún portafolio registrado
      const matchedPortfolio = (db.portfolios || []).find(
        (p) =>
          (p.owner_email?.toLowerCase() === cleanEmail ||
            p.slug?.toLowerCase() === cleanEmail.replace(/^@/, '')) &&
          p.owner_password_hash === enteredHash
      );

      if (matchedPortfolio) {
        onLoginSuccess(
          {
            role: 'USER',
            email: matchedPortfolio.owner_email,
            portfolioId: matchedPortfolio.id,
            slug: matchedPortfolio.slug,
            authenticatedAt: new Date().toISOString(),
          },
          'editor',
          matchedPortfolio.id
        );
        return;
      }

      setErrorMsg(
        'Correo o contraseña incorrectos. Verifica tus datos o crea una cuenta nueva.'
      );
      return;
    }

    // MODO REGISTRO: Crear una cuenta nueva aislada
    if (authMode === 'register') {
      if (!slugCheck.available) {
        setErrorMsg(
          `El enlace "${slugInput}" no está disponible (${slugCheck.reason}). Elige otro identificador.`
        );
        return;
      }

      const emailAlreadyUsed = (db.portfolios || []).some(
        (p) => p.owner_email?.toLowerCase() === cleanEmail
      );
      if (emailAlreadyUsed || cleanEmail === db.admin_config?.email?.toLowerCase()) {
        setErrorMsg(
          'Este correo electrónico ya tiene un portafolio registrado. Inicia sesión con tu contraseña.'
        );
        return;
      }

      if (passwordInput.length < 6) {
        setErrorMsg('La contraseña debe tener al menos 6 caracteres.');
        return;
      }

      const newProfile = createBlankPortfolio({
        slug: slugCheck.cleanSlug,
        email: cleanEmail,
        password: passwordInput,
        displayName: `@${slugCheck.cleanSlug}`,
      });

      onRegisterNewPortfolio(newProfile);
    }
  };

  // Inicio de sesión real con Google OAuth 2.0
  const handleGoogleSignIn = async () => {
    setErrorMsg('');
    setFeedbackMsg('');
    setOauthLoading(true);
    try {
      const googleUser = await authenticateWithGoogleOAuth2(db.google_client_id);
      const gEmail = googleUser.email.toLowerCase();

      // 1. Verificar si el correo de Google pertenece al Super Administrador
      if (gEmail === (db.admin_config?.email || '').toLowerCase()) {
        onLoginSuccess(
          {
            role: 'ADMIN',
            email: gEmail,
            name: googleUser.name,
            authenticatedAt: new Date().toISOString(),
          },
          'admin'
        );
        return;
      }

      // 2. Verificar si ya tiene un portafolio asignado
      const existingPortfolio = (db.portfolios || []).find(
        (p) => p.owner_email?.toLowerCase() === gEmail
      );

      if (existingPortfolio) {
        onLoginSuccess(
          {
            role: 'USER',
            email: gEmail,
            portfolioId: existingPortfolio.id,
            slug: existingPortfolio.slug,
            authenticatedAt: new Date().toISOString(),
          },
          'editor',
          existingPortfolio.id
        );
        return;
      }

      // 3. Si es un usuario nuevo con Google, crear su propio portafolio aislado
      const baseSlug = (gEmail.split('@')[0] || 'creador')
        .toLowerCase()
        .replace(/[^a-z0-9._-]/g, '');
      const check = checkSlugAvailability(db, baseSlug);
      const finalSlug = check.available
        ? check.cleanSlug
        : `${baseSlug}-${Math.floor(100 + Math.random() * 900)}`;

      const createdProfile = createBlankPortfolio({
        slug: finalSlug,
        email: gEmail,
        password: `GoogleOAuth_${googleUser.sub || Date.now()}`,
        displayName: `@${finalSlug}`,
        avatarUrl: googleUser.picture,
      });

      onRegisterNewPortfolio(createdProfile);
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setOauthLoading(false);
    }
  };

  return (
    <div className="bg-surface text-on-surface min-h-screen flex flex-col antialiased">
      {/* Cabecera Superior */}
      <header className="sticky top-0 inset-x-0 z-40 bg-surface/80 backdrop-blur-xl border-b border-outline-variant/15 shadow-[0_1px_8px_rgba(0,0,0,0.4)]">
        <div className="max-w-lg mx-auto h-16 px-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-h-[44px]">
            <img
              src="/favicon.png"
              alt="Logo LinkPortfolio"
              className="w-8 h-8 rounded-lg object-contain shadow-sm"
            />
            <span className="font-headline-sm text-headline-sm text-primary tracking-tight">
              LinkPortfolio
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => {
                setErrorMsg('');
                setAuthMode(authMode === 'login' ? 'register' : 'login');
              }}
              className="h-9 px-3 rounded-lg inline-flex items-center justify-center font-label-md text-label-md text-on-surface-variant hover:text-primary hover:bg-surface-container transition-colors"
            >
              {authMode === 'login' ? 'Crear cuenta' : 'Iniciar sesión'}
            </button>

            <button
              type="button"
              onClick={() => onNavigate('admin')}
              className="h-9 px-3 rounded-lg bg-surface-container-high hover:bg-surface-container-highest text-secondary font-label-sm text-label-sm flex items-center gap-1 transition-colors"
              title="Acceso exclusivo para Administrador"
            >
              <span className="material-symbols-outlined text-[16px]">
                admin_panel_settings
              </span>
              <span>Admin</span>
            </button>
          </div>
        </div>
      </header>

      {/* Contenido Principal */}
      <main className="flex-1 flex flex-col relative w-full max-w-md mx-auto pt-4 pb-24 px-4">
        {/* Micro-Banner */}
        <div className="w-full flex items-center justify-center pt-2 pb-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-container-high/60 backdrop-blur-md border border-outline-variant/20">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-secondary" />
            </span>
            <span className="font-label-sm text-label-sm uppercase tracking-wider text-secondary">
              Plataforma de Portafolios Web
            </span>
          </div>
        </div>

        {/* Selector de Pestañas Login / Registro */}
        <div className="w-full bg-surface-container-lowest p-1 rounded-xl flex items-center gap-1 mb-5 border border-outline-variant/20">
          <button
            type="button"
            onClick={() => {
              setErrorMsg('');
              setAuthMode('login');
            }}
            className={`flex-1 h-10 rounded-lg font-label-lg text-label-lg transition-all ${
              authMode === 'login'
                ? 'bg-primary text-on-primary font-semibold'
                : 'text-on-surface-variant hover:text-primary'
            }`}
          >
            Iniciar Sesión
          </button>
          <button
            type="button"
            onClick={() => {
              setErrorMsg('');
              setAuthMode('register');
            }}
            className={`flex-1 h-10 rounded-lg font-label-lg text-label-lg transition-all ${
              authMode === 'register'
                ? 'bg-primary text-on-primary font-semibold'
                : 'text-on-surface-variant hover:text-primary'
            }`}
          >
            Crear Cuenta
          </button>
        </div>

        {/* Hero Section */}
        <div className="text-center px-2 mb-5">
          <h1 className="font-headline-xl-mobile text-headline-xl-mobile text-primary font-bold tracking-tight mb-2">
            {authMode === 'register' && 'Tu portafolio social en segundos.'}
            {authMode === 'login' && 'Accede a tu panel de edición.'}
            {authMode === 'recover' && 'Recuperación de acceso.'}
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant max-w-[340px] mx-auto leading-relaxed">
            {authMode === 'login' &&
              'Ingresa con tus credenciales o con tu cuenta de Google para gestionar tus redes sociales.'}
            {authMode === 'register' &&
              'Una foto de perfil, tu fondo favorito y todas tus redes sociales en un solo enlace.'}
            {authMode === 'recover' &&
              'Ingresa tu correo registrado para solicitar restablecimiento.'}
          </p>
        </div>

        {/* Reclamo de Ruta Personalizada (SOLO en modo Registro) */}
        {authMode === 'register' && (
          <div className="bg-surface-container-low rounded-xl p-4 sm:p-5 mb-5 shadow-lg relative overflow-hidden border border-outline-variant/20">
            <div className="flex items-center justify-between mb-3">
              <label
                htmlFor="claimed-slug"
                className="font-label-md text-label-md text-on-surface-variant font-medium flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[16px] text-secondary">
                  alternate_email
                </span>
                Reclama tu enlace único
              </label>
              <span className="font-label-sm text-label-sm text-on-surface-variant/70 uppercase tracking-wider">
                Verificación en vivo
              </span>
            </div>

            <div className="relative bg-surface-container rounded-lg px-3.5 py-2.5 flex items-center justify-between transition-colors focus-within:bg-surface-container-high border border-outline-variant/20">
              <div className="flex items-center min-w-0 flex-1 mr-2">
                <span className="font-body-md text-body-md text-outline select-none shrink-0 font-normal">
                  portafolio.app/
                </span>
                <input
                  id="claimed-slug"
                  type="text"
                  value={slugInput}
                  onChange={(e) =>
                    setSlugInput(e.target.value.toLowerCase().replace(/\s+/g, ''))
                  }
                  placeholder="tu-usuario"
                  className="bg-transparent border-0 outline-none font-label-lg text-label-lg text-primary font-medium w-full min-w-0 p-0 focus:ring-0 ml-0.5 tracking-tight"
                />
              </div>

              {slugCheck.available ? (
                <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-secondary-container/20 shrink-0">
                  <span
                    className="material-symbols-outlined text-secondary text-[15px]"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    check_circle
                  </span>
                  <span className="font-label-sm text-label-sm text-secondary font-semibold">
                    Disponible
                  </span>
                </div>
              ) : (
                <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-error-container/30 shrink-0">
                  <span className="material-symbols-outlined text-error text-[15px]">
                    lock
                  </span>
                  <span className="font-label-sm text-label-sm text-error font-semibold">
                    {slugCheck.reason}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {errorMsg && (
          <div className="mb-4 p-3.5 rounded-xl bg-error-container/30 border border-error/40 text-error font-body-sm text-body-sm flex items-start gap-2">
            <span className="material-symbols-outlined text-[18px] shrink-0 mt-0.5">
              error
            </span>
            <span>{errorMsg}</span>
          </div>
        )}

        {feedbackMsg && (
          <div className="mb-4 p-3.5 rounded-xl bg-secondary-container/20 border border-secondary/30 text-secondary font-body-sm text-body-sm">
            {feedbackMsg}
          </div>
        )}

        {/* Formulario de Autenticación */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-3.5 mb-5">
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="email-input"
              className="font-label-md text-label-md text-on-surface font-medium flex items-center justify-between"
            >
              <span>Correo electrónico</span>
              <span className="text-outline text-label-sm font-normal">Privado</span>
            </label>
            <div className="relative bg-surface-container rounded-lg flex items-center px-3.5 py-3 transition-colors focus-within:bg-surface-container-high border border-outline-variant/20">
              <span className="material-symbols-outlined text-outline text-[20px] mr-3 select-none">
                mail
              </span>
              <input
                id="email-input"
                type="email"
                required
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                placeholder="correo@ejemplo.com"
                className="w-full bg-transparent border-0 outline-none text-primary font-body-md text-body-md placeholder:text-outline p-0 focus:ring-0"
              />
            </div>
          </div>

          {authMode !== 'recover' && (
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="password-input"
                  className="font-label-md text-label-md text-on-surface font-medium"
                >
                  Contraseña
                </label>
                {authMode === 'register' && (
                  <span className={`font-label-sm text-label-sm ${passwordStrength.color}`}>
                    {passwordStrength.label}
                  </span>
                )}
              </div>
              <div className="relative bg-surface-container rounded-lg flex items-center px-3.5 py-3 transition-colors focus-within:bg-surface-container-high border border-outline-variant/20">
                <span className="material-symbols-outlined text-outline text-[20px] mr-3 select-none">
                  lock
                </span>
                <input
                  id="password-input"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-transparent border-0 outline-none text-primary font-body-md text-body-md placeholder:text-outline p-0 focus:ring-0"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label="Alternar visibilidad de contraseña"
                  className="ml-2 text-outline hover:text-primary transition-colors focus:outline-none flex items-center"
                >
                  <span className="material-symbols-outlined text-[20px]">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>

              <div className="flex justify-end items-center pt-0.5">
                <button
                  type="button"
                  onClick={() => setAuthMode('recover')}
                  className="font-body-sm text-body-sm text-outline hover:text-primary transition-colors"
                >
                  ¿Olvidaste tu contraseña?
                </button>
              </div>
            </div>
          )}

          <button
            type="submit"
            className="mt-2 w-full h-12 bg-primary text-on-primary font-label-lg text-label-lg font-semibold rounded-lg flex items-center justify-center gap-2 transition-all active:scale-[0.985] hover:opacity-95 shadow-md shadow-primary/10 cursor-pointer"
          >
            <span>
              {authMode === 'login' && 'Iniciar sesión'}
              {authMode === 'register' && 'Crear mi portafolio'}
              {authMode === 'recover' && 'Solicitar recuperación'}
            </span>
            <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
          </button>

          {authMode === 'recover' && (
            <button
              type="button"
              onClick={() => setAuthMode('login')}
              className="w-full h-10 rounded-lg text-on-surface-variant hover:text-primary font-label-md text-label-md"
            >
              Volver a iniciar sesión
            </button>
          )}
        </form>

        {/* Inicio de Sesión con Google OAuth 2.0 */}
        {authMode !== 'recover' && (
          <>
            <div className="flex items-center gap-3 my-2">
              <div className="flex-1 h-[1px] bg-surface-container-highest" />
              <span className="font-label-sm text-label-sm text-outline font-normal select-none">
                o continúa con
              </span>
              <div className="flex-1 h-[1px] bg-surface-container-highest" />
            </div>

            <div className="mt-3 mb-6">
              <button
                type="button"
                onClick={handleGoogleSignIn}
                className="w-full h-12 bg-surface-container hover:bg-surface-container-high text-primary font-label-lg text-label-lg font-medium rounded-lg flex items-center justify-center gap-3 transition-all active:scale-[0.985] border border-outline-variant/20 cursor-pointer"
              >
                <svg aria-hidden="true" className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    fill="#EA4335"
                  />
                </svg>
                <span>
                  {oauthLoading ? 'Esperando selección en Google...' : 'Continuar con Google'}
                </span>
              </button>
            </div>
          </>
        )}

        <footer className="text-center px-4 mt-auto pt-4">
          <p className="font-body-sm text-body-sm text-outline leading-snug">
            Al usar LinkPortfolio aceptas los{' '}
            <span className="text-on-surface-variant underline">Términos de Servicio</span> y la{' '}
            <span className="text-on-surface-variant underline">Política de Privacidad</span>.
          </p>
        </footer>
      </main>
    </div>
  );
}
