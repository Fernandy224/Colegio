// ============================================
// Registro de Aprobaciones
// ============================================
import { getContentArea, getPanelRight } from './layout.js';
import { icons, showToast, sanitize, formatDate } from '../utils/helpers.js';
import { fetchAll } from '../utils/data.js';

export async function renderAprobaciones() {
  const content = getContentArea();
  const panel = getPanelRight();

  const trayectos = await fetchAll('trayectos_formativos');
  const estudiantes = await fetchAll('estudiantes');
  const inscripciones = await fetchAll('inscripciones');

  // Icono de carpeta SVG
  const folderIcon = `<svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: var(--accent-blue);"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>`;

  let totalAprobadosGlobal = 0;
  let totalDesaprobadosGlobal = 0;

  content.innerHTML = `
    <div class="section-header">
      <h1 class="section-title">Aprobaciones por Trayecto Formativo</h1>
    </div>

    ${trayectos.length === 0 ? `
      <div class="empty-state">
        ${icons.trayectos}
        <h3 class="empty-state-title">No hay trayectos formativos</h3>
        <p class="empty-state-text">Creá trayectos e inscribí estudiantes para ver sus aprobaciones.</p>
      </div>
    ` : `
      <div class="trayectos-aprobaciones-list">
        ${trayectos.map(tray => {
    const inscriptos = inscripciones.filter(i => i.trayecto_id === tray.id);
    let aprobados = 0;
    let desaprobados = 0;
    let enCurso = 0;

    const filasEstudiantes = inscriptos.map(insc => {
      const est = estudiantes.find(e => e.id === insc.estudiante_id);
      if (!est) return '';

      let estadoFinal = 'En curso';
      let badgeClass = 'en-curso';

      if (insc.estado === 'Finalizado' || insc.estado === 'Completo') {
        estadoFinal = 'Aprobado';
        badgeClass = 'completo';
        aprobados++;
        totalAprobadosGlobal++;
      } else if (insc.estado === 'Abandonado') {
        estadoFinal = 'Desaprobado';
        badgeClass = 'abandonado';
        desaprobados++;
        totalDesaprobadosGlobal++;
      } else {
        enCurso++;
      }

      return `
          <tr>
            <td>
              <div style="display:flex;align-items:center;gap:8px;">
                <div>
                  <div style="font-weight:600;">${sanitize(est.nombre)} ${sanitize(est.apellido)}</div>
                  <div style="font-size:0.75rem;color:var(--text-muted);">DNI: ${sanitize(est.dni)}</div>
                </div>
              </div>
            </td>
            <td>${formatDate(insc.fecha_inscripcion)}</td>
            <td><span class="estado-badge ${badgeClass}">${estadoFinal}</span></td>
          </tr>
        `;
    }).join('');

    return `
        <div class="modulo-grupo" style="margin-bottom: 2.5rem; background: var(--bg-card); border: 1px solid var(--border-color); border-radius: 12px; overflow: hidden;">
          <div style="display:flex;align-items:center;justify-content:space-between;padding:16px 20px;background:rgba(255,255,255,0.02);border-bottom:1px solid rgba(255,255,255,0.05);cursor:pointer;" class="trayecto-header" data-id="${tray.id}">
            <div style="display:flex;align-items:center;gap:12px;">
              ${folderIcon}
              <h3 style="color:var(--text-primary);font-size:1.1rem;font-weight:600;margin:0;">${sanitize(tray.nombre)}</h3>
            </div>
            <div style="display:flex;gap:8px;font-size:0.8rem;">
              <span style="background:rgba(16,185,129,0.15);color:var(--accent-green);padding:4px 10px;border-radius:999px;">${aprobados} Aprobados</span>
              <span style="background:rgba(239,68,68,0.15);color:var(--accent-red);padding:4px 10px;border-radius:999px;">${desaprobados} Desaprobados</span>
              <span style="background:rgba(59,130,246,0.15);color:var(--accent-blue);padding:4px 10px;border-radius:999px;">${enCurso} En curso</span>
              <span style="margin-left:8px;color:var(--text-muted); transition: transform 0.3s;" class="chevron" id="chevron-${tray.id}">${icons.chevronDown}</span>
            </div>
          </div>
          <div class="trayecto-body" id="body-${tray.id}" style="display:none; padding: 0;">
            ${inscriptos.length === 0 ? `
              <div style="padding: 20px; text-align: center; color: var(--text-muted); font-size: 0.9rem;">
                No hay estudiantes inscriptos en este trayecto.
              </div>
            ` : `
              <div class="table-container" style="border:none; border-radius:0;">
                <table class="table" style="margin:0;">
                  <thead>
                    <tr>
                      <th>Estudiante</th>
                      <th>Fecha Inscripción</th>
                      <th>Estado Final</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${filasEstudiantes}
                  </tbody>
                </table>
              </div>
            `}
          </div>
        </div>
      `;
  }).join('')}
      </div>
    `}
    <style>
      .estado-badge { padding: 4px 10px; border-radius: 999px; font-size: 0.7rem; font-weight: 600; display: inline-block; }
      .estado-badge.en-curso { background: rgba(59,130,246,0.15); color: var(--accent-blue); }
      .estado-badge.completo { background: rgba(16,185,129,0.15); color: var(--accent-green); }
      .estado-badge.abandonado { background: rgba(239,68,68,0.15); color: var(--accent-red); }
    </style>
  `;

  // Panel
  panel.innerHTML = `
    <div class="widget">
      <div class="widget-header"><span class="widget-title">Resumen Histórico General</span></div>
      <div class="widget-stats">
        <div class="widget-stat">
          <div class="widget-stat-value">${totalAprobadosGlobal}</div>
          <div class="widget-stat-label">Total Aprobados</div>
        </div>
        <div class="widget-stat">
          <div class="widget-stat-value">${totalDesaprobadosGlobal}</div>
          <div class="widget-stat-label">Total Desaprobados</div>
        </div>
      </div>
      <div class="widget-bar" style="margin-top: 12px;">
        <div class="widget-bar-fill" style="width: ${totalAprobadosGlobal + totalDesaprobadosGlobal > 0 ? Math.round((totalAprobadosGlobal / (totalAprobadosGlobal + totalDesaprobadosGlobal)) * 100) : 0}%; background: linear-gradient(90deg, #10b981, #34d399);"></div>
      </div>
    </div>
  `;

  // Eventos de acordeón
  document.querySelectorAll('.trayecto-header').forEach(header => {
    header.addEventListener('click', () => {
      const id = header.dataset.id;
      const body = document.getElementById(`body-${id}`);
      const chevron = document.getElementById(`chevron-${id}`);
      if (body.style.display === 'none') {
        body.style.display = 'block';
        chevron.style.transform = 'rotate(180deg)';
      } else {
        body.style.display = 'none';
        chevron.style.transform = 'rotate(0deg)';
      }
    });
  });
}

