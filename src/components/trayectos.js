// ============================================
// Gestión de Trayectos Formativos
// Con inscripciones, seguimiento y vista comparativa
// ============================================
import { getContentArea, getPanelRight } from './layout.js';
import { icons, showToast, createModal, confirmDialog, sanitize, formatDate, getInitials, stringToColor } from '../utils/helpers.js';
import { fetchAll, create, update, remove } from '../utils/data.js';
import { getCurrentUser } from './auth.js';
import { getSupabase } from '../supabaseClient.js';
import { renderAsistenciaTab, bindAsistenciaEvents } from './asistencia.js';
import { getCurrentYear } from '../utils/state.js';

let currentView = 'list'; // 'list' | 'detail'
let selectedTrayectoId = null;

export async function renderTrayectos() {
  if (currentView === 'detail' && selectedTrayectoId) {
    await renderTrayectoDetail(selectedTrayectoId);
  } else {
    await renderTrayectosList();
  }
}

// ============================================
// VISTA LISTADO DE TRAYECTOS
// ============================================
async function renderTrayectosList() {
  console.log('[Trayectos] Rendering list view...');
  const content = getContentArea();
  const panel = getPanelRight();

  if (!content || !panel) {
    console.error('[Trayectos] Container not found for list view:', { content, panel });
    return;
  }

  const authUser = getCurrentUser();
  const isAdmin = authUser?.role === 'administrador';
  const trayectos = await fetchAll('trayectos_formativos');
  const profesores = await fetchAll('profesores');
  const inscripciones = await fetchAll('inscripciones');
  const modulos = await fetchAll('modulos');
  const asignaciones = await fetchAll('asignaciones_profesor');
  const myProfesor = profesores.find(p => p.auth_id === authUser?.id);

  content.innerHTML = `
    <div class="section-header">
      <h1 class="section-title">Trayectos Formativos</h1>
      <div class="section-actions">
        <button class="btn btn-add" id="btn-add-trayecto">${icons.plus} Nuevo Trayecto</button>
      </div>
    </div>

    ${trayectos.length === 0 ? `
      <div class="empty-state">
        ${icons.trayectos}
        <h3 class="empty-state-title">No hay trayectos formativos</h3>
        <p class="empty-state-text">Creá un trayecto formativo, asignale módulos y empezá a inscribir estudiantes.</p>
      </div>
    ` : `
      <div class="trayectos-folders-container" style="display:flex; flex-direction:column; gap:12px;">
        ${(() => {
          const groupedTrayectos = {};
          const sinProfesor = [];
          
          trayectos.forEach(tray => {
            if (tray.profesor_id) {
              if (!groupedTrayectos[tray.profesor_id]) groupedTrayectos[tray.profesor_id] = [];
              groupedTrayectos[tray.profesor_id].push(tray);
            } else {
              sinProfesor.push(tray);
            }
          });

          const generateCardsGrid = (items) => {
            return `
              <div class="cards-grid" style="grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); display: grid;">
                ${items.map(tray => {
                  const prof = profesores.find(p => p.id === tray.profesor_id);
                  const inscriptos = inscripciones.filter(i => i.trayecto_id === tray.id);
                  const modulosTray = modulos.filter(m => m.trayecto_id === tray.id);
                  const isOwner = isAdmin || tray.profesor_id === myProfesor?.id || asignaciones.some(a => a.trayecto_id === tray.id && a.profesor_id === myProfesor?.id);
                  return `
                    <div class="card trayecto-card" data-id="${tray.id}" style="cursor: pointer; align-items: stretch;">
                      <div class="card-actions">
                        ${isOwner ? `
                          <button class="card-action-btn edit-btn" data-id="${tray.id}" title="Editar">${icons.edit}</button>
                          <button class="card-action-btn docs-btn" data-id="${tray.id}" title="Documentos">${icons.document}</button>
                          <button class="card-action-btn delete card-action-btn-del" data-id="${tray.id}" title="Eliminar">${icons.trash}</button>
                        ` : `<span style="font-size:0.6rem;padding:3px 7px;border-radius:999px;background:rgba(139,92,246,0.12);color:var(--text-muted);white-space:nowrap;">Solo lectura</span>`}
                      </div>
                      <div style="display: flex; align-items: center; gap: 12px;">
                        ${prof && prof.foto_url ? `
                          <div class="card-avatar" style="width: 52px; height: 52px; flex-shrink: 0; background-image: url('${prof.foto_url}'); background-size: cover; background-position: center; border-radius: 50%;"></div>
                        ` : `
                          <div class="card-avatar trayecto" style="width: 52px; height: 52px; flex-shrink: 0;">
                            ${sanitize(tray.nombre?.charAt(0) || 'T')}
                          </div>
                        `}
                        <div style="min-width: 0;">
                          <div class="card-name" style="text-align: left;">${sanitize(tray.nombre)}</div>
                          <div class="card-subtitle" style="text-align: left; margin-top: 2px;">
                            ${prof ? `Prof. ${sanitize(prof.nombre)} ${sanitize(prof.apellido)}` : 'Sin profesor'}
                          </div>
                          <div style="font-size:0.75rem; color:var(--text-muted); margin-top: 4px; display:flex; align-items:center; gap: 4px;">
                            <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                            ${tray.duracion ? sanitize(tray.duracion) : 'Duración sin definir'}
                          </div>
                        </div>
                      </div>

                      <!-- Módulos Específicos del Trayecto -->
                      <div style="margin-top: 12px; padding-top: 10px; border-top: 1px solid rgba(255,255,255,0.06);" onclick="event.stopPropagation();">
                        <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom: 8px;">
                          <span style="font-size:0.7rem; text-transform:uppercase; color:var(--text-muted); font-weight:600; letter-spacing:0.5px;">Módulos Específicos <span style="background:rgba(245,158,11,0.15);color:var(--accent-orange);padding:2px 7px;border-radius:999px;font-size:0.65rem;margin-left:4px;">${modulosTray.length}</span></span>
                          ${isOwner ? `<button class="btn-add-modulo-inline" data-trayecto-id="${tray.id}" data-trayecto-nombre="${sanitize(tray.nombre)}" title="Agregar módulo" style="background:rgba(139,92,246,0.15);color:var(--accent-purple-light);border:none;border-radius:6px;padding:3px 8px;font-size:0.7rem;cursor:pointer;display:flex;align-items:center;gap:4px;font-weight:600;transition:background 0.2s;">
                            ${icons.plus} Agregar
                          </button>` : ''}
                        </div>
                        ${modulosTray.length === 0 ? `
                          <p style="font-size:0.75rem; color:var(--text-muted); margin:0; font-style:italic;">Sin módulos específicos</p>
                        ` : `
                          <div style="display:flex; flex-direction:column; gap:4px;">
                            ${modulosTray.map(mod => `
                              <div style="display:flex; align-items:center; justify-content:space-between; padding:5px 8px; border-radius:6px; background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.05); transition:background 0.2s;" onmouseover="this.style.background='rgba(255,255,255,0.06)'" onmouseout="this.style.background='rgba(255,255,255,0.03)'">
                                <div style="display:flex; align-items:center; gap:6px; min-width:0;">
                                  <div style="width:24px;height:24px;border-radius:6px;background:rgba(245,158,11,0.15);display:flex;align-items:center;justify-content:center;font-size:0.6rem;font-weight:700;color:var(--accent-orange);flex-shrink:0;">${sanitize(mod.nombre?.charAt(0) || 'M')}</div>
                                  <span style="font-size:0.8rem; color:var(--text-primary); white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${sanitize(mod.nombre)}</span>
                                </div>
                                ${isOwner ? `
                                  <div style="display:flex; gap:2px; flex-shrink:0;">
                                    <button class="edit-modulo-inline" data-mod-id="${mod.id}" title="Editar" style="background:none;border:none;cursor:pointer;padding:3px;border-radius:4px;color:var(--text-muted);transition:color 0.2s;" onmouseover="this.style.color='var(--accent-blue)'" onmouseout="this.style.color='var(--text-muted)'">
                                      <svg width="13" height="13" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                                    </button>
                                    <button class="delete-modulo-inline" data-mod-id="${mod.id}" data-mod-nombre="${sanitize(mod.nombre)}" title="Eliminar" style="background:none;border:none;cursor:pointer;padding:3px;border-radius:4px;color:var(--text-muted);transition:color 0.2s;" onmouseover="this.style.color='var(--accent-red)'" onmouseout="this.style.color='var(--text-muted)'">
                                      <svg width="13" height="13" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                                    </button>
                                  </div>
                                ` : ''}
                              </div>
                            `).join('')}
                          </div>
                        `}
                      </div>

                      <div class="card-details" style="margin-top: auto; padding-top: 8px;">
                        <div class="card-detail">
                          <span class="card-detail-label">Inscriptos</span>
                          <span class="card-detail-value">${inscriptos.length}</span>
                        </div>
                        <div class="card-detail">
                          <span class="card-detail-label">Mód. Espec.</span>
                          <span class="card-detail-value">${modulosTray.length}</span>
                        </div>
                        <div class="card-detail">
                          <span class="card-detail-label">Ver detalle</span>
                          <span class="card-detail-value" style="color: var(--accent-purple-light);">→</span>
                        </div>
                      </div>
                    </div>
                  `;
                }).join('')}
              </div>
            `;
          };

          const renderFolder = (title, items, isProf, profDetails) => {
            if (items.length === 0) return '';
            return `
              <div class="folder-group" style="background: rgba(0,0,0,0.1); border: 1px solid var(--border-color); border-radius: 12px; overflow: hidden;">
                <div class="folder-header" style="display:flex; align-items:center; justify-content:space-between; padding: 14px 20px; cursor: pointer; user-select: none; transition: background 0.2s;" onclick="const content = this.nextElementSibling; const isHidden = content.style.display === 'none'; content.style.display = isHidden ? 'block' : 'none'; const icon = this.querySelector('.folder-icon'); icon.style.transform = isHidden ? 'rotate(90deg)' : 'rotate(0deg)'; this.style.borderBottom = isHidden ? '1px solid var(--border-color)' : 'none'; this.style.background = isHidden ? 'rgba(255,255,255,0.03)' : 'transparent';">
                   <div style="display:flex; align-items:center; gap: 14px;">
                       <svg class="folder-icon" width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2" style="color:var(--text-muted); transition: transform 0.2s; transform: rotate(0deg);"><polyline points="9 18 15 12 9 6"></polyline></svg>
                       ${isProf && profDetails?.foto_url ? `<div style="width:34px;height:34px;border-radius:50%;background-image:url('${profDetails.foto_url}');background-size:cover;background-position:center;border:2px solid rgba(255,255,255,0.1);"></div>` : `<div style="width:34px;height:34px;border-radius:8px;background:rgba(139,92,246,0.15);display:flex;align-items:center;justify-content:center;color:var(--accent-purple); border:1px solid rgba(139,92,246,0.3);">${icons.profesores}</div>`}
                       <span style="font-weight: 600; font-size: 1.05rem; color: var(--text-primary);">${sanitize(title)}</span>
                   </div>
                   <div style="font-size: 0.8rem; font-weight:600; color: var(--accent-purple-light); background: rgba(139,92,246,0.15); padding: 4px 10px; border-radius: 20px;">
                     ${items.length} ${items.length === 1 ? 'Trayecto' : 'Trayectos'}
                   </div>
                </div>
                <div class="folder-content" style="display: none; padding: 20px; background: rgba(0,0,0,0.15);">
                   ${generateCardsGrid(items)}
                </div>
              </div>
            `;
          };

          let foldersHTML = '';
          const profIds = Object.keys(groupedTrayectos);
          profIds.sort((a,b) => {
              const pa = profesores.find(p => p.id === a);
              const pb = profesores.find(p => p.id === b);
              const nameA = pa ? (pa.nombre + ' ' + (pa.apellido||'')) : '';
              const nameB = pb ? (pb.nombre + ' ' + (pb.apellido||'')) : '';
              return nameA.localeCompare(nameB);
          });

          profIds.forEach(pid => {
             const prof = profesores.find(p => p.id === pid);
             const title = prof ? `Prof. ${prof.nombre} ${prof.apellido}` : 'Profesor Desconocido';
             foldersHTML += renderFolder(title, groupedTrayectos[pid], true, prof);
          });

          if (sinProfesor.length > 0) {
             foldersHTML += renderFolder('Sin profesor asignado', sinProfesor, false, null);
          }
          
          return foldersHTML;
        })()}
      </div>
    `}
  `;

  panel.innerHTML = `
    <div class="widget">
      <div class="widget-header"><span class="widget-title">Trayectos</span></div>
      <div class="widget-stats">
        <div class="widget-stat">
          <div class="widget-stat-value">${trayectos.length}</div>
          <div class="widget-stat-label">Total</div>
        </div>
        <div class="widget-stat">
          <div class="widget-stat-value">${inscripciones.length}</div>
          <div class="widget-stat-label">Inscripciones</div>
        </div>
      </div>
    </div>
  `;

  // Eventos
  document.getElementById('btn-add-trayecto')?.addEventListener('click', () => openTrayectoModal(null, profesores));

  content.querySelectorAll('.trayecto-card').forEach(card => {
    card.addEventListener('click', () => {
      selectedTrayectoId = card.dataset.id;
      currentView = 'detail';
      renderTrayectos();
    });
  });

  content.querySelectorAll('.edit-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const tray = trayectos.find(t => t.id === btn.dataset.id);
      if (tray) openTrayectoModal(tray, profesores);
    });
  });

  // Documentos
  document.getElementById('btn-docs')?.addEventListener('click', () => {
    openDocsModal(trayecto);
  });

  // Actas Académicas
  document.getElementById('btn-actas')?.addEventListener('click', () => {
    openActasGestionModal(trayecto);
  });

  content.querySelectorAll('.card-action-btn-del').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const tray = trayectos.find(t => t.id === btn.dataset.id);
      if (tray) {
        confirmDialog(`¿Eliminar el trayecto <strong>${sanitize(tray.nombre)}</strong>?`, async () => {
          await remove('trayectos_formativos', tray.id);
          showToast('Trayecto eliminado');
          renderTrayectosList();
        });
      }
    });
  });

  // === Módulos Específicos: Agregar desde trayecto ===
  content.querySelectorAll('.btn-add-modulo-inline').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      openModuloDesdeModal(null, btn.dataset.trayectoId, btn.dataset.trayectoNombre);
    });
  });

  // === Módulos Específicos: Editar desde trayecto ===
  content.querySelectorAll('.edit-modulo-inline').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const mod = modulos.find(m => m.id === btn.dataset.modId);
      if (mod) {
        const tray = trayectos.find(t => t.id === mod.trayecto_id);
        openModuloDesdeModal(mod, mod.trayecto_id, tray?.nombre || '');
      }
    });
  });

  // === Módulos Específicos: Eliminar desde trayecto ===
  content.querySelectorAll('.delete-modulo-inline').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      confirmDialog(`¿Eliminar el módulo <strong>${btn.dataset.modNombre}</strong>?`, async () => {
        await remove('modulos', btn.dataset.modId);
        showToast('Módulo eliminado');
        renderTrayectosList();
      });
    });
  });
}

