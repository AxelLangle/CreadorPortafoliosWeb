import React, { useState, useEffect } from 'react';
import { INITIAL_PORTFOLIO_DATA } from './data/socialCatalog';
import PublicPortfolioView from './components/PublicPortfolioView';
import PortfolioEditorView from './components/PortfolioEditorView';
import OnboardingView from './components/OnboardingView';
import SettingsAndQrView from './components/SettingsAndQrView';

const STORAGE_KEY = 'linkportfolio_its_araaaby_v1';

export default function App() {
  const [portfolio, setPortfolio] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.slug && Array.isArray(parsed.social_network_groups)) {
          return parsed;
        }
      }
    } catch {
      // Ignorar errores de lectura de localStorage
    }
    return INITIAL_PORTFOLIO_DATA;
  });

  // Vista activa: 'public' (Pantalla 3) | 'editor' (Pantalla 2) | 'settings' (Pantalla 4) | 'onboarding' (Pantalla 1)
  const [currentView, setCurrentView] = useState('public');
  const [editorTab, setEditorTab] = useState('redes');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // RNF-04: Actualizar Metadatos Open Graph Dinámicos y título del documento
  useEffect(() => {
    const handle = (portfolio.display_name || portfolio.slug || 'its.araaaby').startsWith('@')
      ? portfolio.display_name || `@${portfolio.slug}`
      : `@${portfolio.display_name || portfolio.slug}`;

    document.title = `${handle} | LinkPortfolio — Enlaces Oficiales`;

    const setMeta = (selector, attr, val) => {
      const el = document.querySelector(selector);
      if (el && val) el.setAttribute(attr, val);
    };

    setMeta('meta[property="og:title"]', 'content', `${handle} | Portafolio de Redes Sociales`);
    setMeta(
      'meta[property="og:description"]',
      'content',
      portfolio.bio || `Conecta con todas las redes sociales oficiales de ${handle}.`
    );
    setMeta('meta[property="og:image"]', 'content', portfolio.avatar_url || '/avatar-its-araaaby.jpeg');
    setMeta('meta[name="twitter:title"]', 'content', `${handle} | Portafolio de Redes Sociales`);
    setMeta('meta[name="twitter:image"]', 'content', portfolio.avatar_url || '/avatar-its-araaaby.jpeg');
  }, [portfolio]);

  const handleUpdatePortfolio = (nextPortfolio) => {
    setPortfolio(nextPortfolio);
    setHasUnsavedChanges(true);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(nextPortfolio));
    } catch {
      // Si la imagen base64 excede cuota, se conserva en memoria de sesión
    }
  };

  const handlePublishPortfolio = () => {
    setHasUnsavedChanges(false);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(portfolio));
    } catch {
      // Ignorar cuota excedida
    }
  };

  const handleResetToDefault = () => {
    setPortfolio(INITIAL_PORTFOLIO_DATA);
    setHasUnsavedChanges(false);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_PORTFOLIO_DATA));
    } catch {
      // Ignorar
    }
  };

  return (
    <div className="min-h-screen bg-surface text-on-surface relative">
      {/* Barra Flotante Superior Discreta cuando se está en la Vista Pública para alternar a la Herramienta */}
      {currentView === 'public' && (
        <div className="fixed top-3 left-3 z-50 flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => {
              setEditorTab('redes');
              setCurrentView('editor');
            }}
            className="h-9 px-3 rounded-full bg-surface-container-low/85 hover:bg-surface-container-high text-on-surface backdrop-blur-xl border border-white/15 shadow-lg font-label-sm text-label-sm flex items-center gap-1.5 transition-all"
            title="Abrir Panel de Administración y Editor del Portafolio"
          >
            <span className="material-symbols-outlined text-[15px] text-secondary">
              edit_square
            </span>
            <span>Editar Portafolio</span>
          </button>

          <button
            type="button"
            onClick={() =>
              handleUpdatePortfolio({
                ...portfolio,
                background_type: portfolio.background_type === 'BLACK' ? 'IMAGE' : 'BLACK',
              })
            }
            className="h-9 px-3 rounded-full bg-surface-container-low/85 hover:bg-surface-container-high text-on-surface-variant hover:text-primary backdrop-blur-xl border border-white/15 shadow-lg font-label-sm text-label-sm flex items-center gap-1.5 transition-all"
            title="Alternar entre Modo Fondo Negro (3A) y Modo Foto Personalizada (3B)"
          >
            <span className="material-symbols-outlined text-[15px]">
              {portfolio.background_type === 'BLACK' ? 'wallpaper' : 'dark_mode'}
            </span>
            <span className="hidden sm:inline">
              {portfolio.background_type === 'BLACK' ? 'Probar Fondo con Foto' : 'Modo Fondo Negro'}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setCurrentView('settings')}
            className="w-9 h-9 rounded-full bg-surface-container-low/85 hover:bg-surface-container-high text-on-surface-variant hover:text-primary backdrop-blur-xl border border-white/15 shadow-lg flex items-center justify-center transition-all"
            title="Compartir Código QR y Configuración"
            aria-label="Código QR"
          >
            <span className="material-symbols-outlined text-[17px]">qr_code_2</span>
          </button>
        </div>
      )}

      {/* Renderizado de las 4 Pantallas del SRS / Google Stitch AI */}
      {currentView === 'public' && (
        <PublicPortfolioView
          portfolio={portfolio}
          isSimulator={false}
          onNavigate={(target) => setCurrentView(target)}
        />
      )}

      {currentView === 'editor' && (
        <PortfolioEditorView
          key={editorTab}
          portfolio={portfolio}
          initialTab={editorTab}
          hasUnsavedChanges={hasUnsavedChanges}
          onUpdatePortfolio={handleUpdatePortfolio}
          onPublishPortfolio={handlePublishPortfolio}
          onNavigate={(target) => setCurrentView(target)}
        />
      )}

      {currentView === 'onboarding' && (
        <OnboardingView
          portfolio={portfolio}
          onUpdatePortfolio={handleUpdatePortfolio}
          onNavigate={(target) => setCurrentView(target)}
        />
      )}

      {currentView === 'settings' && (
        <SettingsAndQrView
          portfolio={portfolio}
          onUpdatePortfolio={handleUpdatePortfolio}
          onResetToDefault={handleResetToDefault}
          onNavigate={(target) => setCurrentView(target)}
        />
      )}

      {/* Barra de Navegación Inferior Estilo Stitch AI (presente en las vistas de la herramienta) */}
      {currentView !== 'public' && (
        <nav
          aria-label="Navegación principal de la herramienta"
          className="fixed bottom-0 left-0 right-0 w-full z-50 pb-safe bg-surface/95 backdrop-blur-xl border-t border-outline-variant/20 shadow-[0_-1px_12px_rgba(0,0,0,0.5)]"
        >
          <div className="max-w-lg mx-auto flex justify-around items-center h-16 px-2">
            <button
              type="button"
              onClick={() => {
                setEditorTab('redes');
                setCurrentView('editor');
              }}
              className={`flex flex-col items-center justify-center gap-1 min-w-[64px] h-11 transition-colors ${
                currentView === 'editor' && editorTab === 'redes'
                  ? 'text-primary font-semibold'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <span className="material-symbols-outlined text-[22px]">dashboard</span>
              <span className="font-label-sm text-label-sm">Redes</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setEditorTab('apariencia');
                setCurrentView('editor');
              }}
              className={`flex flex-col items-center justify-center gap-1 min-w-[64px] h-11 transition-colors ${
                currentView === 'editor' && editorTab === 'apariencia'
                  ? 'text-primary font-semibold'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <span className="material-symbols-outlined text-[22px]">palette</span>
              <span className="font-label-sm text-label-sm">Apariencia</span>
            </button>

            <button
              type="button"
              onClick={() => setCurrentView('public')}
              className="flex flex-col items-center justify-center gap-1 min-w-[64px] h-11 text-on-surface-variant hover:text-secondary transition-colors"
            >
              <span className="material-symbols-outlined text-[22px]">public</span>
              <span className="font-label-sm text-label-sm">Portafolio</span>
            </button>

            <button
              type="button"
              onClick={() => setCurrentView('settings')}
              className={`flex flex-col items-center justify-center gap-1 min-w-[64px] h-11 transition-colors ${
                currentView === 'settings'
                  ? 'text-primary font-semibold'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <span className="material-symbols-outlined text-[22px]">qr_code_2</span>
              <span className="font-label-sm text-label-sm">QR y Ajustes</span>
            </button>

            <button
              type="button"
              onClick={() => setCurrentView('onboarding')}
              className={`flex flex-col items-center justify-center gap-1 min-w-[64px] h-11 transition-colors ${
                currentView === 'onboarding'
                  ? 'text-primary font-semibold'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <span className="material-symbols-outlined text-[22px]">person</span>
              <span className="font-label-sm text-label-sm">Cuenta</span>
            </button>
          </div>
        </nav>
      )}
    </div>
  );
}
