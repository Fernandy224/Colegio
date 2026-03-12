// ============================================
// Gestión de Módulos Comunes (CRUD) + Unidades
// ============================================
import { getContentArea, getPanelRight } from './layout.js';
import { icons, showToast, createModal, confirmDialog, sanitize } from '../utils/helpers.js';
import { fetchAll, create, update, remove } from '../utils/data.js';
import { getCurrentUser } from './auth.js';
import { renderAsistenciaTab, bindAsistenciaEvents } from './asistencia.js';

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
  // Perfil de profesor del usuario actual (para verificar si es responsable)
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
    const isExpanded = expandedCard === sub.id;

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
                    ${sub.nombre && sub.nombre.toLowerCase().includes('higiene y seguridad') ? `
                    <button class="btn btn-secondary acta-submodulo-btn" data-subid="${sub.id}" data-subnombre="${sanitize(sub.nombre)}" style="padding: 4px 10px; font-size: 0.72rem; border-radius: 6px;">
                      📄 Acta
                    </button>
                    <button class="btn btn-secondary informe-grupal-btn" data-subid="${sub.id}" data-subnombre="${sanitize(sub.nombre)}" style="padding: 4px 10px; font-size: 0.72rem; border-radius: 6px;">
                      📊 Informe
                    </button>
                    ` : ''}
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

  // Agregar módulo común
  document.getElementById('btn-add-submodulo')?.addEventListener('click', () => openSubmoduloModal(null, modulos, profesores));

  // Editar módulo común
  content.querySelectorAll('.edit-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const sub = submodulos.find(s => s.id === btn.dataset.id);
      if (sub) openSubmoduloModal(sub, modulos, profesores);
    });
  });

  // Eliminar módulo común
  content.querySelectorAll('.card-action-btn-del').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const sub = submodulos.find(s => s.id === btn.dataset.id);
      if (sub) {
        confirmDialog(`¿Eliminar el módulo común <strong>${sanitize(sub.nombre)}</strong>? Esto también eliminará sus unidades.`, async () => {
          // Eliminar unidades asociadas primero (en modo local)
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

  // Ver asistencia de módulo común
  content.querySelectorAll('.ver-asistencia-btn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      const subId = btn.dataset.subid;
      const subNombre = btn.dataset.subnombre;
      await openAsistenciaModuloModal(subId, subNombre);
    });
  });

  // Evaluar módulo común
  content.querySelectorAll('.evaluar-submodulo-btn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      const subId = btn.dataset.subid;
      const subNombre = btn.dataset.subnombre;
      await openEvaluacionModuloModal(subId, subNombre);
    });
  });

  // Generar Acta
  content.querySelectorAll('.acta-submodulo-btn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      const subId = btn.dataset.subid;
      const subNombre = btn.dataset.subnombre;
      const { openGenerarActaModal } = await import('./actas.js');
      await openGenerarActaModal(subId, subNombre);
    });
  });

  // Generar Informe Grupal
  content.querySelectorAll('.informe-grupal-btn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      const subId = btn.dataset.subid;
      const subNombre = btn.dataset.subnombre;
      const { openInformeGrupalModal } = await import('./informes_grupales.js');
      await openInformeGrupalModal(subId, subNombre);
    });
  });

  // Agregar unidad
  content.querySelectorAll('.add-unidad-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const subId = btn.dataset.subid;
      const subUnidades = unidades.filter(u => u.submodulo_id === subId);
      const nextOrden = subUnidades.length + 1;
      openUnidadModal(null, subId, nextOrden);
    });
  });

  // Editar unidad
  content.querySelectorAll('.edit-unidad-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const unidad = unidades.find(u => u.id === btn.dataset.uid);
      if (unidad) openUnidadModal(unidad, btn.dataset.subid);
    });
  });

  // Eliminar unidad
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
  // Overlay de carga inicial
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
    // Obtener trayectos que tienen este módulo común vinculado
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

    // Obtener inscripciones de esos trayectos
    const inscripciones = await fetchAll('inscripciones');
    // Obtener estudiantes únicos
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
// MODAL: EVALUACIÓN / SEGUIMIENTO MÓDULO COMÚN
// ============================================
async function openEvaluacionModuloModal(submoduloId, submoduloNombre) {
  // Overlay de carga inicial
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = `
    <div class="modal" style="max-width:1050px;width:95vw;">
      <div class="modal-header">
        <h3 class="modal-title">📝 Evaluación — ${submoduloNombre}</h3>
        <button class="modal-close" id="modal-close-btn">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
      <div class="modal-body" id="evaluacion-modal-body">
        <div style="padding:40px;text-align:center;color:var(--text-muted);">Cargando estudiantes...</div>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);

  overlay.querySelector('#modal-close-btn').addEventListener('click', () => overlay.remove());
  overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove(); });

  try {
    const tmcLinks = await fetchAll('trayecto_modulo_comun');
    const trayectosIds = tmcLinks.filter(l => l.submodulo_id === submoduloId).map(l => l.trayecto_id);
    const todosTrayectos = await fetchAll('trayectos_formativos');
    const trayectosAsociados = todosTrayectos.filter(t => trayectosIds.includes(t.id));

    const body = overlay.querySelector('#evaluacion-modal-body');

    if (trayectosAsociados.length === 0) {
      body.innerHTML = `<div style="padding:32px;text-align:center;color:var(--text-muted);">Este módulo no está asociado a ningún trayecto formativo.</div>`;
      return;
    }

    const inscripciones = await fetchAll('inscripciones');
    const estudiantes = await fetchAll('estudiantes');
    let seguimiento = await fetchAll('seguimiento_modulos');

    const tabsHTML = trayectosAsociados.map((t, idx) => `
      <button class="content-tab ${idx === 0 ? 'active' : ''}" data-trayectoid="${t.id}">${sanitize(t.nombre)}</button>
    `).join('');

    body.innerHTML = `
      <div class="content-tabs" style="margin-bottom: 20px;">
        ${tabsHTML}
      </div>
      <div id="modulo-eval-tab-content">
        <div style="padding:40px;text-align:center;color:var(--text-muted);">Cargando...</div>
      </div>
    `;

    const tabContent = body.querySelector('#modulo-eval-tab-content');

    const loadTab = async (trayectoId) => {
      const insRelev = inscripciones.filter(i => i.trayecto_id === trayectoId);
      
      if (insRelev.length === 0) {
        tabContent.innerHTML = '<div style="padding:32px;text-align:center;color:var(--text-muted);">No hay inscriptos en este trayecto.</div>';
        return;
      }
      
      let rowsHTML = insRelev.map(insc => {
        const est = estudiantes.find(e => e.id === insc.estudiante_id);
        if (!est) return '';
        
        const seg = seguimiento.find(s => s.inscripcion_id === insc.id && s.submodulo_id === submoduloId);
        const estado = seg?.estado || 'Pendiente';
        const nota = seg?.nota || '';
        const fecha = seg?.fecha_aprobacion ? seg.fecha_aprobacion.slice(0, 10) : '';
        const docente = seg?.docente_evaluador || '';
        
        return `
          <div class="eval-row" style="display:flex; align-items:center; gap: 12px; margin-bottom: 12px; padding: 12px; background: rgba(255,255,255,0.02); border-radius: 8px; border: 1px solid var(--border-color);">
            <div style="flex: 1.5; min-width:180px;">
              <div style="font-weight: 600;">${sanitize(est.nombre)} ${sanitize(est.apellido)}</div>
              <div style="font-size: 0.75rem; color: var(--text-muted);">DNI: ${sanitize(est.dni)}</div>
            </div>
            <div style="flex: 1;">
              <select class="form-select eval-estado" data-insc-id="${insc.id}" data-seg-id="${seg?.id || ''}" style="width: 100%; font-size: 0.8125rem;">
                <option value="Pendiente" ${estado === 'Pendiente' ? 'selected' : ''}>Pendiente</option>
                <option value="En curso" ${estado === 'En curso' ? 'selected' : ''}>En curso</option>
                <option value="Aprobado" ${estado === 'Aprobado' ? 'selected' : ''}>Aprobado</option>
                <option value="Desaprobado" ${estado === 'Desaprobado' ? 'selected' : ''}>Desaprobado</option>
              </select>
            </div>
            <div style="flex: 0.8;">
              <input type="number" class="form-input eval-nota" data-insc-id="${insc.id}" value="${nota}" min="1" max="10" step="0.5" placeholder="Nota" style="width: 100%; font-size: 0.8125rem;" />
            </div>
            <div style="flex: 1.2;">
              <input type="date" class="form-input eval-fecha" data-insc-id="${insc.id}" value="${fecha}" style="width: 100%; font-size: 0.8125rem;" />
            </div>
            <div style="flex: 1.5;">
              <input type="text" class="form-input eval-docente" data-insc-id="${insc.id}" value="${sanitize(docente)}" placeholder="Docente Evaluador" style="width: 100%; font-size: 0.8125rem;" />
            </div>
          </div>
        `;
      }).join('');
      
      tabContent.innerHTML = `
        <div class="eval-container" style="max-height: 55vh; overflow-y: auto;">
          <div style="display:flex; gap: 12px; padding: 0 12px 6px; font-size: 0.75rem; color: var(--text-muted); font-weight: 600; text-transform: uppercase;">
            <div style="flex: 1.5; min-width:180px;">Estudiante</div>
            <div style="flex: 1;">Estado</div>
            <div style="flex: 0.8;">Nota</div>
            <div style="flex: 1.2;">Fecha Aprob.</div>
            <div style="flex: 1.5;">Docente Evaluador</div>
          </div>
          ${rowsHTML}
        </div>
        <div style="margin-top: 20px; display: flex; justify-content: flex-end;">
          <button class="btn btn-primary" id="btn-save-eval">Guardar Calificaciones</button>
        </div>
      `;

      tabContent.querySelector('#btn-save-eval').addEventListener('click', async () => {
        try {
          const rows = tabContent.querySelectorAll('.eval-row');
          for (const row of rows) {
            const estadoSelect = row.querySelector('.eval-estado');
            const inscId = estadoSelect.dataset.inscId;
            const segId = estadoSelect.dataset.segId;
            const estado = estadoSelect.value;
            const nota = row.querySelector('.eval-nota').value ? parseFloat(row.querySelector('.eval-nota').value) : null;
            const fecha_aprobacion = row.querySelector('.eval-fecha').value || null;
            const docente_evaluador = row.querySelector('.eval-docente').value.trim() || null;
            
            const record = { estado, nota, fecha_aprobacion, docente_evaluador };

            if (segId) {
              await update('seguimiento_modulos', segId, record);
            } else if (estado !== 'Pendiente' || nota || fecha_aprobacion || docente_evaluador) {
              await create('seguimiento_modulos', {
                inscripcion_id: inscId,
                submodulo_id: submoduloId,
                ...record
              });
            }
          }
          showToast('Calificaciones guardadas exitosamente');
          const btnSave = tabContent.querySelector('#btn-save-eval');
          btnSave.innerHTML = '✔ Guardado';
          btnSave.classList.replace('btn-primary', 'btn-secondary');
          setTimeout(() => {
            btnSave.innerHTML = 'Guardar Calificaciones';
            btnSave.classList.replace('btn-secondary', 'btn-primary');
          }, 2000);
          
          // Refrescar caché de seguimiento para próximos cambios en la misma ventana
          seguimiento = await fetchAll('seguimiento_modulos');
          
        } catch (err) {
          showToast('Error al guardar: ' + err.message, 'error');
        }
      });
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
    const body = overlay.querySelector('#evaluacion-modal-body');
    body.innerHTML = `<div style="padding:32px;text-align:center;color:var(--accent-red);">Error al cargar: ${err.message}</div>`;
  }
}

export default { renderSubmodulos };