// ============================================
// VISTA DETALLE DE UN TRAYECTO
// ============================================
async function renderTrayectoDetail(trayectoId) {
  const content = getContentArea();
  const panel = getPanelRight();

  const trayectos = await fetchAll('trayectos_formativos');
  const trayecto = trayectos.find(t => t.id === trayectoId);
  if (!trayecto) { currentView = 'list'; renderTrayectosList(); return; }

  const profesores = await fetchAll('profesores');
  const prof = profesores.find(p => p.id === trayecto.profesor_id);

  // Profesores asignados a este trayecto (para RLS del profesor)
  const asignaciones = await fetchAll('asignaciones_profesor');
  const asignacionesTray = asignaciones.filter(a => a.trayecto_id === trayectoId);
  const profesoresAsignados = asignacionesTray
    .map(a => profesores.find(p => p.id === a.profesor_id))
    .filter(Boolean);

  const allEstudiantes = await fetchAll('estudiantes');
  const inscripciones = await fetchAll('inscripciones');
  const thisInscripciones = inscripciones.filter(i => i.trayecto_id === trayectoId);

  const modulos = await fetchAll('modulos');
  const submodulos = await fetchAll('submodulos');
  const seguimiento = await fetchAll('seguimiento_modulos');
  const tmcLinks = await fetchAll('trayecto_modulo_comun');
  const unidades = await fetchAll('unidades');
  const seguimientoUnidades = await fetchAll('seguimiento_unidades');

  // Módulos específicos del trayecto
  const modulosTray = modulos.filter(m => m.trayecto_id === trayectoId);
  // Módulos comunes vinculados a este trayecto
  const comunLinks = tmcLinks.filter(l => l.trayecto_id === trayectoId);
  const modulosComunes = comunLinks.map(l => {
    const sub = submodulos.find(s => s.id === l.submodulo_id);
    if (!sub) return null;
    return { ...sub, estado_link: l.estado, tmcLinkId: l.id };
  }).filter(Boolean);
  
  // Todos los módulos del trayecto (específicos + comunes)
  const allModulosTray = [
    ...modulosTray.map(m => ({ ...m, tipo: 'Específico', refId: m.id, refField: 'modulo_id', estadoMod: m.estado || 'Pendiente' })),
    ...modulosComunes.map(s => ({ ...s, tipo: 'Común', refId: s.id, refField: 'submodulo_id', estadoMod: s.estado_link || 'Pendiente' })),
  ].map(m => {
    // Calcular estado automático basado en si los estudiantes lo están cursando o lo aprobaron
    const insIds = thisInscripciones.map(i => i.id);
    const segs = seguimiento.filter(s => s[m.refField] === m.refId && insIds.includes(s.inscripcion_id));
    
    const approvedCount = insIds.filter(id => segs.some(s => s.inscripcion_id === id && s.estado === 'Aprobado')).length;
    const hasActivity = segs.some(s => s.estado === 'Aprobado' || s.estado === 'Desaprobado' || s.estado === 'En curso');
    const allApproved = thisInscripciones.length > 0 && approvedCount === thisInscripciones.length;
    
    let estadoAuto = 'Falta';
    if (allApproved) estadoAuto = 'Completado';
    else if (hasActivity) estadoAuto = 'En curso';
    
    return { ...m, estadoMod: estadoAuto };
  });

  // Identificar el id del profesor actual (para restricciones de módulos comunes)
  const authUser = getCurrentUser();
  const currentProfesorId = authUser?.role === 'profesor'
    ? profesores.find(p => p.auth_id === authUser.id)?.id || null
    : null; // null = admin = sin restricciones
  const isAdmin = authUser?.role === 'administrador';
  const isMainOwner = isAdmin || trayecto.profesor_id === currentProfesorId;
  const isOwner = isMainOwner || asignacionesTray.some(a => a.profesor_id === currentProfesorId);

  // Estudiantes inscriptos
  const inscriptoData = thisInscripciones.map(insc => {
    const est = allEstudiantes.find(e => e.id === insc.estudiante_id);
    const segEst = seguimiento.filter(s => s.inscripcion_id === insc.id);
    const segUnidadesEst = seguimientoUnidades.filter(s => s.inscripcion_id === insc.id);
    const aprobados = segEst.filter(s => s.estado === 'Aprobado').length;
    const totalMods = allModulosTray.length;
    const porcentaje = totalMods > 0 ? Math.round((aprobados / totalMods) * 100) : 0;
    return { ...insc, estudiante: est, seguimiento: segEst, seguimientoUnidades: segUnidadesEst, aprobados, totalMods, porcentaje };
  });

  // Estudiantes no inscriptos
  const inscriptoIds = thisInscripciones.map(i => i.estudiante_id);
  const noInscriptos = allEstudiantes.filter(e => !inscriptoIds.includes(e.id));

  content.innerHTML = `
    <div class="section-header">
      <div style="display: flex; align-items: center; gap: 12px;">
        <button class="btn btn-secondary btn-icon" id="btn-back" title="Volver">${icons.arrowUpRight}</button>
        <div>
          <h1 class="section-title">${sanitize(trayecto.nombre)}</h1>
          <p style="font-size: 0.8125rem; color: var(--text-secondary); margin-top: 2px;">
            ${prof ? `Prof. ${sanitize(prof.nombre)} ${sanitize(prof.apellido)}` : 'Sin profesor asignado'}
            <span style="margin: 0 4px;">·</span>
            <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2" style="vertical-align: middle; margin-top: -2px;"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
            ${trayecto.duracion ? sanitize(trayecto.duracion) : 'Duración sin definir'}
            ${trayecto.descripcion ? `<span style="margin: 0 4px;">·</span>${sanitize(trayecto.descripcion)}` : ''}
          </p>
        </div>
      </div>
      <div class="section-actions">
        <button class="btn btn-secondary" id="btn-docs">${icons.document} Archivos</button>
        <button class="btn btn-secondary" id="btn-actas">${icons.document} Actas Académicas</button>
        ${isOwner ? `
        <button class="btn btn-secondary" id="btn-vincular-comun">${icons.plus} Vincular Mód. Común</button>
        ` : ''}
        ${isMainOwner ? `
        <button class="btn btn-secondary" id="btn-importar-csv">📥 Importar CSV</button>
        <button class="btn btn-add" id="btn-inscribir">${icons.plus} Inscribir Estudiante</button>
        ` : ''}
      </div>
    </div>


    <!-- Tabs -->
    <div class="content-tabs">
      <button class="content-tab active" data-tab="seguimiento">Seguimiento Académico</button>
      <button class="content-tab" data-tab="comparativa">Vista Comparativa</button>
      <button class="content-tab" data-tab="historial">Historial Individual</button>
      <button class="content-tab" data-tab="asistencia">📋 Asistencia</button>
    </div>

    <!-- Tab Content -->
    <div id="tab-content">
      ${renderSeguimientoTab(inscriptoData, allModulosTray, seguimiento, isOwner, isMainOwner)}
    </div>

    <style>
      .status-select {
        background: var(--bg-input);
        border: 1px solid var(--border-color);
        border-radius: 6px;
        padding: 4px 8px;
        font-size: 0.75rem;
        color: var(--text-primary);
        font-family: var(--font-family);
        cursor: pointer;
        appearance: none;
        min-width: 100px;
      }
      .status-select:focus { border-color: var(--border-color-focus); outline: none; }
      .mod-tipo { font-size: 0.6rem; padding: 2px 6px; border-radius: 4px; font-weight: 600; text-transform: uppercase; }
      .mod-tipo.especifico { background: rgba(245, 158, 11, 0.15); color: var(--accent-orange); }
      .mod-tipo.comun { background: rgba(139, 92, 246, 0.15); color: var(--accent-purple-light); }
      .progress-mini { width: 60px; height: 6px; background: rgba(255,255,255,0.08); border-radius: 3px; overflow: hidden; display: inline-block; vertical-align: middle; margin-right: 6px; }
      .progress-mini-fill { height: 100%; border-radius: 3px; background: var(--gradient-primary); transition: width 0.5s ease; }
      .inscripto-row td { vertical-align: middle; }
      .estado-badge { padding: 4px 10px; border-radius: 999px; font-size: 0.7rem; font-weight: 600; display: inline-block; }
      .estado-badge.en-curso { background: rgba(59,130,246,0.15); color: var(--accent-blue); }
      .estado-badge.regular { background: rgba(245,158,11,0.15); color: var(--accent-orange); }
      .estado-badge.completo { background: rgba(16,185,129,0.15); color: var(--accent-green); }
      .estado-badge.finalizado { background: rgba(139,92,246,0.15); color: var(--accent-purple-light); }
      .estado-badge.abandonado { background: rgba(239,68,68,0.15); color: var(--accent-red); }
      .hist-card { background: var(--bg-card); border: 1px solid var(--border-color); border-radius: 12px; padding: 16px; margin-bottom: 12px; }
      .back-arrow { transform: rotate(225deg); }
    </style>
  `;

  // Panel
  panel.innerHTML = `
    <div class="widget">
      <div class="widget-header"><span class="widget-title">Resumen</span></div>
      <div class="widget-stats">
        <div class="widget-stat">
          <div class="widget-stat-value">${inscriptoData.length}</div>
          <div class="widget-stat-label">Inscriptos</div>
        </div>
        <div class="widget-stat">
          <div class="widget-stat-value">${allModulosTray.length}</div>
          <div class="widget-stat-label">Módulos</div>
        </div>
      </div>
    </div>
    <div class="widget">
      <div class="widget-header">
        <span class="widget-title">Profesores Asignados</span>
      </div>
      ${profesoresAsignados.length === 0
      ? '<p style="font-size:0.8125rem;color:var(--text-muted);">Sin profesores asignados</p>'
      : profesoresAsignados.map(p => `
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;">
            <div style="display:flex;align-items:center;gap:8px;">
              <div style="width:30px;height:30px;border-radius:50%;background:var(--gradient-primary);display:flex;align-items:center;justify-content:center;font-size:0.7rem;font-weight:700;color:white;flex-shrink:0;">
                ${(p.nombre || '?').charAt(0).toUpperCase()}
              </div>
              <div>
                <div style="font-size:0.8125rem;font-weight:600;">${sanitize(p.nombre)} ${sanitize(p.apellido || '')}</div>
                ${p.especialidad ? `<div style="font-size:0.7rem;color:var(--text-muted);">${sanitize(p.especialidad)}</div>` : ''}
              </div>
            </div>
            ${isMainOwner ? `
            <button class="card-action-btn delete" title="Desvincular"
              onclick="window.desvincularProfesor('${asignacionesTray.find(a => a.profesor_id === p.id)?.id}')" style="opacity:1;">
              ${icons.trash}
            </button>
            ` : ''}
          </div>
        `).join('')
    }
    </div>
    <div class="widget">
      <div class="widget-header"><span class="widget-title">Módulos del Trayecto</span></div>
      ${allModulosTray.length === 0 ? '<p style="font-size:0.8125rem;color:var(--text-muted);">Sin módulos asignados</p>' :
      allModulosTray.map(m => {
        const estado = m.estadoMod;
        let colorClass = 'var(--text-muted)';
        let bgClass = 'var(--bg-secondary)';
        let borderClass = 'var(--border-color)';
        if (estado === 'En curso') { colorClass = 'var(--accent-blue)'; bgClass = 'rgba(59,130,246,0.15)'; borderClass = 'transparent'; }
        if (estado === 'Completado') { colorClass = 'var(--accent-green)'; bgClass = 'rgba(16,185,129,0.15)'; borderClass = 'transparent'; }
        
        return `
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px;padding:8px;border-radius:8px;background:rgba(255,255,255,0.02);border:1px solid ${estado !== 'Falta' ? borderClass : 'var(--border-color)'};">
            <div style="display:flex;align-items:center;gap:8px; opacity: ${estado !== 'Falta' ? '1' : '0.6'};">
              <span class="mod-tipo ${m.tipo === 'Específico' ? 'especifico' : 'comun'}">${m.tipo}</span>
              <span style="font-size:0.8125rem;color:var(--text-primary);${estado !== 'Falta' ? 'font-weight:600;' : ''}">${sanitize(m.nombre)}</span>
            </div>
            <span style="padding:2px 8px;font-size:0.7rem; border-radius:12px; border: 1px solid ${borderClass}; background: ${bgClass}; color: ${colorClass}; font-weight: 600;">
              ${estado}
            </span>
          </div>
        `;
      }).join('')
    }
    </div>
    <div class="widget widget-gradient">
      <div class="widget-header"><span class="widget-title">💡 Tip</span></div>
      <p style="font-size:0.8125rem;color:var(--text-secondary);line-height:1.5;">
        Los profesores de los módulos comunes se asignan automáticamente al trayecto al vincular el módulo.
      </p>
    </div>
  `;

  // === Eventos ===
  document.getElementById('btn-back')?.addEventListener('click', () => {
    currentView = 'list';
    selectedTrayectoId = null;
    renderTrayectosList();
  });

  // Tabs
  content.querySelectorAll('.content-tab').forEach(tab => {
    tab.addEventListener('click', async () => {
      content.querySelectorAll('.content-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const tabId = tab.dataset.tab;
      const tabContent = document.getElementById('tab-content');
      if (tabId === 'seguimiento') {
        tabContent.innerHTML = renderSeguimientoTab(inscriptoData, allModulosTray, seguimiento, isOwner, isMainOwner);
        bindSeguimientoEvents(inscriptoData, allModulosTray, unidades, currentProfesorId, isOwner);
      } else if (tabId === 'comparativa') {
        tabContent.innerHTML = renderComparativaTab(inscriptoData, allModulosTray, seguimiento);
      } else if (tabId === 'historial') {
        tabContent.innerHTML = renderHistorialTab(inscriptoData, allModulosTray, seguimiento, trayecto);
      } else if (tabId === 'asistencia') {
        const estudiantesInscriptos = inscriptoData.map(d => d.estudiante).filter(Boolean);
        tabContent.innerHTML = '<div style="padding:32px;text-align:center;color:var(--text-muted);">Cargando planilla de asistencia...</div>';
        const html = await renderAsistenciaTab('trayecto', trayectoId, estudiantesInscriptos);
        tabContent.innerHTML = html;
        bindAsistenciaEvents('trayecto', trayectoId, estudiantesInscriptos, tabContent);
      }
    });
  });

  // Inscribir estudiante
  document.getElementById('btn-inscribir')?.addEventListener('click', () => {
    openInscripcionModal(noInscriptos, trayectoId);
  });

  // Importar estudiantes desde CSV
  document.getElementById('btn-importar-csv')?.addEventListener('click', () => {
    openImportarCSVModal(trayectoId, trayecto.nombre);
  });

  // Documentos
  document.getElementById('btn-docs')?.addEventListener('click', () => {
    openDocsModal(trayecto);
  });

  // Vincular módulo común
  document.getElementById('btn-vincular-comun')?.addEventListener('click', () => {
    openVincularComunModal(trayectoId, submodulos, comunLinks);
  });



  // Desvincular profesor (global)
  window.desvincularProfesor = async (asignacionId) => {
    if (!asignacionId) return;
    if (!confirm('¿Desvincular este profesor del trayecto?')) return;
    try {
      await remove('asignaciones_profesor', asignacionId);
      showToast('Profesor desvinculado');
      renderTrayectoDetail(trayectoId);
    } catch (err) { showToast('Error: ' + err.message, 'error'); }
  };

  bindSeguimientoEvents(inscriptoData, allModulosTray, unidades, currentProfesorId, isOwner);
}

// ============================================
// TAB: SEGUIMIENTO ACADÉMICO
// ============================================
function renderSeguimientoTab(inscriptoData, allModulosTray, seguimiento, isOwner = false, isMainOwner = false) {
  if (inscriptoData.length === 0) {
    return `<div class="empty-state" style="padding: 32px;"><p class="empty-state-text">No hay estudiantes inscriptos. Usá el botón "Inscribir Estudiante".</p></div>`;
  }

  return `
    <div class="table-container">
      <table class="table">
        <thead>
          <tr>
            <th>Estudiante</th>
            <th>Estado</th>
            <th>Avance</th>
            <th>Aprobados</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          ${inscriptoData.map(data => {
    if (!data.estudiante) return '';
    const est = data.estudiante;
    const estadoClass = data.estado.toLowerCase().replace(' ', '-');
    return `
              <tr class="inscripto-row">
                <td>
                  <div style="display:flex;align-items:center;gap:8px;">
                    <div style="width:32px;height:32px;border-radius:999px;display:flex;align-items:center;justify-content:center;font-size:0.7rem;font-weight:700;color:white;background:${stringToColor(est.nombre + est.apellido)};flex-shrink:0;">
                      ${getInitials(est.nombre, est.apellido)}
                    </div>
                    <div>
                      <div style="font-weight:600;">${sanitize(est.nombre)} ${sanitize(est.apellido)}</div>
                      <div style="font-size:0.75rem;color:var(--text-muted);">DNI: ${sanitize(est.dni)}</div>
                    </div>
                  </div>
                </td>
                <td><span class="estado-badge ${estadoClass}">${data.estado}</span></td>
                <td>
                  <div class="progress-mini"><div class="progress-mini-fill" style="width:${data.porcentaje}%"></div></div>
                  <span style="font-size:0.8rem;font-weight:600;">${data.porcentaje}%</span>
                </td>
                <td>${data.aprobados}/${data.totalMods}</td>
                <td>
                  <div style="display:flex;gap:4px;">
                    <button class="card-action-btn seg-detail-btn" data-inscid="${data.id}" title="Ver seguimiento" style="opacity:1;">${icons.trayectos}</button>
                    ${isMainOwner ? `
                    <button class="card-action-btn estado-btn" data-inscid="${data.id}" title="Cambiar estado" style="opacity:1;">${icons.edit}</button>
                    <button class="card-action-btn delete desinscribir-btn" data-inscid="${data.id}" title="Desinscribir" style="opacity:1;">${icons.trash}</button>
                    ` : ''}
                  </div>
                </td>
              </tr>
            `;
  }).join('')}
        </tbody>
      </table>
    </div>
  `;
}

function bindSeguimientoEvents(inscriptoData, allModulosTray, unidades, currentProfesorId = null, isOwner = false) {
  // Ver seguimiento detallado por estudiante
  document.querySelectorAll('.seg-detail-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const data = inscriptoData.find(d => d.id === btn.dataset.inscid);
      if (data) openSeguimientoDetalleModal(data, allModulosTray, unidades, currentProfesorId, isOwner);
    });
  });

  // Cambiar estado inscripción
  document.querySelectorAll('.estado-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const data = inscriptoData.find(d => d.id === btn.dataset.inscid);
      if (data) openCambiarEstadoModal(data);
    });
  });

  // Desinscribir
  document.querySelectorAll('.desinscribir-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const data = inscriptoData.find(d => d.id === btn.dataset.inscid);
      if (data?.estudiante) {
        confirmDialog(`¿Desinscribir a <strong>${sanitize(data.estudiante.nombre)} ${sanitize(data.estudiante.apellido)}</strong>?`, async () => {
          // Eliminar seguimiento asociado
          for (const s of data.seguimiento) { await remove('seguimiento_modulos', s.id); }
          if (data.seguimientoUnidades) {
            for (const s of data.seguimientoUnidades) { await remove('seguimiento_unidades', s.id); }
          }
          await remove('inscripciones', data.id);
          showToast('Estudiante desinscripto');
          renderTrayectos();
        });
      }
    });
  });
}

