// ============================================
// Plantillas de Actas — Gestión de plantillas configurables
// ============================================
import { icons, showToast, createModal, sanitize } from '../utils/helpers.js';
import { fetchAll, create, update, remove } from '../utils/data.js';

// ============================================
// RENDER PRINCIPAL
// ============================================
export async function renderPlantillasActas() {
  const container = document.getElementById('content-area');
  container.innerHTML = `
    <div class="page-header">
      <div>
        <h1 class="page-title">📋 Plantillas de Actas</h1>
        <p class="page-subtitle">Diseñá y gestioná plantillas reutilizables para generar actas de evaluación.</p>
      </div>
      <button class="btn btn-add" id="btn-nueva-plantilla">
        ${icons.plus} Nueva Plantilla
      </button>
    </div>
    <div id="plantillas-grid" class="cards-grid">
      <div style="padding:40px;text-align:center;color:var(--text-muted);">Cargando...</div>
    </div>
  `;

  await loadPlantillas();

  container.querySelector('#btn-nueva-plantilla').addEventListener('click', () => {
    openPlantillaModal(null);
  });
}

// ============================================
// CARGAR Y RENDERIZAR LISTADO
// ============================================
async function loadPlantillas() {
  const grid = document.getElementById('plantillas-grid');
  try {
    const plantillas = await fetchAll('plantillas_actas');
    if (plantillas.length === 0) {
      grid.innerHTML = `
        <div class="empty-state" style="grid-column:1/-1;padding:60px 32px;">
          <div style="font-size:2.5rem;margin-bottom:16px;">📋</div>
          <h3 class="empty-state-title">Sin plantillas aún</h3>
          <p class="empty-state-text">Creá tu primera plantilla para poder generar actas personalizadas.</p>
        </div>`;
      return;
    }

    grid.innerHTML = plantillas.map(p => buildPlantillaCard(p)).join('');

    // Bind eventos
    grid.querySelectorAll('.btn-editar-plantilla').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const id = e.currentTarget.dataset.id;
        const plantilla = plantillas.find(p => p.id === id);
        if (plantilla) openPlantillaModal(plantilla);
      });
    });

    grid.querySelectorAll('.btn-eliminar-plantilla').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const id = e.currentTarget.dataset.id;
        const plantilla = plantillas.find(p => p.id === id);
        if (!plantilla) return;
        if (!confirm(`¿Eliminar la plantilla "${plantilla.nombre}"? Esta acción no se puede deshacer.`)) return;
        try {
          await remove('plantillas_actas', id);
          showToast('Plantilla eliminada');
          await loadPlantillas();
        } catch (err) {
          showToast('Error al eliminar: ' + err.message, 'error');
        }
      });
    });
  } catch (err) {
    grid.innerHTML = `<div style="padding:32px;color:var(--accent-red);">Error al cargar: ${err.message}</div>`;
  }
}

function buildPlantillaCard(p) {
  const caps = Array.isArray(p.capacidades) ? p.capacidades : [];
  const desemps = Array.isArray(p.desempenos) ? p.desempenos : [];
  return `
    <div class="card">
      <div class="card-header">
        <div style="display:flex;align-items:center;gap:12px;">
          <div style="width:40px;height:40px;border-radius:10px;background:var(--gradient-primary);display:flex;align-items:center;justify-content:center;font-size:1.2rem;flex-shrink:0;">📋</div>
          <div>
            <h3 class="card-title">${sanitize(p.nombre)}</h3>
            <div style="font-size:0.75rem;color:var(--text-muted);">
              ${caps.length} capacidad${caps.length !== 1 ? 'es' : ''} · ${desemps.length} desempeño${desemps.length !== 1 ? 's' : ''}
            </div>
          </div>
        </div>
        <div style="display:flex;gap:6px;">
          <button class="btn btn-secondary btn-editar-plantilla" data-id="${p.id}" style="padding:6px 12px;font-size:0.8rem;">
            ${icons.edit} Editar
          </button>
          <button class="btn btn-secondary btn-eliminar-plantilla" data-id="${p.id}" style="padding:6px 12px;font-size:0.8rem;color:var(--accent-red);">
            ${icons.trash}
          </button>
        </div>
      </div>

      ${caps.length > 0 ? `
        <div style="margin-top:12px;">
          <div style="font-size:0.7rem;font-weight:700;text-transform:uppercase;color:var(--text-muted);margin-bottom:6px;">Capacidades</div>
          <ul style="margin:0;padding-left:16px;font-size:0.8rem;color:var(--text-secondary);display:flex;flex-direction:column;gap:3px;">
            ${caps.slice(0, 3).map(c => `<li>${sanitize(c)}</li>`).join('')}
            ${caps.length > 3 ? `<li style="color:var(--text-muted);">+${caps.length - 3} más...</li>` : ''}
          </ul>
        </div>` : ''}

      ${desemps.length > 0 ? `
        <div style="margin-top:12px;">
          <div style="font-size:0.7rem;font-weight:700;text-transform:uppercase;color:var(--text-muted);margin-bottom:6px;">Desempeños</div>
          <div style="display:flex;flex-direction:column;gap:4px;">
            ${desemps.slice(0, 3).map(d => `
              <div style="font-size:0.78rem;color:var(--text-secondary);background:rgba(255,255,255,0.03);border:1px solid var(--border-color);border-radius:6px;padding:5px 8px;">
                ${sanitize(d)}
              </div>`).join('')}
            ${desemps.length > 3 ? `<div style="font-size:0.75rem;color:var(--text-muted);padding:4px 8px;">+${desemps.length - 3} más...</div>` : ''}
          </div>
        </div>` : ''}
    </div>`;
}

