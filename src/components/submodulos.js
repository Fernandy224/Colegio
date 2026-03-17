// ============================================
// Gestión de Módulos Comunes (CRUD) + Unidades
// ============================================
import { getContentArea, getPanelRight } from './layout.js';
import { icons, showToast, createModal, confirmDialog, sanitize } from '../utils/helpers.js';
import { fetchAll, create, update, remove } from '../utils/data.js';
import { getCurrentUser } from './auth.js';
import { getCurrentYear } from '../utils/state.js';

let expandedCard = null; // ID del módulo común expandido para ver unidades

export async function renderSubmodulos() {
  const content = getContentArea();
  const panel = getPanelRight();

  const submodulos = await fetchAll('submodulos');
  const modulos = await fetchAll('modulos');
  const unidades = await fetchAll('unidades');
  const profesores = await fetchAll('profesores');
  const authUser = getCurrentUser();
  const isAdmin = authUser?.role === 'administrador';
  const myProfesor = profesores.find(p => p.auth_id === authUser?.id);

  content.innerHTML = `
    <div class="section-header">
      <h1 class="section-title">Gestionar Módulos Comunes</h1>
      <div class="section-actions">
        <button class="btn btn-add" id="btn-add-submodulo">
          ${icons.plus} Nuevo Módulo Común
        </button>
      </div>
    </div>

    ${submodulos.length === 0 ? `
      <div class="empty-state">
        ${icons.submodulos}
        <h3 class="empty-state-title">No hay módulos comunes</h3>
        <p class="empty-state-text">Creá un módulo común y asocialo a un módulo específico existente.</p>
      </div>
    ` : `
      <div class="cards-grid" style="grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 12px;">
        ${submodulos.map(sub => {
    const mod = modulos.find(m => m.id === sub.modulo_id);
    const subUnidades = unidades
      .filter(u => u.submodulo_id === sub.id)
      .sort((a, b) => (a.orden || 0) - (b.orden || 0));

    return `
            <div class="card" data-id="${sub.id}" style="align-items: stretch; cursor: default; padding: 12px 14px;">
              <div class="card-actions">
                ${(isAdmin || sub.profesor_id === myProfesor?.id) ? `
                  <button class="card-action-btn edit-btn" data-id="${sub.id}" title="Editar">${icons.edit}</button>
                  <button class="card-action-btn delete card-action-btn-del" data-id="${sub.id}" title="Eliminar">${icons.trash}</button>
                ` : `<span style="font-size:0.6rem;padding:3px 7px;border-radius:999px;background:rgba(139,92,246,0.12);color:var(--text-muted);white-space:nowrap;">Solo lectura</span>`}
              </div>
              <div style="display: flex; align-items: center; gap: 8px;">
                ${(() => {
        const prof = profesores.find(p => p.id === sub.profesor_id);
        if (prof && prof.foto_url) {
          return `<div class="card-avatar" style="width: 36px; height: 36px; flex-shrink: 0; background-image: url('${prof.foto_url}'); background-size: cover; background-position: center; border-radius: 50%;"></div>`;
        }
        return `<div class="card-avatar submodulo" style="width: 36px; height: 36px; font-size: 0.85rem; flex-shrink: 0;">
                            ${sanitize(sub.nombre?.charAt(0) || 'M')}
                          </div>`;
      })()}
                <div style="min-width: 0; flex: 1;">
                  <div class="card-name" style="text-align: left; font-size: 0.85rem;">${sanitize(sub.nombre)}</div>
                  <div class="card-subtitle" style="text-align: left; margin-top: 1px; font-size: 0.65rem;">Mód. Específico: ${mod ? sanitize(mod.nombre) : 'Sin módulo'}</div>
                  ${(() => { const prof = profesores.find(p => p.id === sub.profesor_id); return prof ? `<div style="font-size:0.7rem;color:var(--accent-purple-light);margin-top:2px;">Prof. a cargo: ${sanitize(prof.nombre)} ${sanitize(prof.apellido || '')}</div>` : '<div style="font-size:0.7rem;color:var(--text-muted);margin-top:2px;">Sin profesor asignado</div>'; })()}
                  ${sub.descripcion ? `<div style="font-size:0.7rem;color:var(--text-secondary);margin-top:4px; max-width: 100%; white-space: normal; overflow-wrap: anywhere;">${sanitize(sub.descripcion)}</div>` : ''}
                </div>
              </div>

              <!-- Unidades -->
              <div style="width: 100%; margin-top: 6px; padding-top: 6px; border-top: 1px solid var(--border-color);">
                <div style="display: flex; flex-direction: column; gap: 4px; margin-bottom: 4px;">
                  <span style="font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.5px; color: var(--text-muted); font-weight: 600;">
                    Unidades (${subUnidades.length})
                  </span>
                  <div style="display:flex;gap:4px;flex-wrap:wrap;">
                    ${(isAdmin || sub.profesor_id === myProfesor?.id) ? `
                    <button class="btn btn-secondary ver-asistencia-btn" data-subid="${sub.id}" data-subnombre="${sanitize(sub.nombre)}" style="padding: 4px 10px; font-size: 0.72rem; border-radius: 6px;">
                      📋 Asistencia
                    </button>
                    <button class="btn btn-secondary evaluar-submodulo-btn" data-subid="${sub.id}" data-subnombre="${sanitize(sub.nombre)}" style="padding: 4px 10px; font-size: 0.72rem; border-radius: 6px;">
                      📝 Evaluar
                    </button>
                    <button class="btn btn-secondary cronograma-submodulo-btn" data-subid="${sub.id}" data-subnombre="${sanitize(sub.nombre)}" style="padding: 4px 10px; font-size: 0.72rem; border-radius: 6px;">
                      🗓️ Cronograma
                    </button>
                    <button class="btn btn-secondary acta-submodulo-btn" data-subid="${sub.id}" data-subnombre="${sanitize(sub.nombre)}" style="padding: 4px 10px; font-size: 0.72rem; border-radius: 6px;">
                      📄 Acta
                    </button>
                    <button class="btn btn-secondary informe-grupal-btn" data-subid="${sub.id}" data-subnombre="${sanitize(sub.nombre)}" style="padding: 4px 10px; font-size: 0.72rem; border-radius: 6px;">
                      📊 Informe
                    </button>
                    ` : ''}
                    ${(isAdmin || sub.profesor_id === myProfesor?.id) ? `
                    <button class="btn btn-secondary add-unidad-btn" data-subid="${sub.id}" style="padding: 4px 10px; font-size: 0.75rem; border-radius: 6px;">
                      ${icons.plus} Agregar
                    </button>
                    ` : ''}
                  </div>
                </div>
                ${subUnidades.length === 0 ? `
                  <p style="font-size: 0.8rem; color: var(--text-muted); text-align: center; padding: 8px 0;">Sin unidades</p>
                ` : `
                  <div class="unidades-list" data-subid="${sub.id}">
                    ${subUnidades.map((u, idx) => `
                      <div class="unidad-item" data-uid="${u.id}">
                        <span class="unidad-orden">${u.orden || (idx + 1)}</span>
                        <span class="unidad-nombre">${sanitize(u.nombre)}</span>
                        ${(isAdmin || sub.profesor_id === myProfesor?.id) ? `
                        <div class="unidad-actions">
                          <button class="unidad-action-btn edit-unidad-btn" data-uid="${u.id}" data-subid="${sub.id}" title="Editar">${icons.edit}</button>
                          <button class="unidad-action-btn delete del-unidad-btn" data-uid="${u.id}" title="Eliminar">${icons.trash}</button>
                        </div>
                        ` : ''}
                      </div>
                    `).join('')}
                  </div>
                `}
              </div>
            </div>
          `;
  }).join('')}
      </div>
    `}

    <style>
      .unidad-item {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 6px 8px;
        border-radius: 8px;
        background: rgba(255, 255, 255, 0.03);
        border: 1px solid var(--border-color);
        margin-bottom: 4px;
        transition: all 0.2s ease;
      }
      .unidad-item:hover {
        background: rgba(139, 92, 246, 0.06);
        border-color: var(--border-color-light);
      }
      .unidad-orden {
        width: 24px;
        height: 24px;
        border-radius: 6px;
        background: var(--gradient-purple);
        color: white;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 0.7rem;
        font-weight: 700;
        flex-shrink: 0;
      }
      .unidad-nombre {
        flex: 1;
        font-size: 0.8125rem;
        color: var(--text-primary);
      }
      .unidad-actions {
        display: flex;
        gap: 4px;
        opacity: 0;
        transition: opacity 0.2s;
      }
      .unidad-item:hover .unidad-actions {
        opacity: 1;
      }
      .unidad-action-btn {
        width: 24px;
        height: 24px;
        border-radius: 4px;
        border: 1px solid var(--border-color);
        background: var(--bg-secondary);
        color: var(--text-muted);
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: all 0.15s;
        padding: 0;
      }
      .unidad-action-btn svg {
        width: 12px;
        height: 12px;
      }
      .unidad-action-btn:hover {
        border-color: var(--accent-purple);
        color: var(--accent-purple-light);
      }
      .unidad-action-btn.delete:hover {
        border-color: var(--accent-red);
        color: var(--accent-red);
        background: rgba(239, 68, 68, 0.1);
      }
    </style>
  `;

  // Panel
  const totalUnidades = unidades.length;
  panel.innerHTML = `
    <div class="widget">
      <div class="widget-header"><span class="widget-title">Módulos Comunes</span></div>
      <div class="widget-stats">
        <div class="widget-stat">
          <div class="widget-stat-value">${submodulos.length}</div>
          <div class="widget-stat-label">Módulos</div>
        </div>
        <div class="widget-stat">
          <div class="widget-stat-value">${totalUnidades}</div>
          <div class="widget-stat-label">Unidades</div>
        </div>
      </div>
    </div>
    <div class="widget widget-gradient">
      <div class="widget-header"><span class="widget-title">📖 Unidades</span></div>
      <p style="font-size: 0.8125rem; color: var(--text-secondary); line-height: 1.5;">
        Cada módulo común puede contener múltiples unidades (Unidad 1, Unidad 2, etc.). Usá el botón "Agregar" en cada tarjeta.
      </p>
    </div>
  `;

  // === Eventos ===

  document.getElementById('btn-add-submodulo')?.addEventListener('click', () => openSubmoduloModal(null, modulos, profesores));

  content.querySelectorAll('.edit-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const sub = submodulos.find(s => s.id === btn.dataset.id);
      if (sub) openSubmoduloModal(sub, modulos, profesores);
    });
  });

  content.querySelectorAll('.card-action-btn-del').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const sub = submodulos.find(s => s.id === btn.dataset.id);
      if (sub) {
        confirmDialog(`¿Eliminar el módulo común <strong>${sanitize(sub.nombre)}</strong>? Esto también eliminará sus unidades.`, async () => {
          const subUnidades = unidades.filter(u => u.submodulo_id === sub.id);
          for (const u of subUnidades) {
            await remove('unidades', u.id);
          }
          await remove('submodulos', sub.id);
          showToast('Módulo común eliminado');
          renderSubmodulos();
        });
      }
    });
  });

  content.querySelectorAll('.ver-asistencia-btn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      const subId = btn.dataset.subid;
      const subNombre = btn.dataset.subnombre;
      await openAsistenciaModuloModal(subId, subNombre);
    });
  });

  content.querySelectorAll('.evaluar-submodulo-btn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      const subId = btn.dataset.subid;
      const subNombre = btn.dataset.subnombre;
      await openEvaluacionModuloModal(subId, subNombre);
    });
  });

  content.querySelectorAll('.acta-submodulo-btn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      const subId = btn.dataset.subid;
      const subNombre = btn.dataset.subnombre;
      const { openGenerarActaModal } = await import('./actas.js');
      await openGenerarActaModal(subId, subNombre);
    });
  });

  content.querySelectorAll('.cronograma-submodulo-btn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      const subId = btn.dataset.subid;
      const subNombre = btn.dataset.subnombre;
      await openCronogramaModuloModal(subId, subNombre);
    });
  });

  content.querySelectorAll('.informe-grupal-btn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      const subId = btn.dataset.subid;
      const subNombre = btn.dataset.subnombre;
      const { openInformeGrupalModal } = await import('./informes_grupales.js');
      await openInformeGrupalModal(subId, subNombre);
    });
  });

  content.querySelectorAll('.add-unidad-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const subId = btn.dataset.subid;
      const subUnidades = unidades.filter(u => u.submodulo_id === subId);
      const nextOrden = subUnidades.length + 1;
      openUnidadModal(null, subId, nextOrden);
    });
  });

  content.querySelectorAll('.edit-unidad-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const unidad = unidades.find(u => u.id === btn.dataset.uid);
      if (unidad) openUnidadModal(unidad, btn.dataset.subid);
    });
  });

  content.querySelectorAll('.del-unidad-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const unidad = unidades.find(u => u.id === btn.dataset.uid);
      if (unidad) {
        confirmDialog(`¿Eliminar la unidad <strong>${sanitize(unidad.nombre)}</strong>?`, async () => {
          await remove('unidades', unidad.id);
          showToast('Unidad eliminada');
          renderSubmodulos();
        });
      }
    });
  });
}