// ============================================
// TAB: VISTA COMPARATIVA  
// ============================================
function renderComparativaTab(inscriptoData, allModulosTray, seguimiento) {
  if (inscriptoData.length === 0 || allModulosTray.length === 0) {
    return `<div class="empty-state" style="padding:32px;"><p class="empty-state-text">Necesitás tener estudiantes inscriptos y módulos asignados para ver la vista comparativa.</p></div>`;
  }

  return `
    <div class="table-container" style="overflow-x:auto;">
      <table class="table" style="min-width:${300 + allModulosTray.length * 120}px;">
        <thead>
          <tr>
            <th style="position:sticky;left:0;background:var(--bg-card);z-index:2;min-width:180px;">Estudiante</th>
            ${allModulosTray.map(m => `
              <th style="text-align:center;min-width:110px;">
                <div>${sanitize(m.nombre)}</div>
                <span class="mod-tipo ${m.tipo === 'Específico' ? 'especifico' : 'comun'}" style="margin-top:4px;">${m.tipo}</span>
              </th>
            `).join('')}
            <th style="text-align:center;">Estado</th>
          </tr>
        </thead>
        <tbody>
          ${inscriptoData.map(data => {
    if (!data.estudiante) return '';
    const est = data.estudiante;
    const estadoClass = data.estado.toLowerCase().replace(' ', '-');
    return `
              <tr>
                <td style="position:sticky;left:0;background:var(--bg-secondary);z-index:1;">
                  <strong>${sanitize(est.nombre)} ${sanitize(est.apellido)}</strong>
                </td>
                ${allModulosTray.map(m => {
      const seg = data.seguimiento.find(s =>
        (m.refField === 'modulo_id' && s.modulo_id === m.refId) ||
        (m.refField === 'submodulo_id' && s.submodulo_id === m.refId)
      );
      const estado = seg?.estado || 'Pendiente';
      let icon = '', bgColor = '';
      if (estado === 'Aprobado') { icon = '✓'; bgColor = 'rgba(16,185,129,0.2)'; }
      else if (estado === 'Desaprobado') { icon = '✗'; bgColor = 'rgba(239,68,68,0.2)'; }
      else if (estado === 'En curso') { icon = '◉'; bgColor = 'rgba(59,130,246,0.15)'; }
      else { icon = '○'; bgColor = 'rgba(255,255,255,0.03)'; }
      return `<td style="text-align:center;"><span style="display:inline-block;padding:4px 12px;border-radius:8px;font-size:0.8rem;background:${bgColor};min-width:80px;">${icon} ${estado}</span></td>`;
    }).join('')}
                <td style="text-align:center;"><span class="estado-badge ${estadoClass}">${data.estado}</span></td>
              </tr>
            `;
  }).join('')}
        </tbody>
      </table>
    </div>
    <div style="display:flex;gap:16px;margin-top:12px;flex-wrap:wrap;">
      <span style="font-size:0.75rem;color:var(--text-muted);">✓ Aprobado</span>
      <span style="font-size:0.75rem;color:var(--text-muted);">✗ Desaprobado</span>
      <span style="font-size:0.75rem;color:var(--text-muted);">◉ En curso</span>
      <span style="font-size:0.75rem;color:var(--text-muted);">○ Pendiente</span>
    </div>
  `;
}

