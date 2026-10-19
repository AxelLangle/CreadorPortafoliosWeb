import React, { useState, useEffect } from 'react';
import { INITIAL_PORTFOLIO_DATA } from './data/socialCatalog';
import {
  loadDatabase,
  saveDatabase,
  loadActiveSession,
  saveActiveSession,
  canEditPortfolio,
  DEFAULT_ARAAABY_EMAIL,
  DEFAULT_ARAAABY_PASSWORD,
  simpleHash,
} from './services/authAndPortfolioStore';
import PublicPortfolioView from './components/PublicPortfolioView';
import PortfolioEditorView from './components/PortfolioEditorView';
import OnboardingView from './components/OnboardingView';
import SettingsAndQrView from './components/SettingsAndQrView';
import AdminPanelView from './components/AdminPanelView';

export default function App() {
  const [db, setDb] = useState(() => loadDatabase());
  const [session, setSession] = useState(() => loadActiveSession());

  // Determinar portafolio activo y vista inicial según la URL (/admin, /login, /?u=slug o /slug)
  const [activePortfolioId, setActivePortfolioId] = useState(() => {
    const initialDb = loadDatabase();
    const params = new URLSearchParams(window.location.search);
    const requestedSlug =
      params.get('u') ||
      window.location.pathname.replace(/^\/+|\/+$/g, '').toLowerCase();

    if (
      requestedSlug &&
      !['admin', 'login', 'onboarding', 'settings', 'editor'].includes(requestedSlug)
    ) {
      const found = initialDb.portfolios.find(
        (p) => p.slug.toLowerCase() === requestedSlug.toLowerCase()
      );
      if (found) return found.id;
    }

    const defaultProfile =
      initialDb.portfolios.find((p) => p.slug === initialDb.default_slug) ||
      initialDb.portfolios[0];
    return defaultProfile.id;
  });

  const [currentView, setCurrentView] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    const mode = params.get('mode');
    const path = window.location.pathname.replace(/^\/+|\/+$/g, '').toLowerCase();
    if (mode === 'admin' || path === 'admin') return 'admin';
    if (mode === 'login' || path === 'login' || path === 'onboarding') return 'onboarding';
    return 'public';
  });

  const [editorTab, setEditorTab] = useState('redes');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const activePortfolio =
    db.portfolios.find((p) => p.id === activePortfolioId) ||
    db.portfolios.find((p) => p.slug === db.default_slug) ||
    db.portfolios[0];

  const userCanEditActive = canEditPortfolio(session, activePortfolio);

  // RNF-04: Actualizar Metadatos Open Graph Dinámicos y título del documento
  useEffect(() => {
    if (!activePortfolio) return;
    const handle = (
      activePortfolio.display_name ||
      activePortfolio.slug ||
      'its.araaaby'
    ).startsWith('@')
      ? activePortfolio.display_name || `@${activePortfolio.slug}`
      : `@${activePortfolio.display_name || activePortfolio.slug}`;

    document.title = `${handle} | LinkPortfolio — Enlaces Oficiales`;

    const setMeta = (selector, attr, val) => {
      const el = document.querySelector(selector);
      if (el && val) el.setAttribute(attr, val);
    };

    setMeta('meta[property="og:title"]', 'content', `${handle} | Portafolio de Redes Sociales`);
    setMeta(
      'meta[property="og:description"]',
      'content',
      activePortfolio.bio || `Conecta con todas las redes sociales oficiales de ${handle}.`
    );
    setMeta(
      'meta[property="og:image"]',
      'content',
      activePortfolio.avatar_url || '/avatar-its-araaaby.jpeg'
    );
    setMeta('meta[name="twitter:title"]', 'content', `${handle} | Portafolio de Redes Sociales`);
    setMeta(
      'meta[name="twitter:image"]',
      'content',
      activePortfolio.avatar_url || '/avatar-its-araaaby.jpeg'
    );
  }, [activePortfolio]);

  const handleUpdateDb = (nextDb) => {
    setDb(nextDb);
    saveDatabase(nextDb);
  };

  const handleSetSession = (nextSession) => {
    setSession(nextSession);
    saveActiveSession(nextSession);
  };

  // Actualizar únicamente el portafolio activo (solo si el usuario tiene permiso)
  const handleUpdateActivePortfolio = (updatedPortfolio) => {
    if (!canEditPortfolio(session, activePortfolio)) return;
    const nextPortfolios = db.portfolios.map((p) =>
      p.id === updatedPortfolio.id
        ? { ...updatedPortfolio, updated_at: new Date().toISOString() }
        : p
    );
    const nextDb = {
      ...db,
      portfolios: nextPortfolios,
    };
    handleUpdateDb(nextDb);
    setHasUnsavedChanges(true);
  };

  const handlePublishPortfolio = () => {
    setHasUnsavedChanges(false);
    saveDatabase(db);
  };

  // Restaurar exclusivamente los datos originales de @its.araaaby
  const handleResetAraaabyDefault = () => {
    const nextPortfolios = db.portfolios.map((p) => {
      if (p.slug !== 'its.araaaby' && p.id !== 'portfolio-its-araaaby-001') return p;
      return {
        ...INITIAL_PORTFOLIO_DATA,
        id: p.id,
        slug: 'its.araaaby',
        owner_email: p.owner_email || DEFAULT_ARAAABY_EMAIL.toLowerCase(),
        owner_password_hash:
          p.owner_password_hash || simpleHash(DEFAULT_ARAAABY_PASSWORD),
        is_protected: true,
        updated_at: new Date().toISOString(),
      };
    });
    handleUpdateDb({ ...db, portfolios: nextPortfolios });
    setHasUnsavedChanges(false);
  };

  // Navegación protegida: impide que usuarios sin sesión entren a 'editor' o 'settings'
  const handleSafeNavigate = (targetView) => {
    if ((targetView === 'editor' || targetView === 'settings') && !userCanEditActive) {
      setCurrentView('onboarding');
      return;
    }
    setCurrentView(targetView);
  };

  const handleLogout = () => {
    handleSetSession(null);
    setCurrentView('public');
  };

  return (
    <div className="min-h-screen bg-surface text-on-surface relative">
      {/* Barra Flotante Superior: SOLO visible si el propietario o el Super Admin han iniciado sesión */}
      {currentView === 'public' && userCanEditActive && (
        <div className="fixed top-3 left-3 right-3 z-50 flex items-center justify-between pointer-events-none max-w-5xl mx-auto">
          <div className="flex items-center gap-1.5 pointer-events-auto">
            <button
              type="button"
              onClick={() => {
                setEditorTab('redes');
                setCurrentView('editor');
              }}
              className="h-9 px-3.5 rounded-full bg-surface-container-low/90 hover:bg-surface-container-high text-on-surface backdrop-blur-xl border border-secondary/40 shadow-lg font-label-sm text-label-sm flex items-center gap-1.5 transition-all"
            >
              <span className="material-symbols-outlined text-[15px] text-secondary">
                edit_square
              </span>
              <span>Editar @{activePortfolio.slug}</span>
            </button>

            {session?.role === 'ADMIN' && (
              <button
                type="button"
                onClick={() => setCurrentView('admin')}
                className="h-9 px-3 rounded-full bg-secondary/20 hover:bg-secondary/30 text-secondary backdrop-blur-xl border border-secondary/40 shadow-lg font-label-sm text-label-sm flex items-center gap-1.5 transition-all"
              >
                <span className="material-symbols-outlined text-[15px]">
                  admin_panel_settings
                </span>
                <span>Consola Admin</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setCurrentView('settings')}
              className="w-9 h-9 rounded-full bg-surface-container-low/90 hover:bg-surface-container-high text-on-surface-variant hover:text-primary backdrop-blur-xl border border-white/15 shadow-lg flex items-center justify-center transition-all"
              title="Código QR y Ajustes"
            >
              <span className="material-symbols-outlined text-[17px]">qr_code_2</span>
            </button>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="h-9 px-3 rounded-full bg-surface-container-low/90 hover:bg-error-container/40 text-on-surface-variant hover:text-error backdrop-blur-xl border border-white/15 shadow-lg font-label-sm text-label-sm flex items-center gap-1 pointer-events-auto transition-all"
            title="Cerrar sesión para ver exactamente como visitante público"
          >
            <span className="material-symbols-outlined text-[15px]">logout</span>
            <span className="hidden sm:inline">Salir</span>
          </button>
        </div>
      )}

      {/* Renderizado de Vistas con Protección de Permisos en Producción */}
      {currentView === 'public' && (
        <PublicPortfolioView
          portfolio={activePortfolio}
          isSimulator={false}
          canEdit={userCanEditActive}
          onNavigate={handleSafeNavigate}
        />
      )}

      {currentView === 'editor' &&
        (userCanEditActive ? (
          <PortfolioEditorView
            key={`${activePortfolio.id}-${editorTab}`}
            portfolio={activePortfolio}
            initialTab={editorTab}
            hasUnsavedChanges={hasUnsavedChanges}
            onUpdatePortfolio={handleUpdateActivePortfolio}
            onPublishPortfolio={handlePublishPortfolio}
            onNavigate={handleSafeNavigate}
          />
        ) : (
          <OnboardingView
            db={db}
            onLoginSuccess={(newSession, nextView, targetPortfolioId) => {
              handleSetSession(newSession);
              if (targetPortfolioId) setActivePortfolioId(targetPortfolioId);
              setCurrentView(nextView || 'editor');
            }}
            onRegisterNewPortfolio={(createdProfile) => {
              const nextDb = {
                ...db,
                portfolios: [...db.portfolios, createdProfile],
              };
              handleUpdateDb(nextDb);
              handleSetSession({
                role: 'USER',
                email: createdProfile.owner_email,
                portfolioId: createdProfile.id,
                slug: createdProfile.slug,
                authenticatedAt: new Date().toISOString(),
              });
              setActivePortfolioId(createdProfile.id);
              setCurrentView('editor');
            }}
            onNavigate={handleSafeNavigate}
          />
        ))}

      {currentView === 'onboarding' && (
        <OnboardingView
          db={db}
          onLoginSuccess={(newSession, nextView, targetPortfolioId) => {
            handleSetSession(newSession);
            if (targetPortfolioId) setActivePortfolioId(targetPortfolioId);
            setCurrentView(nextView || 'editor');
          }}
          onRegisterNewPortfolio={(createdProfile) => {
            const nextDb = {
              ...db,
              portfolios: [...db.portfolios, createdProfile],
            };
            handleUpdateDb(nextDb);
            handleSetSession({
              role: 'USER',
              email: createdProfile.owner_email,
              portfolioId: createdProfile.id,
              slug: createdProfile.slug,
              authenticatedAt: new Date().toISOString(),
            });
            setActivePortfolioId(createdProfile.id);
            setCurrentView('editor');
          }}
          onNavigate={handleSafeNavigate}
        />
      )}

      {currentView === 'settings' &&
        (userCanEditActive ? (
          <SettingsAndQrView
            db={db}
            portfolio={activePortfolio}
            session={session}
            onUpdatePortfolio={handleUpdateActivePortfolio}
            onResetToDefault={handleResetAraaabyDefault}
            onLogout={handleLogout}
            onNavigate={handleSafeNavigate}
          />
        ) : (
          <OnboardingView
            db={db}
            onLoginSuccess={(newSession, nextView, targetPortfolioId) => {
              handleSetSession(newSession);
              if (targetPortfolioId) setActivePortfolioId(targetPortfolioId);
              setCurrentView(nextView || 'editor');
            }}
            onRegisterNewPortfolio={(createdProfile) => {
              const nextDb = {
                ...db,
                portfolios: [...db.portfolios, createdProfile],
              };
              handleUpdateDb(nextDb);
              handleSetSession({
                role: 'USER',
                email: createdProfile.owner_email,
                portfolioId: createdProfile.id,
                slug: createdProfile.slug,
                authenticatedAt: new Date().toISOString(),
              });
              setActivePortfolioId(createdProfile.id);
              setCurrentView('editor');
            }}
            onNavigate={handleSafeNavigate}
          />
        ))}

      {currentView === 'admin' && (
        <AdminPanelView
          db={db}
          session={session}
          onUpdateDb={handleUpdateDb}
          onSetSession={handleSetSession}
          onOpenProfileInEditor={(portfolioId) => {
            setActivePortfolioId(portfolioId);
            setEditorTab('redes');
            setCurrentView('editor');
          }}
          onPreviewProfile={(portfolioId) => {
            setActivePortfolioId(portfolioId);
            setCurrentView('public');
          }}
          onResetAraaabyDefault={handleResetAraaabyDefault}
          onNavigate={handleSafeNavigate}
        />
      )}

      {/* Barra de Navegación Inferior: SOLO visible para usuarios autenticados en el Editor / Ajustes */}
      {(currentView === 'editor' || currentView === 'settings') && userCanEditActive && (
        <nav
          aria-label="Navegación principal del propietario"
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

            {session?.role === 'ADMIN' ? (
              <button
                type="button"
                onClick={() => setCurrentView('admin')}
                className="flex flex-col items-center justify-center gap-1 min-w-[64px] h-11 text-secondary font-semibold transition-colors"
              >
                <span className="material-symbols-outlined text-[22px]">
                  admin_panel_settings
                </span>
                <span className="font-label-sm text-label-sm">Admin</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleLogout}
                className="flex flex-col items-center justify-center gap-1 min-w-[64px] h-11 text-on-surface-variant hover:text-error transition-colors"
              >
                <span className="material-symbols-outlined text-[22px]">logout</span>
                <span className="font-label-sm text-label-sm">Salir</span>
              </button>
            )}
          </div>
        </nav>
      )}
    </div>
  );
}
