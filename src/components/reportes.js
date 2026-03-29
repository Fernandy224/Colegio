// ============================================
// Reportes y Búsqueda Avanzada
// ============================================
import { getContentArea, getPanelRight } from './layout.js';
import { icons, sanitize, formatDate, showToast, confirmDialog } from '../utils/helpers.js';
import { fetchAll, remove } from '../utils/data.js';

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
  const actas = await fetchAll('actas');

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
              <th>Doc.</th>
              <th>Mód. Específicos Aprobados</th>
              <th>Mód. Comunes Aprobados</th>
            </tr>
          </thead>
          <tbody id="report-tbody">
            ${renderStudentRows(estudiantes, aprobaciones, modulos, submodulos, trayectos, inscripciones, actas)}
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
    applyFilters(estudiantes, aprobaciones, modulos, submodulos, trayectos, inscripciones, actas);
    bindDocButtons(estudiantes, actas, submodulos, trayectos, inscripciones, seguimiento);
  });
  document.getElementById('report-search')?.addEventListener('input', () => {
    applyFilters(estudiantes, aprobaciones, modulos, submodulos, trayectos, inscripciones, actas);
    bindDocButtons(estudiantes, actas, submodulos, trayectos, inscripciones, seguimiento);
  });

  // Botones Docs iniciales
  bindDocButtons(estudiantes, actas, submodulos, trayectos, inscripciones, seguimiento);

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

function applyFilters(allEstudiantes, allAprobaciones, modulos, submodulos, trayectos, inscripciones, allActas) {
  const searchVal = (document.getElementById('report-search')?.value || '').toLowerCase();
  const anioVal = document.getElementById('report-anio')?.value;
  const moduloVal = document.getElementById('report-modulo')?.value;
  const estadoVal = document.getElementById('report-estado')?.value;

  let filtered = [...allEstudiantes];

  // ... (filtro lógico existente) ...
  // (Nota: se simplifica aquí por el multi_replace, se mantendrá la lógica original)

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
    tbody.innerHTML = renderStudentRows(filtered, allAprobaciones, modulos, submodulos, trayectos, inscripciones, allActas);
  }
}

