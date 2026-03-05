// ============================================
// Gestión de Usuarios — Solo Administrador
// Creación de usuarios via Edge Function (server-side)
// ============================================
import { getContentArea } from './layout.js';
import { getSupabase } from '../supabaseClient.js';
import { showToast, confirmDialog } from '../utils/helpers.js';
import { getCurrentUser } from './auth.js';

let usuarios = [];

export async function renderUsuarios() {
  const content = getContentArea();
  if (getCurrentUser()?.role !== 'administrador') {
    content.innerHTML = `
      <div style="padding:48px;text-align:center;">
        <div style="font-size:2.5rem;margin-bottom:12px;">🔒</div>
        <p style="color:var(--accent-red);font-size:1rem;font-weight:600;">Sin acceso</p>
        <p style="color:var(--text-muted);font-size:0.875rem;margin-top:8px;">Solo los administradores pueden gestionar usuarios.</p>
      </div>`;
    return;
  }

  content.innerHTML = `
    <div class="section-header">
      <h1 class="section-title">Gestión de Usuarios</h1>
      <div class="section-actions">
        <button class="btn btn-secondary" id="btn-refresh-usuarios">↻ Actualizar</button>
        <button class="btn btn-add" id="btn-crear-usuario">＋ Crear Usuario</button>
      </div>
    </div>

    <div style="background:rgba(139,92,246,0.06);border:1px solid rgba(139,92,246,0.2);border-radius:12px;padding:14px 18px;margin-bottom:24px;font-size:0.8125rem;color:var(--text-secondary);">
      🔒 <strong>Sistema cerrado:</strong> Los usuarios son creados exclusivamente por el administrador. No existe registro público.
    </div>

    <div id="usuarios-list" style="display:flex;flex-direction:column;gap:10px;max-width:860px;">
      <div style="color:var(--text-muted);text-align:center;padding:20px;">Cargando usuarios...</div>
    </div>
  `;

  await loadUsuarios();
  document.getElementById('btn-refresh-usuarios')?.addEventListener('click', loadUsuarios);
  document.getElementById('btn-crear-usuario')?.addEventListener('click', () => openCrearUsuarioModal());
}

async function loadUsuarios() {
  try {
    const { data, error } = await getSupabase()
      .from('perfiles')
      .select('id, nombre, rol, activo, email, created_at')
      .order('created_at', { ascending: false });

    if (error) throw error;
    usuarios = data || [];
    renderUsuariosList(usuarios);
  } catch (err) {
    console.error('Error loading users:', err);
    showToast('Error cargando usuarios: ' + err.message, 'error');
  }
}

