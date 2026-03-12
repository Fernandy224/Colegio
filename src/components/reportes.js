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
  const trayectos = await fetchAll('trayectos_formativos');
  const inscripciones = await fetchAll('inscripciones');
  const seguimiento = await fetchAll('seguimiento_modulos');

  // Años únicos
  const anios = [...new Set(estudiantes.map(e => e.anio_ingreso))].sort((a, b) => b - a);

  content.innerHTML = `
    <div class="section-header">
      <h1 class="section-title">Reportes y Consultas</h1>
    </div>

    <!-- Tabs para Reportes -->
    <div class="content-tabs" style="margin-bottom: 24px;">
      <button class="content-tab active" data-tab="general">Reporte General</button>
      <button class="content-tab" data-tab="egresados">Egresados por Trayecto</button>
    </div>

    <div id="tab-general" class="report-tab-content">
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
              <th>Trayectos</th>
              <th>Año Ingreso</th>
              <th>Estado</th>
              <th>Mód. Específicos Aprobados</th>
              <th>Mód. Comunes Aprobados</th>
            </tr>
          </thead>
          <tbody id="report-tbody">
            ${renderStudentRows(estudiantes, aprobaciones, modulos, submodulos, trayectos, inscripciones)}
          </tbody>
        </table>
      </div>
    </div>
    </div> <!-- tab-general -->

    <div id="tab-egresados" class="report-tab-content" style="display: none;">
      <div class="report-filters">
        <div class="report-filter-group">
          <span class="report-filter-label">Buscar estudiante</span>
          <div class="search-bar" style="max-width:none;">
            ${icons.search}
            <input type="text" id="report-egr-search" placeholder="Nombre, apellido o DNI..." />
          </div>
        </div>
        <div class="report-filter-group">
          <span class="report-filter-label">Trayecto Formativo</span>
          <select class="form-select" id="report-egr-trayecto">
            <option value="">Todos</option>
            ${trayectos.map(t => `<option value="${t.id}">${sanitize(t.nombre)}</option>`).join('')}
          </select>
        </div>
        <div class="report-filter-group" style="justify-content: flex-end;">
          <button class="btn btn-primary" id="report-egr-apply" style="margin-top: auto;">
            ${icons.search} Buscar
          </button>
        </div>
      </div>

      <div id="report-egr-results">
        <div class="table-container">
          <table class="table">
            <thead>
              <tr>
                <th>Estudiante</th>
                <th>DNI</th>
                <th>Trayecto Formativo</th>
                <th>Año Finalización</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody id="report-egr-tbody">
              ${renderEgresadosRows(estudiantes, inscripciones, trayectos, seguimiento)}
            </tbody>
          </table>
        </div>
      </div>
    </div> <!-- tab-egresados -->
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

  // Tabs events
  content.querySelectorAll('.content-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      content.querySelectorAll('.content-tab').forEach(t => t.classList.remove('active'));
      content.querySelectorAll('.report-tab-content').forEach(c => c.style.display = 'none');

      tab.classList.add('active');
      const tabId = tab.dataset.tab;
      document.getElementById(`tab-${tabId}`).style.display = 'block';
    });
  });

  // Filtrar General
  document.getElementById('report-apply')?.addEventListener('click', () => {
    applyFilters(estudiantes, aprobaciones, modulos, submodulos, trayectos, inscripciones);
  });
  document.getElementById('report-search')?.addEventListener('input', () => {
    applyFilters(estudiantes, aprobaciones, modulos, submodulos, trayectos, inscripciones);
  });

  // Filtrar Egresados
  document.getElementById('report-egr-apply')?.addEventListener('click', () => {
    applyEgresadosFilters(estudiantes, inscripciones, trayectos, seguimiento);
  });
  document.getElementById('report-egr-search')?.addEventListener('input', () => {
    applyEgresadosFilters(estudiantes, inscripciones, trayectos, seguimiento);
  });
}

function applyEgresadosFilters(estudiantes, inscripciones, trayectos, seguimiento) {
  const searchVal = (document.getElementById('report-egr-search')?.value || '').toLowerCase();
  const trayectoVal = document.getElementById('report-egr-trayecto')?.value;

  let filteredEstudiantes = [...estudiantes];

  if (searchVal) {
    filteredEstudiantes = filteredEstudiantes.filter(e =>
      `${e.nombre} ${e.apellido} ${e.dni}`.toLowerCase().includes(searchVal)
    );
  }

  const tbody = document.getElementById('report-egr-tbody');
  if (tbody) {
    tbody.innerHTML = renderEgresadosRows(filteredEstudiantes, inscripciones, trayectos, seguimiento, trayectoVal);
  }
}

function renderEgresadosRows(estudiantes, inscripciones, trayectos, seguimiento, trayectoFilter = '') {
  // Filtrar solo inscripciones completas/finalizadas
  let completas = inscripciones.filter(i => i.estado === 'Completo' || i.estado === 'Finalizado');

  if (trayectoFilter) {
    completas = completas.filter(i => i.trayecto_id === trayectoFilter);
  }

  // Mapear a formato de fila
  const rowsData = [];

  completas.forEach(insc => {
    const est = estudiantes.find(e => e.id === insc.estudiante_id);
    const tray = trayectos.find(t => t.id === insc.trayecto_id);

    if (est && tray) {
      // Determinar año de finalización buscando la fecha de aprobación más reciente
      const segs = seguimiento.filter(s => s.inscripcion_id === insc.id && s.fecha_aprobacion);
      let anioFin = est.anio_ingreso; // fallback

      if (segs.length > 0) {
        // Ordenar por fecha descendente
        segs.sort((a, b) => new Date(b.fecha_aprobacion) - new Date(a.fecha_aprobacion));
        const lastDate = new Date(segs[0].fecha_aprobacion);
        if (!isNaN(lastDate.getFullYear())) {
          anioFin = lastDate.getFullYear();
        }
      }

      rowsData.push({
        estudiante: est,
        trayecto: tray,
        anio: anioFin,
        estado: insc.estado
      });
    }
  });

  if (rowsData.length === 0) {
    return '<tr><td colspan="5" style="text-align: center; color: var(--text-muted); padding: 32px;">No se encontraron egresados con los filtros actuales</td></tr>';
  }

  // Ordenar por año desc, luego por trayecto, luego por apellido
  rowsData.sort((a, b) => {
    if (b.anio !== a.anio) return b.anio - a.anio;
    const trayCmp = a.trayecto.nombre.localeCompare(b.trayecto.nombre);
    if (trayCmp !== 0) return trayCmp;
    return a.estudiante.apellido.localeCompare(b.estudiante.apellido);
  });

  return rowsData.map(data => {
    const estadoClass = data.estado === 'Finalizado' ? 'badge-active' : 'badge-approved';
    return `
      <tr>
        <td><strong>${sanitize(data.estudiante.nombre)} ${sanitize(data.estudiante.apellido)}</strong></td>
        <td>${sanitize(data.estudiante.dni)}</td>
        <td>${sanitize(data.trayecto.nombre)}</td>
        <td>${data.anio}</td>
        <td><span class="badge ${estadoClass}">${data.estado}</span></td>
      </tr>
    `;
  }).join('');
}

function applyFilters(allEstudiantes, allAprobaciones, modulos, submodulos, trayectos, inscripciones) {
  const searchVal = (document.getElementById('report-search')?.value || '').toLowerCase();
  const anioVal = document.getElementById('report-anio')?.value;
  const moduloVal = document.getElementById('report-modulo')?.value;
  const estadoVal = document.getElementById('report-estado')?.value;

  let filtered = [...allEstudiantes];

  // Filtrar por texto
  if (searchVal) {
    filtered = filtered.filter(e =>
      `${e.nombre} ${e.apellido} ${e.dni} `.toLowerCase().includes(searchVal)
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
    tbody.innerHTML = renderStudentRows(filtered, allAprobaciones, modulos, submodulos, trayectos, inscripciones);
  }
}

function renderStudentRows(estudiantes, aprobaciones, modulos, submodulos, trayectos = [], inscripciones = []) {
  if (estudiantes.length === 0) {
    return '<tr><td colspan="7" style="text-align: center; color: var(--text-muted); padding: 32px;">No se encontraron resultados</td></tr>';
  }

  return estudiantes.map(est => {
    const estAprobaciones = aprobaciones.filter(a => a.estudiante_id === est.id);
    const estInscripciones = inscripciones.filter(i => i.estudiante_id === est.id);
    
    const trayectosCursados = estInscripciones.map(i => {
      const t = trayectos.find(tray => tray.id === i.trayecto_id);
      if (!t) return null;
      let badgeClass = 'badge-pending';
      if (i.estado === 'Finalizado' || i.estado === 'Completo') badgeClass = 'badge-active';
      else if (i.estado === 'Abandono') badgeClass = 'badge-inactive';
      
      return `<span class="badge ${badgeClass}" style="margin: 2px;">${sanitize(t.nombre)} <small style="opacity:0.8;">(${i.estado || 'En curso'})</small></span>`;
    }).filter(Boolean);

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
        <td>${trayectosCursados.length > 0 ? trayectosCursados.join('<br/>') : '<span style="color: var(--text-muted);">Sin trayectos</span>'}</td>
        <td>${est.anio_ingreso}</td>
        <td><span class="badge ${est.estado === 'Activo' ? 'badge-active' : est.estado === 'Egresado' ? 'badge-approved' : 'badge-inactive'}">${est.estado}</span></td>
        <td>${modulosAprobados.length > 0 ? modulosAprobados.map(m => `<span class="badge badge-approved" style="margin: 2px;">${sanitize(m)}</span>`).join('') : '<span style="color: var(--text-muted);">—</span>'}</td>
        <td>${submodulosAprobados.length > 0 ? submodulosAprobados.map(s => `<span class="badge badge-pending" style="margin: 2px;">${sanitize(s)}</span>`).join('') : '<span style="color: var(--text-muted);">—</span>'}</td>
      </tr>
    `;
  }).join('');
}

export default { renderReportes };
