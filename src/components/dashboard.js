// ============================================
// Dashboard
// ============================================
import { getContentArea, getPanelRight } from './layout.js';
import { icons } from '../utils/helpers.js';
import { fetchAll } from '../utils/data.js';
import { getCurrentYear } from '../utils/state.js';

export async function renderDashboard() {
  const content = getContentArea();
  const panel = getPanelRight();
  const year = getCurrentYear();

  // Obtener datos para filtrar localmente (o podrías usar queries filtradas)
  const allEstudiantes = await fetchAll('estudiantes');
  const allModulos = await fetchAll('modulos');
  const allAprobaciones = await fetchAll('aprobaciones');
  const allTrayectos = await fetchAll('trayectos_formativos');
  const allProfesores = await fetchAll('profesores');

  // Filtrar por año lectivo
  const estudiantesYear = allEstudiantes.filter(e => e.anio_ingreso === year);
  const modulosYear = allModulos.filter(m => !m.anio || m.anio === year);
  const trayectosYear = allTrayectos; // Los trayectos suelen ser globales o multianuales

  const totalEstudiantes = estudiantesYear.length;
  const totalProfesores = allProfesores.length;
  const totalModulos = modulosYear.length;
  const totalAprobaciones = allAprobaciones.length; // Podría filtrarse por fecha si fuera necesario
  const totalTrayectos = allTrayectos.length;
  const estudiantesActivos = estudiantesYear.filter(e => e.estado === 'Activo').length;

  content.innerHTML = `
    <div class="section-header">
      <h1 class="section-title">Dashboard</h1>
    </div>

    <div class="dashboard-stats">
      <div class="stat-card">
        <div class="stat-card-icon purple">${icons.students}</div>
        <div class="stat-card-value">${totalEstudiantes}</div>
        <div class="stat-card-label">Estudiantes registrados</div>
      </div>
      <div class="stat-card">
        <div class="stat-card-icon blue">${icons.professors}</div>
        <div class="stat-card-value">${totalProfesores}</div>
        <div class="stat-card-label">Profesores</div>
      </div>
      <div class="stat-card">
        <div class="stat-card-icon green">${icons.trayectos}</div>
        <div class="stat-card-value">${totalTrayectos}</div>
        <div class="stat-card-label">Trayectos formativos</div>
      </div>
      <div class="stat-card">
        <div class="stat-card-icon orange">${icons.modulos}</div>
        <div class="stat-card-value">${totalModulos}</div>
        <div class="stat-card-label">Módulos Específicos</div>
      </div>
      <div class="stat-card">
        <div class="stat-card-icon pink">${icons.aprobaciones}</div>
        <div class="stat-card-value">${totalAprobaciones}</div>
        <div class="stat-card-label">Aprobaciones</div>
      </div>
    </div>

    <div class="recent-activity">
      <div class="section-header">
        <h2 class="section-title" style="font-size: 1.125rem;">Actividad Reciente</h2>
      </div>
      <div class="activity-list" id="activity-list">
        <div class="activity-item">
          <div class="activity-dot green"></div>
          <div class="activity-text"><strong>${estudiantesActivos}</strong> estudiantes activos en el sistema</div>
        </div>
        <div class="activity-item">
          <div class="activity-dot blue"></div>
          <div class="activity-text"><strong>${totalProfesores}</strong> profesores registrados</div>
        </div>
        <div class="activity-item">
          <div class="activity-dot purple"></div>
          <div class="activity-text"><strong>${totalTrayectos}</strong> trayectos formativos configurados</div>
        </div>
        <div class="activity-item">
          <div class="activity-dot orange"></div>
          <div class="activity-text"><strong>${totalAprobaciones}</strong> aprobaciones registradas</div>
        </div>
      </div>
    </div>
  `;

  // Panel derecho
  const porcentajeActivos = totalEstudiantes > 0 ? Math.round((estudiantesActivos / totalEstudiantes) * 100) : 0;

  panel.innerHTML = `
    <div class="widget">
      <div class="widget-header">
        <span class="widget-title">Resumen General</span>
        <button class="widget-link">${icons.arrowUpRight}</button>
      </div>
      <div class="widget-bar">
        <div class="widget-bar-fill" style="width: ${porcentajeActivos}%"></div>
      </div>
      <div class="widget-stats">
        <div class="widget-stat">
          <div class="widget-stat-value">${estudiantesActivos}</div>
          <div class="widget-stat-label">Activos</div>
        </div>
        <div class="widget-stat">
          <div class="widget-stat-value">${totalEstudiantes - estudiantesActivos}</div>
          <div class="widget-stat-label">Inactivos/Egresados</div>
        </div>
      </div>
    </div>

    <div class="widget">
      <div class="widget-header">
        <span class="widget-title">Distribución Académica</span>
        <button class="widget-link">${icons.arrowUpRight}</button>
      </div>
      <div class="widget-color-blocks">
        <div class="widget-color-block"></div>
        <div class="widget-color-block"></div>
        <div class="widget-color-block"></div>
        <div class="widget-color-block"></div>
      </div>
      <div class="widget-stats" style="margin-top: 12px;">
        <div class="widget-stat">
          <div class="widget-stat-value">${totalModulos}</div>
          <div class="widget-stat-label">Mód. Específicos</div>
        </div>
        <div class="widget-stat">
          <div class="widget-stat-value">${totalTrayectos}</div>
          <div class="widget-stat-label">Trayectos</div>
        </div>
      </div>
    </div>

    <div class="widget widget-gradient">
      <div class="widget-header">
        <span class="widget-title">💡 Consejo</span>
      </div>
      <p style="font-size: 0.8125rem; color: var(--text-secondary); line-height: 1.5;">
        Usá las pestañas de navegación para gestionar estudiantes, profesores, módulos y registrar aprobaciones.
      </p>
    </div>
  `;
}

export default { renderDashboard };
