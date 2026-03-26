// ============================================
// Planilla de Asistencia
// Para Trayectos Formativos y Módulos Comunes
// ============================================
import { icons, showToast, createModal, sanitize, formatDate } from '../utils/helpers.js';
import { getSupabase } from '../supabaseClient.js';

// ============================================
// FUNCIÓN PRINCIPAL — Renderiza el tab de asistencia
// tipo: 'trayecto' | 'modulo_comun'
// contextId: UUID del trayecto o módulo común
// estudiantes: array de objetos estudiante inscriptos
// ============================================
export async function renderAsistenciaTab(tipo, contextId, estudiantes, trayectoId = null) {
  let registros = [];
  try {
    let query = getSupabase().from('asistencias').select('*').order('fecha_clase', { ascending: true });

    if (tipo === 'trayecto') {
      query = query.eq('trayecto_id', contextId).is('modulo_comun_id', null);
    } else {
      query = query.eq('modulo_comun_id', contextId).eq('trayecto_id', trayectoId);
    }

    const { data, error } = await query;
    if (error) throw error;
    registros = data || [];
  } catch (err) {
    console.error('[Asistencia] Error cargando registros:', err);
  }

  // Obtener fechas únicas de clase, ordenadas
  const fechasSet = new Set(registros.map(r => r.fecha_clase));
  const fechasClase = [...fechasSet].sort();

  return buildAsistenciaHTML(tipo, contextId, estudiantes, fechasClase, registros, trayectoId);
}

