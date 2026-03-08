// ============================================
// Reset Password Page
// ============================================
import { getSupabase } from '../supabaseClient.js';
import { showToast } from '../utils/helpers.js';

export function renderResetPassword() {
    const app = document.getElementById('app');
    app.innerHTML = `
    <div class="auth-page">
      <div class="auth-card">
        <div style="text-align:center;margin-bottom:20px;">
          <div style="font-size:2.5rem;margin-bottom:8px;">🔐</div>
          <h2 style="font-size:1.4rem;font-weight:700;color:var(--text-primary);">Crear nueva contraseña</h2>
          <p style="color:var(--text-muted);font-size:0.875rem;margin-top:8px;line-height:1.5;">
            Por favor, ingresá tu nueva contraseña.
          </p>
        </div>
        <div class="form-group">
          <label class="form-label">Nueva contraseña</label>
          <input type="password" class="form-input" id="reset-new-pass" placeholder="Mínimo 8 caracteres" minlength="8" />
        </div>
        <div class="form-group">
          <label class="form-label">Confirmar contraseña</label>
          <input type="password" class="form-input" id="reset-confirm-pass" placeholder="Repetí la contraseña" />
        </div>
        <button class="btn btn-primary" id="btn-update-pass" style="width:100%;margin-top:8px;">
          Actualizar contraseña
        </button>
      </div>
    </div>
  `;

    document.getElementById('btn-update-pass').addEventListener('click', async () => {
        const btn = document.getElementById('btn-update-pass');
        const newPass = document.getElementById('reset-new-pass').value;
        const confirmPass = document.getElementById('reset-confirm-pass').value;

        if (!newPass || newPass.length < 8) {
            showToast('La contraseña debe tener al menos 8 caracteres', 'error');
            return;
        }
        if (newPass !== confirmPass) {
            showToast('Las contraseñas no coinciden', 'error');
            return;
        }

        btn.disabled = true;
        btn.textContent = 'Actualizando...';

        try {
            const { error } = await getSupabase().auth.updateUser({ password: newPass });
            if (error) throw error;

            showToast('✅ Contraseña actualizada correctamente.', 'success');

            // Redirect to dashboard or login
            setTimeout(() => {
                window.location.hash = 'dashboard';
                window.location.reload();
            }, 2000);

        } catch (err) {
            showToast(err.message || 'Error al actualizar la contraseña', 'error');
            btn.disabled = false;
            btn.textContent = 'Actualizar contraseña';
        }
    });
}