// ============================================
// MODAL CREAR / EDITAR PLANTILLA
// ============================================
function openPlantillaModal(plantilla = null) {
  const isEdit = !!plantilla;
  const caps = isEdit && Array.isArray(plantilla.capacidades) ? [...plantilla.capacidades] : [];
  const desemps = isEdit && Array.isArray(plantilla.desempenos) ? [...plantilla.desempenos] : [];
  const declaracion = isEdit && plantilla.declaracion ? plantilla.declaracion
    : 'Declaro haber sido informado/a de los resultados de mi evaluación final y haber recibido retroalimentación sobre mi desempeño durante el módulo.';

  const formHTML = buildModalForm(plantilla?.nombre || '', caps, desemps, declaracion);
  const footerHTML = `
    <button class="btn btn-secondary" id="modal-cancel">Cancelar</button>
    <button class="btn btn-add" id="modal-save">${icons.save} ${isEdit ? 'Guardar Cambios' : 'Crear Plantilla'}</button>
  `;

  const overlay = createModal(isEdit ? `Editar: ${plantilla.nombre}` : 'Nueva Plantilla de Acta', formHTML, footerHTML, 'max-width:700px;width:95vw;');

  // Bind dinámico de agregar/quitar ítems
  bindListEvents(overlay, 'capacidades', caps);
  bindListEvents(overlay, 'desempenos', desemps);

  overlay.querySelector('#modal-cancel').addEventListener('click', () => overlay.remove());

  overlay.querySelector('#modal-save').addEventListener('click', async () => {
    const nombre = overlay.querySelector('#plantilla-nombre').value.trim();
    if (!nombre) { showToast('Ingresá un nombre para la plantilla', 'error'); return; }

    const capsGuardar = getListItems(overlay, 'capacidades');
    const desempsGuardar = getListItems(overlay, 'desempenos');
    const declGuardar = overlay.querySelector('#plantilla-declaracion').value.trim();

    if (desempsGuardar.length === 0) {
      showToast('Agregá al menos un desempeño', 'error');
      return;
    }

    const btn = overlay.querySelector('#modal-save');
    btn.disabled = true;
    btn.textContent = 'Guardando...';

    try {
      const payload = {
        nombre,
        capacidades: capsGuardar,
        desempenos: desempsGuardar,
        declaracion: declGuardar || null
      };

      if (isEdit) {
        await update('plantillas_actas', plantilla.id, payload);
        showToast('Plantilla actualizada ✓');
      } else {
        await create('plantillas_actas', payload);
        showToast('Plantilla creada ✓');
      }

      overlay.remove();
      await loadPlantillas();
    } catch (err) {
      showToast('Error: ' + err.message, 'error');
      btn.disabled = false;
      btn.innerHTML = `${icons.save} ${isEdit ? 'Guardar Cambios' : 'Crear Plantilla'}`;
    }
  });
}

