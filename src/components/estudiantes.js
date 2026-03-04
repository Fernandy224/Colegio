// ============================================
// Gestión de Estudiantes (CRUD)
// ============================================
import { getContentArea, getPanelRight } from './layout.js';
import { icons, getInitials, stringToColor, showToast, createModal, confirmDialog, sanitize, validarDNI, formatDate } from '../utils/helpers.js';
import { fetchAll, create, update, remove, checkDniExists, searchMultipleFields, countByField } from '../utils/data.js';
import { getCurrentYear } from '../utils/state.js';

let searchTerm = '';

export async function renderEstudiantes() {
  const content = getContentArea();
  const panel = getPanelRight();
  const year = getCurrentYear();

  let allEstudiantes = searchTerm
    ? await searchMultipleFields('estudiantes', ['nombre', 'apellido', 'dni'], searchTerm)
    : await fetchAll('estudiantes');

  // Filtrar por año lectivo (año de ingreso)
  let estudiantes = allEstudiantes.filter(e => e.anio_ingreso === year);

  const totalActivos = estudiantes.filter(e => e.estado === 'Activo').length;
  const totalEgresados = estudiantes.filter(e => e.estado === 'Egresado').length;

  content.innerHTML = `
    <div class="section-header">
      <h1 class="section-title">Gestionar Estudiantes</h1>
      <div class="section-actions">
        <div class="search-bar">
          ${icons.search}
          <input type="text" id="search-estudiantes" placeholder="Buscar por nombre o DNI..." value="${sanitize(searchTerm)}" />
        </div>
        <button class="btn btn-add" id="btn-add-estudiante">
          ${icons.plus} Nuevo Estudiante
        </button>
      </div>
    </div>

    ${estudiantes.length === 0 ? `
      <div class="empty-state">
        ${icons.students}
        <h3 class="empty-state-title">${searchTerm ? 'Sin resultados' : 'No hay estudiantes'}</h3>
        <p class="empty-state-text">${searchTerm ? 'No se encontraron estudiantes con ese criterio.' : 'Agregá tu primer estudiante haciendo clic en "Nuevo Estudiante".'}</p>
      </div>
    ` : `
      <div class="cards-grid">
        ${estudiantes.map(est => `
          <div class="card" data-id="${est.id}">
            <div class="card-actions">
              <button class="card-action-btn edit-btn" data-id="${est.id}" title="Editar">${icons.edit}</button>
              <button class="card-action-btn delete card-action-btn-del" data-id="${est.id}" title="Eliminar">${icons.trash}</button>
            </div>
            <div class="card-avatar student" style="background: ${stringToColor(est.nombre + est.apellido)}">
              ${getInitials(est.nombre, est.apellido)}
            </div>
            <div class="card-name">${sanitize(est.nombre)} ${sanitize(est.apellido)}</div>
            <div class="card-subtitle">DNI: ${sanitize(est.dni)}</div>
            <div class="card-details">
              <div class="card-detail">
                <span class="card-detail-label">Ingreso</span>
                <span class="card-detail-value">${est.anio_ingreso}</span>
              </div>
              <div class="card-detail">
                <span class="card-detail-label">Estado</span>
                <span class="badge ${est.estado === 'Activo' ? 'badge-active' : est.estado === 'Egresado' ? 'badge-approved' : 'badge-inactive'}">${est.estado}</span>
              </div>
            </div>
          </div>
        `).join('')}
      </div>
    `}
  `;

  // Panel derecho
  panel.innerHTML = `
    <div class="widget">
      <div class="widget-header">
        <span class="widget-title">Resumen Estudiantes</span>
      </div>
      <div class="widget-bar">
        <div class="widget-bar-fill" style="width: ${estudiantes.length > 0 ? Math.round((totalActivos / (totalActivos + totalEgresados || 1)) * 100) : 0}%"></div>
      </div>
      <div class="widget-stats">
        <div class="widget-stat">
          <div class="widget-stat-value">${totalActivos}</div>
          <div class="widget-stat-label">Activos</div>
        </div>
        <div class="widget-stat">
          <div class="widget-stat-value">${totalEgresados}</div>
          <div class="widget-stat-label">Egresados</div>
        </div>
      </div>
    </div>
    <div class="widget widget-gradient">
      <div class="widget-header">
        <span class="widget-title">📋 Información</span>
      </div>
      <p style="font-size: 0.8125rem; color: var(--text-secondary); line-height: 1.5;">
        Hacé clic en una tarjeta para ver detalles. Usá los botones de editar y eliminar que aparecen al pasar el mouse.
      </p>
    </div>
  `;

  // Eventos
  document.getElementById('search-estudiantes')?.addEventListener('input', (e) => {
    searchTerm = e.target.value;
    renderEstudiantes();
  });

  document.getElementById('btn-add-estudiante')?.addEventListener('click', () => {
    openEstudianteModal();
  });

  content.querySelectorAll('.edit-btn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      const est = estudiantes.find(s => s.id === btn.dataset.id);
      if (est) openEstudianteModal(est);
    });
  });

  content.querySelectorAll('.card-action-btn-del').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const est = estudiantes.find(s => s.id === btn.dataset.id);
      if (est) {
        confirmDialog(
          `¿Estás seguro de eliminar a <strong>${sanitize(est.nombre)} ${sanitize(est.apellido)}</strong>?`,
          async () => {
            await remove('estudiantes', est.id);
            showToast('Estudiante eliminado');
            renderEstudiantes();
          }
        );
      }
    });
  });
}