// ============================================
// TAB: HISTORIAL INDIVIDUAL
// ============================================
function renderHistorialTab(inscriptoData, allModulosTray, seguimiento, trayecto) {
  if (inscriptoData.length === 0) {
    return `<div class="empty-state" style="padding:32px;"><p class="empty-state-text">No hay estudiantes inscriptos.</p></div>`;
  }

  return `
    <div style="display:flex;flex-direction:column;gap:16px;">
      ${inscriptoData.map(data => {
    if (!data.estudiante) return '';
    const est = data.estudiante;
    const especAprobados = data.seguimiento.filter(s => s.modulo_id && s.estado === 'Aprobado');
    const comunAprobados = data.seguimiento.filter(s => s.submodulo_id && s.estado === 'Aprobado');
    const pendientes = allModulosTray.filter(m => {
      return !data.seguimiento.some(s =>
        s.estado === 'Aprobado' &&
        ((m.refField === 'modulo_id' && s.modulo_id === m.refId) ||
          (m.refField === 'submodulo_id' && s.submodulo_id === m.refId))
      );
    });
    const estadoClass = data.estado.toLowerCase().replace(' ', '-');
    return `
          <div class="hist-card">
            <div style="display:flex;align-items:center;gap:12px;margin-bottom:12px;">
              <div style="width:40px;height:40px;border-radius:999px;display:flex;align-items:center;justify-content:center;font-size:0.8rem;font-weight:700;color:white;background:${stringToColor(est.nombre + est.apellido)};flex-shrink:0;">
                ${getInitials(est.nombre, est.apellido)}
              </div>
              <div style="flex:1;">
                <div style="font-weight:600;font-size:1rem;">${sanitize(est.nombre)} ${sanitize(est.apellido)}</div>
                <div style="font-size:0.75rem;color:var(--text-muted);">DNI: ${sanitize(est.dni)} · Ingreso: ${est.anio_ingreso}</div>
              </div>
              <span class="estado-badge ${estadoClass}">${data.estado}</span>
            </div>
            <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:12px;">
              <div>
                <div style="font-size:0.7rem;text-transform:uppercase;color:var(--text-muted);font-weight:600;margin-bottom:4px;">Mód. Específicos Aprobados</div>
                ${especAprobados.length > 0 ? especAprobados.map(s => {
      const mod = allModulosTray.find(m => m.refField === 'modulo_id' && m.refId === s.modulo_id);
      return `<span class="badge badge-approved" style="margin:2px;">${mod ? sanitize(mod.nombre) : '?'}</span>`;
    }).join('') : '<span style="font-size:0.8rem;color:var(--text-muted);">Ninguno</span>'}
              </div>
              <div>
                <div style="font-size:0.7rem;text-transform:uppercase;color:var(--text-muted);font-weight:600;margin-bottom:4px;">Mód. Comunes Aprobados</div>
                ${comunAprobados.length > 0 ? comunAprobados.map(s => {
      const mod = allModulosTray.find(m => m.refField === 'submodulo_id' && m.refId === s.submodulo_id);
      return `<span class="badge badge-active" style="margin:2px;">${mod ? sanitize(mod.nombre) : '?'}</span>`;
    }).join('') : '<span style="font-size:0.8rem;color:var(--text-muted);">Ninguno</span>'}
              </div>
              <div>
                <div style="font-size:0.7rem;text-transform:uppercase;color:var(--text-muted);font-weight:600;margin-bottom:4px;">Pendientes</div>
                ${pendientes.length > 0 ? pendientes.map(m =>
      `<span class="badge badge-pending" style="margin:2px;">${sanitize(m.nombre)}</span>`
    ).join('') : '<span style="font-size:0.8rem;color:var(--accent-green);">¡Todo aprobado!</span>'}
              </div>
            </div>
            <div style="margin-top:8px;font-size:0.8rem;color:var(--text-secondary);">
              Avance: <strong>${data.porcentaje}%</strong> (${data.aprobados}/${data.totalMods} módulos)
            </div>
          </div>
        `;
  }).join('')}
    </div>
  `;
}

// ============================================
// MODALES
// ============================================

function openTrayectoModal(trayecto, profesores) {
  const isEdit = !!trayecto;
  const authUser = getCurrentUser();
  const isAdmin = authUser?.role === 'administrador';
  // Buscar el prof. que corresponde al usuario logueado (por auth_id)
  const myProfesor = profesores.find(p => p.auth_id === authUser?.id);
  // Al crear: preseleccionar propio prof. Al editar: respetar el valor guardado
  const selectedProfId = isEdit ? (trayecto.profesor_id || '') : (myProfesor?.id || '');
  const formHTML = `
    <div class="form-group">
      <label class="form-label">Nombre del Trayecto</label>
      <input type="text" class="form-input" id="tray-nombre" value="${isEdit ? sanitize(trayecto.nombre) : ''}" required placeholder="Ej: Desarrollo de Software" />
    </div>
    <div class="form-row">
      <div class="form-group">
        <label class="form-label">Profesor Responsable</label>
        ${(!isAdmin && myProfesor) ? `
          <input type="text" class="form-input" value="${sanitize(myProfesor.nombre)} ${sanitize(myProfesor.apellido || '')}" disabled style="opacity:0.7;cursor:not-allowed;" />
          <input type="hidden" id="tray-profesor" value="${myProfesor.id}" />
          <p style="font-size:0.72rem;color:var(--text-muted);margin-top:4px;">Asignado automáticamente a tu perfil docente.</p>
        ` : `
          <select class="form-select" id="tray-profesor">
            <option value="">Sin asignar</option>
            ${profesores.map(p => `
              <option value="${p.id}" ${selectedProfId === p.id ? 'selected' : ''}>
                ${sanitize(p.nombre)} ${sanitize(p.apellido)} - ${sanitize(p.especialidad || '')}
              </option>
            `).join('')}
          </select>
        `}
      </div>
      <div class="form-group">
        <label class="form-label">Duración (ej: "3 meses", "1 año")</label>
        <input type="text" class="form-input" id="tray-duracion" value="${isEdit ? sanitize(trayecto.duracion || '') : ''}" placeholder="Ej: 6 meses" />
      </div>
    </div>
    <div class="form-group">
      <label class="form-label">Descripción</label>
      <textarea class="form-textarea" id="tray-desc" placeholder="Descripción...">${isEdit ? sanitize(trayecto.descripcion || '') : ''}</textarea>
    </div>
  `;
  const footerHTML = `
    <button class="btn btn-secondary" id="modal-cancel">Cancelar</button>
    <button class="btn btn-primary" id="modal-save">${isEdit ? 'Guardar' : 'Crear Trayecto'}</button>
  `;
  const overlay = createModal(isEdit ? 'Editar Trayecto' : 'Nuevo Trayecto', formHTML, footerHTML);
  overlay.querySelector('#modal-cancel').addEventListener('click', () => overlay.remove());
  overlay.querySelector('#modal-save').addEventListener('click', async () => {
    const nombre = document.getElementById('tray-nombre').value.trim();
    const profesor_id = document.getElementById('tray-profesor').value || null;
    const duracion = document.getElementById('tray-duracion').value.trim() || null;
    const descripcion = document.getElementById('tray-desc').value.trim();
    if (!nombre) { showToast('Ingresá el nombre', 'error'); return; }

    console.log('[Trayectos] Intentando guardar:', { isEdit, nombre, profesor_id, duracion, descripcion });

    try {
      if (isEdit) { await update('trayectos_formativos', trayecto.id, { nombre, profesor_id, duracion, descripcion }); showToast('Trayecto actualizado'); }
      else {
        const authUser = getCurrentUser();
        await create('trayectos_formativos', { nombre, profesor_id, duracion, descripcion, created_by: authUser?.id || null });
        showToast('Trayecto creado');
      }
      overlay.remove();
      renderTrayectos();
    } catch (err) { showToast(err.message || 'Error', 'error'); }
  });
}

// ============================================
// MODAL: Crear/Editar Módulo Específico desde Trayecto
// ============================================
function openModuloDesdeModal(modulo, trayectoId, trayectoNombre) {
  const isEdit = !!modulo;
  const formHTML = `
    <div class="form-group">
      <label class="form-label">Trayecto Formativo</label>
      <input type="text" class="form-input" value="${sanitize(trayectoNombre)}" disabled style="opacity:0.7;cursor:not-allowed;" />
    </div>
    <div class="form-row">
      <div class="form-group" style="flex:2;">
        <label class="form-label">Nombre del Módulo Específico</label>
        <input type="text" class="form-input" id="mod-inline-nombre" value="${isEdit ? sanitize(modulo.nombre) : ''}" required placeholder="Ej: Programación I" />
      </div>
      <div class="form-group" style="flex:1;">
        <label class="form-label">Año</label>
        <input type="number" class="form-input" id="mod-inline-anio" value="${isEdit ? (modulo.anio || '') : getCurrentYear()}" placeholder="2026" min="2000" max="2100" />
      </div>
    </div>
  `;
  const footerHTML = `
    <button class="btn btn-secondary" id="modal-cancel">Cancelar</button>
    <button class="btn btn-primary" id="modal-save">${isEdit ? 'Guardar Cambios' : 'Crear Módulo'}</button>
  `;
  const overlay = createModal(
    isEdit ? 'Editar Módulo Específico' : `Nuevo Módulo — ${sanitize(trayectoNombre)}`,
    formHTML,
    footerHTML
  );

  overlay.querySelector('#modal-cancel').addEventListener('click', () => overlay.remove());
  overlay.querySelector('#modal-save').addEventListener('click', async () => {
    const nombre = document.getElementById('mod-inline-nombre').value.trim();
    const anio = parseInt(document.getElementById('mod-inline-anio').value) || null;

    if (!nombre) { showToast('Ingresá el nombre del módulo', 'error'); return; }

    try {
      if (isEdit) {
        await update('modulos', modulo.id, { nombre, anio, trayecto_id: trayectoId });
        showToast('Módulo actualizado');
      } else {
        const authUser = getCurrentUser();
        await create('modulos', { nombre, anio, trayecto_id: trayectoId, created_by: authUser?.id || null });
        showToast('Módulo creado');
      }
      overlay.remove();
      renderTrayectos();
    } catch (err) { showToast(err.message || 'Error', 'error'); }
  });
}

