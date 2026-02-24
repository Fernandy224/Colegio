// ============================================
// Gestión de Profesores (CRUD)
// ============================================
import { getContentArea, getPanelRight } from './layout.js';
import { icons, getInitials, stringToColor, showToast, createModal, confirmDialog, sanitize, validarDNI } from '../utils/helpers.js';
import { fetchAll, create, update, remove, checkDniExists, searchMultipleFields } from '../utils/data.js';

let searchTerm = '';

export async function renderProfesores() {
    const content = getContentArea();
    const panel = getPanelRight();

    let profesores = searchTerm
        ? await searchMultipleFields('profesores', ['nombre', 'apellido', 'dni', 'especialidad'], searchTerm)
        : await fetchAll('profesores');

    content.innerHTML = `
    <div class="section-header">
      <h1 class="section-title">Gestionar Profesores</h1>
      <div class="section-actions">
        <div class="search-bar">
          ${icons.search}
          <input type="text" id="search-profesores" placeholder="Buscar profesor..." value="${sanitize(searchTerm)}" />
        </div>
        <button class="btn btn-add" id="btn-add-profesor">
          ${icons.plus} Nuevo Profesor
        </button>
      </div>
    </div>

    ${profesores.length === 0 ? `
      <div class="empty-state">
        ${icons.professors}
        <h3 class="empty-state-title">${searchTerm ? 'Sin resultados' : 'No hay profesores'}</h3>
        <p class="empty-state-text">${searchTerm ? 'No se encontraron profesores.' : 'Agregá tu primer profesor.'}</p>
      </div>
    ` : `
      <div class="cards-grid">
        ${profesores.map(prof => `
          <div class="card" data-id="${prof.id}">
            <div class="card-actions">
              <button class="card-action-btn edit-btn" data-id="${prof.id}" title="Editar">${icons.edit}</button>
              <button class="card-action-btn delete card-action-btn-del" data-id="${prof.id}" title="Eliminar">${icons.trash}</button>
            </div>
            <div class="card-avatar professor" style="background: ${stringToColor(prof.nombre + prof.apellido)}">
              ${getInitials(prof.nombre, prof.apellido)}
            </div>
            <div class="card-name">${sanitize(prof.nombre)} ${sanitize(prof.apellido)}</div>
            <div class="card-subtitle">${sanitize(prof.especialidad || 'Sin especialidad')}</div>
            <div class="card-details">
              <div class="card-detail">
                <span class="card-detail-label">DNI</span>
                <span class="card-detail-value">${sanitize(prof.dni)}</span>
              </div>
              <div class="card-detail">
                <span class="card-detail-label">Email</span>
                <span class="card-detail-value" style="font-size: 0.7rem;">${sanitize(prof.email || '-')}</span>
              </div>
            </div>
          </div>
        `).join('')}
      </div>
    `}
  `;

    // Panel
    panel.innerHTML = `
    <div class="widget">
      <div class="widget-header">
        <span class="widget-title">Profesores</span>
      </div>
      <div class="widget-stats">
        <div class="widget-stat">
          <div class="widget-stat-value">${profesores.length}</div>
          <div class="widget-stat-label">Total registrados</div>
        </div>
      </div>
    </div>
    <div class="widget widget-gradient">
      <div class="widget-header">
        <span class="widget-title">👨‍🏫 Especialidades</span>
      </div>
      <div style="display: flex; flex-wrap: wrap; gap: 6px; margin-top: 8px;">
        ${[...new Set(profesores.map(p => p.especialidad).filter(Boolean))].map(esp =>
        `<span class="badge badge-active">${sanitize(esp)}</span>`
    ).join('') || '<span style="font-size: 0.8125rem; color: var(--text-muted);">Sin datos</span>'}
      </div>
    </div>
  `;

    // Eventos
    document.getElementById('search-profesores')?.addEventListener('input', (e) => {
        searchTerm = e.target.value;
        renderProfesores();
    });

    document.getElementById('btn-add-profesor')?.addEventListener('click', () => openProfesorModal());

    content.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const prof = profesores.find(p => p.id === btn.dataset.id);
            if (prof) openProfesorModal(prof);
        });
    });

    content.querySelectorAll('.card-action-btn-del').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const prof = profesores.find(p => p.id === btn.dataset.id);
            if (prof) {
                confirmDialog(`¿Eliminar a <strong>${sanitize(prof.nombre)} ${sanitize(prof.apellido)}</strong>?`, async () => {
                    await remove('profesores', prof.id);
                    showToast('Profesor eliminado');
                    renderProfesores();
                });
            }
        });
    });
}

