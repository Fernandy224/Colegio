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
          <div class="card student-card" data-id="${est.id}" style="cursor: pointer;">
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

  content.querySelectorAll('.student-card').forEach(card => {
    card.addEventListener('click', () => {
      openPerfilEstudiante(card.dataset.id);
    });
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
    <div class="form-row">
      <div class="form-group">
        <label class="form-label">Género</label>
        <select class="form-select" id="est-genero">
          <option value="" ${!isEdit || !estudiante.genero ? 'selected' : ''}>Seleccionar...</option>
          <option value="Masculino" ${isEdit && estudiante.genero === 'Masculino' ? 'selected' : ''}>Masculino</option>
          <option value="Femenino" ${isEdit && estudiante.genero === 'Femenino' ? 'selected' : ''}>Femenino</option>
          <option value="Otro" ${isEdit && estudiante.genero === 'Otro' ? 'selected' : ''}>Otro</option>
        </select>
      </div>
      <div class="form-group">
        <label class="form-label">Estado</label>
        <select class="form-select" id="est-estado">
          <option value="Activo" ${isEdit && estudiante.estado === 'Activo' ? 'selected' : ''}>Activo</option>
          <option value="Inactivo" ${isEdit && estudiante.estado === 'Inactivo' ? 'selected' : ''}>Inactivo</option>
          <option value="Egresado" ${isEdit && estudiante.estado === 'Egresado' ? 'selected' : ''}>Egresado</option>
        </select>
      </div>
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
    const genero = document.getElementById('est-genero').value || null;

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
        await update('estudiantes', estudiante.id, { nombre, apellido, dni, anio_ingreso, estado, genero });
        showToast('Estudiante actualizado');
      } else {
        await create('estudiantes', { nombre, apellido, dni, anio_ingreso, estado, genero });
        showToast('Estudiante creado exitosamente');
      }
      overlay.remove();
      renderEstudiantes();
    } catch (err) {
      showToast(err.message || 'Error al guardar', 'error');
    }
  });
}

