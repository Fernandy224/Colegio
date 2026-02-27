// ============================================
// Layout principal
// ============================================
import { icons, getInitials } from '../utils/helpers.js';
import { navigate, getCurrentRoute, setOnRouteChange } from '../router.js';
import { getCurrentUser, logout } from './auth.js';

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: 'dashboard', roles: ['administrador', 'profesor'] },
  { id: 'estudiantes', label: 'Estudiantes', icon: 'students', roles: ['administrador', 'profesor'] },
  { id: 'profesores', label: 'Profesores', icon: 'professors', roles: ['administrador'] },
  { id: 'trayectos', label: 'Trayectos', icon: 'trayectos', roles: ['administrador', 'profesor'] },
  { id: 'modulos', label: 'Mód. Específicos', icon: 'modulos', roles: ['administrador', 'profesor'] },
  { id: 'submodulos', label: 'Mód. Comunes', icon: 'submodulos', roles: ['administrador', 'profesor'] },
  { id: 'aprobaciones', label: 'Aprobaciones', icon: 'aprobaciones', roles: ['administrador', 'profesor'] },
  { id: 'reportes', label: 'Reportes', icon: 'reportes', roles: ['administrador'] },
  { id: 'usuarios', label: 'Usuarios', icon: 'settings', roles: ['administrador'] }
];

export function renderLayout() {
  const app = document.getElementById('app');
  const current = getCurrentRoute() || 'dashboard';

  const user = getCurrentUser();
  const userRole = user?.role || 'profesor';
  const allowedNavItems = navItems.filter(item => item.roles.includes(userRole));
  const userInitials = getInitials(user?.name || user?.email || 'U', '');

  app.innerHTML = `
    <div class="app-layout">
      <!-- Sidebar -->
      <aside class="sidebar">
        <div class="sidebar-logo"><img src="/logo.png" alt="Logo Nucleamiento N°6" width="60" /></div>
        <nav class="sidebar-nav">
          ${allowedNavItems.map(item => `
            <button class="sidebar-item ${current === item.id ? 'active' : ''}" data-route="${item.id}" title="${item.label}">
              ${icons[item.icon]}
            </button>
          `).join('')}
        </nav>
        <div class="sidebar-bottom">
          <!-- Avatar con menú de sesión -->
          <div class="sidebar-user-wrapper" id="user-menu-wrapper" style="position:relative;">
            <div class="sidebar-avatar" title="${user?.name || user?.email || 'Usuario'}" id="logout-btn">${userInitials}</div>
          </div>
        </div>
      </aside>

      <!-- Main -->
      <div class="main-container">
        <!-- Navbar -->
        <nav class="navbar">
          <div class="navbar-tabs">
            ${allowedNavItems.map(item => `
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

  // Menú de usuario (popover sobre el avatar)
  app.querySelector('#logout-btn').addEventListener('click', (e) => {
    e.stopPropagation();
    const wrapper = app.querySelector('#user-menu-wrapper');
    const existing = wrapper.querySelector('#user-popover');
    if (existing) { existing.remove(); return; }

    const popover = document.createElement('div');
    popover.id = 'user-popover';
    popover.style.cssText = `
      position:absolute; bottom:54px; left:0; width:200px;
      background:var(--bg-card); border:1px solid var(--border-color);
      border-radius:12px; box-shadow:0 8px 32px rgba(0,0,0,0.4);
      padding:12px; z-index:1000; animation:fadeIn 0.15s ease;
    `;
    popover.innerHTML = `
      <div style="margin-bottom:10px;padding-bottom:10px;border-bottom:1px solid var(--border-color);">
        <div style="font-weight:600;font-size:0.875rem;color:var(--text-primary);margin-bottom:2px;">
          ${user?.name || user?.email || 'Usuario'}
        </div>
        <div style="font-size:0.75rem;color:var(--accent-purple-light);text-transform:capitalize;">● ${userRole}</div>
        ${user?.email ? `<div style="font-size:0.7rem;color:var(--text-muted);margin-top:2px;">${user.email}</div>` : ''}
      </div>
      <button id="btn-logout-menu" style="
        width:100%;display:flex;align-items:center;gap:8px;
        padding:8px 10px;border-radius:8px;border:none;
        background:rgba(239,68,68,0.1);color:#ef4444;
        cursor:pointer;font-size:0.8125rem;font-weight:600;
        transition:background 0.2s;
      " onmouseover="this.style.background='rgba(239,68,68,0.2)'" onmouseout="this.style.background='rgba(239,68,68,0.1)'">
        ${icons.logout}
        Cerrar Sesión
      </button>
    `;
    wrapper.appendChild(popover);

    popover.querySelector('#btn-logout-menu').addEventListener('click', () => logout());

    // Cerrar al hacer clic fuera
    setTimeout(() => {
      document.addEventListener('click', function handler() {
        popover.remove();
        document.removeEventListener('click', handler);
      });
    }, 10);
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