// ============================================
// CONSTRUIR HTML DE LA PLANILLA
// ============================================
function buildAsistenciaHTML(tipo, contextId, estudiantes, fechasClase, registros, trayectoId = null) {
  if (estudiantes.length === 0) {
    return `
      <div class="empty-state" style="padding:32px;">
        <p class="empty-state-text">No hay estudiantes inscriptos para registrar asistencia.</p>
      </div>`;
  }

  const tabla = buildTabla(estudiantes, fechasClase, registros);

  return `
    <div class="asistencia-wrap">
      <div class="asistencia-toolbar">
        <div style="display:flex;gap:8px;align-items:center;">
          <button class="btn btn-add" id="btn-agregar-fecha">
            ${icons.plus} Registrar Clase
          </button>
          <span style="font-size:0.8rem;color:var(--text-muted);">
            ${fechasClase.length} clase${fechasClase.length !== 1 ? 's' : ''} registrada${fechasClase.length !== 1 ? 's' : ''}
          </span>
          <span style="font-size:0.8rem;color:var(--text-muted);padding-left:8px;border-left:1px solid var(--border-color);">
            👥 ${estudiantes.length} estudiante${estudiantes.length !== 1 ? 's' : ''}
          </span>
        </div>
        <div style="display:flex;gap:8px;">
          <button class="btn btn-secondary" id="btn-exportar-excel" title="Exportar a Excel">
            📊 Excel
          </button>
          <button class="btn btn-secondary" id="btn-exportar-pdf" title="Exportar a PDF">
            🖨️ PDF
          </button>
        </div>
      </div>

      ${tabla}

      <div style="display:flex;gap:24px;margin-top:12px;flex-wrap:wrap;font-size:0.75rem;color:var(--text-muted);">
        <span><span class="asistencia-celda presente" style="display:inline-block;width:16px;height:16px;border-radius:4px;vertical-align:middle;margin-right:4px;"></span>Presente</span>
        <span><span class="asistencia-celda ausente" style="display:inline-block;width:16px;height:16px;border-radius:4px;vertical-align:middle;margin-right:4px;"></span>Ausente</span>
        <span>Condición: <strong style="color:var(--accent-green);">≥80% Aprueba</strong> · <strong style="color:var(--accent-orange);">60-79% Regular</strong> · <strong style="color:var(--accent-red);">&lt;60% Insuficiente</strong></span>
      </div>
    </div>

    <style>
      .asistencia-wrap { padding-bottom: 16px; }
      .asistencia-toolbar {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 16px;
        flex-wrap: wrap;
        gap: 8px;
      }
      .asistencia-table-container {
        overflow-x: auto;
        border-radius: 12px;
        border: 1px solid var(--border-color);
      }
      .asistencia-table {
        width: 100%;
        border-collapse: collapse;
        font-size: 0.8125rem;
        min-width: 500px;
      }
      .asistencia-table th {
        background: var(--bg-secondary);
        padding: 10px 12px;
        text-align: center;
        font-weight: 600;
        color: var(--text-secondary);
        font-size: 0.75rem;
        text-transform: uppercase;
        letter-spacing: 0.4px;
        border-bottom: 1px solid var(--border-color);
        white-space: nowrap;
      }
      .asistencia-table th.col-num,
      .asistencia-table td.col-num {
        text-align: center;
        font-size: 0.72rem;
        color: var(--text-muted);
        font-weight: 600;
        width: 36px;
        min-width: 36px;
        padding: 8px 4px;
      }
      .asistencia-table th.col-estudiante {
        text-align: left;
        position: sticky;
        left: 0;
        background: var(--bg-secondary);
        z-index: 2;
        min-width: 180px;
      }
      .asistencia-table td {
        padding: 8px 12px;
        text-align: center;
        border-bottom: 1px solid var(--border-color);
        vertical-align: middle;
      }
      .asistencia-table td.col-estudiante {
        text-align: left;
        position: sticky;
        left: 0;
        background: var(--bg-card);
        z-index: 1;
      }
      .asistencia-table tr:hover td { background: var(--bg-card-hover) !important; }
      .asistencia-table tr:last-child td { border-bottom: none; }
      .asistencia-celda {
        width: 32px;
        height: 32px;
        border-radius: 8px;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        transition: all 0.15s ease;
        border: 2px solid transparent;
        font-size: 0.9rem;
        font-weight: 700;
        user-select: none;
      }
      .asistencia-celda.presente {
        background: rgba(16, 185, 129, 0.2);
        border-color: rgba(16, 185, 129, 0.4);
        color: var(--accent-green);
      }
      .asistencia-celda.ausente {
        background: rgba(239, 68, 68, 0.12);
        border-color: rgba(239, 68, 68, 0.25);
        color: var(--accent-red);
      }
      .asistencia-celda:hover {
        transform: scale(1.15);
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      }
      .asistencia-celda.loading {
        opacity: 0.4;
        pointer-events: none;
      }
      .asistencia-pct-wrap {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 4px;
        min-width: 90px;
      }
      .asistencia-pct-bar-bg {
        width: 70px;
        height: 6px;
        background: rgba(255,255,255,0.08);
        border-radius: 3px;
        overflow: hidden;
      }
      .asistencia-pct-bar-fill {
        height: 100%;
        border-radius: 3px;
        transition: width 0.4s ease;
      }
      .asistencia-pct-bar-fill.verde { background: var(--accent-green); }
      .asistencia-pct-bar-fill.amarillo { background: var(--accent-orange); }
      .asistencia-pct-bar-fill.rojo { background: var(--accent-red); }
      .condicion-badge {
        padding: 3px 10px;
        border-radius: 999px;
        font-size: 0.68rem;
        font-weight: 700;
        white-space: nowrap;
        display: inline-block;
      }
      .condicion-badge.verde {
        background: rgba(16, 185, 129, 0.15);
        color: var(--accent-green);
      }
      .condicion-badge.amarillo {
        background: rgba(245, 158, 11, 0.15);
        color: var(--accent-orange);
      }
      .condicion-badge.rojo {
        background: rgba(239, 68, 68, 0.15);
        color: var(--accent-red);
      }
      .fecha-col-header {
        cursor: pointer;
        transition: color 0.15s;
        position: relative;
        padding-bottom: 24px !important; /* espacio para el ícono de información */
      }
      .fecha-col-header:hover { color: var(--accent-purple-light); }
      .fecha-col-header .del-fecha-btn {
        display: none;
        position: absolute;
        top: -6px;
        right: -2px;
        width: 16px;
        height: 16px;
        background: var(--accent-red);
        color: white;
        border-radius: 999px;
        font-size: 0.6rem;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        font-weight: 700;
        line-height: 1;
      }
      .fecha-col-header:hover .del-fecha-btn { display: flex; }
      .info-tema-btn {
        position: absolute;
        bottom: 2px;
        left: 50%;
        transform: translateX(-50%);
        font-size: 0.85rem;
        cursor: pointer;
        opacity: 0.5;
        transition: opacity 0.2s, transform 0.2s;
        background: transparent;
        border: none;
        padding: 2px;
      }
      .info-tema-btn:hover { 
        opacity: 1; 
        transform: translateX(-50%) scale(1.2); 
      }
      @media print {
        .asistencia-toolbar { display: none !important; }
        .asistencia-table-container { border: 1px solid #ccc; }
        .asistencia-celda.presente::after { content: "P"; }
        .asistencia-celda.ausente::after { content: "A"; }
        .info-tema-btn, .del-fecha-btn { display: none !important; }
      }
    </style>
  `;
}

