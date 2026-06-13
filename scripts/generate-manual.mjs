import puppeteer from 'puppeteer'
import { writeFileSync } from 'fs'
import { fileURLToPath } from 'url'
import path from 'path'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const html = `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8"/>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Tahoma&display=swap');

  * { margin: 0; padding: 0; box-sizing: border-box; }

  body {
    font-family: Tahoma, Candara, Arial, sans-serif;
    font-size: 10.5pt;
    color: #222;
    background: #fff;
    line-height: 1.55;
  }

  /* ── Variables de color institucional ── */
  :root {
    --azul:    #143163;
    --naranja: #D85819;
    --azul-m:  #1D71B8;
    --amarillo:#F9B233;
    --gris:    #706F6F;
    --bg:      #F4F6FA;
  }

  /* ── Portada ── */
  .cover {
    page-break-after: always;
    height: 100vh;
    background: var(--azul);
    color: #fff;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    text-align: center;
    padding: 60px 40px;
  }
  .cover .ua-badge {
    width: 90px; height: 90px;
    background: var(--naranja);
    border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-size: 32pt; font-weight: bold; color: #fff;
    margin-bottom: 32px;
  }
  .cover h1 { font-size: 26pt; font-weight: bold; margin-bottom: 10px; }
  .cover h2 { font-size: 14pt; color: var(--amarillo); margin-bottom: 6px; }
  .cover .sub { font-size: 10pt; color: rgba(255,255,255,0.75); margin-bottom: 40px; }
  .cover .version {
    margin-top: auto;
    font-size: 9pt; color: rgba(255,255,255,0.5);
  }
  .cover .stripe {
    position: absolute; bottom: 0; left: 0; right: 0;
    height: 8px;
    background: linear-gradient(90deg, var(--naranja) 0%, var(--amarillo) 100%);
  }

  /* ── Índice ── */
  .toc-page {
    page-break-after: always;
    padding: 60px 70px;
  }
  .toc-page h2 { font-size: 18pt; color: var(--azul); border-bottom: 3px solid var(--naranja); padding-bottom: 8px; margin-bottom: 28px; }
  .toc-entry { display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px dotted #ccc; font-size: 10.5pt; }
  .toc-entry .toc-sec { color: var(--azul); font-weight: bold; }
  .toc-entry .toc-pg { color: var(--gris); }

  /* ── Páginas interiores ── */
  .page {
    padding: 50px 70px;
    page-break-after: always;
    position: relative;
  }
  .page:last-child { page-break-after: auto; }

  /* ── Cabecera de sección ── */
  .section-header {
    display: flex;
    align-items: center;
    gap: 14px;
    margin-bottom: 24px;
    padding-bottom: 10px;
    border-bottom: 3px solid var(--naranja);
  }
  .section-icon {
    width: 46px; height: 46px; border-radius: 10px;
    background: var(--azul); color: #fff;
    display: flex; align-items: center; justify-content: center;
    font-size: 22px; flex-shrink: 0;
  }
  .section-num { font-size: 9pt; color: var(--naranja); font-weight: bold; text-transform: uppercase; letter-spacing: 1px; }
  .section-title { font-size: 16pt; font-weight: bold; color: var(--azul); }

  /* ── Subsecciones ── */
  h3 { font-size: 12pt; color: var(--azul); margin: 22px 0 10px; }
  h4 { font-size: 10.5pt; color: var(--naranja); margin: 16px 0 6px; font-weight: bold; }

  p { margin-bottom: 10px; }
  ul, ol { margin: 0 0 10px 20px; }
  li { margin-bottom: 5px; }

  /* ── Cajas destacadas ── */
  .info-box {
    background: var(--bg);
    border-left: 4px solid var(--azul-m);
    border-radius: 4px;
    padding: 12px 16px;
    margin: 14px 0;
    font-size: 10pt;
  }
  .warn-box {
    background: #FFF8F3;
    border-left: 4px solid var(--naranja);
    border-radius: 4px;
    padding: 12px 16px;
    margin: 14px 0;
    font-size: 10pt;
  }
  .tip-box {
    background: #F0F9FF;
    border-left: 4px solid var(--azul-m);
    border-radius: 4px;
    padding: 12px 16px;
    margin: 14px 0;
    font-size: 10pt;
  }
  .box-label { font-weight: bold; color: var(--azul); margin-bottom: 4px; font-size: 9pt; text-transform: uppercase; letter-spacing: 0.5px; }

  /* ── Tabla de roles ── */
  table {
    width: 100%;
    border-collapse: collapse;
    margin: 14px 0;
    font-size: 9.5pt;
  }
  th {
    background: var(--azul);
    color: #fff;
    padding: 8px 10px;
    text-align: left;
    font-weight: bold;
  }
  td { padding: 7px 10px; border-bottom: 1px solid #e0e0e0; }
  tr:nth-child(even) td { background: var(--bg); }

  /* ── Pasos numerados ── */
  .steps { counter-reset: step; margin: 14px 0; }
  .step {
    display: flex;
    gap: 14px;
    margin-bottom: 14px;
    align-items: flex-start;
  }
  .step-num {
    counter-increment: step;
    min-width: 28px; height: 28px;
    background: var(--naranja); color: #fff;
    border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-size: 10pt; font-weight: bold; flex-shrink: 0;
    margin-top: 1px;
  }
  .step-body { flex: 1; }
  .step-body strong { color: var(--azul); }

  /* ── Badges de rol ── */
  .role-badge {
    display: inline-block;
    padding: 2px 9px;
    border-radius: 20px;
    font-size: 8.5pt;
    font-weight: bold;
    margin: 1px 2px;
  }
  .role-student { background: #E8F0FE; color: var(--azul); }
  .role-lider   { background: #FFF0E6; color: var(--naranja); }
  .role-admin   { background: #FFE8E8; color: #B91C1C; }

  /* ── Pie de página ── */
  @page {
    margin: 0;
    size: A4 portrait;
  }

  .footer-bar {
    position: fixed;
    bottom: 0; left: 0; right: 0;
    height: 28px;
    background: var(--azul);
    display: flex; align-items: center; justify-content: space-between;
    padding: 0 30px;
    font-size: 7.5pt; color: rgba(255,255,255,0.7);
  }

  /* ── Cuadrícula de funciones ── */
  .feature-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
    margin: 14px 0;
  }
  .feature-card {
    border: 1px solid #dde4f0;
    border-radius: 8px;
    padding: 12px 14px;
    background: #fff;
  }
  .feature-card .fc-icon { font-size: 20px; margin-bottom: 6px; }
  .feature-card .fc-title { font-weight: bold; color: var(--azul); font-size: 10pt; margin-bottom: 4px; }
  .feature-card .fc-desc { font-size: 9pt; color: var(--gris); }

  .divider { border: none; border-top: 1px solid #e0e0e0; margin: 18px 0; }
</style>
</head>
<body>

<!-- ══════════════════ PORTADA ══════════════════ -->
<div class="cover" style="position:relative;">
  <div class="ua-badge">UA</div>
  <h1>Banco de Hojas de Vida</h1>
  <h2>Facultad de Ciencias Económicas</h2>
  <p class="sub">Universidad del Atlántico · Barranquilla, Colombia</p>

  <div style="background:rgba(255,255,255,0.08);border-radius:12px;padding:24px 40px;max-width:420px;margin:0 auto 30px;">
    <p style="font-size:10pt;color:rgba(255,255,255,0.9);line-height:1.7;">
      Manual de Usuario · Versión 1.0<br/>
      Sistema de gestión de candidatos, hojas de vida y vacantes laborales para estudiantes y egresados de la FCE.
    </p>
  </div>

  <p class="version">Junio 2026 · Acceso restringido a correos @uniatlantico.edu.co</p>
  <div class="stripe"></div>
</div>

<!-- ══════════════════ ÍNDICE ══════════════════ -->
<div class="toc-page">
  <h2>Tabla de Contenido</h2>
  <div class="toc-entry"><span class="toc-sec">1. Introducción y acceso al sistema</span><span class="toc-pg">3</span></div>
  <div class="toc-entry"><span class="toc-sec">2. Roles de usuario</span><span class="toc-pg">4</span></div>
  <div class="toc-entry"><span class="toc-sec">3. Módulo Estudiante / Egresado</span><span class="toc-pg">5</span></div>
  <div class="toc-entry" style="padding-left:16px;"><span>3.1 Hoja de Vida</span><span class="toc-pg">5</span></div>
  <div class="toc-entry" style="padding-left:16px;"><span>3.2 Explorar Vacantes</span><span class="toc-pg">6</span></div>
  <div class="toc-entry" style="padding-left:16px;"><span>3.3 Mis Postulaciones</span><span class="toc-pg">6</span></div>
  <div class="toc-entry"><span class="toc-sec">4. Módulo Líder de Prácticas</span><span class="toc-pg">7</span></div>
  <div class="toc-entry" style="padding-left:16px;"><span>4.1 Gestión de Empresas</span><span class="toc-pg">7</span></div>
  <div class="toc-entry" style="padding-left:16px;"><span>4.2 Gestión de Vacantes</span><span class="toc-pg">7</span></div>
  <div class="toc-entry" style="padding-left:16px;"><span>4.3 Revisión de Candidatos</span><span class="toc-pg">8</span></div>
  <div class="toc-entry"><span class="toc-sec">5. Módulo Administrador</span><span class="toc-pg">9</span></div>
  <div class="toc-entry" style="padding-left:16px;"><span>5.1 Panel de control</span><span class="toc-pg">9</span></div>
  <div class="toc-entry" style="padding-left:16px;"><span>5.2 Gestión de Usuarios y Roles</span><span class="toc-pg">9</span></div>
  <div class="toc-entry" style="padding-left:16px;"><span>5.3 Moderación de Vacantes</span><span class="toc-pg">10</span></div>
  <div class="toc-entry"><span class="toc-sec">6. Cambio de Rol Activo</span><span class="toc-pg">10</span></div>
  <div class="toc-entry"><span class="toc-sec">7. Preguntas frecuentes</span><span class="toc-pg">11</span></div>
</div>

<!-- ══════════════════ SEC 1 — INTRODUCCIÓN ══════════════════ -->
<div class="page">
  <div class="section-header">
    <div class="section-icon">🎯</div>
    <div>
      <div class="section-num">Sección 1</div>
      <div class="section-title">Introducción y acceso al sistema</div>
    </div>
  </div>

  <p>El <strong>Banco de Hojas de Vida FCE</strong> es la plataforma digital de la Facultad de Ciencias Económicas de la Universidad del Atlántico, diseñada para conectar a estudiantes y egresados con oportunidades laborales gestionadas por el área de Prácticas Profesionales.</p>

  <div class="feature-grid">
    <div class="feature-card">
      <div class="fc-icon">📄</div>
      <div class="fc-title">Hoja de Vida Digital</div>
      <div class="fc-desc">Crea y mantén tu perfil profesional con foto, experiencia, educación y certificados.</div>
    </div>
    <div class="feature-card">
      <div class="fc-icon">💼</div>
      <div class="fc-title">Bolsa de Empleo</div>
      <div class="fc-desc">Explora vacantes publicadas por empresas aliadas y postúlate con un clic.</div>
    </div>
    <div class="feature-card">
      <div class="fc-icon">🏢</div>
      <div class="fc-title">Gestión de Empresas</div>
      <div class="fc-desc">Registro de empresas aliadas y sus vacantes activas, administrado por el Líder de Prácticas.</div>
    </div>
    <div class="feature-card">
      <div class="fc-icon">⚙️</div>
      <div class="fc-title">Panel Administrativo</div>
      <div class="fc-desc">Estadísticas, gestión de usuarios, roles y moderación de contenido.</div>
    </div>
  </div>

  <h3>1.1 Requisito de acceso</h3>
  <div class="warn-box">
    <div class="box-label">⚠️ Importante</div>
    El sistema requiere un correo institucional de la Universidad del Atlántico. Formatos aceptados:
    <ul style="margin-top:6px;">
      <li><code>nombre@uniatlantico.edu.co</code></li>
      <li><code>nombre@mail.uniatlantico.edu.co</code></li>
      <li><code>nombre@est.uniatlantico.edu.co</code></li>
      <li>Cualquier subdominio de <code>uniatlantico.edu.co</code></li>
    </ul>
    Cuentas de Gmail u otros proveedores serán <strong>rechazadas automáticamente</strong>.
  </div>

  <h3>1.2 Cómo iniciar sesión</h3>
  <div class="steps">
    <div class="step">
      <div class="step-num">1</div>
      <div class="step-body"><strong>Abre el sistema</strong> desde el navegador en la URL proporcionada por la FCE.</div>
    </div>
    <div class="step">
      <div class="step-num">2</div>
      <div class="step-body"><strong>Haz clic en "Entrar con correo institucional"</strong>. Serás redirigido a la pantalla de Google.</div>
    </div>
    <div class="step">
      <div class="step-num">3</div>
      <div class="step-body"><strong>Selecciona o escribe</strong> tu cuenta de correo institucional (<code>@uniatlantico.edu.co</code>).</div>
    </div>
    <div class="step">
      <div class="step-num">4</div>
      <div class="step-body"><strong>Acepta los permisos</strong> de Google (solo lectura de tu nombre, foto y correo).</div>
    </div>
    <div class="step">
      <div class="step-num">5</div>
      <div class="step-body">El sistema te lleva al <strong>dashboard</strong> según tu rol asignado.</div>
    </div>
  </div>

  <div class="info-box">
    <div class="box-label">ℹ️ Primer acceso</div>
    Al ingresar por primera vez, el sistema crea tu cuenta automáticamente con rol <strong>Estudiante</strong>. Un Administrador puede ampliar tus permisos si es necesario.
  </div>

  <h3>1.3 Cerrar sesión</h3>
  <p>En la barra de navegación superior, haz clic en el botón <strong>"Salir"</strong> (esquina superior derecha). La sesión se cierra de forma segura en el servidor.</p>
</div>

<!-- ══════════════════ SEC 2 — ROLES ══════════════════ -->
<div class="page">
  <div class="section-header">
    <div class="section-icon">👥</div>
    <div>
      <div class="section-num">Sección 2</div>
      <div class="section-title">Roles de usuario</div>
    </div>
  </div>

  <p>El sistema maneja tres roles con permisos diferenciados. Un mismo usuario puede tener <strong>múltiples roles asignados</strong> por el Administrador y cambiar entre ellos desde la barra de navegación.</p>

  <table>
    <thead>
      <tr>
        <th>Rol</th>
        <th>Descripción</th>
        <th>Acceso principal</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><span class="role-badge role-student">🎓 Estudiante</span></td>
        <td>Estudiante o egresado de la FCE</td>
        <td>Crear HV, ver vacantes, postularse, ver estado de candidaturas</td>
      </tr>
      <tr>
        <td><span class="role-badge role-lider">📋 Líder de Prácticas</span></td>
        <td>Coordinador de prácticas de la FCE</td>
        <td>Registrar empresas, publicar vacantes, revisar y gestionar candidatos</td>
      </tr>
      <tr>
        <td><span class="role-badge role-admin">⚙️ Admin</span></td>
        <td>Administrador del sistema</td>
        <td>Todo lo anterior + gestión de usuarios, roles y moderación global</td>
      </tr>
    </tbody>
  </table>

  <h3>2.1 Asignación de roles</h3>
  <p>Solo un usuario con rol <strong>Administrador</strong> puede asignar o revocar roles. El proceso se hace desde el <strong>Panel Admin → Usuarios → Guardar roles</strong>.</p>

  <h3>2.2 Rol por defecto</h3>
  <div class="info-box">
    <div class="box-label">ℹ️ Primer ingreso</div>
    Todo usuario nuevo recibe automáticamente el rol <span class="role-badge role-student">Estudiante</span>. El Administrador puede añadir roles adicionales según sea necesario.
  </div>

  <h3>2.3 Cambio de rol activo</h3>
  <p>Si tienes más de un rol asignado, verás un <strong>selector desplegable</strong> en la barra de navegación superior. Cambia de rol en cualquier momento sin cerrar sesión. El sistema muestra los menús y opciones correspondientes al rol activo seleccionado.</p>

  <div class="warn-box">
    <div class="box-label">⚠️ El rol Admin es especial</div>
    Un usuario con rol Admin siempre tiene acceso completo independientemente del rol activo seleccionado. El selector de rol activo afecta la vista del menú, pero los permisos de Admin nunca se restringen.
  </div>

  <hr class="divider"/>

  <h3>2.4 Resumen de permisos por módulo</h3>
  <table>
    <thead>
      <tr>
        <th>Función</th>
        <th style="text-align:center;">Estudiante</th>
        <th style="text-align:center;">Líder</th>
        <th style="text-align:center;">Admin</th>
      </tr>
    </thead>
    <tbody>
      <tr><td>Crear / editar hoja de vida propia</td><td style="text-align:center;">✅</td><td style="text-align:center;">✅</td><td style="text-align:center;">✅</td></tr>
      <tr><td>Ver vacantes publicadas</td><td style="text-align:center;">✅</td><td style="text-align:center;">✅</td><td style="text-align:center;">✅</td></tr>
      <tr><td>Postularse a vacantes</td><td style="text-align:center;">✅</td><td style="text-align:center;">—</td><td style="text-align:center;">✅</td></tr>
      <tr><td>Ver estado de postulaciones</td><td style="text-align:center;">✅</td><td style="text-align:center;">—</td><td style="text-align:center;">✅</td></tr>
      <tr><td>Registrar empresas</td><td style="text-align:center;">—</td><td style="text-align:center;">✅</td><td style="text-align:center;">✅</td></tr>
      <tr><td>Publicar vacantes</td><td style="text-align:center;">—</td><td style="text-align:center;">✅</td><td style="text-align:center;">✅</td></tr>
      <tr><td>Ver / gestionar candidatos</td><td style="text-align:center;">—</td><td style="text-align:center;">✅</td><td style="text-align:center;">✅</td></tr>
      <tr><td>Aceptar / rechazar postulaciones</td><td style="text-align:center;">—</td><td style="text-align:center;">✅</td><td style="text-align:center;">✅</td></tr>
      <tr><td>Ver perfil completo del candidato</td><td style="text-align:center;">—</td><td style="text-align:center;">✅</td><td style="text-align:center;">✅</td></tr>
      <tr><td>Gestionar usuarios y roles</td><td style="text-align:center;">—</td><td style="text-align:center;">—</td><td style="text-align:center;">✅</td></tr>
      <tr><td>Moderar todas las vacantes</td><td style="text-align:center;">—</td><td style="text-align:center;">—</td><td style="text-align:center;">✅</td></tr>
      <tr><td>Ver estadísticas del sistema</td><td style="text-align:center;">—</td><td style="text-align:center;">—</td><td style="text-align:center;">✅</td></tr>
    </tbody>
  </table>
</div>

<!-- ══════════════════ SEC 3 — ESTUDIANTE ══════════════════ -->
<div class="page">
  <div class="section-header">
    <div class="section-icon">🎓</div>
    <div>
      <div class="section-num">Sección 3</div>
      <div class="section-title">Módulo Estudiante / Egresado</div>
    </div>
  </div>

  <h3>3.1 Hoja de Vida</h3>
  <p>La hoja de vida es el núcleo del perfil del candidato. Puede crearse y editarse en cualquier momento desde el menú <strong>Mi HV</strong>.</p>

  <h4>Información del perfil</h4>
  <ul>
    <li><strong>Foto de perfil</strong>: se puede subir una imagen en formato JPG, PNG o WEBP (máx. 5 MB).</li>
    <li><strong>Resumen profesional</strong>: texto libre de presentación.</li>
    <li><strong>Datos de contacto</strong>: teléfono, ciudad, LinkedIn, portafolio/web.</li>
    <li><strong>CV en PDF/Word</strong>: archivo adjunto descargable (máx. 10 MB).</li>
  </ul>

  <h4>Experiencia laboral</h4>
  <p>Desde la sección <em>Experiencias</em> puedes agregar múltiples entradas con:</p>
  <ul>
    <li>Empresa, cargo y descripción de funciones.</li>
    <li>Fecha de inicio y fecha de fin (o marcar como <em>trabajo actual</em>).</li>
  </ul>

  <h4>Educación</h4>
  <p>Registra tu historial académico con institución, título, campo de estudio y fechas de inicio/fin.</p>

  <h4>Certificados y documentos</h4>
  <p>Puedes adjuntar certificados adicionales (PDF, JPG, PNG) que respalden tus competencias.</p>

  <div class="tip-box">
    <div class="box-label">💡 Consejo</div>
    Mantén tu hoja de vida actualizada antes de postularte. Los Líderes de Prácticas y Administradores ven el perfil completo al revisar candidaturas.
  </div>

  <hr class="divider"/>

  <h3>3.2 Explorar Vacantes</h3>
  <p>Desde el menú <strong>Vacantes</strong> puedes ver todas las ofertas laborales activas publicadas por las empresas aliadas.</p>

  <h4>Detalle de una vacante</h4>
  <p>Al hacer clic en una vacante verás:</p>
  <ul>
    <li>Título, empresa y descripción del cargo.</li>
    <li>Requisitos, modalidad y salario (si está especificado).</li>
    <li>Botón de <strong>Postularse</strong> (solo si aún no te has postulado).</li>
  </ul>

  <h4>Cómo postularse</h4>
  <div class="steps">
    <div class="step">
      <div class="step-num">1</div>
      <div class="step-body">Abre la vacante de tu interés y haz clic en <strong>"Postularme"</strong>.</div>
    </div>
    <div class="step">
      <div class="step-num">2</div>
      <div class="step-body">Opcionalmente escribe una <strong>carta de presentación</strong> personalizada.</div>
    </div>
    <div class="step">
      <div class="step-num">3</div>
      <div class="step-body">Confirma la postulación. Recibirás el estado <em>Pendiente</em> hasta que el Líder la revise.</div>
    </div>
  </div>

  <div class="warn-box">
    <div class="box-label">⚠️ Una sola postulación por vacante</div>
    Solo puedes postularte una vez a cada vacante. El botón de postulación desaparece si ya estás inscrito.
  </div>

  <hr class="divider"/>

  <h3>3.3 Mis Postulaciones</h3>
  <p>Desde el menú <strong>Postulaciones</strong> (o <em>Mis Postulaciones</em> en el dashboard) puedes ver todas tus candidaturas con su estado actual:</p>

  <table>
    <thead><tr><th>Estado</th><th>Significado</th></tr></thead>
    <tbody>
      <tr><td>🕐 <strong>Pendiente</strong></td><td>Tu candidatura fue recibida y está en espera de revisión.</td></tr>
      <tr><td>✅ <strong>Aceptado</strong></td><td>Fuiste seleccionado. Revisa el mensaje del Líder para instrucciones.</td></tr>
      <tr><td>❌ <strong>Rechazado</strong></td><td>Tu candidatura no avanzó en esta oportunidad. Lee el mensaje de retroalimentación.</td></tr>
    </tbody>
  </table>

  <p>Cuando el Líder acepta o rechaza tu postulación, puede adjuntar un <strong>mensaje personalizado</strong> visible en esta pantalla.</p>
</div>

<!-- ══════════════════ SEC 4 — LÍDER ══════════════════ -->
<div class="page">
  <div class="section-header">
    <div class="section-icon">📋</div>
    <div>
      <div class="section-num">Sección 4</div>
      <div class="section-title">Módulo Líder de Prácticas</div>
    </div>
  </div>

  <p>El Líder de Prácticas es el responsable de gestionar las relaciones con las empresas aliadas y el proceso de vinculación laboral de los estudiantes.</p>

  <div class="warn-box">
    <div class="box-label">⚠️ Las empresas no tienen acceso al sistema</div>
    A diferencia de otros sistemas, aquí las empresas <strong>no crean cuenta</strong>. Es el Líder de Prácticas quien registra las empresas y publica sus vacantes en nombre de ellas.
  </div>

  <h3>4.1 Gestión de Empresas</h3>
  <p>Accede desde el menú <strong>Gestionar Empresas</strong> o desde el formulario de nueva vacante.</p>

  <h4>Registrar una empresa nueva</h4>
  <div class="steps">
    <div class="step">
      <div class="step-num">1</div>
      <div class="step-body">Ve a <strong>Gestionar Empresas → Nueva empresa</strong>.</div>
    </div>
    <div class="step">
      <div class="step-num">2</div>
      <div class="step-body">Completa: <strong>Nombre</strong>, descripción, sector económico, ciudad y sitio web.</div>
    </div>
    <div class="step">
      <div class="step-num">3</div>
      <div class="step-body">Opcionalmente sube el <strong>logo</strong> de la empresa (imagen JPG/PNG).</div>
    </div>
    <div class="step">
      <div class="step-num">4</div>
      <div class="step-body">Guarda. La empresa estará disponible para asociar vacantes.</div>
    </div>
  </div>

  <hr class="divider"/>

  <h3>4.2 Gestión de Vacantes</h3>
  <p>Desde el menú <strong>Vacantes</strong> puedes ver todas las vacantes que hayas creado y su estado.</p>

  <h4>Crear una nueva vacante</h4>
  <div class="steps">
    <div class="step">
      <div class="step-num">1</div>
      <div class="step-body">Haz clic en <strong>"+ Vacante"</strong> en la barra de navegación o en el dashboard.</div>
    </div>
    <div class="step">
      <div class="step-num">2</div>
      <div class="step-body">Selecciona la <strong>empresa</strong> de la lista desplegable (todas las empresas registradas en el sistema aparecen). Si la empresa no existe, créala primero desde <em>Gestionar Empresas</em>.</div>
    </div>
    <div class="step">
      <div class="step-num">3</div>
      <div class="step-body">Completa el formulario: <strong>título</strong>, descripción, requisitos, modalidad, salario (opcional) y fecha límite.</div>
    </div>
    <div class="step">
      <div class="step-num">4</div>
      <div class="step-body">Guarda. La vacante queda activa y visible para los estudiantes de inmediato.</div>
    </div>
  </div>

  <h4>Editar o eliminar una vacante</h4>
  <p>Desde la lista de <strong>Mis Vacantes</strong>, cada fila tiene opciones de <em>Editar</em> y <em>Eliminar</em>. Eliminar una vacante también borra las postulaciones asociadas de forma permanente.</p>

  <hr class="divider"/>

  <h3>4.3 Revisión de Candidatos</h3>
  <p>Cuando un estudiante se postula a una vacante, el Líder puede revisar su candidatura desde <strong>Vacantes → Ver candidatos</strong>.</p>

  <h4>Lista de postulados</h4>
  <p>Se muestra una tabla con todos los candidatos a una vacante, con su nombre, estado actual y fecha de postulación. Desde ahí puedes:</p>
  <ul>
    <li><strong>Ver el perfil completo</strong> del candidato (foto, resumen, experiencia, educación, certificados y archivo CV).</li>
    <li><strong>Aceptar o rechazar</strong> la candidatura con un mensaje opcional de retroalimentación.</li>
  </ul>

  <h4>Aceptar o rechazar una postulación</h4>
  <div class="steps">
    <div class="step">
      <div class="step-num">1</div>
      <div class="step-body">Haz clic en <strong>"Ver candidatos"</strong> en la vacante correspondiente.</div>
    </div>
    <div class="step">
      <div class="step-num">2</div>
      <div class="step-body">Revisa el perfil del candidato con el enlace <em>"Ver perfil"</em>.</div>
    </div>
    <div class="step">
      <div class="step-num">3</div>
      <div class="step-body">Elige el nuevo estado: <strong>Aceptado</strong> o <strong>Rechazado</strong>.</div>
    </div>
    <div class="step">
      <div class="step-num">4</div>
      <div class="step-body">Escribe un <strong>mensaje</strong> (opcional) con instrucciones o retroalimentación para el candidato.</div>
    </div>
    <div class="step">
      <div class="step-num">5</div>
      <div class="step-body">Guarda. El candidato verá el nuevo estado y el mensaje en su sección <em>Mis Postulaciones</em>.</div>
    </div>
  </div>

  <div class="tip-box">
    <div class="box-label">💡 Buena práctica</div>
    Siempre incluye un mensaje al rechazar una candidatura. La retroalimentación oportuna ayuda a los estudiantes a mejorar su perfil y postulaciones futuras.
  </div>
</div>

<!-- ══════════════════ SEC 5 — ADMIN ══════════════════ -->
<div class="page">
  <div class="section-header">
    <div class="section-icon">⚙️</div>
    <div>
      <div class="section-num">Sección 5</div>
      <div class="section-title">Módulo Administrador</div>
    </div>
  </div>

  <p>El Administrador tiene acceso completo a todas las funciones del sistema más herramientas exclusivas de gestión global.</p>

  <h3>5.1 Panel de Control</h3>
  <p>Accede desde el menú <strong>Admin</strong>. El panel muestra estadísticas en tiempo real:</p>

  <div class="feature-grid">
    <div class="feature-card">
      <div class="fc-icon">👥</div>
      <div class="fc-title">Usuarios registrados</div>
      <div class="fc-desc">Total de cuentas activas en el sistema.</div>
    </div>
    <div class="feature-card">
      <div class="fc-icon">📄</div>
      <div class="fc-title">Hojas de vida</div>
      <div class="fc-desc">Cuántos usuarios tienen perfil creado.</div>
    </div>
    <div class="feature-card">
      <div class="fc-icon">💼</div>
      <div class="fc-title">Vacantes activas</div>
      <div class="fc-desc">Ofertas laborales publicadas actualmente.</div>
    </div>
    <div class="feature-card">
      <div class="fc-icon">📬</div>
      <div class="fc-title">Postulaciones</div>
      <div class="fc-desc">Total de candidaturas registradas.</div>
    </div>
  </div>

  <p>El panel también muestra los <strong>usuarios más recientes</strong> y las <strong>últimas postulaciones</strong> del sistema.</p>

  <hr class="divider"/>

  <h3>5.2 Gestión de Usuarios y Roles</h3>
  <p>Desde <strong>Admin → Usuarios</strong> puedes:</p>
  <ul>
    <li><strong>Buscar</strong> usuarios por nombre o correo electrónico.</li>
    <li><strong>Filtrar</strong> por rol (Estudiante, Líder de Prácticas, Admin).</li>
    <li><strong>Asignar o revocar roles</strong>: selecciona los roles con las casillas de verificación y haz clic en <em>Guardar</em>.</li>
    <li><strong>Ver la hoja de vida</strong> de cualquier usuario.</li>
    <li><strong>Eliminar</strong> un usuario del sistema (acción irreversible).</li>
  </ul>

  <h4>Asignar múltiples roles</h4>
  <div class="steps">
    <div class="step">
      <div class="step-num">1</div>
      <div class="step-body">Localiza al usuario en la lista (usa el buscador si es necesario).</div>
    </div>
    <div class="step">
      <div class="step-num">2</div>
      <div class="step-body">En la columna <em>Rol</em>, marca las casillas de los roles deseados: Estudiante, Líder de Prácticas, Admin.</div>
    </div>
    <div class="step">
      <div class="step-num">3</div>
      <div class="step-body">Haz clic en <strong>Guardar</strong>. Los cambios son inmediatos.</div>
    </div>
    <div class="step">
      <div class="step-num">4</div>
      <div class="step-body">El usuario verá el <strong>selector de rol</strong> en su barra de navegación la próxima vez que cargue la página.</div>
    </div>
  </div>

  <div class="warn-box">
    <div class="box-label">⚠️ Al menos un rol es obligatorio</div>
    Cada usuario debe tener al menos un rol activo. El sistema rechaza guardar si no se selecciona ninguno.
  </div>

  <hr class="divider"/>

  <h3>5.3 Moderación de Vacantes</h3>
  <p>Desde <strong>Admin → Moderar vacantes</strong> el Administrador puede ver <strong>todas las vacantes del sistema</strong> (no solo las propias) y eliminar aquellas que sean inapropiadas o estén desactualizadas.</p>

  <p>El Administrador también puede <strong>crear vacantes</strong> directamente desde el menú o el panel, accediendo a las mismas empresas registradas por el Líder de Prácticas.</p>
</div>

<!-- ══════════════════ SEC 6 — CAMBIO DE ROL ══════════════════ -->
<div class="page">
  <div class="section-header">
    <div class="section-icon">🔄</div>
    <div>
      <div class="section-num">Sección 6</div>
      <div class="section-title">Cambio de Rol Activo</div>
    </div>
  </div>

  <p>Si tienes asignado más de un rol, el sistema muestra un <strong>selector desplegable</strong> en la esquina superior derecha de la barra de navegación.</p>

  <h3>Cómo cambiar de rol</h3>
  <div class="steps">
    <div class="step">
      <div class="step-num">1</div>
      <div class="step-body">Ubica el selector de rol en la barra de navegación (solo aparece si tienes 2 o más roles).</div>
    </div>
    <div class="step">
      <div class="step-num">2</div>
      <div class="step-body">Selecciona el rol al que deseas cambiar en el menú desplegable.</div>
    </div>
    <div class="step">
      <div class="step-num">3</div>
      <div class="step-body">La página se recarga y el menú de navegación muestra las opciones del nuevo rol activo.</div>
    </div>
  </div>

  <div class="info-box">
    <div class="box-label">ℹ️ El rol activo es por sesión</div>
    El rol activo que selecciones se mantiene durante toda tu sesión. Al cerrar sesión y volver a entrar, el sistema carga automáticamente el primer rol asignado a tu cuenta.
  </div>

  <h3>Etiquetas de roles en el selector</h3>
  <table>
    <thead><tr><th>Etiqueta visible</th><th>Rol interno</th></tr></thead>
    <tbody>
      <tr><td>🎓 Estudiante</td><td>STUDENT</td></tr>
      <tr><td>📋 Líder de Prácticas</td><td>LIDER</td></tr>
      <tr><td>⚙️ Admin</td><td>ADMIN</td></tr>
    </tbody>
  </table>

  <h3>Accesos según rol activo</h3>

  <h4>Con rol Estudiante activo verás:</h4>
  <ul>
    <li>Vacantes · Mi HV · Postulaciones</li>
  </ul>

  <h4>Con rol Líder de Prácticas activo verás:</h4>
  <ul>
    <li>Vacantes (mis vacantes) · + Vacante · (Gestionar empresas en el dashboard)</li>
  </ul>

  <h4>Con rol Admin activo verás:</h4>
  <ul>
    <li>Admin · Vacantes · + Vacante · Mis vacantes</li>
  </ul>

  <div class="tip-box">
    <div class="box-label">💡 Usuarios con todos los roles</div>
    Un Administrador con los tres roles asignados puede, por ejemplo, cambiar a rol Estudiante para probar la experiencia del candidato, luego cambiar a Líder para gestionar vacantes, y volver a Admin para ver estadísticas globales — todo en la misma sesión.
  </div>
</div>

<!-- ══════════════════ SEC 7 — FAQ ══════════════════ -->
<div class="page">
  <div class="section-header">
    <div class="section-icon">❓</div>
    <div>
      <div class="section-num">Sección 7</div>
      <div class="section-title">Preguntas Frecuentes</div>
    </div>
  </div>

  <h4>¿Por qué no puedo iniciar sesión con mi cuenta personal de Gmail?</h4>
  <p>El sistema está restringido a correos institucionales de la Universidad del Atlántico (<code>@uniatlantico.edu.co</code> y sus subdominios). Las cuentas personales son rechazadas por seguridad.</p>

  <hr class="divider"/>

  <h4>¿Puedo tener más de una hoja de vida?</h4>
  <p>No. Cada usuario tiene una única hoja de vida que puede editar en cualquier momento. Esto garantiza un perfil unificado y actualizado.</p>

  <hr class="divider"/>

  <h4>¿Qué formatos de archivo acepta el sistema?</h4>
  <table>
    <thead><tr><th>Campo</th><th>Formatos permitidos</th><th>Tamaño máximo</th></tr></thead>
    <tbody>
      <tr><td>Foto de perfil</td><td>JPG, PNG, WEBP</td><td>5 MB</td></tr>
      <tr><td>CV adjunto</td><td>PDF, DOC, DOCX</td><td>10 MB</td></tr>
      <tr><td>Certificados</td><td>PDF, JPG, PNG</td><td>10 MB c/u</td></tr>
      <tr><td>Logo de empresa</td><td>JPG, PNG</td><td>5 MB</td></tr>
    </tbody>
  </table>

  <hr class="divider"/>

  <h4>¿Las empresas pueden ver mi hoja de vida directamente?</h4>
  <p>No. Las empresas no tienen acceso al sistema. Es el Líder de Prácticas quien actúa como intermediario: revisa los perfiles de los candidatos y gestiona el proceso de selección.</p>

  <hr class="divider"/>

  <h4>¿Cómo sé si mi postulación fue aceptada o rechazada?</h4>
  <p>Ve a <strong>Mis Postulaciones</strong>. El estado de cada candidatura se actualiza en tiempo real. Si el Líder incluyó un mensaje, también lo verás en esa misma pantalla.</p>

  <hr class="divider"/>

  <h4>¿Puedo postularme a varias vacantes al mismo tiempo?</h4>
  <p>Sí. Puedes postularte a todas las vacantes que desees. Solo existe la restricción de una postulación por vacante (no puedes postularte dos veces a la misma oferta).</p>

  <hr class="divider"/>

  <h4>¿Qué pasa si elimino mi hoja de vida?</h4>
  <p>Si la sección permite eliminar secciones individuales (experiencias, educación), los cambios son permanentes. Se recomienda actualizar en lugar de eliminar. Las postulaciones ya realizadas no se eliminan al borrar secciones de la HV.</p>

  <hr class="divider"/>

  <h4>¿Cómo solicito el rol de Líder de Prácticas o Admin?</h4>
  <p>Contacta al Administrador del sistema para que asigne el rol desde el Panel Admin → Usuarios. No es posible solicitar roles desde la interfaz del estudiante.</p>

  <hr class="divider"/>

  <h4>¿Puedo editar una vacante después de publicarla?</h4>
  <p>Sí, el Líder de Prácticas puede editar cualquier vacante que haya creado desde la lista <strong>Mis Vacantes → Editar</strong>. El Administrador puede editar cualquier vacante del sistema.</p>

  <hr class="divider"/>

  <div style="margin-top:32px;padding:20px 24px;background:var(--azul);color:#fff;border-radius:10px;text-align:center;">
    <p style="font-size:11pt;font-weight:bold;margin-bottom:6px;">¿Necesitas ayuda adicional?</p>
    <p style="font-size:9.5pt;color:rgba(255,255,255,0.8);">
      Contacta al área de Prácticas Profesionales de la Facultad de Ciencias Económicas<br/>
      Universidad del Atlántico · www.uniatlantico.edu.co
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

const outputPath = path.join(__dirname, '..', 'Manual_BancoHV_FCE.pdf')

await page.pdf({
  path: outputPath,
  format: 'A4',
  printBackground: true,
  margin: { top: '0', right: '0', bottom: '0', left: '0' }
})

await browser.close()
console.log(`✅ PDF generado: ${outputPath}`)
