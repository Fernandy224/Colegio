// ============================================
// Main - Punto de entrada
// ============================================
import './styles/index.css';
import { renderLayout } from './components/layout.js';
import { renderAuth, setAuthCallback, getCurrentUser, initAuth } from './components/auth.js';
import { renderDashboard } from './components/dashboard.js';
import { renderEstudiantes } from './components/estudiantes.js';
import { renderProfesores } from './components/profesores.js';
import { renderTrayectos } from './components/trayectos.js';
import { renderModulos } from './components/modulos.js';
import { renderSubmodulos } from './components/submodulos.js';
import { renderAprobaciones } from './components/aprobaciones.js';
import { renderReportes } from './components/reportes.js';
import { renderUsuarios } from './components/usuarios.js';
import { renderResetPassword } from './components/reset-password.js';
import { registerRoute, initRouter, setOnRouteChange } from './router.js';
import { isSupabaseConfigured } from './supabaseClient.js';


let appStarted = false; // Guard: evita doble inicialización

// Manejador global de errores para diagnóstico
window.onerror = function (msg, url, lineNo, columnNo, error) {
    console.error('CRITICAL:', msg, url, lineNo, error);
    const app = document.getElementById('app');
    if (app) {
        app.innerHTML = `
            <div style="background:#0a0b14; color:#ef4444; padding:40px; font-family:sans-serif; min-height:100vh; display:flex; flex-direction:column; align-items:center; justify-content:center; text-align:center;">
                <div style="font-size:3rem; margin-bottom:20px;">⚠️</div>
                <h1 style="margin-bottom:10px;">Error Crítico de Carga</h1>
                <p style="color:#8b8da3; max-width:500px; margin-bottom:30px;">
                    El sistema encontró un error al iniciar. Esto puede deberse a datos antiguos en el navegador o a un problema de conexión.
                </p>
                <div style="background:rgba(255,255,255,0.05); padding:15px; border-radius:8px; font-family:monospace; font-size:0.8rem; margin-bottom:30px; text-align:left; border:1px solid rgba(239,68,68,0.2);">
                    ${msg}
                </div>
                <button onclick="localStorage.clear(); sessionStorage.clear(); location.reload();" 
                    style="background:linear-gradient(135deg, #8b5cf6, #3b82f6); color:white; padding:12px 24px; border:none; border-radius:99px; font-weight:700; cursor:pointer; box-shadow:0 4px 15px rgba(139,92,246,0.4);">
                    Limpiar Cache y Reiniciar Sistema
                </button>
            </div>
        `;
    }
    return false;
};

function init() {
    // Registro de rutas
    registerRoute('dashboard', renderDashboard);
    registerRoute('estudiantes', renderEstudiantes);
    registerRoute('profesores', renderProfesores);
    registerRoute('trayectos', renderTrayectos);
    registerRoute('modulos', renderModulos);
    registerRoute('submodulos', renderSubmodulos);
    registerRoute('aprobaciones', renderAprobaciones);
    registerRoute('reportes', renderReportes);
    registerRoute('usuarios', renderUsuarios);

    // Utilidad global
    window.limpiarTodo = () => {
        localStorage.clear();
        sessionStorage.clear();
        location.reload();
    };

    // Callback de autenticación
    setAuthCallback((authenticated) => {
        if (authenticated) {
            startApp();
        } else {
            appStarted = false;
            renderAuth();
        }
    });

    // Estado inicial: Cargando
    const app = document.getElementById('app');
    if (app) {
        app.innerHTML = `<div style="background:#0a0b14;height:100vh;display:flex;align-items:center;justify-content:center;color:#8b8da3;font-family:sans-serif;font-size:0.9rem;">Cargando sistema...</div>`;
    }

    if (isSupabaseConfigured()) {
        initAuth();

        // Safety timeout
        setTimeout(() => {
            if (!appStarted) {
                const app = document.getElementById('app');
                // Buscamos "sistema" que es lo que realmente pusimos arriba
                if (app && app.innerText.includes('sistema')) {
                    app.innerHTML += `
                        <div style="margin-top:20px; position:absolute; bottom:20%; left:50%; transform:translateX(-50%); z-index:1000;">
                            <button onclick="window.limpiarTodo()" class="btn btn-secondary" style="background:#ef4444; color:white; border:none; padding:12px 24px; box-shadow:0 4px 15px rgba(239,68,68,0.4);">
                                Limpiar Cache y Reiniciar APP
                            </button>
                        </div>
                    `;
                }
            }
        }, 22000);
    } else {
        renderAuth();
    }
}

function startApp() {
    if (appStarted) return;
    appStarted = true;
    console.log('[App] Starting...');
    try {
        // Intercept reset-password route from Supabase email link
        if (window.location.pathname === '/reset-password' || window.location.hash.includes('type=recovery')) {
            renderResetPassword();
            return;
        }

        renderLayout();
        initRouter();
    } catch (err) {
        console.error('[App] Crash during start:', err);
        appStarted = false;
        window.onerror(err.message, null, null, null, err);
    }
}

// Arrancar
init();