// ============================================
// CONSTRUIR TABLA HTML
// ============================================
function buildTabla(estudiantes, fechasClase, registros) {
  if (fechasClase.length === 0) {
    return `
      <div style="text-align:center;padding:40px;border:1px dashed var(--border-color);border-radius:12px;color:var(--text-muted);">
        <div style="font-size:2rem;margin-bottom:12px;">📋</div>
        <p style="font-size:0.9rem;">No hay fechas de clase registradas.<br>Usá el botón <strong>Registrar Clase</strong> para agregar la primera.</p>
      </div>`;
  }

  const headFechas = fechasClase.map(fecha => {
    const regConTema = registros.find(r => r.fecha_clase === fecha && r.tema_clase);
    const tema = regConTema ? sanitize(regConTema.tema_clase) : 'Sin tema registrado';
    const icono = regConTema ? '📝' : '📄';

    return `
    <th class="fecha-col-header" data-fecha="${fecha}">
      ${formatFechaCorta(fecha)}
      <button class="info-tema-btn" title="Tema: ${tema}" data-fecha="${fecha}" data-tema="${tema}">
        ${icono}
      </button>
      <span class="del-fecha-btn" data-fecha="${fecha}" title="Eliminar esta fecha">✕</span>
    </th>
    `}).join('');

  const rows = estudiantes.map((est, index) => {
    const rowRegistros = registros.filter(r => r.estudiante_id === est.id);
    const presentes = rowRegistros.filter(r => r.presente).length;
    const totalClases = fechasClase.length;
    const pct = totalClases > 0 ? Math.round((presentes / totalClases) * 100) : 0;
    const nivel = pct >= 80 ? 'verde' : pct >= 60 ? 'amarillo' : 'rojo';
    const condicion = pct >= 80 ? 'Condición de aprobar' : pct >= 60 ? 'Regular' : 'Asistencia insuficiente';

    const celdas = fechasClase.map(fecha => {
      const reg = rowRegistros.find(r => r.fecha_clase === fecha);
      const presente = reg?.presente ?? false;
      return `
        <td>
          <div class="asistencia-celda ${presente ? 'presente' : 'ausente'}"
            data-estid="${est.id}"
            data-fecha="${fecha}"
            data-regid="${reg?.id || ''}"
            data-presente="${presente}"
            title="${est.nombre} ${est.apellido} — ${formatFechaCorta(fecha)}: ${presente ? 'Presente' : 'Ausente'}">
            ${presente ? '✓' : '✗'}
          </div>
        </td>`;
    }).join('');

    return `
      <tr>
        <td class="col-num">${index + 1}</td>
        <td class="col-estudiante">
          <div style="display:flex;align-items:center;gap:8px;">
            <div style="width:28px;height:28px;border-radius:999px;background:var(--gradient-primary);display:flex;align-items:center;justify-content:center;font-size:0.65rem;font-weight:700;color:white;flex-shrink:0;">
              ${(est.nombre?.charAt(0) || '?').toUpperCase()}${(est.apellido?.charAt(0) || '').toUpperCase()}
            </div>
            <div>
              <div style="font-weight:600;color:var(--text-primary);line-height:1.2;">${sanitize(est.nombre)} ${sanitize(est.apellido)}</div>
              <div style="font-size:0.7rem;color:var(--text-muted);">DNI: ${sanitize(est.dni || '-')}</div>
            </div>
          </div>
        </td>
        ${celdas}
        <td>
          <div class="asistencia-pct-wrap">
            <div style="font-size:0.85rem;font-weight:700;color:var(--${nivel === 'verde' ? 'accent-green' : nivel === 'amarillo' ? 'accent-orange' : 'accent-red'});">${pct}%</div>
            <div class="asistencia-pct-bar-bg">
              <div class="asistencia-pct-bar-fill ${nivel}" style="width:${pct}%;"></div>
            </div>
            <div style="font-size:0.65rem;color:var(--text-muted);">${presentes}/${totalClases}</div>
          </div>
        </td>
        <td>
          <span class="condicion-badge ${nivel}">${condicion}</span>
        </td>
      </tr>`;
  }).join('');

  return `
    <div class="asistencia-table-container">
      <table class="asistencia-table">
        <thead>
          <tr>
            <th class="col-num">#</th>
            <th class="col-estudiante">Estudiante</th>
            ${headFechas}
            <th>% Asistencia</th>
            <th>Condición</th>
          </tr>
        </thead>
        <tbody>
          ${rows}
        </tbody>
      </table>
    </div>`;
}
// ============================================
// BIND DE EVENTOS (llamar después de setear innerHTML)
// ============================================
export function bindAsistenciaEvents(tipo, contextId, estudiantes, container, trayectoId = null) {
  // Toggle de presencia
  container.querySelectorAll('.asistencia-celda').forEach(celda => {
    celda.addEventListener('click', async (e) => {
      e.stopPropagation();
      if (celda.classList.contains('loading')) return;
      await toggleAsistencia(celda, contextId, tipo, estudiantes, container, trayectoId);
    });
  });

  // Botón: Registrar Clase
  container.querySelector('#btn-agregar-fecha')?.addEventListener('click', () => {
    openAgregarFechaModal(tipo, contextId, estudiantes, container, trayectoId);
  });

  // Eliminar fecha (botón ✕ en el header)
  container.querySelectorAll('.del-fecha-btn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      const fecha = btn.dataset.fecha;
      if (!confirm(`¿Eliminar todos los registros de la fecha ${formatFechaCorta(fecha)}?`)) return;
      await eliminarFecha(fecha, contextId, tipo, estudiantes, container, trayectoId);
    });
  });

  // Editar tema (botón 📝 en el header)
  container.querySelectorAll('.info-tema-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const fecha = btn.dataset.fecha;
      const tema = btn.dataset.tema;
      openEditarTemaModal(fecha, tema, contextId, tipo, estudiantes, container, trayectoId);
    });
  });

  // Exportar Excel
  container.querySelector('#btn-exportar-excel')?.addEventListener('click', () => {
    exportarExcel(tipo, contextId, estudiantes, container, trayectoId);
  });

  // Exportar PDF
  container.querySelector('#btn-exportar-pdf')?.addEventListener('click', () => {
    exportarPDF(tipo, contextId, trayectoId);
  });
}

