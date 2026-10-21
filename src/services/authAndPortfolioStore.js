import {
  INITIAL_PORTFOLIO_DATA,
  DEFAULT_NEUTRAL_AVATAR,
  PLATFORM_ORDER,
} from '../data/socialCatalog';

const STORE_KEY = 'linkportfolio_prod_db_v2';
const SESSION_KEY = 'linkportfolio_active_session_v2';

export const DEFAULT_ADMIN_EMAIL =
  import.meta.env.VITE_ADMIN_EMAIL || 'admin@linkportfolio.app';
export const DEFAULT_ADMIN_PASSWORD =
  import.meta.env.VITE_ADMIN_PASSWORD || 'AdminLinkPortfolio2026!';

export const DEFAULT_ARAAABY_EMAIL =
  import.meta.env.VITE_ARAAABY_OWNER_EMAIL || 'its.araaaby@portafolio.app';
export const DEFAULT_ARAAABY_PASSWORD =
  import.meta.env.VITE_ARAAABY_OWNER_PASSWORD || 'Araaaby2026!';

export const ENV_GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

/**
 * Hash determinístico ligero para no almacenar contraseñas en texto plano en localStorage.
 */
export function simpleHash(input) {
  const str = String(input || '');
  let h1 = 0xdeadbeef ^ str.length;
  let h2 = 0x41c6ce57 ^ str.length;
  for (let i = 0, ch; i < str.length; i++) {
    ch = str.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 =
    Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^
    Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 =
    Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^
    Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(16);
}

/**
 * Garantiza que un portafolio tenga un grupo (desactivado por defecto) para cada red social
 * del catálogo. Permite que los portafolios existentes reciban automáticamente las redes nuevas
 * sin alterar el orden ni los enlaces que ya tenían configurados.
 * Devuelve el mismo objeto si no hubo cambios.
 */
export function ensureAllPlatformGroups(portfolio) {
  const groups = Array.isArray(portfolio.social_network_groups)
    ? portfolio.social_network_groups
    : [];
  const existing = new Set(groups.map((g) => g.platform));
  const missing = PLATFORM_ORDER.filter((platform) => !existing.has(platform));
  if (missing.length === 0) return portfolio;

  const maxOrder = groups.reduce((acc, g) => Math.max(acc, g.sort_order ?? 0), 0);
  const appended = missing.map((platform, idx) => ({
    id: `group-${platform.toLowerCase()}-${portfolio.id}`,
    portfolio_id: portfolio.id,
    platform,
    is_enabled: false,
    sort_order: maxOrder + idx + 1,
    links: [],
  }));

  return { ...portfolio, social_network_groups: [...groups, ...appended] };
}

/**
 * Construye la base de datos inicial.
 */
export function createInitialDatabase() {
  const initialProfile = ensureAllPlatformGroups({
    ...INITIAL_PORTFOLIO_DATA,
    id: 'portfolio-its-araaaby-001',
    slug: 'its.araaaby',
    owner_email: DEFAULT_ARAAABY_EMAIL.toLowerCase(),
    owner_password_hash: simpleHash(DEFAULT_ARAAABY_PASSWORD),
    is_protected: true,
    has_custom_background: false,
    background_image_url: '',
    created_at: '2026-10-18T22:00:00Z',
    updated_at: new Date().toISOString(),
  });

  return {
    version: 2,
    default_slug: 'its.araaaby',
    google_client_id: ENV_GOOGLE_CLIENT_ID,
    admin_config: {
      email: DEFAULT_ADMIN_EMAIL.toLowerCase(),
      password_hash: simpleHash(DEFAULT_ADMIN_PASSWORD),
    },
    portfolios: [initialProfile],
  };
}

export function loadDatabase() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.portfolios) && parsed.portfolios.length > 0) {
        if (ENV_GOOGLE_CLIENT_ID && !parsed.google_client_id) {
          parsed.google_client_id = ENV_GOOGLE_CLIENT_ID;
        }
        // Normalizar portafolios para que ninguno use por error la foto de otro perfil como fondo
        let migrated = false;
        parsed.portfolios = parsed.portfolios.map((p) => {
          let nextP = { ...p };
          // Agregar los grupos de redes sociales nuevas que aún no existan en el portafolio
          const withAllGroups = ensureAllPlatformGroups(nextP);
          if (withAllGroups !== nextP) {
            nextP = withAllGroups;
            migrated = true;
          }
          if (nextP.slug !== 'its.araaaby' && nextP.avatar_url === '/avatar-its-araaaby.jpeg') {
            nextP.avatar_url = DEFAULT_NEUTRAL_AVATAR;
            migrated = true;
          }
          if (
            nextP.background_image_url === '/avatar-its-araaaby.jpeg' ||
            nextP.background_image_url === nextP.avatar_url
          ) {
            nextP.background_image_url = '';
            nextP.background_image_name = '';
            nextP.has_custom_background = false;
            migrated = true;
          } else if (typeof nextP.has_custom_background !== 'boolean') {
            nextP.has_custom_background = Boolean(
              nextP.background_image_url && nextP.background_image_url.trim() !== ''
            );
            migrated = true;
          }
          return nextP;
        });
        if (migrated) {
          saveDatabase(parsed);
        }
        return parsed;
      }
    }
  } catch {
    // Inicializar base limpia en caso de error
  }
  const initial = createInitialDatabase();
  saveDatabase(initial);
  return initial;
}