function renderStudentRows(estudiantes, aprobaciones, modulos, submodulos, trayectos = [], inscripciones = [], allActas = []) {
  if (estudiantes.length === 0) {
    return '<tr><td colspan="8" style="text-align: center; color: var(--text-muted); padding: 32px;">No se encontraron resultados</td></tr>';
  }

  return estudiantes.map(est => {
    const estAprobaciones = aprobaciones.filter(a => a.estudiante_id === est.id);
    const estInscripciones = inscripciones.filter(i => i.estudiante_id === est.id);

    // Docs vinculadas directamente al estudiante
    const estActas = allActas.filter(a => a.estudiante_id === est.id);
    const cantDocs = estActas.length;

    // Siempre mostrar el botón: verde con cantidad si tiene docs, gris si no
    const docBtn = cantDocs > 0
      ? `<button class="btn-docs-ver" data-estid="${est.id}" title="Ver ${cantDocs} documento(s) de ${sanitize(est.nombre)}" style="background:rgba(16,185,129,0.12);color:#10b981;border:1px solid rgba(16,185,129,0.35);padding:3px 10px;border-radius:6px;font-size:0.75rem;cursor:pointer;font-weight:600;white-space:nowrap;transition:all 0.2s;">📄 ${cantDocs} doc${cantDocs !== 1 ? 's' : ''}</button>`
      : `<button class="btn-docs-ver" data-estid="${est.id}" title="Sin documentos aún — clic para ver historial" style="background:rgba(255,255,255,0.04);color:var(--text-muted);border:1px dashed rgba(255,255,255,0.15);padding:3px 10px;border-radius:6px;font-size:0.75rem;cursor:pointer;font-weight:500;white-space:nowrap;transition:all 0.2s;">📂 Ver</button>`;

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
      <tr class="report-student-row" data-estid="${est.id}" style="cursor:pointer;transition:background 0.15s;" title="Clic para ver documentación de ${sanitize(est.nombre)} ${sanitize(est.apellido)}">
        <td>
          <strong>${sanitize(est.nombre)} ${sanitize(est.apellido)}</strong>
        </td>
        <td>${sanitize(est.dni)}</td>
        <td>${trayectosCursados.length > 0 ? trayectosCursados.join('<br/>') : '<span style="color: var(--text-muted);">Sin trayectos</span>'}</td>
        <td>${est.anio_ingreso}</td>
        <td><span class="badge ${est.estado === 'Activo' ? 'badge-active' : est.estado === 'Egresado' ? 'badge-approved' : 'badge-inactive'}">${est.estado}</span></td>
        <td style="text-align:center;" class="doc-cell">${docBtn}</td>
        <td>${modulosAprobados.length > 0 ? modulosAprobados.map(m => `<span class="badge badge-approved" style="margin: 2px;">${sanitize(m)}</span>`).join('') : '<span style="color: var(--text-muted);">—</span>'}</td>
        <td>${submodulosAprobados.length > 0 ? submodulosAprobados.map(s => `<span class="badge badge-pending" style="margin: 2px;">${sanitize(s)}</span>`).join('') : '<span style="color: var(--text-muted);">—</span>'}</td>
      </tr>
    `;
  }).join('');
}

// ============================================
// BIND: Botones Ver Docs + filas clickeables
// ============================================
function bindDocButtons(estudiantes, allActas, submodulos, trayectos, inscripciones, seguimiento) {
  const openDocs = (estId) => {
    const est = estudiantes.find(e => e.id === estId);
    if (!est) return;
    const estActas = allActas.filter(a => a.estudiante_id === estId);
    openDocsModal(est, estActas, submodulos, trayectos, inscripciones, seguimiento);
  };

  // Botones explícitos de documentación
  document.querySelectorAll('.btn-docs-ver').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      openDocs(btn.dataset.estid);
    });

    // Efecto hover en el botón
    btn.addEventListener('mouseenter', () => {
      btn.style.transform = 'scale(1.05)';
      btn.style.filter = 'brightness(1.2)';
    });
    btn.addEventListener('mouseleave', () => {
      btn.style.transform = 'scale(1)';
      btn.style.filter = 'brightness(1)';
    });
  });

  // Clic en cualquier celda de la fila (excepto la celda de docs que ya tiene su botón)
  document.querySelectorAll('.report-student-row').forEach(row => {
    row.addEventListener('click', (e) => {
      // Si el clic fue sobre el botón de docs o dentro de él, no hacer doble apertura
      if (e.target.closest('.btn-docs-ver')) return;
      openDocs(row.dataset.estid);
    });

    // Efecto hover en la fila
    row.addEventListener('mouseenter', () => {
      row.style.background = 'rgba(139,92,246,0.07)';
    });
    row.addEventListener('mouseleave', () => {
      row.style.background = '';
    });
  });
}

// ============================================
// MODAL: Historial de documentación del estudiante
// ============================================
async function openDocsModal(est, estActas, submodulos, trayectos, inscripciones, seguimiento) {
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';

  // Array mutable local para poder actualizar sin recargar
  const actasLocales = [...estActas];

  overlay.innerHTML = `
    <div class="modal" style="max-width:650px;width:95vw;">
      <div class="modal-header">
        <h3 class="modal-title">📂 Documentación — ${sanitize(est.nombre)} ${sanitize(est.apellido)}</h3>
        <button class="modal-close" id="docs-modal-close">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>
      </div>
      <div class="modal-body" id="docs-modal-body">
        <!-- Se carga dinámicamente -->
      </div>
    </div>
  `;

  document.body.appendChild(overlay);
  overlay.querySelector('#docs-modal-close').addEventListener('click', () => overlay.remove());
  overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove(); });

  const body = overlay.querySelector('#docs-modal-body');

  const renderFilas = () => {
    const ordenadas = [...actasLocales].sort((a, b) =>
      new Date(b.fecha || b.created_at || 0) - new Date(a.fecha || a.created_at || 0)
    );

    // Actualizar contador del header
    const countHint = overlay.querySelector('#docs-count');
    if (countHint) countHint.textContent = `${ordenadas.length} documento(s)`;

    if (ordenadas.length === 0) {
      body.innerHTML = `
        <p style="font-size:0.78rem;color:var(--text-muted);margin-bottom:14px;">DNI: ${sanitize(est.dni)} · 0 documentos registrados</p>
        <div style="padding:32px;text-align:center;color:var(--text-muted);">No hay documentos registrados.</div>
      `;
      return;
    }

    body.innerHTML = `
      <p style="font-size:0.78rem;color:var(--text-muted);margin-bottom:14px;" id="docs-count">DNI: ${sanitize(est.dni)} · ${ordenadas.length} documento(s) registrado(s)</p>
      <div id="docs-list" style="display:flex;flex-direction:column;gap:8px;"></div>
    `;

    const list = body.querySelector('#docs-list');

    ordenadas.forEach(acta => {
      const submodulo = acta.submodulo_id ? submodulos.find(s => s.id === acta.submodulo_id) : null;
      const trayecto = acta.grupo_id ? trayectos.find(t => t.id === acta.grupo_id) : null;
      const condicion = acta.descripcion?.toUpperCase();
      const condicionColor = condicion === 'APROBADO' ? '#10b981' : condicion === 'DESAPROBADO' ? '#ef4444' : 'var(--text-muted)';
      const condicionBg = condicion === 'APROBADO' ? 'rgba(16,185,129,0.12)' : condicion === 'DESAPROBADO' ? 'rgba(239,68,68,0.12)' : 'rgba(255,255,255,0.05)';
      const fechaStr = acta.fecha ? formatDate(acta.fecha) : (acta.created_at ? formatDate(acta.created_at) : '—');

      const row = document.createElement('div');
      row.style.cssText = 'display:flex;justify-content:space-between;align-items:center;padding:12px 16px;background:rgba(255,255,255,0.03);border:1px solid var(--border-color);border-radius:10px;gap:12px;';
      row.innerHTML = `
        <div style="flex:1;min-width:0;">
          <div style="font-weight:600;font-size:0.88rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${sanitize(acta.nombre)}</div>
          <div style="font-size:0.73rem;color:var(--text-muted);margin-top:2px;">
            ${submodulo ? sanitize(submodulo.nombre) : ''}${submodulo && trayecto ? ' · ' : ''}${trayecto ? sanitize(trayecto.nombre) : ''} · ${fechaStr}
          </div>
        </div>
        <div style="display:flex;align-items:center;gap:8px;flex-shrink:0;">
          ${condicion ? `<span style="font-size:0.72rem;font-weight:700;padding:3px 9px;border-radius:999px;background:${condicionBg};color:${condicionColor};border:1px solid ${condicionColor}33;">${condicion}</span>` : ''}
          <button class="btn-pdf-acta" style="padding:4px 10px;background:rgba(139,92,246,0.15);color:var(--accent-purple-light);border:1px solid rgba(139,92,246,0.3);border-radius:6px;font-size:0.75rem;cursor:pointer;font-weight:600;transition:all 0.2s;">⬇️ PDF</button>
          <button class="btn-del-acta" title="Eliminar documento" style="background:rgba(239,68,68,0.1);color:#ef4444;border:1px solid rgba(239,68,68,0.3);border-radius:6px;padding:0;cursor:pointer;display:flex;align-items:center;justify-content:center;width:28px;height:28px;transition:all 0.2s;">${icons.trash}</button>
        </div>
      `;

      // Hover efectos
      const btnDel = row.querySelector('.btn-del-acta');
      const btnPdf = row.querySelector('.btn-pdf-acta');
      btnDel.addEventListener('mouseenter', () => { btnDel.style.background = 'rgba(239,68,68,0.3)'; btnDel.style.borderColor = 'rgba(239,68,68,0.7)'; });
      btnDel.addEventListener('mouseleave', () => { btnDel.style.background = 'rgba(239,68,68,0.1)'; btnDel.style.borderColor = 'rgba(239,68,68,0.3)'; });

      // Eliminar acta
      btnDel.addEventListener('click', () => {
        confirmDialog(`¿Eliminar "<strong>${sanitize(acta.nombre)}</strong>" del historial?<br><small style="color:var(--text-muted)">Esta acción no se puede deshacer.</small>`, async () => {
          try {
            await remove('actas', acta.id);
            const idx = actasLocales.findIndex(a => a.id === acta.id);
            if (idx !== -1) actasLocales.splice(idx, 1);
            renderFilas();
            showToast('Documento eliminado correctamente.');
          } catch (err) {
            showToast('Error al eliminar: ' + (err.message || 'Intente nuevamente.'), 'error');
          }
        });
      });

      // Re-generar PDF
      btnPdf.addEventListener('click', async () => {
        if (!acta.submodulo_id) {
          showToast('No hay datos suficientes para regenerar el PDF.', 'error');
          return;
        }
        btnPdf.textContent = '⏳ Generando...';
        btnPdf.disabled = true;
        try {
          const insc = inscripciones.find(i => i.estudiante_id === est.id && i.trayecto_id === acta.grupo_id);
          if (!insc) { showToast('No se encontró la inscripción del estudiante.', 'error'); return; }

          const seg = seguimiento.find(s => s.inscripcion_id === insc.id && s.submodulo_id === acta.submodulo_id);
          if (!seg || !seg.desempenos) { showToast('No se encontraron los datos de evaluación guardados.', 'error'); return; }

          const { generarPDFDesdeHistorial } = await import('./actas.js');
          const submodulo = submodulos.find(s => s.id === acta.submodulo_id);
          const trayecto = trayectos.find(t => t.id === acta.grupo_id);

          await generarPDFDesdeHistorial({
            estudiante: est,
            trayecto,
            modulo: submodulo,
            desempenos: seg.desempenos.criterios || {},
            observaciones: seg.desempenos.observaciones || '',
            condicion: seg.estado === 'Aprobado' ? 'APROBADO' : 'DESAPROBADO'
          });
          showToast('PDF regenerado correctamente.');
        } catch (err) {
          showToast('Error al regenerar el PDF: ' + err.message, 'error');
        } finally {
          btnPdf.textContent = '⬇️ PDF';
          btnPdf.disabled = false;
        }
      });

      list.appendChild(row);
    });
  };

  renderFilas();
}

export default { renderReportes };
