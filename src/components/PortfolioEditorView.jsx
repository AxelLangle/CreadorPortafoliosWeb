import React, { useState, useRef } from 'react';
import {
  SOCIAL_PLATFORMS,
  COUNTRY_CODES,
  resolveSafeSocialUrl,
  getActivePortfolioLinks,
  exportStandaloneStaticHtml,
  getEffectiveBackgroundImage,
  DEFAULT_NEUTRAL_AVATAR,
} from '../data/socialCatalog';
import PublicPortfolioView from './PublicPortfolioView';
import AvatarCropperModal from './AvatarCropperModal';

const STITCH_URBAN_BG =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuBBhk4anQlZhvxHF4EgTZLJQDjNN_YHisvNqFL6MdRkaAD1PjgAxGilinwsAIspwUF8eg2Da23iwQzX0yBsUYrbr4VbotKO3zelEkdGJ-0dHka7K1XsWtvKJDSAGK52_yRQDxqnUtdgOLWD6KZxBCIG2uLWUUTkzYBvRPoCSbGIqUXhCcf2zKv7yXlcYrMSsNy0wETA6wUdkXb1Q6SjYDr1-DcKFvCHylxgniZYaTFTY4XE5pyJbiBv';

/**
 * RNF-01: Compresión y conversión automática de imagen subida a formato WebP/JPEG optimizado
 * garantizando que no exceda la cuota de almacenamiento local y se actualice instantáneamente.
 */
function compressImageFileToWebP(file, maxDimension = 1200, quality = 0.8) {
  return new Promise((resolve, reject) => {
    if (file.size > 15 * 1024 * 1024) {
      reject(new Error('El archivo supera el límite máximo permitido de 15 MB.'));
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let w = img.naturalWidth || 1080;
        let h = img.naturalHeight || 1080;
        if (w > maxDimension || h > maxDimension) {
          if (w > h) {
            h = Math.round((h * maxDimension) / w);
            w = maxDimension;
          } else {
            w = Math.round((w * maxDimension) / h);
            h = maxDimension;
          }
        }
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, w, h);
        let dataUrl = canvas.toDataURL('image/webp', quality);
        // Si el navegador no soporta codificación WebP o el resultado es muy pesado, usar JPEG comprimido
        if (!dataUrl.startsWith('data:image/webp') || dataUrl.length > 380000) {
          dataUrl = canvas.toDataURL('image/jpeg', 0.76);
        }
        resolve({
          dataUrl,
          width: w,
          height: h,
          name: file.name.replace(/\.[^.]+$/, '.webp'),
          sizeKb: Math.round((dataUrl.length * 0.75) / 1024),
        });
      };
      img.onerror = () => reject(new Error('No se pudo procesar la imagen seleccionada.'));
      img.src = ev.target.result;
    };
    reader.onerror = () => reject(new Error('Error al leer el archivo de imagen.'));
    reader.readAsDataURL(file);
  });
}

/**
 * Pantalla 2: Panel de Administración y Editor del Portafolio (Dashboard Principal)
 * Integra Vista 2A (Apariencia) y Vista 2B (Redes Sociales) de Stitch AI,
 * con división 60% / 40% en Escritorio y Simulador Móvil en Tiempo Real.
 */
