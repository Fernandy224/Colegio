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
import { registerRoute, initRouter, setOnRouteChange } from './router.js';
import { isSupabaseConfigured } from './supabaseClient.js';

let appStarted = false; // Guard: evita doble inicialización

function init() {
    // Registrar rutas UNA sola vez
    registerRoute('dashboard', renderDashboard);
    registerRoute('estudiantes', renderEstudiantes);
    registerRoute('profesores', renderProfesores);
    registerRoute('trayectos', renderTrayectos);
    registerRoute('modulos', renderModulos);
    registerRoute('submodulos', renderSubmodulos);
    registerRoute('aprobaciones', renderAprobaciones);
    registerRoute('reportes', renderReportes);
    registerRoute('usuarios', renderUsuarios);

    // Callback de autenticación
    setAuthCallback((authenticated) => {
        if (authenticated) {
            startApp();
        } else {
            appStarted = false;
            renderAuth();
        }
    });

    // Activar persistencia de sesión (solo con Supabase)
    if (isSupabaseConfigured()) {
        initAuth();
    }

    // Mostrar login mientras se verifica sesión
    renderAuth();
}

function startApp() {
    // Guard: evita que se inicialice múltiples veces
    // (puede dispararse por onAuthStateChange Y por Demo Admin al mismo tiempo)
    if (appStarted) {
        return;
    }
    appStarted = true;

    // Renderizar layout y arrancar router
    renderLayout();
    initRouter();
}

// Arrancar
init();
