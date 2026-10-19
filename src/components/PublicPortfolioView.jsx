import React from 'react';
import {
  getActivePortfolioLinks,
  getEffectiveBackgroundImage,
  DEFAULT_NEUTRAL_AVATAR,
} from '../data/socialCatalog';

/**
 * Pantalla 3: Vista Pública del Portafolio (Experiencia del Visitante)
 * En producción: 100% limpia y bloqueada contra ediciones de visitantes no autenticados.
 */
export default function PublicPortfolioView({
  portfolio,
  isSimulator = false,
  canEdit = false,
  onNavigate,
}) {
  const activeLinks = getActivePortfolioLinks(portfolio);
  const effectiveBgImage = getEffectiveBackgroundImage(portfolio);
  const isImageMode =
    portfolio.background_type === 'IMAGE' && Boolean(effectiveBgImage);
  const overlayOpacity = Math.min(
    80,
    Math.max(0, Number(portfolio.background_overlay_opacity ?? 40))
  );

  const formattedHandle = (portfolio.display_name || portfolio.slug || 'usuario')
    .trim()
    .startsWith('@')
    ? (portfolio.display_name || portfolio.slug).trim()
    : `@${(portfolio.display_name || portfolio.slug || 'usuario').trim()}`;

  // Modo Mantenimiento / Borrador (Pantalla 4: Interruptor de privacidad desactivado)
  if (!portfolio.is_published && !isSimulator) {
    return (
      <div className="min-h-screen w-full bg-[#000000] text-on-surface flex flex-col items-center justify-center px-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-surface-container-low border border-outline-variant/30 flex items-center justify-center text-secondary mb-4 shadow-xl">
          <span className="material-symbols-outlined text-[32px]">lock_clock</span>
        </div>
        <h1 className="font-headline-md text-headline-md text-primary mb-2">
          Portafolio en Mantenimiento
        </h1>
        <p className="font-body-md text-body-md text-on-surface-variant max-w-sm mb-6">
          El portafolio <span className="text-primary font-mono">{formattedHandle}</span> se
          encuentra temporalmente privado.
        </p>
        {canEdit && onNavigate ? (
          <button
            type="button"
            onClick={() => onNavigate('settings')}
            className="h-11 px-5 rounded-xl bg-primary text-on-primary font-label-lg text-label-lg font-semibold flex items-center gap-2 hover:opacity-90 transition-all"
          >
            <span className="material-symbols-outlined text-[18px]">tune</span>
            <span>Reactivar desde Configuración</span>
          </button>
        ) : (
          onNavigate && (
            <button
              type="button"
              onClick={() => onNavigate('onboarding')}
              className="h-10 px-4 rounded-xl bg-surface-container-low text-outline hover:text-primary font-label-sm text-label-sm transition-colors"
            >
              Acceso Propietario
            </button>
          )
        )}
      </div>
    );
  }

  return (
    <div
      className={`relative w-full flex flex-col justify-between items-center select-none overflow-x-hidden transition-colors duration-300 bg-[#000000] ${
        isSimulator ? 'min-h-full rounded-[32px]' : 'min-h-screen'
      }`}
    >
      {/* Imagen de fondo personalizada o foto de perfil predeterminada + Capa de oscurecimiento (RF-05) */}
      {isImageMode && (
        <div
          className={`${
            isSimulator ? 'absolute' : 'fixed'
          } inset-0 pointer-events-none z-0 overflow-hidden`}
        >
          <img
            key={effectiveBgImage.slice(-64)}
            src={effectiveBgImage}
            alt=""
            aria-hidden="true"
            className="w-full h-full object-cover object-center"
          />
          <div
            className="absolute inset-0 transition-opacity duration-200"
            style={{
              backgroundColor: `rgba(0, 0, 0, ${overlayOpacity / 100})`,
              backdropFilter: 'contrast(1.03)',
            }}
          />
        </div>
      )}

      {/* Contenedor central (máximo 480px de ancho según Sección 3 - Pantalla 3) */}
      <div
        className={`relative z-10 w-full max-w-[440px] mx-auto flex flex-col justify-between items-center ${
          isSimulator ? 'px-5 py-7 min-h-[680px]' : 'px-6 py-10 min-h-screen'
        }`}
      >
        {/* Barra superior de estado / disponibilidad (Estilo Stitch 3B) */}
        <div className="w-full flex justify-between items-center">
          {!portfolio.is_published && isSimulator ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-error-container/60 text-error backdrop-blur-md border border-error/30">
              <span className="w-1.5 h-1.5 rounded-full bg-error" />
              Oculto (Borrador)
            </span>
          ) : (
            <span />
          )}

          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium tracking-wide ${
              isImageMode
                ? 'bg-white/10 text-white/90 backdrop-blur-md border border-white/15'
                : 'bg-surface-container-low text-on-surface-variant border border-outline-variant/25'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse" />
            Disponible
          </span>
        </div>

        {/* Cabecera del Perfil + Contenedor de Redes Sociales */}
        <main className="w-full flex flex-col items-center gap-6 my-auto py-4">
          <header className="flex flex-col items-center text-center w-full">
            <div className="relative group">
              <div
                className={`w-[104px] h-[104px] rounded-full p-[2px] shadow-2xl transition-transform duration-300 hover:scale-[1.02] ${
                  isImageMode
                    ? 'bg-gradient-to-tr from-white/40 via-white/15 to-white/40 backdrop-blur-sm'
                    : 'bg-gradient-to-b from-primary/35 to-surface-variant/25'
                }`}
              >
                <div className="w-full h-full rounded-full overflow-hidden bg-surface-container border-2 border-white/20">
                  <img
                    src={portfolio.avatar_url || DEFAULT_NEUTRAL_AVATAR}
                    alt={`Foto de perfil de ${formattedHandle}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              <span className="absolute bottom-1 right-1 z-20 flex h-3.5 w-3.5 items-center justify-center">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-secondary shadow-sm" />
              </span>
            </div>

            <div className="mt-3.5 flex items-center justify-center gap-1.5">
              <h1
                className={`font-headline-sm text-headline-sm tracking-tight ${
                  isImageMode ? 'text-white drop-shadow-sm font-semibold text-lg' : 'text-primary'
                }`}
              >
                {formattedHandle}
              </h1>
              <span
                className="material-symbols-outlined text-secondary text-[18px]"
                style={{ fontVariationSettings: "'FILL' 1" }}
                title="Perfil verificado"
              >
                verified
              </span>
            </div>

            {portfolio.bio && (
              <p
                className={`font-body-sm text-body-sm mt-1 max-w-[300px] ${
                  isImageMode ? 'text-white/80 drop-shadow-sm' : 'text-on-surface-variant'
                }`}
              >
                {portfolio.bio}
              </p>
            )}
          </header>

          {/* Contenedor de Redes Sociales (RF-07, RF-08, RF-09, RF-13) */}
          <nav
            aria-label="Enlaces de redes sociales"
            className="w-full flex flex-col gap-3"
          >
            {activeLinks.length === 0 ? (
              <div className="w-full rounded-2xl p-6 text-center bg-surface-container-low/80 border border-outline-variant/20 backdrop-blur-md">
                <span className="material-symbols-outlined text-outline text-[28px] mb-1">
                  link_off
                </span>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  Aún no hay redes sociales activas en este portafolio.
                </p>
              </div>
            ) : (
              activeLinks.map((item) => (
                <a
                  key={item.id}
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  role="button"
                  className={
                    isImageMode
                      ? 'group relative flex items-center justify-between w-full h-14 px-4 rounded-2xl bg-white/10 hover:bg-white/[0.18] active:scale-[0.985] transition-all duration-200 backdrop-blur-xl border border-white/20 shadow-lg text-white'
                      : 'group relative flex items-center justify-between w-full h-14 px-4 rounded-xl bg-surface-container-low hover:bg-surface-container active:scale-[0.985] transition-all duration-200 border border-[#262626] hover:border-[#404040] text-primary'
                  }
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div
                      className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform duration-200 ${
                        isImageMode
                          ? 'bg-white/15 text-white'
                          : 'bg-surface-container text-primary'
                      }`}
                    >
                      {item.icon('w-4 h-4 fill-current')}
                    </div>
                    <div className="flex flex-col min-w-0 text-left">
                      <span className="font-label-lg text-label-lg font-medium truncate text-white">
                        {item.label}
                      </span>
                    </div>
                  </div>

                  <span
                    className={`material-symbols-outlined text-[20px] shrink-0 transition-all duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 ${
                      isImageMode
                        ? 'text-white/70 group-hover:text-white'
                        : 'text-outline group-hover:text-primary'
                    }`}
                  >
                    north_east
                  </span>
                </a>
              ))
            )}
          </nav>
        </main>

        {/* Pie de página discreto (en producción redirige a Inicio de Sesión si no está autenticado) */}
        <footer className="w-full pt-8 pb-2 flex flex-col items-center gap-2">
          {onNavigate ? (
            <button
              type="button"
              onClick={() => onNavigate(canEdit ? 'editor' : 'onboarding')}
              className={`inline-flex items-center gap-1.5 transition-colors text-label-sm font-label-sm uppercase tracking-wider cursor-pointer ${
                isImageMode
                  ? 'text-white/40 hover:text-white/80'
                  : 'text-outline-variant hover:text-on-surface-variant'
              }`}
              title={
                canEdit
                  ? 'Ir al editor de tu portafolio'
                  : 'Iniciar sesión o crear tu propio LinkPortfolio'
              }
            >
              <span className="material-symbols-outlined text-[13px]">link</span>
              <span>Creado con LinkPortfolio</span>
            </button>
          ) : (
            <div
              className={`inline-flex items-center gap-1.5 text-label-sm font-label-sm uppercase tracking-wider ${
                isImageMode ? 'text-white/45' : 'text-outline-variant'
              }`}
            >
              <span className="material-symbols-outlined text-[13px]">link</span>
              <span>Creado con LinkPortfolio</span>
            </div>
          )}
        </footer>
      </div>
    </div>
  );
}
