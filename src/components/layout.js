// ============================================
// Layout principal
// ============================================
import { icons } from '../utils/helpers.js';
import { navigate, getCurrentRoute, setOnRouteChange } from '../router.js';

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
  { id: 'estudiantes', label: 'Estudiantes', icon: 'students' },
  { id: 'profesores', label: 'Profesores', icon: 'professors' },
  { id: 'trayectos', label: 'Trayectos', icon: 'trayectos' },
  { id: 'modulos', label: 'Mód. Específicos', icon: 'modulos' },
  { id: 'submodulos', label: 'Mód. Comunes', icon: 'submodulos' },
  { id: 'aprobaciones', label: 'Aprobaciones', icon: 'aprobaciones' },
  { id: 'reportes', label: 'Reportes', icon: 'reportes' },
];

export function renderLayout() {
  const app = document.getElementById('app');
  const current = getCurrentRoute() || 'dashboard';

  app.innerHTML = `
    <div class="app-layout">
      <!-- Sidebar -->
      <aside class="sidebar">
        <div class="sidebar-logo">GE</div>
        <nav class="sidebar-nav">
          ${navItems.map(item => `
            <button class="sidebar-item ${current === item.id ? 'active' : ''}" data-route="${item.id}" title="${item.label}">
              ${icons[item.icon]}
            </button>
          `).join('')}
        </nav>
        <div class="sidebar-bottom">
          <button class="sidebar-item" title="Configuración">
            ${icons.settings}
          </button>
          <div class="sidebar-avatar" title="Mi Perfil">AD</div>
        </div>
      </aside>

      <!-- Main -->
      <div class="main-container">
        <!-- Navbar -->
        <nav class="navbar">
          <div class="navbar-tabs">
            ${navItems.map(item => `
              <button class="navbar-tab ${current === item.id ? 'active' : ''}" data-route="${item.id}">
                ${item.label}
              </button>
            `).join('')}
          </div>
          <div class="navbar-spacer"></div>
          <div class="navbar-actions">
            <button class="navbar-icon-btn" title="Buscar">${icons.search}</button>
            <button class="navbar-icon-btn" title="Filtros">${icons.filter}</button>
          </div>
        </nav>

        <!-- Content -->
        <div class="content-wrapper">
          <div class="content-main" id="content-area">
            <!-- Contenido dinámico -->
          </div>
          <div class="panel-right" id="panel-right">
            <!-- Widgets -->
          </div>
        </div>
      </div>
    </div>
  `;

  // Event listeners para navegación
  app.querySelectorAll('[data-route]').forEach(btn => {
    btn.addEventListener('click', () => {
      navigate(btn.dataset.route);
    });
  });

  // Actualizar active state cuando cambia la ruta
  setOnRouteChange((route) => {
    app.querySelectorAll('[data-route]').forEach(btn => {
      const isActive = btn.dataset.route === route;
      btn.classList.toggle('active', isActive);
    });
  });
}

export function getContentArea() {
  return document.getElementById('content-area');
}

export function getPanelRight() {
  return document.getElementById('panel-right');
}

export default { renderLayout, getContentArea, getPanelRight };
