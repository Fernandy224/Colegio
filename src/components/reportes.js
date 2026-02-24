// ============================================
// Reportes y Búsqueda Avanzada
// ============================================
import { getContentArea, getPanelRight } from './layout.js';
import { icons, sanitize, formatDate } from '../utils/helpers.js';
import { fetchAll } from '../utils/data.js';

export async function renderReportes() {
  const content = getContentArea();
  const panel = getPanelRight();

  const estudiantes = await fetchAll('estudiantes');
  const modulos = await fetchAll('modulos');
  const aprobaciones = await fetchAll('aprobaciones');
  const submodulos = await fetchAll('submodulos');

  // Años únicos
  const anios = [...new Set(estudiantes.map(e => e.anio_ingreso))].sort((a, b) => b - a);

  content.innerHTML = `
    <div class="section-header">
      <h1 class="section-title">Reportes y Consultas</h1>
    </div>

    <div class="report-filters">
      <div class="report-filter-group">
        <span class="report-filter-label">Buscar estudiante</span>
        <div class="search-bar" style="max-width:none;">
          ${icons.search}
          <input type="text" id="report-search" placeholder="Nombre, apellido o DNI..." />
        </div>
      </div>
      <div class="report-filter-group">
        <span class="report-filter-label">Año de cursado</span>
        <select class="form-select" id="report-anio">
          <option value="">Todos</option>
          ${anios.map(a => `<option value="${a}">${a}</option>`).join('')}
        </select>
      </div>
      <div class="report-filter-group">
        <span class="report-filter-label">Módulo Específico</span>
        <select class="form-select" id="report-modulo">
          <option value="">Todos</option>
          ${modulos.map(m => `<option value="${m.id}">${sanitize(m.nombre)}</option>`).join('')}
        </select>
      </div>
      <div class="report-filter-group">
        <span class="report-filter-label">Estado</span>
        <select class="form-select" id="report-estado">
          <option value="">Todos</option>
          <option value="Activo">Activo</option>
          <option value="Inactivo">Inactivo</option>
          <option value="Egresado">Egresado</option>
        </select>
      </div>
      <div class="report-filter-group" style="justify-content: flex-end;">
        <button class="btn btn-primary" id="report-apply" style="margin-top: auto;">
          ${icons.search} Buscar
        </button>
      </div>
    </div>

    <div id="report-results">
      <div class="table-container">
        <table class="table">
          <thead>
            <tr>
              <th>Estudiante</th>
              <th>DNI</th>
              <th>Año Ingreso</th>
              <th>Estado</th>
              <th>Mód. Específicos Aprobados</th>
              <th>Mód. Comunes Aprobados</th>
            </tr>
          </thead>
          <tbody id="report-tbody">
            ${renderStudentRows(estudiantes, aprobaciones, modulos, submodulos)}
          </tbody>
        </table>
      </div>
    </div>
  `;

  // Panel
  panel.innerHTML = `
    <div class="widget">
      <div class="widget-header"><span class="widget-title">Estadísticas Generales</span></div>
      <div class="widget-stats">
        <div class="widget-stat">
          <div class="widget-stat-value">${estudiantes.length}</div>
          <div class="widget-stat-label">Estudiantes</div>
        </div>
        <div class="widget-stat">
          <div class="widget-stat-value">${aprobaciones.length}</div>
          <div class="widget-stat-label">Aprobaciones</div>
        </div>
      </div>
    </div>
    <div class="widget">
      <div class="widget-header"><span class="widget-title">Por Año</span></div>
      ${anios.map(a => {
    const count = estudiantes.filter(e => e.anio_ingreso === a).length;
    const pct = estudiantes.length > 0 ? Math.round((count / estudiantes.length) * 100) : 0;
    return `
          <div style="margin-bottom: 8px;">
            <div style="display: flex; justify-content: space-between; font-size: 0.8125rem; margin-bottom: 4px;">
              <span style="color: var(--text-secondary);">${a}</span>
              <span style="color: var(--text-primary); font-weight: 600;">${count}</span>
            </div>
            <div class="widget-bar"><div class="widget-bar-fill" style="width: ${pct}%"></div></div>
          </div>
        `;
  }).join('')}
    </div>
  `;

  // Filtrar
  document.getElementById('report-apply')?.addEventListener('click', () => {
    applyFilters(estudiantes, aprobaciones, modulos, submodulos);
  });

  // También filtrar al escribir
  document.getElementById('report-search')?.addEventListener('input', () => {
    applyFilters(estudiantes, aprobaciones, modulos, submodulos);
  });
}

