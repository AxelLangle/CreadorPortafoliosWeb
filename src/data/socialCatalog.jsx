import React from 'react';

/**
 * Catálogo Oficial de las 7 Redes Sociales soportadas (Sección 2.1 / RF-06)
 * Exclusivamente: Instagram, TikTok, Facebook, X (antes Twitter), YouTube, Threads y WhatsApp.
 */
export const SOCIAL_PLATFORMS = {
  FACEBOOK: {
    id: 'FACEBOOK',
    name: 'Facebook',
    prefix: 'facebook.com/',
    baseUrl: 'https://www.facebook.com/',
    placeholder: 'usuario o pega tu enlace https://...',
    defaultLabel: 'Facebook',
    addButtonText: 'Añadir otro perfil de Facebook',
    icon: (className = 'w-5 h-5 fill-current') => (
      <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
      </svg>
    ),
    svgString: `<svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>`,
  },
  INSTAGRAM: {
    id: 'INSTAGRAM',
    name: 'Instagram',
    prefix: 'instagram.com/',
    baseUrl: 'https://www.instagram.com/',
    placeholder: 'usuario o pega tu enlace https://...',
    defaultLabel: 'Instagram',
    addButtonText: 'Añadir otro perfil de Instagram',
    icon: (className = 'w-5 h-5 fill-current') => (
      <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
      </svg>
    ),
    svgString: `<svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>`,
  },
  X: {
    id: 'X',
    name: 'X',
    prefix: 'x.com/',
    baseUrl: 'https://x.com/',
    placeholder: 'usuario o pega tu enlace https://...',
    defaultLabel: 'X',
    addButtonText: 'Añadir otro perfil de X',
    icon: (className = 'w-4 h-4 fill-current') => (
      <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
    svgString: `<svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>`,
  },
  THREADS: {
    id: 'THREADS',
    name: 'Threads',
    prefix: 'threads.com/@',
    baseUrl: 'https://www.threads.com/@',
    placeholder: 'usuario o pega tu enlace https://...',
    defaultLabel: 'Threads',
    addButtonText: 'Añadir otro perfil de Threads',
    icon: (className = 'w-4 h-4 fill-current') => (
      <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12.186 24C5.467 24 0 18.533 0 11.814S5.467 0 12.186 0c3.702 0 7.027 1.636 9.248 4.298l-2.738 2.378C16.892 4.675 14.654 3.5 12.186 3.5c-4.584 0-8.314 3.73-8.314 8.314s3.73 8.314 8.314 8.314c3.483 0 6.467-2.146 7.697-5.215h-7.697v-3.5h11.23c.123.633.187 1.29.187 1.968C23.603 18.825 18.528 24 12.186 24z" />
      </svg>
    ),
    svgString: `<svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><path d="M12.186 24C5.467 24 0 18.533 0 11.814S5.467 0 12.186 0c3.702 0 7.027 1.636 9.248 4.298l-2.738 2.378C16.892 4.675 14.654 3.5 12.186 3.5c-4.584 0-8.314 3.73-8.314 8.314s3.73 8.314 8.314 8.314c3.483 0 6.467-2.146 7.697-5.215h-7.697v-3.5h11.23c.123.633.187 1.29.187 1.968C23.603 18.825 18.528 24 12.186 24z"/></svg>`,
  },
  TIKTOK: {
    id: 'TIKTOK',
    name: 'TikTok',
    prefix: 'tiktok.com/@',
    baseUrl: 'https://www.tiktok.com/@',
    placeholder: 'usuario o pega tu enlace https://...',
    defaultLabel: 'TikTok',
    addButtonText: 'Añadir otro perfil de TikTok',
    icon: (className = 'w-4 h-4 fill-current') => (
      <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.298 0 .592.046.87.136V9.41a6.33 6.33 0 0 0-.87-.06 6.34 6.34 0 1 0 6.34 6.34V8.45a8.28 8.28 0 0 0 4.77 1.55v-3.31z" />
      </svg>
    ),
    svgString: `<svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.298 0 .592.046.87.136V9.41a6.33 6.33 0 0 0-.87-.06 6.34 6.34 0 1 0 6.34 6.34V8.45a8.28 8.28 0 0 0 4.77 1.55v-3.31z"/></svg>`,
  },
  YOUTUBE: {
    id: 'YOUTUBE',
    name: 'YouTube',
    prefix: 'youtube.com/@',
    baseUrl: 'https://www.youtube.com/@',
    placeholder: 'canal o pega tu enlace https://...',
    defaultLabel: 'YouTube',
    addButtonText: 'Añadir otro canal de YouTube',
    icon: (className = 'w-4 h-4 fill-current') => (
      <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
      </svg>
    ),
    svgString: `<svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>`,
  },
  WHATSAPP: {
    id: 'WHATSAPP',
    name: 'WhatsApp',
    prefix: 'wa.me/',
    baseUrl: 'https://wa.me/',
    placeholder: 'Número telefónico o enlace wa.me/...',
    defaultLabel: 'WhatsApp Directo',
    addButtonText: 'Añadir otro contacto de WhatsApp',
    icon: (className = 'w-4 h-4 fill-current') => (
      <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2m.01 1.67c2.2 0 4.26.86 5.82 2.41a8.19 8.19 0 0 1 2.41 5.83c0 4.54-3.7 8.24-8.24 8.24-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.19 8.19 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.24-8.24M8.53 7.33c-.16 0-.35.06-.53.25-.19.2-.72.7-.72 1.71 0 1.01.74 1.99.84 2.13.1.13 1.43 2.19 3.47 3.07.49.21.87.33 1.17.42.49.16.94.13 1.29.08.4-.06 1.21-.49 1.38-.97.17-.48.17-.9.12-.97-.05-.08-.18-.13-.37-.23s-1.21-.6-1.4-.67c-.19-.07-.33-.1-.47.1-.14.2-.55.69-.67.83-.12.14-.24.16-.43.06-.19-.1-.8-.29-1.52-.94-.56-.5-1.02-1.2-1.13-1.4-.11-.2-.01-.31.09-.4.09-.09.19-.23.29-.35.1-.12.13-.2.2-.33.07-.13.03-.25-.02-.35-.05-.1-.47-1.14-.64-1.56-.17-.42-.35-.36-.48-.37-.12-.01-.26-.01-.4-.01z" />
      </svg>
    ),
    svgString: `<svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24"><path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2m.01 1.67c2.2 0 4.26.86 5.82 2.41a8.19 8.19 0 0 1 2.41 5.83c0 4.54-3.7 8.24-8.24 8.24-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.19 8.19 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.24-8.24M8.53 7.33c-.16 0-.35.06-.53.25-.19.2-.72.7-.72 1.71 0 1.01.74 1.99.84 2.13.1.13 1.43 2.19 3.47 3.07.49.21.87.33 1.17.42.49.16.94.13 1.29.08.4-.06 1.21-.49 1.38-.97.17-.48.17-.9.12-.97-.05-.08-.18-.13-.37-.23s-1.21-.6-1.4-.67c-.19-.07-.33-.1-.47.1-.14.2-.55.69-.67.83-.12.14-.24.16-.43.06-.19-.1-.8-.29-1.52-.94-.56-.5-1.02-1.2-1.13-1.4-.11-.2-.01-.31.09-.4.09-.09.19-.23.29-.35.1-.12.13-.2.2-.33.07-.13.03-.25-.02-.35-.05-.1-.47-1.14-.64-1.56-.17-.42-.35-.36-.48-.37-.12-.01-.26-.01-.4-.01z"/></svg>`,
  },
};

export const COUNTRY_CODES = [
  { code: '52', label: '🇲🇽 +52 (México)' },
  { code: '1', label: '🇺🇸 +1 (EE. UU. / Canadá)' },
  { code: '34', label: '🇪🇸 +34 (España)' },
  { code: '57', label: '🇨🇴 +57 (Colombia)' },
  { code: '54', label: '🇦🇷 +54 (Argentina)' },
  { code: '56', label: '🇨🇱 +56 (Chile)' },
  { code: '51', label: '🇵🇪 +51 (Perú)' },
  { code: '58', label: '🇻🇪 +58 (Venezuela)' },
  { code: '593', label: '🇪🇨 +593 (Ecuador)' },
  { code: '502', label: '🇬🇹 +502 (Guatemala)' },
  { code: '506', label: '🇨🇷 +506 (Costa Rica)' },
];

/**
 * RNF-03 y RF-10: Sanitización XSS y resolución inteligente de enlaces bajo protocolo HTTPS.
 */
export function resolveSafeSocialUrl(platformId, rawInput, countryCode = '52') {
  if (!rawInput || typeof rawInput !== 'string') return '';

  // Eliminar caracteres de control o intentos de inyección javascript:/data:/vbscript:
  const cleaned = rawInput.trim().replace(/[\u0000-\u001F\u007F<>"]/g, '');
  if (!cleaned) return '';

  const lower = cleaned.toLowerCase();
  if (
    lower.startsWith('javascript:') ||
    lower.startsWith('data:') ||
    lower.startsWith('vbscript:')
  ) {
    return '';
  }

  // Caso especial: WhatsApp (RF-10)
  if (platformId === 'WHATSAPP') {
    if (lower.startsWith('https://') || lower.startsWith('http://')) {
      return cleaned.replace(/^http:\/\//i, 'https://');
    }
    if (lower.startsWith('wa.me/') || lower.startsWith('api.whatsapp.com/')) {
      return `https://${cleaned}`;
    }
    // Si es un número telefónico, extraer dígitos y concatenar código de país si hace falta
    const digits = cleaned.replace(/\D/g, '');
    if (!digits) return '';
    const fullNumber =
      cleaned.startsWith('+') || digits.length > 10 ? digits : `${countryCode}${digits}`;
    return `https://wa.me/${fullNumber}`;
  }

  // Si ya es una URL completa con http/https, forzar https:// (RNF-03)
  if (lower.startsWith('https://')) {
    return cleaned;
  }
  if (lower.startsWith('http://')) {
    return cleaned.replace(/^http:\/\//i, 'https://');
  }

  // Si inicia con el dominio sin protocolo (ej. instagram.com/its.araaaby o www.facebook.com/...)
  if (
    lower.startsWith('www.') ||
    lower.startsWith('instagram.com/') ||
    lower.startsWith('facebook.com/') ||
    lower.startsWith('fb.com/') ||
    lower.startsWith('x.com/') ||
    lower.startsWith('twitter.com/') ||
    lower.startsWith('threads.com/') ||
    lower.startsWith('threads.net/') ||
    lower.startsWith('tiktok.com/') ||
    lower.startsWith('youtube.com/') ||
    lower.startsWith('youtu.be/')
  ) {
    return `https://${cleaned}`;
  }

  // De lo contrario, se trata de un @usuario o ruta relativa
  const platform = SOCIAL_PLATFORMS[platformId];
  if (!platform) return `https://${cleaned}`;
  const cleanHandle = cleaned.replace(/^@+/, '').replace(/^\/+/, '');
  return `${platform.baseUrl}${cleanHandle}`;
}

/**
 * Avatar neutral predeterminado (SVG en modo oscuro Obsidian Bio) para cuentas nuevas.
 */
export const DEFAULT_NEUTRAL_AVATAR =
  "data:image/svg+xml;utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 256 256'%3E%3Crect width='256' height='256' fill='%231c1b1b'/%3E%3Ccircle cx='128' cy='96' r='44' fill='%234edea3' fill-opacity='0.85'/%3E%3Cpath d='M48 216c14-38 44-58 80-58s66 20 80 58' fill='%234edea3' fill-opacity='0.45'/%3E%3C/svg%3E";

/**
 * Obtiene la imagen de fondo efectiva para la opción "Foto Personalizada":
 * - Por defecto utiliza SIEMPRE la foto de perfil actual del portafolio (`avatar_url`).
 * - Solo si el usuario subió explícitamente otra imagen de fondo (`has_custom_background: true`),
 *   se utiliza `background_image_url`.
 */
export function getEffectiveBackgroundImage(portfolio) {
  if (!portfolio) return DEFAULT_NEUTRAL_AVATAR;
  if (
    portfolio.has_custom_background &&
    portfolio.background_image_url &&
    portfolio.background_image_url.trim() !== ''
  ) {
    return portfolio.background_image_url;
  }
  return portfolio.avatar_url || DEFAULT_NEUTRAL_AVATAR;
}

/**
 * Portafolio inicial preconfigurado
 * Cumple con la estructura relacional en 3 niveles de la Sección 6 del SRS:
 * 6.1 Tabla Portfolios
 * 6.2 Tabla SocialNetworkGroups
 * 6.3 Tabla SocialLinks
 */
export const INITIAL_PORTFOLIO_DATA = {
  id: 'portfolio-its-araaaby-001',
  user_id: 'user-its-araaaby-001',
  email: 'its.araaaby@portafolio.app',
  slug: 'its.araaaby',
  display_name: '@its.araaaby',
  bio: 'Fitness Coach • Nail Artist • Creadora Digital',
  avatar_url: '/avatar-its-araaaby.jpeg',
  background_type: 'BLACK', // 'BLACK' | 'IMAGE'
  has_custom_background: false,
  background_image_url: '',
  background_image_name: '',
  background_image_meta: 'Optimizado WebP',
  background_overlay_opacity: 45, // 0 a 80 (valor por defecto en SRS: 40)
  is_published: true,
  social_network_groups: [
    {
      id: 'group-facebook',
      portfolio_id: 'portfolio-its-araaaby-001',
      platform: 'FACEBOOK',
      is_enabled: true,
      sort_order: 1,
      links: [
        {
          id: 'link-fb-1',
          group_id: 'group-facebook',
          label: 'Facebook',
          target_url: 'https://www.facebook.com/share/1C7WpHJvRK/?mibextid=wwXIfr',
          is_visible: true,
          sort_order: 1,
        },
      ],
    },
    {
      id: 'group-instagram',
      portfolio_id: 'portfolio-its-araaaby-001',
      platform: 'INSTAGRAM',
      is_enabled: true,
      sort_order: 2,
      links: [
        {
          id: 'link-ig-1',
          group_id: 'group-instagram',
          label: 'Instagram personal',
          target_url: 'https://www.instagram.com/its.araaaby?vrfl=cDFzMm1jb2N3Ynpo&utm_source=qr',
          is_visible: true,
          sort_order: 1,
        },
        {
          id: 'link-ig-2',
          group_id: 'group-instagram',
          label: 'Ig Coach',
          target_url:
            'https://www.instagram.com/afit.araa?psln=MTQ2ODB4Ymc1NTUxYw%3D%3D&utm_source=qr',
          is_visible: true,
          sort_order: 2,
        },
        {
          id: 'link-ig-3',
          group_id: 'group-instagram',
          label: 'Ig Nails',
          target_url:
            'https://www.instagram.com/araaanails_?cplk=MXhtbWdvZWNnZjhwOA%3D%3D&utm_source=qr',
          is_visible: true,
          sort_order: 3,
        },
      ],
    },
    {
      id: 'group-x',
      portfolio_id: 'portfolio-its-araaaby-001',
      platform: 'X',
      is_enabled: true,
      sort_order: 3,
      links: [
        {
          id: 'link-x-1',
          group_id: 'group-x',
          label: 'X',
          target_url: 'https://x.com/diaz37586?s=11',
          is_visible: true,
          sort_order: 1,
        },
      ],
    },
    {
      id: 'group-threads',
      portfolio_id: 'portfolio-its-araaaby-001',
      platform: 'THREADS',
      is_enabled: true,
      sort_order: 4,
      links: [
        {
          id: 'link-threads-1',
          group_id: 'group-threads',
          label: 'Threads',
          target_url: 'https://www.threads.com/@araaa.by_?igshid=NTc4MTIwNjQ2YQ==',
          is_visible: true,
          sort_order: 1,
        },
      ],
    },
    {
      id: 'group-tiktok',
      portfolio_id: 'portfolio-its-araaaby-001',
      platform: 'TIKTOK',
      is_enabled: false,
      sort_order: 5,
      links: [
        {
          id: 'link-tiktok-1',
          group_id: 'group-tiktok',
          label: 'TikTok Oficial',
          target_url: 'https://www.tiktok.com/@its.araaaby',
          is_visible: true,
          sort_order: 1,
        },
      ],
    },
    {
      id: 'group-youtube',
      portfolio_id: 'portfolio-its-araaaby-001',
      platform: 'YOUTUBE',
      is_enabled: false,
      sort_order: 6,
      links: [
        {
          id: 'link-youtube-1',
          group_id: 'group-youtube',
          label: 'Canal de YouTube',
          target_url: 'https://www.youtube.com/@its.araaaby',
          is_visible: true,
          sort_order: 1,
        },
      ],
    },
    {
      id: 'group-whatsapp',
      portfolio_id: 'portfolio-its-araaaby-001',
      platform: 'WHATSAPP',
      is_enabled: false,
      sort_order: 7,
      links: [
        {
          id: 'link-wa-1',
          group_id: 'group-whatsapp',
          label: 'WhatsApp Directo',
          target_url: 'https://wa.me/5215500000000',
          phone_country: '52',
          phone_number: '',
          input_mode: 'PHONE', // 'PHONE' | 'URL'
          is_visible: true,
          sort_order: 1,
        },
      ],
    },
  ],
};

/**
 * Obtiene todos los botones activos y válidos ordenados según sort_order de la red y del enlace.
 */
export function getActivePortfolioLinks(portfolio) {
  if (!portfolio || !Array.isArray(portfolio.social_network_groups)) return [];

  const sortedGroups = [...portfolio.social_network_groups].sort(
    (a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0)
  );

  const activeItems = [];
  for (const group of sortedGroups) {
    if (!group.is_enabled) continue;
    const platform = SOCIAL_PLATFORMS[group.platform];
    if (!platform) continue;

    const sortedLinks = [...(group.links || [])].sort(
      (a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0)
    );

    for (const link of sortedLinks) {
      if (link.is_visible === false) continue;
      const safeUrl = resolveSafeSocialUrl(
        group.platform,
        link.target_url,
        link.phone_country || '52'
      );
      if (!safeUrl) continue;

      activeItems.push({
        id: link.id,
        platformId: group.platform,
        platformName: platform.name,
        label: (link.label || '').trim() || platform.defaultLabel,
        url: safeUrl,
        icon: platform.icon,
        svgString: platform.svgString,
      });
    }
  }

  return activeItems;
}

/**
 * Genera y descarga un archivo HTML estático autocontenido del portafolio actual.
 */
export function exportStandaloneStaticHtml(portfolio) {
  const activeLinks = getActivePortfolioLinks(portfolio);
  const effectiveBgUrl = getEffectiveBackgroundImage(portfolio);
  const isImageBg = portfolio.background_type === 'IMAGE' && Boolean(effectiveBgUrl);
  const overlayOpacity = Math.min(80, Math.max(0, Number(portfolio.background_overlay_opacity ?? 40))) / 100;
  const displayHandle = (portfolio.display_name || portfolio.slug || 'usuario').startsWith('@')
    ? portfolio.display_name || `@${portfolio.slug}`
    : `@${portfolio.display_name || portfolio.slug}`;

  const linksHtml = activeLinks
    .map(
      (item) => `
      <a href="${item.url.replace(/"/g, '&quot;')}" target="_blank" rel="noopener noreferrer" class="link-card">
        <div class="link-left">
          <div class="link-icon">${item.svgString}</div>
          <span class="link-label">${item.label
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')}</span>
        </div>
        <span class="link-arrow">↗</span>
      </a>`
    )
    .join('\n');

  const htmlString = `<!DOCTYPE html>
<html lang="es" class="dark">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${displayHandle} | Portafolio Oficial</title>
  <meta property="og:title" content="${displayHandle} | Portafolio Oficial" />
  <meta property="og:description" content="${(portfolio.bio || 'Enlaces oficiales de redes sociales').replace(/"/g, '&quot;')}" />
  <meta property="og:image" content="${portfolio.avatar_url || ''}" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      min-height: 100dvh;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      background-color: #000000;
      color: #ffffff;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: space-between;
      position: relative;
      overflow-x: hidden;
      ${isImageBg ? `background-image: url('${effectiveBgUrl}'); background-size: cover; background-position: center; background-attachment: fixed;` : ''}
    }
    .overlay {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, ${isImageBg ? overlayOpacity : 0});
      pointer-events: none;
      z-index: 1;
    }
    .container {
      position: relative;
      z-index: 2;
      width: 100%;
      max-width: 440px;
      padding: 56px 24px 36px;
      display: flex;
      flex-direction: column;
      align-items: center;
      min-height: 100dvh;
      justify-content: space-between;
    }
    .header {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      margin-bottom: 28px;
    }
    .avatar-wrap {
      width: 104px;
      height: 104px;
      border-radius: 9999px;
      padding: 2px;
      background: linear-gradient(135deg, rgba(255,255,255,0.4), rgba(255,255,255,0.1));
      box-shadow: 0 20px 40px rgba(0,0,0,0.6);
      margin-bottom: 14px;
    }
    .avatar {
      width: 100%;
      height: 100%;
      border-radius: 9999px;
      object-fit: cover;
      border: 2px solid rgba(255,255,255,0.2);
    }
    .handle {
      font-size: 18px;
      font-weight: 600;
      letter-spacing: -0.01em;
    }
    .bio {
      font-size: 13px;
      color: #c4c7c8;
      margin-top: 4px;
    }
    .links {
      width: 100%;
      display: flex;
      flex-direction: column;
      gap: 12px;
      margin-bottom: auto;
    }
    .link-card {
      display: flex;
      align-items: center;
      justify-content: space-between;
      width: 100%;
      height: 56px;
      padding: 0 16px;
      border-radius: 14px;
      text-decoration: none;
      color: #ffffff;
      background: ${isImageBg ? 'rgba(255,255,255,0.12)' : '#1c1b1b'};
      border: 1px solid ${isImageBg ? 'rgba(255,255,255,0.22)' : '#2a2a2a'};
      backdrop-filter: ${isImageBg ? 'blur(16px)' : 'none'};
      transition: transform 0.15s ease, background 0.2s ease;
    }
    .link-card:hover {
      background: ${isImageBg ? 'rgba(255,255,255,0.2)' : '#2a2a2a'};
      transform: scale(0.99);
    }
    .link-left {
      display: flex;
      align-items: center;
      gap: 14px;
      min-width: 0;
    }
    .link-icon {
      width: 34px;
      height: 34px;
      border-radius: 8px;
      background: ${isImageBg ? 'rgba(255,255,255,0.15)' : '#201f1f'};
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .link-label {
      font-size: 14px;
      font-weight: 500;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .link-arrow {
      font-size: 16px;
      color: rgba(255,255,255,0.65);
    }
    .footer {
      padding-top: 40px;
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: rgba(255,255,255,0.45);
    }
  </style>
</head>
<body>
  <div class="overlay"></div>
  <div class="container">
    <header class="header">
      <div class="avatar-wrap">
        <img class="avatar" src="${portfolio.avatar_url}" alt="${displayHandle}" />
      </div>
      <h1 class="handle">${displayHandle}</h1>
      ${portfolio.bio ? `<p class="bio">${portfolio.bio}</p>` : ''}
    </header>
    <main class="links">
      ${linksHtml}
    </main>
    <footer class="footer">Creado con LinkPortfolio</footer>
  </div>
</body>
</html>`;

  const blob = new Blob([htmlString], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `portafolio-${portfolio.slug || 'web'}.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
