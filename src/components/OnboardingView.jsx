import React, { useState } from 'react';

const RESERVED_SLUGS = ['admin', 'login', 'settings', 'api', 'root', 'support'];

/**
 * Pantalla 1: Inicio, Registro e Inicio de Sesión (Onboarding)
 * Basado en el mockup "LinkPortfolio - Onboarding y Registro" de Google Stitch AI (RF-01, RF-02).
 */
export default function OnboardingView({
  portfolio,
  onUpdatePortfolio,
  onNavigate,
}) {
  const [authMode, setAuthMode] = useState('register'); // 'register' | 'login' | 'recover'
  const [slugInput, setSlugInput] = useState(portfolio.slug || 'its.araaaby');
  const [emailInput, setEmailInput] = useState(portfolio.email || 'its.araaaby@portafolio.app');
  const [passwordInput, setPasswordInput] = useState('Araaaby2026#');
  const [showPassword, setShowPassword] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState('');

  const trimmedSlug = slugInput.trim().toLowerCase().replace(/[^a-z0-9._-]/g, '');
  const isTooShort = trimmedSlug.length < 3;
  const isReserved = RESERVED_SLUGS.includes(trimmedSlug);
  const isAvailable = !isTooShort && !isReserved;

  const passwordStrength =
    passwordInput.length >= 10
      ? { label: 'Seguridad alta', color: 'text-secondary' }
      : passwordInput.length >= 6
      ? { label: 'Seguridad media', color: 'text-on-surface-variant' }
      : { label: 'Muy corta', color: 'text-error' };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (authMode === 'recover') {
      setFeedbackMsg(
        `Hemos enviado un enlace de recuperación de contraseña a ${emailInput || 'tu correo'}.`
      );
      return;
    }

    if (!isAvailable && authMode === 'register') return;

    const finalSlug = trimmedSlug || 'its.araaaby';
    onUpdatePortfolio({
      ...portfolio,
      slug: finalSlug,
      display_name: portfolio.display_name || `@${finalSlug}`,
      email: emailInput,
    });
    onNavigate('editor');
  };

  const handleGoogleAccess = () => {
    const finalSlug = isAvailable ? trimmedSlug : portfolio.slug || 'its.araaaby';
    onUpdatePortfolio({
      ...portfolio,
      slug: finalSlug,
      email: emailInput || 'its.araaaby@gmail.com',
    });
    onNavigate('editor');
  };

  return (
    <div className="bg-surface text-on-surface min-h-screen flex flex-col antialiased">
      {/* Cabecera Superior Estilo Stitch */}
      <header className="sticky top-0 inset-x-0 z-40 bg-surface/80 backdrop-blur-xl border-b border-outline-variant/15 shadow-[0_1px_8px_rgba(0,0,0,0.4)]">
        <div className="max-w-lg mx-auto h-16 px-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-h-[44px]">
            <div className="w-8 h-8 rounded-lg bg-primary text-on-primary flex items-center justify-center font-bold text-sm shadow-sm">
              LP
            </div>
            <span className="font-headline-sm text-headline-sm text-primary tracking-tight">
              LinkPortfolio
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() =>
                setAuthMode(authMode === 'login' ? 'register' : 'login')
              }
              className="min-h-[40px] px-3 rounded-lg inline-flex items-center justify-center font-label-lg text-label-lg text-on-surface-variant hover:text-primary hover:bg-surface-container transition-colors"
            >
              {authMode === 'login' ? 'Crear cuenta' : 'Iniciar sesión'}
            </button>
          </div>
        </div>
      </header>

      {/* Contenido Principal Centrado */}
      <main className="flex-1 flex flex-col relative w-full max-w-md mx-auto pt-4 pb-28 px-4">
        {/* Micro-Banner Interactivo con Pulso Esmeralda */}
        <div className="w-full flex items-center justify-center pt-2 pb-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-container-high/60 backdrop-blur-md border border-outline-variant/20">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-secondary" />
            </span>
            <span className="font-label-sm text-label-sm uppercase tracking-wider text-secondary">
              Edición Creadores • Portafolio Web
            </span>
          </div>
        </div>

        {/* Hero Section */}
        <div className="text-center px-2 mb-6">
          <h1 className="font-headline-xl-mobile text-headline-xl-mobile text-primary font-bold tracking-tight mb-2">
            {authMode === 'register' && 'Tu portafolio social en segundos.'}
            {authMode === 'login' && 'Bienvenido de nuevo a LinkPortfolio.'}
            {authMode === 'recover' && 'Recupera el acceso a tu cuenta.'}
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant max-w-[330px] mx-auto leading-relaxed">
            {authMode === 'recover'
              ? 'Ingresa tu correo electrónico y te enviaremos un enlace seguro para restablecer tu contraseña.'
              : 'Una foto de perfil, tu fondo favorito y todas tus cuentas en un solo enlace.'}
          </p>
        </div>

        {/* Tarjeta Interactiva de Reclamo de Ruta Personalizada (Slug - RF-02) */}
        {authMode !== 'recover' && (
          <div className="bg-surface-container-low rounded-xl p-4 sm:p-5 mb-5 shadow-lg relative overflow-hidden group border border-outline-variant/20">
            <div className="absolute -right-8 -top-8 w-28 h-28 bg-secondary/10 rounded-full blur-2xl pointer-events-none transition-opacity duration-500 group-hover:opacity-100" />
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
                Paso 1 de 2
              </span>
            </div>

            {/* Caja Compuesta de Entrada de URL */}
            <div className="relative bg-surface-container rounded-lg px-3.5 py-2.5 flex items-center justify-between transition-colors focus-within:bg-surface-container-high border border-outline-variant/20">
              <div className="flex items-center min-w-0 flex-1 mr-2">
                <span className="font-body-md text-body-md text-outline select-none shrink-0 font-normal">
                  portafolio.app/
                </span>
                <input
                  id="claimed-slug"
                  type="text"
                  aria-label="Nombre de usuario personalizado"
                  value={slugInput}
                  onChange={(e) =>
                    setSlugInput(e.target.value.toLowerCase().replace(/\s+/g, ''))
                  }
                  placeholder="its.araaaby"
                  className="bg-transparent border-0 outline-none font-label-lg text-label-lg text-primary font-medium w-full min-w-0 p-0 focus:ring-0 ml-0.5 tracking-tight"
                />
              </div>

              {/* Indicador de Disponibilidad en Tiempo Real */}
              {isAvailable ? (
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
                    error
                  </span>
                  <span className="font-label-sm text-label-sm text-error font-semibold">
                    {isTooShort ? 'Muy corto' : 'No disponible'}
                  </span>
                </div>
              )}
            </div>

            <div className="mt-3.5 pt-3 border-t border-outline-variant/15 flex items-center justify-between text-on-surface-variant/80">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-6 h-6 rounded-full bg-surface-container-highest flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[14px] text-primary">
                    public
                  </span>
                </div>
                <p className="font-body-sm text-body-sm truncate text-on-surface-variant">
                  Portafolio activo:{' '}
                  <span className="text-primary font-medium">@{trimmedSlug || 'its.araaaby'}</span>
                </p>
              </div>
              <span className="material-symbols-outlined text-[16px] text-secondary">
                auto_awesome
              </span>
            </div>
          </div>
        )}

        {feedbackMsg && (
          <div className="mb-4 p-3.5 rounded-xl bg-secondary-container/20 border border-secondary/30 text-secondary font-body-sm text-body-sm flex items-center justify-between">
            <span>{feedbackMsg}</span>
            <button
              type="button"
              onClick={() => {
                setFeedbackMsg('');
                setAuthMode('login');
              }}
              className="underline font-semibold ml-2"
            >
              Iniciar sesión
            </button>
          </div>
        )}

        {/* Formulario de Autenticación (RF-01) */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-3.5 mb-5">
          {/* Campo Correo Electrónico */}
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
                placeholder="its.araaaby@portafolio.app"
                className="w-full bg-transparent border-0 outline-none text-primary font-body-md text-body-md placeholder:text-outline p-0 focus:ring-0"
              />
            </div>
          </div>

          {/* Campo Contraseña (visible en Registro e Inicio de Sesión) */}
          {authMode !== 'recover' && (
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="password-input"
                  className="font-label-md text-label-md text-on-surface font-medium"
                >
                  Contraseña
                </label>
                <span className={`font-label-sm text-label-sm ${passwordStrength.color}`}>
                  {passwordStrength.label}
                </span>
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
                  placeholder="Mínimo 8 caracteres"
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

              {/* Enlace de Recuperación de Contraseña */}
              <div className="flex justify-end pt-0.5">
                <button
                  type="button"
                  onClick={() => {
                    setFeedbackMsg('');
                    setAuthMode('recover');
                  }}
                  className="font-body-sm text-body-sm text-outline hover:text-primary transition-colors"
                >
                  ¿Olvidaste tu contraseña?
                </button>
              </div>
            </div>
          )}

          {/* Botón Principal de Acción */}
          <button
            type="submit"
            className="mt-2 w-full h-12 bg-primary text-on-primary font-label-lg text-label-lg font-semibold rounded-lg flex items-center justify-center gap-2 transition-all active:scale-[0.985] hover:opacity-95 shadow-md shadow-primary/10 cursor-pointer"
          >
            <span>
              {authMode === 'register' && 'Crear y configurar mi portafolio'}
              {authMode === 'login' && 'Entrar al panel de edición'}
              {authMode === 'recover' && 'Enviar correo de recuperación'}
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

        {/* Separador y Acceso con Google OAuth (Stitch 1) */}
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
                onClick={handleGoogleAccess}
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
                <span>Continuar con Google</span>
              </button>
            </div>
          </>
        )}

        {/* Prueba Social de Creadores (Stitch 1) */}
        <div className="bg-surface-container-lowest rounded-xl p-3.5 mb-6 flex items-center justify-between border border-outline-variant/15">
          <div className="flex items-center gap-3">
            <img
              src={portfolio.avatar_url || '/avatar-its-araaaby.jpeg'}
              alt="Creadora destacada"
              className="w-8 h-8 rounded-full object-cover ring-1 ring-secondary/50"
            />
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              Portafolio activo de prueba:{' '}
              <button
                type="button"
                onClick={() => onNavigate('public')}
                className="font-semibold text-primary underline hover:text-secondary"
              >
                @its.araaaby
              </button>
            </p>
          </div>
          <span className="material-symbols-outlined text-secondary text-[18px]">verified</span>
        </div>

        <footer className="text-center px-4">
          <p className="font-body-sm text-body-sm text-outline leading-snug">
            Al registrarte aceptas los{' '}
            <span className="text-on-surface-variant underline">Términos de Uso</span> y la{' '}
            <span className="text-on-surface-variant underline">Política de Privacidad</span>.
          </p>
        </footer>
      </main>
    </div>
  );
}