export default function PortfolioEditorView({
  portfolio,
  onUpdatePortfolio,
  onPublishPortfolio,
  hasUnsavedChanges,
  onNavigate,
  initialTab = 'redes', // 'apariencia' | 'redes'
}) {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [mobilePreviewOpen, setMobilePreviewOpen] = useState(false);
  const [cropperOpen, setCropperOpen] = useState(false);
  const [cropperSource, setCropperSource] = useState(null);
  const [uploadError, setUploadError] = useState('');
  const [copyFeedback, setCopyFeedback] = useState(false);
  const [publishStatus, setPublishStatus] = useState('idle'); // 'idle' | 'publishing' | 'published'
  const [draggedGroupIndex, setDraggedGroupIndex] = useState(null);

  const avatarInputRef = useRef(null);
  const bgInputRef = useRef(null);

  const effectiveAvatar = portfolio.avatar_url || DEFAULT_NEUTRAL_AVATAR;
  const effectiveBgImage = getEffectiveBackgroundImage(portfolio);

  const sortedGroups = [...(portfolio.social_network_groups || [])].sort(
    (a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0)
  );
  const enabledNetworksCount = sortedGroups.filter((g) => g.is_enabled).length;
  const activeLinksCount = getActivePortfolioLinks(portfolio).length;

  // Copiar enlace público al portapapeles
  const handleCopyPublicUrl = () => {
    const publicUrl = `${window.location.origin}/?u=${encodeURIComponent(portfolio.slug || 'usuario')}`;
    navigator.clipboard?.writeText(publicUrl);
    setCopyFeedback(true);
    setTimeout(() => setCopyFeedback(false), 2000);
  };

  // Publicar cambios con retroalimentación visual estilo Stitch
  const handlePublishClick = () => {
    setPublishStatus('publishing');
    setTimeout(() => {
      onPublishPortfolio();
      setPublishStatus('published');
      setTimeout(() => {
        setPublishStatus('idle');
      }, 1800);
    }, 550);
  };

  // Subir o arrastrar foto de perfil
  const handleAvatarFileSelect = async (file) => {
    if (!file) return;
    setUploadError('');
    try {
      const result = await compressImageFileToWebP(file, 1080, 0.85);
      setCropperSource(result.dataUrl);
      setCropperOpen(true);
    } catch (err) {
      setUploadError(err.message);
    }
  };

  // Subir imagen de fondo personalizada (distinta a la de perfil)
  const handleBgFileSelect = async (file) => {
    if (!file) return;
    setUploadError('');
    try {
      const result = await compressImageFileToWebP(file, 1200, 0.78);
      onUpdatePortfolio({
        ...portfolio,
        background_type: 'IMAGE',
        has_custom_background: true,
        background_image_url: result.dataUrl,
        background_image_name: result.name,
        background_image_meta: `${result.width} × ${result.height} • ${result.sizeKb} KB (WebP)`,
      });
    } catch (err) {
      setUploadError(err.message);
    }
  };

  // Activar/Desactivar red social (RF-07: sin borrar enlaces previos; si estaba vacía crea 1 fila por defecto)
  const handleToggleNetwork = (groupId) => {
    const updatedGroups = sortedGroups.map((group) => {
      if (group.id !== groupId) return group;
      const nextEnabled = !group.is_enabled;
      const platform = SOCIAL_PLATFORMS[group.platform];
      let nextLinks = group.links || [];
      if (nextEnabled && nextLinks.length === 0) {
        nextLinks = [
          {
            id: `link-${group.platform.toLowerCase()}-${Date.now()}`,
            group_id: group.id,
            label: platform?.defaultLabel || group.platform,
            target_url: '',
            phone_country: '52',
            input_mode: group.platform === 'WHATSAPP' ? 'PHONE' : 'URL',
            is_visible: true,
            sort_order: 1,
          },
        ];
      }
      return {
        ...group,
        is_enabled: nextEnabled,
        links: nextLinks,
      };
    });

    onUpdatePortfolio({
      ...portfolio,
      social_network_groups: updatedGroups,
    });
  };

  // Mover el orden general de una red social arriba/abajo (RF-11)
  const handleMoveGroup = (index, direction) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= sortedGroups.length) return;
    const reordered = [...sortedGroups];
    const [moved] = reordered.splice(index, 1);
    reordered.splice(targetIndex, 0, moved);
    const normalized = reordered.map((g, idx) => ({
      ...g,
      sort_order: idx + 1,
    }));
    onUpdatePortfolio({
      ...portfolio,
      social_network_groups: normalized,
    });
  };

  // Drag & Drop de tarjetas de redes sociales
  const handleGroupDrop = (dropIndex) => {
    if (draggedGroupIndex === null || draggedGroupIndex === dropIndex) return;
    const reordered = [...sortedGroups];
    const [moved] = reordered.splice(draggedGroupIndex, 1);
    reordered.splice(dropIndex, 0, moved);
    const normalized = reordered.map((g, idx) => ({
      ...g,
      sort_order: idx + 1,
    }));
    setDraggedGroupIndex(null);
    onUpdatePortfolio({
      ...portfolio,
      social_network_groups: normalized,
    });
  };

  // Añadir nuevo perfil dentro de una red social activa (Relación 1 a N - RF-08)
  const handleAddLinkToGroup = (groupId) => {
    const updatedGroups = sortedGroups.map((group) => {
      if (group.id !== groupId) return group;
      const platform = SOCIAL_PLATFORMS[group.platform];
      const nextOrder = (group.links?.length || 0) + 1;
      const newLink = {
        id: `link-${group.platform.toLowerCase()}-${Date.now()}`,
        group_id: group.id,
        label: `${platform.name} ${nextOrder}`,
        target_url: '',
        phone_country: '52',
        phone_number: '',
        input_mode: group.platform === 'WHATSAPP' ? 'PHONE' : 'URL',
        is_visible: true,
        sort_order: nextOrder,
      };
      return {
        ...group,
        links: [...(group.links || []), newLink],
      };
    });
    onUpdatePortfolio({
      ...portfolio,
      social_network_groups: updatedGroups,
    });
  };

  // Actualizar campos de un perfil específico (etiqueta, URL o teléfono de WhatsApp)
  const handleUpdateLink = (groupId, linkId, patch) => {
    const updatedGroups = sortedGroups.map((group) => {
      if (group.id !== groupId) return group;
      const updatedLinks = (group.links || []).map((link) => {
        if (link.id !== linkId) return link;
        const merged = { ...link, ...patch };
        // Si es WhatsApp en modo teléfono, actualizar automáticamente target_url a wa.me
        if (group.platform === 'WHATSAPP' && merged.input_mode === 'PHONE') {
          const digits = (merged.phone_number || '').replace(/\D/g, '');
          const country = merged.phone_country || '52';
          merged.target_url = digits ? `https://wa.me/${country}${digits}` : '';
        }
        return merged;
      });
      return { ...group, links: updatedLinks };
    });

    onUpdatePortfolio({
      ...portfolio,
      social_network_groups: updatedGroups,
    });
  };

  // Eliminar un perfil específico dentro de una red social
  const handleDeleteLink = (groupId, linkId) => {
    const updatedGroups = sortedGroups.map((group) => {
      if (group.id !== groupId) return group;
      const filtered = (group.links || [])
        .filter((l) => l.id !== linkId)
        .map((l, idx) => ({ ...l, sort_order: idx + 1 }));
      return { ...group, links: filtered };
    });
    onUpdatePortfolio({
      ...portfolio,
      social_network_groups: updatedGroups,
    });
  };

  // Reordenar enlaces dentro de una misma red social (RF-11)
  const handleMoveLinkInGroup = (groupId, linkIndex, direction) => {
    const updatedGroups = sortedGroups.map((group) => {
      if (group.id !== groupId) return group;
      const sortedLinks = [...(group.links || [])].sort(
        (a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0)
      );
      const targetIndex = linkIndex + direction;
      if (targetIndex < 0 || targetIndex >= sortedLinks.length) return group;
      const [moved] = sortedLinks.splice(linkIndex, 1);
      sortedLinks.splice(targetIndex, 0, moved);
      return {
        ...group,
        links: sortedLinks.map((l, idx) => ({ ...l, sort_order: idx + 1 })),
      };
    });
    onUpdatePortfolio({
      ...portfolio,
      social_network_groups: updatedGroups,
    });
  };

  return (
    <div className="min-h-screen bg-surface text-on-surface flex flex-col">
      {/* Barra Superior de Administración y Difusión (Stitch Header) */}
      <header className="sticky top-0 z-40 bg-surface/85 backdrop-blur-xl border-b border-outline-variant/20 shadow-[0_1px_8px_rgba(0,0,0,0.4)]">
        <div className="max-w-7xl mx-auto h-16 px-4 sm:px-6 flex items-center justify-between gap-3">
          {/* Enlace público interactivo para copiar */}
          <div className="flex items-center gap-2 min-w-0">
            <button
              type="button"
              onClick={handleCopyPublicUrl}
              title="Copiar enlace público al portapapeles"
              className="h-9 px-3.5 rounded-full bg-surface-container-high hover:bg-surface-container-highest transition-colors flex items-center gap-2 text-on-surface group min-w-0"
            >
              <span className="w-2 h-2 rounded-full bg-secondary shrink-0 animate-pulse" />
              <span className="font-label-md text-label-md text-on-surface truncate max-w-[180px] sm:max-w-[260px]">
                {copyFeedback
                  ? '¡Enlace copiado al portapapeles!'
                  : `portafolio.app/${portfolio.slug || 'usuario'}`}
              </span>
              <span className="material-symbols-outlined text-[15px] text-on-surface-variant group-hover:text-primary transition-colors shrink-0">
                {copyFeedback ? 'check' : 'content_copy'}
              </span>
            </button>

            <button
              type="button"
              onClick={() => onNavigate('public')}
              className="hidden sm:inline-flex h-9 px-3 rounded-full bg-surface-container hover:bg-surface-container-high text-on-surface-variant hover:text-primary font-label-md text-label-md items-center gap-1.5 transition-colors"
            >
              <span className="material-symbols-outlined text-[16px]">open_in_new</span>
              <span>Ver página pública</span>
            </button>
          </div>

          {/* Acciones rápidas derecha: Descargar HTML, QR, Ajustes y Avatar */}
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => exportStandaloneStaticHtml(portfolio)}
              title="Descargar archivo HTML estático del portafolio"
              className="h-9 px-3 rounded-full bg-surface-container hover:bg-surface-container-high text-on-surface-variant hover:text-primary font-label-sm text-label-sm hidden md:inline-flex items-center gap-1.5 transition-colors"
            >
              <span className="material-symbols-outlined text-[16px]">download</span>
              <span>Exportar HTML</span>
            </button>

            <button
              type="button"
              onClick={() => onNavigate('settings')}
              aria-label="Mostrar Código QR y Configuración"
              title="Código QR y Configuración"
              className="w-10 h-10 rounded-full flex items-center justify-center text-on-surface-variant hover:text-primary hover:bg-surface-container transition-colors"
            >
              <span className="material-symbols-outlined text-[20px]">qr_code_2</span>
            </button>

            <button
              type="button"
              onClick={() => onNavigate('onboarding')}
              title="Pantalla de Onboarding / Cuenta"
              className="relative pl-1 flex items-center"
            >
              <img
                alt={portfolio.display_name || 'Perfil'}
                src={effectiveAvatar}
                className="w-8 h-8 rounded-full object-cover ring-1 ring-surface-container-highest hover:ring-secondary transition-all"
              />
            </button>
          </div>
        </div>
      </header>

      {/* Contenedor Principal: En Escritorio Pantalla Dividida 60% Controles / 40% Simulador Móvil en Tiempo Real (Sección 3 - Pantalla 2) */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 pt-4 pb-32 lg:pb-12 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* COLUMNA IZQUIERDA (60% -> 7 de 12 columnas en escritorio): Controles de Configuración */}
        <div className="lg:col-span-7 flex flex-col gap-4 w-full">
          {/* Píldora de estado de edición en vivo (Stitch 2A / 2B) */}
          <div className="flex items-center justify-between px-4 py-2.5 rounded-xl bg-surface-container border border-outline-variant/15">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-secondary" />
              </span>
              <span className="font-label-md text-label-md text-on-surface font-medium">
                {hasUnsavedChanges
                  ? 'Borrador con cambios en vista previa'
                  : `Portafolio @${portfolio.slug} sincronizado y publicado`}
              </span>
            </div>
            <span className="font-label-sm text-label-sm px-2.5 py-0.5 rounded-full bg-secondary/15 text-secondary font-semibold uppercase tracking-wider">
              {activeLinksCount} enlaces activos
            </span>
          </div>

          {/* Control Segmentado Superior: Apariencia vs Redes Sociales (Stitch 2A / 2B) */}
          <div className="w-full bg-surface-container-lowest p-1.5 rounded-xl flex items-center gap-1.5 border border-outline-variant/20">
            <button
              type="button"
              onClick={() => setActiveTab('apariencia')}
              className={`flex-1 h-10 rounded-lg font-label-lg text-label-lg flex items-center justify-center gap-2 transition-all ${
                activeTab === 'apariencia'
                  ? 'bg-primary text-on-primary font-semibold shadow-sm'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">palette</span>
              <span>Apariencia (Foto y Fondo)</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('redes')}
              className={`flex-1 h-10 rounded-lg font-label-lg text-label-lg flex items-center justify-center gap-2 transition-all ${
                activeTab === 'redes'
                  ? 'bg-primary text-on-primary font-semibold shadow-sm'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <span
                className="material-symbols-outlined text-[18px]"
                style={activeTab === 'redes' ? { fontVariationSettings: "'FILL' 1" } : undefined}
              >
                share
              </span>
              <span>Redes Sociales ({enabledNetworksCount}/7)</span>
            </button>
          </div>

          {uploadError && (
            <div className="p-3 rounded-xl bg-error-container/30 border border-error/40 text-error font-body-sm text-body-sm flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]">error</span>
                <span>{uploadError}</span>
              </div>
              <button
                type="button"
                onClick={() => setUploadError('')}
                className="text-error hover:opacity-80"
              >
                <span className="material-symbols-outlined text-[16px]">close</span>
              </button>
            </div>
          )}

          {/* ==================== PESTAÑA 2A: MÓDULO DE APARIENCIA ==================== */}
          {activeTab === 'apariencia' && (
            <div className="flex flex-col gap-5">
              {/* Tarjeta 1: Foto de Perfil (Sección 2.1 - Control de Foto de Perfil) */}
              <section className="bg-surface-container-low rounded-2xl p-5 flex flex-col gap-4 border border-outline-variant/15">
                <div className="flex flex-col">
                  <div className="flex items-center justify-between">
                    <h2 className="font-headline-sm text-headline-sm text-primary">
                      Foto de Perfil
                    </h2>
                    <span className="material-symbols-outlined text-outline-variant text-[20px]">
                      account_circle
                    </span>
                  </div>
                  <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
                    Se mostrará centrada en la parte superior de tu portafolio público y será la
                    imagen predeterminada del modo Fondo Personalizado.
                  </p>
                </div>

                {/* Previsualización Circular con Botón Flotante y Soporte Drag & Drop */}
                <div
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    const file = e.dataTransfer?.files?.[0];
                    if (file) handleAvatarFileSelect(file);
                  }}
                  className="flex flex-col items-center justify-center py-2 border border-dashed border-outline-variant/30 rounded-xl bg-surface-container/40 hover:bg-surface-container/70 transition-colors"
                >
                  <div className="relative group my-1">
                    <div className="w-[96px] h-[96px] rounded-full overflow-hidden bg-surface-container-high shadow-lg ring-2 ring-primary/20">
                      <img
                        alt="Vista previa de perfil"
                        src={effectiveAvatar}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => avatarInputRef.current?.click()}
                      aria-label="Cambiar foto de perfil"
                      className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-primary text-surface flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-transform"
                    >
                      <span className="material-symbols-outlined text-[17px]">photo_camera</span>
                    </button>
                  </div>
                  <span className="font-body-sm text-body-sm text-outline mt-1">
                    Arrastra una imagen aquí o usa los controles inferiores
                  </span>
                </div>

                <input
                  ref={avatarInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleAvatarFileSelect(file);
                    e.target.value = '';
                  }}
                />

                {/* Botones de Acción de Foto de Perfil */}
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => avatarInputRef.current?.click()}
                    className="h-11 px-3 rounded-xl bg-surface-container-high hover:bg-surface-container-highest text-on-surface font-label-md text-label-md flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <span className="material-symbols-outlined text-[18px]">cloud_upload</span>
                    <span className="truncate">Subir o cambiar</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setCropperSource(effectiveAvatar);
                      setCropperOpen(true);
                    }}
                    className="h-11 px-3 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface font-label-md text-label-md flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <span className="material-symbols-outlined text-[18px]">crop</span>
                    <span>Recortar 1:1</span>
                  </button>
                </div>

                {/* Nombre o Alias Visible debajo de la foto de perfil */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div className="flex flex-col gap-1.5">
                    <label
                      htmlFor="profile-handle"
                      className="font-label-sm text-label-sm text-on-surface-variant"
                    >
                      Nombre o alias visible (debajo de la foto)
                    </label>
                    <div className="relative flex items-center">
                      <span className="material-symbols-outlined absolute left-3.5 text-outline text-[18px] pointer-events-none">
                        alternate_email
                      </span>
                      <input
                        id="profile-handle"
                        type="text"
                        value={(portfolio.display_name || '').replace(/^@/, '')}
                        onChange={(e) => {
                          const raw = e.target.value.replace(/^@+/, '');
                          onUpdatePortfolio({
                            ...portfolio,
                            display_name: raw ? `@${raw}` : '',
                          });
                        }}
                        placeholder="tu.usuario"
                        className="w-full h-11 bg-surface-container text-on-surface font-body-md text-body-md pl-10 pr-24 rounded-xl focus:outline-none focus:bg-surface-container-high transition-colors"
                      />
                      <span className="absolute right-3 font-label-sm text-label-sm text-secondary bg-secondary/10 px-2 py-0.5 rounded-full">
                        Activo
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label
                      htmlFor="profile-bio"
                      className="font-label-sm text-label-sm text-on-surface-variant"
                    >
                      Biografía o descripción breve (opcional)
                    </label>
                    <div className="relative flex items-center">
                      <span className="material-symbols-outlined absolute left-3.5 text-outline text-[18px] pointer-events-none">
                        Auto_awesome
                      </span>
                      <input
                        id="profile-bio"
                        type="text"
                        value={portfolio.bio || ''}
                        onChange={(e) =>
                          onUpdatePortfolio({
                            ...portfolio,
                            bio: e.target.value,
                          })
                        }
                        placeholder="Coach • Creadora Digital"
                        className="w-full h-11 bg-surface-container text-on-surface font-body-md text-body-md pl-10 pr-4 rounded-xl focus:outline-none focus:bg-surface-container-high transition-colors"
                      />
                    </div>
                  </div>
                </div>
              </section>

              {/* Tarjeta 2: Selector de Fondo (Sección 2.1 / RF-04 y RF-05) */}
              <section className="bg-surface-container-low rounded-2xl p-5 flex flex-col gap-4 border border-outline-variant/15">
                <div className="flex flex-col">
                  <div className="flex items-center justify-between">
                    <h2 className="font-headline-sm text-headline-sm text-primary">
                      Fondo del Portafolio
                    </h2>
                    <span className="material-symbols-outlined text-outline-variant text-[20px]">
                      wallpaper
                    </span>
                  </div>
                  <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
                    Elige entre un fondo negro sólido (#000000) o una fotografía personalizada (por
                    defecto usa tu foto de perfil a menos que subas otra).
                  </p>
                </div>

                {/* Cuadrícula de Selección de Fondo (2 Opciones Excluyentes - Stitch 2A) */}
                <div
                  role="radiogroup"
                  aria-label="Estilo de fondo"
                  className="grid grid-cols-2 gap-3.5"
                >
                  {/* Opción A: Fondo Negro (#000000) */}
                  <button
                    type="button"
                    role="radio"
                    aria-checked={portfolio.background_type === 'BLACK'}
                    onClick={() =>
                      onUpdatePortfolio({
                        ...portfolio,
                        background_type: 'BLACK',
                      })
                    }
                    className={`group flex flex-col text-left rounded-xl p-2.5 transition-all ${
                      portfolio.background_type === 'BLACK'
                        ? 'bg-surface-container-high ring-1 ring-primary shadow-md'
                        : 'bg-surface-container hover:bg-surface-container-high'
                    }`}
                  >
                    <div className="w-full aspect-[16/10] rounded-lg bg-[#000000] flex flex-col items-center justify-center relative overflow-hidden border border-outline-variant/25">
                      <div className="w-7 h-7 rounded-full bg-surface-container-high mb-1.5 border border-white/20" />
                      <div className="w-16 h-2 bg-surface-container-high rounded mb-1" />
                      <div className="w-12 h-1.5 bg-surface-container rounded" />
                      {portfolio.background_type === 'BLACK' && (
                        <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary text-surface flex items-center justify-center shadow-md">
                          <span className="material-symbols-outlined text-[14px] font-bold">
                            check
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="mt-2.5 px-1 flex items-center justify-between">
                      <div>
                        <span className="font-label-md text-label-md text-primary font-semibold block">
                          Fondo Negro
                        </span>
                        <span className="font-body-sm text-body-sm text-outline">
                          Sólido #000000
                        </span>
                      </div>
                      <span
                        className={`w-2.5 h-2.5 rounded-full ${
                          portfolio.background_type === 'BLACK'
                            ? 'bg-secondary'
                            : 'bg-surface-container-highest'
                        }`}
                      />
                    </div>
                  </button>

                  {/* Opción B: Foto Personalizada (Por defecto usa la foto de perfil del usuario) */}
                  <button
                    type="button"
                    role="radio"
                    aria-checked={portfolio.background_type === 'IMAGE'}
                    onClick={() =>
                      onUpdatePortfolio({
                        ...portfolio,
                        background_type: 'IMAGE',
                      })
                    }
                    className={`group flex flex-col text-left rounded-xl p-2.5 transition-all relative ${
                      portfolio.background_type === 'IMAGE'
                        ? 'bg-surface-container-high ring-1 ring-primary shadow-md'
                        : 'bg-surface-container hover:bg-surface-container-high'
                    }`}
                  >
                    <div className="w-full aspect-[16/10] rounded-lg relative overflow-hidden bg-surface-container-lowest border border-outline-variant/25">
                      <img
                        src={effectiveBgImage}
                        alt="Vista previa de fondo personalizado"
                        className="w-full h-full object-cover"
                      />
                      <div
                        className="absolute inset-0 flex flex-col items-center justify-center p-2"
                        style={{
                          backgroundColor: `rgba(0,0,0,${
                            (portfolio.background_overlay_opacity ?? 40) / 100
                          })`,
                        }}
                      >
                        <div className="w-7 h-7 rounded-full bg-white/25 backdrop-blur-sm mb-1.5 border border-white/40" />
                        <div className="w-16 h-2 bg-white/80 rounded mb-1" />
                        <div className="w-12 h-1.5 bg-white/45 rounded" />
                      </div>
                      {portfolio.background_type === 'IMAGE' && (
                        <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary text-surface flex items-center justify-center shadow-md">
                          <span className="material-symbols-outlined text-[14px] font-bold">
                            check
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="mt-2.5 px-1 flex items-center justify-between">
                      <div>
                        <span className="font-label-md text-label-md text-primary font-semibold block">
                          Foto Personalizada
                        </span>
                        <span className="font-body-sm text-body-sm text-outline">
                          {portfolio.has_custom_background
                            ? 'Foto propia activa'
                            : 'Tu foto de perfil'}
                        </span>
                      </div>
                      <span
                        className={`w-2.5 h-2.5 rounded-full ${
                          portfolio.background_type === 'IMAGE'
                            ? 'bg-secondary'
                            : 'bg-surface-container-highest'
                        }`}
                      />
                    </div>
                  </button>
                </div>

                <input
                  ref={bgInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleBgFileSelect(file);
                    e.target.value = '';
                  }}
                />

                {/* Controles Expandidos para "Foto Personalizada" (RF-05) */}
                {portfolio.background_type === 'IMAGE' && (
                  <div
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      const file = e.dataTransfer?.files?.[0];
                      if (file) handleBgFileSelect(file);
                    }}
                    className="rounded-xl p-4 bg-surface-container flex flex-col gap-4 border border-outline-variant/20"
                  >
                    {/* Fila de Miniatura, Metadatos y Botones Cambiar / Restaurar */}
                    <div className="flex items-center gap-3">
                      <div className="w-16 h-12 rounded-lg overflow-hidden bg-surface-container-high shrink-0 border border-outline-variant/30">
                        <img
                          src={effectiveBgImage}
                          alt="Miniatura de fondo"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-label-md text-label-md text-on-surface font-semibold truncate">
                          {portfolio.has_custom_background && portfolio.background_image_name
                            ? portfolio.background_image_name
                            : 'Foto de perfil actual (Predeterminada)'}
                        </div>
                        <div className="font-body-sm text-body-sm text-outline truncate">
                          {portfolio.has_custom_background
                            ? portfolio.background_image_meta || 'Fondo personalizado activo'
                            : 'Se sincroniza automáticamente con tu foto de perfil'}
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => bgInputRef.current?.click()}
                          className="h-9 px-3 rounded-lg bg-surface-container-high hover:bg-surface-container-highest text-on-surface font-label-sm text-label-sm flex items-center gap-1 transition-colors"
                        >
                          <span className="material-symbols-outlined text-[15px]">
                            cloud_upload
                          </span>
                          <span>Subir otra foto</span>
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            onUpdatePortfolio({
                              ...portfolio,
                              background_type: 'BLACK',
                            })
                          }
                          aria-label="Eliminar imagen de fondo y volver a fondo negro"
                          title="Volver a Fondo Negro"
                          className="w-9 h-9 rounded-lg bg-surface-container-high hover:bg-error-container text-on-surface-variant hover:text-error flex items-center justify-center transition-colors"
                        >
                          <span className="material-symbols-outlined text-[17px]">delete</span>
                        </button>
                      </div>
                    </div>

                    {/* Botones rápidos de fondos predefinidos */}
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-label-sm text-label-sm text-outline uppercase">
                        Opciones de fondo:
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          onUpdatePortfolio({
                            ...portfolio,
                            background_type: 'IMAGE',
                            has_custom_background: false,
                            background_image_url: '',
                            background_image_name: '',
                          })
                        }
                        className={`px-2.5 py-1 rounded-lg font-body-sm text-body-sm transition-colors ${
                          !portfolio.has_custom_background
                            ? 'bg-secondary/20 text-secondary font-medium'
                            : 'bg-surface-container-high hover:bg-surface-container-highest text-on-surface'
                        }`}
                      >
                        Usar mi foto de perfil (Predeterminado)
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          onUpdatePortfolio({
                            ...portfolio,
                            background_type: 'IMAGE',
                            has_custom_background: true,
                            background_image_url: STITCH_URBAN_BG,
                            background_image_name: 'urban_night_stitch.webp',
                            background_image_meta: '1080 × 1920 • Preset Stitch',
                          })
                        }
                        className="px-2.5 py-1 rounded-lg bg-surface-container-high hover:bg-surface-container-highest text-on-surface font-body-sm text-body-sm transition-colors"
                      >
                        Urbano Nocturno (Stitch)
                      </button>
                    </div>

                    {/* Control Deslizante (Slider) de Oscurecimiento de Fondo (0% a 80% según SRS Sección 2.1) */}
                    <div className="flex flex-col gap-2 pt-1">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-outline text-[16px]">
                            brightness_medium
                          </span>
                          <label
                            htmlFor="dimmer-slider"
                            className="font-label-md text-label-md text-on-surface"
                          >
                            Oscurecimiento de fondo (Overlay)
                          </label>
                        </div>
                        <span className="font-label-sm text-label-sm px-2.5 py-0.5 rounded-full bg-surface-container-highest text-primary font-mono">
                          {portfolio.background_overlay_opacity ?? 40}%
                        </span>
                      </div>

                      <div className="relative flex items-center w-full h-7">
                        <input
                          id="dimmer-slider"
                          type="range"
                          min="0"
                          max="80"
                          value={portfolio.background_overlay_opacity ?? 40}
                          onChange={(e) =>
                            onUpdatePortfolio({
                              ...portfolio,
                              background_overlay_opacity: Number(e.target.value),
                            })
                          }
                          className="w-full obsidian-slider"
                        />
                      </div>

                      <div className="flex justify-between items-center text-outline font-label-sm text-label-sm">
                        <span>Original (0%)</span>
                        <span>Recomendado: 40-60%</span>
                        <span>Máximo SRS (80%)</span>
                      </div>
                    </div>
                  </div>
                )}
              </section>
            </div>
          )}

          {/* ==================== PESTAÑA 2B: GESTOR DE REDES SOCIALES ==================== */}
          {activeTab === 'redes' && (
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between px-1">
                <p className="font-body-sm text-body-sm text-outline leading-relaxed">
                  Activa las redes que quieras mostrar. Puedes añadir múltiples perfiles dentro de
                  cada red social y arrastrar o usar las flechas para cambiar el orden.
                </p>
              </div>

              <div className="flex flex-col gap-3.5" id="social-cards-container">
                {sortedGroups.map((group, groupIndex) => {
                  const platform = SOCIAL_PLATFORMS[group.platform];
                  if (!platform) return null;

                  const sortedLinks = [...(group.links || [])].sort(
                    (a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0)
                  );
                  const count = sortedLinks.length;

                  // ESTADO INACTIVO: Tarjeta colapsada y atenuada (conserva los enlaces guardados - RF-07)
                  if (!group.is_enabled) {
                    return (
                      <div
                        key={group.id}
                        draggable
                        onDragStart={() => setDraggedGroupIndex(groupIndex)}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={() => handleGroupDrop(groupIndex)}
                        className="w-full bg-surface-container-low/75 hover:bg-surface-container-low rounded-xl px-4 py-3.5 flex items-center justify-between gap-3 transition-colors border border-outline-variant/10"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <span
                            className="material-symbols-outlined text-outline-variant cursor-grab text-[20px] shrink-0 select-none"
                            title="Arrastrar para reordenar red social"
                          >
                            drag_indicator
                          </span>
                          <div className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center text-on-surface-variant shrink-0">
                            {platform.icon('w-4 h-4 fill-current')}
                          </div>
                          <div className="flex items-center gap-2 truncate">
                            <span className="font-headline-sm text-headline-sm text-on-surface truncate">
                              {platform.name}
                            </span>
                            <span className="font-label-sm text-label-sm text-outline-variant shrink-0">
                              Desactivado {count > 0 ? `(${count} guardado${count > 1 ? 's' : ''})` : ''}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          {/* Botones de orden de red */}
                          <div className="hidden sm:flex items-center gap-0.5">
                            <button
                              type="button"
                              disabled={groupIndex === 0}
                              onClick={() => handleMoveGroup(groupIndex, -1)}
                              aria-label={`Subir ${platform.name}`}
                              className="w-7 h-7 rounded-md flex items-center justify-center text-outline hover:text-primary disabled:opacity-25"
                            >
                              <span className="material-symbols-outlined text-[16px]">
                                arrow_upward
                              </span>
                            </button>
                            <button
                              type="button"
                              disabled={groupIndex === sortedGroups.length - 1}
                              onClick={() => handleMoveGroup(groupIndex, 1)}
                              aria-label={`Bajar ${platform.name}`}
                              className="w-7 h-7 rounded-md flex items-center justify-center text-outline hover:text-primary disabled:opacity-25"
                            >
                              <span className="material-symbols-outlined text-[16px]">
                                arrow_downward
                              </span>
                            </button>
                          </div>

                          {/* Interruptor Maestro Inactivo */}
                          <button
                            type="button"
                            aria-pressed="false"
                            aria-label={`Activar ${platform.name}`}
                            onClick={() => handleToggleNetwork(group.id)}
                            className="w-12 h-7 rounded-full bg-surface-container-highest p-0.5 transition-colors relative flex items-center shrink-0"
                          >
                            <span className="w-6 h-6 rounded-full bg-outline-variant shadow-sm transform translate-x-0 transition-transform" />
                          </button>
                        </div>
                      </div>
                    );
                  }

                  // ESTADO ACTIVO: Tarjeta expandida mostrando lista de perfiles (Relación 1 a N)
                  return (
                    <div
                      key={group.id}
                      draggable
                      onDragStart={() => setDraggedGroupIndex(groupIndex)}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={() => handleGroupDrop(groupIndex)}
                      className="w-full bg-surface-container-low rounded-xl p-4 flex flex-col gap-3.5 transition-all shadow-sm border border-outline-variant/20"
                    >
                      {/* Cabecera de la Red Social Activa */}
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span
                            className="material-symbols-outlined text-outline cursor-grab text-[20px] shrink-0 select-none"
                            title="Arrastrar para cambiar posición de la red social"
                          >
                            drag_indicator
                          </span>
                          <div className="w-10 h-10 rounded-lg bg-surface-container-high flex items-center justify-center text-primary shrink-0">
                            {platform.icon('w-5 h-5 fill-current')}
                          </div>
                          <div className="flex items-center gap-2 truncate">
                            <span className="font-headline-sm text-headline-sm text-on-surface truncate">
                              {platform.name}
                            </span>
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-surface-container-highest text-secondary font-label-sm text-label-sm shrink-0">
                              {count} {count === 1 ? 'perfil' : 'perfiles'}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          {/* Controles para subir/bajar bloque de red social (RF-11) */}
                          <button
                            type="button"
                            disabled={groupIndex === 0}
                            onClick={() => handleMoveGroup(groupIndex, -1)}
                            title="Subir bloque de red social"
                            className="w-7 h-7 rounded-lg bg-surface-container hover:bg-surface-container-high flex items-center justify-center text-outline hover:text-primary disabled:opacity-25 transition-colors"
                          >
                            <span className="material-symbols-outlined text-[16px]">
                              arrow_upward
                            </span>
                          </button>
                          <button
                            type="button"
                            disabled={groupIndex === sortedGroups.length - 1}
                            onClick={() => handleMoveGroup(groupIndex, 1)}
                            title="Bajar bloque de red social"
                            className="w-7 h-7 rounded-lg bg-surface-container hover:bg-surface-container-high flex items-center justify-center text-outline hover:text-primary disabled:opacity-25 transition-colors"
                          >
                            <span className="material-symbols-outlined text-[16px]">
                              arrow_downward
                            </span>
                          </button>

                          {/* Interruptor Maestro Activo */}
                          <button
                            type="button"
                            aria-pressed="true"
                            aria-label={`Desactivar ${platform.name}`}
                            onClick={() => handleToggleNetwork(group.id)}
                            className="w-12 h-7 rounded-full bg-secondary-container p-0.5 transition-colors relative flex items-center shrink-0 ml-1"
                          >
                            <span className="w-6 h-6 rounded-full bg-primary shadow-sm transform translate-x-5 transition-transform" />
                          </button>
                        </div>
                      </div>

                      {/* Lista de Perfiles configurados para esta red (Relación 1 a N) */}
                      <div className="flex flex-col gap-2.5 pt-1">
                        {sortedLinks.map((link, linkIndex) => {
                          const resolvedUrl = resolveSafeSocialUrl(
                            group.platform,
                            link.target_url,
                            link.phone_country || '52'
                          );
                          const isWhatsApp = group.platform === 'WHATSAPP';
                          const waMode = link.input_mode || 'URL';

                          return (
                            <div
                              key={link.id}
                              className="bg-surface-container p-3 rounded-xl flex items-start gap-2 group border border-outline-variant/15"
                            >
                              {/* I. Icono de arrastre y flechas de orden interno (RF-11) */}
                              <div className="flex flex-col items-center gap-0.5 mt-1 shrink-0">
                                <button
                                  type="button"
                                  disabled={linkIndex === 0}
                                  onClick={() => handleMoveLinkInGroup(group.id, linkIndex, -1)}
                                  title="Subir prioridad del perfil"
                                  className="text-outline hover:text-primary disabled:opacity-20"
                                >
                                  <span className="material-symbols-outlined text-[15px]">
                                    keyboard_arrow_up
                                  </span>
                                </button>
                                <span className="material-symbols-outlined text-outline text-[17px] select-none">
                                  drag_indicator
                                </span>
                                <button
                                  type="button"
                                  disabled={linkIndex === sortedLinks.length - 1}
                                  onClick={() => handleMoveLinkInGroup(group.id, linkIndex, 1)}
                                  title="Bajar prioridad del perfil"
                                  className="text-outline hover:text-primary disabled:opacity-20"
                                >
                                  <span className="material-symbols-outlined text-[15px]">
                                    keyboard_arrow_down
                                  </span>
                                </button>
                              </div>

                              {/* II y III. Campos de Etiqueta y Enlace/Usuario (o Selector WhatsApp) */}
                              <div className="flex-1 flex flex-col gap-2 min-w-0">
                                {/* II. Campo "Etiqueta / Nombre del Perfil" (RF-09) */}
                                <div className="flex items-center gap-2">
                                  <input
                                    type="text"
                                    value={link.label}
                                    onChange={(e) =>
                                      handleUpdateLink(group.id, link.id, {
                                        label: e.target.value,
                                      })
                                    }
                                    placeholder={`Etiqueta visible (ej. ${platform.name} Personal)`}
                                    className="w-full bg-surface-container-high px-3 h-10 rounded-lg text-on-surface placeholder:text-outline font-body-md text-body-md outline-none focus:bg-surface-container-highest transition-colors"
                                  />
                                </div>

                                {/* Selector de modalidad para WhatsApp (RF-10: Número con código de país vs Enlace directo) */}
                                {isWhatsApp && (
                                  <div className="flex items-center gap-1.5">
                                    <button
                                      type="button"
                                      onClick={() =>
                                        handleUpdateLink(group.id, link.id, {
                                          input_mode: 'PHONE',
                                        })
                                      }
                                      className={`px-2.5 py-1 rounded-md font-label-sm text-label-sm transition-colors ${
                                        waMode === 'PHONE'
                                          ? 'bg-secondary/20 text-secondary'
                                          : 'bg-surface-container-high text-on-surface-variant'
                                      }`}
                                    >
                                      Número con Lada
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() =>
                                        handleUpdateLink(group.id, link.id, {
                                          input_mode: 'URL',
                                        })
                                      }
                                      className={`px-2.5 py-1 rounded-md font-label-sm text-label-sm transition-colors ${
                                        waMode === 'URL'
                                          ? 'bg-secondary/20 text-secondary'
                                          : 'bg-surface-container-high text-on-surface-variant'
                                      }`}
                                    >
                                      Enlace Directo
                                    </button>
                                  </div>
                                )}

                                {/* III. Campo "Enlace o Usuario" */}
                                {isWhatsApp && waMode === 'PHONE' ? (
                                  <div className="flex flex-col sm:flex-row gap-2">
                                    <select
                                      value={link.phone_country || '52'}
                                      onChange={(e) =>
                                        handleUpdateLink(group.id, link.id, {
                                          phone_country: e.target.value,
                                        })
                                      }
                                      className="bg-surface-container-high text-on-surface font-body-sm text-body-sm px-2.5 h-10 rounded-lg outline-none focus:bg-surface-container-highest sm:w-44 shrink-0"
                                    >
                                      {COUNTRY_CODES.map((c) => (
                                        <option key={c.code} value={c.code}>
                                          {c.label}
                                        </option>
                                      ))}
                                    </select>
                                    <input
                                      type="tel"
                                      value={link.phone_number || ''}
                                      onChange={(e) =>
                                        handleUpdateLink(group.id, link.id, {
                                          phone_number: e.target.value,
                                        })
                                      }
                                      placeholder="Ej. 5512345678"
                                      className="w-full bg-surface-container-high px-3 h-10 rounded-lg text-on-surface placeholder:text-outline font-body-md text-body-md outline-none focus:bg-surface-container-highest"
                                    />
                                  </div>
                                ) : (
                                  <div className="flex items-center bg-surface-container-high px-3 h-10 rounded-lg gap-1.5 min-w-0 focus-within:bg-surface-container-highest transition-colors">
                                    <span className="material-symbols-outlined text-[16px] text-outline shrink-0">
                                      link
                                    </span>
                                    <input
                                      type="text"
                                      value={link.target_url}
                                      onChange={(e) =>
                                        handleUpdateLink(group.id, link.id, {
                                          target_url: e.target.value,
                                        })
                                      }
                                      placeholder={platform.placeholder}
                                      className="w-full bg-transparent text-on-surface placeholder:text-outline font-body-sm text-body-sm outline-none truncate font-mono"
                                    />
                                  </div>
                                )}

                                {/* Indicador de enlace HTTPS resuelto y botón de prueba */}
                                <div className="flex items-center justify-between text-[11px] px-1">
                                  {resolvedUrl ? (
                                    <span className="text-secondary truncate max-w-[260px] sm:max-w-[360px] flex items-center gap-1 font-mono">
                                      <span className="material-symbols-outlined text-[13px]">
                                        verified_user
                                      </span>
                                      {resolvedUrl}
                                    </span>
                                  ) : (
                                    <span className="text-outline">
                                      Ingresa una URL o @usuario válido para mostrar el botón
                                    </span>
                                  )}

                                  {resolvedUrl && (
                                    <a
                                      href={resolvedUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-on-surface-variant hover:text-primary underline shrink-0 ml-2"
                                    >
                                      Probar ↗
                                    </a>
                                  )}
                                </div>
                              </div>

                              {/* IV. Botón Eliminar (Icono de papelera) */}
                              <button
                                type="button"
                                aria-label="Eliminar perfil"
                                title="Eliminar este enlace"
                                onClick={() => handleDeleteLink(group.id, link.id)}
                                className="w-9 h-9 rounded-lg flex items-center justify-center text-outline hover:text-error hover:bg-error-container/30 transition-colors shrink-0 mt-0.5"
                              >
                                <span className="material-symbols-outlined text-[18px]">
                                  delete
                                </span>
                              </button>
                            </div>
                          );
                        })}
                      </div>

                      {/* Botón "+ Añadir otro perfil de [Nombre de Red]" */}
                      <button
                        type="button"
                        onClick={() => handleAddLinkToGroup(group.id)}
                        className="w-full h-11 rounded-lg bg-surface-container-high/60 hover:bg-surface-container-high text-on-surface font-label-lg text-label-lg flex items-center justify-center gap-2 transition-colors"
                      >
                        <span className="material-symbols-outlined text-[18px] text-secondary">
                          add_circle
                        </span>
                        <span>{platform.addButtonText}</span>
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Barra de Publicación en Escritorio */}
          <div className="hidden lg:flex items-center justify-between gap-4 p-4 rounded-2xl bg-surface-container-low border border-outline-variant/20 mt-2">
            <div className="flex flex-col">
              <span className="font-label-lg text-label-lg text-primary font-semibold">
                Listo para difundir tu portafolio
              </span>
              <span className="font-body-sm text-body-sm text-on-surface-variant">
                Guarda los cambios o exporta la página estática HTML directamente.
              </span>
            </div>
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => onNavigate('public')}
                className="h-11 px-4 rounded-xl bg-surface-container-high hover:bg-surface-container-highest text-primary font-label-lg text-label-lg flex items-center gap-2 transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">visibility</span>
                <span>Abrir Vista Pública</span>
              </button>

              <button
                type="button"
                disabled={publishStatus === 'publishing'}
                onClick={handlePublishClick}
                className={`h-11 px-5 rounded-xl font-label-lg text-label-lg font-bold flex items-center gap-2 shadow-md transition-all active:scale-[0.98] ${
                  publishStatus === 'published'
                    ? 'bg-secondary text-on-secondary'
                    : 'bg-primary hover:bg-primary/90 text-on-primary'
                }`}
              >
                <span
                  className={`material-symbols-outlined text-[19px] ${
                    publishStatus === 'publishing' ? 'animate-spin' : ''
                  }`}
                >
                  {publishStatus === 'publishing'
                    ? 'progress_activity'
                    : publishStatus === 'published'
                    ? 'check_circle'
                    : 'rocket_launch'}
                </span>
                <span>
                  {publishStatus === 'publishing'
                    ? 'Publicando...'
                    : publishStatus === 'published'
                    ? '¡Publicado!'
                    : 'Guardar y Publicar'}
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* COLUMNA DERECHA (40% -> 5 de 12 columnas en escritorio): Simulador Móvil en Tiempo Real (RF-12) */}
        <div className="hidden lg:flex lg:col-span-5 flex-col items-center sticky top-20">
          <div className="w-full max-w-[380px] flex items-center justify-between mb-3 px-2">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
              <span className="font-label-md text-label-md text-on-surface font-semibold uppercase tracking-wider">
                Simulador Móvil en Tiempo Real
              </span>
            </div>
            <span className="font-body-sm text-body-sm text-outline font-mono">390 × 844 px</span>
          </div>

          {/* Marco de Dispositivo Móvil */}
          <div className="w-full max-w-[380px] rounded-[40px] p-3 bg-surface-container-low border-2 border-outline-variant/40 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.85)] relative">
            {/* Isla dinámica / Notch superior */}
            <div className="w-24 h-5 bg-black rounded-full mx-auto mb-2 flex items-center justify-end px-2.5">
              <span className="w-2 h-2 rounded-full bg-[#1a2e26]" />
            </div>

            <div className="w-full h-[690px] overflow-y-auto no-scrollbar rounded-[32px] border border-white/10">
              <PublicPortfolioView portfolio={portfolio} isSimulator={true} />
            </div>
          </div>
        </div>
      </div>

      {/* Barra Flotante Inferior en Dispositivos Móviles ("Vista Previa" y "Publicar cambios" - Stitch 2A / 2B) */}
      <aside className="lg:hidden fixed bottom-16 left-0 right-0 z-40 bg-surface/90 backdrop-blur-xl px-4 py-2.5 flex items-center gap-2.5 border-t border-outline-variant/20 shadow-2xl">
        <button
          type="button"
          onClick={() => setMobilePreviewOpen(true)}
          className="flex-1 h-12 rounded-xl bg-surface-container-high hover:bg-surface-container-highest active:scale-[0.98] text-primary font-label-lg text-label-lg flex items-center justify-center gap-2 transition-all"
        >
          <span className="material-symbols-outlined text-[19px]">visibility</span>
          <span>Vista Previa</span>
        </button>

        <button
          type="button"
          disabled={publishStatus === 'publishing'}
          onClick={handlePublishClick}
          className={`flex-1 h-12 rounded-xl active:scale-[0.98] font-label-lg text-label-lg font-bold flex items-center justify-center gap-1.5 shadow-md transition-all ${
            publishStatus === 'published'
              ? 'bg-secondary text-on-secondary'
              : 'bg-primary hover:bg-primary/90 text-surface'
          }`}
        >
          <span
            className={`material-symbols-outlined text-[19px] ${
              publishStatus === 'publishing' ? 'animate-spin' : ''
            }`}
          >
            {publishStatus === 'publishing'
              ? 'progress_activity'
              : publishStatus === 'published'
              ? 'check_circle'
              : 'rocket_launch'}
          </span>
          <span>
            {publishStatus === 'publishing'
              ? 'Publicando...'
              : publishStatus === 'published'
              ? '¡Publicado!'
              : 'Publicar cambios'}
          </span>
        </button>
      </aside>

      {/* Modal de Simulador a Pantalla Completa en Móvil */}
      {mobilePreviewOpen && (
        <div className="fixed inset-0 z-[90] bg-black flex flex-col">
          <div className="h-14 px-4 bg-surface/90 backdrop-blur-xl flex items-center justify-between border-b border-outline-variant/30 shrink-0">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
              <span className="font-label-lg text-label-lg text-primary font-semibold">
                Vista Previa en Tiempo Real
              </span>
            </div>
            <button
              type="button"
              onClick={() => setMobilePreviewOpen(false)}
              className="h-9 px-3 rounded-lg bg-primary text-on-primary font-label-md text-label-md font-semibold flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-[16px]">close</span>
              <span>Cerrar Vista Previa</span>
            </button>
          </div>
          <div className="flex-1 overflow-y-auto">
            <PublicPortfolioView portfolio={portfolio} isSimulator={false} />
          </div>
        </div>
      )}

      {/* Modal de Recorte 1:1 Circular (RF-03) */}
      <AvatarCropperModal
        isOpen={cropperOpen}
        imageSrc={cropperSource}
        onClose={() => setCropperOpen(false)}
        onConfirmCrop={(croppedWebpUrl) => {
          onUpdatePortfolio({
            ...portfolio,
            avatar_url: croppedWebpUrl,
          });
          setCropperOpen(false);
        }}
      />
    </div>
  );
}