function openEstudianteModal(estudiante = null) {
  const isEdit = !!estudiante;
  const title = isEdit ? 'Editar Estudiante' : 'Nuevo Estudiante';

  const formHTML = `
    <div class="form-row">
      <div class="form-group">
        <label class="form-label">Nombre</label>
        <input type="text" class="form-input" id="est-nombre" value="${isEdit ? sanitize(estudiante.nombre) : ''}" required placeholder="Nombre" />
      </div>
      <div class="form-group">
        <label class="form-label">Apellido</label>
        <input type="text" class="form-input" id="est-apellido" value="${isEdit ? sanitize(estudiante.apellido) : ''}" required placeholder="Apellido" />
      </div>
    </div>
    <div class="form-row">
      <div class="form-group">
        <label class="form-label">DNI</label>
        <input type="text" class="form-input" id="est-dni" value="${isEdit ? sanitize(estudiante.dni) : ''}" required placeholder="12345678" maxlength="8" />
      </div>
      <div class="form-group">
        <label class="form-label">Año de Ingreso</label>
        <input type="number" class="form-input" id="est-anio" value="${isEdit ? estudiante.anio_ingreso : getCurrentYear()}" required min="2000" max="2100" />
      </div>
    </div>
    <div class="form-group">
      <label class="form-label">Estado</label>
      <select class="form-select" id="est-estado">
        <option value="Activo" ${isEdit && estudiante.estado === 'Activo' ? 'selected' : ''}>Activo</option>
        <option value="Inactivo" ${isEdit && estudiante.estado === 'Inactivo' ? 'selected' : ''}>Inactivo</option>
        <option value="Egresado" ${isEdit && estudiante.estado === 'Egresado' ? 'selected' : ''}>Egresado</option>
      </select>
    </div>
  `;

  const footerHTML = `
    <button class="btn btn-secondary" id="modal-cancel">Cancelar</button>
    <button class="btn btn-primary" id="modal-save">${isEdit ? 'Guardar Cambios' : 'Crear Estudiante'}</button>
  `;

  const overlay = createModal(title, formHTML, footerHTML);

  overlay.querySelector('#modal-cancel').addEventListener('click', () => overlay.remove());

  overlay.querySelector('#modal-save').addEventListener('click', async () => {
    const nombre = document.getElementById('est-nombre').value.trim();
    const apellido = document.getElementById('est-apellido').value.trim();
    const rawDni = document.getElementById('est-dni').value.trim();
    const dni = rawDni.replace(/\D/g, ''); // Limpiar puntos, espacios, etc.
    const anio_ingreso = parseInt(document.getElementById('est-anio').value);
    const estado = document.getElementById('est-estado').value;

    if (!nombre || !apellido || !dni || !anio_ingreso) {
      showToast('Completá todos los campos obligatorios', 'error');
      return;
    }

    if (!validarDNI(dni)) {
      showToast('El DNI debe tener 7 u 8 dígitos numéricos', 'error');
      return;
    }

    const dniExists = await checkDniExists('estudiantes', dni, isEdit ? estudiante.id : null);
    if (dniExists) {
      showToast('Ya existe un estudiante con ese DNI', 'error');
      return;
    }

    try {
      if (isEdit) {
        await update('estudiantes', estudiante.id, { nombre, apellido, dni, anio_ingreso, estado });
        showToast('Estudiante actualizado');
      } else {
        await create('estudiantes', { nombre, apellido, dni, anio_ingreso, estado });
        showToast('Estudiante creado exitosamente');
      }
      overlay.remove();
      renderEstudiantes();
    } catch (err) {
      showToast(err.message || 'Error al guardar', 'error');
    }
  });
}

export default { renderEstudiantes };