function openInscripcionModal(noInscriptos, trayectoId) {
  const formHTML = `
    <!-- Pestañas del Modal -->
    <div style="display:flex;gap:8px;margin-bottom:16px;border-bottom:1px solid rgba(255,255,255,0.1);padding-bottom:12px;">
      <button type="button" class="btn tab-inscripcion active" data-tab="existente" style="flex:1;background:rgba(139,92,246,0.15);color:var(--accent-purple-light);border:1px solid rgba(139,92,246,0.3);font-size:0.8rem;">Seleccionar Existente</button>
      <button type="button" class="btn tab-inscripcion" data-tab="nuevo" style="flex:1;background:transparent;color:var(--text-muted);border:1px solid transparent;font-size:0.8rem;">+ Registrar Nuevo</button>
    </div>

    <!-- Sección: Existente -->
    <div id="seccion-existente">
      ${noInscriptos.length === 0 ? `
        <div class="empty-state" style="padding:20px 10px;background:rgba(255,255,255,0.02);border-radius:8px;">
          <p class="empty-state-text" style="font-size:0.85rem;margin:0;">Todos los alumnos están inscriptos.</p>
        </div>
      ` : `
        <div class="form-group">
          <label class="form-label">Buscar Estudiante</label>
          <select class="form-select" id="insc-estudiante">
            <option value="">Elegir estudiante...</option>
            ${noInscriptos.map(e => `<option value="${e.id}">${sanitize(e.nombre)} ${sanitize(e.apellido)} (DNI: ${sanitize(e.dni)})</option>`).join('')}
          </select>
        </div>
      `}
    </div>

    <!-- Sección: Nuevo Estudiante -->
    <div id="seccion-nuevo" style="display:none; padding:12px; background:rgba(255,255,255,0.02); border-radius:8px;">
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">DNI</label>
          <input type="text" class="form-input" id="insc-nuevo-dni" placeholder="Sin puntos" required />
        </div>
        <div class="form-group">
          <label class="form-label">Año</label>
          <input type="number" class="form-input" id="insc-nuevo-anio" value="${new Date().getFullYear()}" />
        </div>
      </div>
      <div class="form-row" style="margin-bottom:0;">
        <div class="form-group">
          <label class="form-label">Nombre</label>
          <input type="text" class="form-input" id="insc-nuevo-nombre" placeholder="Nombre" required />
        </div>
        <div class="form-group">
          <label class="form-label">Apellido</label>
          <input type="text" class="form-input" id="insc-nuevo-apellido" placeholder="Apellido" required />
        </div>
      </div>
    </div>

    <div class="form-group" style="margin-top:16px;">
      <label class="form-label">Estado Inicial en el Trayecto</label>
      <select class="form-select" id="insc-estado">
        <option value="En curso">En curso</option>
        <option value="Regular">Regular</option>
      </select>
    </div>
  `;
  const footerHTML = `
    <button class="btn btn-secondary" id="modal-cancel">Cancelar</button>
    <button class="btn btn-primary" id="modal-save">Inscribir</button>
  `;
  const overlay = createModal('Inscribir Estudiante', formHTML, footerHTML);

  // Lógica de pestañas
  let modoActual = 'existente';
  overlay.querySelectorAll('.tab-inscripcion').forEach(btn => {
    btn.addEventListener('click', () => {
      overlay.querySelectorAll('.tab-inscripcion').forEach(b => {
        b.style.background = 'transparent';
        b.style.color = 'var(--text-muted)';
        b.style.border = '1px solid transparent';
      });
      btn.style.background = 'rgba(139,92,246,0.15)';
      btn.style.color = 'var(--accent-purple-light)';
      btn.style.border = '1px solid rgba(139,92,246,0.3)';
      
      modoActual = btn.dataset.tab;
      overlay.querySelector('#seccion-existente').style.display = modoActual === 'existente' ? 'block' : 'none';
      overlay.querySelector('#seccion-nuevo').style.display = modoActual === 'nuevo' ? 'block' : 'none';
      
      // Control del botón guardar si no hay existentes
      if (modoActual === 'existente' && noInscriptos.length === 0) {
        overlay.querySelector('#modal-save').disabled = true;
      } else {
        overlay.querySelector('#modal-save').disabled = false;
      }
    });
  });

  if (noInscriptos.length === 0) {
    overlay.querySelector('[data-tab="nuevo"]').click();
  }

  overlay.querySelector('#modal-cancel').addEventListener('click', () => overlay.remove());
  
  overlay.querySelector('#modal-save').addEventListener('click', async () => {
    const estado = document.getElementById('insc-estado').value;
    const btnSave = overlay.querySelector('#modal-save');
    let estudiante_id = null;

    btnSave.disabled = true;
    btnSave.textContent = 'Guardando...';

    try {
      if (modoActual === 'existente') {
        estudiante_id = document.getElementById('insc-estudiante')?.value;
        if (!estudiante_id) { showToast('Seleccioná un estudiante', 'error'); btnSave.disabled = false; btnSave.textContent = 'Inscribir'; return; }
      } else {
        const dni = document.getElementById('insc-nuevo-dni').value.trim();
        const nombre = document.getElementById('insc-nuevo-nombre').value.trim();
        const apellido = document.getElementById('insc-nuevo-apellido').value.trim();
        const anio_ingreso = parseInt(document.getElementById('insc-nuevo-anio').value) || new Date().getFullYear();

        if (!dni || !nombre || !apellido) {
          showToast('DNI, Nombre y Apellido son obligatorios', 'error');
          btnSave.disabled = false; btnSave.textContent = 'Inscribir'; 
          return;
        }

        const estCreado = await create('estudiantes', { dni, nombre, apellido, anio_ingreso, estado: 'Activo' });
        estudiante_id = estCreado[0]?.id || estCreado.id; 
      }

      await create('inscripciones', { estudiante_id, trayecto_id: trayectoId, estado, fecha_inscripcion: new Date().toISOString().split('T')[0] });
      showToast('Estudiante inscripto con éxito', 'success');
      overlay.remove();
      renderTrayectos();
    } catch (err) { 
      // Supabase RLS error o duplicate
      if (err.message?.includes('duplicate key')) {
        showToast('Error: Ya existe un estudiante con ese DNI.', 'error');
      } else {
        showToast(err.message || 'Error al guardar', 'error'); 
      }
      btnSave.disabled = false;
      btnSave.textContent = 'Inscribir';
    }
  });
}

function openVincularComunModal(trayectoId, allSubmodulos, existingLinks) {
  const linkedIds = existingLinks.map(l => l.submodulo_id);
  const available = allSubmodulos.filter(s => !linkedIds.includes(s.id));

  if (available.length === 0) {
    showToast('Todos los módulos comunes ya están vinculados', 'error');
    return;
  }

  const formHTML = `
    <div class="form-group">
      <label class="form-label">Módulo Común a Vincular</label>
      <select class="form-select" id="vinc-submodulo">
        <option value="">Seleccionar...</option>
        ${available.map(s => `<option value="${s.id}">${sanitize(s.nombre)}</option>`).join('')}
      </select>
    </div>
    <p style="font-size:0.8rem;color:var(--text-muted);margin-top:8px;">
      Los módulos comunes vinculados se comparten entre trayectos. Si un estudiante lo aprobó en otro trayecto, se conserva.
    </p>
  `;
  const footerHTML = `
    <button class="btn btn-secondary" id="modal-cancel">Cancelar</button>
    <button class="btn btn-primary" id="modal-save">Vincular</button>
  `;
  const overlay = createModal('Vincular Módulo Común', formHTML, footerHTML);
  overlay.querySelector('#modal-cancel').addEventListener('click', () => overlay.remove());
  overlay.querySelector('#modal-save').addEventListener('click', async () => {
    const submodulo_id = document.getElementById('vinc-submodulo').value;
    if (!submodulo_id) { showToast('Seleccioná un módulo', 'error'); return; }
    try {
      await create('trayecto_modulo_comun', { trayecto_id: trayectoId, submodulo_id });
      
      // Automatizar asignación de profesor si el módulo tiene uno
      const sub = allSubmodulos.find(s => s.id === submodulo_id);
      if (sub && sub.profesor_id) {
        // Verificar si ya está asignado para evitar errores de duplicado
        const asignacionesExistentes = await fetchAll('asignaciones_profesor');
        const yaAsignado = asignacionesExistentes.some(a => a.trayecto_id === trayectoId && a.profesor_id === sub.profesor_id);
        
        if (!yaAsignado) {
          try {
            await create('asignaciones_profesor', { trayecto_id: trayectoId, profesor_id: sub.profesor_id });
            console.log(`[Trayectos] Profesor ${sub.profesor_id} asignado automáticamente.`);
          } catch (e) {
            console.error('[Trayectos] Error en asignación automática:', e);
          }
        }
      }

      showToast('Módulo común vinculado y profesor asignado');
      overlay.remove();
      renderTrayectoDetail(trayectoId);
    } catch (err) { showToast(err.message || 'Error', 'error'); }
  });
}

// ============================================
// MODAL: ASIGNAR PROFESOR AL TRAYECTO
// ============================================
function openAsignarProfesorModal(trayectoId, profesores, asignacionesExistentes) {
  const yaAsignadosIds = asignacionesExistentes.map(a => a.profesor_id);
  const disponibles = profesores.filter(p => !yaAsignadosIds.includes(p.id));

  if (disponibles.length === 0) {
    showToast('Todos los profesores ya están asignados a este trayecto', 'error');
    return;
  }

  const formHTML = `
    <div class="form-group">
      <label class="form-label">Seleccioná un Profesor</label>
      <select class="form-select" id="asign-profesor">
        <option value="">Elegir profesor...</option>
        ${disponibles.map(p => `
          <option value="${p.id}">
            ${sanitize(p.nombre)} ${sanitize(p.apellido || '')}
            ${p.especialidad ? ' — ' + sanitize(p.especialidad) : ''}
            ${p.auth_id ? ' ✓' : ' (sin cuenta)'}
          </option>
        `).join('')}
      </select>
      <p style="font-size:0.75rem;color:var(--text-muted);margin-top:6px;">
        ✓ = tiene cuenta de usuario. Los demás pueden ser asignados pero no podrán acceder por cuenta propia.
      </p>
    </div>
  `;
  const footerHTML = `
    <button class="btn btn-secondary" id="modal-cancel">Cancelar</button>
    <button class="btn btn-primary" id="modal-save">Asignar Profesor</button>
  `;
  const overlay = createModal('Asignar Profesor al Trayecto', formHTML, footerHTML);
  overlay.querySelector('#modal-cancel').addEventListener('click', () => overlay.remove());
  overlay.querySelector('#modal-save').addEventListener('click', async () => {
    const profesor_id = document.getElementById('asign-profesor').value;
    if (!profesor_id) { showToast('Seleccioná un profesor', 'error'); return; }
    try {
      await create('asignaciones_profesor', { profesor_id, trayecto_id: trayectoId });
      showToast('Profesor asignado al trayecto ✓');
      overlay.remove();
      renderTrayectoDetail(trayectoId);
    } catch (err) { showToast(err.message || 'Error al asignar', 'error'); }
  });
}