async function refreshAsistenciaContainer(tipo, contextId, estudiantes, container, trayectoId = null) {
  try {
    const html = await renderAsistenciaTab(tipo, contextId, estudiantes, trayectoId);
    container.innerHTML = html;
    bindAsistenciaEvents(tipo, contextId, estudiantes, container, trayectoId);
  } catch (err) {
    console.error('Error refrescando contenedor:', err);
  }
}

// ============================================
// TOGGLE PRESENTE/AUSENTE
// ============================================
async function toggleAsistencia(celda, contextId, tipo, estudiantes, container, trayectoId) {
  const estudianteId = celda.dataset.estid;
  const fecha = celda.dataset.fecha;
  const regId = celda.dataset.regid;
  const presenteActual = celda.dataset.presente === 'true';
  const nuevoValor = !presenteActual;

  celda.classList.add('loading');

  try {
    const sb = getSupabase();
    let resultado;

    if (regId) {
      // Actualizar existente
      const { data, error } = await sb
        .from('asistencias')
        .update({ presente: nuevoValor })
        .eq('id', regId)
        .select()
        .single();
      if (error) throw error;
      resultado = data;
    } else {
      // Crear nuevo
      const payload = {
        estudiante_id: estudianteId,
        fecha_clase: fecha,
        presente: nuevoValor
      };

      if (tipo === 'trayecto') {
        payload.trayecto_id = contextId;
        payload.modulo_comun_id = null;
      } else {
        payload.modulo_comun_id = contextId;
        payload.trayecto_id = trayectoId;
      }

      const { data, error } = await sb
        .from('asistencias')
        .insert(payload)
        .select()
        .single();
      if (error) throw error;
      resultado = data;
    }

    // Actualizar UI sin recargar todo
    const presenteClass = nuevoValor ? 'presente' : 'ausente';
    const ausClass = nuevoValor ? 'ausente' : 'presente';
    celda.classList.remove(ausClass);
    celda.classList.add(presenteClass);
    celda.innerHTML = nuevoValor ? '✓' : '✗';
    celda.dataset.presente = nuevoValor;
    celda.dataset.regid = resultado.id;
    celda.title = celda.title.replace(presenteActual ? 'Presente' : 'Ausente', nuevoValor ? 'Presente' : 'Ausente');

    // Recalcular porcentajes de la fila
    recalcularFila(celda, container);
  } catch (err) {
    showToast('Error al guardar asistencia: ' + err.message, 'error');
    console.error('[Asistencia] Error toggle:', err);
  } finally {
    celda.classList.remove('loading');
  }
}