function renderUsuariosList(list) {
  const container = document.getElementById('usuarios-list');
  if (!container) return;

  if (!list || list.length === 0) {
    container.innerHTML = `
      <div style="text-align:center;padding:40px;color:var(--text-muted);">
        <div style="font-size:2rem;margin-bottom:12px;">👤</div>
        <p>No hay usuarios. Creá el primero con el botón <strong>"Crear Usuario"</strong>.</p>
      </div>`;
    return;
  }

  const currentUserId = getCurrentUser()?.id;

  container.innerHTML = list.map(u => `
    <div style="display:flex;justify-content:space-between;align-items:center;padding:16px 18px;
      border:1px solid var(--border-color);border-radius:var(--radius-md);
      background:rgba(255,255,255,0.02);transition:background 0.2s;"
      onmouseover="this.style.background='rgba(255,255,255,0.04)'"
      onmouseout="this.style.background='rgba(255,255,255,0.02)'">
      <div style="display:flex;align-items:center;gap:14px;">
        <div style="width:40px;height:40px;border-radius:50%;background:var(--gradient-primary);
          display:flex;align-items:center;justify-content:center;font-weight:700;font-size:15px;color:white;flex-shrink:0;">
          ${(u.nombre || u.email || 'U').charAt(0).toUpperCase()}
        </div>
        <div>
          <div style="font-weight:600;color:var(--text-primary);margin-bottom:3px;">
            ${u.nombre || '<span style="color:var(--text-muted);font-style:italic;">Sin nombre</span>'}
            ${u.id === currentUserId ? '<span style="font-size:10px;color:var(--accent-purple-light);margin-left:6px;">(tu cuenta)</span>' : ''}
          </div>
          <div style="font-size:12px;color:var(--text-muted);">${u.email || 'Sin email'}</div>
          <div style="font-size:11px;margin-top:3px;">
            <span style="color:${u.rol === 'administrador' ? 'var(--accent-purple-light)' : 'var(--accent-blue)'}">
              ● ${u.rol}
            </span>
            &nbsp;&nbsp;
            <span style="color:${u.activo ? 'var(--accent-green)' : 'var(--accent-red)'}">
              ${u.activo ? '✓ Activo' : '✗ Inactivo'}
            </span>
          </div>
        </div>
      </div>
      <div style="display:flex;gap:8px;flex-shrink:0;">
        ${u.id !== currentUserId ? `
          ${u.rol !== 'administrador'
        ? `<button class="btn btn-secondary" style="padding:6px 12px;font-size:12px;" onclick="window.hacerAdmin('${u.id}')">→ Admin</button>`
        : `<button class="btn btn-secondary" style="padding:6px 12px;font-size:12px;" onclick="window.hacerProfesor('${u.id}')">→ Profesor</button>`
      }
          <button class="btn btn-secondary" style="padding:6px 12px;font-size:12px;color:var(--accent-purple-light);border-color:rgba(139,92,246,0.3);"
            onclick="window.resetearPassword('${u.id}', '${(u.nombre || u.email || '').replace(/'/g, '')}')">
            🔑 Nueva Contraseña
          </button>
          <button class="btn" style="padding:6px 12px;font-size:12px;
            background:${u.activo ? 'rgba(239,68,68,0.12)' : 'rgba(16,185,129,0.12)'};
            color:${u.activo ? 'var(--accent-red)' : 'var(--accent-green)'};
            border:1px solid ${u.activo ? 'rgba(239,68,68,0.3)' : 'rgba(16,185,129,0.3)'};"
            onclick="window.toggleActivo('${u.id}', ${!u.activo})">
            ${u.activo ? 'Desactivar' : 'Activar'}
          </button>
          <button class="btn" style="padding:6px 12px;font-size:12px;
            background:rgba(239,68,68,0.1);color:var(--accent-red);
            border:1px solid rgba(239,68,68,0.2);"
            onclick="window.eliminarUsuario('${u.id}', '${(u.nombre || u.email || '').replace(/'/g, '')}')">
            🗑 Eliminar
          </button>
        ` : '<span style="font-size:12px;color:var(--text-muted);padding:6px;">Tu cuenta</span>'}
      </div>
    </div>
  `).join('');
}