async function openPerfilEstudiante(estudianteId) {
  const [estudiante, inscripciones, allActas, trayectos, submodulos] = await Promise.all([
    fetchAll('estudiantes', { eq: { id: estudianteId } }).then(res => res[0]),
    fetchAll('inscripciones', { eq: { estudiante_id: estudianteId } }),
    fetchAll('actas', { eq: { estudiante_id: estudianteId } }),
    fetchAll('trayectos_formativos'),
    fetchAll('submodulos')
  ]);

  if (!estudiante) return;

  const actasAsociadas = allActas;

  const contentHTML = `
    <div style="display: flex; flex-direction: column; gap: 20px;">
      <div style="display: flex; align-items: center; gap: 16px; padding-bottom: 20px; border-bottom: 1px solid var(--border-color);">
        <div class="card-avatar student" style="width: 64px; height: 64px; font-size: 1.5rem; background: ${stringToColor(estudiante.nombre + estudiante.apellido)}">
          ${getInitials(estudiante.nombre, estudiante.apellido)}
        </div>
        <div>
          <h2 style="margin: 0; font-size: 1.5rem;">${sanitize(estudiante.nombre)} ${sanitize(estudiante.apellido)}</h2>
          <p style="margin: 4px 0 0; color: var(--text-muted);">DNI: ${sanitize(estudiante.dni)} · Ingreso: ${estudiante.anio_ingreso}</p>
        </div>
      </div>

      <div class="content-tabs" style="margin-bottom: 0;">
        <button class="content-tab active" id="tab-btn-docs">📂 Documentación</button>
        <button class="content-tab" id="tab-btn-trayectos">📚 Trayectos</button>
      </div>

      <div id="perfil-tab-content" style="min-height: 200px;">
        <!-- Se cargará por defecto la pestaña de Documentación -->
      </div>
    </div>
  `;

  const overlay = createModal(`Perfil del Estudiante`, contentHTML, '', '650px');
  const tabContent = overlay.querySelector('#perfil-tab-content');

  const renderDocs = () => {
    if (actasAsociadas.length === 0) {
      tabContent.innerHTML = `
        <div style="padding: 40px; text-align: center; color: var(--text-muted);">
          <div style="font-size: 2.5rem; margin-bottom: 10px;">📄</div>
          <p>No hay documentación registrada para este estudiante.</p>
          <p style="font-size:0.78rem;margin-top:4px;">Los documentos se registran automáticamente al generar actas.</p>
        </div>
      `;
      return;
    }

    // Ordenar por fecha más reciente primero
    const actasOrdenadas = [...actasAsociadas].sort((a, b) => {
      return new Date(b.fecha || b.created_at || 0) - new Date(a.fecha || a.created_at || 0);
    });

    tabContent.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 8px; margin-top: 14px;">
        ${actasOrdenadas.map(acta => {
          const trayecto = trayectos.find(t => t.id === acta.grupo_id);
          const submodulo = acta.submodulo_id ? submodulos.find(s => s.id === acta.submodulo_id) : null;
          const condicion = acta.descripcion?.toUpperCase();
          const condicionColor = condicion === 'APROBADO' ? '#10b981' : condicion === 'DESAPROBADO' ? '#ef4444' : 'var(--text-muted)';
          const condicionBg = condicion === 'APROBADO' ? 'rgba(16,185,129,0.12)' : condicion === 'DESAPROBADO' ? 'rgba(239,68,68,0.12)' : 'rgba(255,255,255,0.05)';
          const fechaStr = acta.fecha ? formatDate(acta.fecha) : (acta.created_at ? formatDate(acta.created_at) : '');

          return `
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px 16px; background: rgba(255,255,255,0.03); border: 1px solid var(--border-color); border-radius: 10px; gap: 12px;">
              <div style="display: flex; align-items: center; gap: 12px; flex: 1; min-width: 0;">
                <div style="color: var(--accent-purple-light); flex-shrink: 0;">${icons.document}</div>
                <div style="min-width:0;">
                  <div style="font-weight: 600; font-size: 0.88rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${sanitize(acta.nombre)}</div>
                  <div style="font-size: 0.73rem; color: var(--text-muted); margin-top: 2px;">
                    ${submodulo ? sanitize(submodulo.nombre) : ''}${submodulo && trayecto ? ' · ' : ''}${trayecto ? sanitize(trayecto.nombre) : ''}${fechaStr ? ` · ${fechaStr}` : ''}
                  </div>
                </div>
              </div>
              <div style="display:flex; align-items:center; gap: 8px; flex-shrink: 0;">
                ${condicion ? `<span style="font-size:0.72rem;font-weight:700;padding:3px 9px;border-radius:999px;background:${condicionBg};color:${condicionColor};border:1px solid ${condicionColor}33;">${condicion}</span>` : ''}
                <span style="font-size:0.68rem;padding:3px 8px;border-radius:999px;background:rgba(139,92,246,0.1);color:var(--accent-purple-light);">Acta</span>
                <button class="btn-eliminar-acta" data-actaid="${acta.id}" title="Eliminar este documento"
                  style="background:rgba(239,68,68,0.1);color:#ef4444;border:1px solid rgba(239,68,68,0.3);border-radius:6px;padding:3px 8px;cursor:pointer;display:flex;align-items:center;transition:all 0.2s;width:28px;height:28px;justify-content:center;">
                  ${icons.trash}
                </button>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;

    // Eventos de eliminar
    tabContent.querySelectorAll('.btn-eliminar-acta').forEach(btn => {
      btn.addEventListener('mouseenter', () => { btn.style.background = 'rgba(239,68,68,0.25)'; btn.style.borderColor = 'rgba(239,68,68,0.6)'; });
      btn.addEventListener('mouseleave', () => { btn.style.background = 'rgba(239,68,68,0.1)'; btn.style.borderColor = 'rgba(239,68,68,0.3)'; });
      btn.addEventListener('click', () => {
        const actaId = btn.dataset.actaid;
        confirmDialog('¿Eliminar este documento del historial? <br><small style="color:var(--text-muted)">Esta acción no se puede deshacer.</small>', async () => {
          try {
            await remove('actas', actaId);
            // Actualizar el array local y re-renderizar sin cerrar el modal
            const idx = actasAsociadas.findIndex(a => a.id === actaId);
            if (idx !== -1) actasAsociadas.splice(idx, 1);
            renderDocs();
            showToast('Documento eliminado correctamente.');
          } catch (err) {
            showToast('Error al eliminar: ' + (err.message || 'Intente nuevamente.'), 'error');
          }
        });
      });
    });
  };

  const renderTrayectos = () => {
    if (inscripciones.length === 0) {
      tabContent.innerHTML = `<div style="padding: 40px; text-align: center; color: var(--text-muted);">No está inscripto en ningún trayecto.</div>`;
      return;
    }

    tabContent.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 10px; margin-top: 16px;">
        ${inscripciones.map(i => {
          const t = trayectos.find(tray => tray.id === i.trayecto_id);
          return `
            <div style="padding: 12px 16px; background: rgba(255,255,255,0.03); border: 1px solid var(--border-color); border-radius: 10px; display: flex; justify-content: space-between; align-items: center;">
              <div>
                <div style="font-weight: 600;">${sanitize(t?.nombre || 'Desconocido')}</div>
                <div style="font-size: 0.75rem; color: var(--text-muted);">Estado: ${i.estado} · Inscrito el ${formatDate(i.fecha_inscripcion)}</div>
              </div>
              <span class="badge ${i.estado === 'Activo' || i.estado === 'Regular' ? 'badge-active' : 'badge-approved'}">${i.estado}</span>
            </div>
          `;
        }).join('')}
      </div>
    `;
  };

  overlay.querySelector('#tab-btn-docs').addEventListener('click', (e) => {
    overlay.querySelectorAll('.content-tab').forEach(t => t.classList.remove('active'));
    e.target.classList.add('active');
    renderDocs();
  });

  overlay.querySelector('#tab-btn-trayectos').addEventListener('click', (e) => {
    overlay.querySelectorAll('.content-tab').forEach(t => t.classList.remove('active'));
    e.target.classList.add('active');
    renderTrayectos();
  });

  renderDocs(); // Cargar por defecto
}

export default { renderEstudiantes };