function openSeguimientoDetalleModal(inscripcionData, allModulosTray, unidades, currentProfesorId = null, isOwner = false) {
  // currentProfesorId: id del profesor en tabla 'profesores'. null = admin (sin restricciones).
  // Un módulo común es readonly si currentProfesorId != null Y módulo.profesor_id != currentProfesorId
  const est = inscripcionData.estudiante;
  if (!est) return;

  const formHTML = `
    <p style="margin-bottom:12px;font-size:0.9rem;color:var(--text-secondary);">
      Seguimiento de <strong>${sanitize(est.nombre)} ${sanitize(est.apellido)}</strong>
    </p>
    <div style="max-height:450px;overflow-y:auto;padding-right:8px;">
      ${allModulosTray.map(m => {
    const seg = inscripcionData.seguimiento.find(s =>
      (m.refField === 'modulo_id' && s.modulo_id === m.refId) ||
      (m.refField === 'submodulo_id' && s.submodulo_id === m.refId)
    );
    const estado = seg?.estado || 'Pendiente';
    const nota = seg?.nota || '';
    const fecha = seg?.fecha_aprobacion || '';
    const docente = seg?.docente_evaluador || '';

    // Determinar si este módulo es readonly para el profesor actual
    let isReadonly = false;
    if (currentProfesorId !== null) { // No es admin
      if (m.tipo === 'Específico') {
        isReadonly = !isOwner;
      } else { // Común
        isReadonly = m.profesor_id !== currentProfesorId;
      }
    }

    let unidadesHTML = '';
    if (m.tipo === 'Común' && unidades) {
      const modUnidades = unidades.filter(u => u.submodulo_id === m.refId).sort((a, b) => (a.orden || 0) - (b.orden || 0));
      if (modUnidades.length > 0) {
        unidadesHTML = `
          <div style="margin-top: 12px; padding-top: 12px; border-top: 1px dashed rgba(255,255,255,0.1);">
            <div style="font-size:0.7rem; color:var(--text-muted); text-transform:uppercase; margin-bottom:8px; display:flex; justify-content:space-between; align-items:center;">
              <span>Unidades de este módulo</span>
            </div>
            ${modUnidades.map(u => {
          const segU = inscripcionData.seguimientoUnidades?.find(su => su.unidad_id === u.id);
          const uEstado = segU?.estado || 'Pendiente';
          const uNota = segU?.nota || '';
          const uFecha = segU?.fecha_aprobacion || '';
          const uDocente = segU?.docente_evaluador || '';
          
          if (isReadonly) {
            return `
                <div style="margin-bottom:12px; padding-left:12px; border-left: 2px solid var(--accent-purple); background: rgba(0,0,0,0.15); padding-top:8px; padding-bottom:8px; padding-right:8px; border-radius:4px;">
                  <div style="font-size:0.8rem; margin-bottom:6px; color: var(--text-primary);"><strong>${u.orden ? u.orden + '. ' : ''}${sanitize(u.nombre)}</strong></div>
                  <div style="font-size:0.8rem;color:var(--text-secondary);">Estado: <strong>${uEstado}</strong>${uNota ? ` · Nota: <strong>${uNota}</strong>` : ''}</div>
                </div>
            `;
          }

          return `
                <div style="margin-bottom:12px; padding-left:12px; border-left: 2px solid var(--accent-purple); background: rgba(0,0,0,0.15); padding-top:8px; padding-bottom:8px; padding-right:8px; border-radius:4px;">
                  <div style="font-size:0.8rem; margin-bottom:6px; color: var(--text-primary);"><strong>${u.orden ? u.orden + '. ' : ''}${sanitize(u.nombre)}</strong></div>
                  <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;">
                    <select class="form-select status-select seg-uni-estado" data-uni-id="${u.id}" data-seg-id="${segU?.id || ''}" style="font-size:0.75rem; padding: 4px 6px; ${uEstado === 'No aplica' ? 'background:rgba(255,255,255,0.05);color:var(--text-muted);border-color:var(--text-muted);' : ''}">
                      <option value="Pendiente" ${uEstado === 'Pendiente' ? 'selected' : ''}>Pendiente</option>
                      <option value="En curso" ${uEstado === 'En curso' ? 'selected' : ''}>En curso</option>
                      <option value="Aprobado" ${uEstado === 'Aprobado' ? 'selected' : ''}>Aprobado</option>
                      <option value="Desaprobado" ${uEstado === 'Desaprobado' ? 'selected' : ''}>Desaprobado</option>
                      <option value="No aplica" ${uEstado === 'No aplica' ? 'selected' : ''}>No aplica</option>
                    </select>
                    <input type="number" class="form-input seg-uni-nota" data-uni-id="${u.id}" value="${uNota}" min="1" max="10" step="0.5" placeholder="Nota" style="font-size:0.75rem; padding: 4px 6px;" ${uEstado === 'No aplica' ? 'disabled' : ''} />
                    <input type="date" class="form-input seg-uni-fecha" data-uni-id="${u.id}" value="${uFecha}" style="font-size:0.75rem; padding: 4px 6px; grid-column: span 2;" ${uEstado === 'No aplica' ? 'disabled' : ''} />
                  </div>
                </div>
              `;
        }).join('')}
          </div>
        `;
      }
    }

    return `
          <div style="padding:14px;border:1px solid ${isReadonly ? 'rgba(139,92,246,0.2)' : 'var(--border-color)'};border-radius:10px;margin-bottom:12px;background:var(--bg-input);">
            <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:12px;">
              <div style="display:flex;align-items:center;gap:8px;">
                <span class="mod-tipo ${m.tipo === 'Espec\u00edfico' ? 'especifico' : 'comun'}">${m.tipo}</span>
                <strong style="font-size:0.95rem;">${sanitize(m.nombre)}</strong>
              </div>
              ${isReadonly ? '<span style="font-size:0.7rem;color:var(--accent-purple-light);background:rgba(139,92,246,0.1);padding:3px 8px;border-radius:20px;">\uD83D\uDD12 Solo el prof. a cargo puede editar</span>' : ''}
            </div>

            ${isReadonly
        ? `<div style="padding:8px 12px;background:rgba(255,255,255,0.04);border-radius:8px;font-size:0.875rem;color:var(--text-secondary);">Estado: <strong>${estado}</strong>${nota ? ` · Nota: <strong>${nota}</strong>` : ''}</div>`
        : `
            <!-- Botones de estado visibles -->
            <div style="margin-bottom:10px;">
              <div style="font-size:0.7rem;text-transform:uppercase;letter-spacing:0.5px;color:var(--text-muted);font-weight:600;margin-bottom:6px;">Estado del módulo</div>
              <div style="display:flex;gap:6px;flex-wrap:wrap;">
                ${[
          { val: 'Pendiente', color: 'rgba(255,255,255,0.06)', border: 'rgba(255,255,255,0.1)', active: 'rgba(255,255,255,0.12)', label: '⏸ Pendiente' },
          { val: 'En curso', color: 'rgba(59,130,246,0.08)', border: 'rgba(59,130,246,0.25)', active: 'rgba(59,130,246,0.25)', label: '▶ En curso' },
          { val: 'Aprobado', color: 'rgba(16,185,129,0.08)', border: 'rgba(16,185,129,0.3)', active: 'rgba(16,185,129,0.3)', label: '✓ Aprobar' },
          { val: 'Desaprobado', color: 'rgba(239,68,68,0.08)', border: 'rgba(239,68,68,0.3)', active: 'rgba(239,68,68,0.3)', label: '✗ Desaprobar' },
        ].map(opt => `
                  <button type="button"
                    class="estado-pill-btn"
                    data-target-select="seg-estado-${m.refId}"
                    data-value="${opt.val}"
                    style="
                      padding:6px 14px;border-radius:20px;font-size:0.8rem;font-weight:600;cursor:pointer;transition:all 0.15s;border:1.5px solid ${opt.border};
                      background:${estado === opt.val ? opt.active : opt.color};
                      color:${estado === opt.val ? 'var(--text-primary)' : 'var(--text-secondary)'};
                      ${estado === opt.val ? 'box-shadow:0 0 0 2px ' + opt.border + ';' : ''}
                    "
                  >${opt.label}</button>
                `).join('')}
              </div>
            </div>
            <!-- Select oculto (lo usa el save handler) -->
            <select class="seg-estado" id="seg-estado-${m.refId}" data-ref-field="${m.refField}" data-ref-id="${m.refId}" data-seg-id="${seg?.id || ''}" style="display:none;">
              <option value="Pendiente" ${estado === 'Pendiente' ? 'selected' : ''}>Pendiente</option>
              <option value="En curso" ${estado === 'En curso' ? 'selected' : ''}>En curso</option>
              <option value="Aprobado" ${estado === 'Aprobado' ? 'selected' : ''}>Aprobado</option>
              <option value="Desaprobado" ${estado === 'Desaprobado' ? 'selected' : ''}>Desaprobado</option>
            </select>
            <!-- Nota, fecha -->
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:6px;">
              <div class="form-group" style="gap:4px;">
                <label class="form-label" style="font-size:0.7rem;">Nota (1-10)</label>
                <input type="number" class="form-input seg-nota" data-ref-id="${m.refId}" value="${nota}" min="1" max="10" step="0.5" placeholder="-" style="padding:6px 10px;font-size:0.8rem;" />
              </div>
              <div class="form-group" style="gap:4px;">
                <label class="form-label" style="font-size:0.7rem;">Fecha aprobaci\u00f3n</label>
                <input type="date" class="form-input seg-fecha" data-ref-id="${m.refId}" value="${fecha}" style="padding:6px 10px;font-size:0.8rem;" />
              </div>
            </div>`
      }
            ${unidadesHTML}
          </div>
    `;

  }).join('')}
    </div>
  `;

  const footerHTML = `
    <button class="btn btn-secondary" id="modal-cancel">Cancelar</button>
    <button class="btn btn-primary" id="modal-save" style="display: ${isOwner || currentProfesorId === null ? 'block' : 'none'}">Guardar Todo</button>
  `;

  // Wait, if a common module is editable by a teacher who is NOT the trayecto owner, they still need "Guardar Todo".
  // So instead: We should always show "Guardar Todo" if there is at least ONE module that is NOT readonly. Wait, the modal has the class logic below. Let me just restore the modal save button:
  const footerHTMLFinal = `
    <button class="btn btn-secondary" id="modal-cancel">Cancelar / Cerrar</button>
    <button class="btn btn-primary" id="modal-save">Guardar Todo</button>
  `;

  const overlay = createModal('Seguimiento Académico', formHTML, footerHTMLFinal);

  // Conectar los botones de estado (pills) con el select oculto
  overlay.querySelectorAll('.estado-pill-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const selectId = btn.dataset.targetSelect;
      const value = btn.dataset.value;
      const select = overlay.querySelector('#' + selectId);
      if (select) select.value = value;

      // Actualizar estilos visuales del grupo de botones
      const siblings = overlay.querySelectorAll(`[data-target-select="${selectId}"]`);
      siblings.forEach(b => {
        const isActive = b.dataset.value === value;
        const colors = {
          'Pendiente': { border: 'rgba(255,255,255,0.1)', active: 'rgba(255,255,255,0.12)' },
          'En curso': { border: 'rgba(59,130,246,0.25)', active: 'rgba(59,130,246,0.25)' },
          'Aprobado': { border: 'rgba(16,185,129,0.3)', active: 'rgba(16,185,129,0.3)' },
          'Desaprobado': { border: 'rgba(239,68,68,0.3)', active: 'rgba(239,68,68,0.3)' },
        };
        const c = colors[b.dataset.value] || colors['Pendiente'];
        b.style.background = isActive ? c.active : 'rgba(255,255,255,0.03)';
        b.style.color = isActive ? 'var(--text-primary)' : 'var(--text-secondary)';
        b.style.boxShadow = isActive ? `0 0 0 2px ${c.border}` : 'none';
      });
    });
  });

  // Manejar cambio en estado de unidades (No aplica)
  overlay.querySelectorAll('.seg-uni-estado').forEach(sel => {
    sel.addEventListener('change', () => {
      const val = sel.value;
      const uniId = sel.dataset.uniId;
      const nota = overlay.querySelector(`.seg-uni-nota[data-uni-id="${uniId}"]`);
      const fecha = overlay.querySelector(`.seg-uni-fecha[data-uni-id="${uniId}"]`);
      
      if (val === 'No aplica') {
        sel.style.background = 'rgba(255,255,255,0.05)';
        sel.style.color = 'var(--text-muted)';
        sel.style.borderColor = 'var(--text-muted)';
        if (nota) { nota.value = ''; nota.disabled = true; }
        if (fecha) { fecha.value = ''; fecha.disabled = true; }
      } else {
        sel.style.background = ''; // reset to default
        sel.style.color = '';
        sel.style.borderColor = '';
        if (nota) nota.disabled = false;
        if (fecha) fecha.disabled = false;
      }
    });
  });

  overlay.querySelector('#modal-cancel').addEventListener('click', () => overlay.remove());

  overlay.querySelector('#modal-save').addEventListener('click', async () => {
    try {
      const selects = overlay.querySelectorAll('.seg-estado');
      for (const sel of selects) {
        const refField = sel.dataset.refField;
        const refId = sel.dataset.refId;
        const segId = sel.dataset.segId;
        const estado = sel.value;
        const notaInput = overlay.querySelector(`.seg-nota[data-ref-id="${refId}"]`);
        const fechaInput = overlay.querySelector(`.seg-fecha[data-ref-id="${refId}"]`);
        const nota = notaInput?.value ? parseFloat(notaInput.value) : null;
        const fecha_aprobacion = fechaInput?.value || null;

        const record = { estado, nota, fecha_aprobacion };

        if (segId) {
          // Actualizar existente
          await update('seguimiento_modulos', segId, record);
        } else {
          // Crear nuevo
          const newRecord = {
            inscripcion_id: inscripcionData.id,
            ...record,
          };
          if (refField === 'modulo_id') newRecord.modulo_id = refId;
          else newRecord.submodulo_id = refId;
          await create('seguimiento_modulos', newRecord);
        }
      }

      // Guardar unidades
      const uniSelects = overlay.querySelectorAll('.seg-uni-estado');
      for (const sel of uniSelects) {
        const uniId = sel.dataset.uniId;
        const segId = sel.dataset.segId;
        const estado = sel.value;
        const notaInput = overlay.querySelector(`.seg-uni-nota[data-uni-id="${uniId}"]`);
        const fechaInput = overlay.querySelector(`.seg-uni-fecha[data-uni-id="${uniId}"]`);

        const nota = notaInput?.value ? parseFloat(notaInput.value) : null;
        const fecha_aprobacion = fechaInput?.value || null;

        const record = { estado, nota, fecha_aprobacion };

        if (segId) {
          await update('seguimiento_unidades', segId, record);
        } else if (estado !== 'Pendiente' || nota !== null || fecha_aprobacion || estado === 'No aplica') {
          await create('seguimiento_unidades', {
            inscripcion_id: inscripcionData.id,
            unidad_id: uniId,
            ...record
          });
        }
      }

      showToast('Seguimiento guardado');
      overlay.remove();
      renderTrayectos();
    } catch (err) {
      showToast(err.message || 'Error al guardar', 'error');
    }
  });
}

