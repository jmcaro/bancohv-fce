import puppeteer from 'puppeteer'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const html = `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8"/>
<style>
  * { margin:0; padding:0; box-sizing:border-box; }

  :root {
    --azul:     #143163;
    --naranja:  #D85819;
    --azul-m:   #1D71B8;
    --amarillo: #F9B233;
    --gris:     #706F6F;
    --bg:       #F4F6FA;
  }

  body {
    font-family: Tahoma, Candara, Arial, sans-serif;
    font-size: 10.5pt;
    color: #1A1A2E;
    background: #fff;
    line-height: 1.6;
  }

  /* ── PORTADA ── */
  .cover {
    page-break-after: always;
    min-height: 100vh;
    background: linear-gradient(160deg, var(--azul) 0%, #0d2047 100%);
    color: #fff;
    padding: 0;
    position: relative;
    display: flex;
    flex-direction: column;
  }
  .cover-accent {
    height: 6px;
    background: linear-gradient(90deg, var(--naranja), var(--amarillo));
  }
  .cover-body {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: 60px 70px;
  }
  .cover-tag {
    font-size: 8.5pt;
    letter-spacing: 2.5px;
    text-transform: uppercase;
    color: var(--amarillo);
    margin-bottom: 20px;
  }
  .cover h1 {
    font-size: 28pt;
    font-weight: bold;
    line-height: 1.2;
    margin-bottom: 12px;
  }
  .cover h1 span { color: var(--naranja); }
  .cover h2 {
    font-size: 13pt;
    color: rgba(255,255,255,0.75);
    font-weight: normal;
    margin-bottom: 40px;
  }
  .cover-divider {
    width: 60px;
    height: 3px;
    background: var(--naranja);
    margin-bottom: 32px;
  }
  .cover-meta {
    display: flex;
    gap: 40px;
    flex-wrap: wrap;
  }
  .cover-meta-item { font-size: 9pt; }
  .cover-meta-label { color: var(--amarillo); font-weight: bold; display: block; margin-bottom: 2px; font-size: 7.5pt; text-transform: uppercase; letter-spacing: 1px; }
  .cover-meta-val { color: rgba(255,255,255,0.9); }
  .cover-footer {
    padding: 20px 70px;
    font-size: 8.5pt;
    color: rgba(255,255,255,0.4);
    border-top: 1px solid rgba(255,255,255,0.1);
    display: flex;
    justify-content: space-between;
  }
  .cover-badge {
    position: absolute;
    top: 40px; right: 70px;
    width: 80px; height: 80px;
    background: var(--naranja);
    border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-size: 26pt; font-weight: bold; color: #fff;
  }

  /* ── PÁGINAS ── */
  .page {
    padding: 52px 70px 70px;
    page-break-after: always;
    position: relative;
  }
  .page:last-child { page-break-after: auto; }

  /* Cabecera de sección */
  .sh {
    display: flex;
    align-items: flex-start;
    gap: 16px;
    margin-bottom: 26px;
    padding-bottom: 12px;
    border-bottom: 3px solid var(--naranja);
  }
  .sh-icon {
    min-width: 48px; height: 48px;
    background: var(--azul);
    border-radius: 10px;
    display: flex; align-items: center; justify-content: center;
    font-size: 22px;
  }
  .sh-num { font-size: 8pt; color: var(--naranja); text-transform: uppercase; letter-spacing: 1.5px; font-weight: bold; }
  .sh-title { font-size: 17pt; font-weight: bold; color: var(--azul); line-height: 1.1; }

  /* Índice */
  .toc { padding: 52px 70px; page-break-after: always; }
  .toc h2 { font-size: 18pt; color: var(--azul); border-bottom: 3px solid var(--naranja); padding-bottom: 10px; margin-bottom: 30px; }
  .toc-row { display: flex; justify-content: space-between; align-items: baseline; padding: 8px 0; border-bottom: 1px dotted #ccc; }
  .toc-row a { color: var(--azul); font-weight: bold; font-size: 10.5pt; text-decoration: none; }
  .toc-row span { color: var(--gris); font-size: 9.5pt; }
  .toc-sub { padding-left: 18px; }
  .toc-sub a { font-weight: normal; color: #333; font-size: 10pt; }

  /* Tipografía general */
  h3 { font-size: 12.5pt; color: var(--azul); margin: 22px 0 10px; }
  h4 { font-size: 10.5pt; color: var(--naranja); margin: 16px 0 6px; font-weight: bold; }
  p  { margin-bottom: 10px; }
  ul, ol { margin: 0 0 12px 22px; }
  li { margin-bottom: 5px; }
  code { font-family: 'Courier New', monospace; font-size: 9.5pt; background: #eef2f7; padding: 1px 5px; border-radius: 3px; }
  hr  { border: none; border-top: 1px solid #e0e6ef; margin: 18px 0; }

  /* Cajas */
  .box {
    border-radius: 6px;
    padding: 13px 17px;
    margin: 14px 0;
    font-size: 10pt;
  }
  .box-blue   { background: #EBF2FB; border-left: 4px solid var(--azul-m); }
  .box-orange { background: #FFF4EE; border-left: 4px solid var(--naranja); }
  .box-green  { background: #EDFAF4; border-left: 4px solid #16A34A; }
  .box-label  { font-size: 8.5pt; font-weight: bold; color: var(--azul); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 5px; }

  /* Tabla */
  table { width: 100%; border-collapse: collapse; margin: 14px 0; font-size: 9.5pt; }
  th { background: var(--azul); color: #fff; padding: 8px 11px; text-align: left; font-weight: bold; font-size: 9pt; }
  td { padding: 7px 11px; border-bottom: 1px solid #e0e8f0; vertical-align: top; }
  tr:nth-child(even) td { background: var(--bg); }

  /* Grid */
  .grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin: 14px 0; }
  .grid3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 14px; margin: 14px 0; }
  .card {
    border: 1.5px solid #dde6f4;
    border-radius: 8px;
    padding: 14px 16px;
    background: #fff;
  }
  .card-icon { font-size: 22px; margin-bottom: 7px; }
  .card-title { font-weight: bold; color: var(--azul); font-size: 10pt; margin-bottom: 4px; }
  .card-desc { font-size: 9pt; color: var(--gris); line-height: 1.5; }

  /* Tech badges */
  .badge {
    display: inline-block;
    padding: 3px 10px;
    border-radius: 20px;
    font-size: 8.5pt;
    font-weight: bold;
    margin: 2px 3px;
  }
  .badge-blue   { background: #dbeafe; color: #1e40af; }
  .badge-green  { background: #dcfce7; color: #166534; }
  .badge-orange { background: #ffedd5; color: #9a3412; }
  .badge-purple { background: #ede9fe; color: #5b21b6; }
  .badge-gray   { background: #f1f5f9; color: #475569; }

  /* Diagrama de capas */
  .layer {
    display: flex; align-items: center; gap: 14px;
    background: #f8faff; border: 1.5px solid #d0daea;
    border-radius: 8px; padding: 13px 18px;
    margin-bottom: 8px;
  }
  .layer-num {
    min-width: 30px; height: 30px;
    background: var(--azul); color: #fff;
    border-radius: 50%; display: flex; align-items: center; justify-content: center;
    font-size: 10pt; font-weight: bold; flex-shrink: 0;
  }
  .layer-name { font-weight: bold; color: var(--azul); font-size: 10pt; min-width: 160px; }
  .layer-desc { font-size: 9.5pt; color: #444; }

  /* Entity */
  .entity {
    background: #fff; border: 2px solid var(--azul-m);
    border-radius: 8px; overflow: hidden; margin-bottom: 14px;
  }
  .entity-head {
    background: var(--azul); color: #fff;
    padding: 6px 12px; font-weight: bold; font-size: 9.5pt;
  }
  .entity-fields { padding: 8px 12px; }
  .entity-field { display: flex; gap: 8px; font-size: 9pt; padding: 3px 0; border-bottom: 1px solid #eef; }
  .entity-field:last-child { border-bottom: none; }
  .ef-name { font-weight: bold; color: #333; min-width: 120px; }
  .ef-type { color: var(--azul-m); font-family: monospace; font-size: 8.5pt; }
  .ef-desc { color: var(--gris); font-size: 8.5pt; }

  /* Flujo */
  .flow { display: flex; flex-direction: column; gap: 0; margin: 14px 0; }
  .flow-step { display: flex; align-items: flex-start; gap: 14px; position: relative; }
  .flow-left { display: flex; flex-direction: column; align-items: center; }
  .flow-num {
    min-width: 30px; height: 30px;
    background: var(--naranja); color: #fff; border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-size: 9.5pt; font-weight: bold; flex-shrink: 0;
  }
  .flow-line { width: 2px; flex: 1; background: #dde6f4; min-height: 18px; }
  .flow-body { padding-bottom: 18px; }
  .flow-body strong { color: var(--azul); }

  /* Página de header decorativo */
  .page-header-bar {
    height: 4px;
    background: linear-gradient(90deg, var(--azul), var(--azul-m));
    margin-bottom: 52px;
  }

  @page { margin: 0; size: A4 portrait; }
</style>
</head>
<body>

<!-- ══ PORTADA ══ -->
<div class="cover">
  <div class="cover-accent"></div>
  <div class="cover-body">
    <div class="cover-badge">UA</div>
    <div class="cover-tag">Documento de Descripción del Sistema · v1.0</div>
    <h1>Banco de<br/><span>Hojas de Vida</span></h1>
    <h2>Facultad de Ciencias Económicas<br/>Universidad del Atlántico</h2>
    <div class="cover-divider"></div>
    <div class="cover-meta">
      <div class="cover-meta-item">
        <span class="cover-meta-label">Cliente</span>
        <span class="cover-meta-val">FCE – Universidad del Atlántico</span>
      </div>
      <div class="cover-meta-item">
        <span class="cover-meta-label">Versión</span>
        <span class="cover-meta-val">1.0.0</span>
      </div>
      <div class="cover-meta-item">
        <span class="cover-meta-label">Fecha</span>
        <span class="cover-meta-val">Junio 2026</span>
      </div>
      <div class="cover-meta-item">
        <span class="cover-meta-label">Clasificación</span>
        <span class="cover-meta-val">Uso interno institucional</span>
      </div>
    </div>
  </div>
  <div class="cover-footer">
    <span>Banco de Hojas de Vida FCE · bancohv-fce v1.0.0</span>
    <span>www.uniatlantico.edu.co</span>
  </div>
</div>

<!-- ══ ÍNDICE ══ -->
<div class="toc">
  <h2>Tabla de Contenido</h2>
  <div class="toc-row"><a>1. Descripción General</a><span>3</span></div>
  <div class="toc-row toc-sub"><a>1.1 Propósito</a><span>3</span></div>
  <div class="toc-row toc-sub"><a>1.2 Alcance</a><span>3</span></div>
  <div class="toc-row toc-sub"><a>1.3 Contexto institucional</a><span>3</span></div>
  <div class="toc-row"><a>2. Funcionalidades del Sistema</a><span>4</span></div>
  <div class="toc-row toc-sub"><a>2.1 Módulo de Autenticación</a><span>4</span></div>
  <div class="toc-row toc-sub"><a>2.2 Módulo de Hoja de Vida</a><span>4</span></div>
  <div class="toc-row toc-sub"><a>2.3 Módulo de Vacantes y Postulaciones</a><span>4</span></div>
  <div class="toc-row toc-sub"><a>2.4 Módulo de Empresas</a><span>5</span></div>
  <div class="toc-row toc-sub"><a>2.5 Módulo Administrativo</a><span>5</span></div>
  <div class="toc-row toc-sub"><a>2.6 Sistema de Roles Múltiples</a><span>5</span></div>
  <div class="toc-row"><a>3. Arquitectura del Sistema</a><span>6</span></div>
  <div class="toc-row toc-sub"><a>3.1 Patrón arquitectónico</a><span>6</span></div>
  <div class="toc-row toc-sub"><a>3.2 Capas de la aplicación</a><span>6</span></div>
  <div class="toc-row toc-sub"><a>3.3 Flujo de una solicitud HTTP</a><span>6</span></div>
  <div class="toc-row"><a>4. Stack Tecnológico</a><span>7</span></div>
  <div class="toc-row"><a>5. Modelo de Datos</a><span>8</span></div>
  <div class="toc-row toc-sub"><a>5.1 Entidades principales</a><span>8</span></div>
  <div class="toc-row toc-sub"><a>5.2 Relaciones entre entidades</a><span>8</span></div>
  <div class="toc-row"><a>6. Seguridad y Control de Acceso</a><span>9</span></div>
  <div class="toc-row"><a>7. Gestión de Archivos</a><span>9</span></div>
  <div class="toc-row"><a>8. Estructura del Proyecto</a><span>10</span></div>
  <div class="toc-row"><a>9. Requisitos de Infraestructura</a><span>10</span></div>
  <div class="toc-row"><a>10. Identidad Visual</a><span>11</span></div>
</div>

<!-- ══ SEC 1 — DESCRIPCIÓN GENERAL ══ -->
<div class="page">
  <div class="page-header-bar"></div>
  <div class="sh">
    <div class="sh-icon">🎯</div>
    <div>
      <div class="sh-num">Sección 1</div>
      <div class="sh-title">Descripción General</div>
    </div>
  </div>

  <h3>1.1 Propósito</h3>
  <p>El <strong>Banco de Hojas de Vida FCE</strong> es una plataforma web de gestión de talento humano desarrollada para la <strong>Facultad de Ciencias Económicas de la Universidad del Atlántico</strong>. Su objetivo es centralizar y digitalizar el proceso de intermediación laboral entre estudiantes y egresados de la facultad y las empresas aliadas.</p>

  <p>El sistema permite a los candidatos construir su perfil profesional digital, explorar ofertas laborales y hacer seguimiento a sus postulaciones; mientras que el Líder de Prácticas gestiona las empresas y vacantes, y el Administrador controla los accesos y la operación global del sistema.</p>

  <h3>1.2 Alcance</h3>
  <div class="grid2">
    <div class="card">
      <div class="card-icon">✅</div>
      <div class="card-title">Incluye</div>
      <div class="card-desc">
        Registro de usuarios via Google OAuth institucional · Creación y edición de hoja de vida digital · Carga de archivos (foto, CV, certificados) · Publicación y consulta de vacantes · Sistema de postulaciones · Gestión de empresas aliadas · Panel administrativo con estadísticas · Sistema de roles múltiples por usuario · Mensajes en respuesta a candidaturas
      </div>
    </div>
    <div class="card">
      <div class="card-icon">❌</div>
      <div class="card-title">No incluye</div>
      <div class="card-desc">
        Pagos en línea · App móvil nativa · Integración con sistemas externos de RRHH · Sistema de video-entrevistas · Notificaciones por correo electrónico · Portal de autoservicio para empresas · Reportes avanzados de analítica · Inteligencia artificial para matching de candidatos
      </div>
    </div>
  </div>

  <h3>1.3 Contexto institucional</h3>
  <p>La Universidad del Atlántico, con sede en Barranquilla, Colombia, es una institución pública de educación superior acreditada de alta calidad. La Facultad de Ciencias Económicas requería un canal propio para conectar a su comunidad académica con el mercado laboral de la región Caribe, diferenciado del sistema central universitario.</p>

  <div class="box box-blue">
    <div class="box-label">ℹ️ Restricción de acceso</div>
    El sistema solo acepta cuentas de Google con correo institucional <code>@uniatlantico.edu.co</code> y todos sus subdominios (<code>@mail.uniatlantico.edu.co</code>, <code>@est.uniatlantico.edu.co</code>, etc.). Cuentas personales son rechazadas en el momento del login.
  </div>
</div>

<!-- ══ SEC 2 — FUNCIONALIDADES ══ -->
<div class="page">
  <div class="page-header-bar"></div>
  <div class="sh">
    <div class="sh-icon">⚡</div>
    <div>
      <div class="sh-num">Sección 2</div>
      <div class="sh-title">Funcionalidades del Sistema</div>
    </div>
  </div>

  <h3>2.1 Módulo de Autenticación</h3>
  <ul>
    <li>Inicio de sesión exclusivo mediante <strong>Google OAuth 2.0</strong>.</li>
    <li>Validación del dominio del correo electrónico en el servidor (no en el cliente).</li>
    <li>Creación automática del usuario en la primera autenticación exitosa.</li>
    <li>Gestión de sesiones seguras con <code>express-session</code> y almacenamiento en PostgreSQL.</li>
    <li>Cierre de sesión con destrucción de la sesión en el servidor.</li>
  </ul>

  <h3>2.2 Módulo de Hoja de Vida</h3>
  <p>Cada usuario dispone de una hoja de vida digital estructurada con las siguientes secciones:</p>
  <table>
    <thead><tr><th>Sección</th><th>Campos principales</th></tr></thead>
    <tbody>
      <tr><td><strong>Perfil general</strong></td><td>Resumen profesional, teléfono, ciudad, LinkedIn, portafolio web</td></tr>
      <tr><td><strong>Foto de perfil</strong></td><td>Imagen JPG/PNG/WEBP (máx. 5 MB) subida al servidor</td></tr>
      <tr><td><strong>CV adjunto</strong></td><td>Archivo PDF/DOC/DOCX descargable (máx. 10 MB)</td></tr>
      <tr><td><strong>Educación</strong></td><td>Institución, título, campo de estudio, año inicio/fin, en curso</td></tr>
      <tr><td><strong>Experiencia laboral</strong></td><td>Empresa, cargo, descripción, fecha inicio/fin, trabajo actual</td></tr>
      <tr><td><strong>Habilidades</strong></td><td>Nombre de la habilidad y nivel</td></tr>
      <tr><td><strong>Idiomas</strong></td><td>Nombre del idioma y nivel de dominio</td></tr>
      <tr><td><strong>Documentos</strong></td><td>Certificados, diplomas, referencias (PDF/JPG/PNG, máx. 10 MB c/u)</td></tr>
    </tbody>
  </table>

  <h3>2.3 Módulo de Vacantes y Postulaciones</h3>
  <ul>
    <li>Listado público (para usuarios autenticados) de vacantes activas con datos de empresa, área y modalidad.</li>
    <li>Vista de detalle de la vacante con requisitos, descripción y botón de postulación.</li>
    <li>Postulación con carta de presentación opcional. Una sola postulación por vacante por usuario.</li>
    <li>Panel personal <em>Mis Postulaciones</em> con estado actual (Pendiente / Aceptado / Rechazado).</li>
    <li>Mensaje de retroalimentación del Líder visible en la candidatura del estudiante.</li>
    <li>Estados de vacante: <strong>Abierta</strong>, <strong>Cerrada</strong>, <strong>Borrador</strong>.</li>
  </ul>

  <h3>2.4 Módulo de Empresas</h3>
  <ul>
    <li>Registro de empresas aliadas: nombre, NIT, sector, descripción, sitio web y logo.</li>
    <li>Las empresas <strong>no tienen acceso directo al sistema</strong>; son gestionadas por el Líder de Prácticas.</li>
    <li>Cada vacante está asociada a una empresa del catálogo.</li>
    <li>Todas las empresas registradas están disponibles al crear cualquier vacante.</li>
  </ul>

  <h3>2.5 Módulo Administrativo</h3>
  <ul>
    <li>Dashboard con métricas: usuarios, hojas de vida, vacantes activas, postulaciones totales.</li>
    <li>Listas recientes de usuarios y postulaciones para seguimiento.</li>
    <li>Gestión de usuarios: búsqueda, filtro por rol, asignación de múltiples roles, eliminación.</li>
    <li>Acceso a la hoja de vida de cualquier usuario del sistema.</li>
    <li>Moderación global de vacantes: visualización y eliminación de cualquier vacante.</li>
  </ul>

  <h3>2.6 Sistema de Roles Múltiples</h3>
  <p>Un usuario puede tener simultáneamente uno o más roles asignados. El rol activo en sesión determina la vista y el menú de navegación. El Administrador siempre mantiene acceso completo independientemente del rol activo seleccionado.</p>
</div>

<!-- ══ SEC 3 — ARQUITECTURA ══ -->
<div class="page">
  <div class="page-header-bar"></div>
  <div class="sh">
    <div class="sh-icon">🏗️</div>
    <div>
      <div class="sh-num">Sección 3</div>
      <div class="sh-title">Arquitectura del Sistema</div>
    </div>
  </div>

  <h3>3.1 Patrón arquitectónico</h3>
  <p>El sistema sigue una arquitectura <strong>monolítica de servidor con renderizado en el servidor (SSR)</strong>, implementada como una aplicación <strong>MVC</strong> (Modelo – Vista – Controlador) sobre Node.js.</p>

  <div class="box box-blue">
    <div class="box-label">Decisión de diseño</div>
    Se eligió la arquitectura monolítica SSR (en lugar de SPA + API REST) por simplicidad de despliegue, menor latencia en la carga inicial, mejor indexabilidad y reducción de la superficie de ataque. Para el volumen de usuarios esperado (cientos, no miles simultáneos), este modelo es óptimo.
  </div>

  <h3>3.2 Capas de la aplicación</h3>

  <div class="layer">
    <div class="layer-num">1</div>
    <div class="layer-name">Vista (Templates EJS)</div>
    <div class="layer-desc">Plantillas EJS renderizadas en el servidor. Incluyen partials reutilizables (navbar, footer). Los estilos se generan con Tailwind CSS compilado estáticamente.</div>
  </div>
  <div class="layer">
    <div class="layer-num">2</div>
    <div class="layer-name">Rutas (Express Router)</div>
    <div class="layer-desc">Define los endpoints HTTP. Aplica middlewares de autenticación y autorización por rol antes de llamar al controlador correspondiente.</div>
  </div>
  <div class="layer">
    <div class="layer-num">3</div>
    <div class="layer-name">Controladores</div>
    <div class="layer-desc">Lógica de negocio: valida entradas con Zod, coordina operaciones de la base de datos vía Prisma, gestiona archivos con Multer y renderiza la vista con datos.</div>
  </div>
  <div class="layer">
    <div class="layer-num">4</div>
    <div class="layer-name">ORM / Acceso a datos (Prisma)</div>
    <div class="layer-desc">Prisma Client genera queries tipadas hacia PostgreSQL. El esquema define modelos, relaciones y enums. Las migraciones se gestionan con SQL directo cuando los cambios son complejos.</div>
  </div>
  <div class="layer">
    <div class="layer-num">5</div>
    <div class="layer-name">Base de datos (PostgreSQL)</div>
    <div class="layer-desc">Almacena todos los datos del sistema. Las sesiones de usuario también se persisten en PostgreSQL mediante connect-pg-simple.</div>
  </div>

  <h3>3.3 Flujo de una solicitud HTTP</h3>
  <div class="flow">
    <div class="flow-step">
      <div class="flow-left"><div class="flow-num">1</div><div class="flow-line"></div></div>
      <div class="flow-body"><strong>Navegador</strong> — El usuario hace una acción (clic, envío de formulario). El navegador envía una petición HTTP al servidor.</div>
    </div>
    <div class="flow-step">
      <div class="flow-left"><div class="flow-num">2</div><div class="flow-line"></div></div>
      <div class="flow-body"><strong>Express + Middlewares</strong> — Se verifica la sesión (<code>express-session</code>), se restaura el usuario de la BD (<code>passport.session()</code>), se comprueba el rol activo.</div>
    </div>
    <div class="flow-step">
      <div class="flow-left"><div class="flow-num">3</div><div class="flow-line"></div></div>
      <div class="flow-body"><strong>Router</strong> — La URL coincide con una ruta. Si hay middleware de autorización (<code>requireRole</code>), se evalúa el rol antes de continuar.</div>
    </div>
    <div class="flow-step">
      <div class="flow-left"><div class="flow-num">4</div><div class="flow-line"></div></div>
      <div class="flow-body"><strong>Controlador</strong> — Valida el body con Zod, llama a Prisma para leer/escribir datos, procesa archivos si los hay (Multer).</div>
    </div>
    <div class="flow-step">
      <div class="flow-left"><div class="flow-num">5</div><div class="flow-line"></div></div>
      <div class="flow-body"><strong>Vista EJS</strong> — El controlador llama a <code>res.render()</code> con los datos. EJS compila el HTML y lo envía al cliente como respuesta.</div>
    </div>
    <div class="flow-step">
      <div class="flow-left"><div class="flow-num">6</div></div>
      <div class="flow-body"><strong>Navegador</strong> — Recibe el HTML completo y lo muestra. Para mutaciones (POST) se usa el patrón PRG (Post–Redirect–Get) para evitar reenvíos accidentales.</div>
    </div>
  </div>
</div>

<!-- ══ SEC 4 — STACK TECNOLÓGICO ══ -->
<div class="page">
  <div class="page-header-bar"></div>
  <div class="sh">
    <div class="sh-icon">🔧</div>
    <div>
      <div class="sh-num">Sección 4</div>
      <div class="sh-title">Stack Tecnológico</div>
    </div>
  </div>

  <table>
    <thead>
      <tr><th>Categoría</th><th>Tecnología</th><th>Versión</th><th>Propósito</th></tr>
    </thead>
    <tbody>
      <tr><td><strong>Runtime</strong></td><td>Node.js</td><td>v25+</td><td>Entorno de ejecución del servidor</td></tr>
      <tr><td><strong>Lenguaje</strong></td><td>TypeScript</td><td>5.4</td><td>Tipado estático, autocompletado, prevención de errores en tiempo de desarrollo</td></tr>
      <tr><td><strong>Framework web</strong></td><td>Express.js</td><td>4.19</td><td>Enrutamiento HTTP, middlewares, gestión de peticiones/respuestas</td></tr>
      <tr><td><strong>Motor de plantillas</strong></td><td>EJS</td><td>3.1</td><td>Renderizado HTML en el servidor con datos dinámicos</td></tr>
      <tr><td><strong>Estilos</strong></td><td>Tailwind CSS</td><td>3.4</td><td>Utility-first CSS, compilado como archivo estático</td></tr>
      <tr><td><strong>ORM</strong></td><td>Prisma</td><td>6.19</td><td>Acceso a base de datos con esquema tipado y migraciones</td></tr>
      <tr><td><strong>Base de datos</strong></td><td>PostgreSQL</td><td>16</td><td>Almacenamiento persistente de todos los datos del sistema</td></tr>
      <tr><td><strong>Autenticación</strong></td><td>Passport.js + Google OAuth 2.0</td><td>0.7</td><td>Login delegado a Google, validación de dominio institucional</td></tr>
      <tr><td><strong>Sesiones</strong></td><td>express-session + connect-pg-simple</td><td>1.18 / 9.0</td><td>Sesiones persistentes almacenadas en PostgreSQL</td></tr>
      <tr><td><strong>Carga de archivos</strong></td><td>Multer</td><td>1.4 LTS</td><td>Manejo de multipart/form-data, filtros de tipo y tamaño</td></tr>
      <tr><td><strong>Validación</strong></td><td>Zod</td><td>3.23</td><td>Validación y parseo de datos de formularios con tipos TypeScript</td></tr>
      <tr><td><strong>Variables de entorno</strong></td><td>dotenv</td><td>16.4</td><td>Carga de configuración desde archivo <code>.env</code></td></tr>
      <tr><td><strong>Dev: ejecución</strong></td><td>tsx</td><td>4.15</td><td>Ejecución directa de TypeScript sin compilar (modo desarrollo)</td></tr>
      <tr><td><strong>Dev: PDF</strong></td><td>Puppeteer</td><td>25.1</td><td>Generación de documentos PDF desde HTML (scripts internos)</td></tr>
    </tbody>
  </table>

  <h3>Etiquetas por categoría</h3>
  <p>
    <span class="badge badge-blue">Node.js v25</span>
    <span class="badge badge-blue">TypeScript 5.4</span>
    <span class="badge badge-blue">Express 4</span>
    <span class="badge badge-green">PostgreSQL 16</span>
    <span class="badge badge-green">Prisma 6</span>
    <span class="badge badge-orange">Google OAuth 2.0</span>
    <span class="badge badge-orange">Passport.js</span>
    <span class="badge badge-purple">Tailwind CSS 3</span>
    <span class="badge badge-purple">EJS</span>
    <span class="badge badge-gray">Multer</span>
    <span class="badge badge-gray">Zod</span>
    <span class="badge badge-gray">dotenv</span>
  </p>

  <div class="box box-orange" style="margin-top:18px;">
    <div class="box-label">⚠️ Nota de compatibilidad</div>
    Node.js v25 presenta incompatibilidades con algunas herramientas del ecosistema (<code>concurrently</code>, <code>prisma studio</code>). La compilación de Tailwind CSS se ejecuta como comando separado (<code>npm run css</code>). Los cambios complejos de esquema en base de datos se realizan con SQL directo seguido de <code>prisma generate</code>.
  </div>
</div>

<!-- ══ SEC 5 — MODELO DE DATOS ══ -->
<div class="page">
  <div class="page-header-bar"></div>
  <div class="sh">
    <div class="sh-icon">🗄️</div>
    <div>
      <div class="sh-num">Sección 5</div>
      <div class="sh-title">Modelo de Datos</div>
    </div>
  </div>

  <h3>5.1 Entidades principales</h3>

  <div class="grid2">
    <div class="entity">
      <div class="entity-head">👤 User (users)</div>
      <div class="entity-fields">
        <div class="entity-field"><span class="ef-name">id</span><span class="ef-type">String (cuid)</span><span class="ef-desc">PK</span></div>
        <div class="entity-field"><span class="ef-name">email</span><span class="ef-type">String</span><span class="ef-desc">único, correo institucional</span></div>
        <div class="entity-field"><span class="ef-name">name</span><span class="ef-type">String</span><span class="ef-desc">nombre completo de Google</span></div>
        <div class="entity-field"><span class="ef-name">photo</span><span class="ef-type">String?</span><span class="ef-desc">URL avatar de Google</span></div>
        <div class="entity-field"><span class="ef-name">roles</span><span class="ef-type">Role[]</span><span class="ef-desc">array: STUDENT|LIDER|ADMIN</span></div>
        <div class="entity-field"><span class="ef-name">googleId</span><span class="ef-type">String?</span><span class="ef-desc">ID único de Google</span></div>
      </div>
    </div>
    <div class="entity">
      <div class="entity-head">📄 CurriculumVitae</div>
      <div class="entity-fields">
        <div class="entity-field"><span class="ef-name">userId</span><span class="ef-type">String</span><span class="ef-desc">FK → User (1:1)</span></div>
        <div class="entity-field"><span class="ef-name">summary</span><span class="ef-type">String?</span><span class="ef-desc">resumen profesional</span></div>
        <div class="entity-field"><span class="ef-name">phone</span><span class="ef-type">String?</span><span class="ef-desc">teléfono de contacto</span></div>
        <div class="entity-field"><span class="ef-name">city</span><span class="ef-type">String?</span><span class="ef-desc">ciudad de residencia</span></div>
        <div class="entity-field"><span class="ef-name">cvFileUrl</span><span class="ef-type">String?</span><span class="ef-desc">ruta del PDF/Word subido</span></div>
        <div class="entity-field"><span class="ef-name">photoUrl</span><span class="ef-type">String?</span><span class="ef-desc">foto de perfil subida</span></div>
      </div>
    </div>
    <div class="entity">
      <div class="entity-head">🏢 Company (companies)</div>
      <div class="entity-fields">
        <div class="entity-field"><span class="ef-name">userId</span><span class="ef-type">String</span><span class="ef-desc">FK → User (quién la registró)</span></div>
        <div class="entity-field"><span class="ef-name">name</span><span class="ef-type">String</span><span class="ef-desc">razón social</span></div>
        <div class="entity-field"><span class="ef-name">nit</span><span class="ef-type">String?</span><span class="ef-desc">NIT de la empresa</span></div>
        <div class="entity-field"><span class="ef-name">sector</span><span class="ef-type">String?</span><span class="ef-desc">sector económico</span></div>
        <div class="entity-field"><span class="ef-name">logoUrl</span><span class="ef-type">String?</span><span class="ef-desc">ruta del logo</span></div>
        <div class="entity-field"><span class="ef-name">website</span><span class="ef-type">String?</span><span class="ef-desc">sitio web</span></div>
      </div>
    </div>
    <div class="entity">
      <div class="entity-head">💼 Vacancy (vacancies)</div>
      <div class="entity-fields">
        <div class="entity-field"><span class="ef-name">companyId</span><span class="ef-type">String</span><span class="ef-desc">FK → Company</span></div>
        <div class="entity-field"><span class="ef-name">title</span><span class="ef-type">String</span><span class="ef-desc">título del cargo</span></div>
        <div class="entity-field"><span class="ef-name">area</span><span class="ef-type">String</span><span class="ef-desc">área de la vacante</span></div>
        <div class="entity-field"><span class="ef-name">type</span><span class="ef-type">String</span><span class="ef-desc">modalidad (TC, MT, práctica…)</span></div>
        <div class="entity-field"><span class="ef-name">status</span><span class="ef-type">VacancyStatus</span><span class="ef-desc">OPEN | CLOSED | DRAFT</span></div>
        <div class="entity-field"><span class="ef-name">salary</span><span class="ef-type">String?</span><span class="ef-desc">rango salarial (opcional)</span></div>
      </div>
    </div>
  </div>

  <div class="entity" style="margin-top:0;">
    <div class="entity-head">📬 Application (applications)</div>
    <div class="entity-fields" style="display:flex;flex-wrap:wrap;gap:0;">
      <div class="entity-field" style="width:50%"><span class="ef-name">userId</span><span class="ef-type">String</span><span class="ef-desc">FK → User</span></div>
      <div class="entity-field" style="width:50%"><span class="ef-name">vacancyId</span><span class="ef-type">String</span><span class="ef-desc">FK → Vacancy · unique(userId+vacancyId)</span></div>
      <div class="entity-field" style="width:50%"><span class="ef-name">status</span><span class="ef-type">ApplicationStatus</span><span class="ef-desc">PENDING | REVIEWED | ACCEPTED | REJECTED</span></div>
      <div class="entity-field" style="width:50%"><span class="ef-name">coverLetter</span><span class="ef-type">String?</span><span class="ef-desc">carta de presentación del candidato</span></div>
      <div class="entity-field" style="width:50%"><span class="ef-name">message</span><span class="ef-type">String?</span><span class="ef-desc">mensaje del Líder al candidato</span></div>
      <div class="entity-field" style="width:50%"><span class="ef-name">appliedAt</span><span class="ef-type">DateTime</span><span class="ef-desc">fecha de postulación</span></div>
    </div>
  </div>

  <h3>5.2 Relaciones entre entidades</h3>
  <table>
    <thead><tr><th>Relación</th><th>Tipo</th><th>Detalle</th></tr></thead>
    <tbody>
      <tr><td>User → CurriculumVitae</td><td>1 : 0..1</td><td>Cada usuario tiene como máximo una HV. Cascade delete.</td></tr>
      <tr><td>User → Company</td><td>1 : 0..1</td><td>Un usuario Líder puede crear una empresa. Cascade delete.</td></tr>
      <tr><td>Company → Vacancy</td><td>1 : N</td><td>Una empresa tiene múltiples vacantes. Cascade delete.</td></tr>
      <tr><td>CurriculumVitae → Education/Experience/Skill/Language/Document</td><td>1 : N</td><td>La HV tiene múltiples entradas por sección. Cascade delete.</td></tr>
      <tr><td>User → Application</td><td>1 : N</td><td>Un usuario puede postularse a varias vacantes.</td></tr>
      <tr><td>Vacancy → Application</td><td>1 : N</td><td>Una vacante tiene múltiples candidatos.</td></tr>
      <tr><td>User + Vacancy → Application</td><td>Unique</td><td>Restricción: máximo una postulación por usuario por vacante.</td></tr>
    </tbody>
  </table>
</div>

<!-- ══ SEC 6 — SEGURIDAD ══ -->
<div class="page">
  <div class="page-header-bar"></div>
  <div class="sh">
    <div class="sh-icon">🔐</div>
    <div>
      <div class="sh-num">Sección 6</div>
      <div class="sh-title">Seguridad y Control de Acceso</div>
    </div>
  </div>

  <h3>Autenticación</h3>
  <ul>
    <li><strong>Sin contraseñas propias</strong>: toda la autenticación se delega a Google OAuth 2.0, eliminando los riesgos de almacenamiento de contraseñas.</li>
    <li><strong>Validación de dominio</strong>: la función <code>isInstitutionalEmail()</code> verifica el dominio del correo en el callback de Google antes de crear o autenticar al usuario.</li>
    <li><strong>Sesiones firmadas</strong>: las sesiones usan un <code>SESSION_SECRET</code> configurado en variables de entorno. Se almacenan en PostgreSQL (no en memoria) para sobrevivir reinicios.</li>
  </ul>

  <h3>Autorización por roles</h3>
  <ul>
    <li>El middleware <code>requireRole(...roles)</code> protege cada ruta con los roles permitidos.</li>
    <li>El rol <strong>ADMIN</strong> siempre tiene acceso completo, independientemente del rol activo en sesión.</li>
    <li>El rol activo en sesión (<code>req.session.activeRole</code>) controla la vista del menú, no los permisos reales del servidor.</li>
    <li>Todas las verificaciones de permisos ocurren en el servidor, nunca solo en el cliente.</li>
  </ul>

  <h3>Protecciones adicionales</h3>
  <table>
    <thead><tr><th>Amenaza</th><th>Mitigación implementada</th></tr></thead>
    <tbody>
      <tr><td>SQL Injection</td><td>Prisma usa consultas parametrizadas. No hay SQL dinámico concatenado.</td></tr>
      <tr><td>XSS</td><td>EJS escapa por defecto las variables con <code>&lt;%= %&gt;</code>. El HTML sin escapar (<code>&lt;%-&gt;</code>) se usa solo en partials de confianza.</td></tr>
      <tr><td>Subida de archivos maliciosos</td><td>Multer filtra por <code>mimetype</code> y extensión. Hay límite de tamaño por tipo de archivo.</td></tr>
      <tr><td>Acceso no autenticado</td><td>El middleware <code>requireAuth</code> redirige a <code>/auth/login</code> si no hay sesión activa.</td></tr>
      <tr><td>Escalada de privilegios</td><td>Los roles solo los asigna el Administrador. No hay endpoint público para auto-asignación.</td></tr>
      <tr><td>Fijación de sesión</td><td>Passport regenera la sesión tras el login (<code>req.logIn</code> + <code>session.regenerate</code>).</td></tr>
    </tbody>
  </table>

  <div class="box box-orange" style="margin-top:8px;">
    <div class="box-label">⚠️ Pendiente para producción</div>
    Se recomienda agregar en producción: cabeceras de seguridad HTTP (Helmet.js), protección CSRF en formularios POST, límite de tasa en el endpoint de OAuth, y HTTPS obligatorio mediante un proxy inverso (nginx).
  </div>
</div>

<!-- ══ SEC 7 — ARCHIVOS ══ -->
<div class="page">
  <div class="page-header-bar"></div>
  <div class="sh">
    <div class="sh-icon">📁</div>
    <div>
      <div class="sh-num">Sección 7</div>
      <div class="sh-title">Gestión de Archivos</div>
    </div>
  </div>

  <p>El sistema gestiona la carga de archivos mediante <strong>Multer</strong>. Los archivos se almacenan en el servidor de forma local, en el directorio configurado por la variable de entorno <code>UPLOAD_DIR</code>.</p>

  <h3>Tipos de archivo por módulo</h3>
  <table>
    <thead><tr><th>Campo</th><th>Módulo</th><th>Formatos permitidos</th><th>Límite</th><th>Destino</th></tr></thead>
    <tbody>
      <tr><td>Foto de perfil de HV</td><td>Hoja de Vida</td><td>image/jpeg, image/png, image/webp</td><td>5 MB</td><td><code>uploads/photos/</code></td></tr>
      <tr><td>CV adjunto</td><td>Hoja de Vida</td><td>application/pdf, .doc, .docx</td><td>10 MB</td><td><code>uploads/cv/</code></td></tr>
      <tr><td>Documentos / certificados</td><td>Hoja de Vida</td><td>PDF, JPG, PNG</td><td>10 MB c/u</td><td><code>uploads/documents/</code></td></tr>
      <tr><td>Logo de empresa</td><td>Empresas</td><td>image/jpeg, image/png</td><td>5 MB</td><td><code>uploads/logos/</code></td></tr>
    </tbody>
  </table>

  <h3>Generación de nombres de archivo</h3>
  <p>Los nombres se generan con un UUID v4 + extensión original para evitar colisiones y ocultar nombres originales. El path relativo se guarda en la base de datos y se sirve como archivo estático bajo la ruta <code>/uploads/*</code>.</p>

  <div class="box box-blue">
    <div class="box-label">ℹ️ Recomendación para escala</div>
    En una instalación de producción con alto volumen de usuarios, se recomienda migrar el almacenamiento de archivos a un servicio de objetos externo (AWS S3, MinIO, Cloudflare R2) para desacoplar el almacenamiento del servidor de aplicación y facilitar la escalabilidad horizontal.
  </div>

  <h3>Archivos estáticos públicos</h3>
  <p>Además de los uploads, el servidor sirve los archivos estáticos de la carpeta <code>src/public/</code>:</p>
  <ul>
    <li><code>src/public/css/styles.css</code> — CSS compilado de Tailwind</li>
    <li><code>src/public/js/</code> — Scripts de cliente (mínimos)</li>
  </ul>
</div>

<!-- ══ SEC 8 — ESTRUCTURA ══ -->
<div class="page">
  <div class="page-header-bar"></div>
  <div class="sh">
    <div class="sh-icon">📂</div>
    <div>
      <div class="sh-num">Sección 8</div>
      <div class="sh-title">Estructura del Proyecto</div>
    </div>
  </div>

  <div style="font-family:'Courier New',monospace;font-size:9pt;line-height:1.8;background:#f8faff;border:1.5px solid #d0daea;border-radius:8px;padding:18px 20px;">
<span style="color:var(--azul);font-weight:bold;">bancohv-fce/</span>
├── <span style="color:var(--azul);">prisma/</span>
│   └── schema.prisma          <span style="color:var(--gris);"># Esquema de base de datos (Prisma ORM)</span>
├── <span style="color:var(--azul);">scripts/</span>
│   ├── generate-manual.mjs    <span style="color:var(--gris);"># Genera Manual de Usuario en PDF</span>
│   └── generate-descripcion.mjs <span style="color:var(--gris);"># Genera este documento en PDF</span>
├── <span style="color:var(--azul);">src/</span>
│   ├── <span style="color:var(--azul-m);">config/</span>
│   │   └── passport.ts        <span style="color:var(--gris);"># Estrategia Google OAuth 2.0</span>
│   ├── <span style="color:var(--azul-m);">controllers/</span>
│   │   ├── admin.controller.ts <span style="color:var(--gris);"># Dashboard, usuarios, roles, moderación</span>
│   │   ├── cv.controller.ts   <span style="color:var(--gris);"># CRUD hoja de vida y secciones</span>
│   │   └── vacancy.controller.ts <span style="color:var(--gris);"># Vacantes, empresas, postulaciones</span>
│   ├── <span style="color:var(--azul-m);">middlewares/</span>
│   │   └── auth.middleware.ts <span style="color:var(--gris);"># requireAuth, requireRole, getActiveRole</span>
│   ├── <span style="color:var(--azul-m);">routes/</span>
│   │   ├── admin.routes.ts    <span style="color:var(--gris);"># /admin/*</span>
│   │   ├── auth.routes.ts     <span style="color:var(--gris);"># /auth/google, /auth/callback, /auth/logout</span>
│   │   ├── company.routes.ts  <span style="color:var(--gris);"># /company/* (protegido: LIDER|ADMIN)</span>
│   │   ├── cv.routes.ts       <span style="color:var(--gris);"># /cv/*</span>
│   │   ├── role.routes.ts     <span style="color:var(--gris);"># /role/switch (cambio de rol activo)</span>
│   │   ├── vacancy.routes.ts  <span style="color:var(--gris);"># /vacancies/*</span>
│   │   └── index.ts           <span style="color:var(--gris);"># Composición de rutas en app</span>
│   ├── <span style="color:var(--azul-m);">utils/</span>
│   │   └── auth.ts            <span style="color:var(--gris);"># isInstitutionalEmail(), env validation</span>
│   ├── <span style="color:var(--azul-m);">public/</span>
│   │   └── css/styles.css     <span style="color:var(--gris);"># Tailwind compilado</span>
│   ├── <span style="color:var(--azul-m);">views/</span>
│   │   ├── partials/          <span style="color:var(--gris);"># navbar.ejs, footer.ejs</span>
│   │   └── pages/             <span style="color:var(--gris);"># auth/, cv/, dashboard/, vacancies/, company/, admin/</span>
│   └── app.ts                 <span style="color:var(--gris);"># Punto de entrada: Express, middlewares, rutas</span>
├── uploads/                   <span style="color:var(--gris);"># Archivos subidos por usuarios (fotos, CVs, docs)</span>
├── .env                       <span style="color:var(--gris);"># Variables de entorno (no versionado)</span>
├── tailwind.config.js         <span style="color:var(--gris);"># Colores institucionales UA 2024</span>
├── tsconfig.json
└── package.json
  </div>
</div>

<!-- ══ SEC 9 — INFRAESTRUCTURA ══ -->
<div class="page">
  <div class="page-header-bar"></div>
  <div class="sh">
    <div class="sh-icon">🖥️</div>
    <div>
      <div class="sh-num">Sección 9</div>
      <div class="sh-title">Requisitos de Infraestructura</div>
    </div>
  </div>

  <h3>Requisitos mínimos del servidor</h3>
  <table>
    <thead><tr><th>Componente</th><th>Mínimo</th><th>Recomendado</th></tr></thead>
    <tbody>
      <tr><td>CPU</td><td>1 vCPU</td><td>2 vCPU</td></tr>
      <tr><td>RAM</td><td>1 GB</td><td>2 GB</td></tr>
      <tr><td>Disco</td><td>20 GB</td><td>50 GB+ (para archivos de usuarios)</td></tr>
      <tr><td>Node.js</td><td>v20 LTS</td><td>v22 LTS</td></tr>
      <tr><td>PostgreSQL</td><td>14</td><td>16</td></tr>
      <tr><td>SO</td><td>Ubuntu 22.04</td><td>Ubuntu 24.04 LTS</td></tr>
    </tbody>
  </table>

  <h3>Variables de entorno requeridas</h3>
  <table>
    <thead><tr><th>Variable</th><th>Descripción</th></tr></thead>
    <tbody>
      <tr><td><code>DATABASE_URL</code></td><td>Cadena de conexión a PostgreSQL (<code>postgresql://user:pass@host:5432/db</code>)</td></tr>
      <tr><td><code>GOOGLE_CLIENT_ID</code></td><td>Client ID de la aplicación registrada en Google Cloud Console</td></tr>
      <tr><td><code>GOOGLE_CLIENT_SECRET</code></td><td>Client Secret de la aplicación de Google</td></tr>
      <tr><td><code>GOOGLE_CALLBACK_URL</code></td><td>URL de retorno OAuth (<code>https://dominio.com/auth/google/callback</code>)</td></tr>
      <tr><td><code>SESSION_SECRET</code></td><td>Clave secreta aleatoria para firmar sesiones (mín. 32 caracteres)</td></tr>
      <tr><td><code>UPLOAD_DIR</code></td><td>Ruta local para almacenar archivos subidos (ej. <code>uploads</code>)</td></tr>
      <tr><td><code>PORT</code></td><td>Puerto del servidor HTTP (por defecto: <code>3000</code>)</td></tr>
    </tbody>
  </table>

  <h3>Comandos de despliegue</h3>
  <div style="font-family:'Courier New',monospace;font-size:9pt;line-height:2;background:#f8faff;border:1.5px solid #d0daea;border-radius:8px;padding:16px 20px;">
    <span style="color:var(--gris)"># 1. Instalar dependencias</span><br/>
    npm install<br/><br/>
    <span style="color:var(--gris)"># 2. Generar cliente Prisma</span><br/>
    npx prisma generate<br/><br/>
    <span style="color:var(--gris)"># 3. Aplicar migraciones</span><br/>
    npx prisma migrate deploy<br/><br/>
    <span style="color:var(--gris)"># 4. Compilar CSS</span><br/>
    npm run css<br/><br/>
    <span style="color:var(--gris)"># 5. Compilar TypeScript</span><br/>
    npx tsc<br/><br/>
    <span style="color:var(--gris)"># 6. Iniciar en producción</span><br/>
    node dist/app.js
  </div>

  <div class="box box-green" style="margin-top:14px;">
    <div class="box-label">✅ Desarrollo local</div>
    Para desarrollo: <code>npm run dev</code> (tsx watch) + <code>npm run css</code> (en terminal separada para compilar Tailwind).
  </div>
</div>

<!-- ══ SEC 10 — IDENTIDAD VISUAL ══ -->
<div class="page">
  <div class="page-header-bar"></div>
  <div class="sh">
    <div class="sh-icon">🎨</div>
    <div>
      <div class="sh-num">Sección 10</div>
      <div class="sh-title">Identidad Visual</div>
    </div>
  </div>

  <p>La interfaz aplica la identidad visual oficial de la Universidad del Atlántico según el <strong>Manual de Identidad Visual 2024</strong> (Resolución Rectoral 001536 del 17 de junio de 2024).</p>

  <h3>Paleta de colores institucionales</h3>
  <div style="display:flex;gap:12px;flex-wrap:wrap;margin:16px 0;">
    <div style="text-align:center;width:120px;">
      <div style="width:120px;height:70px;background:#143163;border-radius:8px;margin-bottom:8px;"></div>
      <div style="font-weight:bold;font-size:9pt;color:#143163;">Azul Primario</div>
      <div style="font-size:8.5pt;color:var(--gris);font-family:monospace;">#143163</div>
      <div style="font-size:8pt;color:var(--gris);">RGB 20·49·99</div>
    </div>
    <div style="text-align:center;width:120px;">
      <div style="width:120px;height:70px;background:#D85819;border-radius:8px;margin-bottom:8px;"></div>
      <div style="font-weight:bold;font-size:9pt;color:#D85819;">Naranja Primario</div>
      <div style="font-size:8.5pt;color:var(--gris);font-family:monospace;">#D85819</div>
      <div style="font-size:8pt;color:var(--gris);">RGB 216·88·25</div>
    </div>
    <div style="text-align:center;width:120px;">
      <div style="width:120px;height:70px;background:#1D71B8;border-radius:8px;margin-bottom:8px;"></div>
      <div style="font-weight:bold;font-size:9pt;color:#1D71B8;">Azul Medio</div>
      <div style="font-size:8.5pt;color:var(--gris);font-family:monospace;">#1D71B8</div>
      <div style="font-size:8pt;color:var(--gris);">RGB 29·113·184</div>
    </div>
    <div style="text-align:center;width:120px;">
      <div style="width:120px;height:70px;background:#FF9912;border-radius:8px;margin-bottom:8px;"></div>
      <div style="font-weight:bold;font-size:9pt;color:#9a3412;">Naranja Dorado</div>
      <div style="font-size:8.5pt;color:var(--gris);font-family:monospace;">#FF9912</div>
      <div style="font-size:8pt;color:var(--gris);">RGB 255·153·18</div>
    </div>
    <div style="text-align:center;width:120px;">
      <div style="width:120px;height:70px;background:#F9B233;border-radius:8px;margin-bottom:8px;"></div>
      <div style="font-weight:bold;font-size:9pt;color:#92400e;">Amarillo Dorado</div>
      <div style="font-size:8.5pt;color:var(--gris);font-family:monospace;">#F9B233</div>
      <div style="font-size:8pt;color:var(--gris);">RGB 249·178·51</div>
    </div>
    <div style="text-align:center;width:120px;">
      <div style="width:120px;height:70px;background:#706F6F;border-radius:8px;margin-bottom:8px;"></div>
      <div style="font-weight:bold;font-size:9pt;color:#706F6F;">Gris</div>
      <div style="font-size:8.5pt;color:var(--gris);font-family:monospace;">#706F6F</div>
      <div style="font-size:8pt;color:var(--gris);">RGB 112·111·111</div>
    </div>
  </div>

  <h3>Tipografía</h3>
  <table>
    <thead><tr><th>Uso</th><th>Fuente</th><th>Variante</th></tr></thead>
    <tbody>
      <tr><td>Interfaz web (body, menús, formularios)</td><td>Tahoma</td><td>Regular / Bold</td></tr>
      <tr><td>Alternativa elegante (documentos)</td><td>Candara</td><td>Regular</td></tr>
      <tr><td>Material promocional (si disponible)</td><td>Radikal</td><td>Bold / Regular / Thin</td></tr>
      <tr><td>Código y rutas en documentación</td><td>Courier New</td><td>Regular (monoespaciada)</td></tr>
    </tbody>
  </table>

  <h3>Aplicación en la interfaz</h3>
  <ul>
    <li>La <strong>barra de navegación</strong> usa fondo <code>#143163</code> (azul primario) con texto blanco.</li>
    <li>Los <strong>encabezados</strong> de sección usan <code>#143163</code>; los acentos y botones de acción primaria usan <code>#D85819</code>.</li>
    <li>Las <strong>tarjetas del dashboard</strong> tienen bordes laterales de color para distinguir módulos.</li>
    <li>El <strong>fondo de la pantalla de login</strong> es azul marino primario con el ícono UA en naranja.</li>
    <li>El <strong>botón de cerrar sesión</strong> usa el naranja primario sobre azul, reforzando la identidad en el punto de salida.</li>
  </ul>

  <hr/>

  <div style="margin-top:20px;background:var(--azul);color:#fff;border-radius:10px;padding:20px 26px;text-align:center;">
    <p style="font-size:11pt;font-weight:bold;margin-bottom:6px;">Banco de Hojas de Vida FCE · v1.0.0</p>
    <p style="font-size:9pt;color:rgba(255,255,255,0.75);">
      Facultad de Ciencias Económicas · Universidad del Atlántico<br/>
      Barranquilla, Colombia · Junio 2026<br/>
      <span style="color:var(--amarillo);">www.uniatlantico.edu.co</span>
    </p>
  </div>
</div>

</body>
</html>`

const browser = await puppeteer.launch({
  headless: true,
  args: ['--no-sandbox', '--disable-setuid-sandbox']
})

const page = await browser.newPage()
await page.setContent(html, { waitUntil: 'networkidle0' })

const outputPath = path.join(__dirname, '..', 'Descripcion_BancoHV_FCE.pdf')

await page.pdf({
  path: outputPath,
  format: 'A4',
  printBackground: true,
  margin: { top: '0', right: '0', bottom: '0', left: '0' }
})

await browser.close()
console.log(`✅ PDF generado: ${outputPath}`)