function openSubmoduloModal(submodulo, modulos, profesores = []) {
  const isEdit = !!submodulo;
  const authUser = getCurrentUser();
  const isAdmin = authUser?.role === 'administrador';
  const myProfesor = profesores.find(p => p.auth_id === authUser?.id);
  const selectedProfId = isEdit ? (submodulo.profesor_id || '') : (myProfesor?.id || '');

  const formHTML = `
    <div class="form-group">
      <label class="form-label">Nombre del Módulo Común</label>
      <input type="text" class="form-input" id="sub-nombre" value="${isEdit ? sanitize(submodulo.nombre) : ''}" required placeholder="Ej: Comunicación" />
    </div>
    <div class="form-group">
      <label class="form-label">Profesor a Cargo</label>
      ${(!isAdmin && myProfesor) ? `
        <input type="text" class="form-input" value="${sanitize(myProfesor.nombre)} ${sanitize(myProfesor.apellido || '')}" disabled style="opacity:0.7;cursor:not-allowed;" />
        <input type="hidden" id="sub-profesor" value="${myProfesor.id}" />
        <p style="font-size:0.72rem;color:var(--text-muted);margin-top:4px;">Asignado automáticamente a tu perfil docente.</p>
      ` : `
        <select class="form-select" id="sub-profesor">
          <option value="">Sin profesor asignado</option>
          ${profesores.map(p => `
            <option value="${p.id}" ${selectedProfId === p.id ? 'selected' : ''}>
              ${sanitize(p.nombre)} ${sanitize(p.apellido || '')}
              ${p.auth_id ? ' ✔' : ' (sin cuenta)'}
            </option>
          `).join('')}
        </select>
        <p style="font-size:0.75rem;color:var(--text-muted);margin-top:4px;">
          Solo este profesor podrá cargar y modificar notas de este módulo en todos los trayectos.
        </p>
      `}
    </div>
    <div class="form-group">
      <label class="form-label">Módulo Específico Asociado <span style="color:var(--text-muted);font-size:0.75rem;">(opcional)</span></label>
      <select class="form-select" id="sub-modulo">
        <option value="">Seleccionar módulo específico...</option>
        ${modulos.map(m => `
          <option value="${m.id}" ${isEdit && submodulo.modulo_id === m.id ? 'selected' : ''}>${sanitize(m.nombre)}</option>
        `).join('')}
      </select>
    </div>
    <div class="form-group">
      <label class="form-label">Descripción</label>
      <textarea class="form-textarea" id="sub-desc" placeholder="Descripción...">${isEdit ? sanitize(submodulo.descripcion || '') : ''}</textarea>
    </div>
  `;

  const footerHTML = `
    <button class="btn btn-secondary" id="modal-cancel">Cancelar</button>
    <button class="btn btn-primary" id="modal-save">${isEdit ? 'Guardar' : 'Crear Módulo Común'}</button>
  `;

  const overlay = createModal(isEdit ? 'Editar Módulo Común' : 'Nuevo Módulo Común', formHTML, footerHTML);

  overlay.querySelector('#modal-cancel').addEventListener('click', () => overlay.remove());
  overlay.querySelector('#modal-save').addEventListener('click', async () => {
    const nombre = document.getElementById('sub-nombre').value.trim();
    const modulo_id = document.getElementById('sub-modulo').value || null;
    const profesor_id = document.getElementById('sub-profesor').value || null;
    const descripcion = document.getElementById('sub-desc').value.trim();

    if (!nombre) { showToast('Ingresá el nombre del módulo común', 'error'); return; }

    try {
      if (isEdit) {
        await update('submodulos', submodulo.id, { nombre, modulo_id, profesor_id, descripcion });
        showToast('Módulo común actualizado');
      } else {
        const authUser = getCurrentUser();
        await create('submodulos', { nombre, modulo_id, profesor_id, descripcion, created_by: authUser?.id || null });
        showToast('Módulo común creado');
      }
      overlay.remove();
      renderSubmodulos();
    } catch (err) { showToast(err.message || 'Error al guardar. Verificá tu sesión.', 'error'); }
  });
}