function openProfesorModal(profesor = null) {
    const isEdit = !!profesor;
    const title = isEdit ? 'Editar Profesor' : 'Nuevo Profesor';

    const formHTML = `
    <div class="form-row">
      <div class="form-group">
        <label class="form-label">Nombre</label>
        <input type="text" class="form-input" id="prof-nombre" value="${isEdit ? sanitize(profesor.nombre) : ''}" required placeholder="Nombre" />
      </div>
      <div class="form-group">
        <label class="form-label">Apellido</label>
        <input type="text" class="form-input" id="prof-apellido" value="${isEdit ? sanitize(profesor.apellido) : ''}" required placeholder="Apellido" />
      </div>
    </div>
    <div class="form-row">
      <div class="form-group">
        <label class="form-label">DNI</label>
        <input type="text" class="form-input" id="prof-dni" value="${isEdit ? sanitize(profesor.dni) : ''}" required placeholder="12345678" maxlength="8" />
      </div>
      <div class="form-group">
        <label class="form-label">Especialidad</label>
        <input type="text" class="form-input" id="prof-especialidad" value="${isEdit ? sanitize(profesor.especialidad || '') : ''}" placeholder="Ej: Programación" />
      </div>
    </div>
    <div class="form-group">
      <label class="form-label">Email</label>
      <input type="email" class="form-input" id="prof-email" value="${isEdit ? sanitize(profesor.email || '') : ''}" placeholder="profesor@ejemplo.com" />
    </div>
  `;

    const footerHTML = `
    <button class="btn btn-secondary" id="modal-cancel">Cancelar</button>
    <button class="btn btn-primary" id="modal-save">${isEdit ? 'Guardar' : 'Crear Profesor'}</button>
  `;

    const overlay = createModal(title, formHTML, footerHTML);

    overlay.querySelector('#modal-cancel').addEventListener('click', () => overlay.remove());

    overlay.querySelector('#modal-save').addEventListener('click', async () => {
        const nombre = document.getElementById('prof-nombre').value.trim();
        const apellido = document.getElementById('prof-apellido').value.trim();
        const dni = document.getElementById('prof-dni').value.trim();
        const especialidad = document.getElementById('prof-especialidad').value.trim();
        const email = document.getElementById('prof-email').value.trim();

        if (!nombre || !apellido || !dni) {
            showToast('Completá nombre, apellido y DNI', 'error');
            return;
        }

        if (!validarDNI(dni)) {
            showToast('El DNI debe tener 7 u 8 dígitos', 'error');
            return;
        }

        const dniExists = await checkDniExists('profesores', dni, isEdit ? profesor.id : null);
        if (dniExists) {
            showToast('Ya existe un profesor con ese DNI', 'error');
            return;
        }

        try {
            if (isEdit) {
                await update('profesores', profesor.id, { nombre, apellido, dni, especialidad, email });
                showToast('Profesor actualizado');
            } else {
                await create('profesores', { nombre, apellido, dni, especialidad, email });
                showToast('Profesor creado exitosamente');
            }
            overlay.remove();
            renderProfesores();
        } catch (err) {
            showToast(err.message || 'Error al guardar', 'error');
        }
    });
}

export default { renderProfesores };
