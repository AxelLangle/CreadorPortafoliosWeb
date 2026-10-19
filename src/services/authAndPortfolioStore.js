import { INITIAL_PORTFOLIO_DATA } from '../data/socialCatalog';

const STORE_KEY = 'linkportfolio_prod_db_v2';
const SESSION_KEY = 'linkportfolio_active_session_v2';

/**
 * Credenciales por defecto configurables mediante variables de entorno (.env)
 * En producción (Vercel), puedes definir:
 * - VITE_ADMIN_EMAIL
 * - VITE_ADMIN_PASSWORD
 * - VITE_ARAAABY_OWNER_EMAIL
 * - VITE_ARAAABY_OWNER_PASSWORD
 * - VITE_GOOGLE_CLIENT_ID
 */
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
 *Construye la base de datos inicial con el perfil protegido de @its.araaaby
 * y la cuenta de Super Administrador.
 */
export function createInitialDatabase() {
  const araaabyProfile = {
    ...INITIAL_PORTFOLIO_DATA,
    id: 'portfolio-its-araaaby-001',
    slug: 'its.araaaby',
    owner_email: DEFAULT_ARAAABY_EMAIL.toLowerCase(),
    owner_password_hash: simpleHash(DEFAULT_ARAAABY_PASSWORD),
    is_protected: true, // Impide eliminación accidental o reclamo por terceros
    created_at: '2026-10-18T22:00:00Z',
    updated_at: new Date().toISOString(),
  };

  return {
    version: 2,
    default_slug: 'its.araaaby',
    google_client_id: ENV_GOOGLE_CLIENT_ID,
    admin_config: {
      email: DEFAULT_ADMIN_EMAIL.toLowerCase(),
      password_hash: simpleHash(DEFAULT_ADMIN_PASSWORD),
    },
    portfolios: [araaabyProfile],
  };
}

/**
 * Carga la base de datos desde localStorage garantizando que el perfil principal @its.araaaby exista.
 */
export function loadDatabase() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.portfolios) && parsed.portfolios.length > 0) {
        if (ENV_GOOGLE_CLIENT_ID && !parsed.google_client_id) {
          parsed.google_client_id = ENV_GOOGLE_CLIENT_ID;
        }
        return parsed;
      }
    }
  } catch {
    // Si falla el parseo, inicializar base limpia
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

/**
 * Gestión de la sesión activa (aislamiento de permisos en producción).
 */
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
 * En producción:
 * - Visitantes sin sesión: NUNCA pueden editar ningún perfil.
 * - Usuarios estándar: SOLO pueden editar su propio portafolio (coincidencia de ID o email propietario).
 * - Super Administrador (role === 'ADMIN'): Puede añadir, modificar, actualizar o eliminar CUALQUIER perfil.
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
      reason: existing.is_protected ? 'Protegido (En uso)' : 'Ocupado',
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
  const platforms = [
    'FACEBOOK',
    'INSTAGRAM',
    'X',
    'THREADS',
    'TIKTOK',
    'YOUTUBE',
    'WHATSAPP',
  ];

  return {
    id: portfolioId,
    user_id: `user-${cleanSlug}`,
    slug: cleanSlug,
    owner_email: String(email || '').trim().toLowerCase(),
    owner_password_hash: simpleHash(password || 'TempPass2026!'),
    is_protected: false,
    display_name: displayName || `@${cleanSlug}`,
    bio: 'Mi portafolio oficial de redes sociales',
    avatar_url:
      avatarUrl ||
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
    background_type: 'BLACK',
    background_image_url: '',
    background_image_name: '',
    background_image_meta: '',
    background_overlay_opacity: 40,
    is_published: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    social_network_groups: platforms.map((platform, idx) => ({
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
 * y solicita autenticación de usuario con su cuenta de Google.
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

    const initTokenFlow = () => {
      if (!window.google || !window.google.accounts || !window.google.accounts.oauth2) {
        reject(new Error('No se pudo inicializar el cliente de Google OAuth 2.0.'));
        return;
      }

      const tokenClient = window.google.accounts.oauth2.initTokenClient({
        client_id: clientId.trim(),
        scope: 'openid email profile',
        callback: async (tokenResponse) => {
          if (tokenResponse.error) {
            reject(new Error(`Error de Google OAuth: ${tokenResponse.error}`));
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
            resolve({
              email: (profile.email || '').toLowerCase(),
              name: profile.name || profile.given_name || 'Usuario Google',
              picture: profile.picture || '',
              sub: profile.sub,
            });
          } catch (err) {
            reject(err);
          }
        },
      });

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

    const script = document.createElement('script');
    script.id = 'google-gsi-client-script';
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = initTokenFlow;
    script.onerror = () =>
      reject(new Error('Error de red al cargar Google Identity Services (gsi/client).'));
    document.head.appendChild(script);
  });
}