// Modal para crear/editar unidad
function openUnidadModal(unidad, submoduloId, defaultOrden = 1) {
  const isEdit = !!unidad;
  const formHTML = `
    <div class="form-row">
      <div class="form-group">
        <label class="form-label">Número de Unidad</label>
        <input type="number" class="form-input" id="unidad-orden" value="${isEdit ? (unidad.orden || 1) : defaultOrden}" required min="1" />
      </div>
      <div class="form-group">
        <label class="form-label">Nombre de la Unidad</label>
        <input type="text" class="form-input" id="unidad-nombre" value="${isEdit ? sanitize(unidad.nombre) : `Unidad ${defaultOrden}`}" required placeholder="Ej: Unidad 1 - Introducción" />
      </div>
    </div>
  `;

  const footerHTML = `
    <button class="btn btn-secondary" id="modal-cancel">Cancelar</button>
    <button class="btn btn-primary" id="modal-save">${isEdit ? 'Guardar' : 'Agregar Unidad'}</button>
  `;

  const overlay = createModal(isEdit ? 'Editar Unidad' : 'Nueva Unidad', formHTML, footerHTML);

  overlay.querySelector('#modal-cancel').addEventListener('click', () => overlay.remove());
  overlay.querySelector('#modal-save').addEventListener('click', async () => {
    const nombre = document.getElementById('unidad-nombre').value.trim();
    const orden = parseInt(document.getElementById('unidad-orden').value) || 1;

    if (!nombre) { showToast('Ingresá el nombre de la unidad', 'error'); return; }

    try {
      if (isEdit) {
        await update('unidades', unidad.id, { nombre, orden });
        showToast('Unidad actualizada');
      } else {
        await create('unidades', { nombre, orden, submodulo_id: submoduloId });
        showToast('Unidad agregada');
      }
      overlay.remove();
      renderSubmodulos();
    } catch (err) { showToast(err.message || 'Error', 'error'); }
  });
}

