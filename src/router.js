// ============================================
// Router SPA basado en hash
// ============================================
import { getCurrentUser } from './components/auth.js';

const routes = {};
let currentRoute = '';
let onRouteChange = null;
let routerInitialized = false; // Guard: evita duplicar el listener

export function registerRoute(path, handler) {
    routes[path] = handler;
}

export function navigate(path) {
    window.location.hash = path;
}

export function getCurrentRoute() {
    return currentRoute;
}

export function setOnRouteChange(callback) {
    onRouteChange = callback;
}

function handleRoute() {
    let hash = window.location.hash.slice(1) || 'dashboard';

    const user = getCurrentUser();
    const role = user?.role || 'profesor';

    // Rutas protegidas solo para administradores
    const adminOnlyRoutes = ['profesores', 'reportes', 'usuarios'];

    if (adminOnlyRoutes.includes(hash) && role !== 'administrador') {
        window.location.hash = 'dashboard';
        hash = 'dashboard';
    }

    currentRoute = hash;
    const handler = routes[hash];
    console.log(`[Router] Navigating to: ${hash}`, { hasHandler: !!handler });

    if (handler) {
        // Envolver en try-catch para prevenir content-area negro por errores silenciosos
        Promise.resolve(handler()).catch(err => {
            console.error(`[Router] Error en ruta "${hash}":`, err);
            const content = document.getElementById('content-area');
            if (content) {
                content.innerHTML = `
                    <div style="padding:48px;text-align:center;">
                        <div style="font-size:2rem;margin-bottom:16px;">⚠️</div>
                        <h3 style="color:var(--accent-red);margin-bottom:8px;">Error al cargar la sección</h3>
                        <p style="color:var(--text-muted);font-size:0.875rem;">${err?.message || 'Error desconocido'}</p>
                        <button onclick="window.location.hash='dashboard'" style="margin-top:20px;" class="btn btn-secondary">Ir al Dashboard</button>
                    </div>`;
            }
        });
    }

    if (onRouteChange) {
        onRouteChange(hash);
    }
}

export function initRouter() {
    if (routerInitialized) {
        // Si ya está iniciado, sólo ejecutá la ruta actual
        handleRoute();
        return;
    }
    routerInitialized = true;
    window.addEventListener('hashchange', handleRoute);
    handleRoute();
}

export function resetRouter() {
    routerInitialized = false;
}

export default { registerRoute, navigate, getCurrentRoute, initRouter, setOnRouteChange, resetRouter };