// Generar contraseña provisoria segura (para mostrarla al admin)
function generarPasswordProvisoria() {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  let pass = '';
  for (let i = 0; i < 10; i++) {
    pass += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return pass;
}

// ============================================
// Modal: Crear nuevo usuario (via Edge Function)
// ============================================
async function openCrearUsuarioModal() {
  const passProvisoria = generarPasswordProvisoria();

  // Cargar profesores sin cuenta vinculada
  let profesoresSinCuenta = [];
  try {
    const { data } = await getSupabase()
      .from('profesores').select('id, nombre, apellido, email')
      .is('auth_id', null)
      .order('apellido');
    profesoresSinCuenta = data || [];
  } catch (_) { }

  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = `
    <div class="modal" style="max-width:500px;">
      <div class="modal-header">
        <h2 class="modal-title">Crear Usuario</h2>
        <button class="modal-close" id="modal-close-btn">✕</button>
      </div>
      <div class="modal-body">
        <p style="font-size:0.8125rem;color:var(--text-muted);margin-bottom:16px;">
          La contraseña es provisoria — el usuario deberá cambiarla en su primer acceso.
        </p>
        <div class="form-group">
          <label class="form-label">Nombre completo</label>
          <input type="text" class="form-input" id="new-nombre" placeholder="Ej: María González" required />
        </div>
        <div class="form-group">
          <label class="form-label">Email institucional</label>
          <input type="email" class="form-input" id="new-email" placeholder="usuario@institución.edu" required />
        </div>
        <div class="form-group">
          <label class="form-label">Contraseña provisoria</label>
          <div style="display:flex;gap:8px;align-items:center;">
            <input type="text" class="form-input" id="new-password" value="${passProvisoria}"
              style="font-family:monospace;letter-spacing:1px;flex:1;" />
            <button type="button" class="btn btn-secondary" style="padding:8px 14px;flex-shrink:0;font-size:0.8rem;"
              onclick="navigator.clipboard.writeText(document.getElementById('new-password').value).then(()=>window.showToastGlobal?.('Copiado ✓'))">
              Copiar
            </button>
          </div>
          <p style="font-size:0.75rem;color:var(--accent-orange);margin-top:6px;">
            ⚠ Guardá esta contraseña — el usuario necesitará ingresarla en su primer acceso.
          </p>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Rol</label>
            <select class="form-select" id="new-rol">
              <option value="profesor">Profesor</option>
              <option value="administrador">Administrador</option>
              <option value="usuario">Usuario</option>
            </select>
          </div>
          <div class="form-group" style="justify-content:flex-end;">
            <label class="form-label">Estado</label>
            <div style="display:flex;align-items:center;gap:8px;margin-top:8px;">
              <input type="checkbox" id="new-activo" checked style="width:16px;height:16px;accent-color:var(--accent-green);" />
              <label for="new-activo" style="font-size:0.875rem;color:var(--text-primary);">Activo</label>
            </div>
          </div>
        </div>

        <!-- Sector dinámico: solo visible cuando rol = profesor -->
        <div id="profesor-link-section" style="display:none;margin-top:4px;">
          <div style="border-top:1px solid var(--border-color);padding-top:14px;margin-top:4px;">
          <div class="form-group">
            <label class="form-label">Vincular a Profesor existente <span style="color:var(--text-muted);font-size:0.75rem;">(opcional)</span></label>
            <select class="form-select" id="new-profesor-id">
              <option value="">— Crear nuevo registro de profesor —</option>
              ${profesoresSinCuenta.map(p => `
                <option value="${p.id}">${p.nombre} ${p.apellido}${p.email ? ' — ' + p.email : ''}</option>
              `).join('')}
            </select>
            <p style="font-size:0.75rem;color:var(--text-muted);margin-top:4px;">
              Si el profesor ya está en el sistema, seleccionalo para vincular su cuenta.
            </p>
          </div>
          </div>
        </div>
      </div>
      <div style="display:flex;justify-content:flex-end;gap:10px;margin-top:24px;">
        <button class="btn btn-secondary" id="modal-cancel-btn">Cancelar</button>
        <button class="btn btn-primary" id="modal-submit-btn">Crear Usuario</button>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);

  // Mostrar/ocultar sección de profesor según el rol seleccionado
  const rolSelect = overlay.querySelector('#new-rol');
  const profesorSection = overlay.querySelector('#profesor-link-section');
  rolSelect.addEventListener('change', () => {
    profesorSection.style.display = rolSelect.value === 'profesor' ? 'block' : 'none';
  });
  // Estado inicial (rol por defecto = profesor)
  profesorSection.style.display = 'block';

  overlay.querySelector('#modal-close-btn').addEventListener('click', () => overlay.remove());
  overlay.querySelector('#modal-cancel-btn').addEventListener('click', () => overlay.remove());

  overlay.querySelector('#modal-submit-btn').addEventListener('click', async () => {
    const btn = overlay.querySelector('#modal-submit-btn');
    const nombre = document.getElementById('new-nombre').value.trim();
    const email = document.getElementById('new-email').value.trim();
    const password = document.getElementById('new-password').value;
    const rol = document.getElementById('new-rol').value;
    const activo = document.getElementById('new-activo').checked;
    const profesor_id = document.getElementById('new-profesor-id')?.value || null;

    if (!nombre) { showToast('Ingresá el nombre', 'error'); return; }
    if (!email) { showToast('Ingresá el email', 'error'); return; }
    if (!password || password.length < 6) { showToast('La contraseña debe tener al menos 6 caracteres', 'error'); return; }

    btn.disabled = true;
    btn.textContent = 'Creando...';

    try {
      const body = { email, password, nombre, rol };
      if (rol === 'profesor' && profesor_id) body.profesor_id = profesor_id;

      // Obtener token de sesión fresco antes de llamar a la Edge Function
      const { data: { session } } = await getSupabase().auth.getSession();
      if (!session) throw new Error('Sesión expirada. Por favor, volvé a iniciar sesión.');

      const { data, error } = await getSupabase().functions.invoke('create-user', {
        body,
        headers: { Authorization: `Bearer ${session.access_token}` }
      });


      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      if (!activo && data?.user?.id) {
        await getSupabase().from('perfiles').update({ activo: false }).eq('id', data.user.id);
      }

      showToast(`✅ Usuario "${nombre}" creado. Compartí la contraseña provisoria.`);
      overlay.remove();
      loadUsuarios();
    } catch (err) {
      showToast(err.message || 'Error al crear usuario', 'error');
      btn.disabled = false;
      btn.textContent = 'Crear Usuario';
    }
  });
}


// ============================================
// Acciones globales (botones en HTML strings)
// ============================================
window.hacerAdmin = async (id) => {
  try {
    const { error } = await getSupabase().from('perfiles').update({ rol: 'administrador' }).eq('id', id);
    if (error) throw error;
    showToast('Rol actualizado a Administrador');
    loadUsuarios();
  } catch (err) { showToast('Error: ' + err.message, 'error'); }
};

window.hacerProfesor = async (id) => {
  try {
    const { error } = await getSupabase().from('perfiles').update({ rol: 'profesor' }).eq('id', id);
    if (error) throw error;
    showToast('Rol cambiado a Profesor');
    loadUsuarios();
  } catch (err) { showToast('Error: ' + err.message, 'error'); }
};

window.toggleActivo = async (id, nuevoEstado) => {
  try {
    const { error } = await getSupabase().from('perfiles').update({ activo: nuevoEstado }).eq('id', id);
    if (error) throw error;
    showToast(nuevoEstado ? 'Usuario activado' : 'Usuario desactivado — no podrá iniciar sesión');
    loadUsuarios();
  } catch (err) { showToast('Error: ' + err.message, 'error'); }
};

window.resetearPassword = async (userId, nombreUsuario) => {
  if (!confirm(`¿Estás seguro de que querés generar una nueva contraseña provisoria para "${nombreUsuario}"?\n\nEl usuario deberá cambiarla en su próximo inicio de sesión.`)) return;

  try {
    const { data: { session } } = await getSupabase().auth.getSession();
    if (!session) { showToast('Sesión expirada', 'error'); return; }

    const { data, error } = await getSupabase().functions.invoke('reset-user-password', {
      body: { user_id: userId },
      headers: { Authorization: `Bearer ${session.access_token}` }
    });

    if (error) throw error;
    if (data?.error) throw new Error(data.error);

    // Mostrar la nueva contraseña al admin
    const pass = data.nueva_password;
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
      <div class="modal" style="max-width:440px;">
        <div class="modal-header">
          <h3 class="modal-title">🔑 Nueva Contraseña Provisoria</h3>
          <button class="modal-close" id="reset-modal-close">✕</button>
        </div>
        <div class="modal-body">
          <p style="font-size:0.875rem;color:var(--text-secondary);margin-bottom:16px;">
            Se generó una nueva contraseña provisoria para <strong>${nombreUsuario}</strong>.
            El usuario deberá cambiarla al iniciar sesión.
          </p>
          <div style="background:rgba(139,92,246,0.1);border:1px solid rgba(139,92,246,0.3);border-radius:10px;padding:16px;text-align:center;margin-bottom:16px;">
            <div style="font-size:0.7rem;color:var(--text-muted);text-transform:uppercase;letter-spacing:1px;margin-bottom:8px;">Contraseña Provisoria</div>
            <code id="nueva-pass-text" style="font-size:1.5rem;font-weight:700;color:var(--accent-purple-light);letter-spacing:2px;">${pass}</code>
          </div>
          <button id="btn-copiar-pass" class="btn btn-primary" style="width:100%;">📋 Copiar Contraseña</button>
          <p style="font-size:0.75rem;color:var(--text-muted);text-align:center;margin-top:12px;">
            ⚠ Compartí esta contraseña de forma segura. No se puede recuperar después de cerrar esta ventana.
          </p>
        </div>
      </div>
    `;
    document.body.appendChild(modal);

    modal.querySelector('#reset-modal-close').addEventListener('click', () => modal.remove());
    modal.addEventListener('click', e => { if (e.target === modal) modal.remove(); });
    modal.querySelector('#btn-copiar-pass').addEventListener('click', () => {
      navigator.clipboard.writeText(pass).then(() => {
        showToast('Contraseña copiada al portapapeles');
        modal.querySelector('#btn-copiar-pass').textContent = '✓ Copiada';
      });
    });

  } catch (err) {
    showToast('Error: ' + err.message, 'error');
  }
};

window.eliminarUsuario = (userId, nombreUsuario) => {
  confirmDialog(
    `\u00bfEliminaci\u00f3n permanente de <strong>${nombreUsuario}</strong>?<br><span style="font-size:0.8rem;color:var(--text-muted)">Esta acci\u00f3n no se puede deshacer.</span>`,
    async () => {
      try {
        const { data: { session } } = await getSupabase().auth.getSession();
        if (!session) { showToast('Sesi\u00f3n expirada', 'error'); return; }

        const { data, error } = await getSupabase().functions.invoke('delete-user', {
          body: { user_id: userId },
          headers: { Authorization: `Bearer ${session.access_token}` }
        });

        if (error) throw error;
        if (data?.error) throw new Error(data.error);

        showToast(`\u2705 Usuario "${nombreUsuario}" eliminado.`);
        loadUsuarios();
      } catch (err) {
        console.error('[eliminarUsuario] Error:', err);
        showToast(err.message || 'Error al eliminar usuario', 'error');
      }
    }
  );
};

export default { renderUsuarios };