// ============================================
// MODAL: PLANILLA DE ASISTENCIA MÓDULO COMÚN
// ============================================
async function openAsistenciaModuloModal(submoduloId, submoduloNombre) {
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = `
    <div class="modal" style="max-width:1000px;width:95vw;">
      <div class="modal-header">
        <h3 class="modal-title">📋 Asistencia — ${submoduloNombre}</h3>
        <button class="modal-close" id="modal-close-btn">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
      <div class="modal-body" id="asistencia-modal-body">
        <div style="padding:40px;text-align:center;color:var(--text-muted);">Cargando estudiantes...</div>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);

  overlay.querySelector('#modal-close-btn').addEventListener('click', () => overlay.remove());
  overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove(); });

  try {
    const tmcLinks = await fetchAll('trayecto_modulo_comun');
    const trayectosIds = tmcLinks
      .filter(l => l.submodulo_id === submoduloId)
      .map(l => l.trayecto_id);

    const todosTrayectos = await fetchAll('trayectos_formativos');
    const trayectosAsociados = todosTrayectos.filter(t => trayectosIds.includes(t.id));

    const body = overlay.querySelector('#asistencia-modal-body');

    if (trayectosAsociados.length === 0) {
      body.innerHTML = `<div style="padding:32px;text-align:center;color:var(--text-muted);">Este módulo no está asociado a ningún trayecto formativo.</div>`;
      return;
    }

    const inscripciones = await fetchAll('inscripciones');
    const estudiantes = await fetchAll('estudiantes');

    const tabsHTML = trayectosAsociados.map((t, idx) => `
      <button class="content-tab ${idx === 0 ? 'active' : ''}" data-trayectoid="${t.id}">${sanitize(t.nombre)}</button>
    `).join('');

    body.innerHTML = `
      <div class="content-tabs" style="margin-bottom: 20px;">
        ${tabsHTML}
      </div>
      <div id="modulo-asistencia-tab-content">
        <div style="padding:40px;text-align:center;color:var(--text-muted);">Cargando...</div>
      </div>
    `;

    const tabContent = body.querySelector('#modulo-asistencia-tab-content');
    const { renderAsistenciaTab: renderTab, bindAsistenciaEvents: bindEvents } = await import('./asistencia.js');

    const loadTab = async (trayectoId) => {
      tabContent.innerHTML = '<div style="padding:40px;text-align:center;color:var(--text-muted);">Cargando estudiantes del trayecto...</div>';

      const insRelev = inscripciones.filter(i => i.trayecto_id === trayectoId);
      const estIds = [...new Set(insRelev.map(i => i.estudiante_id))];
      const estudiantesModulo = estudiantes.filter(e => estIds.includes(e.id));

      try {
        const html = await renderTab('modulo_comun', submoduloId, estudiantesModulo, trayectoId);
        tabContent.innerHTML = html;
        bindEvents('modulo_comun', submoduloId, estudiantesModulo, tabContent, trayectoId);
      } catch (err) {
        tabContent.innerHTML = `<div style="padding:32px;text-align:center;color:var(--accent-red);">Error al cargar: ${err.message}</div>`;
      }
    };

    const tabButtons = body.querySelectorAll('.content-tab');
    tabButtons.forEach(btn => {
      btn.addEventListener('click', async () => {
        tabButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const trayectoId = btn.dataset.trayectoid;
        await loadTab(trayectoId);
      });
    });

    await loadTab(trayectosAsociados[0].id);

  } catch (err) {
    const body = overlay.querySelector('#asistencia-modal-body');
    body.innerHTML = `<div style="padding:32px;text-align:center;color:var(--accent-red);">Error al cargar: ${err.message}</div>`;
  }
}

// ============================================
// MODAL: EVALUACIÓN MÓDULO COMÚN — POR UNIDAD
// Guarda en seguimiento_unidades (inscripcion_id + unidad_id)
// Se refleja en cada trayecto via tabs
// ============================================
async function openEvaluacionModuloModal(submoduloId, submoduloNombre) {
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = `
    <div class="modal" style="max-width:1050px;width:95vw;">
      <div class="modal-header">
        <h3 class="modal-title">📝 Evaluación por Unidad — ${submoduloNombre}</h3>
        <button class="modal-close" id="modal-close-btn">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
      <div class="modal-body" id="evaluacion-modal-body">
        <div style="padding:40px;text-align:center;color:var(--text-muted);">Cargando...</div>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);

  overlay.querySelector('#modal-close-btn').addEventListener('click', () => overlay.remove());
  overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove(); });

  try {
    const [tmcLinks, todosTrayectos, inscripciones, estudiantes, todasUnidades, todosSubmodulos, todosProfesores] = await Promise.all([
      fetchAll('trayecto_modulo_comun'),
      fetchAll('trayectos_formativos'),
      fetchAll('inscripciones'),
      fetchAll('estudiantes'),
      fetchAll('unidades'),
      fetchAll('submodulos'),
      fetchAll('profesores'),
    ]);

    const currentSub = todosSubmodulos.find(s => s.id === submoduloId);
    const profResponsable = currentSub ? todosProfesores.find(p => p.id === currentSub.profesor_id) : null;
    const nombreResponsable = profResponsable ? (profResponsable.nombre + ' ' + (profResponsable.apellido || '')) : '';

    const trayectosIds = tmcLinks.filter(l => l.submodulo_id === submoduloId).map(l => l.trayecto_id);
    const trayectosAsociados = todosTrayectos.filter(t => trayectosIds.includes(t.id));

    const body = overlay.querySelector('#evaluacion-modal-body');

    if (trayectosAsociados.length === 0) {
      body.innerHTML = '<div style="padding:32px;text-align:center;color:var(--text-muted);">Este módulo no está asociado a ningún trayecto formativo.</div>';
      return;
    }

    const subUnidades = todasUnidades
      .filter(u => u.submodulo_id === submoduloId)
      .sort((a, b) => (a.orden || 0) - (b.orden || 0));

    const tabsHTML = trayectosAsociados.map((t, idx) =>
      '<button class="content-tab ' + (idx === 0 ? 'active' : '') + '" data-trayectoid="' + t.id + '">' + sanitize(t.nombre) + '</button>'
    ).join('');

    body.innerHTML =
      '<div class="content-tabs" style="margin-bottom:20px;">' + tabsHTML + '</div>' +
      '<div id="modulo-eval-tab-content"><div style="padding:40px;text-align:center;color:var(--text-muted);">Cargando...</div></div>';

    const tabContent = body.querySelector('#modulo-eval-tab-content');

    const loadTab = async (trayectoId) => {
      tabContent.innerHTML = '<div style="padding:32px;text-align:center;color:var(--text-muted);">Cargando estudiantes del trayecto...</div>';

      const insRelev = inscripciones.filter(i => i.trayecto_id === trayectoId);

      if (insRelev.length === 0) {
        tabContent.innerHTML = '<div style="padding:32px;text-align:center;color:var(--text-muted);">No hay inscriptos en este trayecto.</div>';
        return;
      }
      if (subUnidades.length === 0) {
        tabContent.innerHTML = '<div style="padding:32px;text-align:center;color:var(--text-muted);">Este módulo no tiene unidades. Agregá unidades primero desde la tarjeta.</div>';
        return;
      }

      const segUnidades = await fetchAll('seguimiento_unidades');
      const unidadIds = subUnidades.map(u => u.id);
      const inscIds = insRelev.map(i => i.id);
      const segMap = {};
      segUnidades
        .filter(su => unidadIds.includes(su.unidad_id) && inscIds.includes(su.inscripcion_id))
        .forEach(su => { segMap[su.inscripcion_id + '_' + su.unidad_id] = su; });

      let unidadesHTML = '';
      subUnidades.forEach(function(unidad, uIdx) {
        let rowsHTML = '';
        insRelev.forEach(function(insc) {
          const est = estudiantes.find(function(e) { return e.id === insc.estudiante_id; });
          if (!est) return;
          const key = insc.id + '_' + unidad.id;
          const seg = segMap[key];
          const estado = (seg && seg.estado) ? seg.estado : 'Pendiente';
          const nota = (seg && seg.nota != null) ? seg.nota : '';
          const fecha = (seg && seg.fecha_aprobacion) ? seg.fecha_aprobacion.slice(0, 10) : '';
          // Si no hay evaluador guardado, usamos el responsable del módulo
          const docente = (seg && seg.docente_evaluador) ? seg.docente_evaluador : nombreResponsable;
          const bgColor = estado === 'Aprobado' ? 'rgba(34,197,94,0.15)' :
                          estado === 'Desaprobado' ? 'rgba(239,68,68,0.13)' :
                          estado === 'En curso' ? 'rgba(251,191,36,0.13)' :
                          estado === 'No aplica' ? 'rgba(255,255,255,0.05)' : 'rgba(139,92,246,0.09)';
          const txtColor = estado === 'Aprobado' ? '#22c55e' :
                           estado === 'Desaprobado' ? '#ef4444' :
                           estado === 'En curso' ? '#fbbf24' :
                           estado === 'No aplica' ? 'var(--text-muted)' : 'var(--text-muted)';
          const isDisabled = estado === 'No aplica' ? 'disabled' : '';

          rowsHTML +=
            '<div class="eval-row" data-insc-id="' + insc.id + '" data-unidad-id="' + unidad.id + '" data-seg-id="' + ((seg && seg.id) ? seg.id : '') + '"' +
            ' style="display:flex;align-items:center;gap:10px;margin-bottom:7px;padding:9px 12px;background:rgba(255,255,255,0.02);border-radius:8px;border:1px solid var(--border-color);">' +
              '<div style="flex:1.5;min-width:150px;">' +
                '<div style="font-weight:600;font-size:0.84rem;">' + sanitize(est.nombre) + ' ' + sanitize(est.apellido) + '</div>' +
                '<div style="font-size:0.69rem;color:var(--text-muted);">DNI: ' + sanitize(est.dni) + '</div>' +
              '</div>' +
              '<div style="flex:1;">' +
                '<select class="form-select eval-estado" style="width:100%;font-size:0.8rem;background:' + bgColor + ';color:' + txtColor + ';border-color:' + txtColor + ';">' +
                  '<option value="Pendiente"' + (estado === 'Pendiente' ? ' selected' : '') + '>Pendiente</option>' +
                  '<option value="En curso"' + (estado === 'En curso' ? ' selected' : '') + '>En curso</option>' +
                  '<option value="Aprobado"' + (estado === 'Aprobado' ? ' selected' : '') + '>Aprobado</option>' +
                  '<option value="Desaprobado"' + (estado === 'Desaprobado' ? ' selected' : '') + '>Desaprobado</option>' +
                  '<option value="No aplica"' + (estado === 'No aplica' ? ' selected' : '') + '>No aplica</option>' +
                '</select>' +
              '</div>' +
              '<div style="flex:0.75;">' +
                '<input type="number" class="form-input eval-nota" value="' + nota + '" min="1" max="10" step="0.5" placeholder="Nota" style="width:100%;font-size:0.8rem;" ' + isDisabled + ' />' +
              '</div>' +
              '<div style="flex:1.1;">' +
                '<input type="date" class="form-input eval-fecha" value="' + fecha + '" style="width:100%;font-size:0.8rem;" ' + isDisabled + ' />' +
              '</div>' +
            '</div>';
        });

        const numOrden = unidad.orden || (uIdx + 1);
        unidadesHTML +=
          '<div class="unidad-eval-section" style="margin-bottom:14px;border:1px solid var(--border-color);border-radius:10px;overflow:hidden;">' +
            '<div class="unidad-eval-header" style="display:flex;align-items:center;gap:10px;padding:10px 14px;background:rgba(139,92,246,0.08);cursor:pointer;user-select:none;"' +
            ' onclick="(function(h){var s=h.closest(\'.unidad-eval-section\');var r=s.querySelector(\'.unidad-eval-rows\');var ic=h.querySelector(\'.chevron-icon\');r.classList.toggle(\'collapsed\');ic.style.transform=r.classList.contains(\'collapsed\')?\'rotate(-90deg)\':\'\'})(this)">' +
              '<div style="width:26px;height:26px;border-radius:6px;background:var(--gradient-purple);color:#fff;display:flex;align-items:center;justify-content:center;font-size:0.74rem;font-weight:700;flex-shrink:0;">' + numOrden + '</div>' +
              '<span style="font-weight:600;font-size:0.875rem;flex:1;">' + sanitize(unidad.nombre) + '</span>' +
              '<span style="font-size:0.7rem;color:var(--text-muted);">' + insRelev.length + ' estudiante' + (insRelev.length !== 1 ? 's' : '') + '</span>' +
              '<svg class="chevron-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:16px;height:16px;color:var(--text-muted);transition:transform 0.25s;"><polyline points="6 9 12 15 18 9"></polyline></svg>' +
            '</div>' +
            '<div class="unidad-eval-rows" style="padding:12px 14px;">' +
              '<div style="display:flex;gap:10px;padding:0 0 6px;font-size:0.68rem;color:var(--text-muted);font-weight:600;text-transform:uppercase;letter-spacing:0.4px;">' +
                '<div style="flex:1.5;min-width:150px;">Estudiante</div>' +
                '<div style="flex:1;">Estado</div>' +
                '<div style="flex:0.75;">Nota</div>' +
                '<div style="flex:1.1;">Fecha Aprob.</div>' +
              '</div>' +
              rowsHTML +
            '</div>' +
          '</div>';
      });

      tabContent.innerHTML =
        '<style>.unidad-eval-rows.collapsed{display:none}.unidad-eval-header:hover{background:rgba(139,92,246,0.14)!important}</style>' +
        '<div class="eval-container" style="max-height:58vh;overflow-y:auto;padding-right:4px;">' + unidadesHTML + '</div>' +
        '<div style="margin-top:16px;display:flex;justify-content:flex-end;gap:10px;align-items:center;">' +
          '<span id="eval-status-msg" style="font-size:0.8rem;color:var(--text-muted);"></span>' +
          '<button class="btn btn-primary" id="btn-save-eval">💾 Guardar Calificaciones</button>' +
        '</div>';

      // Evento para cambiar colores y deshabilitar inputs
      tabContent.querySelectorAll('.eval-estado').forEach(sel => {
        sel.addEventListener('change', () => {
          const val = sel.value;
          const row = sel.closest('.eval-row');
          const nota = row.querySelector('.eval-nota');
          const fecha = row.querySelector('.eval-fecha');
          
          let bg = 'rgba(139,92,246,0.09)', txt = 'var(--text-muted)';
          if (val === 'Aprobado') { bg = 'rgba(34,197,94,0.15)'; txt = '#22c55e'; }
          else if (val === 'Desaprobado') { bg = 'rgba(239,68,68,0.13)'; txt = '#ef4444'; }
          else if (val === 'En curso') { bg = 'rgba(251,191,36,0.13)'; txt = '#fbbf24'; }
          else if (val === 'No aplica') { bg = 'rgba(255,255,255,0.05)'; txt = 'var(--text-muted)'; }
          
          sel.style.background = bg;
          sel.style.color = txt;
          sel.style.borderColor = txt;
          
          if (val === 'No aplica') {
            nota.value = '';
            nota.disabled = true;
            fecha.value = '';
            fecha.disabled = true;
          } else {
            nota.disabled = false;
            fecha.disabled = false;
          }
        });
      });

      tabContent.querySelector('#btn-save-eval').addEventListener('click', async () => {
        const btn = tabContent.querySelector('#btn-save-eval');
        const statusMsg = tabContent.querySelector('#eval-status-msg');
        btn.disabled = true;
        btn.innerHTML = '⏳ Guardando...';
        try {
          const rows = tabContent.querySelectorAll('.eval-row');
          for (const row of rows) {
            const inscId = row.dataset.inscId;
            const unidadId = row.dataset.unidadId;
            const segId = row.dataset.segId;
            const estado = row.querySelector('.eval-estado').value;
            const notaVal = row.querySelector('.eval-nota').value;
            const nota = notaVal !== '' ? parseFloat(notaVal) : null;
            const fecha_aprobacion = row.querySelector('.eval-fecha').value || null;
            const record = { estado, nota, fecha_aprobacion };
            if (segId) {
              await update('seguimiento_unidades', segId, record);
            } else if (estado !== 'Pendiente' || nota !== null || fecha_aprobacion || estado === 'No aplica') {
              const newRec = await create('seguimiento_unidades', {
                inscripcion_id: inscId,
                unidad_id: unidadId,
                ...record
              });
              if (newRec && newRec.id) row.dataset.segId = newRec.id;
            }
          }
          showToast('Calificaciones guardadas exitosamente');
          btn.innerHTML = '✔ Guardado';
          btn.classList.replace('btn-primary', 'btn-secondary');
          statusMsg.textContent = 'Guardado ' + new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
          setTimeout(() => {
            btn.innerHTML = '💾 Guardar Calificaciones';
            btn.classList.replace('btn-secondary', 'btn-primary');
            btn.disabled = false;
          }, 2000);
        } catch (err) {
          showToast('Error al guardar: ' + err.message, 'error');
          btn.innerHTML = '💾 Guardar Calificaciones';
          btn.disabled = false;
        }
      });
    };

    const tabButtons = body.querySelectorAll('.content-tab');
    tabButtons.forEach(btn => {
      btn.addEventListener('click', async () => {
        tabButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        await loadTab(btn.dataset.trayectoid);
      });
    });

    await loadTab(trayectosAsociados[0].id);

  } catch (err) {
    const body = overlay.querySelector('#evaluacion-modal-body');
    body.innerHTML = '<div style="padding:32px;text-align:center;color:var(--accent-red);">Error al cargar: ' + err.message + '</div>';
  }
}

