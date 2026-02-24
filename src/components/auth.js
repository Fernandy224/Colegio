// ============================================
// Autenticación
// ============================================
import { isSupabaseConfigured, getSupabase } from '../supabaseClient.js';
import { showToast } from '../utils/helpers.js';

let currentUser = null;
let onAuthChange = null;

export function setAuthCallback(callback) {
    onAuthChange = callback;
}

export function getCurrentUser() {
    return currentUser;
}

export function renderAuth() {
    const app = document.getElementById('app');
    app.innerHTML = `
    <div class="auth-page">
      <div class="auth-card">
        <div class="auth-logo">GE</div>
        <h1 class="auth-title">Gestión Estudiantil</h1>
        <p class="auth-subtitle">Sistema de administración académica</p>

        <div id="auth-form-container">
          <form class="auth-form" id="login-form">
            <div class="form-group">
              <label class="form-label">Correo electrónico</label>
              <input type="email" class="form-input" id="auth-email" placeholder="usuario@ejemplo.com" required />
            </div>
            <div class="form-group">
              <label class="form-label">Contraseña</label>
              <input type="password" class="form-input" id="auth-password" placeholder="••••••••" required />
            </div>
            <button type="submit" class="btn btn-primary">Iniciar Sesión</button>
          </form>

          <div class="auth-divider"><span>o</span></div>

          <button class="btn btn-secondary" style="width:100%" id="demo-btn">
            Entrar en Modo Demo
          </button>

          <p class="auth-link" style="margin-top: 16px;">
            ¿No tenés cuenta? <a id="toggle-register">Registrate</a>
          </p>
        </div>
      </div>
    </div>
  `;

    // Login
    document.getElementById('login-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('auth-email').value;
        const password = document.getElementById('auth-password').value;

        if (isSupabaseConfigured()) {
            try {
                const { data, error } = await getSupabase().auth.signInWithPassword({ email, password });
                if (error) throw error;
                currentUser = data.user;
                showToast('Sesión iniciada correctamente');
                if (onAuthChange) onAuthChange(true);
            } catch (err) {
                showToast(err.message || 'Error al iniciar sesión', 'error');
            }
        } else {
            // Modo demo con cualquier credencial
            currentUser = { email, id: 'demo-user', role: 'administrador' };
            showToast('Sesión demo iniciada');
            if (onAuthChange) onAuthChange(true);
        }
    });

    // Demo
    document.getElementById('demo-btn').addEventListener('click', () => {
        currentUser = { email: 'demo@gestion.edu', id: 'demo-user', role: 'administrador' };
        showToast('Modo demo activado');
        if (onAuthChange) onAuthChange(true);
    });

    // Toggle registro
    document.getElementById('toggle-register').addEventListener('click', () => {
        renderRegister();
    });
}

function renderRegister() {
    const container = document.getElementById('auth-form-container');
    container.innerHTML = `
    <form class="auth-form" id="register-form">
      <div class="form-group">
        <label class="form-label">Nombre completo</label>
        <input type="text" class="form-input" id="reg-name" placeholder="Juan Pérez" required />
      </div>
      <div class="form-group">
        <label class="form-label">Correo electrónico</label>
        <input type="email" class="form-input" id="reg-email" placeholder="usuario@ejemplo.com" required />
      </div>
      <div class="form-group">
        <label class="form-label">Contraseña</label>
        <input type="password" class="form-input" id="reg-password" placeholder="Mínimo 6 caracteres" required minlength="6" />
      </div>
      <button type="submit" class="btn btn-primary">Crear Cuenta</button>
    </form>
    <p class="auth-link" style="margin-top: 16px;">
      ¿Ya tenés cuenta? <a id="toggle-login">Iniciá sesión</a>
    </p>
  `;

    document.getElementById('register-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('reg-name').value;
        const email = document.getElementById('reg-email').value;
        const password = document.getElementById('reg-password').value;

        if (isSupabaseConfigured()) {
            try {
                const { data, error } = await getSupabase().auth.signUp({ email, password, options: { data: { nombre: name } } });
                if (error) throw error;
                showToast('Cuenta creada. Revisá tu correo para confirmar.');
            } catch (err) {
                showToast(err.message || 'Error al registrar', 'error');
            }
        } else {
            currentUser = { email, id: 'demo-user', role: 'administrador', name };
            showToast('Cuenta demo creada');
            if (onAuthChange) onAuthChange(true);
        }
    });

    document.getElementById('toggle-login').addEventListener('click', () => {
        renderAuth();
    });
}

export function logout() {
    if (isSupabaseConfigured()) {
        getSupabase().auth.signOut();
    }
    currentUser = null;
    if (onAuthChange) onAuthChange(false);
}

export default { renderAuth, getCurrentUser, setAuthCallback, logout };
