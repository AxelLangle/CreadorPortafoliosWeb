import React, { useState } from 'react';
import {
  simpleHash,
  checkSlugAvailability,
  createBlankPortfolio,
  authenticateWithGoogleOAuth2,
} from '../services/authAndPortfolioStore';
import { getActivePortfolioLinks } from '../data/socialCatalog';

/**
 * Panel Exclusivo de Super Administrador con protección estricta por contraseña.
 * Permite Añadir, Modificar, Actualizar y Eliminar cualquier perfil de la plataforma,
 * proteger el perfil de @its.araaaby y configurar Google OAuth 2.0.
 */
export default function AdminPanelView({
  db,
  session,
  onUpdateDb,
  onSetSession,
  onOpenProfileInEditor,
  onPreviewProfile,
  onResetAraaabyDefault,
  onNavigate,
}) {
  // Estados para la puerta de autenticación del Administrador
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPwd, setShowLoginPwd] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockoutUntil, setLockoutUntil] = useState(0);

  // Estados internos del Dashboard Admin
  const [activeSection, setActiveSection] = useState('profiles'); // 'profiles' | 'oauth' | 'security'
  const [searchQuery, setSearchQuery] = useState('');
  const [notice, setNotice] = useState('');

  // Modal: Crear nuevo perfil
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [newSlug, setNewSlug] = useState('');
  const [newDisplayName, setNewDisplayName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newProtected, setNewProtected] = useState(false);

  // Modal: Actualizar credenciales / propietario de un perfil existente
  const [editMetaProfile, setEditMetaProfile] = useState(null);
  const [metaSlug, setMetaSlug] = useState('');
  const [metaEmail, setMetaEmail] = useState('');
  const [metaNewPassword, setMetaNewPassword] = useState('');
  const [metaProtected, setMetaProtected] = useState(false);

  // Modal: Confirmar eliminación de perfil
  const [deleteTarget, setDeleteTarget] = useState(null);

  // Configuración Google OAuth 2.0 y Seguridad Admin
  const [oauthClientIdDraft, setOauthClientIdDraft] = useState(db.google_client_id || '');
  const [adminEmailDraft, setAdminEmailDraft] = useState(db.admin_config?.email || '');
  const [adminNewPwdDraft, setAdminNewPwdDraft] = useState('');

  const isAdminAuthenticated = session && session.role === 'ADMIN';

  const handleAdminLogin = (e) => {
    e.preventDefault();
    const now = Date.now();
    if (lockoutUntil > now) {
      const remaining = Math.ceil((lockoutUntil - now) / 1000);
      setLoginError(
        `Demasiados intentos fallidos. Espera ${remaining} segundos antes de volver a intentar.`
      );
      return;
    }

    const expectedEmail = (db.admin_config?.email || '').toLowerCase();
    const expectedHash = db.admin_config?.password_hash;
    const enteredEmail = loginEmail.trim().toLowerCase();
    const enteredHash = simpleHash(loginPassword);

    if (enteredEmail === expectedEmail && enteredHash === expectedHash) {
      setLoginError('');
      setFailedAttempts(0);
      onSetSession({
        role: 'ADMIN',
        email: expectedEmail,
        authenticatedAt: new Date().toISOString(),
      });
    } else {
      const nextAttempts = failedAttempts + 1;
      setFailedAttempts(nextAttempts);
      if (nextAttempts >= 5) {
        setLockoutUntil(Date.now() + 30000);
        setLoginError(
          'Se bloqueó temporalmente el acceso por 30 segundos tras 5 intentos fallidos.'
        );
      } else {
        setLoginError(
          `Credenciales de administrador inválidas. Intento ${nextAttempts} de 5.`
        );
      }
    }
  };

  // ==================== VISTA DE BLOQUEO SI NO ES ADMINISTRADOR ====================
  if (!isAdminAuthenticated) {
    return (
      <div className="min-h-screen bg-surface text-on-surface flex flex-col justify-between p-4">
        <header className="max-w-md w-full mx-auto pt-4 flex items-center justify-between">
          <button
            type="button"
            onClick={() => onNavigate('public')}
            className="h-10 px-3 rounded-xl bg-surface-container-low hover:bg-surface-container-high text-on-surface-variant hover:text-primary flex items-center gap-1.5 font-label-md text-label-md transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            <span>Volver al Portafolio</span>
          </button>

          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-error-container/30 text-error font-label-sm text-label-sm uppercase tracking-wider">
            <span className="material-symbols-outlined text-[14px]">shield_lock</span>
            Acceso Restringido
          </span>
        </header>

        <main className="max-w-md w-full mx-auto my-auto py-8">
          <div className="bg-surface-container-low border border-outline-variant/25 rounded-2xl p-6 shadow-2xl flex flex-col gap-5">
            <div className="flex flex-col items-center text-center">
              <div className="w-14 h-14 rounded-2xl bg-surface-container-high border border-outline-variant/30 flex items-center justify-center text-secondary mb-3 shadow-lg">
                <span className="material-symbols-outlined text-[30px]">
                  admin_panel_settings
                </span>
              </div>
              <h1 className="font-headline-md text-headline-md text-primary">
                Panel de Super Administrador
              </h1>
              <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
                Área exclusiva protegida por contraseña para administrar todos los perfiles de
                LinkPortfolio (incluyendo <span className="text-primary">@its.araaaby</span>).
              </p>
            </div>

            {loginError && (
              <div className="p-3 rounded-xl bg-error-container/30 border border-error/40 text-error font-body-sm text-body-sm flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] shrink-0">error</span>
                <span>{loginError}</span>
              </div>
            )}

            <form onSubmit={handleAdminLogin} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="admin-email"
                  className="font-label-md text-label-md text-on-surface"
                >
                  Correo de Administrador
                </label>
                <div className="h-12 px-3.5 rounded-xl bg-surface-container border border-outline-variant/20 flex items-center focus-within:border-primary transition-colors">
                  <span className="material-symbols-outlined text-outline text-[20px] mr-3">
                    badge
                  </span>
                  <input
                    id="admin-email"
                    type="email"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="admin@linkportfolio.app"
                    className="w-full bg-transparent text-primary font-body-md text-body-md outline-none"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="admin-password"
                  className="font-label-md text-label-md text-on-surface"
                >
                  Contraseña Maestra
                </label>
                <div className="h-12 px-3.5 rounded-xl bg-surface-container border border-outline-variant/20 flex items-center focus-within:border-primary transition-colors">
                  <span className="material-symbols-outlined text-outline text-[20px] mr-3">
                    key
                  </span>
                  <input
                    id="admin-password"
                    type={showLoginPwd ? 'text' : 'password'}
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••••••••••"
                    className="w-full bg-transparent text-primary font-body-md text-body-md outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPwd(!showLoginPwd)}
                    className="text-outline hover:text-primary ml-2"
                    aria-label="Mostrar u ocultar contraseña"
                  >
                    <span className="material-symbols-outlined text-[20px]">
                      {showLoginPwd ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="h-12 mt-1 rounded-xl bg-primary hover:bg-primary/90 text-on-primary font-label-lg text-label-lg font-semibold flex items-center justify-center gap-2 shadow-lg transition-all active:scale-[0.985]"
              >
                <span className="material-symbols-outlined text-[19px]">lock_open</span>
                <span>Desbloquear Consola de Administrador</span>
              </button>
            </form>
          </div>
        </main>

        <footer className="text-center pb-4 font-body-sm text-body-sm text-outline">
          Protección criptográfica activa • LinkPortfolio Production Security
        </footer>
      </div>
    );
  }

  // ==================== FUNCIONES CRUD DEL SUPER ADMINISTRADOR ====================
  const portfolios = db.portfolios || [];
  const filteredPortfolios = portfolios.filter((p) => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return true;
    return (
      p.slug?.toLowerCase().includes(q) ||
      p.display_name?.toLowerCase().includes(q) ||
      p.owner_email?.toLowerCase().includes(q)
    );
  });

  const newSlugCheck = checkSlugAvailability(db, newSlug);

  // 1. Añadir nuevo perfil
  const handleCreateProfile = (e) => {
    e.preventDefault();
    if (!newSlugCheck.available) return;

    const created = createBlankPortfolio({
      slug: newSlugCheck.cleanSlug,
      email: newEmail || `${newSlugCheck.cleanSlug}@portafolio.app`,
      password: newPassword || 'Portafolio2026!',
      displayName: newDisplayName || `@${newSlugCheck.cleanSlug}`,
    });
    created.is_protected = newProtected;

    const nextDb = {
      ...db,
      portfolios: [...portfolios, created],
    };
    onUpdateDb(nextDb);
    setCreateModalOpen(false);
    setNewSlug('');
    setNewDisplayName('');
    setNewEmail('');
    setNewPassword('');
    setNewProtected(false);
    setNotice(`Perfil @${created.slug} creado exitosamente.`);
  };

  // 2. Actualizar metadatos/credenciales de cualquier perfil
  const handleSaveMetaProfile = (e) => {
    e.preventDefault();
    if (!editMetaProfile) return;

    const slugCheck = checkSlugAvailability(db, metaSlug, editMetaProfile.id);
    if (!slugCheck.available) {
      setNotice(`Error: El slug "${metaSlug}" no está disponible (${slugCheck.reason}).`);
      return;
    }

    const oldSlug = editMetaProfile.slug;
    const updatedPortfolios = portfolios.map((p) => {
      if (p.id !== editMetaProfile.id) return p;
      return {
        ...p,
        slug: slugCheck.cleanSlug,
        owner_email: metaEmail.trim().toLowerCase(),
        owner_password_hash: metaNewPassword.trim()
          ? simpleHash(metaNewPassword.trim())
          : p.owner_password_hash,
        is_protected: metaProtected,
        updated_at: new Date().toISOString(),
      };
    });

    const nextDefaultSlug =
      db.default_slug === oldSlug ? slugCheck.cleanSlug : db.default_slug;

    onUpdateDb({
      ...db,
      default_slug: nextDefaultSlug,
      portfolios: updatedPortfolios,
    });
    setEditMetaProfile(null);
    setMetaNewPassword('');
    setNotice(`Credenciales y configuración de @${slugCheck.cleanSlug} actualizadas.`);
  };

  // 3. Eliminar cualquier perfil (con validación de candado is_protected)
  const handleConfirmDeleteProfile = () => {
    if (!deleteTarget) return;
    if (deleteTarget.is_protected) {
      setNotice(
        `El perfil @${deleteTarget.slug} está protegido contra eliminación. Desactiva primero el candado en "Credenciales" si realmente deseas eliminarlo.`
      );
      setDeleteTarget(null);
      return;
    }
    if (portfolios.length <= 1) {
      setNotice('No puedes eliminar el único portafolio activo del sistema.');
      setDeleteTarget(null);
      return;
    }

    const remaining = portfolios.filter((p) => p.id !== deleteTarget.id);
    const nextDefault =
      db.default_slug === deleteTarget.slug ? remaining[0].slug : db.default_slug;

    onUpdateDb({
      ...db,
      default_slug: nextDefault,
      portfolios: remaining,
    });
    setNotice(`El perfil @${deleteTarget.slug} fue eliminado permanentemente.`);
    setDeleteTarget(null);
  };

  // Alternar estado publicado/borrador de cualquier perfil
  const handleTogglePublishProfile = (portfolioId) => {
    const updated = portfolios.map((p) =>
      p.id === portfolioId ? { ...p, is_published: !p.is_published } : p
    );
    onUpdateDb({ ...db, portfolios: updated });
  };

  // Fijar como portafolio principal en la raíz (/)
  const handleSetDefaultSlug = (slug) => {
    onUpdateDb({ ...db, default_slug: slug });
    setNotice(`Ahora @${slug} es el portafolio principal que se muestra al entrar a la raíz.`);
  };

  return (
    <div className="min-h-screen bg-surface text-on-surface flex flex-col pb-24">
      {/* Cabecera Superior de Super Administrador */}
      <header className="sticky top-0 z-40 bg-surface/90 backdrop-blur-xl border-b border-outline-variant/25">
        <div className="max-w-6xl mx-auto h-16 px-4 sm:px-6 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-secondary/20 border border-secondary/40 text-secondary flex items-center justify-center">
              <span className="material-symbols-outlined text-[20px]">
                admin_panel_settings
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-headline-sm text-headline-sm text-primary">
                  Consola de Administrador
                </span>
                <span className="px-2 py-0.5 rounded-full bg-secondary/15 text-secondary font-label-sm text-label-sm uppercase">
                  Super Admin
                </span>
              </div>
              <p className="font-body-sm text-body-sm text-outline hidden sm:block">
                Sesión activa: {session.email}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onNavigate('public')}
              className="h-9 px-3 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-label-md text-label-md flex items-center gap-1.5 transition-colors"
            >
              <span className="material-symbols-outlined text-[16px]">public</span>
              <span className="hidden sm:inline">Ver Vista Pública</span>
            </button>

            <button
              type="button"
              onClick={() => {
                onSetSession(null);
                onNavigate('public');
              }}
              className="h-9 px-3 rounded-lg bg-error-container/30 hover:bg-error-container/50 text-error font-label-md text-label-md flex items-center gap-1.5 transition-colors"
            >
              <span className="material-symbols-outlined text-[16px]">logout</span>
              <span>Cerrar Sesión Admin</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl w-full mx-auto px-4 sm:px-6 pt-6 flex flex-col gap-6">
        {notice && (
          <div className="p-3.5 rounded-xl bg-secondary-container/20 border border-secondary/35 text-secondary font-body-sm text-body-sm flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">check_circle</span>
              <span>{notice}</span>
            </div>
            <button
              type="button"
              onClick={() => setNotice('')}
              className="text-secondary hover:opacity-80"
            >
              <span className="material-symbols-outlined text-[16px]">close</span>
            </button>
          </div>
        )}

        {/* Tarjetas de Resumen de Plataforma */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
          <div className="bg-surface-container-low border border-outline-variant/20 rounded-2xl p-4">
            <span className="font-label-sm text-label-sm text-outline uppercase">
              Total de Perfiles
            </span>
            <div className="font-headline-lg text-headline-lg text-primary mt-1">
              {portfolios.length}
            </div>
            <span className="font-body-sm text-body-sm text-secondary">
              {portfolios.filter((p) => p.is_published).length} publicados
            </span>
          </div>

          <div className="bg-surface-container-low border border-outline-variant/20 rounded-2xl p-4">
            <span className="font-label-sm text-label-sm text-outline uppercase">
              Portafolio Raíz (/)
            </span>
            <div className="font-headline-sm text-headline-sm text-primary mt-1 truncate">
              @{db.default_slug}
            </div>
            <span className="font-body-sm text-body-sm text-secondary flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">verified_user</span>
              Protegido contra terceros
            </span>
          </div>

          <div className="bg-surface-container-low border border-outline-variant/20 rounded-2xl p-4">
            <span className="font-label-sm text-label-sm text-outline uppercase">
              Enlaces Totales
            </span>
            <div className="font-headline-lg text-headline-lg text-primary mt-1">
              {portfolios.reduce(
                (acc, p) => acc + getActivePortfolioLinks(p).length,
                0
              )}
            </div>
            <span className="font-body-sm text-body-sm text-on-surface-variant">
              En 7 redes oficiales
            </span>
          </div>

          <div className="bg-surface-container-low border border-outline-variant/20 rounded-2xl p-4">
            <span className="font-label-sm text-label-sm text-outline uppercase">
              Google OAuth 2.0
            </span>
            <div className="font-headline-sm text-headline-sm text-primary mt-1">
              {db.google_client_id ? 'Activo' : 'Por configurar'}
            </div>
            <button
              type="button"
              onClick={() => setActiveSection('oauth')}
              className="font-body-sm text-body-sm text-secondary underline mt-0.5"
            >
              Configurar Client ID →
            </button>
          </div>
        </div>

        {/* Pestañas del Panel de Administrador */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-outline-variant/20 pb-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveSection('profiles')}
              className={`h-10 px-4 rounded-xl font-label-lg text-label-lg flex items-center gap-2 transition-all ${
                activeSection === 'profiles'
                  ? 'bg-primary text-on-primary font-semibold'
                  : 'bg-surface-container-low text-on-surface-variant hover:text-primary'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">group</span>
              <span>Perfiles ({portfolios.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveSection('oauth')}
              className={`h-10 px-4 rounded-xl font-label-lg text-label-lg flex items-center gap-2 transition-all ${
                activeSection === 'oauth'
                  ? 'bg-primary text-on-primary font-semibold'
                  : 'bg-surface-container-low text-on-surface-variant hover:text-primary'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">passkey</span>
              <span>Google OAuth 2.0</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveSection('security')}
              className={`h-10 px-4 rounded-xl font-label-lg text-label-lg flex items-center gap-2 transition-all ${
                activeSection === 'security'
                  ? 'bg-primary text-on-primary font-semibold'
                  : 'bg-surface-container-low text-on-surface-variant hover:text-primary'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">security</span>
              <span>Contraseña Admin</span>
            </button>
          </div>

          {activeSection === 'profiles' && (
            <button
              type="button"
              onClick={() => setCreateModalOpen(true)}
              className="h-10 px-4 rounded-xl bg-secondary text-on-secondary font-label-lg text-label-lg font-semibold flex items-center gap-1.5 shadow-md hover:opacity-95 transition-all"
            >
              <span className="material-symbols-outlined text-[18px]">person_add</span>
              <span>+ Añadir Nuevo Perfil</span>
            </button>
          )}
        </div>

        {/* ==================== SECCIÓN 1: LISTADO Y CRUD DE PERFILES ==================== */}
        {activeSection === 'profiles' && (
          <div className="flex flex-col gap-4">
            {/* Buscador */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="relative flex-1 max-w-md">
                <span className="material-symbols-outlined absolute left-3.5 top-2.5 text-outline text-[20px]">
                  search
                </span>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar por @slug, nombre o correo propietario..."
                  className="w-full h-10 pl-10 pr-4 rounded-xl bg-surface-container-low border border-outline-variant/25 text-primary font-body-sm text-body-sm outline-none focus:border-primary"
                />
              </div>

              <button
                type="button"
                onClick={() => {
                  onResetAraaabyDefault();
                  setNotice(
                    'Se restauraron los enlaces e imagen original del perfil @its.araaaby.'
                  );
                }}
                className="h-10 px-3.5 rounded-xl bg-surface-container-low hover:bg-surface-container-high border border-outline-variant/25 text-on-surface-variant hover:text-primary font-label-md text-label-md flex items-center justify-center gap-1.5 transition-colors"
              >
                <span className="material-symbols-outlined text-[17px] text-secondary">
                  restore
                </span>
                <span>Restaurar datos de @its.araaaby</span>
              </button>
            </div>

            {/* Tarjetas de Perfiles */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredPortfolios.map((profile) => {
                const activeLinks = getActivePortfolioLinks(profile);
                const isRootDefault = db.default_slug === profile.slug;

                return (
                  <div
                    key={profile.id}
                    className="bg-surface-container-low border border-outline-variant/25 rounded-2xl p-5 flex flex-col justify-between gap-4 hover:border-outline-variant/50 transition-all"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3.5 min-w-0">
                        <img
                          src={profile.avatar_url || '/avatar-its-araaaby.jpeg'}
                          alt={profile.slug}
                          className="w-14 h-14 rounded-full object-cover ring-2 ring-primary/20 shrink-0"
                        />
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <h3 className="font-headline-sm text-headline-sm text-primary truncate">
                              @{profile.slug}
                            </h3>
                            {isRootDefault && (
                              <span className="px-2 py-0.5 rounded-full bg-secondary/20 text-secondary font-label-sm text-label-sm">
                                Principal (/)
                              </span>
                            )}
                            {profile.is_protected && (
                              <span
                                className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-surface-container-highest text-primary font-label-sm text-label-sm"
                                title="Protegido contra eliminación y reclamo"
                              >
                                <span className="material-symbols-outlined text-[12px] text-secondary">
                                  lock
                                </span>
                                Protegido
                              </span>
                            )}
                          </div>
                          <p className="font-body-sm text-body-sm text-on-surface-variant truncate mt-0.5">
                            Propietario: <span className="text-primary">{profile.owner_email}</span>
                          </p>
                          <p className="font-body-sm text-body-sm text-outline mt-0.5">
                            {activeLinks.length} enlaces activos • Fondo:{' '}
                            {profile.background_type === 'IMAGE' ? 'Foto' : 'Negro #000000'}
                          </p>
                        </div>
                      </div>

                      {/* Switch Publicado / Borrador */}
                      <button
                        type="button"
                        onClick={() => handleTogglePublishProfile(profile.id)}
                        className={`px-2.5 py-1 rounded-full font-label-sm text-label-sm uppercase shrink-0 ${
                          profile.is_published
                            ? 'bg-secondary/15 text-secondary'
                            : 'bg-error-container/30 text-error'
                        }`}
                      >
                        {profile.is_published ? 'Publicado' : 'Borrador'}
                      </button>
                    </div>

                    {/* Botones de Acción CRUD sobre el Perfil */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-outline-variant/15">
                      <button
                        type="button"
                        onClick={() => onOpenProfileInEditor(profile.id)}
                        className="h-10 px-3 rounded-xl bg-primary text-on-primary font-label-md text-label-md font-semibold flex items-center justify-center gap-1.5 hover:opacity-90 transition-opacity"
                      >
                        <span className="material-symbols-outlined text-[16px]">edit</span>
                        <span>Modificar</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setEditMetaProfile(profile);
                          setMetaSlug(profile.slug);
                          setMetaEmail(profile.owner_email || '');
                          setMetaNewPassword('');
                          setMetaProtected(Boolean(profile.is_protected));
                        }}
                        className="h-10 px-3 rounded-xl bg-surface-container-high hover:bg-surface-container-highest text-on-surface font-label-md text-label-md flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <span className="material-symbols-outlined text-[16px]">manage_accounts</span>
                        <span>Credenciales</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => onPreviewProfile(profile.id)}
                        className="h-10 px-3 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface font-label-md text-label-md flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <span className="material-symbols-outlined text-[16px]">visibility</span>
                        <span>Ver Público</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setDeleteTarget(profile)}
                        className="h-10 px-3 rounded-xl bg-surface-container hover:bg-error-container/30 text-outline hover:text-error font-label-md text-label-md flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <span className="material-symbols-outlined text-[16px]">delete</span>
                        <span>Eliminar</span>
                      </button>
                    </div>

                    {!isRootDefault && (
                      <button
                        type="button"
                        onClick={() => handleSetDefaultSlug(profile.slug)}
                        className="text-left font-label-sm text-label-sm text-outline hover:text-secondary transition-colors"
                      >
                        ☆ Establecer @{profile.slug} como portafolio principal al abrir el sitio
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ==================== SECCIÓN 2: CONFIGURACIÓN DE GOOGLE OAUTH 2.0 ==================== */}
        {activeSection === 'oauth' && (
          <div className="bg-surface-container-low border border-outline-variant/25 rounded-2xl p-6 flex flex-col gap-5 max-w-2xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-surface-container-high flex items-center justify-center text-secondary">
                <span className="material-symbols-outlined text-[22px]">passkey</span>
              </div>
              <div>
                <h2 className="font-headline-sm text-headline-sm text-primary">
                  Configuración de Inicio de Sesión con Google (OAuth 2.0)
                </h2>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  Conecta Google Identity Services para autenticar propietarios de portafolios y al
                  administrador con un clic.
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label
                htmlFor="google-client-id"
                className="font-label-md text-label-md text-on-surface"
              >
                Google OAuth 2.0 Client ID
              </label>
              <input
                id="google-client-id"
                type="text"
                value={oauthClientIdDraft}
                onChange={(e) => setOauthClientIdDraft(e.target.value)}
                placeholder="1234567890-abcdefg.apps.googleusercontent.com"
                className="w-full h-11 px-3.5 rounded-xl bg-surface-container border border-outline-variant/30 text-primary font-mono text-xs outline-none focus:border-primary"
              />
              <p className="font-body-sm text-body-sm text-outline">
                También puedes definirlo de forma permanente en Vercel mediante la variable de
                entorno <code className="text-secondary">VITE_GOOGLE_CLIENT_ID</code>.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  onUpdateDb({
                    ...db,
                    google_client_id: oauthClientIdDraft.trim(),
                  });
                  setNotice('Client ID de Google OAuth 2.0 guardado correctamente.');
                }}
                className="h-11 px-5 rounded-xl bg-primary text-on-primary font-label-lg text-label-lg font-semibold"
              >
                Guardar Client ID
              </button>

              <button
                type="button"
                onClick={async () => {
                  try {
                    const user = await authenticateWithGoogleOAuth2(oauthClientIdDraft.trim());
                    setNotice(
                      `¡Conexión OAuth 2.0 exitosa! Cuenta verificada: ${user.name} (${user.email})`
                    );
                  } catch (err) {
                    setNotice(err.message);
                  }
                }}
                className="h-11 px-4 rounded-xl bg-surface-container-high hover:bg-surface-container-highest text-on-surface font-label-md text-label-md flex items-center gap-2"
              >
                <span>Probar Popup de Google OAuth 2.0</span>
              </button>
            </div>

            <div className="p-4 rounded-xl bg-surface-container border border-outline-variant/20 flex flex-col gap-2">
              <h4 className="font-label-lg text-label-lg text-primary font-semibold">
                ¿Cómo funciona el aislamiento con Google OAuth 2.0?
              </h4>
              <ul className="list-disc list-inside font-body-sm text-body-sm text-on-surface-variant space-y-1.5">
                <li>
                  Cuando tu esposa inicie sesión con Google usando el correo asignado como
                  propietario de <strong className="text-primary">@its.araaaby</strong>, entrará
                  directamente al editor de su portafolio.
                </li>
                <li>
                  Si cualquier otra persona inicia sesión con Google, el sistema verificará que{' '}
                  <strong>no</strong> es propietaria de <strong className="text-primary">@its.araaaby</strong> y le creará su propio portafolio independiente sin poder tocar ningún otro perfil.
                </li>
                <li>
                  Si tú inicias sesión con Google usando el correo configurado como{' '}
                  <strong className="text-secondary">Super Administrador</strong>, tendrás acceso
                  total a esta consola y a todos los perfiles.
                </li>
              </ul>
            </div>
          </div>
        )}

        {/* ==================== SECCIÓN 3: SEGURIDAD DEL ADMINISTRADOR ==================== */}
        {activeSection === 'security' && (
          <div className="bg-surface-container-low border border-outline-variant/25 rounded-2xl p-6 flex flex-col gap-4 max-w-xl">
            <h2 className="font-headline-sm text-headline-sm text-primary">
              Credenciales Exclusivas del Super Administrador
            </h2>
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              Actualiza el correo y la contraseña maestra requeridos para entrar a esta consola.
            </p>

            <div className="flex flex-col gap-1.5">
              <label className="font-label-md text-label-md text-on-surface">
                Correo del Super Administrador
              </label>
              <input
                type="email"
                value={adminEmailDraft}
                onChange={(e) => setAdminEmailDraft(e.target.value)}
                className="h-11 px-3.5 rounded-xl bg-surface-container border border-outline-variant/30 text-primary font-body-md text-body-md outline-none"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="font-label-md text-label-md text-on-surface">
                Nueva Contraseña Maestra (dejar en blanco para mantener la actual)
              </label>
              <input
                type="password"
                value={adminNewPwdDraft}
                onChange={(e) => setAdminNewPwdDraft(e.target.value)}
                placeholder="Nueva contraseña maestra"
                className="h-11 px-3.5 rounded-xl bg-surface-container border border-outline-variant/30 text-primary font-body-md text-body-md outline-none"
              />
            </div>

            <button
              type="button"
              onClick={() => {
                const nextEmail = adminEmailDraft.trim().toLowerCase() || db.admin_config.email;
                const nextHash = adminNewPwdDraft.trim()
                  ? simpleHash(adminNewPwdDraft.trim())
                  : db.admin_config.password_hash;

                onUpdateDb({
                  ...db,
                  admin_config: {
                    email: nextEmail,
                    password_hash: nextHash,
                  },
                });
                onSetSession({
                  ...session,
                  email: nextEmail,
                });
                setAdminNewPwdDraft('');
                setNotice('Credenciales del Super Administrador actualizadas correctamente.');
              }}
              className="h-11 px-5 rounded-xl bg-primary text-on-primary font-label-lg text-label-lg font-semibold self-start mt-1"
            >
              Guardar Credenciales de Administrador
            </button>
          </div>
        )}
      </main>

      {/* ==================== MODAL: CREAR NUEVO PERFIL ==================== */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-surface-container-low border border-outline-variant/30 rounded-2xl p-6 flex flex-col gap-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="font-headline-sm text-headline-sm text-primary">
                Añadir Nuevo Perfil de Portafolio
              </h3>
              <button
                type="button"
                onClick={() => setCreateModalOpen(false)}
                className="text-outline hover:text-primary"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleCreateProfile} className="flex flex-col gap-3.5">
              <div className="flex flex-col gap-1">
                <label className="font-label-sm text-label-sm text-on-surface-variant">
                  Identificador de ruta (Slug)
                </label>
                <div className="h-11 px-3 rounded-xl bg-surface-container flex items-center justify-between border border-outline-variant/25">
                  <div className="flex items-center flex-1 min-w-0">
                    <span className="text-outline font-mono text-xs">portafolio.app/</span>
                    <input
                      type="text"
                      required
                      value={newSlug}
                      onChange={(e) =>
                        setNewSlug(e.target.value.toLowerCase().replace(/\s+/g, ''))
                      }
                      placeholder="nuevo.usuario"
                      className="bg-transparent text-primary font-mono text-sm outline-none w-full ml-0.5"
                    />
                  </div>
                  <span
                    className={`font-label-sm text-label-sm px-2 py-0.5 rounded-full ${
                      newSlugCheck.available
                        ? 'bg-secondary/15 text-secondary'
                        : 'bg-error-container/30 text-error'
                    }`}
                  >
                    {newSlugCheck.reason}
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-label-sm text-label-sm text-on-surface-variant">
                  Nombre o Alias Visible
                </label>
                <input
                  type="text"
                  value={newDisplayName}
                  onChange={(e) => setNewDisplayName(e.target.value)}
                  placeholder="@nuevo.usuario"
                  className="h-11 px-3 rounded-xl bg-surface-container text-primary font-body-sm text-body-sm outline-none border border-outline-variant/25"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-label-sm text-label-sm text-on-surface-variant">
                  Correo Electrónico del Propietario (para Login / Google OAuth)
                </label>
                <input
                  type="email"
                  required
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="usuario@gmail.com"
                  className="h-11 px-3 rounded-xl bg-surface-container text-primary font-body-sm text-body-sm outline-none border border-outline-variant/25"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-label-sm text-label-sm text-on-surface-variant">
                  Contraseña del Propietario
                </label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Contraseña de acceso para este perfil"
                  className="h-11 px-3 rounded-xl bg-surface-container text-primary font-body-sm text-body-sm outline-none border border-outline-variant/25"
                />
              </div>

              <label className="flex items-center gap-2 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={newProtected}
                  onChange={(e) => setNewProtected(e.target.checked)}
                  className="accent-secondary w-4 h-4"
                />
                <span className="font-body-sm text-body-sm text-on-surface">
                  Activar candado de protección contra eliminación accidental
                </span>
              </label>

              <div className="grid grid-cols-2 gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="h-11 rounded-xl bg-surface-container-high text-on-surface font-label-md text-label-md"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={!newSlugCheck.available}
                  className="h-11 rounded-xl bg-primary text-on-primary font-label-md text-label-md font-semibold disabled:opacity-40"
                >
                  Crear Perfil
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================== MODAL: EDITAR CREDENCIALES / PROPIETARIO DE PERFIL ==================== */}
      {editMetaProfile && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-surface-container-low border border-outline-variant/30 rounded-2xl p-6 flex flex-col gap-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="font-headline-sm text-headline-sm text-primary">
                Credenciales de @{editMetaProfile.slug}
              </h3>
              <button
                type="button"
                onClick={() => setEditMetaProfile(null)}
                className="text-outline hover:text-primary"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleSaveMetaProfile} className="flex flex-col gap-3.5">
              <div className="flex flex-col gap-1">
                <label className="font-label-sm text-label-sm text-on-surface-variant">
                  Identificador de ruta (Slug)
                </label>
                <input
                  type="text"
                  required
                  value={metaSlug}
                  onChange={(e) =>
                    setMetaSlug(e.target.value.toLowerCase().replace(/\s+/g, ''))
                  }
                  className="h-11 px-3 rounded-xl bg-surface-container text-primary font-mono text-sm outline-none border border-outline-variant/25"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-label-sm text-label-sm text-on-surface-variant">
                  Correo Autorizado del Propietario (Login y Google OAuth 2.0)
                </label>
                <input
                  type="email"
                  required
                  value={metaEmail}
                  onChange={(e) => setMetaEmail(e.target.value)}
                  className="h-11 px-3 rounded-xl bg-surface-container text-primary font-body-sm text-body-sm outline-none border border-outline-variant/25"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-label-sm text-label-sm text-on-surface-variant">
                  Nueva Contraseña del Propietario (opcional)
                </label>
                <input
                  type="password"
                  value={metaNewPassword}
                  onChange={(e) => setMetaNewPassword(e.target.value)}
                  placeholder="Dejar vacío para conservar la contraseña actual"
                  className="h-11 px-3 rounded-xl bg-surface-container text-primary font-body-sm text-body-sm outline-none border border-outline-variant/25"
                />
              </div>

              <label className="flex items-center gap-2 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={metaProtected}
                  onChange={(e) => setMetaProtected(e.target.checked)}
                  className="accent-secondary w-4 h-4"
                />
                <span className="font-body-sm text-body-sm text-on-surface">
                  Perfil protegido (impide eliminación accidental)
                </span>
              </label>

              <div className="grid grid-cols-2 gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setEditMetaProfile(null)}
                  className="h-11 rounded-xl bg-surface-container-high text-on-surface font-label-md text-label-md"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="h-11 rounded-xl bg-primary text-on-primary font-label-md text-label-md font-semibold"
                >
                  Guardar Cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================== MODAL: CONFIRMAR ELIMINACIÓN DE PERFIL ==================== */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-surface-container-low border border-outline-variant/30 rounded-2xl p-5 flex flex-col gap-4 shadow-2xl">
            <div className="flex items-center gap-2 text-error">
              <span className="material-symbols-outlined text-[22px]">warning</span>
              <h3 className="font-headline-sm text-headline-sm">
                ¿Eliminar el perfil @{deleteTarget.slug}?
              </h3>
            </div>
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              {deleteTarget.is_protected
                ? `El perfil @${deleteTarget.slug} cuenta con el candado de protección activo. Para eliminarlo primero debes desactivar su protección en "Credenciales".`
                : `Esta acción eliminará permanentemente el portafolio @${deleteTarget.slug} y todos sus enlaces asociados.`}
            </p>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="h-10 rounded-lg bg-surface-container-high text-on-surface font-label-md text-label-md"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteProfile}
                className="h-10 rounded-lg bg-error text-on-error font-label-md text-label-md font-semibold"
              >
                {deleteTarget.is_protected ? 'Entendido' : 'Sí, eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