// ============================================
// RECALCULAR PORCENTAJE EN LA FILA
// ============================================
function recalcularFila(celda, container) {
  const fila = celda.closest('tr');
  if (!fila) return;

  const celdas = fila.querySelectorAll('.asistencia-celda');
  const total = celdas.length;
  const presentes = [...celdas].filter(c => c.dataset.presente === 'true').length;
  const pct = total > 0 ? Math.round((presentes / total) * 100) : 0;
  const nivel = pct >= 80 ? 'verde' : pct >= 60 ? 'amarillo' : 'rojo';
  const condicion = pct >= 80 ? 'Condición de aprobar' : pct >= 60 ? 'Regular' : 'Asistencia insuficiente';
  const colorVar = nivel === 'verde' ? 'accent-green' : nivel === 'amarillo' ? 'accent-orange' : 'accent-red';

  const pctWrap = fila.querySelector('.asistencia-pct-wrap');
  if (pctWrap) {
    pctWrap.innerHTML = `
      <div style="font-size:0.85rem;font-weight:700;color:var(--${colorVar});">${pct}%</div>
      <div class="asistencia-pct-bar-bg">
        <div class="asistencia-pct-bar-fill ${nivel}" style="width:${pct}%;"></div>
      </div>
      <div style="font-size:0.65rem;color:var(--text-muted);">${presentes}/${total}</div>
    `;
  }

  const badge = fila.querySelector('.condicion-badge');
  if (badge) {
    badge.className = `condicion-badge ${nivel}`;
    badge.textContent = condicion;
  }
}