function applyFilters(allEstudiantes, allAprobaciones, modulos, submodulos) {
  const searchVal = (document.getElementById('report-search')?.value || '').toLowerCase();
  const anioVal = document.getElementById('report-anio')?.value;
  const moduloVal = document.getElementById('report-modulo')?.value;
  const estadoVal = document.getElementById('report-estado')?.value;

  let filtered = [...allEstudiantes];

  // Filtrar por texto
  if (searchVal) {
    filtered = filtered.filter(e =>
      `${e.nombre} ${e.apellido} ${e.dni}`.toLowerCase().includes(searchVal)
    );
  }

  // Filtrar por año
  if (anioVal) {
    filtered = filtered.filter(e => e.anio_ingreso === parseInt(anioVal));
  }

  // Filtrar por estado
  if (estadoVal) {
    filtered = filtered.filter(e => e.estado === estadoVal);
  }

  // Filtrar por módulo aprobado
  if (moduloVal) {
    const estudiantesConModulo = allAprobaciones
      .filter(a => a.modulo_id === moduloVal)
      .map(a => a.estudiante_id);
    filtered = filtered.filter(e => estudiantesConModulo.includes(e.id));
  }

  const tbody = document.getElementById('report-tbody');
  if (tbody) {
    tbody.innerHTML = renderStudentRows(filtered, allAprobaciones, modulos, submodulos);
  }
}

function renderStudentRows(estudiantes, aprobaciones, modulos, submodulos) {
  if (estudiantes.length === 0) {
    return '<tr><td colspan="6" style="text-align: center; color: var(--text-muted); padding: 32px;">No se encontraron resultados</td></tr>';
  }

  return estudiantes.map(est => {
    const estAprobaciones = aprobaciones.filter(a => a.estudiante_id === est.id);
    const modulosAprobados = estAprobaciones
      .filter(a => a.modulo_id)
      .map(a => modulos.find(m => m.id === a.modulo_id)?.nombre || '')
      .filter(Boolean);
    const submodulosAprobados = estAprobaciones
      .filter(a => a.submodulo_id)
      .map(a => submodulos.find(s => s.id === a.submodulo_id)?.nombre || '')
      .filter(Boolean);

    return `
      <tr>
        <td><strong>${sanitize(est.nombre)} ${sanitize(est.apellido)}</strong></td>
        <td>${sanitize(est.dni)}</td>
        <td>${est.anio_ingreso}</td>
        <td><span class="badge ${est.estado === 'Activo' ? 'badge-active' : est.estado === 'Egresado' ? 'badge-approved' : 'badge-inactive'}">${est.estado}</span></td>
        <td>${modulosAprobados.length > 0 ? modulosAprobados.map(m => `<span class="badge badge-approved" style="margin: 2px;">${sanitize(m)}</span>`).join('') : '<span style="color: var(--text-muted);">—</span>'}</td>
        <td>${submodulosAprobados.length > 0 ? submodulosAprobados.map(s => `<span class="badge badge-pending" style="margin: 2px;">${sanitize(s)}</span>`).join('') : '<span style="color: var(--text-muted);">—</span>'}</td>
      </tr>
    `;
  }).join('');
}

export default { renderReportes };