// ============================================
// HELPERS: BUILD FORM HTML
// ============================================
function buildModalForm(nombre, caps, desemps, declaracion) {
  return `
    <div style="display:flex;flex-direction:column;gap:16px;">
      <div class="form-group" style="margin:0;padding:0;">
        <label class="form-label">Nombre de la Plantilla *</label>
        <input type="text" class="form-input" id="plantilla-nombre" value="${sanitize(nombre)}" placeholder="Ej: Sector Dependiente, Seguridad..." />
      </div>

      <div>
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
          <label class="form-label" style="margin:0;">Capacidades para evaluar</label>
          <button class="btn btn-secondary btn-add-item" data-lista="capacidades" style="padding:4px 10px;font-size:0.75rem;">
            ${icons.plus} Agregar
          </button>
        </div>
        <div id="lista-capacidades" style="display:flex;flex-direction:column;gap:6px;">
          ${caps.map((c, i) => buildItemRow('capacidades', i, c)).join('')}
          ${caps.length === 0 ? `<div class="empty-list-msg" style="font-size:0.8rem;color:var(--text-muted);font-style:italic;">Sin capacidades aún. Hacé clic en Agregar.</div>` : ''}
        </div>
      </div>

      <div>
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
          <label class="form-label" style="margin:0;">Desempeños para evaluar *</label>
          <button class="btn btn-secondary btn-add-item" data-lista="desempenos" style="padding:4px 10px;font-size:0.75rem;">
            ${icons.plus} Agregar
          </button>
        </div>
        <div id="lista-desempenos" style="display:flex;flex-direction:column;gap:6px;">
          ${desemps.map((d, i) => buildItemRow('desempenos', i, d)).join('')}
          ${desemps.length === 0 ? `<div class="empty-list-msg" style="font-size:0.8rem;color:var(--text-muted);font-style:italic;">Sin desempeños aún. Hacé clic en Agregar.</div>` : ''}
        </div>
      </div>

      <div class="form-group" style="margin:0;padding:0;">
        <label class="form-label">Declaración del estudiante</label>
        <textarea class="form-input" id="plantilla-declaracion" rows="2" style="resize:vertical;">${sanitize(declaracion)}</textarea>
        <div style="font-size:0.7rem;color:var(--text-muted);margin-top:4px;">Aparece al pie del acta PDF.</div>
      </div>
    </div>
  `;
}

function buildItemRow(lista, idx, value = '') {
  return `
    <div class="item-row" data-lista="${lista}" data-idx="${idx}" style="display:flex;gap:8px;align-items:center;">
      <input type="text" class="form-input item-input" value="${sanitize(value)}" placeholder="Escribí aquí..." style="flex:1;padding:7px 10px;font-size:0.82rem;" />
      <button class="btn btn-secondary btn-remove-item" data-lista="${lista}" data-idx="${idx}" style="padding:6px 10px;color:var(--accent-red);flex-shrink:0;">
        ${icons.trash}
      </button>
    </div>`;
}

// ============================================
// BIND DE EVENTOS LISTA DINÁMICA
// ============================================
function bindListEvents(overlay, lista, arr) {
  const container = overlay.querySelector(`#lista-${lista}`);

  const rebuildList = () => {
    container.innerHTML = arr.map((item, i) => buildItemRow(lista, i, item)).join('');
    if (arr.length === 0) {
      container.innerHTML = `<div class="empty-list-msg" style="font-size:0.8rem;color:var(--text-muted);font-style:italic;">Sin elementos aún. Hacé clic en Agregar.</div>`;
    }
    bindRemoveEvents();
  };

  const bindRemoveEvents = () => {
    container.querySelectorAll('.btn-remove-item').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.dataset.idx);
        // Leer valor actual antes de quitar
        syncInputsToArr(container, arr);
        arr.splice(idx, 1);
        rebuildList();
      });
    });
  };

  overlay.querySelector(`[data-lista="${lista}"].btn-add-item`)?.addEventListener('click', () => {
    syncInputsToArr(container, arr);
    arr.push('');
    rebuildList();
    // Focus en el nuevo input
    const inputs = container.querySelectorAll('.item-input');
    inputs[inputs.length - 1]?.focus();
  });

  bindRemoveEvents();
}

function syncInputsToArr(container, arr) {
  container.querySelectorAll('.item-input').forEach((input, i) => {
    arr[i] = input.value;
  });
}

function getListItems(overlay, lista) {
  const container = overlay.querySelector(`#lista-${lista}`);
  const items = [];
  container.querySelectorAll('.item-input').forEach(input => {
    const val = input.value.trim();
    if (val) items.push(val);
  });
  return items;
}

// ============================================
// EXPORTAR FETCH DE PLANTILLA (para actas.js)
// ============================================
export async function fetchPlantillasActas() {
  return fetchAll('plantillas_actas');
}

export default { renderPlantillasActas, fetchPlantillasActas };