function openCambiarEstadoModal(inscripcionData) {
  const est = inscripcionData.estudiante;
  const formHTML = `
    <p style="margin-bottom:12px;">Cambiar estado de <strong>${sanitize(est.nombre)} ${sanitize(est.apellido)}</strong></p>
    <div class="form-group">
      <select class="form-select" id="nuevo-estado">
        ${['En curso', 'Regular', 'Completo', 'Finalizado', 'Abandonado'].map(e =>
    `<option value="${e}" ${inscripcionData.estado === e ? 'selected' : ''}>${e}</option>`
  ).join('')}
      </select>
    </div>
  `;
  const footerHTML = `
    <button class="btn btn-secondary" id="modal-cancel">Cancelar</button>
    <button class="btn btn-primary" id="modal-save">Guardar</button>
  `;
  const overlay = createModal('Estado del Estudiante', formHTML, footerHTML);
  overlay.querySelector('#modal-cancel').addEventListener('click', () => overlay.remove());
  overlay.querySelector('#modal-save').addEventListener('click', async () => {
    const estado = document.getElementById('nuevo-estado').value;
    try {
      await update('inscripciones', inscripcionData.id, { estado });
      showToast('Estado actualizado');
      overlay.remove();
      renderTrayectos();
    } catch (err) { showToast(err.message || 'Error', 'error'); }
  });
}


// ============================================
// IMPORTAR ESTUDIANTES DESDE CSV
// ============================================
function openImportarCSVModal(trayectoId, trayectoNombre) {
  const formHTML = `
    <div style="margin-bottom:16px;padding:12px;background:rgba(139,92,246,0.08);border:1px solid rgba(139,92,246,0.2);border-radius:10px;">
      <p style="font-size:0.875rem;font-weight:600;margin-bottom:4px;">Formato del archivo CSV</p>
      <p style="font-size:0.8rem;color:var(--text-secondary);margin-bottom:8px;">
        El archivo debe tener una fila de encabezado con estas columnas (en cualquier orden):
      </p>
      <code style="font-size:0.75rem;color:var(--accent-purple-light);background:rgba(0,0,0,0.3);padding:6px 10px;border-radius:6px;display:block;margin-bottom:8px;">
        dni, nombre, apellido, email, anio_ingreso
      </code>
      <p style="font-size:0.75rem;color:var(--text-muted);">
        ✦ Solo <strong>DNI, nombre y apellido</strong> son obligatorios.<br/>
        ✦ Si el estudiante ya existe (por DNI), se inscribe al trayecto sin duplicar.<br/>
        ✦ Si ya estaba inscripto, se omite sin error.
      </p>
      <button id="btn-descargar-plantilla" class="btn btn-secondary" style="margin-top:8px;font-size:0.78rem;padding:6px 12px;">
        📄 Descargar plantilla CSV
      </button>
    </div>

    <div class="form-group">
      <label class="form-label">Seleccionar archivo CSV</label>
      <input type="file" id="csv-file-input" accept=".csv,text/csv" class="form-input" style="padding:8px;" />
    </div>

    <div id="csv-preview" style="display:none;margin-top:12px;">
      <div style="font-size:0.75rem;text-transform:uppercase;letter-spacing:0.5px;color:var(--text-muted);font-weight:600;margin-bottom:8px;">
        Vista previa — <span id="csv-row-count">0</span> estudiante(s) detectado(s)
      </div>
      <div id="csv-preview-table" style="max-height:200px;overflow-y:auto;border:1px solid var(--border-color);border-radius:8px;"></div>
    </div>

    <div id="csv-error-msg" style="display:none;margin-top:10px;padding:8px 12px;background:rgba(239,68,68,0.1);color:#ef4444;border-radius:8px;font-size:0.8rem;"></div>
  `;

  const footerHTML = `
    <button class="btn btn-secondary" id="modal-cancel">Cancelar</button>
    <button class="btn btn-primary" id="btn-ejecutar-import" disabled>📥 Importar estudiantes</button>
  `;

  const overlay = createModal(`Importar Estudiantes — ${sanitize(trayectoNombre)}`, formHTML, footerHTML, '580px');
  overlay.querySelector('#modal-cancel').addEventListener('click', () => overlay.remove());

  // Plantilla descargable
  overlay.querySelector('#btn-descargar-plantilla').addEventListener('click', () => {
    const csv = 'dni,nombre,apellido,email,anio_ingreso\n12345678,Juan,García,juan@email.com,2024\n87654321,María,López,,2023';
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'plantilla_estudiantes.csv';
    a.click();
  });

  // Parsear CSV al seleccionar archivo
  let parsedRows = [];
  overlay.querySelector('#csv-file-input').addEventListener('change', (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target.result;
      const errorEl = overlay.querySelector('#csv-error-msg');
      errorEl.style.display = 'none';

      try {
        parsedRows = parseCSV(text);
        if (parsedRows.length === 0) throw new Error('El archivo no contiene filas válidas.');

        // Validar columnas mínimas
        const first = parsedRows[0];
        if (!first.dni || !first.nombre || !first.apellido) {
          throw new Error("Faltan columnas requeridas: 'dni', 'nombre', 'apellido'.");
        }

        overlay.querySelector('#csv-row-count').textContent = parsedRows.length;
        overlay.querySelector('#csv-preview-table').innerHTML = `
          <table style="width:100%;font-size:0.78rem;border-collapse:collapse;">
            <thead>
              <tr style="background:var(--bg-secondary);">
                <th style="padding:6px 8px;text-align:left;font-weight:600;color:var(--text-muted);">DNI</th>
                <th style="padding:6px 8px;text-align:left;font-weight:600;color:var(--text-muted);">Nombre</th>
                <th style="padding:6px 8px;text-align:left;font-weight:600;color:var(--text-muted);">Apellido</th>
                <th style="padding:6px 8px;text-align:left;font-weight:600;color:var(--text-muted);">Email</th>
                <th style="padding:6px 8px;text-align:left;font-weight:600;color:var(--text-muted);">Año</th>
              </tr>
            </thead>
            <tbody>
              ${parsedRows.slice(0, 10).map((r, i) => `
                <tr style="border-top:1px solid var(--border-color);background:${i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.02)'};">
                  <td style="padding:5px 8px;">${sanitize(r.dni)}</td>
                  <td style="padding:5px 8px;">${sanitize(r.nombre)}</td>
                  <td style="padding:5px 8px;">${sanitize(r.apellido)}</td>
                  <td style="padding:5px 8px;color:var(--text-muted);">${sanitize(r.email || '-')}</td>
                  <td style="padding:5px 8px;color:var(--text-muted);">${sanitize(r.anio_ingreso || '-')}</td>
                </tr>
              `).join('')}
              ${parsedRows.length > 10 ? `<tr><td colspan="5" style="padding:6px 8px;color:var(--text-muted);text-align:center;">... y ${parsedRows.length - 10} más</td></tr>` : ''}
            </tbody>
          </table>
        `;
        overlay.querySelector('#csv-preview').style.display = 'block';
        overlay.querySelector('#btn-ejecutar-import').disabled = false;

      } catch (err) {
        parsedRows = [];
        overlay.querySelector('#csv-preview').style.display = 'none';
        overlay.querySelector('#btn-ejecutar-import').disabled = true;
        errorEl.textContent = '⚠ ' + err.message;
        errorEl.style.display = 'block';
      }
    };
    reader.readAsText(file, 'UTF-8');
  });

  // Ejecutar importación
  overlay.querySelector('#btn-ejecutar-import').addEventListener('click', async () => {
    if (parsedRows.length === 0) return;
    const btn = overlay.querySelector('#btn-ejecutar-import');
    btn.disabled = true;
    btn.textContent = 'Importando...';

    let creados = 0, inscriptos = 0, yaExistian = 0, yaInscriptos = 0, errores = 0;

    // Cargar datos existentes
    const [estudiantesExistentes, inscripcionesExistentes] = await Promise.all([
      fetchAll('estudiantes'),
      fetchAll('inscripciones'),
    ]);

    for (const row of parsedRows) {
      try {
        const dniLimpio = String(row.dni).trim();
        let estudiante = estudiantesExistentes.find(e => String(e.dni) === dniLimpio);

        if (!estudiante) {
          // Crear nuevo estudiante
          estudiante = await create('estudiantes', {
            dni: dniLimpio,
            nombre: row.nombre.trim(),
            apellido: row.apellido.trim(),
            email: row.email?.trim() || null,
            anio_ingreso: row.anio_ingreso ? parseInt(row.anio_ingreso) : new Date().getFullYear(),
          });
          creados++;
        } else {
          yaExistian++;
        }

        // Verificar si ya está inscripto en este trayecto
        const yaInscripto = inscripcionesExistentes.some(
          i => i.estudiante_id === estudiante.id && i.trayecto_id === trayectoId
        );

        if (!yaInscripto) {
          await create('inscripciones', {
            estudiante_id: estudiante.id,
            trayecto_id: trayectoId,
            estado: 'Activo',
          });
          inscriptos++;
        } else {
          yaInscriptos++;
        }
      } catch (err) {
        console.error('Error al importar fila:', row, err);
        errores++;
      }
    }

    // Mostrar resultado
    showToast(
      `✅ Importación completa: ${creados} creados, ${inscriptos} inscriptos` +
      (yaExistian > 0 ? `, ${yaExistian} ya existían` : '') +
      (yaInscriptos > 0 ? `, ${yaInscriptos} ya inscriptos` : '') +
      (errores > 0 ? `, ⚠ ${errores} errores` : ''),
      errores > 0 ? 'warning' : 'success'
    );
    overlay.remove();
    renderTrayectos();
  });
}

