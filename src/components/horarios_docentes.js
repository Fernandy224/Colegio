// ============================================
// Horario Semanal Docente
// Vista de calendario semanal con trayectos y comisiones
// ============================================
import { getContentArea, getPanelRight } from './layout.js';
import { icons, showToast, createModal, sanitize, confirmDialog, stringToColor } from '../utils/helpers.js';
import { fetchAll, create, update, remove } from '../utils/data.js';
import { getCurrentUser } from './auth.js';
import { getCurrentYear } from '../utils/state.js';

let horarios = [];
let trayectos = [];
let disponibilidad = [];
let profesores = [];
let currentCuatrimestre = 1;

export async function renderHorariosDocentes() {
  const content = getContentArea();
  const panel = getPanelRight();
  
  content.innerHTML = `<div class="loading-state">Cargando horarios...</div>`;
  panel.innerHTML = ''; // Limpiar panel lateral

  try {
    const [dataHorarios, dataTrayectos, dataDisponibilidad, dataProfesores] = await Promise.all([
      fetchAll('horarios_docentes', { orderBy: 'hora_inicio', ascending: true }),
      fetchAll('trayectos_formativos'),
      fetchAll('disponibilidad_docentes'),
      fetchAll('profesores')
    ]);
    
    horarios = dataHorarios;
    trayectos = dataTrayectos;
    disponibilidad = dataDisponibilidad;
    profesores = dataProfesores;
    
    renderVistaPrincipal(content);
    renderPanelLateral(panel);
  } catch (err) {
    console.error('[Horarios] Error:', err);
    content.innerHTML = `<div class="error-state">Error cargando datos. Reintentá en unos momentos.</div>`;
  }
}
function renderVistaPrincipal(container) {
  const isAdmin = getCurrentUser()?.role === 'administrador';
  const dias = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];
  const anio = new Date().getFullYear();
  const cuat = 1; 

  container.innerHTML = `
    <div class="section-header">
      <h1 class="section-title">Organización Diaria y Horaria</h1>
      <div class="section-actions">
        <button class="btn btn-secondary" id="btn-config-disponibilidad" style="margin-right:8px;">${icons.calendar} Mi Disponibilidad</button>
        ${isAdmin ? `<button class="btn btn-add" id="btn-nuevo-horario-doc">${icons.plus} Agregar Bloque</button>` : ''}
        <button class="btn btn-secondary" onclick="window.print()">🖨️ Imprimir</button>
      </div>
    </div>

    <div class="tabs" style="margin-bottom: 24px;">
      <button class="tab-btn ${currentCuatrimestre === 1 ? 'active' : ''}" id="tab-doc-c1">1° Cuatrimestre ${anio}</button>
      <button class="tab-btn ${currentCuatrimestre === 2 ? 'active' : ''}" id="tab-doc-c2">2° Cuatrimestre ${anio}</button>
    </div>

    <div class="tabla-cronograma-container">
      <table class="cronograma-table">
        <thead>
          <tr>
            <th class="th-dia">Día</th>
            <th class="th-disp" title="Horario de entrada del profesor">Entrada Prof.</th>
            <th class="th-disp" title="Horario de salida del profesor">Salida Prof.</th>
            <th class="th-eventual">Horario Eventual</th>
            <th class="th-turno">Mañana</th>
            <th class="th-turno">Tarde</th>
            <th class="th-turno">Vespertino</th>
          </tr>
        </thead>
        <tbody>
          ${[1, 2, 3, 4, 5].map(diaId => {
            const misHorarios = horarios.filter(h => h.dia_semana === diaId && h.cuatrimestre === currentCuatrimestre).sort((a,b) => a.hora_inicio.localeCompare(b.hora_inicio));
            
            // Filtrar disponibilidad por el profesor del usuario o el primero si no hay uno (para admin)
            // Para la vista general, mostramos disponibilidad general o simplemente la primera encontrada para ese día
            const misDisp = disponibilidad
              .filter(d => d.dia_semana === diaId && d.cuatrimestre === currentCuatrimestre)
              .sort((a,b) => a.hora_entrada.localeCompare(b.hora_entrada));
            
            // Clasificar bloques por turno
            const bloquesManana = misHorarios.filter(h => h.hora_inicio < '13:00');
            const bloquesTarde = misHorarios.filter(h => h.hora_inicio >= '13:00' && h.hora_inicio < '18:30');
            const bloquesVespertino = misHorarios.filter(h => h.hora_inicio >= '18:30');

            const renderBloque = (h) => {
              if (!h) return '';
              const trayecto = trayectos.find(t => t.id === h.trayecto_id);
              const trayectoNombre = trayecto ? trayecto.nombre : 'Trayecto...';
              return `
                <div class="bloque-celda-card" data-id="${h.id}">
                  <div class="bloque-celda-time">${h.hora_inicio.substring(0,5)} - ${h.hora_fin.substring(0,5)}</div>
                  <div class="bloque-celda-trayecto">${sanitize(trayectoNombre)}</div>
                  <div class="bloque-celda-grupo">${sanitize(h.grupo_comision || '-')}</div>
                  ${isAdmin ? `
                    <div class="bloque-celda-actions">
                      <button class="btn-icon btn-edit-h" data-id="${h.id}">${icons.edit}</button>
                      <button class="btn-icon btn-delete-h" data-id="${h.id}">${icons.trash}</button>
                    </div>
                  ` : ''}
                </div>
              `;
            };

            return `
              <tr>
                <td class="td-dia-label">${dias[diaId-1]}</td>
                <td class="td-disp-val">${misDisp.map(d => d.hora_entrada.substring(0,5)).join('<br>') || '-'}</td>
                <td class="td-disp-val">${misDisp.map(d => d.hora_salida.substring(0,5)).join('<br>') || '-'}</td>
                <td class="td-eventual-val">${misHorarios.filter(h => h.horario_eventual).map(h => sanitize(h.horario_eventual)).join('<br>') || '-'}</td>
                <td class="td-turno-val">${bloquesManana.map(renderBloque).join('')}</td>
                <td class="td-turno-val">${bloquesTarde.map(renderBloque).join('')}</td>
                <td class="td-turno-val">${bloquesVespertino.map(renderBloque).join('')}</td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>
    </div>

    <style>
      .tabla-cronograma-container { margin-top: 24px; background: var(--bg-card); border-radius: 12px; border: 1px solid var(--border-color); overflow-x: auto; }
      .cronograma-table { width: 100%; border-collapse: collapse; min-width: 1000px; }
      .cronograma-table th, .cronograma-table td { border: 1px solid var(--border-color); padding: 10px; vertical-align: top; }
      
      .th-dia { width: 100px; background: var(--bg-secondary); }
      .th-disp { width: 80px; background: var(--bg-secondary); font-size: 0.75rem; color: var(--accent-green); }
      .th-eventual { width: 100px; background: var(--bg-secondary); font-size: 0.75rem; }
      .th-turno { width: 25%; background: var(--bg-secondary); font-weight: 700; color: var(--text-primary); text-transform: uppercase; font-size: 0.8rem; }
      
      .td-dia-label { background: var(--bg-secondary); font-weight: 800; text-align: center; color: var(--text-primary); }
      .td-disp-val { text-align: center; font-weight: 700; color: var(--accent-green); font-size: 0.85rem; }
      .td-turno-val { height: 100px; padding: 6px !important; background: rgba(255,255,255,0.01); }
      
      .bloque-celda-card {
        background: var(--bg-card); border: 1px solid var(--border-color); border-left: 3px solid var(--accent-blue);
        border-radius: 6px; padding: 8px; margin-bottom: 6px; position: relative;
      }
      .bloque-celda-card:hover { border-color: var(--accent-blue); }
      .bloque-celda-time { font-size: 0.65rem; font-weight: 800; color: var(--accent-purple-light); }
      .bloque-celda-trayecto { font-size: 0.75rem; font-weight: 700; color: var(--text-primary); margin: 2px 0; line-height: 1.1; }
      .bloque-celda-grupo { font-size: 0.7rem; color: var(--text-secondary); }
      
      .bloque-celda-actions { 
        position: absolute; top: 2px; right: 2px; display: none; gap: 2px; background: var(--bg-card); padding: 2px; border-radius: 4px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
      }
      .bloque-celda-card:hover .bloque-celda-actions { display: flex; }

      @media print {
        .section-header, .navbar, .sidebar, .app-footer, .bloque-celda-actions { display: none !important; }
        .tabla-cronograma-container { border: none; margin: 0; }
        .cronograma-table { width: 100% !important; border: 2px solid #000; }
        .cronograma-table th, .cronograma-table td { border: 1px solid #000 !important; color: #000 !important; }
        .th-dia, .th-disp, .th-eventual, .th-turno, .td-dia-label { background-color: #f2f2f2 !important; color: #000 !important; }
        .bloque-celda-card { border: 1px solid #ddd !important; background: #fff !important; }
      }
    </style>
  `;

  // Bind Events
  container.querySelector('#tab-doc-c1').onclick = () => { currentCuatrimestre = 1; renderVistaPrincipal(container); };
  container.querySelector('#tab-doc-c2').onclick = () => { currentCuatrimestre = 2; renderVistaPrincipal(container); };

  container.querySelector('#btn-config-disponibilidad')?.addEventListener('click', () => openDisponibilidadModal());
  if (isAdmin) {
    container.querySelector('#btn-nuevo-horario-doc')?.addEventListener('click', () => openFormModal());
    container.querySelectorAll('.btn-edit-h').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const item = horarios.find(h => h.id === btn.dataset.id);
        if (item) openFormModal(item);
      });
    });
    container.querySelectorAll('.btn-delete-h').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        confirmDialog('¿Eliminar este horario del cronograma docente?', () => {
          handleDelete(btn.dataset.id);
        });
      });
    });
  }
}

function renderPanelLateral(container) {
  const totalHorarios = horarios.length;
  const trayectosConHorario = new Set(horarios.map(h => h.trayecto_id)).size;

  container.innerHTML = `
    <div class="widget">
      <div class="widget-header"><span class="widget-title">Resumen Semanal</span></div>
      <div class="widget-stats">
        <div class="widget-stat">
          <div class="widget-stat-value">${totalHorarios}</div>
          <div class="widget-stat-label">Clases Registradas</div>
        </div>
        <div class="widget-stat">
          <div class="widget-stat-value">${trayectosConHorario}</div>
          <div class="widget-stat-label">Trayectos con Horario</div>
        </div>
      </div>
    </div>
    
    <div class="widget" style="margin-top: 16px;">
      <div class="widget-header"><span class="widget-title">Trayectos en Horario</span></div>
      <div style="display:flex; flex-direction:column; gap:8px; margin-top:12px;">
        ${trayectos.filter(t => horarios.some(h => h.trayecto_id === t.id)).map(tray => `
          <div style="display:flex; align-items:center; gap:8px; font-size:0.8rem;">
            <div style="width:10px; height:10px; border-radius:50%; background:${stringToColor(tray.nombre)}; flex-shrink:0;"></div>
            <span style="color:var(--text-secondary); white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${sanitize(tray.nombre)}</span>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

async function openFormModal(existing = null) {
  const isEdit = !!existing;
  
  const formHTML = `
    <div class="form-group">
      <label class="form-label">Trayecto Formativo</label>
      <select class="form-input" id="h-trayecto" required>
        <option value="">Seleccionar trayecto...</option>
        ${trayectos.map(t => `<option value="${t.id}" ${existing?.trayecto_id === t.id ? 'selected' : ''}>${sanitize(t.nombre)}</option>`).join('')}
      </select>
    </div>
    <div class="form-row">
      <div class="form-group">
        <label class="form-label">Grupo / Comisión</label>
        <input type="text" class="form-input" id="h-comision" value="${sanitize(existing?.grupo_comision || '')}" placeholder="Ej: 1° Año, Div B" />
      </div>
      <div class="form-group">
        <label class="form-label">📍 Aula</label>
        <input type="text" class="form-input" id="h-aula" value="${sanitize(existing?.aula || '')}" placeholder="Ej: Aula 5, Taller, etc." />
      </div>
    </div>
    <div class="form-row">
      <div class="form-group">
        <label class="form-label">Día de la Semana</label>
        <select class="form-input" id="h-dia" required>
          <option value="1" ${existing?.dia_semana === 1 ? 'selected' : ''}>Lunes</option>
          <option value="2" ${existing?.dia_semana === 2 ? 'selected' : ''}>Martes</option>
          <option value="3" ${existing?.dia_semana === 3 ? 'selected' : ''}>Miércoles</option>
          <option value="4" ${existing?.dia_semana === 4 ? 'selected' : ''}>Jueves</option>
          <option value="5" ${existing?.dia_semana === 5 ? 'selected' : ''}>Viernes</option>
        </select>
      </div>
    </div>
    <div class="form-row">
      <div class="form-group">
        <label class="form-label">Hora Inicio</label>
        <input type="time" class="form-input" id="h-inicio" value="${existing?.hora_inicio || '08:00'}" required />
      </div>
      <div class="form-group">
        <label class="form-label">Hora Fin</label>
        <input type="time" class="form-input" id="h-fin" value="${existing?.hora_fin || '12:00'}" required />
      </div>
    </div>
    <div class="form-group">
      <label class="form-label">Horario Eventual / Excepcional</label>
      <input type="text" class="form-input" id="h-eventual" value="${sanitize(existing?.horario_eventual || '')}" placeholder="Ej: Clases sábados cada 15 días, etc." />
    </div>
    <div class="form-group">
      <label class="form-label">Observaciones (Opcional)</label>
      <textarea class="form-input" id="h-observaciones" placeholder="Detalles adicionales..." style="min-height:80px;">${sanitize(existing?.observaciones || '')}</textarea>
    </div>
  `;

  const footerHTML = `
    <button class="btn btn-secondary" id="h-cancel">Cancelar</button>
    <button class="btn btn-primary" id="h-save">${isEdit ? 'Actualizar' : 'Guardar'} Bloque</button>
  `;

  const overlay = createModal(isEdit ? 'Editar Bloque de Clase' : 'Nuevo Bloque de Clase', formHTML, footerHTML);

  overlay.querySelector('#h-cancel').addEventListener('click', () => overlay.remove());
  overlay.querySelector('#h-save').addEventListener('click', async () => {
    const trayecto_id = document.getElementById('h-trayecto').value;
    const grupo_comision = document.getElementById('h-comision').value.trim();
    const aula = document.getElementById('h-aula').value.trim();
    const observaciones = document.getElementById('h-observaciones').value.trim();
    const dia_semana = parseInt(document.getElementById('h-dia').value);
    const hora_inicio = document.getElementById('h-inicio').value;
    const hora_fin = document.getElementById('h-fin').value;
    const horario_eventual = document.getElementById('h-eventual').value.trim() || null;
    const anio = getCurrentYear();
    const cuatrimestre = currentCuatrimestre;

    if (!trayecto_id || !hora_inicio || !hora_fin) {
      showToast('Completá los campos obligatorios.', 'error');
      return;
    }

    if (hora_inicio >= hora_fin) {
      showToast('La hora de inicio debe ser menor a la hora de fin.', 'error');
      return;
    }

    // 1. Validar contra disponibilidad (Entrada/Salida) del profesor asignado al trayecto
    const trayectoSel = trayectos.find(t => t.id === trayecto_id);
    const profId = trayectoSel?.profesor_id;

    const misDisp = disponibilidad.filter(d => 
      d.dia_semana === dia_semana && 
      d.cuatrimestre === cuatrimestre &&
      (profId ? d.profesor_id === profId : true)
    );
    
    if (misDisp.length > 0) {
      const isWithinDisp = misDisp.some(d => {
        const ent = d.hora_entrada.substring(0,5);
        const sal = d.hora_salida.substring(0,5);
        return hora_inicio >= ent && hora_fin <= sal;
      });
      if (!isWithinDisp) {
        showToast('El bloque está fuera del horario de entrada/salida configurado para este docente.', 'warning');
        return;
      }
    }

    // 2. Validar superposición con otros bloques
    const otrosHorarios = horarios.filter(h => h.dia_semana === dia_semana && h.id !== existing?.id);
    const overlap = otrosHorarios.some(h => {
      const startB = h.hora_inicio.substring(0,5);
      const endB = h.hora_fin.substring(0,5);
      return (hora_inicio < endB) && (hora_fin > startB);
    });

    if (overlap) {
      showToast('Ya existe otra clase en este rango horario para el día seleccionado.', 'error');
      return;
    }

    const btn = overlay.querySelector('#h-save');
    btn.disabled = true;
    btn.textContent = 'Guardando...';

    try {
      const payload = { trayecto_id, grupo_comision, aula, observaciones, dia_semana, hora_inicio, hora_fin, anio, cuatrimestre, horario_eventual };
      if (isEdit) {
        await update('horarios_docentes', existing.id, payload);
        showToast('Bloque actualizado.');
      } else {
        await create('horarios_docentes', payload);
        showToast('Bloque guardado correctamente.');
      }
      overlay.remove();
      renderHorariosDocentes();
    } catch (err) {
      showToast('Error al guardar: ' + err.message, 'error');
      btn.disabled = false;
      btn.textContent = 'Guardar Bloque';
    }
  });
}

async function handleDelete(id) {
  try {
    await remove('horarios_docentes', id);
    showToast('Horario eliminado correctamente.');
    renderHorariosDocentes();
  } catch (err) {
    showToast('Error al eliminar: ' + err.message, 'error');
  }
}

async function openDisponibilidadModal() {
  const user = getCurrentUser();
  const isAdmin = user?.role === 'administrador';
  const anio = new Date().getFullYear();
  let currentCuat = 1;
  
  // Si es profesor, forzar su propio ID. Si es admin, permitir elegir.
  let selectedProfId = profesores.find(p => p.auth_id === user?.id)?.id || null;

  const renderDispContent = (cuat, profId) => {
    const tableHTML = `
      <div class="disponibilidad-header" style="margin-bottom: 20px;">
        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px;">
          <div class="tabs">
            <button class="tab-btn ${cuat === 1 ? 'active' : ''}" id="disp-tab-1">1° Cuat. ${anio}</button>
            <button class="tab-btn ${cuat === 2 ? 'active' : ''}" id="disp-tab-2">2° Cuat. ${anio}</button>
          </div>
          ${isAdmin ? `
            <div style="display:flex; align-items:center; gap:8px;">
              <label style="font-size:0.8rem; font-weight:700;">Profesor:</label>
              <select class="form-input" id="disp-prof-select" style="width:200px; padding:4px 8px;">
                <option value="">-- Todos --</option>
                ${profesores.map(p => `<option value="${p.id}" ${profId === p.id ? 'selected' : ''}>${sanitize(p.apellido)}, ${sanitize(p.nombre)}</option>`).join('')}
              </select>
            </div>
          ` : `
            <div style="font-size:0.9rem; font-weight:700; color:var(--accent-blue);">Profesor: ${sanitize(user?.name || '')}</div>
          `}
        </div>
      </div>
      <div style="max-height: 400px; overflow-y: auto; border: 1px solid var(--border-color); border-radius:8px;">
        <table class="horario-docente-table">
          <thead>
            <tr>
              <th>Día</th>
              <th>Entrada</th>
              <th>Salida</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            ${[1, 2, 3, 4, 5].map(diaId => {
              const dias = ['', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];
              const slots = disponibilidad.filter(d => 
                d.dia_semana === diaId && 
                d.cuatrimestre === cuat &&
                (profId ? d.profesor_id === profId : true)
              );
              return `
                <tr>
                  <td style="font-weight:bold; padding: 10px; background:var(--bg-secondary);">${dias[diaId]}</td>
                  <td colspan="2" style="padding:0;">
                    <table style="width:100%; border-collapse:collapse;">
                      ${slots.length === 0 ? `
                        <tr>
                          <td style="padding:10px; color:var(--text-muted); font-style:italic; text-align:center;">Sin turnos configurados</td>
                        </tr>
                      ` : slots.map(s => `
                        <tr style="border-bottom: 1px solid var(--border-color);">
                          <td style="padding:10px; width:50%; text-align:center;">${s.hora_entrada.substring(0,5)} HS.</td>
                          <td style="padding:10px; width:50%; text-align:center;">${s.hora_salida.substring(0,5)} HS.</td>
                          <td style="padding:10px; width:40px;">
                            <button class="btn-icon btn-del-disp" data-id="${s.id}" title="Eliminar">${icons.trash}</button>
                          </td>
                        </tr>
                      `).join('')}
                    </table>
                  </td>
                  <td style="text-align:center; background:var(--bg-secondary);">
                    <button class="btn btn-secondary btn-sm btn-add-disp-row" data-dia="${diaId}">${icons.plus} Agregar</button>
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    `;
    return tableHTML;
  };

  const overlay = createModal('Configurar Disponibilidad - Entrada/Salida', `<div id="disp-modal-body">${renderDispContent(currentCuat, selectedProfId)}</div>`, `<button class="btn btn-secondary" id="disp-close">Cerrar</button>`);

  const attachEvents = () => {
    overlay.querySelector('#disp-tab-1').onclick = () => { currentCuat = 1; updateContent(); };
    overlay.querySelector('#disp-tab-2').onclick = () => { currentCuat = 2; updateContent(); };
    overlay.querySelector('#disp-close').onclick = () => { overlay.remove(); renderHorariosDocentes(); };
    
    if (isAdmin) {
      overlay.querySelector('#disp-prof-select').onchange = (e) => {
        selectedProfId = e.target.value;
        updateContent();
      };
    }

    overlay.querySelectorAll('.btn-add-disp-row').forEach(btn => {
      btn.onclick = () => openAddDispRowModal(parseInt(btn.dataset.dia), currentCuat, selectedProfId);
    });

    overlay.querySelectorAll('.btn-del-disp').forEach(btn => {
      btn.onclick = async () => {
        if (confirm('¿Eliminar este turno de entrada/salida?')) {
          await remove('disponibilidad_docentes', btn.dataset.id);
          showToast('Turno eliminado');
          const dataDisp = await fetchAll('disponibilidad_docentes');
          disponibilidad = dataDisp;
          updateContent();
        }
      };
    });
  };

  const updateContent = () => {
    overlay.querySelector('#disp-modal-body').innerHTML = renderDispContent(currentCuat, selectedProfId);
    attachEvents();
  };

  const openAddDispRowModal = (dia, cuat, profId) => {
    if (isAdmin && !profId) {
      showToast('Por favor, seleccioná un profesor antes de agregar el turno.', 'warning');
      return;
    }
    const formHTML = `
      <div class="form-row">
        <div class="form-group"><label class="form-label">Entrada</label><input type="time" class="form-input" id="disp-in" value="08:00"></div>
        <div class="form-group"><label class="form-label">Salida</label><input type="time" class="form-input" id="disp-out" value="12:00"></div>
      </div>
    `;
    const footerHTML = `<button class="btn btn-secondary" id="add-disp-cancel">Cancelar</button><button class="btn btn-primary" id="add-disp-save">Guardar</button>`;
    const addOverlay = createModal('Nuevo Turno de Trabajo', formHTML, footerHTML);

    addOverlay.querySelector('#add-disp-cancel').onclick = () => addOverlay.remove();
    addOverlay.querySelector('#add-disp-save').onclick = async () => {
      const hora_entrada = document.getElementById('disp-in').value;
      const hora_salida = document.getElementById('disp-out').value;
      if (!hora_entrada || !hora_salida) return;

      try {
        await create('disponibilidad_docentes', {
          profesor_id: profId,
          dia_semana: dia,
          cuatrimestre: cuat,
          anio,
          hora_entrada,
          hora_salida
        });
        showToast('Turno de trabajo guardado');
        addOverlay.remove();
        const dataDisp = await fetchAll('disponibilidad_docentes');
        disponibilidad = dataDisp;
        updateContent();
      } catch (err) {
        showToast('Error: ' + err.message, 'error');
      }
    };
  };

  attachEvents();
}

export default { renderHorariosDocentes };