function openAprobacionModal(estudiantes, modulos, submodulos) {
  const today = new Date().toISOString().split('T')[0];

  const formHTML = `
    <div class="form-group">
      <label class="form-label">Estudiante</label>
      <select class="form-select" id="apr-estudiante" required>
        <option value="">Seleccionar estudiante...</option>
        ${estudiantes.map(e => `<option value="${e.id}">${sanitize(e.nombre)} ${sanitize(e.apellido)} (DNI: ${sanitize(e.dni)})</option>`).join('')}
      </select>
    </div>
    <div class="form-group">
      <label class="form-label">Módulo Específico (opcional si se selecciona módulo común)</label>
      <select class="form-select" id="apr-modulo">
        <option value="">Sin módulo</option>
        ${modulos.map(m => `<option value="${m.id}">${sanitize(m.nombre)}</option>`).join('')}
      </select>
    </div>
    <div class="form-group">
      <label class="form-label">Módulo Común (opcional si se selecciona módulo específico)</label>
      <select class="form-select" id="apr-submodulo">
        <option value="">Sin submódulo</option>
        ${submodulos.map(s => {
    const mod = modulos.find(m => m.id === s.modulo_id);
    return `<option value="${s.id}">${sanitize(s.nombre)} ${mod ? `(${sanitize(mod.nombre)})` : ''}</option>`;
  }).join('')}
      </select>
    </div>
    <div class="form-row">
      <div class="form-group">
        <label class="form-label">Fecha de Aprobación</label>
        <input type="date" class="form-input" id="apr-fecha" value="${today}" required />
      </div>
      <div class="form-group">
        <label class="form-label">Nota (opcional, 1-10)</label>
        <input type="number" class="form-input" id="apr-nota" min="1" max="10" step="0.5" placeholder="Ej: 8" />
      </div>
    </div>
  `;

  const footerHTML = `
    <button class="btn btn-secondary" id="modal-cancel">Cancelar</button>
    <button class="btn btn-primary" id="modal-save">Registrar Aprobación</button>
  `;

  const overlay = createModal('Registrar Aprobación', formHTML, footerHTML);

  overlay.querySelector('#modal-cancel').addEventListener('click', () => overlay.remove());
  overlay.querySelector('#modal-save').addEventListener('click', async () => {
    const estudiante_id = document.getElementById('apr-estudiante').value;
    const modulo_id = document.getElementById('apr-modulo').value || null;
    const submodulo_id = document.getElementById('apr-submodulo').value || null;
    const fecha = document.getElementById('apr-fecha').value;
    const notaVal = document.getElementById('apr-nota').value;
    const nota = notaVal ? parseFloat(notaVal) : null;

    if (!estudiante_id) { showToast('Seleccioná un estudiante', 'error'); return; }
    if (!modulo_id && !submodulo_id) { showToast('Seleccioná al menos un módulo específico o común', 'error'); return; }
    if (!fecha) { showToast('Ingresá la fecha', 'error'); return; }

    try {
      await create('aprobaciones', { estudiante_id, modulo_id, submodulo_id, fecha, nota });
      showToast('Aprobación registrada');
      overlay.remove();
      renderAprobaciones();
    } catch (err) {
      showToast(err.message || 'Error', 'error');
    }
  });
}

export default { renderAprobaciones };