// Helper: parsear CSV en array de objetos usando la primera fila como keys
function parseCSV(text) {
  const lines = text.split(/\r?\n/).filter(l => l.trim() !== '');
  if (lines.length < 2) return [];

  // Detectar separador (coma o punto y coma)
  const sep = lines[0].includes(';') ? ';' : ',';
  const headers = lines[0].split(sep).map(h => h.trim().toLowerCase().replace(/\s+/g, '_').replace(/[^a-z_]/g, ''));

  return lines.slice(1).map(line => {
    const values = line.split(sep).map(v => v.trim().replace(/^["']|["']$/g, ''));
    const obj = {};
    headers.forEach((h, i) => { if (h) obj[h] = values[i] || ''; });
    return obj;
  }).filter(r => r.dni || r.nombre); // Descartar filas completamente vacías
}

// ============================================
// Gestión de Documentos
// ============================================
async function openDocsModal(trayecto) {
  const title = `Documentación: ${trayecto.nombre}`;

  const contentHTML = `
        <div class="docs-container" style="min-height: 300px;">
            <div style="background: rgba(139, 92, 246, 0.05); border: 1px dashed var(--border-color); border-radius: 12px; padding: 20px; text-align: center; margin-bottom: 20px;">
                <input type="file" id="doc-upload-input" style="display: none;" />
                <label for="doc-upload-input" class="btn btn-secondary" style="cursor: pointer; display: inline-flex; align-items: center; gap: 8px;">
                    ${icons.plus} Subir Documento
                </label>
                <p style="font-size: 0.75rem; color: var(--text-muted); margin-top: 10px;">
                    PDF, DOCX, JPG o PNG. Máximo 5MB per file.
                </p>
                <div id="upload-status" style="font-size: 0.75rem; margin-top: 8px; font-weight: 500;"></div>
            </div>
            
            <div id="docs-list" style="display: flex; flex-direction: column; gap: 10px;">
                <div style="text-align: center; padding: 20px; color: var(--text-muted);">Cargando documentos...</div>
            </div>
        </div>
    `;

  const overlay = createModal(title, contentHTML, '', '560px');

  const loadDocs = async () => {
    const listContainer = document.getElementById('docs-list');
    try {
      const { data, error } = await getSupabase()
        .from('documentos_trayectos')
        .select('*')
        .eq('trayecto_id', trayecto.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data.length === 0) {
        listContainer.innerHTML = `
                    <div style="text-align: center; padding: 40px; color: var(--text-muted);">
                        <div style="font-size: 2rem; margin-bottom: 10px;">📄</div>
                        <p>No hay documentos guardados para este trayecto.</p>
                    </div>
                `;
        return;
      }

      listContainer.innerHTML = data.map(doc => `
                <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px 16px; border: 1px solid var(--border-color); border-radius: 10px; background: rgba(255,255,255,0.02);">
                    <div style="display: flex; align-items: center; gap: 12px; overflow: hidden;">
                        <span style="color: var(--accent-purple-light);">${icons.document}</span>
                        <div style="overflow: hidden;">
                            <div style="font-size: 0.875rem; font-weight: 500; color: var(--text-primary); text-overflow: ellipsis; white-space: nowrap; overflow: hidden;">
                                ${sanitize(doc.nombre)}
                            </div>
                            <div style="font-size: 0.7rem; color: var(--text-muted);">Subido el ${formatDate(doc.created_at)}</div>
                        </div>
                    </div>
                    <div style="display: flex; gap: 8px;">
                        <a href="${doc.url}" target="_blank" class="card-action-btn" title="Descargar" style="padding: 6px; color: var(--accent-blue);">
                            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"></path></svg>
                        </a>
                        <button class="card-action-btn delete-doc-btn" data-id="${doc.id}" data-path="${doc.url.split('documentos-trayectos/')[1]}" style="padding: 6px; color: var(--accent-red);" title="Eliminar doc">
                            ${icons.trash}
                        </button>
                    </div>
                </div>
            `).join('');

      listContainer.querySelectorAll('.delete-doc-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
          const docId = btn.dataset.id;
          const filePath = btn.dataset.path;

          if (confirm('¿Eliminar este documento permanentemente?')) {
            try {
              // 1. Eliminar de Storage
              const { error: storageError } = await getSupabase()
                .storage.from('documentos-trayectos')
                .remove([filePath]);

              // 2. Eliminar de Database
              const { error: dbError } = await getSupabase()
                .from('documentos_trayectos')
                .delete()
                .eq('id', docId);

              if (dbError) throw dbError;

              showToast('Documento eliminado');
              loadDocs();
            } catch (err) {
              showToast('Error al eliminar: ' + err.message, 'error');
            }
          }
        });
      });

    } catch (err) {
      listContainer.innerHTML = `<div style="color: var(--accent-red); text-align: center; padding: 20px;">Error: ${err.message}</div>`;
    }
  };

  // Subida de archivos
  const setupUpload = () => {
    const input = document.getElementById('doc-upload-input');
    const status = document.getElementById('upload-status');

    input.addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      if (file.size > 5 * 1024 * 1024) {
        showToast('El archivo es muy pesado (máximo 5MB)', 'error');
        return;
      }

      status.textContent = 'Subiendo...';
      status.style.color = 'var(--text-secondary)';

      try {
        const fileExt = file.name.split('.').pop();
        const fileName = `${trayecto.id}/${Date.now()}.${fileExt}`;

        // 1. Subir a Supabase Storage
        const { data: storageData, error: storageError } = await getSupabase()
          .storage.from('documentos-trayectos')
          .upload(fileName, file);

        if (storageError) throw storageError;

        // 2. Obtener URL publica
        const { data: { publicUrl } } = getSupabase()
          .storage.from('documentos-trayectos')
          .getPublicUrl(fileName);

        // 3. Guardar referencia en DB
        const { error: dbError } = await getSupabase()
          .from('documentos_trayectos')
          .insert({
            trayecto_id: trayecto.id,
            nombre: file.name,
            url: publicUrl,
            tipo: 'general'
          });

        if (dbError) throw dbError;

        showToast('Archivo subido con éxito');
        status.textContent = '';
        loadDocs();
      } catch (err) {
        console.error(err);
        status.textContent = 'Error: ' + err.message;
        status.style.color = 'var(--accent-red)';
        showToast('Error al subir: ' + err.message, 'error');
      }
    });
  };

  loadDocs();
  setupUpload();
}

// ============================================
// Gestión de Actas Académicas (Automática)
// ============================================
async function openActasGestionModal(trayecto) {
  const tmcLinks = await fetchAll('trayecto_modulo_comun', { eq: { trayecto_id: trayecto.id } });
  const submodulosComunes = await Promise.all(tmcLinks.map(l => fetchAll('submodulos', { eq: { id: l.submodulo_id } }).then(r => r[0])));
  
  const title = `Actas Académicas: ${sanitize(trayecto.nombre)}`;
  const contentHTML = `
    <div style="display: flex; flex-direction: column; gap: 20px;">
      <div style="background: rgba(139, 92, 246, 0.05); border: 1px dashed var(--border-color); border-radius: 12px; padding: 20px;">
        <p style="font-size: 0.875rem; font-weight: 600; margin-bottom: 12px;">Subir Nueva Acta / Certificación</p>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 12px;">
          <div class="form-group">
            <label class="form-label">Nombre del Acta</label>
            <input type="text" id="acta-new-nombre" class="form-input" placeholder="Ej: Acta Final Módulo X" />
          </div>
          <div class="form-group">
            <label class="form-label">Tipo</label>
            <select id="acta-new-tipo" class="form-select">
              <option value="trayecto">General del Trayecto</option>
              <option value="modulo">Específica de Módulo</option>
            </select>
          </div>
        </div>
        <div class="form-group" id="group-submodulo" style="display: none; margin-bottom: 12px;">
          <label class="form-label">Módulo Asociado</label>
          <select id="acta-new-submodulo" class="form-select">
            <option value="">Seleccionar módulo...</option>
            ${submodulosComunes.filter(Boolean).map(s => `<option value="${s.id}">${sanitize(s.nombre)}</option>`).join('')}
          </select>
        </div>
        <div class="form-group" style="margin-bottom: 12px;">
          <label class="form-label">Descripción (Opcional)</label>
          <textarea id="acta-new-desc" class="form-input" style="min-height: 60px; resize: vertical;" placeholder="Notas sobre esta acta..."></textarea>
        </div>
        <div class="form-group">
          <label class="form-label">Archivo (PDF, Imagen)</label>
          <input type="file" id="acta-upload-input" class="form-input" accept=".pdf,image/*" />
        </div>
        <button class="btn btn-primary" id="btn-save-acta" style="width: 100%; margin-top: 12px;">
          ${icons.plus} Guardar y Vincular a Alumnos
        </button>
        <div id="acta-upload-status" style="font-size: 0.75rem; margin-top: 8px; text-align: center;"></div>
      </div>

      <div id="actas-list-container">
        <p style="font-size: 0.875rem; font-weight: 600; margin-bottom: 12px;">Actas Cargadas</p>
        <div id="actas-list" style="display: flex; flex-direction: column; gap: 10px;">
           <div style="text-align: center; padding: 20px; color: var(--text-muted);">Cargando...</div>
        </div>
      </div>
    </div>
  `;

  const overlay = createModal(title, contentHTML, '', '600px');
  const typeSelect = overlay.querySelector('#acta-new-tipo');
  const submoduloGroup = overlay.querySelector('#group-submodulo');

  typeSelect.addEventListener('change', () => {
    submoduloGroup.style.display = typeSelect.value === 'modulo' ? 'block' : 'none';
  });

  const loadActas = async () => {
    const list = overlay.querySelector('#actas-list');
    try {
      const { data, error } = await getSupabase()
        .from('actas')
        .select('*')
        .eq('grupo_id', trayecto.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data.length === 0) {
        list.innerHTML = `<div style="text-align:center; padding:20px; color:var(--text-muted);">No hay actas cargadas.</div>`;
        return;
      }

      list.innerHTML = data.map(acta => `
        <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px 14px; background: rgba(255,255,255,0.02); border: 1px solid var(--border-color); border-radius: 8px;">
          <div>
            <div style="font-size: 0.875rem; font-weight: 500;">${sanitize(acta.nombre)}</div>
            <div style="font-size: 0.7rem; color: var(--text-muted);">
              ${acta.tipo === 'trayecto' ? 'Trayecto' : 'Módulo'} · ${formatDate(acta.fecha)}
            </div>
          </div>
          <div style="display: flex; gap: 6px;">
            <a href="${acta.archivo_url}" target="_blank" class="card-action-btn" title="Ver">${icons.arrowUpRight}</a>
            <button class="card-action-btn delete delete-acta-btn" data-id="${acta.id}" data-url="${acta.archivo_url}" title="Eliminar">${icons.trash}</button>
          </div>
        </div>
      `).join('');

      list.querySelectorAll('.delete-acta-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
          if (!confirm('¿Eliminar esta acta? Los estudiantes dejarán de verla.')) return;
          try {
            const actaId = btn.dataset.id;
            const url = btn.dataset.url;
            const storagePath = url.split('documentos-trayectos/')[1];

            // 1. Eliminar de Storage
            if (storagePath) {
              await getSupabase().storage.from('documentos-trayectos').remove([storagePath]);
            }
            // 2. Eliminar de DB
            const { error } = await getSupabase().from('actas').delete().eq('id', actaId);
            if (error) throw error;

            showToast('Acta eliminada');
            loadActas();
          } catch (err) { showToast(err.message, 'error'); }
        });
      });
    } catch (err) { list.innerHTML = `<div style="color:var(--accent-red);">${err.message}</div>`; }
  };

  overlay.querySelector('#btn-save-acta').addEventListener('click', async () => {
    const nombre = overlay.querySelector('#acta-new-nombre').value.trim();
    const descripcion = overlay.querySelector('#acta-new-desc').value.trim();
    const tipo = overlay.querySelector('#acta-new-tipo').value;
    const submodulo_id = overlay.querySelector('#acta-new-submodulo').value || null;
    const fileInput = overlay.querySelector('#acta-upload-input');
    const status = overlay.querySelector('#acta-upload-status');

    if (!nombre || fileInput.files.length === 0) {
      showToast('Completá el nombre y seleccioná un archivo', 'error');
      return;
    }

    if (tipo === 'modulo' && !submodulo_id) {
      showToast('Seleccioná un módulo asociado', 'error');
      return;
    }

    try {
      status.textContent = 'Subiendo...';
      const file = fileInput.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `actas/${trayecto.id}/${Date.now()}.${fileExt}`;

      const { data: storageData, error: storageError } = await getSupabase()
        .storage.from('documentos-trayectos')
        .upload(fileName, file);

      if (storageError) throw storageError;

      const { data: { publicUrl } } = getSupabase().storage.from('documentos-trayectos').getPublicUrl(fileName);

      const { error: dbError } = await getSupabase().from('actas').insert({
        nombre,
        descripcion,
        tipo,
        archivo_url: publicUrl,
        grupo_id: trayecto.id,
        submodulo_id: submodulo_id,
        fecha: new Date().toISOString().split('T')[0]
      });

      if (dbError) throw dbError;

      showToast('Acta vinculada correctamente a todos los estudiantes');
      overlay.querySelector('#acta-new-nombre').value = '';
      overlay.querySelector('#acta-new-desc').value = '';
      fileInput.value = '';
      status.textContent = '';
      loadActas();

    } catch (err) {
      status.textContent = 'Error: ' + err.message;
      showToast(err.message, 'error');
    }
  });

  loadActas();
}

export default { renderTrayectos };