// ============================================
// MODAL: AGREGAR FECHA DE CLASE
// ============================================
function openAgregarFechaModal(tipo, contextId, estudiantes, container, trayectoId) {
  const hoy = new Date().toISOString().split('T')[0];
  const formHTML = `
    <div class="form-group">
      <label class="form-label">Fecha de la Clase</label>
      <input type="date" class="form-input" id="nueva-fecha-clase" value="${hoy}" max="${hoy}" />
    </div>
    <div class="form-group">
      <label class="form-label">Tema de la Clase (Opcional)</label>
      <textarea class="form-textarea" id="nueva-fecha-tema" placeholder="Ej: Introducción a fracciones..." rows="2"></textarea>
    </div>
    <p style="font-size:0.8rem;color:var(--text-muted);margin-top:8px;">
      Se crearán registros de asistencia (Ausente por defecto) para los ${estudiantes.length} estudiante${estudiantes.length !== 1 ? 's' : ''} inscriptos. Podrás marcar los presentes en la planilla.
    </p>
  `;
  const footerHTML = `
    <button class="btn btn-secondary" id="modal-cancel">Cancelar</button>
    <button class="btn btn-add" id="modal-save">${icons.plus} Agregar Fecha</button>
  `;
  const overlay = createModal('Registrar Clase', formHTML, footerHTML);
  overlay.querySelector('#modal-cancel').addEventListener('click', () => overlay.remove());
  overlay.querySelector('#modal-save').addEventListener('click', async () => {
    const fecha = document.getElementById('nueva-fecha-clase').value;
    if (!fecha) { showToast('Seleccioná una fecha', 'error'); return; }

    const btn = overlay.querySelector('#modal-save');
    btn.disabled = true;
    btn.textContent = 'Guardando...';

    try {
      const sb = getSupabase();
      // Verificar si ya existe esa fecha para este contexto
      let query = sb.from('asistencias').select('id').eq('fecha_clase', fecha).limit(1);

      if (tipo === 'trayecto') {
        query = query.eq('trayecto_id', contextId).is('modulo_comun_id', null);
      } else {
        query = query.eq('modulo_comun_id', contextId).eq('trayecto_id', trayectoId);
      }

      const { data: existing } = await query;

      if (existing && existing.length > 0) {
        showToast('Esa fecha ya está registrada', 'error');
        btn.disabled = false;
        btn.innerHTML = `${icons.plus} Agregar Fecha`;
        return;
      }

      const tema = document.getElementById('nueva-fecha-tema').value.trim();

      // Construir payload base
      const payloadBase = {
        fecha_clase: fecha,
        presente: false,
        tema_clase: tema || null
      };

      if (tipo === 'trayecto') {
        payloadBase.trayecto_id = contextId;
        payloadBase.modulo_comun_id = null;
      } else {
        payloadBase.modulo_comun_id = contextId;
        payloadBase.trayecto_id = trayectoId;
      }

      // Insertar registros para cada estudiante
      const registros = estudiantes.map(est => ({
        ...payloadBase,
        estudiante_id: est.id
      }));

      const { error } = await sb.from('asistencias').insert(registros);
      if (error) throw error;

      showToast('Fecha de clase registrada');
      overlay.remove();

      // Rerender del tab
      await refreshAsistenciaContainer(tipo, contextId, estudiantes, container, trayectoId);
    } catch (err) {
      showToast('Error: ' + err.message, 'error');
      btn.disabled = false;
      btn.innerHTML = `${icons.plus} Agregar Fecha`;
    }
  });
}

// ============================================
// MODAL: EDITAR TEMA DE LA CLASE
// ============================================
function openEditarTemaModal(fecha, temaActual, contextId, tipo, estudiantes, container, trayectoId) {
  const isSinTema = temaActual === 'Sin tema registrado';
  const formHTML = `
    <div class="form-group">
      <label class="form-label">Tema de la Clase — ${formatFechaCorta(fecha)}</label>
      <textarea class="form-textarea" id="edit-fecha-tema" rows="3" placeholder="Descripción de lo visto en clase...">${isSinTema ? '' : temaActual}</textarea>
    </div>
  `;
  const footerHTML = `
    <button class="btn btn-secondary" id="modal-cancel">Cancelar</button>
    <button class="btn btn-primary" id="modal-save">Guardar Tema</button>
  `;
  const overlay = createModal('Editar Tema de Clase', formHTML, footerHTML);

  overlay.querySelector('#modal-cancel').addEventListener('click', () => overlay.remove());
  overlay.querySelector('#modal-save').addEventListener('click', async () => {
    const nuevoTema = document.getElementById('edit-fecha-tema').value.trim();
    const btn = overlay.querySelector('#modal-save');
    btn.disabled = true;
    btn.textContent = 'Guardando...';

    try {
      let query = getSupabase()
        .from('asistencias')
        .update({ tema_clase: nuevoTema || null })
        .eq('fecha_clase', fecha);

      if (tipo === 'trayecto') {
        query = query.eq('trayecto_id', contextId).is('modulo_comun_id', null);
      } else {
        query = query.eq('modulo_comun_id', contextId).eq('trayecto_id', trayectoId);
      }

      const { error } = await query;

      if (error) throw error;

      showToast('Tema de clase actualizado');
      overlay.remove();

      await refreshAsistenciaContainer(tipo, contextId, estudiantes, container, trayectoId);
    } catch (err) {
      showToast('Error: ' + err.message, 'error');
      btn.disabled = false;
      btn.textContent = 'Guardar Tema';
    }
  });
}

