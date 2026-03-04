// ============================================
// Gestión de Módulos (CRUD)
// ============================================
import { getContentArea, getPanelRight } from './layout.js';
import { icons, showToast, createModal, confirmDialog, sanitize } from '../utils/helpers.js';
import { fetchAll, create, update, remove } from '../utils/data.js';
import { getCurrentYear } from '../utils/state.js';

export async function renderModulos() {
  const content = getContentArea();
  const panel = getPanelRight();
  const year = getCurrentYear();

  let allModulos = await fetchAll('modulos');
  let modulos = allModulos.filter(m => !m.anio || m.anio === year);
  const trayectos = await fetchAll('trayectos_formativos');

  // Agrupar modulos por trayecto_id
  const groupedModules = {};
  modulos.forEach(mod => {
    const tid = mod.trayecto_id || 'unassigned';
    if (!groupedModules[tid]) groupedModules[tid] = [];
    groupedModules[tid].push(mod);
  });

  // Icono de carpeta SVG
  const folderIcon = `<svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: var(--accent-purple);"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>`;

  content.innerHTML = `
    <div class="section-header">
      <h1 class="section-title">Gestionar Módulos Específicos</h1>
      <div class="section-actions">
        <button class="btn btn-add" id="btn-add-modulo">
          ${icons.plus} Nuevo Módulo Específico
        </button>
      </div>
    </div>

    ${modulos.length === 0 ? `
      <div class="empty-state">
        ${icons.modulos}
        <h3 class="empty-state-title">No hay módulos específicos</h3>
        <p class="empty-state-text">Creá un módulo específico y asocialo a un trayecto formativo.</p>
      </div>
    ` : `
      <div class="modulos-grupos">
        ${Object.keys(groupedModules).map(tid => {
    const mods = groupedModules[tid];
    const tray = trayectos.find(t => t.id === tid);
    const trayNombre = tray ? sanitize(tray.nombre) : 'Módulos sin trayecto asignado';

    return `
            <div class="modulo-grupo" style="margin-bottom: 2.5rem;">
              <div style="display:flex;align-items:center;gap:12px;margin-bottom:1.5rem;padding-bottom:12px;border-bottom:1px solid rgba(255,255,255,0.05);">
                ${folderIcon}
                <h3 style="color:var(--text-primary);font-size:1.1rem;font-weight:600;margin:0;">${trayNombre}</h3>
                <span style="font-size:0.75rem;background:rgba(255,255,255,0.1);padding:4px 10px;border-radius:999px;color:var(--text-secondary);">${mods.length} módulo${mods.length !== 1 ? 's' : ''}</span>
              </div>
              <div class="cards-grid">
                ${mods.map(mod => {
      return `
                    <div class="card" data-id="${mod.id}">
                      <div class="card-actions">
                        <button class="card-action-btn edit-btn" data-id="${mod.id}" title="Editar">${icons.edit}</button>
                        <button class="card-action-btn delete card-action-btn-del" data-id="${mod.id}" title="Eliminar">${icons.trash}</button>
                      </div>
                      <div class="card-avatar modulo">
                        ${sanitize(mod.nombre?.charAt(0) || 'M')}
                      </div>
                      <div class="card-name">${sanitize(mod.nombre)}</div>
                      <div class="card-subtitle">${tray ? sanitize(tray.nombre) : 'Sin trayecto'}</div>
                      <div class="card-details">
                        <div class="card-detail">
                          <span class="card-detail-label">Año</span>
                          <span class="card-detail-value">${mod.anio || '-'}</span>
                        </div>
                      </div>
                    </div>
                  `;
    }).join('')}
              </div>
            </div>
          `;
  }).join('')}
      </div>
    `}
  `;

  panel.innerHTML = `
    <div class="widget">
      <div class="widget-header"><span class="widget-title">Módulos Específicos</span></div>
      <div class="widget-stats">
        <div class="widget-stat">
          <div class="widget-stat-value">${modulos.length}</div>
          <div class="widget-stat-label">Total</div>
        </div>
      </div>
    </div>
  `;

  document.getElementById('btn-add-modulo')?.addEventListener('click', () => openModuloModal(null, trayectos));

  content.querySelectorAll('.edit-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const mod = modulos.find(m => m.id === btn.dataset.id);
      if (mod) openModuloModal(mod, trayectos);
    });
  });

  content.querySelectorAll('.card-action-btn-del').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const mod = modulos.find(m => m.id === btn.dataset.id);
      if (mod) {
        confirmDialog(`¿Eliminar el módulo <strong>${sanitize(mod.nombre)}</strong>?`, async () => {
          await remove('modulos', mod.id);
          showToast('Módulo eliminado');
          renderModulos();
        });
      }
    });
  });
}

function openModuloModal(modulo, trayectos) {
  const isEdit = !!modulo;
  const formHTML = `
    <div class="form-group">
      <label class="form-label">Nombre del Módulo Específico</label>
      <input type="text" class="form-input" id="mod-nombre" value="${isEdit ? sanitize(modulo.nombre) : ''}" required placeholder="Ej: Programación I" />
    </div>
    <div class="form-row">
      <div class="form-group">
        <label class="form-label">Año</label>
        <input type="number" class="form-input" id="mod-anio" value="${isEdit ? (modulo.anio || '') : getCurrentYear()}" placeholder="2024" min="2000" max="2100" />
      </div>
      <div class="form-group">
        <label class="form-label">Trayecto Formativo</label>
        <select class="form-select" id="mod-trayecto">
          <option value="">Sin trayecto</option>
          ${trayectos.map(t => `
            <option value="${t.id}" ${isEdit && modulo.trayecto_id === t.id ? 'selected' : ''}>${sanitize(t.nombre)}</option>
          `).join('')}
        </select>
      </div>
    </div>
  `;

  const footerHTML = `
    <button class="btn btn-secondary" id="modal-cancel">Cancelar</button>
    <button class="btn btn-primary" id="modal-save">${isEdit ? 'Guardar' : 'Crear Módulo'}</button>
  `;

  const overlay = createModal(isEdit ? 'Editar Módulo' : 'Nuevo Módulo', formHTML, footerHTML);

  overlay.querySelector('#modal-cancel').addEventListener('click', () => overlay.remove());
  overlay.querySelector('#modal-save').addEventListener('click', async () => {
    const nombre = document.getElementById('mod-nombre').value.trim();
    const anio = parseInt(document.getElementById('mod-anio').value) || null;
    const trayecto_id = document.getElementById('mod-trayecto').value || null;

    if (!nombre) { showToast('Ingresá el nombre del módulo específico', 'error'); return; }

    try {
      if (isEdit) {
        await update('modulos', modulo.id, { nombre, anio, trayecto_id });
        showToast('Módulo específico actualizado');
      } else {
        await create('modulos', { nombre, anio, trayecto_id });
        showToast('Módulo específico creado');
      }
      overlay.remove();
      renderModulos();
    } catch (err) { showToast(err.message || 'Error', 'error'); }
  });
}

export default { renderModulos };
