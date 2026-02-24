// ============================================
// Main - Punto de entrada
// ============================================
import './styles/index.css';
import { renderLayout } from './components/layout.js';
import { renderAuth, setAuthCallback, getCurrentUser } from './components/auth.js';
import { renderDashboard } from './components/dashboard.js';
import { renderEstudiantes } from './components/estudiantes.js';
import { renderProfesores } from './components/profesores.js';
import { renderTrayectos } from './components/trayectos.js';
import { renderModulos } from './components/modulos.js';
import { renderSubmodulos } from './components/submodulos.js';
import { renderAprobaciones } from './components/aprobaciones.js';
import { renderReportes } from './components/reportes.js';
import { registerRoute, initRouter, setOnRouteChange } from './router.js';

// Estado de la app
let isAuthenticated = false;

function init() {
    // Callback de autenticación
    setAuthCallback((authenticated) => {
        isAuthenticated = authenticated;
        if (authenticated) {
            startApp();
        } else {
            renderAuth();
        }
    });

    // Iniciar con auth
    renderAuth();
}

function startApp() {
    // Renderizar layout
    renderLayout();

    // Registrar rutas
    registerRoute('dashboard', renderDashboard);
    registerRoute('estudiantes', renderEstudiantes);
    registerRoute('profesores', renderProfesores);
    registerRoute('trayectos', renderTrayectos);
    registerRoute('modulos', renderModulos);
    registerRoute('submodulos', renderSubmodulos);
    registerRoute('aprobaciones', renderAprobaciones);
    registerRoute('reportes', renderReportes);

    // Iniciar router
    initRouter();
}

// Arrancar la aplicación
init();