// ============================================
// MODAL: CRONOGRAMA POR CUATRIMESTRE
// ============================================
async function openCronogramaModuloModal(submoduloId, submoduloNombre) {
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = `
    <div class="modal" style="max-width:1150px;width:98vw;">
      <div class="modal-header">
        <h3 class="modal-title">🗓️ Organización Diaria y Horaria — ${submoduloNombre}</h3>
        <button class="modal-close" id="modal-close-btn">${icons.close}</button>
      </div>
      <div class="modal-body" id="cronograma-modal-body">
        <div style="padding:40px;text-align:center;color:var(--text-muted);">Cargando cronograma...</div>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);
  overlay.querySelector('#modal-close-btn').addEventListener('click', () => overlay.remove());

  try {
    const body = overlay.querySelector('#cronograma-modal-body');
    let currentCuatrimestre = 1;
    const anio = getCurrentYear();
    let allHorarios = [];
    let misDisponibilidades = [];
    let selectedTrayectoId = null;

    const renderTable = async (cuatrimestre, trayectoId = null) => {
      body.innerHTML = `<div style="padding:40px;text-align:center;color:var(--text-muted);">Cargando datos...</div>`;
      
      const [submodulos, allTrayectos, mappings] = await Promise.all([
        fetchAll('submodulos'),
        fetchAll('trayectos_formativos'),
        fetchAll('trayecto_modulo_comun', { eq: { submodulo_id: submoduloId } })
      ]);
      
      const currentSub = submodulos.find(s => s.id === submoduloId);
      const profId = currentSub?.profesor_id;
      const linkedTrayectos = allTrayectos.filter(t => mappings.some(m => m.trayecto_id === t.id));
      
      // Si no hay trayecto seleccionado, tomamos el primero
      if (!selectedTrayectoId && linkedTrayectos.length > 0) {
        selectedTrayectoId = linkedTrayectos[0].id;
      }
      
      let dispResults;
      try {
        dispResults = profId ? await fetchAll('disponibilidad_docentes', { 
          eq: { profesor_id: profId, submodulo_id: submoduloId } 
        }) : [];
      } catch (err) {
        console.warn('[Cronograma] Error fetching module-specific availability. Falling back to shared.', err);
        dispResults = profId ? await fetchAll('disponibilidad_docentes', { 
          eq: { profesor_id: profId } 
        }) : [];
      }
      
      const [horarios] = await Promise.all([
        fetchAll('horarios_submodulos', { 
          eq: { submodulo_id: submoduloId, trayecto_id: selectedTrayectoId }, 
          orderBy: 'hora_inicio', 
          ascending: true 
        })
      ]);
      allHorarios = horarios;
      misDisponibilidades = dispResults;

      const dias = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];
      const misHorarios = allHorarios.filter(h => h.cuatrimestre === cuatrimestre && h.anio === anio);
      const currentTrayecto = linkedTrayectos.find(t => t.id === selectedTrayectoId);

      body.innerHTML = `
        <div class="tabs" style="margin-bottom: 20px;">
          <button class="tab-btn ${cuatrimestre === 1 ? 'active' : ''}" id="tab-c1">1° Cuatrimestre</button>
          <button class="tab-btn ${cuatrimestre === 2 ? 'active' : ''}" id="tab-c2">2° Cuatrimestre</button>
          <div style="border-left: 1px solid var(--border-color); margin: 0 10px;"></div>
          ${linkedTrayectos.map(t => `
            <button class="tab-btn trayecto-tab ${selectedTrayectoId === t.id ? 'active' : ''}" data-id="${t.id}">${t.nombre}</button>
          `).join('')}
          <div style="flex:1"></div>
          <button class="btn btn-secondary" id="btn-config-disponibilidad-modal" style="margin-right:8px;">${icons.calendar} Mi Disponibilidad</button>
          <button class="btn btn-add" id="btn-add-slot-modal">${icons.plus} Agregar Bloque</button>
          <button class="btn btn-secondary" onclick="window.print()">${icons.document} Imprimir</button>
        </div>

        <div class="tabla-cronograma-container">
          <table class="cronograma-table">
            <thead>
              <tr>
                <th class="th-dia">Día</th>
                <th class="th-disp">Entrada</th>
                <th class="th-disp">Salida</th>
                <th class="th-eventual">Horario Eventual</th>
                <th class="th-turno">Mañana</th>
                <th class="th-turno">Tarde</th>
                <th class="th-turno">Vespertino</th>
              </tr>
            </thead>
            <tbody>
              ${[1, 2, 3, 4, 5].map(diaId => {
                const horariosDia = misHorarios.filter(h => h.dia_semana === diaId).sort((a,b) => a.hora_inicio.localeCompare(b.hora_inicio));
                const dispDia = misDisponibilidades
                  .filter(d => d.dia_semana === diaId && d.cuatrimestre === cuatrimestre)
                  .sort((a,b) => a.hora_entrada.localeCompare(b.hora_entrada));
                
                // Clasificar bloques por turno
                const bloquesManana = horariosDia.filter(h => h.hora_inicio < '13:00');
                const bloquesTarde = horariosDia.filter(h => h.hora_inicio >= '13:00' && h.hora_inicio < '18:30');
                const bloquesVespertino = horariosDia.filter(h => h.hora_inicio >= '18:30');

                const renderBloque = (h) => {
                  if (!h) return '';
                  return `
                    <div class="bloque-celda-card" data-id="${h.id}">
                      <div class="bloque-celda-time">${h.hora_inicio.substring(0,5)} - ${h.hora_fin?.substring(0,5) || '--:--'}</div>
                      <div class="bloque-celda-trayecto">${sanitize(currentTrayecto?.nombre || 'Trayecto')}</div>
                      <div class="bloque-celda-grupo">${sanitize(h.grupo_comision || '-')}</div>
                      <div class="bloque-celda-actions">
                        <button class="btn-icon btn-del-slot" data-id="${h.id}" title="Eliminar">${icons.trash}</button>
                      </div>
                    </div>
                  `;
                };

                return `
                  <tr>
                    <td class="td-dia-label">${dias[diaId-1]}</td>
                    <td class="td-disp-val">${dispDia.map(d => d.hora_entrada.substring(0,5)).join('<br>') || '-'}</td>
                    <td class="td-disp-val">${dispDia.map(d => d.hora_salida.substring(0,5)).join('<br>') || '-'}</td>
                    <td class="td-eventual-val">${horariosDia.filter(h => h.horario_eventual).map(h => sanitize(h.horario_eventual)).join('<br>') || '-'}</td>
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
          .tabla-cronograma-container { margin-top: 10px; background: var(--bg-card); border-radius: 12px; border: 1px solid var(--border-color); overflow-x: auto; }
          .cronograma-table { width: 100%; border-collapse: collapse; min-width: 900px; }
          .cronograma-table th, .cronograma-table td { border: 1px solid var(--border-color); padding: 8px; vertical-align: top; }
          
          .th-dia { width: 90px; background: var(--bg-secondary); }
          .th-disp { width: 70px; background: var(--bg-secondary); font-size: 0.7rem; color: var(--accent-green); }
          .th-eventual { width: 90px; background: var(--bg-secondary); font-size: 0.7rem; }
          .th-turno { width: 25%; background: var(--bg-secondary); font-weight: 700; color: var(--text-primary); text-transform: uppercase; font-size: 0.75rem; }
          
          .td-dia-label { background: var(--bg-secondary); font-weight: 800; text-align: center; color: var(--text-primary); font-size: 0.85rem; }
          .td-disp-val { text-align: center; font-weight: 700; color: var(--accent-green); font-size: 0.8rem; }
          .td-turno-val { height: 80px; padding: 4px !important; background: rgba(255,255,255,0.01); }
          
          .bloque-celda-card {
            background: var(--bg-card); border: 1px solid var(--border-color); border-left: 3px solid var(--accent-green);
            border-radius: 6px; padding: 6px; margin-bottom: 4px; position: relative;
          }
          .bloque-celda-card:hover { border-color: var(--accent-green); }
          .bloque-celda-time { font-size: 0.6rem; font-weight: 800; color: var(--accent-purple-light); }
          .bloque-celda-trayecto { font-size: 0.7rem; font-weight: 700; color: var(--text-primary); margin: 2px 0; line-height: 1.1; }
          .bloque-celda-grupo { font-size: 0.65rem; color: var(--text-secondary); }
          
          .bloque-celda-actions { 
            position: absolute; top: 2px; right: 2px; display: none; gap: 2px; background: var(--bg-card); border-radius: 4px; padding: 2px;
          }
          .bloque-celda-card:hover .bloque-celda-actions { display: flex; }

          @media print {
            .tabs, .btn-icon, .slot-actions, .bloque-celda-actions { display: none !important; }
            .tabla-cronograma-container { border: none; }
            .cronograma-table { border: 2px solid #000; width: 100% !important; }
            .cronograma-table th, .cronograma-table td { border: 1px solid #000 !important; color: #000 !important; }
          }
        </style>
      `;

      // Eventos
      body.querySelector('#tab-c1').onclick = () => { currentCuatrimestre = 1; renderTable(1); };
      body.querySelector('#tab-c2').onclick = () => { currentCuatrimestre = 2; renderTable(2); };
      body.querySelectorAll('.trayecto-tab').forEach(btn => {
        btn.onclick = () => { selectedTrayectoId = btn.dataset.id; renderTable(currentCuatrimestre); };
      });
      body.querySelector('#btn-config-disponibilidad-modal').onclick = () => openDisponibilidadModal(profId, cuatrimestre);
      const btnAdd = body.querySelector('#btn-add-slot-modal');
      if (btnAdd) btnAdd.onclick = () => openAddSlotModal(cuatrimestre, linkedTrayectos);
      body.querySelectorAll('.btn-del-slot').forEach(btn => {
        btn.onclick = async () => {
          if (confirm('¿Eliminar este bloque horario?')) {
            await remove('horarios_submodulos', btn.dataset.id);
            showToast('Horario eliminado');
            renderTable(cuatrimestre);
          }
        };
      });
    };

    const openAddSlotModal = (cuatrimestre, linkedTrayectos) => {
      const formHTML = `
        <div class="form-group">
          <label class="form-label">Trayecto Formativo</label>
          <select class="form-select" id="new-slot-trayecto">
            ${linkedTrayectos.map(t => `<option value="${t.id}" ${selectedTrayectoId === t.id ? 'selected' : ''}>${t.nombre}</option>`).join('')}
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Día de la Semana</label>
          <select class="form-select" id="new-slot-dia">
            <option value="1">Lunes</option><option value="2">Martes</option><option value="3">Miércoles</option>
            <option value="4">Jueves</option><option value="5">Viernes</option>
          </select>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Grupo / Comisión</label>
            <input type="text" class="form-input" id="new-slot-comision" placeholder="Ej: Grupo 1">
          </div>
          <div class="form-group">
            <label class="form-label">📍 Aula</label>
            <input type="text" class="form-input" id="new-slot-aula" placeholder="Ej: Aula 3">
          </div>
        </div>
        <div class="form-row">
          <div class="form-group"><label class="form-label">Desde</label><input type="time" class="form-input" id="new-slot-inicio" value="08:00"></div>
          <div class="form-group"><label class="form-label">Hasta</label><input type="time" class="form-input" id="new-slot-fin" value="12:00"></div>
        </div>
        <div class="form-group">
          <label class="form-label">Horario Eventual / Excepcional</label>
          <input type="text" class="form-input" id="new-slot-eventual" placeholder="Ej: Clases sábados cada 15 días, etc.">
        </div>
        <div class="form-group">
          <label class="form-label">Observaciones</label>
          <textarea class="form-input" id="new-slot-obs" style="min-height:60px;"></textarea>
        </div>
      `;
      const footerHTML = `<button class="btn btn-secondary" id="slot-cancel">Cancelar</button><button class="btn btn-primary" id="slot-save">Guardar Bloque</button>`;
      const slotOverlay = createModal('Nuevo Bloque Horario', formHTML, footerHTML);
      
      slotOverlay.querySelector('#slot-cancel').addEventListener('click', () => slotOverlay.remove());
      slotOverlay.querySelector('#slot-save').addEventListener('click', async () => {
        const trayecto_id = document.getElementById('new-slot-trayecto').value;
        const dia_semana = parseInt(document.getElementById('new-slot-dia').value);
        const grupo_comision = document.getElementById('new-slot-comision').value.trim();
        const aula = document.getElementById('new-slot-aula').value.trim();
        const observaciones = document.getElementById('new-slot-obs').value.trim();
        const hora_inicio = document.getElementById('new-slot-inicio').value;
        const hora_fin = document.getElementById('new-slot-fin').value;
        const horario_eventual = document.getElementById('new-slot-eventual').value.trim() || null;

        if (hora_inicio >= hora_fin) {
          showToast('La hora de inicio debe ser menor a la de fin', 'error');
          return;
        }

        // Validaciones
        const misDisp = misDisponibilidades.filter(d => d.dia_semana === dia_semana && d.cuatrimestre === cuatrimestre);
        if (misDisp.length > 0) {
          const within = misDisp.some(d => {
            const ent = d.hora_entrada.substring(0,5);
            const sal = d.hora_salida.substring(0,5);
            return hora_inicio >= ent && hora_fin <= sal;
          });
          if (!within) {
            showToast('El bloque está fuera de los turnos de entrada/salida configurados para este día.', 'warning');
            return;
          }
        }

        const otros = allHorarios.filter(h => h.dia_semana === dia_semana && h.cuatrimestre === cuatrimestre);
        const conflict = otros.some(o => {
          const startO = o.hora_inicio.substring(0,5);
          const endO = o.hora_fin.substring(0,5);
          return (hora_inicio < endO) && (hora_fin > startO);
        });
        if (conflict) {
          showToast('Existe una superposición con otro bloque existente.', 'error');
          return;
        }

        const btn = slotOverlay.querySelector('#slot-save');
        btn.disabled = true;
        btn.textContent = 'Guardando...';

        try {
          const data = {
            submodulo_id: submoduloId,
          trayecto_id,
          cuatrimestre,
          anio,
          dia_semana,
          hora_inicio,
          hora_fin,
          grupo_comision,
          aula,
          observaciones,
          horario_eventual
        };

        const res = await create('horarios_submodulos', data);
          showToast('Bloque agregado');
          slotOverlay.remove();
          renderTable(cuatrimestre);
        } catch (err) {
          showToast('Error al guardar: ' + err.message, 'error');
          btn.disabled = false;
          btn.textContent = 'Guardar Bloque';
        }
      });
    };

    const openDisponibilidadModal = async (profesor_id, cuatrimestre) => {
      if (!profesor_id) {
        showToast('Este submódulo no tiene un profesor asignado.', 'error');
        return;
      }

      const renderDispContent = () => {
        const diasNm = ['', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];
        return `
          <div style="max-height: 400px; overflow-y: auto; border: 1px solid var(--border-color); border-radius:8px;">
            <table class="cronograma-table">
              <thead>
                <tr>
                  <th>Día</th>
                  <th>Entrada / Salida</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                ${[1, 2, 3, 4, 5].map(diaId => {
                  const slots = misDisponibilidades.filter(d => d.dia_semana === diaId && d.cuatrimestre === cuatrimestre);
                  return `
                    <tr>
                      <td style="font-weight:bold; background:var(--bg-secondary);">${diasNm[diaId]}</td>
                      <td style="padding:0;">
                        <table style="width:100%; border-collapse:collapse;">
                          ${slots.length === 0 ? `
                            <tr><td style="padding:10px; color:var(--text-muted); text-align:center;">Sin turnos</td></tr>
                          ` : slots.map(s => `
                            <tr style="border-bottom: 1px solid var(--border-color);">
                              <td style="padding:10px; text-align:center;">${s.hora_entrada.substring(0,5)} - ${s.hora_salida.substring(0,5)}</td>
                              <td style="padding:10px; width:40px;">
                                <button class="btn-icon btn-del-disp-row" data-id="${s.id}">${icons.trash}</button>
                              </td>
                            </tr>
                          `).join('')}
                        </table>
                      </td>
                      <td style="text-align:center;">
                        <button class="btn btn-secondary btn-sm btn-add-disp-row" data-dia="${diaId}">${icons.plus} Agregar</button>
                      </td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>
        `;
      };

      const dispOverlay = createModal('Mi Disponibilidad (Entrada/Salida)', `<div id="disp-modal-body-sub">${renderDispContent()}</div>`, `<button class="btn btn-secondary" id="disp-close-sub">Cerrar</button>`);
      
      const updateDispView = () => {
        dispOverlay.querySelector('#disp-modal-body-sub').innerHTML = renderDispContent();
        attachDispEvents();
      };

      const attachDispEvents = () => {
        dispOverlay.querySelectorAll('.btn-del-disp-row').forEach(btn => {
          btn.onclick = async () => {
            if (confirm('¿Eliminar este turno de entrada/salida?')) {
              await remove('disponibilidad_docentes', btn.dataset.id);
              misDisponibilidades = misDisponibilidades.filter(d => d.id !== btn.dataset.id);
              updateDispView();
            }
          };
        });

        dispOverlay.querySelectorAll('.btn-add-disp-row').forEach(btn => {
          btn.onclick = () => {
            const diaId = parseInt(btn.dataset.dia);
            const addForm = `
              <div class="form-row">
                <div class="form-group"><label>Entrada</label><input type="time" id="add-disp-in" class="form-input" value="08:00"></div>
                <div class="form-group"><label>Salida</label><input type="time" id="add-disp-out" class="form-input" value="12:00"></div>
              </div>
            `;
            const addModal = createModal('Agregar Turno', addForm, `<button class="btn btn-secondary" id="add-disp-cancel">Cancelar</button><button class="btn btn-primary" id="add-disp-save">Guardar</button>`);
            
            addModal.querySelector('#add-disp-cancel').onclick = () => addModal.remove();
            addModal.querySelector('#add-disp-save').onclick = async () => {
              const btn = addModal.querySelector('#add-disp-save');
              const entrada = document.getElementById('add-disp-in').value;
              const salida = document.getElementById('add-disp-out').value;
              if (entrada >= salida) { showToast('Entrada debe ser antes que salida', 'error'); return; }
              
              btn.disabled = true;
              btn.textContent = 'Guardando...';
              
              try {
                let record = {
                  profesor_id,
                  submodulo_id: submoduloId, // Intento de independencia
                  dia_semana: diaId,
                  hora_entrada: entrada,
                  hora_salida: salida,
                  cuatrimestre,
                  anio
                };

                let res;
                try {
                  res = await create('disponibilidad_docentes', record);
                } catch (err) {
                  console.warn('[Cronograma] Failed to save with submodulo_id. Falling back to shared.', err);
                  delete record.submodulo_id; // Quitar para compatibilidad
                  res = await create('disponibilidad_docentes', record);
                  showToast('Guardado en modo compartido (Ejecutá el SQL para independencia)');
                }

                misDisponibilidades.push(res);
                showToast('Turno guardado');
                addModal.remove();
                updateDispView();
              } catch (err) {
                console.error('[Cronograma] Error al guardar disponibilidad:', err);
                showToast('Error al guardar. Es posible que falte la columna técnica en la base de datos.', 'error');
                btn.disabled = false;
                btn.textContent = 'Guardar';
              }
            };
          };
        });
      };

      attachDispEvents();
      dispOverlay.querySelector('#disp-close-sub').onclick = () => {
        dispOverlay.remove();
        renderTable(cuatrimestre);
      };
    };

    await renderTable(currentCuatrimestre);

  } catch (err) {
    overlay.querySelector('#cronograma-modal-body').innerHTML = `<div class="error-state">${err.message}</div>`;
  }
}

export default { renderSubmodulos };
