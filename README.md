# LinkPortfolio — Herramienta de Creación de Portafolios Web (`@its.araaaby`)

Plataforma web minimalista estilo **Link-in-Bio** diseñada bajo el sistema de diseño **Obsidian Bio** (generado con **Google Stitch AI** en el proyecto *"LinkPortfolio Mobile Onboarding"*). Permite a cualquier creador o profesional configurar, previsualizar en tiempo real, difundir mediante código QR y exportar una página estática ultrarrápida con sus enlaces oficiales de redes sociales.

---

## Tabla de Contenidos

1. [Resumen Ejecutivo y Pilares Visuales](#1-resumen-ejecutivo-y-pilares-visuales)
2. [Catálogo Oficial de las 7 Redes Sociales](#2-catálogo-oficial-de-las-7-redes-sociales)
3. [Lógica de Negocio y Relación 1 a N](#3-lógica-de-negocio-y-relación-1-a-n)
4. [Descripción de Pantallas (Mockups de Google Stitch AI)](#4-descripción-de-pantallas-mockups-de-google-stitch-ai)
5. [Primer Portafolio Configurado y Probado: `@its.araaaby`](#5-primer-portafolio-configurado-y-probado-itsaraaaby)
6. [Modelo de Datos (Estructura Relacional en 3 Niveles)](#6-modelo-de-datos-estructura-relacional-en-3-niveles)
7. [Requerimientos Funcionales (RF) y No Funcionales (RNF)](#7-requerimientos-funcionales-rf-y-no-funcionales-rnf)
8. [Instalación y Ejecución del Proyecto](#8-instalación-y-ejecución-del-proyecto)
9. [Guía Detallada de Uso de la Herramienta](#9-guía-detallada-de-uso-de-la-herramienta)

---

## 1. Resumen Ejecutivo y Pilares Visuales

A diferencia de otras herramientas saturadas de bloques complejos, **LinkPortfolio** se enfoca en la simplicidad extrema, el alto contraste editorial y la velocidad de configuración, componiéndose únicamente de **tres pilares visuales**:

1. **Foto de perfil del usuario:** Imagen principal circular centrada en la parte superior del portafolio con herramienta de recorte 1:1 integrada y compresión automática a formato **WebP**.
2. **Fondo personalizable:** Eligiendo estrictamente entre dos modalidades excluyentes:
   - **Modo Fondo Negro (`#000000`):** Lienzo negro puro de alto contraste (opción predeterminada).
   - **Modo Foto Personalizada:** Fotografía cargada por el usuario que cubre el 100% de la pantalla, acompañada de un filtro de oscurecimiento (*overlay* ajustable de `0%` a `80%`) y botones con acabado *glassmorphism* para garantizar legibilidad.
3. **Directorio de redes sociales:** Donde todas las plataformas son opcionales (activables mediante interruptores maestros) y cada una admite **múltiples perfiles o enlaces (Relación 1 a N)** con etiquetas personalizadas.

---

## 2. Catálogo Oficial de las 7 Redes Sociales

La plataforma soporta exclusivamente las siguientes **7 redes sociales oficiales** con su iconografía vectorial nativa:

| Plataforma | Identificador | Formato de Enlace / Validación |
| :--- | :--- | :--- |
| **Instagram** | `INSTAGRAM` | URL completa (`https://www.instagram.com/...`) o `@usuario` |
| **TikTok** | `TIKTOK` | URL completa (`https://www.tiktok.com/@...`) o `@usuario` |
| **Facebook** | `FACEBOOK` | URL de perfil, página, grupo o enlace compartido (`https://www.facebook.com/...`) |
| **X (antes Twitter)** | `X` | URL completa (`https://x.com/...`) o `@usuario` |
| **YouTube** | `YOUTUBE` | URL de canal (`https://www.youtube.com/@...`) o `@canal` |
| **Threads** | `THREADS` | URL completa (`https://www.threads.com/@...`) o `@usuario` |
| **WhatsApp** | `WHATSAPP` | Selector de lada internacional + número telefónico (genera `https://wa.me/...`) o enlace directo |

---

## 3. Lógica de Negocio y Relación 1 a N

- **Opcionalidad total:** El usuario no está obligado a llenar ninguna red social que no utilice.
- **Activación explícita con preservación de datos (`RF-07`):** Cada red social cuenta con un interruptor maestro (*Activar / Desactivar*). Si una red se desactiva en el panel, ninguno de sus enlaces se muestra en la vista pública, pero **sus enlaces guardados se conservan intactos** por si decide reactivarla después.
- **Múltiples perfiles por red social (`RF-08`):** Cuando una red social está activa, el usuario puede agregar desde `1` hasta `N` enlaces independientes dentro de esa misma categoría (por ejemplo: 3 cuentas distintas de Instagram).
- **Identificación de perfiles múltiples (`RF-09`):** Cada enlace individual permite definir una **Etiqueta / Nombre del Perfil** personalizado (ej. *"Instagram personal"*, *"Ig Coach"*, *"Ig Nails"*).
- **Reordenamiento completo (`RF-11`):** Permite cambiar tanto el orden general de aparición de los bloques de redes sociales (mediante arrastrar y soltar *drag & drop* o botones de dirección) como el orden interno de los perfiles dentro de cada red.

---

## 4. Descripción de Pantallas (Mockups de Google Stitch AI)

El desarrollo implementa fielmente las pantallas diseñadas en el proyecto **"LinkPortfolio Mobile Onboarding"** de Google Stitch AI:

### Pantalla 1: Inicio, Registro e Inicio de Sesión (`OnboardingView`)
- **Reclamo de ruta personalizada (`Slug`):** Campo interactivo (`portafolio.app/its.araaaby`) que valida en tiempo real si el identificador está disponible (`Disponible` / `Muy corto` / `No disponible`).
- **Formulario de Autenticación:** Registro e inicio de sesión con correo y contraseña (con conmutador de visibilidad y medidor de seguridad), acceso rápido con un clic mediante **Google (OAuth)** y flujo de **Recuperación de contraseña**.

### Pantalla 2: Panel de Administración y Editor del Portafolio (`PortfolioEditorView`)
- **Distribución Responsiva:**
  - **En Escritorio (`≥ 1024px`):** Pantalla dividida en dos columnas: columna izquierda (`60%`) con los controles de configuración y columna derecha (`40%`) con un **Simulador Móvil en Tiempo Real** que refleja cada cambio al instante.
  - **En Dispositivos Móviles (`< 1024px`):** Vista de edición principal con barra inferior flotante que incluye el botón **"Vista Previa"** (despliega el simulador a pantalla completa) y el botón **"Publicar cambios"**.
- **Pestaña "Apariencia" (Vista 2A):**
  - Carga de foto de perfil mediante clic o arrastrar y soltar (*drag & drop*).
  - **Herramienta Modal de Recorte 1:1 (`AvatarCropperModal`):** Con encuadre interactivo, control de zoom, máscara circular y compresión automática a **WebP**.
  - Edición de nombre/alias visible (`@its.araaaby`) y biografía breve.
  - Selector visual de fondo (**Fondo Negro `#000000`** vs. **Foto Personalizada** con control deslizante de oscurecimiento de `0%` a `80%`).
- **Pestaña "Redes Sociales" (Vista 2B):**
  - Tarjetas individuales para las 7 redes sociales con interruptor maestro, contador de perfiles activos, gestión de múltiples enlaces por red y botón `+ Añadir otro perfil de [Nombre de Red]`.

### Pantalla 3: Vista Pública del Portafolio (`PublicPortfolioView`)
- **Variación 3A (Fondo Negro Sólido `#000000`):** Lienzo obsidian puro con tarjetas de enlaces de alto contraste (`#1c1b1b`), foto de perfil centrada con halo sutil e indicador de pulso activo.
- **Variación 3B (Foto de Fondo Personalizada):** Imagen de fondo a pantalla completa con capa de oscurecimiento ajustable y botones traslúcidos con efecto *glassmorphism* (`backdrop-blur-xl`).

### Pantalla 4: Configuración de Cuenta y Difusión QR (`SettingsAndQrView`)
- **Generador de Código QR Real:** Genera dinámicamente el código QR escaneable del portafolio con la foto de perfil al centro, descargable en formato **PNG**, junto con el botón para copiar el enlace público y el botón para **descargar la página estática `.html` autocontenida**.
- **Dirección y Visibilidad:** Edición del `slug` y conmutador de **"Portafolio Público Activo"** (*Modo Mantenimiento / Borrador*) para ocultar temporalmente el portafolio sin borrar su configuración.
- **Seguridad de la Cuenta:** Actualización de correo electrónico, cambio de contraseña y restauración de los datos originales de prueba.

---

## 5. Primer Portafolio Configurado y Probado: `@its.araaaby`

La aplicación incluye preconfigurado y probado como portafolio principal el perfil de **`@its.araaaby`**:

- **Identificador de usuario (`slug`):** `its.araaaby`
- **Nombre visible (`display_name`):** `@its.araaaby`
- **Foto de perfil:** `/public/avatar-its-araaaby.jpeg` (copiada desde `Foto de perfil its.araaaby.jpeg`)
- **Redes Sociales Activas y Enlaces Configurados:**
  1. **Facebook (`FACEBOOK` - 1 perfil):**
     - **Facebook:** `https://www.facebook.com/share/1C7WpHJvRK/?mibextid=wwXIfr`
  2. **Instagram (`INSTAGRAM` - 3 perfiles):**
     - **Instagram personal:** `https://www.instagram.com/its.araaaby?vrfl=cDFzMm1jb2N3Ynpo&utm_source=qr`
     - **Ig Coach:** `https://www.instagram.com/afit.araa?psln=MTQ2ODB4Ymc1NTUxYw%3D%3D&utm_source=qr`
     - **Ig Nails:** `https://www.instagram.com/araaanails_?cplk=MXhtbWdvZWNnZjhwOA%3D%3D&utm_source=qr`
  3. **X (`X` - 1 perfil):**
     - **X:** `https://x.com/diaz37586?s=11`
  4. **Threads (`THREADS` - 1 perfil):**
     - **Threads:** `https://www.threads.com/@araaa.by_?igshid=NTc4MTIwNjQ2YQ==`
  5. **TikTok, YouTube y WhatsApp:** Disponibles en el panel de administración listos para activarse mediante su interruptor maestro en cualquier momento.

---

## 6. Modelo de Datos (Estructura Relacional en 3 Niveles)

El estado de la aplicación implementa la estructura relacional en tres niveles definida en la Sección 6 de la especificación:

1. **`Portfolios` (Configuración general del usuario):**
   - `id`, `user_id`, `slug`, `display_name`, `bio`, `avatar_url`, `background_type` (`'BLACK' | 'IMAGE'`), `background_image_url`, `background_overlay_opacity` (`0..80`), `is_published` (`boolean`).
2. **`SocialNetworkGroups` (Estado de cada red en el portafolio):**
   - `id`, `portfolio_id`, `platform` (`'INSTAGRAM' | 'TIKTOK' | 'FACEBOOK' | 'X' | 'YOUTUBE' | 'THREADS' | 'WHATSAPP'`), `is_enabled` (`boolean`), `sort_order` (`number`).
3. **`SocialLinks` (Los múltiples perfiles dentro de cada red):**
   - `id`, `group_id`, `label`, `target_url`, `is_visible` (`boolean`), `sort_order` (`number`).

---

## 7. Requerimientos Funcionales (RF) y No Funcionales (RNF)

- **RNF-01 (Rendimiento y Optimización WebP):** Toda imagen subida por el usuario (perfil o fondo) se valida (máximo 5 MB) y se convierte/comprime automáticamente a formato **WebP** en el cliente mediante `HTML5 Canvas`.
- **RNF-02 (Diseño Mobile-First):** Interfaz 100% responsiva con objetivos táctiles de mínimo `44px-48px` de altura.
- **RNF-03 (Seguridad y Sanitización HTTPS):** La función `resolveSafeSocialUrl()` bloquea vectores de inyección (`javascript:`, `data:`, `vbscript:`) y normaliza automáticamente cualquier dirección al protocolo seguro `https://`.
- **RNF-04 (Metadatos Open Graph Dinámicos):** Sincronización automática de `document.title`, `og:title`, `og:description`, `og:image` y `twitter:image` con la foto y nombre de perfil actuales.

---

## 8. Instalación y Ejecución del Proyecto

### Requisitos Previos
- **Node.js** `v18+` (probado en `v22.18.0`)
- **npm** `v9+`

### Pasos de Instalación

```bash
# 1. Instalar las dependencias del proyecto
npm install

# 2. Iniciar el servidor de desarrollo local
npm run dev

# 3. Generar la compilación estática de producción (carpeta dist/)
npm run build

# 4. Previsualizar la compilación estática de producción
npm run preview
```

---

## 9. Guía Detallada de Uso de la Herramienta

1. **Explorar la Vista Pública (`@its.araaaby`):**
   - Al abrir la aplicación, se presenta de inmediato la **Vista Pública del Portafolio** de `@its.araaaby` con su fotografía de perfil y los 6 botones de acceso directo a sus cuentas de **Facebook**, **Instagram** (*Instagram personal*, *Ig Coach*, *Ig Nails*), **X** y **Threads**.
   - Desde los botones superiores discretos puedes alternar al instante entre **Modo Fondo Negro (`3A`)** y **Modo Foto Personalizada (`3B`)**, o hacer clic en **"Editar Portafolio"**.
2. **Agregar, Editar o Reordenar Redes Sociales:**
   - En el **Editor del Portafolio -> Pestaña "Redes Sociales"**, activa o desactiva cualquiera de las 7 redes oficiales usando su interruptor maestro.
   - Haz clic en **"+ Añadir otro perfil de [Red]"** para agregar múltiples cuentas dentro de una misma red social.
   - Escribe la **Etiqueta visible** y pega el enlace completo o el `@usuario` (en **WhatsApp**, elige entre ingresar un número con selector de lada internacional o pegar un enlace directo).
   - Usa las flechas o arrastra las tarjetas para cambiar el orden general de las redes o la prioridad interna de los perfiles.
3. **Personalizar Foto de Perfil y Fondo:**
   - En la **Pestaña "Apariencia"**, sube una foto nueva o haz clic en **"Recortar 1:1"** para abrir el recortador circular interactivo con zoom.
   - Alterna entre **Fondo Negro (`#000000`)** y **Foto Personalizada**, ajustando el control deslizante de **Oscurecimiento de fondo (`0%` a `80%`)** mientras observas el resultado en el **Simulador Móvil en Tiempo Real**.
4. **Compartir con Código QR o Exportar HTML Estático:**
   - Entra a **"QR y Ajustes"** en la barra inferior o superior para descargar el **Código QR en PNG**, copiar tu enlace único o hacer clic en **"Descargar Página Estática (.html autocontenido)"** para obtener un archivo `.html` listo para alojar en cualquier servidor estático.
