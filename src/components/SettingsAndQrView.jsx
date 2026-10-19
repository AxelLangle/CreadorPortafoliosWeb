import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { exportStandaloneStaticHtml } from '../data/socialCatalog';

const RESERVED_SLUGS = ['admin', 'login', 'settings', 'api', 'root'];

/**
 * Pantalla 4: Configuración de Cuenta y Modal de Difusión (QR)
 * Basado en el mockup "LinkPortfolio - Configuración de Cuenta y Difusión (QR)" de Google Stitch AI.
 */
export default function SettingsAndQrView({
  portfolio,
  onUpdatePortfolio,
  onResetToDefault,
  onNavigate,
}) {
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const [editingEmail, setEditingEmail] = useState(false);
  const [emailDraft, setEmailDraft] = useState(
    portfolio.email || 'its.araaaby@portafolio.app'
  );
  const [editingPassword, setEditingPassword] = useState(false);
  const [passwordDraft, setPasswordDraft] = useState('');
  const [statusNotice, setStatusNotice] = useState('');
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);

  const slug = portfolio.slug || 'its.araaaby';
  const isSlugValid =
    slug.trim().length >= 3 && !RESERVED_SLUGS.includes(slug.trim().toLowerCase());

  const publicShareUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/?u=${encodeURIComponent(slug)}`
      : `https://portafolio.app/${slug}`;

  useEffect(() => {
    let active = true;
    QRCode.toDataURL(publicShareUrl, {
      width: 360,
      margin: 2,
      color: {
        dark: '#131313',
        light: '#FFFFFF',
      },
      errorCorrectionLevel: 'H',
    })
      .then((url) => {
        if (active) setQrDataUrl(url);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [publicShareUrl]);

  const handleCopyUrl = () => {
    navigator.clipboard?.writeText(publicShareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadQrPng = () => {
    if (!qrDataUrl) return;
    const a = document.createElement('a');
    a.href = qrDataUrl;
    a.download = `qr-portafolio-${slug}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="bg-surface text-on-surface min-h-screen flex flex-col antialiased pb-28">
      {/* Cabecera Superior Estilo Stitch 4 */}
      <header className="sticky top-0 inset-x-0 z-40 bg-surface/80 backdrop-blur-xl border-b border-outline-variant/15 shadow-[0_1px_8px_rgba(0,0,0,0.4)]">
        <div className="max-w-lg mx-auto h-16 px-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary text-on-primary flex items-center justify-center font-bold text-sm">
              LP
            </div>
            <span className="font-headline-sm text-headline-sm text-primary tracking-tight">
              LinkPortfolio
            </span>
          </div>

          <button
            type="button"
            onClick={() => onNavigate('public')}
            className="h-9 px-3 rounded-lg bg-surface-container-high hover:bg-surface-container-highest font-label-md text-label-md text-primary flex items-center gap-1.5 transition-colors"
          >
            <span className="material-symbols-outlined text-[16px]">visibility</span>
            <span>Ver Portafolio</span>
          </button>
        </div>
      </header>

      <main className="flex-1 flex flex-col w-full max-w-lg mx-auto px-4 pt-3">
        {/* Barra de Navegación Interna */}
        <div className="flex items-center justify-between py-3 mb-2">
          <button
            type="button"
            onClick={() => onNavigate('editor')}
            aria-label="Volver al Editor"
            className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center text-primary active:scale-95 transition-transform"
          >
            <span className="material-symbols-outlined text-[20px]">arrow_back</span>
          </button>
          <h1 className="font-headline-sm text-headline-sm text-primary tracking-tight">
            Configuración y Difusión (QR)
          </h1>
          <button
            type="button"
            onClick={() => exportStandaloneStaticHtml(portfolio)}
            title="Exportar HTML estático"
            className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center text-on-surface-variant hover:text-primary transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">code</span>
          </button>
        </div>

        {statusNotice && (
          <div className="mb-4 p-3 rounded-xl bg-secondary-container/20 border border-secondary/30 text-secondary font-body-sm text-body-sm flex items-center justify-between">
            <span>{statusNotice}</span>
            <button
              type="button"
              onClick={() => setStatusNotice('')}
              className="text-secondary hover:opacity-80"
            >
              <span className="material-symbols-outlined text-[16px]">close</span>
            </button>
          </div>
        )}

        <div className="flex flex-col gap-4">
          {/* Tarjeta 1: Compartir mi Portafolio / Código QR Descargable (Stitch 4) */}
          <section className="bg-surface-container-low rounded-xl p-5 flex flex-col items-center border border-outline-variant/15">
            <div className="w-full flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-surface-container-high flex items-center justify-center text-secondary">
                  <span className="material-symbols-outlined text-[18px]">qr_code_2</span>
                </div>
                <span className="font-headline-sm text-headline-sm text-primary">
                  Compartir mi Portafolio
                </span>
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-secondary-container/20 text-secondary font-label-sm text-label-sm uppercase tracking-wider">
                Difusión
              </span>
            </div>

            {/* Lienzo del Código QR con Foto de Perfil Central */}
            <div className="relative p-3 bg-primary rounded-2xl flex items-center justify-center shadow-xl">
              {qrDataUrl ? (
                <img
                  src={qrDataUrl}
                  alt={`Código QR para @${slug}`}
                  className="w-44 h-44 rounded-lg block"
                />
              ) : (
                <div className="w-44 h-44 flex items-center justify-center text-on-primary">
                  Generando QR...
                </div>
              )}

              {/* Foto de Perfil en el Centro del QR */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-11 h-11 rounded-full bg-primary p-0.5 shadow-md flex items-center justify-center">
                  <img
                    src={portfolio.avatar_url || '/avatar-its-araaaby.jpeg'}
                    alt={slug}
                    className="w-full h-full rounded-full object-cover"
                  />
                </div>
              </div>
            </div>

            {/* Píldora de Enlace Público */}
            <div className="mt-4 px-3.5 py-1.5 rounded-full bg-surface-container flex items-center gap-2 border border-outline-variant/20">
              <span className="w-2 h-2 rounded-full bg-secondary shadow-[0_0_8px_rgba(78,222,163,0.8)]" />
              <span className="font-body-sm text-body-sm text-on-surface-variant font-mono">
                portafolio.app/
              </span>
              <span className="font-label-md text-label-md text-primary font-mono -ml-1">
                {slug}
              </span>
              <span className="material-symbols-outlined text-secondary text-[14px] ml-0.5">
                lock
              </span>
            </div>

            {/* Botones de Acción de Difusión */}
            <div className="grid grid-cols-2 gap-3 w-full mt-5">
              <button
                type="button"
                onClick={handleDownloadQrPng}
                className="h-12 px-3 rounded-lg bg-surface-container-high text-primary hover:bg-surface-container-highest flex items-center justify-center gap-2 font-label-lg text-label-lg transition-transform active:scale-[0.985]"
              >
                <span className="material-symbols-outlined text-[18px]">download</span>
                <span>Descargar QR</span>
              </button>

              <button
                type="button"
                onClick={handleCopyUrl}
                className={`h-12 px-3 rounded-lg flex items-center justify-center gap-2 font-label-lg text-label-lg font-semibold transition-all active:scale-[0.985] ${
                  copied
                    ? 'bg-secondary text-on-secondary'
                    : 'bg-primary text-on-primary hover:opacity-90'
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">
                  {copied ? 'check' : 'content_copy'}
                </span>
                <span>{copied ? '¡Copiado!' : 'Copiar enlace'}</span>
              </button>
            </div>

            <button
              type="button"
              onClick={() => exportStandaloneStaticHtml(portfolio)}
              className="w-full h-11 mt-2.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-label-md text-label-md flex items-center justify-center gap-2 border border-outline-variant/20 transition-colors"
            >
              <span className="material-symbols-outlined text-[18px] text-secondary">
                html
              </span>
              <span>Descargar Página Estática (.html autocontenido)</span>
            </button>
          </section>

          {/* Tarjeta 2: Dirección y Visibilidad (Slug y Modo Mantenimiento / Borrador) */}
          <section className="bg-surface-container-low rounded-xl p-5 flex flex-col gap-4 border border-outline-variant/15">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-surface-container-high flex items-center justify-center text-primary">
                <span className="material-symbols-outlined text-[18px]">link</span>
              </div>
              <h2 className="font-headline-sm text-headline-sm text-primary">
                Dirección y Visibilidad
              </h2>
            </div>

            {/* Edición de Slug con Validación en Tiempo Real (RF-02) */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="slug-field"
                className="font-label-md text-label-md text-on-surface-variant"
              >
                Identificador único de ruta (Slug)
              </label>
              <div className="h-12 px-3 rounded-lg bg-surface-container flex items-center justify-between border border-outline-variant/20">
                <div className="flex items-center min-w-0 flex-1">
                  <span className="font-body-md text-body-md text-on-surface-variant select-none font-mono">
                    portafolio.app/
                  </span>
                  <input
                    id="slug-field"
                    type="text"
                    value={portfolio.slug}
                    onChange={(e) =>
                      onUpdatePortfolio({
                        ...portfolio,
                        slug: e.target.value.toLowerCase().replace(/\s+/g, ''),
                      })
                    }
                    className="bg-transparent text-primary font-label-lg text-label-lg outline-none w-full px-0.5 font-mono"
                  />
                </div>
                {isSlugValid ? (
                  <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-secondary-container/15 text-secondary shrink-0">
                    <span className="material-symbols-outlined text-[14px]">check_circle</span>
                    <span className="font-label-sm text-label-sm uppercase">Disponible</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-error-container/30 text-error shrink-0">
                    <span className="material-symbols-outlined text-[14px]">error</span>
                    <span className="font-label-sm text-label-sm uppercase">Inválido</span>
                  </div>
                )}
              </div>
            </div>

            <div className="w-full h-[1px] bg-surface-container-highest my-0.5" />

            {/* Interruptor de Privacidad: Portafolio Público Activo vs Modo Mantenimiento/Borrador */}
            <div className="flex items-center justify-between gap-3">
              <div className="flex flex-col pr-2">
                <span className="font-label-lg text-label-lg text-primary">
                  Portafolio Público Activo
                </span>
                <span className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
                  Desactívalo para activar el &ldquo;Modo Mantenimiento / Borrador&rdquo; y ocultar
                  temporalmente tu página sin perder la configuración guardada.
                </span>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={portfolio.is_published}
                onClick={() =>
                  onUpdatePortfolio({
                    ...portfolio,
                    is_published: !portfolio.is_published,
                  })
                }
                className={`w-12 h-7 rounded-full transition-colors relative flex items-center p-0.5 shrink-0 focus:outline-none ${
                  portfolio.is_published ? 'bg-secondary' : 'bg-surface-container-high'
                }`}
              >
                <span
                  className={`w-6 h-6 rounded-full bg-primary transform transition-transform duration-200 ${
                    portfolio.is_published ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </section>

          {/* Tarjeta 3: Seguridad de la Cuenta (Actualización de Correo y Contraseña) */}
          <section className="bg-surface-container-low rounded-xl p-5 flex flex-col gap-3 border border-outline-variant/15">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-8 h-8 rounded-lg bg-surface-container-high flex items-center justify-center text-primary">
                <span className="material-symbols-outlined text-[18px]">security</span>
              </div>
              <h2 className="font-headline-sm text-headline-sm text-primary">
                Seguridad de la Cuenta
              </h2>
            </div>

            {/* Fila 1: Correo electrónico */}
            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={() => setEditingEmail(!editingEmail)}
                className="w-full h-14 px-3 rounded-lg bg-surface-container hover:bg-surface-container-high transition-colors flex items-center justify-between group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-surface-container-high flex items-center justify-center text-on-surface-variant">
                    <span className="material-symbols-outlined text-[18px]">mail</span>
                  </div>
                  <span className="font-label-lg text-label-lg text-primary">
                    Correo electrónico
                  </span>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="font-body-sm text-body-sm text-on-surface-variant truncate max-w-[160px]">
                    {portfolio.email || 'its.araaaby@portafolio.app'}
                  </span>
                  <span className="material-symbols-outlined text-on-surface-variant group-hover:text-primary transition-colors text-[20px]">
                    {editingEmail ? 'expand_less' : 'chevron_right'}
                  </span>
                </div>
              </button>

              {editingEmail && (
                <div className="p-3 rounded-lg bg-surface-container flex items-center gap-2">
                  <input
                    type="email"
                    value={emailDraft}
                    onChange={(e) => setEmailDraft(e.target.value)}
                    className="flex-1 h-10 px-3 rounded-lg bg-surface-container-high text-primary font-body-sm text-body-sm outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      onUpdatePortfolio({ ...portfolio, email: emailDraft });
                      setEditingEmail(false);
                      setStatusNotice('Correo electrónico actualizado correctamente.');
                    }}
                    className="h-10 px-4 rounded-lg bg-primary text-on-primary font-label-md text-label-md font-semibold"
                  >
                    Guardar
                  </button>
                </div>
              )}
            </div>

            {/* Fila 2: Cambiar contraseña */}
            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={() => setEditingPassword(!editingPassword)}
                className="w-full h-14 px-3 rounded-lg bg-surface-container hover:bg-surface-container-high transition-colors flex items-center justify-between group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-surface-container-high flex items-center justify-center text-on-surface-variant">
                    <span className="material-symbols-outlined text-[18px]">key</span>
                  </div>
                  <span className="font-label-lg text-label-lg text-primary">
                    Cambiar contraseña
                  </span>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="font-body-sm text-body-sm text-on-surface-variant tracking-widest">
                    ••••••••
                  </span>
                  <span className="material-symbols-outlined text-on-surface-variant group-hover:text-primary transition-colors text-[20px]">
                    {editingPassword ? 'expand_less' : 'chevron_right'}
                  </span>
                </div>
              </button>

              {editingPassword && (
                <div className="p-3 rounded-lg bg-surface-container flex items-center gap-2">
                  <input
                    type="password"
                    value={passwordDraft}
                    onChange={(e) => setPasswordDraft(e.target.value)}
                    placeholder="Nueva contraseña segura"
                    className="flex-1 h-10 px-3 rounded-lg bg-surface-container-high text-primary font-body-sm text-body-sm outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setPasswordDraft('');
                      setEditingPassword(false);
                      setStatusNotice('Contraseña actualizada con éxito.');
                    }}
                    className="h-10 px-4 rounded-lg bg-primary text-on-primary font-label-md text-label-md font-semibold"
                  >
                    Actualizar
                  </button>
                </div>
              )}
            </div>
          </section>

          {/* Acciones de Cuenta y Zona de Peligro */}
          <div className="flex flex-col items-center gap-3 mt-2">
            <button
              type="button"
              onClick={() => {
                onResetToDefault();
                setStatusNotice(
                  'Se han restaurado los datos originales del portafolio de prueba @its.araaaby.'
                );
              }}
              className="w-full h-11 rounded-lg bg-surface-container-high hover:bg-surface-container-highest text-on-surface flex items-center justify-center gap-2 font-label-md text-label-md transition-colors"
            >
              <span className="material-symbols-outlined text-[18px] text-secondary">
                restore
              </span>
              <span>Restaurar datos originales de @its.araaaby</span>
            </button>

            <button
              type="button"
              onClick={() => onNavigate('onboarding')}
              className="w-full h-12 rounded-lg bg-error-container/20 text-error hover:bg-error-container/30 flex items-center justify-center gap-2 font-label-lg text-label-lg transition-transform active:scale-[0.985]"
            >
              <span className="material-symbols-outlined text-[20px]">logout</span>
              <span>Cerrar sesión</span>
            </button>

            <button
              type="button"
              onClick={() => setConfirmDeleteOpen(true)}
              className="py-2 px-4 text-on-surface-variant hover:text-error transition-colors font-body-sm text-body-sm"
            >
              Eliminar cuenta y archivos multimedia permanentemente
            </button>

            <div className="flex items-center gap-1.5 text-on-surface-variant/60 font-label-sm text-label-sm pt-1">
              <span className="material-symbols-outlined text-[14px]">verified_user</span>
              <span>LinkPortfolio v2.4.0 • Modo Seguro HTTPS</span>
            </div>
          </div>
        </div>
      </main>

      {/* Modal de Confirmación de Eliminación de Cuenta */}
      {confirmDeleteOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-surface-container-low border border-outline-variant/30 rounded-2xl p-5 flex flex-col gap-4 shadow-2xl">
            <div className="flex items-center gap-2 text-error">
              <span className="material-symbols-outlined text-[22px]">warning</span>
              <h3 className="font-headline-sm text-headline-sm">
                ¿Reiniciar o eliminar portafolio?
              </h3>
            </div>
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              Esta acción restablecerá el almacenamiento local y te llevará a la pantalla de
              registro inicial.
            </p>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => setConfirmDeleteOpen(false)}
                className="h-10 rounded-lg bg-surface-container-high text-on-surface font-label-md text-label-md"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  onResetToDefault();
                  setConfirmDeleteOpen(false);
                  onNavigate('onboarding');
                }}
                className="h-10 rounded-lg bg-error text-on-error font-label-md text-label-md font-semibold"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
