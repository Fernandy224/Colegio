// ============================================
// Gestión de Profesores (CRUD)
// ============================================
import { getContentArea, getPanelRight } from './layout.js';
import { getSupabase } from '../supabaseClient.js';
import { icons, getInitials, stringToColor, showToast, createModal, confirmDialog, sanitize, validarDNI, formatDate } from '../utils/helpers.js';
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
              <button class="card-action-btn docs-btn" data-id="${prof.id}" title="Documentos">${icons.document}</button>
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

  content.querySelectorAll('.docs-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const prof = profesores.find(p => p.id === btn.dataset.id);
      if (prof) openDocsModal(prof);
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
    const rawDni = document.getElementById('prof-dni').value.trim();
    const dni = rawDni.replace(/\D/g, ''); // Limpiar puntos, espacios, etc.
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

// ============================================
// Gestión de Documentos
// ============================================
async function openDocsModal(profesor) {
  const title = `Documentación: ${profesor.nombre} ${profesor.apellido}`;

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
        .from('documentos_profesores')
        .select('*')
        .eq('profesor_id', profesor.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data.length === 0) {
        listContainer.innerHTML = `
                    <div style="text-align: center; padding: 40px; color: var(--text-muted);">
                        <div style="font-size: 2rem; margin-bottom: 10px;">📄</div>
                        <p>No hay documentos guardados para este profesor.</p>
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
                        <button class="card-action-btn delete-doc-btn" data-id="${doc.id}" data-path="${doc.url.split('documentos-profesores/')[1]}" style="padding: 6px; color: var(--accent-red);" title="Eliminar doc">
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
                .storage.from('documentos-profesores')
                .remove([filePath]);

              // 2. Eliminar de Database (aunque storage falle, para mantener integridad si el link esta roto)
              const { error: dbError } = await getSupabase()
                .from('documentos_profesores')
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
        const fileName = `${profesor.id}/${Date.now()}.${fileExt}`;

        // 1. Subir a Supabase Storage
        const { data: storageData, error: storageError } = await getSupabase()
          .storage.from('documentos-profesores')
          .upload(fileName, file);

        if (storageError) throw storageError;

        // 2. Obtener URL publica
        const { data: { publicUrl } } = getSupabase()
          .storage.from('documentos-profesores')
          .getPublicUrl(fileName);

        // 3. Guardar referencia en DB
        const { error: dbError } = await getSupabase()
          .from('documentos_profesores')
          .insert({
            profesor_id: profesor.id,
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

export default { renderProfesores };
