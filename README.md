# LinkPortfolio — Herramienta de Creación de Portafolios Web (`@its.araaaby`)

Plataforma web minimalista estilo **Link-in-Bio** preparada para **producción**, diseñada bajo el sistema de diseño **Obsidian Bio** (generado con **Google Stitch AI** en el proyecto *"LinkPortfolio Mobile Onboarding"*). Cuenta con **aislamiento estricto entre cuentas**, **protección dedicada para el perfil `@its.araaaby`**, **inicio de sesión real con Google OAuth 2.0** y una **Consola Exclusiva de Super Administrador** protegida por contraseña.

---

## Tabla de Contenidos

1. [Resumen Ejecutivo y Pilares Visuales](#1-resumen-ejecutivo-y-pilares-visuales)
2. [Seguridad en Producción y Aislamiento de Cuentas](#2-seguridad-en-producción-y-aislamiento-de-cuentas)
3. [Consola Exclusiva de Super Administrador (`/admin`)](#3-consola-exclusiva-de-super-administrador-admin)
4. [Configuración de Inicio de Sesión con Google (OAuth 2.0)](#4-configuración-de-inicio-de-sesión-con-google-oauth-20)
5. [Catálogo Oficial de las 7 Redes Sociales](#5-catálogo-oficial-de-las-7-redes-sociales)
6. [Primer Portafolio Configurado y Protegido: `@its.araaaby`](#6-primer-portafolio-configurado-y-protegido-itsaraaaby)
7. [Instalación, Variables de Entorno y Despliegue en Vercel](#7-instalación-variables-de-entorno-y-despliegue-en-vercel)

---

## 1. Resumen Ejecutivo y Pilares Visuales

A diferencia de otras herramientas saturadas de bloques complejos, **LinkPortfolio** se enfoca en la simplicidad extrema, el alto contraste editorial y la velocidad de configuración, componiéndose únicamente de **tres pilares visuales**:

1. **Foto de perfil del usuario:** Imagen principal circular centrada en la parte superior del portafolio con herramienta de recorte 1:1 integrada y compresión automática a formato **WebP**.
2. **Fondo personalizable:** Eligiendo estrictamente entre dos modalidades excluyentes:
   - **Modo Fondo Negro (`#000000`):** Lienzo negro puro de alto contraste (opción predeterminada).
   - **Modo Foto Personalizada:** Fotografía cargada por el usuario que cubre el 100% de la pantalla, acompañada de un filtro de oscurecimiento (*overlay* ajustable de `0%` a `80%`) y botones con acabado *glassmorphism*.
3. **Directorio de redes sociales:** Donde todas las plataformas son opcionales (activables mediante interruptores maestros) y cada una admite **múltiples perfiles o enlaces (Relación 1 a N)** con etiquetas personalizadas.

---

## 2. Seguridad en Producción y Aislamiento de Cuentas

Para garantizar que ningún visitante pueda modificar perfiles ajenos cuando el proyecto esté desplegado en producción:

- **Vista Pública 100% Limpia y Bloqueada:** Cualquier persona que entre al enlace público (`/` o `/its.araaaby` o `/?u=its.araaaby`) verá **únicamente** el portafolio público de `@its.araaaby` sin ningún botón de edición ni controles de configuración.
- **Protección Especial sobre `@its.araaaby` (`is_protected: true`):**
  - El identificador `its.araaaby` está bloqueado contra reclamos de terceros en el formulario de registro.
  - Cuenta con un candado contra eliminación accidental incluso dentro del panel administrativo.
  - Solo puede ser editado iniciando sesión con las credenciales de su propietaria o desde la cuenta del **Super Administrador**.
- **Aislamiento Multi-Cuenta:** Si un usuario externo crea una cuenta nueva o inicia sesión con su propia cuenta de Google, el sistema le genera un portafolio independiente bajo su propio `slug` sin tener acceso ni visibilidad de edición sobre `@its.araaaby` ni sobre otros perfiles.

---

## 3. Consola Exclusiva de Super Administrador (`/admin`)

Accede entrando a `/admin` o `/?mode=admin` (o desde el botón **Admin** en la pantalla de inicio de sesión).

- **Bloqueo Estricto por Contraseña:** Requiere el correo del administrador y la contraseña maestra (con protección contra fuerza bruta que bloquea temporalmente el acceso tras 5 intentos fallidos).
- **Funciones CRUD Completas sobre Todos los Perfiles:**
  1. **Añadir (`+ Añadir Nuevo Perfil`):** Crea portafolios nuevos definiendo su `slug`, nombre visible, correo del propietario, contraseña y candado de protección.
  2. **Modificar Diseño y Redes (`Modificar`):** Abre cualquier perfil del sistema dentro del **Editor Completo** (Foto 1:1, Fondo, Oscurecimiento y las 7 Redes Sociales con múltiples perfiles).
  3. **Actualizar Credenciales y Ruta (`Credenciales`):** Cambia el `slug`, el correo autorizado (para Login y Google OAuth 2.0), la contraseña del propietario o el estado del candado de protección.
  4. **Eliminar (`Eliminar`):** Permite borrar perfiles con confirmación de seguridad (impidiendo borrar perfiles con candado activo como `@its.araaaby` a menos que se desbloquee explícitamente).
  5. **Portafolio Principal de Raíz (`/`):** Permite elegir qué perfil se muestra por defecto en el dominio principal (configurado por defecto en `@its.araaaby`).

---

## 4. Configuración de Inicio de Sesión con Google (OAuth 2.0)

El proyecto integra el SDK oficial **Google Identity Services (OAuth 2.0)** (`https://accounts.google.com/gsi/client`). Para activarlo con tu propio proyecto de Google Cloud:

1. Entra a [Google Cloud Console — Credentials](https://console.cloud.google.com/apis/credentials).
2. Crea un proyecto (o selecciona uno existente) y ve a **Pantalla de consentimiento de OAuth** (*OAuth consent screen*), eligiendo tipo **Externo** (*External*).
3. Ve a **Credenciales** → **+ Crear credenciales** → **ID de cliente de OAuth** (*OAuth client ID*).
4. En **Tipo de aplicación**, selecciona **Aplicación web** (*Web application*).
5. En **Orígenes de JavaScript autorizados** (*Authorized JavaScript origins*), agrega:
   - `http://localhost:5173` (para pruebas locales)
   - `https://tu-dominio.vercel.app` (el dominio que te asigne Vercel al desplegar)
6. Copia el **ID de cliente** generado (`xxxx.apps.googleusercontent.com`) y configúralo de cualquiera de estas dos formas:
   - **En Vercel / `.env`:** En la variable `VITE_GOOGLE_CLIENT_ID=xxxx.apps.googleusercontent.com`.
   - **Desde el Panel de Administrador (`/admin`):** En la pestaña **Google OAuth 2.0**, pégalo y haz clic en **Guardar Client ID**.

---

## 5. Catálogo Oficial de las 7 Redes Sociales

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

## 6. Primer Portafolio Configurado y Protegido: `@its.araaaby`

- **Identificador de usuario (`slug`):** `its.araaaby` (Portafolio principal en `/`)
- **Foto de perfil:** `/public/avatar-its-araaaby.jpeg`
- **Redes Sociales Activas:**
  - **Facebook:** `https://www.facebook.com/share/1C7WpHJvRK/?mibextid=wwXIfr`
  - **Instagram personal:** `https://www.instagram.com/its.araaaby?vrfl=cDFzMm1jb2N3Ynpo&utm_source=qr`
  - **Ig Coach:** `https://www.instagram.com/afit.araa?psln=MTQ2ODB4Ymc1NTUxYw%3D%3D&utm_source=qr`
  - **Ig Nails:** `https://www.instagram.com/araaanails_?cplk=MXhtbWdvZWNnZjhwOA%3D%3D&utm_source=qr`
  - **X:** `https://x.com/diaz37586?s=11`
  - **Threads:** `https://www.threads.com/@araaa.by_?igshid=NTc4MTIwNjQ2YQ==`

---

## 7. Instalación, Variables de Entorno y Despliegue en Vercel

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

### Despliegue Rápido en Vercel (Recomendado para Producción 24/7)
1. Entra a [vercel.com](https://vercel.com/) e inicia sesión con tu cuenta de GitHub.
2. Haz clic en **"Add New..." → "Project"** e importa el repositorio `AxelLangle/CreadorPortafoliosWeb`.
3. En la sección **Environment Variables**, agrega tus variables (`VITE_ADMIN_EMAIL`, `VITE_ADMIN_PASSWORD`, `VITE_ARAAABY_OWNER_EMAIL`, `VITE_ARAAABY_OWNER_PASSWORD`, `VITE_GOOGLE_CLIENT_ID`).
4. Haz clic en **Deploy**. En menos de 60 segundos tendrás tu URL pública con HTTPS lista para colocar en la biografía de las redes sociales de `@its.araaaby`.