export function saveDatabase(db) {
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(db));
  } catch {
    // En caso de exceder cuota por imágenes grandes, mantener en memoria
  }
}

export function loadActiveSession() {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY) || localStorage.getItem(SESSION_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch {
    // Ignorar error
  }
  return null;
}

export function saveActiveSession(session) {
  try {
    if (!session) {
      sessionStorage.removeItem(SESSION_KEY);
      localStorage.removeItem(SESSION_KEY);
    } else {
      const serialized = JSON.stringify(session);
      sessionStorage.setItem(SESSION_KEY, serialized);
      localStorage.setItem(SESSION_KEY, serialized);
    }
  } catch {
    // Ignorar
  }
}

/**
 * Verifica estrictamente si la sesión actual tiene permiso para editar un portafolio específico.
 */
export function canEditPortfolio(session, portfolio) {
  if (!session || !portfolio) return false;
  if (session.role === 'ADMIN') return true;
  if (session.portfolioId && session.portfolioId === portfolio.id) return true;
  if (
    session.email &&
    portfolio.owner_email &&
    session.email.toLowerCase() === portfolio.owner_email.toLowerCase()
  ) {
    return true;
  }
  return false;
}

/**
 * Verifica si un slug está disponible para reclamo por un usuario nuevo.
 */
export function checkSlugAvailability(db, slugToCheck, currentPortfolioId = null) {
  const clean = String(slugToCheck || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9._-]/g, '');

  if (clean.length < 3) {
    return { available: false, reason: 'Muy corto (mín. 3)', cleanSlug: clean };
  }

  const reserved = ['admin', 'login', 'register', 'settings', 'api', 'root', 'onboarding'];
  if (reserved.includes(clean)) {
    return { available: false, reason: 'Ruta reservada', cleanSlug: clean };
  }

  const existing = (db.portfolios || []).find(
    (p) => p.slug.toLowerCase() === clean && p.id !== currentPortfolioId
  );

  if (existing) {
    return {
      available: false,
      reason: 'No disponible',
      cleanSlug: clean,
    };
  }

  return { available: true, reason: 'Disponible', cleanSlug: clean };
}

/**
 * Crea un portafolio nuevo en blanco (todas las redes desactivadas por defecto según Sección 2.2 del SRS).
 */
export function createBlankPortfolio({ slug, email, password, displayName, avatarUrl }) {
  const cleanSlug = String(slug || `usuario-${Date.now().toString().slice(-4)}`)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9._-]/g, '');

  const portfolioId = `portfolio-${cleanSlug}-${Date.now()}`;

  return {
    id: portfolioId,
    user_id: `user-${cleanSlug}`,
    slug: cleanSlug,
    owner_email: String(email || '').trim().toLowerCase(),
    owner_password_hash: simpleHash(password || 'TempPass2026!'),
    is_protected: false,
    display_name: displayName || `@${cleanSlug}`,
    bio: 'Mi portafolio oficial de redes sociales',
    avatar_url: avatarUrl || DEFAULT_NEUTRAL_AVATAR,
    background_type: 'BLACK',
    has_custom_background: false,
    background_image_url: '',
    background_image_name: '',
    background_image_meta: '',
    background_overlay_opacity: 40,
    is_published: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    social_network_groups: PLATFORM_ORDER.map((platform, idx) => ({
      id: `group-${platform.toLowerCase()}-${portfolioId}`,
      portfolio_id: portfolioId,
      platform,
      is_enabled: false,
      sort_order: idx + 1,
      links: [],
    })),
  };
}

