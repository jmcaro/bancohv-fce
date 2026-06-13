# 📋 Banco de Hojas de Vida — FCE

> Sistema de gestión de talento humano para la **Facultad de Ciencias Económicas** de la Universidad del Atlántico. Conecta a estudiantes y egresados con oportunidades laborales gestionadas por el área de Prácticas Profesionales.

---

## ✨ Funcionalidades principales

- **Autenticación segura** con Google OAuth 2.0 restringida a correos `@uniatlantico.edu.co`
- **Hoja de vida digital** con foto, experiencia, educación, habilidades, idiomas y documentos adjuntos
- **Bolsa de empleo** — exploración y postulación a vacantes activas
- **Gestión de empresas y vacantes** por el Líder de Prácticas
- **Panel administrativo** con estadísticas, gestión de usuarios y moderación
- **Sistema de roles múltiples** — un usuario puede tener varios roles y cambiar entre ellos en sesión
- **Mensajes de retroalimentación** al aceptar o rechazar postulaciones
- **Vista de perfil del candidato** para Líder de Prácticas y Administrador

---

## 🛠️ Stack tecnológico

| Capa | Tecnología |
|------|-----------|
| Runtime | Node.js v20+ |
| Lenguaje | TypeScript 5 |
| Framework | Express.js 4 |
| Plantillas | EJS (SSR) |
| Estilos | Tailwind CSS 3 |
| ORM | Prisma 6 |
| Base de datos | PostgreSQL 16 |
| Autenticación | Passport.js + Google OAuth 2.0 |
| Sesiones | express-session + connect-pg-simple |
| Archivos | Multer |
| Validación | Zod |

---

## 🚀 Instalación y configuración local

### 1. Prerrequisitos

- Node.js v20 o superior
- PostgreSQL 14 o superior
- Una cuenta en [Google Cloud Console](https://console.cloud.google.com) con OAuth 2.0 configurado

### 2. Clonar el repositorio

```bash
git clone https://github.com/TU_USUARIO/bancohv-fce.git
cd bancohv-fce
```

### 3. Instalar dependencias

```bash
npm install
```

### 4. Configurar variables de entorno

Copia el archivo de ejemplo y completa los valores:

```bash
cp .env.example .env
```

Edita `.env` con tus credenciales:

```env
DATABASE_URL="postgresql://USUARIO@localhost:5432/bancohv_fce"
GOOGLE_CLIENT_ID="tu-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="tu-client-secret"
GOOGLE_CALLBACK_URL="http://localhost:3000/auth/google/callback"
SESSION_SECRET="una-clave-secreta-larga-y-aleatoria"
UPLOAD_DIR="uploads"
PORT=3000
```

### 5. Crear la base de datos

```bash
psql -U postgres -c "CREATE DATABASE bancohv_fce;"
```

### 6. Aplicar el esquema y generar el cliente Prisma

```bash
npx prisma migrate deploy
npx prisma generate
```

### 7. Compilar los estilos

```bash
npm run css
```

### 8. Iniciar en modo desarrollo

```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:3000`.

> **Nota:** Para recompilar los estilos Tailwind mientras desarrollas, ejecuta `npm run css` en una terminal separada.

---

## 📁 Estructura del proyecto

```
bancohv-fce/
├── prisma/
│   └── schema.prisma          # Esquema de base de datos
├── scripts/
│   ├── generate-manual.mjs    # Genera el Manual de Usuario en PDF
│   └── generate-descripcion.mjs # Genera el Documento de Descripción en PDF
├── src/
│   ├── config/
│   │   └── passport.ts        # Estrategia Google OAuth 2.0
│   ├── controllers/
│   │   ├── admin.controller.ts
│   │   ├── cv.controller.ts
│   │   └── vacancy.controller.ts
│   ├── middlewares/
│   │   └── auth.middleware.ts # requireAuth, requireRole, getActiveRole
│   ├── routes/
│   │   ├── admin.routes.ts
│   │   ├── auth.routes.ts
│   │   ├── company.routes.ts
│   │   ├── cv.routes.ts
│   │   ├── role.routes.ts
│   │   └── vacancy.routes.ts
│   ├── utils/
│   │   └── auth.ts            # Validación de dominio institucional
│   ├── public/
│   │   └── css/styles.css     # Tailwind compilado
│   ├── views/
│   │   ├── partials/          # navbar.ejs, footer.ejs
│   │   └── pages/             # Vistas por módulo
│   └── app.ts                 # Punto de entrada
├── uploads/                   # Archivos subidos (no versionado)
├── .env.example
├── tailwind.config.js
├── tsconfig.json
└── package.json
```

---

## 👥 Roles del sistema

| Rol | Descripción | Permisos principales |
|-----|-------------|---------------------|
| `STUDENT` | Estudiante o egresado | Crear HV, explorar y postularse a vacantes |
| `LIDER` | Líder de Prácticas FCE | Gestionar empresas, publicar vacantes, revisar candidatos |
| `ADMIN` | Administrador del sistema | Acceso completo + gestión de usuarios y roles |

Un usuario puede tener **múltiples roles simultáneos** y cambiar entre ellos desde la barra de navegación.

---

## 📜 Scripts disponibles

```bash
npm run dev       # Servidor en modo desarrollo (tsx watch)
npm run css       # Compilar Tailwind CSS
npm run build     # Compilar TypeScript + CSS para producción
npm start         # Iniciar servidor compilado (producción)
```

---

## 🔐 Requisitos de acceso

Solo se permiten correos institucionales de la Universidad del Atlántico:

- `@uniatlantico.edu.co`
- `@mail.uniatlantico.edu.co`
- `@est.uniatlantico.edu.co`
- Cualquier subdominio de `uniatlantico.edu.co`

---

## 📄 Documentación

Los documentos del proyecto se generan automáticamente con Puppeteer:

```bash
node scripts/generate-manual.mjs       # Manual de Usuario (PDF)
node scripts/generate-descripcion.mjs  # Descripción del Sistema (PDF)
```

---

## 🎨 Identidad visual

La interfaz aplica los colores oficiales del **Manual de Identidad Visual UA 2024** (Resolución Rectoral 001536):

| Color | HEX | Uso |
|-------|-----|-----|
| Azul marino primario | `#143163` | Navbar, encabezados, botones principales |
| Naranja primario | `#D85819` | Acentos, bordes, botones de acción |
| Azul medio | `#1D71B8` | Hover, enlaces secundarios |
| Naranja dorado | `#FF9912` | Elementos destacados |

---

## 📦 Variables de entorno — `.env.example`

```env
DATABASE_URL="postgresql://USUARIO@localhost:5432/bancohv_fce"
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
GOOGLE_CALLBACK_URL="http://localhost:3000/auth/google/callback"
SESSION_SECRET=""
UPLOAD_DIR="uploads"
PORT=3000
```

---

## 🏛️ Institución

**Facultad de Ciencias Económicas**  
Universidad del Atlántico — Barranquilla, Colombia  
[www.uniatlantico.edu.co](https://www.uniatlantico.edu.co)
