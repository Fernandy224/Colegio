// ============================================
// Autenticación — Sin registro público
// ============================================
import { isSupabaseConfigured, getSupabase } from '../supabaseClient.js';
import { showToast } from '../utils/helpers.js';
import { setSupabaseSession } from '../utils/data.js';

let currentUser = null;
let onAuthChange = null;

// ============================================
// Helper: cargar perfil desde Supabase
// ============================================
async function loadPerfil(userId) {
  const { data: profile, error } = await getSupabase()
    .from('perfiles')
    .select('rol, activo, nombre, email, must_change_password')
    .eq('id', userId)
    .single();

  if (error) throw new Error('Error al cargar perfil de usuario.');
  if (!profile.activo) {
    await getSupabase().auth.signOut();
    throw new Error('Tu cuenta está inactiva. Contactá al administrador.');
  }
  return profile;
}

// ============================================
// Exports principales
// ============================================
export function setAuthCallback(callback) {
  onAuthChange = callback;
}

export function getCurrentUser() {
  return currentUser;
}

// ============================================
// Inicializar: detectar sesión existente
// ============================================
export function initAuth() {
  if (!isSupabaseConfigured()) return;

  const supabase = getSupabase();

  supabase.auth.onAuthStateChange(async (event, session) => {
    console.log('Session event:', event, session?.user?.email);

    if (event === 'SIGNED_IN' && session?.user) {
      try {
        const profile = await loadPerfil(session.user.id);
        currentUser = {
          id: session.user.id,
          email: session.user.email,
          role: profile.rol,
          name: profile.nombre || session.user.email,
        };
        setSupabaseSession(true);

        // Si debe cambiar contraseña → mostrar pantalla de cambio
        if (profile.must_change_password) {
          renderCambiarPassword(session.user.id);
          return;
        }

        if (onAuthChange) onAuthChange(true);
      } catch (err) {
        showToast(err.message, 'error');
        currentUser = null;
        setSupabaseSession(false);
        if (onAuthChange) onAuthChange(false);
      }
    } else if (event === 'SIGNED_OUT') {
      currentUser = null;
      setSupabaseSession(false);
      if (onAuthChange) onAuthChange(false);
    }
  });
}

// ============================================
// Render: pantalla de login (sin registro)
// ============================================
export function renderAuth() {
  const app = document.getElementById('app');
  app.innerHTML = `
    <div class="auth-page">
      <div class="auth-card">
        <div class="auth-logo">
          <img src="/logo.png" alt="Seguimiento Integral de FP"
            style="width:80px;height:80px;object-fit:cover;border-radius:16px;box-shadow:0 8px 24px rgba(0,0,0,0.3);" />
        </div>

        <h1 class="auth-title">Seguimiento Integral de FP</h1>
        <p class="auth-subtitle">Sistema administrativo institucional</p>

        <form class="auth-form" id="login-form">
          <div class="form-group">
            <label class="form-label">Correo electrónico</label>
            <input type="email" class="form-input" id="auth-email" placeholder="usuario@institución.edu" required />
          </div>
          <div class="form-group">
            <label class="form-label">Contraseña</label>
            <input type="password" class="form-input" id="auth-password" placeholder="••••••••" required />
          </div>
          <button type="submit" class="btn btn-primary" id="btn-login">Iniciar Sesión</button>
          <div style="text-align:right;margin-top:8px;">
            <a href="#" id="link-forgot-password" style="font-size:0.78rem;color:var(--text-muted);text-decoration:none;transition:color 0.2s;" onmouseover="this.style.color='var(--accent-purple-light)'" onmouseout="this.style.color='var(--text-muted)'">¿Olvidaste tu contraseña?</a>
          </div>
        </form>

        <div class="auth-divider"><span>o</span></div>

        <button class="btn btn-google" id="google-login-btn" style="width: 100%; display: flex; align-items: center; justify-content: center; gap: 10px;">
          <svg width="18" height="18" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.6 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34.1 6.7 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20c11 0 20-9 20-20 0-1.2-.1-2.4-.4-3.5z"/><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.6 16 19 13 24 13c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34.1 6.7 29.3 4 24 4 16.3 4 9.6 8.3 6.3 14.7z"/><path fill="#4CAF50" d="M24 44c5.2 0 9.9-1.9 13.5-5.1l-6.2-5.2C29.4 35.5 26.8 36 24 36c-5.2 0-9.7-3.4-11.3-8H6.5C9.7 36.3 16.3 44 24 44z"/><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.2-4.4 5.5l6.2 5.2C41.4 35.4 44 30 44 24c0-1.2-.1-2.4-.4-3.5z"/></svg>
          Iniciar con Google
        </button>

        <p style="text-align:center; margin-top: 20px; font-size: 0.8rem; color: var(--text-muted);">
          🔒 Sistema institucional cerrado. Las cuentas son creadas por el administrador.
        </p>
      </div>
    </div>
  `;

  // Login con email + contraseña
  document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = document.getElementById('btn-login');
    const email = document.getElementById('auth-email').value.trim();
    const password = document.getElementById('auth-password').value;

    btn.disabled = true;
    btn.textContent = 'Ingresando...';

    try {
      const { error } = await getSupabase().auth.signInWithPassword({ email, password });
      if (error) throw error;
      // onAuthStateChange maneja el resto
    } catch (err) {
      const msg = err.message?.includes('Invalid login')
        ? 'Email o contraseña incorrectos'
        : (err.message || 'Error al iniciar sesión');
      showToast(msg, 'error');
      btn.disabled = false;
      btn.textContent = 'Iniciar Sesión';
    }
  });

  // Google OAuth
  document.getElementById('google-login-btn').addEventListener('click', async () => {
    try {
      const { error } = await getSupabase().auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: window.location.origin }
      });
      if (error) throw error;
    } catch (err) {
      showToast(err.message || 'Error al iniciar con Google', 'error');
    }
  });

  // Recuperar contraseña
  document.getElementById('link-forgot-password')?.addEventListener('click', async (e) => {
    e.preventDefault();
    const email = document.getElementById('auth-email').value.trim();
    if (!email) {
      showToast('Ingresá tu email primero en el campo de arriba', 'error');
      document.getElementById('auth-email').focus();
      return;
    }
    try {
      const { error } = await getSupabase().auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + window.location.pathname
      });
      if (error) throw error;
      showToast(`\u2705 Enviamos un email a ${email} con el enlace para restablecer tu contrase\u00f1a.`);
    } catch (err) {
      showToast(err.message || 'Error al enviar el email', 'error');
    }
  });
}