/**
 * Carga dinámicamente el script oficial de Google Identity Services (OAuth 2.0)
 * e incluye triggers/eventos para detectar cuando el usuario cierra la ventana emergente
 * sin seleccionar cuenta, evitando que el botón se quede cargando.
 */
export function authenticateWithGoogleOAuth2(clientId) {
  return new Promise((resolve, reject) => {
    if (!clientId || !clientId.trim()) {
      reject(
        new Error(
          'Falta configurar el Client ID de Google OAuth 2.0 (VITE_GOOGLE_CLIENT_ID o desde el Panel de Administrador).'
        )
      );
      return;
    }

    let settled = false;
    let focusTimer = null;
    let popupOpened = false;

    const cleanupListeners = () => {
      if (focusTimer) clearTimeout(focusTimer);
      window.removeEventListener('focus', handleWindowFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };

    const safeResolve = (data) => {
      if (settled) return;
      settled = true;
      cleanupListeners();
      resolve(data);
    };

    const safeReject = (err) => {
      if (settled) return;
      settled = true;
      cleanupListeners();
      reject(err);
    };

    // Trigger de enfoque: cuando la ventana emergente de Google se cierra sin elegir cuenta,
    // la ventana principal recupera el foco ('focus'). Damos 900ms de margen por si sí seleccionó cuenta;
    // si no llegó respuesta de token, liberamos el botón inmediatamente.
    const handleWindowFocus = () => {
      if (!popupOpened || settled) return;
      if (focusTimer) clearTimeout(focusTimer);
      focusTimer = setTimeout(() => {
        if (!settled) {
          safeReject(
            new Error('Se cerró la ventana de Google sin seleccionar una cuenta.')
          );
        }
      }, 900);
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        handleWindowFocus();
      }
    };

    const initTokenFlow = () => {
      if (!window.google || !window.google.accounts || !window.google.accounts.oauth2) {
        safeReject(new Error('No se pudo inicializar el cliente de Google OAuth 2.0.'));
        return;
      }

      const tokenClient = window.google.accounts.oauth2.initTokenClient({
        client_id: clientId.trim(),
        scope: 'openid email profile',
        // Callback nativo de error de Google Identity Services (ej. popup_closed / popup_failed_to_open)
        error_callback: (err) => {
          if (err && err.type === 'popup_closed') {
            safeReject(
              new Error('Se cerró la ventana emergente de Google sin iniciar sesión.')
            );
          } else {
            safeReject(
              new Error(
                err?.message || 'Se canceló el inicio de sesión con Google.'
              )
            );
          }
        },
        callback: async (tokenResponse) => {
          if (focusTimer) clearTimeout(focusTimer);
          if (tokenResponse.error) {
            safeReject(new Error(`Cancelado o error de Google OAuth: ${tokenResponse.error}`));
            return;
          }
          try {
            const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
              headers: {
                Authorization: `Bearer ${tokenResponse.access_token}`,
              },
            });
            if (!res.ok) {
              throw new Error('No se pudo obtener el perfil de usuario de Google.');
            }
            const profile = await res.json();
            safeResolve({
              email: (profile.email || '').toLowerCase(),
              name: profile.name || profile.given_name || 'Usuario Google',
              picture: profile.picture || '',
              sub: profile.sub,
            });
          } catch (err) {
            safeReject(err);
          }
        },
      });

      // Registrar eventos para monitorear la ventana emergente
      window.addEventListener('focus', handleWindowFocus);
      document.addEventListener('visibilitychange', handleVisibilityChange);

      // Marcar que la ventana emergente fue abierta tras un breve instante
      setTimeout(() => {
        popupOpened = true;
      }, 400);

      tokenClient.requestAccessToken({ prompt: 'select_account' });
    };

    if (window.google && window.google.accounts && window.google.accounts.oauth2) {
      initTokenFlow();
      return;
    }

    const existingScript = document.getElementById('google-gsi-client-script');
    if (existingScript) {
      existingScript.addEventListener('load', initTokenFlow);
      return;
    }

    const script = document.getElementById('google-gsi-client-script');
    const newScript = document.createElement('script');
    newScript.id = 'google-gsi-client-script';
    newScript.src = 'https://accounts.google.com/gsi/client';
    newScript.async = true;
    newScript.defer = true;
    newScript.onload = initTokenFlow;
    newScript.onerror = () =>
      safeReject(new Error('Error de red al cargar Google Identity Services (gsi/client).'));
    document.head.appendChild(newScript);
  });
}
