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

  // Determinar portafolio activo y vista inicial según la URL:
  // - Raíz (/) -> Pantalla de Iniciar Sesión o Crear Cuenta ('onboarding')
  // - /<slug> o /?u=<slug> -> Vista Pública de ese portafolio ('public')
  // - /admin o /?mode=admin -> Consola de Super Administrador ('admin')
  const [activePortfolioId, setActivePortfolioId] = useState(() => {
    const initialDb = loadDatabase();
    const params = new URLSearchParams(window.location.search);
    const requestedSlug = (
      params.get('u') ||
      window.location.pathname.replace(/^\/+|\/+$/g, '')
    )
      .trim()
      .toLowerCase();

    if (
      requestedSlug &&
      !['admin', 'login', 'onboarding', 'settings', 'editor'].includes(requestedSlug)
    ) {
      const found = initialDb.portfolios.find(
        (p) => p.slug.toLowerCase() === requestedSlug
      );
      if (found) return found.id;
    }

    const activeSess = loadActiveSession();
    if (activeSess?.portfolioId) {
      const sessionPortfolio = initialDb.portfolios.find(
        (p) => p.id === activeSess.portfolioId
      );
      if (sessionPortfolio) return sessionPortfolio.id;
    }

    return initialDb.portfolios[0]?.id || '';
  });

  const [currentView, setCurrentView] = useState(() => {
    const initialDb = loadDatabase();
    const params = new URLSearchParams(window.location.search);
    const mode = (params.get('mode') || '').toLowerCase();
    const path = window.location.pathname.replace(/^\/+|\/+$/g, '').trim().toLowerCase();
    const querySlug = (params.get('u') || '').trim().toLowerCase();

    if (mode === 'admin' || path === 'admin') return 'admin';
    if (mode === 'login' || path === 'login' || path === 'onboarding') return 'onboarding';

    // Si en la URL viene un slug válido (?u=slug o /slug), mostrar el portafolio público
    const candidateSlug = querySlug || path;
    if (candidateSlug) {
      const found = initialDb.portfolios.find(
        (p) => p.slug.toLowerCase() === candidateSlug
      );
      if (found) return 'public';
    }

    // Por defecto, la raíz (/) va directo a Iniciar Sesión o Crear Cuenta
    return 'onboarding';
  });

  const [editorTab, setEditorTab] = useState('redes');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const activePortfolio =
    db.portfolios.find((p) => p.id === activePortfolioId) || db.portfolios[0];

  const userCanEditActive = canEditPortfolio(session, activePortfolio);

  // RNF-04: Actualizar Metadatos Open Graph Dinámicos y título del documento
  useEffect(() => {
    const setMeta = (selector, attr, val) => {
      const el = document.querySelector(selector);
      if (el && val) el.setAttribute(attr, val);
    };

    if (currentView === 'onboarding' || currentView === 'admin' || !activePortfolio) {
      document.title = 'LinkPortfolio — Inicia Sesión o Crea tu Portafolio';
      setMeta(
        'meta[property="og:title"]',
        'content',
        'LinkPortfolio — Crea tu Portafolio de Redes Sociales'
      );
      setMeta(
        'meta[property="og:description"]',
        'content',
        'Plataforma minimalista de enlaces y perfiles oficiales de redes sociales.'
      );
      setMeta('meta[property="og:image"]', 'content', '/logo-linkportafolio.png');
      setMeta('meta[name="twitter:title"]', 'content', 'LinkPortfolio — Portafolio Digital');
      setMeta('meta[name="twitter:image"]', 'content', '/logo-linkportafolio.png');
      return;
    }

    const handle = (
      activePortfolio.display_name ||
      activePortfolio.slug ||
      'usuario'
    ).startsWith('@')
      ? activePortfolio.display_name || `@${activePortfolio.slug}`
      : `@${activePortfolio.display_name || activePortfolio.slug}`;

    document.title = `${handle} | LinkPortfolio — Enlaces Oficiales`;

    setMeta('meta[property="og:title"]', 'content', `${handle} | Portafolio de Redes Sociales`);
    setMeta(
      'meta[property="og:description"]',
      'content',
      activePortfolio.bio || `Conecta con todas las redes sociales oficiales de ${handle}.`
    );
    const socialShareImage = activePortfolio.avatar_url || '/logo-linkportafolio.png';
    setMeta('meta[property="og:image"]', 'content', socialShareImage);
    setMeta('meta[name="twitter:image"]', 'content', socialShareImage);
    setMeta('meta[name="twitter:title"]', 'content', `${handle} | Portafolio de Redes Sociales`);
  }, [activePortfolio, currentView]);

  // Sincronizar cambios en tiempo real entre pestañas (ej. cuando la vista pública está abierta en otra pestaña)
  useEffect(() => {
    const handleStorageSync = () => {
      setDb(loadDatabase());
    };
    window.addEventListener('storage', handleStorageSync);
    return () => window.removeEventListener('storage', handleStorageSync);
  }, []);

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
    setDb((prevDb) => {
      const nextPortfolios = prevDb.portfolios.map((p) =>
        p.id === updatedPortfolio.id
          ? { ...updatedPortfolio, updated_at: new Date().toISOString() }
          : p
      );
      const nextDb = {
        ...prevDb,
        portfolios: nextPortfolios,
      };
      saveDatabase(nextDb);
      return nextDb;
    });
    setHasUnsavedChanges(true);
  };

  const handlePublishPortfolio = () => {
    setHasUnsavedChanges(false);
    saveDatabase(db);
  };

  // Restaurar datos originales del perfil principal
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
    setCurrentView('onboarding');
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
