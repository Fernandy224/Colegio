// ============================================
// Router SPA basado en hash
// ============================================

const routes = {};
let currentRoute = '';
let onRouteChange = null;

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
    const hash = window.location.hash.slice(1) || 'dashboard';
    currentRoute = hash;

    const handler = routes[hash];
    if (handler) {
        handler();
    }

    if (onRouteChange) {
        onRouteChange(hash);
    }
}

export function initRouter() {
    window.addEventListener('hashchange', handleRoute);
    handleRoute();
}

export default { registerRoute, navigate, getCurrentRoute, initRouter, setOnRouteChange };