// ============================================
// ELIMINAR TODOS LOS REGISTROS DE UNA FECHA
// ============================================
async function eliminarFecha(fecha, contextId, tipo, estudiantes, container, trayectoId) {
  try {
    let query = getSupabase().from('asistencias').delete().eq('fecha_clase', fecha);
    if (tipo === 'trayecto') {
      query = query.eq('trayecto_id', contextId).is('modulo_comun_id', null);
    } else {
      query = query.eq('modulo_comun_id', contextId).eq('trayecto_id', trayectoId);
    }
    const { error } = await query;
    if (error) throw error;

    showToast('Fecha eliminada');
    await refreshAsistenciaContainer(tipo, contextId, estudiantes, container, trayectoId);
  } catch (err) {
    showToast('Error al eliminar fecha: ' + err.message, 'error');
  }
}



// ============================================
// EXPORTAR A EXCEL (SheetJS desde CDN)
// ============================================
async function exportarExcel(tipo, contextId, estudiantes, container, trayectoId) {
  // Cargar SheetJS si no está disponible
  if (!window.XLSX) {
    await loadScript('https://cdn.sheetjs.com/xlsx-0.20.1/package/dist/xlsx.full.min.js');
  }

  const XLSX = window.XLSX;

  // Obtener datos actuales
  let query = getSupabase().from('asistencias').select('*').order('fecha_clase', { ascending: true });

  if (tipo === 'trayecto') {
    query = query.eq('trayecto_id', contextId).is('modulo_comun_id', null);
  } else {
    query = query.eq('modulo_comun_id', contextId).eq('trayecto_id', trayectoId);
  }

  const { data: registros } = await query;

  const fechas = [...new Set((registros || []).map(r => r.fecha_clase))].sort();

  // Construir datos de la hoja
  const header = ['Estudiante', 'DNI', ...fechas.map(f => formatFechaCorta(f)), '% Asistencia', 'Condición'];
  const rows = estudiantes.map(est => {
    const rowRegs = (registros || []).filter(r => r.estudiante_id === est.id);
    const presentes = rowRegs.filter(r => r.presente).length;
    const total = fechas.length;
    const pct = total > 0 ? Math.round((presentes / total) * 100) : 0;
    const condicion = pct >= 80 ? 'Condición de aprobar' : pct >= 60 ? 'Regular' : 'Asistencia insuficiente';

    const celdas = fechas.map(f => {
      const reg = rowRegs.find(r => r.fecha_clase === f);
      return reg?.presente ? 'P' : 'A';
    });

    return [
      `${est.nombre} ${est.apellido}`,
      est.dni || '-',
      ...celdas,
      `${pct}%`,
      condicion,
    ];
  });

  const wsData = [header, ...rows];
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet(wsData);

  // Ancho de columnas
  ws['!cols'] = [
    { wch: 30 },
    { wch: 12 },
    ...fechas.map(() => ({ wch: 12 })),
    { wch: 12 },
    { wch: 22 },
  ];

  const nombreHoja = tipo === 'trayecto' ? 'Asistencia Trayecto' : 'Asistencia Módulo';
  XLSX.utils.book_append_sheet(wb, ws, nombreHoja);

  const fecha = new Date().toISOString().split('T')[0];
  XLSX.writeFile(wb, `planilla-asistencia-${fecha}.xlsx`);
  showToast('Excel exportado con éxito ✓');
}

// ============================================
// EXPORTAR A PDF (window.print)
// ============================================
function exportarPDF(tipo, contextId) {
  window.print();
}

// ============================================
// HELPERS
// ============================================
function formatFechaCorta(fechaStr) {
  if (!fechaStr) return '-';
  // fecha en formato YYYY-MM-DD
  const [y, m, d] = fechaStr.split('-');
  return `${d}/${m}`;
}

function loadScript(src) {
  return new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = src;
    s.onload = resolve;
    s.onerror = reject;
    document.head.appendChild(s);
  });
}

export default { renderAsistenciaTab, bindAsistenciaEvents };
