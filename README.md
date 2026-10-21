# LinkPortfolio — Herramienta de Creación de Portafolios Web

Plataforma web minimalista estilo **Link-in-Bio** preparada para **producción**, diseñada bajo el sistema de diseño **Obsidian Bio** (generado con **Google Stitch AI** en el proyecto *"LinkPortfolio Mobile Onboarding"*). Cuenta con **aislamiento estricto entre cuentas**, **inicio de sesión directo en la ruta raíz (`/`)**, **autenticación con Google OAuth 2.0** (con detección reactiva de cierre de ventana emergente) y una **Consola Exclusiva de Super Administrador** protegida por contraseña.

---

## Tabla de Contenidos

1. [Resumen Ejecutivo y Pilares Visuales](#1-resumen-ejecutivo-y-pilares-visuales)
2. [Enrutamiento y Seguridad en Producción](#2-enrutamiento-y-seguridad-en-producción)
3. [Consola Exclusiva de Super Administrador (`/admin`)](#3-consola-exclusiva-de-super-administrador-admin)
4. [Configuración de Inicio de Sesión con Google (OAuth 2.0)](#4-configuración-de-inicio-de-sesión-con-google-oauth-20)
5. [Catálogo Oficial de las 16 Redes Sociales](#5-catálogo-oficial-de-las-16-redes-sociales)
6. [Instalación, Variables de Entorno y Despliegue en Vercel](#6-instalación-variables-de-entorno-y-despliegue-en-vercel)

---

## 1. Resumen Ejecutivo y Pilares Visuales

A diferencia de otras herramientas saturadas de bloques complejos, **LinkPortfolio** se enfoca en la simplicidad extrema, el alto contraste editorial y la velocidad de configuración, componiéndose únicamente de **tres pilares visuales**:

1. **Foto de perfil del usuario:** Imagen principal circular centrada en la parte superior del portafolio con herramienta de recorte 1:1 integrada y compresión automática a formato **WebP**.
2. **Fondo personalizable:** Eligiendo estrictamente entre dos modalidades excluyentes:
   - **Modo Fondo Negro (`#000000`):** Lienzo negro puro de alto contraste (opción predeterminada).
   - **Modo Foto Personalizada:** Fotografía cargada por el usuario que cubre el 100% de la pantalla, acompañada de un filtro de oscurecimiento (*overlay* ajustable de `0%` a `80%`) y botones con acabado *glassmorphism*.
3. **Directorio de redes sociales:** Donde todas las plataformas son opcionales (activables mediante interruptores maestros) y cada una admite **múltiples perfiles o enlaces (Relación 1 a N)** con etiquetas personalizadas.

---

## 2. Enrutamiento y Seguridad en Producción

- **Ruta Raíz (`/`) Directa a Inicio de Sesión y Registro:** Al visitar el dominio principal (`/`), la aplicación presenta directamente la pantalla de **Iniciar Sesión o Crear Cuenta**, sin exponer ni mencionar ningún perfil preexistente.
- **Rutas Públicas de Perfiles (`/<slug>` o `/?u=<slug>`):** Cualquier visitante que ingrese a la URL pública de un portafolio activo verá únicamente el perfil público limpio sin botones de edición ni controles administrativos.
- **Aislamiento Multi-Cuenta y Perfiles Protegidos (`is_protected: true`):**
  - Cada cuenta registrada únicamente tiene permisos sobre su propio portafolio.
  - Los perfiles con candado de protección activo no pueden ser reclamados ni eliminados por terceros.

---

## 3. Consola Exclusiva de Super Administrador (`/admin`)

Accede entrando a `/admin` o `/?mode=admin` (o desde el botón **Admin** en la cabecera).

- **Bloqueo Estricto por Contraseña:** Requiere el correo del administrador y la contraseña maestra (con protección contra fuerza bruta que bloquea temporalmente el acceso tras 5 intentos fallidos).
- **Funciones CRUD Completas sobre Todos los Perfiles:**
  1. **Añadir (`+ Añadir Nuevo Perfil`):** Crea portafolios nuevos definiendo su `slug`, nombre visible, correo del propietario, contraseña y candado de protección.
  2. **Modificar Diseño y Redes (`Modificar`):** Abre cualquier perfil del sistema dentro del **Editor Completo** (Foto 1:1, Fondo, Oscurecimiento y las 16 Redes Sociales con múltiples perfiles).
  3. **Actualizar Credenciales y Ruta (`Credenciales`):** Cambia el `slug`, el correo autorizado (para Login y Google OAuth 2.0), la contraseña del propietario o el estado del candado de protección.
  4. **Eliminar (`Eliminar`):** Permite borrar perfiles con confirmación de seguridad (impidiendo borrar perfiles con candado activo a menos que se desbloquee explícitamente).

---

## 4. Configuración de Inicio de Sesión con Google (OAuth 2.0)

El proyecto integra el SDK oficial **Google Identity Services (OAuth 2.0)** (`https://accounts.google.com/gsi/client`) e incluye un **monitor de foco y estado de ventana emergente** (`error_callback` + eventos `window.focus` y `visibilitychange`) que restablece automáticamente el botón si el usuario cierra el popup sin elegir cuenta.

Para activarlo con tu proyecto de Google Cloud:

1. Entra a [Google Cloud Console — Credentials](https://console.cloud.google.com/apis/credentials).
2. Crea un proyecto (o selecciona uno existente) y configura la **Pantalla de consentimiento de OAuth** (*OAuth consent screen*).
3. Ve a **Credenciales** → **+ Crear credenciales** → **ID de cliente de OAuth** (*OAuth client ID*) de tipo **Aplicación web**.
4. En **Orígenes de JavaScript autorizados** (*Authorized JavaScript origins*), agrega:
   - `http://localhost:5173` (para desarrollo local)
   - `https://tu-dominio.vercel.app` (el dominio de producción)
5. Copia el **ID de cliente** generado (`xxxx.apps.googleusercontent.com`) y configúralo en `VITE_GOOGLE_CLIENT_ID` o desde `/admin` en la pestaña **Google OAuth 2.0**.

---

## 5. Catálogo Oficial de las 16 Redes Sociales

LinkPortfolio admite **16 plataformas sociales oficiales**, cada una con validación de URL/username, autocompletado de prefijo y soporte para enlaces múltiples ilimitados:

| Plataforma | Identificador | Formato de Enlace / Validación |
| :--- | :--- | :--- |
| **Instagram** | `INSTAGRAM` | URL completa (`https://www.instagram.com/...`) o `@usuario` |
| **TikTok** | `TIKTOK` | URL completa (`https://www.tiktok.com/@...`) o `@usuario` |
| **Facebook** | `FACEBOOK` | URL de perfil, página, grupo o enlace compartido (`https://www.facebook.com/...`) |
| **X (antes Twitter)** | `X` | URL completa (`https://x.com/...`) o `@usuario` |
| **YouTube** | `YOUTUBE` | URL de canal (`https://www.youtube.com/@...`) o `@canal` |
| **Threads** | `THREADS` | URL completa (`https://www.threads.com/@...`) o `@usuario` |
| **WhatsApp** | `WHATSAPP` | Selector de lada internacional + número telefónico (genera `https://wa.me/...`) o enlace directo |
| **GitHub** | `GITHUB` | URL completa (`https://github.com/...`) o `@usuario` |
| **Pinterest** | `PINTEREST` | URL completa (`https://pinterest.com/...`) o `@usuario` |
| **Reddit** | `REDDIT` | URL de perfil / comunidad (`https://reddit.com/u/...` o `https://reddit.com/r/...`) o `u/usuario` / `r/comunidad` |
| **Twitch** | `TWITCH` | URL de canal (`https://twitch.tv/...`) o `usuario` |
| **Discord** | `DISCORD` | URL de servidor o invitación (`https://discord.gg/...`, `https://discord.com/invite/...`) o `nombre#0000` |
| **WeChat** | `WECHAT` | URL de perfil (`https://weixin.qq.com/...`) o `ID WeChat` |
| **BeReal** | `BEREAL` | URL de perfil (`https://bere.al/...`) o `@usuario` |
| **Tumblr** | `TUMBLR` | URL de blog (`https://...tumblr.com`) o `@blog` |
| **Kwai** | `KWAI` | URL de perfil (`https://kwai.com/@...`) o `@usuario` |

---

## 6. Instalación, Variables de Entorno y Despliegue en Vercel

```bash
# 1. Instalar dependencias
npm install

# 2. (Opcional) Crear archivo .env a partir de .env.example
cp .env.example .env

# 3. Iniciar en desarrollo
npm run dev

# 4. Compilar para producción
npm run build
```

### Despliegue en Vercel
1. Entra a [vercel.com](https://vercel.com/) e importa el repositorio `AxelLangle/CreadorPortafoliosWeb`.
2. Configura las variables de entorno definidas en `.env.example`.
3. Haz clic en **Deploy** para obtener tu URL pública con HTTPS.