// ============================================
// Pantalla de cambio de contraseña obligatorio (primer login)
// ============================================
function renderCambiarPassword(userId) {
  const app = document.getElementById('app');
  app.innerHTML = `
    <div class="auth-page">
      <div class="auth-card">
        <div style="text-align:center;margin-bottom:20px;">
          <div style="font-size:2.5rem;margin-bottom:8px;">🔐</div>
          <h2 style="font-size:1.4rem;font-weight:700;color:var(--text-primary);">Cambio de contraseña requerido</h2>
          <p style="color:var(--text-muted);font-size:0.875rem;margin-top:8px;line-height:1.5;">
            Es tu primer ingreso. Debés establecer una contraseña personal<br>antes de continuar.
          </p>
        </div>
        <div class="form-group">
          <label class="form-label">Nueva contraseña</label>
          <input type="password" class="form-input" id="new-pass" placeholder="Mínimo 8 caracteres" minlength="8" />
        </div>
        <div class="form-group">
          <label class="form-label">Confirmar contraseña</label>
          <input type="password" class="form-input" id="confirm-pass" placeholder="Repetí la contraseña" />
        </div>
        <button class="btn btn-primary" id="btn-cambiar-pass" style="width:100%;margin-top:8px;">
          Establecer contraseña y entrar
        </button>
      </div>
    </div>
  `;

  document.getElementById('btn-cambiar-pass').addEventListener('click', async () => {
    const btn = document.getElementById('btn-cambiar-pass');
    const newPass = document.getElementById('new-pass').value;
    const confirmPass = document.getElementById('confirm-pass').value;

    if (!newPass || newPass.length < 8) {
      showToast('La contraseña debe tener al menos 8 caracteres', 'error');
      return;
    }
    if (newPass !== confirmPass) {
      showToast('Las contraseñas no coinciden', 'error');
      return;
    }

    btn.disabled = true;
    btn.textContent = 'Guardando...';

    try {
      // Actualizar contraseña en Supabase Auth
      const { error: passError } = await getSupabase().auth.updateUser({ password: newPass });
      if (passError) throw passError;

      // Marcar must_change_password = false
      const { error: profileError } = await getSupabase()
        .from('perfiles')
        .update({ must_change_password: false })
        .eq('id', userId);
      if (profileError) throw profileError;

      showToast('✅ Contraseña establecida. ¡Bienvenido!');

      // Avanzar al dashboard
      if (onAuthChange) onAuthChange(true);
    } catch (err) {
      showToast(err.message || 'Error al cambiar la contraseña', 'error');
      btn.disabled = false;
      btn.textContent = 'Establecer contraseña y entrar';
    }
  });
}

// ============================================
// Logout
// ============================================
export async function logout() {
  await getSupabase().auth.signOut();
}

export default { renderAuth, getCurrentUser, setAuthCallback, logout, initAuth };
