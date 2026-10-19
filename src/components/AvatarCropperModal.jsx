import React, { useState, useRef, useEffect } from 'react';

/**
 * Sección 2.1 / RF-03 y RNF-01:
 * Herramienta modal de recorte (cropper con proporción 1:1), previsualización circular
 * y conversión automática a formato WebP optimizado.
 */
export default function AvatarCropperModal({
  isOpen,
  imageSrc,
  onClose,
  onConfirmCrop,
}) {
  const [zoom, setZoom] = useState(1.15);
  const [offsetX, setOffsetX] = useState(0);
  const [offsetY, setOffsetY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0, startX: 0, startY: 0 });
  const imgRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setZoom(1.15);
      setOffsetX(0);
      setOffsetY(0);
    }
  }, [isOpen, imageSrc]);

  if (!isOpen || !imageSrc) return null;

  const handlePointerDown = (e) => {
    setIsDragging(true);
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    dragStartRef.current = {
      x: clientX,
      y: clientY,
      startX: offsetX,
      startY: offsetY,
    };
  };

  const handlePointerMove = (e) => {
    if (!isDragging) return;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    const dx = clientX - dragStartRef.current.x;
    const dy = clientY - dragStartRef.current.y;
    setOffsetX(Math.max(-160, Math.min(160, dragStartRef.current.startX + dx)));
    setOffsetY(Math.max(-160, Math.min(160, dragStartRef.current.startY + dy)));
  };

  const handlePointerUp = () => {
    setIsDragging(false);
  };

  const handleApplyCrop = () => {
    const img = imgRef.current;
    if (!img) return;

    const canvas = document.createElement('canvas');
    const size = 512;
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#131313';
    ctx.fillRect(0, 0, size, size);

    const natW = img.naturalWidth || 512;
    const natH = img.naturalHeight || 512;
    const baseScale = Math.max(size / natW, size / natH);
    const finalScale = baseScale * zoom;

    const drawW = natW * finalScale;
    const drawH = natH * finalScale;

    // Escalar el desplazamiento de la vista previa (240px) al lienzo de salida (512px)
    const ratio = size / 240;
    const drawX = (size - drawW) / 2 + offsetX * ratio;
    const drawY = (size - drawH) / 2 + offsetY * ratio;

    ctx.drawImage(img, drawX, drawY, drawW, drawH);

    // RNF-01: Conversión automática a WebP comprimido
    const webpDataUrl = canvas.toDataURL('image/webp', 0.88);
    onConfirmCrop(webpDataUrl);
  };

  return (
    <div
      className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="cropper-title"
    >
      <div className="w-full max-w-md bg-surface-container-low border border-outline-variant/30 rounded-2xl p-5 shadow-2xl flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary text-[20px]">crop</span>
            <h3 id="cropper-title" className="font-headline-sm text-headline-sm text-primary">
              Recortar Foto de Perfil (1:1)
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-surface-container-high flex items-center justify-center text-on-surface-variant hover:text-primary"
            aria-label="Cerrar recorte"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        <p className="font-body-sm text-body-sm text-on-surface-variant">
          Arrastra la imagen para encuadrarla dentro del círculo. Se optimizará automáticamente en
          formato <span className="text-secondary font-medium">WebP</span> (RNF-01).
        </p>

        {/* Lienzo interactivo 1:1 con máscara circular */}
        <div className="flex items-center justify-center py-2">
          <div
            onMouseDown={handlePointerDown}
            onMouseMove={handlePointerMove}
            onMouseUp={handlePointerUp}
            onMouseLeave={handlePointerUp}
            onTouchStart={handlePointerDown}
            onTouchMove={handlePointerMove}
            onTouchEnd={handlePointerUp}
            className="relative w-[240px] h-[240px] rounded-2xl overflow-hidden bg-surface-container-lowest cursor-grab active:cursor-grabbing select-none border border-outline-variant/40 flex items-center justify-center"
          >
            <img
              ref={imgRef}
              src={imageSrc}
              alt="Vista previa de recorte"
              crossOrigin="anonymous"
              draggable={false}
              className="max-w-none pointer-events-none select-none"
              style={{
                width: '240px',
                height: '240px',
                objectFit: 'cover',
                transform: `translate(${offsetX}px, ${offsetY}px) scale(${zoom})`,
                transformOrigin: 'center center',
              }}
            />

            {/* Máscara circular de previsualización 1:1 */}
            <div
              className="absolute inset-0 pointer-events-none rounded-2xl"
              style={{
                boxShadow: 'inset 0 0 0 2px rgba(255,255,255,0.85)',
              }}
            />
            <div
              className="absolute inset-0 rounded-full border-2 border-secondary pointer-events-none"
              style={{
                boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.58)',
              }}
            />
          </div>
        </div>

        {/* Control de Zoom */}
        <div className="flex flex-col gap-1.5 bg-surface-container p-3 rounded-xl">
          <div className="flex items-center justify-between">
            <span className="font-label-md text-label-md text-on-surface flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px] text-outline">zoom_in</span>
              Escala de recorte
            </span>
            <span className="font-label-sm text-label-sm text-secondary font-mono">
              {Math.round(zoom * 100)}%
            </span>
          </div>
          <input
            type="range"
            min="1"
            max="2.8"
            step="0.05"
            value={zoom}
            onChange={(e) => setZoom(parseFloat(e.target.value))}
            className="w-full obsidian-slider"
          />
        </div>

        {/* Botones de Acción */}
        <div className="grid grid-cols-2 gap-3 pt-1">
          <button
            type="button"
            onClick={() => {
              setZoom(1.15);
              setOffsetX(0);
              setOffsetY(0);
            }}
            className="h-11 rounded-xl bg-surface-container-high hover:bg-surface-container-highest text-on-surface font-label-lg text-label-lg transition-colors"
          >
            Centrar
          </button>
          <button
            type="button"
            onClick={handleApplyCrop}
            className="h-11 rounded-xl bg-primary hover:bg-primary/90 text-on-primary font-label-lg text-label-lg font-semibold flex items-center justify-center gap-1.5 transition-all"
          >
            <span className="material-symbols-outlined text-[18px]">check</span>
            <span>Aplicar recorte</span>
          </button>
        </div>
      </div>
    </div>
  );
}
