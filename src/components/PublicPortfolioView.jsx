import React from 'react';
import { getActivePortfolioLinks } from '../data/socialCatalog';

/**
 * Pantalla 3: Vista Pública del Portafolio (Experiencia del Visitante)
 * Soporta Variación 3A (Modo Fondo Negro #000000) y Variación 3B (Modo Foto Personalizada con Glassmorphism)
 * Basado en los mockups de Google Stitch AI ("LinkPortfolio Mobile Onboarding").
 */
export default function PublicPortfolioView({
  portfolio,
  isSimulator = false,
  onNavigate,
}) {
  const activeLinks = getActivePortfolioLinks(portfolio);
  const isImageMode =
    portfolio.background_type === 'IMAGE' && Boolean(portfolio.background_image_url);
  const overlayOpacity = Math.min(
    80,
    Math.max(0, Number(portfolio.background_overlay_opacity ?? 40))
  );

  const formattedHandle = (portfolio.display_name || portfolio.slug || 'its.araaaby')
    .trim()
    .startsWith('@')
    ? (portfolio.display_name || portfolio.slug).trim()
    : `@${(portfolio.display_name || portfolio.slug || 'its.araaaby').trim()}`;

  // Modo Mantenimiento / Borrador (Pantalla 4: Interruptor de privacidad desactivado)
  if (!portfolio.is_published && !isSimulator) {
    return (
      <div className="min-h-screen w-full bg-[#000000] text-on-surface flex flex-col items-center justify-center px-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-surface-container-low border border-outline-variant/30 flex items-center justify-center text-secondary mb-4 shadow-xl">
          <span className="material-symbols-outlined text-[32px]">lock_clock</span>
        </div>
        <h1 className="font-headline-md text-headline-md text-primary mb-2">
          Portafolio en Modo Borrador
        </h1>
        <p className="font-body-md text-body-md text-on-surface-variant max-w-sm mb-6">
          El portafolio <span className="text-primary font-mono">{formattedHandle}</span> se
          encuentra temporalmente oculto por su creador.
        </p>
        {onNavigate && (
          <button
            type="button"
            onClick={() => onNavigate('settings')}
            className="h-11 px-5 rounded-xl bg-primary text-on-primary font-label-lg text-label-lg font-semibold flex items-center gap-2 hover:opacity-90 transition-all"
          >
            <span className="material-symbols-outlined text-[18px]">tune</span>
            <span>Ir a Configuración para Activar</span>
          </button>
        )}
      </div>
    );
  }

  return (
    <div
      className={`relative w-full flex flex-col justify-between items-center select-none overflow-x-hidden transition-colors duration-300 ${
        isSimulator ? 'min-h-full rounded-[32px]' : 'min-h-screen'
      }`}
      style={{
        backgroundColor: '#000000',
        ...(isImageMode
          ? {
              backgroundImage: `url('${portfolio.background_image_url}')`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
            }
          : {}),
      }}
    >
      {/* Capa de oscurecimiento (Overlay ajustable de 0% a 80% en Modo Foto Personalizada - RF-05) */}
      {isImageMode && (
        <div
          className="absolute inset-0 pointer-events-none transition-opacity duration-200"
          style={{
            backgroundColor: `rgba(0, 0, 0, ${overlayOpacity / 100})`,
            backdropFilter: 'contrast(1.03)',
          }}
        />
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
          {/* Cabecera del Perfil */}
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
                    src={portfolio.avatar_url || '/avatar-its-araaaby.jpeg'}
                    alt={`Foto de perfil de ${formattedHandle}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              {/* Indicador de pulso activo en vivo (Stitch 3A) */}
              <span className="absolute bottom-1 right-1 z-20 flex h-3.5 w-3.5 items-center justify-center">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-secondary shadow-sm" />
              </span>
            </div>

            {/* Nombre o alias del usuario */}
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

            {/* Subtítulo / Biografía opcional */}
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

        {/* Pie de página discreto (Stitch 3A y 3B) */}
        <footer className="w-full pt-8 pb-2 flex flex-col items-center gap-2">
          {onNavigate ? (
            <button
              type="button"
              onClick={() => onNavigate('editor')}
              className={`inline-flex items-center gap-1.5 transition-colors text-label-sm font-label-sm uppercase tracking-wider cursor-pointer ${
                isImageMode
                  ? 'text-white/50 hover:text-white/90'
                  : 'text-outline-variant hover:text-on-surface-variant'
              }`}
            >
              <span className="material-symbols-outlined text-[14px]">link</span>
              <span>Creado con LinkPortfolio</span>
            </button>
          ) : (
            <div
              className={`inline-flex items-center gap-1.5 text-label-sm font-label-sm uppercase tracking-wider ${
                isImageMode ? 'text-white/45' : 'text-outline-variant'
              }`}
            >
              <span className="material-symbols-outlined text-[14px]">link</span>
              <span>Creado con LinkPortfolio</span>
            </div>
          )}
        </footer>
      </div>
    </div>
  );
}
