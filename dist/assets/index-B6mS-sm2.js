(function(){const n=document.createElement("link").relList;if(n&&n.supports&&n.supports("modulepreload"))return;for(const i of document.querySelectorAll('link[rel="modulepreload"]'))s(i);new MutationObserver(i=>{for(const d of i)if(d.type==="childList")for(const l of d.addedNodes)l.tagName==="LINK"&&l.rel==="modulepreload"&&s(l)}).observe(document,{childList:!0,subtree:!0});function a(i){const d={};return i.integrity&&(d.integrity=i.integrity),i.referrerPolicy&&(d.referrerPolicy=i.referrerPolicy),i.crossOrigin==="use-credentials"?d.credentials="include":i.crossOrigin==="anonymous"?d.credentials="omit":d.credentials="same-origin",d}function s(i){if(i.ep)return;i.ep=!0;const d=a(i);fetch(i.href,d)}})();const m={dashboard:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>',students:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>',professors:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>',trayectos:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path></svg>',modulos:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>',submodulos:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg>',aprobaciones:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>',reportes:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>',search:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>',plus:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>',edit:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>',trash:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>',close:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>',warning:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>',settings:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>',logout:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>',filter:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="4" y1="21" x2="4" y2="14"></line><line x1="4" y1="10" x2="4" y2="3"></line><line x1="12" y1="21" x2="12" y2="12"></line><line x1="12" y1="8" x2="12" y2="3"></line><line x1="20" y1="21" x2="20" y2="16"></line><line x1="20" y1="12" x2="20" y2="3"></line><line x1="1" y1="14" x2="7" y2="14"></line><line x1="9" y1="8" x2="15" y2="8"></line><line x1="17" y1="16" x2="23" y2="16"></line></svg>',arrowUpRight:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="7" y1="17" x2="17" y2="7"></line><polyline points="7 7 17 7 17 17"></polyline></svg>',check:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>'};function Z(e,n){const a=(e||"").charAt(0).toUpperCase(),s=(n||"").charAt(0).toUpperCase();return a+s}function ee(e){const n=["linear-gradient(135deg, #7c3aed, #a78bfa)","linear-gradient(135deg, #2563eb, #60a5fa)","linear-gradient(135deg, #059669, #34d399)","linear-gradient(135deg, #d97706, #fbbf24)","linear-gradient(135deg, #dc2626, #f87171)","linear-gradient(135deg, #db2777, #f472b6)","linear-gradient(135deg, #0891b2, #22d3ee)","linear-gradient(135deg, #4f46e5, #818cf8)"];let a=0;for(let s=0;s<e.length;s++)a=e.charCodeAt(s)+((a<<5)-a);return n[Math.abs(a)%n.length]}function we(e){return/^\d{7,8}$/.test(e)}function Ae(e){return e?new Date(e).toLocaleDateString("es-AR",{day:"2-digit",month:"2-digit",year:"numeric"}):"-"}function c(e){const n=document.createElement("div");return n.textContent=e,n.innerHTML}function E(){return"id-"+Date.now().toString(36)+"-"+Math.random().toString(36).substr(2,9)}function v(e,n="success"){let a=document.querySelector(".toast-container");a||(a=document.createElement("div"),a.className="toast-container",document.body.appendChild(a));const s=document.createElement("div");s.className=`toast toast-${n}`,s.innerHTML=`
    <span>${n==="success"?m.check:m.warning}</span>
    <span>${c(e)}</span>
  `,a.appendChild(s),setTimeout(()=>{s.style.opacity="0",s.style.transform="translateX(50px)",s.style.transition="all 0.3s ease",setTimeout(()=>s.remove(),300)},3e3)}function I(e,n,a=""){const s=document.createElement("div");return s.className="modal-overlay",s.innerHTML=`
    <div class="modal">
      <div class="modal-header">
        <h3 class="modal-title">${e}</h3>
        <button class="modal-close" id="modal-close-btn">${m.close}</button>
      </div>
      <div class="modal-body">${n}</div>
      ${a?`<div class="modal-footer">${a}</div>`:""}
    </div>
  `,document.body.appendChild(s),s.querySelector("#modal-close-btn").addEventListener("click",()=>s.remove()),s.addEventListener("click",i=>{i.target===s&&s.remove()}),s}function D(e,n){const a=I("Confirmar",`
    <div class="confirm-dialog">
      <div class="confirm-icon">${m.warning}</div>
      <p class="confirm-text">${e}</p>
      <div class="confirm-actions">
        <button class="btn btn-secondary" id="confirm-cancel">Cancelar</button>
        <button class="btn btn-danger" id="confirm-ok">Eliminar</button>
      </div>
    </div>
  `);a.querySelector("#confirm-cancel").addEventListener("click",()=>a.remove()),a.querySelector("#confirm-ok").addEventListener("click",()=>{n(),a.remove()})}const Ee={};let ke="",ie=null;function B(e,n){Ee[e]=n}function Ce(e){window.location.hash=e}function Te(){return ke}function Se(e){ie=e}function ue(){const e=window.location.hash.slice(1)||"dashboard";ke=e;const n=Ee[e];n&&n(),ie&&ie(e)}function ze(){window.addEventListener("hashchange",ue),ue()}const pe=[{id:"dashboard",label:"Dashboard",icon:"dashboard"},{id:"estudiantes",label:"Estudiantes",icon:"students"},{id:"profesores",label:"Profesores",icon:"professors"},{id:"trayectos",label:"Trayectos",icon:"trayectos"},{id:"modulos",label:"Mód. Específicos",icon:"modulos"},{id:"submodulos",label:"Mód. Comunes",icon:"submodulos"},{id:"aprobaciones",label:"Aprobaciones",icon:"aprobaciones"},{id:"reportes",label:"Reportes",icon:"reportes"}];function Be(){const e=document.getElementById("app"),n=Te()||"dashboard";e.innerHTML=`
    <div class="app-layout">
      <!-- Sidebar -->
      <aside class="sidebar">
        <div class="sidebar-logo">GE</div>
        <nav class="sidebar-nav">
          ${pe.map(a=>`
            <button class="sidebar-item ${n===a.id?"active":""}" data-route="${a.id}" title="${a.label}">
              ${m[a.icon]}
            </button>
          `).join("")}
        </nav>
        <div class="sidebar-bottom">
          <button class="sidebar-item" title="Configuración">
            ${m.settings}
          </button>
          <div class="sidebar-avatar" title="Mi Perfil">AD</div>
        </div>
      </aside>

      <!-- Main -->
      <div class="main-container">
        <!-- Navbar -->
        <nav class="navbar">
          <div class="navbar-tabs">
            ${pe.map(a=>`
              <button class="navbar-tab ${n===a.id?"active":""}" data-route="${a.id}">
                ${a.label}
              </button>
            `).join("")}
          </div>
          <div class="navbar-spacer"></div>
          <div class="navbar-actions">
            <button class="navbar-icon-btn" title="Buscar">${m.search}</button>
            <button class="navbar-icon-btn" title="Filtros">${m.filter}</button>
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
  `,e.querySelectorAll("[data-route]").forEach(a=>{a.addEventListener("click",()=>{Ce(a.dataset.route)})}),Se(a=>{e.querySelectorAll("[data-route]").forEach(s=>{const i=s.dataset.route===a;s.classList.toggle("active",i)})})}function S(){return document.getElementById("content-area")}function z(){return document.getElementById("panel-right")}let N=null;function je(e){N=e}function oe(){const e=document.getElementById("app");e.innerHTML=`
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
  `,document.getElementById("login-form").addEventListener("submit",async n=>{n.preventDefault(),document.getElementById("auth-email").value,document.getElementById("auth-password").value,v("Sesión demo iniciada"),N&&N(!0)}),document.getElementById("demo-btn").addEventListener("click",()=>{v("Modo demo activado"),N&&N(!0)}),document.getElementById("toggle-register").addEventListener("click",()=>{He()})}function He(){const e=document.getElementById("auth-form-container");e.innerHTML=`
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
  `,document.getElementById("register-form").addEventListener("submit",async n=>{n.preventDefault(),document.getElementById("reg-name").value,document.getElementById("reg-email").value,document.getElementById("reg-password").value,v("Cuenta demo creada"),N&&N(!0)}),document.getElementById("toggle-login").addEventListener("click",()=>{oe()})}const qe={estudiantes:[{id:E(),nombre:"Lucía",apellido:"Martínez",dni:"42356789",anio_ingreso:2024,estado:"Activo"},{id:E(),nombre:"Tomás",apellido:"García",dni:"41234567",anio_ingreso:2024,estado:"Activo"},{id:E(),nombre:"Valentina",apellido:"López",dni:"43567890",anio_ingreso:2023,estado:"Activo"},{id:E(),nombre:"Mateo",apellido:"Rodríguez",dni:"40123456",anio_ingreso:2023,estado:"Activo"},{id:E(),nombre:"Camila",apellido:"Fernández",dni:"44678901",anio_ingreso:2022,estado:"Egresado"},{id:E(),nombre:"Santiago",apellido:"Pérez",dni:"39012345",anio_ingreso:2024,estado:"Activo"},{id:E(),nombre:"Sofía",apellido:"González",dni:"45789012",anio_ingreso:2023,estado:"Activo"},{id:E(),nombre:"Benjamín",apellido:"Díaz",dni:"38901234",anio_ingreso:2022,estado:"Inactivo"},{id:E(),nombre:"Isabella",apellido:"Ruiz",dni:"46890123",anio_ingreso:2024,estado:"Activo"}],profesores:[{id:E(),nombre:"María",apellido:"Sánchez",dni:"28123456",email:"msanchez@edu.ar",especialidad:"Programación"},{id:E(),nombre:"Carlos",apellido:"Torres",dni:"30234567",email:"ctorres@edu.ar",especialidad:"Redes"},{id:E(),nombre:"Ana",apellido:"Romero",dni:"29345678",email:"aromero@edu.ar",especialidad:"Diseño Web"},{id:E(),nombre:"Roberto",apellido:"Morales",dni:"27456789",email:"rmorales@edu.ar",especialidad:"Base de Datos"},{id:E(),nombre:"Laura",apellido:"Acosta",dni:"31567890",email:"lacosta@edu.ar",especialidad:"Matemática"}],trayectos_formativos:[{id:E(),nombre:"Desarrollo Web",descripcion:"Trayecto intensivo Full Stack",profesor_id:null,duracion:"6 meses"},{id:E(),nombre:"Cocina",descripcion:"Trayecto de cocina profesional",profesor_id:null,duracion:"1 año"},{id:E(),nombre:"Telar",descripcion:"Técnicas de tejido en telar",profesor_id:null,duracion:"3 meses"}],modulos:[],submodulos:[],unidades:[],inscripciones:[],seguimiento_modulos:[],seguimiento_unidades:[],trayecto_modulo_comun:[],aprobaciones:[]};function Ne(){["estudiantes","profesores","trayectos_formativos","modulos","submodulos","unidades","inscripciones","seguimiento_modulos","seguimiento_unidades","trayecto_modulo_comun","aprobaciones"].forEach(n=>{localStorage.getItem(`demo_${n}`)||localStorage.setItem(`demo_${n}`,JSON.stringify(qe[n]||[]))})}function J(e){const n=localStorage.getItem(`demo_${e}`);return n?JSON.parse(n):[]}function de(e,n){localStorage.setItem(`demo_${e}`,JSON.stringify(n))}async function x(e){return J(e)}async function A(e,n){const a=J(e),s={id:E(),...n,created_at:new Date().toISOString()};return a.unshift(s),de(e,a),s}async function T(e,n,a){const s=J(e),i=s.findIndex(d=>d.id===n);if(i===-1)throw new Error("Registro no encontrado");return s[i]={...s[i],...a},de(e,s),s[i]}async function _(e,n){const a=J(e).filter(s=>s.id!==n);return de(e,a),!0}async function Me(e,n,a){const s=a.toLowerCase();return J(e).filter(i=>n.some(d=>String(i[d]||"").toLowerCase().includes(s)))}async function Le(e,n,a=null){return(await x(e)).some(i=>i.dni===n&&i.id!==a)}async function G(e){return(await x(e)).length}async function se(e,n,a){return(await x(e)).filter(i=>i[n]===a).length}Ne();async function De(){const e=S(),n=z(),a=await G("estudiantes"),s=await G("profesores"),i=await G("modulos"),d=await G("aprobaciones"),l=await G("trayectos_formativos"),t=await se("estudiantes","estado","Activo");e.innerHTML=`
    <div class="section-header">
      <h1 class="section-title">Dashboard</h1>
    </div>

    <div class="dashboard-stats">
      <div class="stat-card">
        <div class="stat-card-icon purple">${m.students}</div>
        <div class="stat-card-value">${a}</div>
        <div class="stat-card-label">Estudiantes registrados</div>
      </div>
      <div class="stat-card">
        <div class="stat-card-icon blue">${m.professors}</div>
        <div class="stat-card-value">${s}</div>
        <div class="stat-card-label">Profesores</div>
      </div>
      <div class="stat-card">
        <div class="stat-card-icon green">${m.trayectos}</div>
        <div class="stat-card-value">${l}</div>
        <div class="stat-card-label">Trayectos formativos</div>
      </div>
      <div class="stat-card">
        <div class="stat-card-icon orange">${m.modulos}</div>
        <div class="stat-card-value">${i}</div>
        <div class="stat-card-label">Módulos Específicos</div>
      </div>
      <div class="stat-card">
        <div class="stat-card-icon pink">${m.aprobaciones}</div>
        <div class="stat-card-value">${d}</div>
        <div class="stat-card-label">Aprobaciones</div>
      </div>
    </div>

    <div class="recent-activity">
      <div class="section-header">
        <h2 class="section-title" style="font-size: 1.125rem;">Actividad Reciente</h2>
      </div>
      <div class="activity-list" id="activity-list">
        <div class="activity-item">
          <div class="activity-dot green"></div>
          <div class="activity-text"><strong>${t}</strong> estudiantes activos en el sistema</div>
        </div>
        <div class="activity-item">
          <div class="activity-dot blue"></div>
          <div class="activity-text"><strong>${s}</strong> profesores registrados</div>
        </div>
        <div class="activity-item">
          <div class="activity-dot purple"></div>
          <div class="activity-text"><strong>${l}</strong> trayectos formativos configurados</div>
        </div>
        <div class="activity-item">
          <div class="activity-dot orange"></div>
          <div class="activity-text"><strong>${d}</strong> aprobaciones registradas</div>
        </div>
      </div>
    </div>
  `;const o=a>0?Math.round(t/a*100):0;n.innerHTML=`
    <div class="widget">
      <div class="widget-header">
        <span class="widget-title">Resumen General</span>
        <button class="widget-link">${m.arrowUpRight}</button>
      </div>
      <div class="widget-bar">
        <div class="widget-bar-fill" style="width: ${o}%"></div>
      </div>
      <div class="widget-stats">
        <div class="widget-stat">
          <div class="widget-stat-value">${t}</div>
          <div class="widget-stat-label">Activos</div>
        </div>
        <div class="widget-stat">
          <div class="widget-stat-value">${a-t}</div>
          <div class="widget-stat-label">Inactivos/Egresados</div>
        </div>
      </div>
    </div>

    <div class="widget">
      <div class="widget-header">
        <span class="widget-title">Distribución Académica</span>
        <button class="widget-link">${m.arrowUpRight}</button>
      </div>
      <div class="widget-color-blocks">
        <div class="widget-color-block"></div>
        <div class="widget-color-block"></div>
        <div class="widget-color-block"></div>
        <div class="widget-color-block"></div>
      </div>
      <div class="widget-stats" style="margin-top: 12px;">
        <div class="widget-stat">
          <div class="widget-stat-value">${i}</div>
          <div class="widget-stat-label">Mód. Específicos</div>
        </div>
        <div class="widget-stat">
          <div class="widget-stat-value">${l}</div>
          <div class="widget-stat-label">Trayectos</div>
        </div>
      </div>
    </div>

    <div class="widget widget-gradient">
      <div class="widget-header">
        <span class="widget-title">💡 Consejo</span>
      </div>
      <p style="font-size: 0.8125rem; color: var(--text-secondary); line-height: 1.5;">
        Usá las pestañas de navegación para gestionar estudiantes, profesores, módulos y registrar aprobaciones.
      </p>
    </div>
  `}let U="";async function Y(){var d,l;const e=S(),n=z();let a=U?await Me("estudiantes",["nombre","apellido","dni"],U):await x("estudiantes");const s=await se("estudiantes","estado","Activo"),i=await se("estudiantes","estado","Egresado");e.innerHTML=`
    <div class="section-header">
      <h1 class="section-title">Gestionar Estudiantes</h1>
      <div class="section-actions">
        <div class="search-bar">
          ${m.search}
          <input type="text" id="search-estudiantes" placeholder="Buscar por nombre o DNI..." value="${c(U)}" />
        </div>
        <button class="btn btn-add" id="btn-add-estudiante">
          ${m.plus} Nuevo Estudiante
        </button>
      </div>
    </div>

    ${a.length===0?`
      <div class="empty-state">
        ${m.students}
        <h3 class="empty-state-title">${U?"Sin resultados":"No hay estudiantes"}</h3>
        <p class="empty-state-text">${U?"No se encontraron estudiantes con ese criterio.":'Agregá tu primer estudiante haciendo clic en "Nuevo Estudiante".'}</p>
      </div>
    `:`
      <div class="cards-grid">
        ${a.map(t=>`
          <div class="card" data-id="${t.id}">
            <div class="card-actions">
              <button class="card-action-btn edit-btn" data-id="${t.id}" title="Editar">${m.edit}</button>
              <button class="card-action-btn delete card-action-btn-del" data-id="${t.id}" title="Eliminar">${m.trash}</button>
            </div>
            <div class="card-avatar student" style="background: ${ee(t.nombre+t.apellido)}">
              ${Z(t.nombre,t.apellido)}
            </div>
            <div class="card-name">${c(t.nombre)} ${c(t.apellido)}</div>
            <div class="card-subtitle">DNI: ${c(t.dni)}</div>
            <div class="card-details">
              <div class="card-detail">
                <span class="card-detail-label">Ingreso</span>
                <span class="card-detail-value">${t.anio_ingreso}</span>
              </div>
              <div class="card-detail">
                <span class="card-detail-label">Estado</span>
                <span class="badge ${t.estado==="Activo"?"badge-active":t.estado==="Egresado"?"badge-approved":"badge-inactive"}">${t.estado}</span>
              </div>
            </div>
          </div>
        `).join("")}
      </div>
    `}
  `,n.innerHTML=`
    <div class="widget">
      <div class="widget-header">
        <span class="widget-title">Resumen Estudiantes</span>
      </div>
      <div class="widget-bar">
        <div class="widget-bar-fill" style="width: ${a.length>0?Math.round(s/(s+i||1)*100):0}%"></div>
      </div>
      <div class="widget-stats">
        <div class="widget-stat">
          <div class="widget-stat-value">${s}</div>
          <div class="widget-stat-label">Activos</div>
        </div>
        <div class="widget-stat">
          <div class="widget-stat-value">${i}</div>
          <div class="widget-stat-label">Egresados</div>
        </div>
      </div>
    </div>
    <div class="widget widget-gradient">
      <div class="widget-header">
        <span class="widget-title">📋 Información</span>
      </div>
      <p style="font-size: 0.8125rem; color: var(--text-secondary); line-height: 1.5;">
        Hacé clic en una tarjeta para ver detalles. Usá los botones de editar y eliminar que aparecen al pasar el mouse.
      </p>
    </div>
  `,(d=document.getElementById("search-estudiantes"))==null||d.addEventListener("input",t=>{U=t.target.value,Y()}),(l=document.getElementById("btn-add-estudiante"))==null||l.addEventListener("click",()=>{ve()}),e.querySelectorAll(".edit-btn").forEach(t=>{t.addEventListener("click",async o=>{o.stopPropagation();const r=a.find(u=>u.id===t.dataset.id);r&&ve(r)})}),e.querySelectorAll(".card-action-btn-del").forEach(t=>{t.addEventListener("click",o=>{o.stopPropagation();const r=a.find(u=>u.id===t.dataset.id);r&&D(`¿Estás seguro de eliminar a <strong>${c(r.nombre)} ${c(r.apellido)}</strong>?`,async()=>{await _("estudiantes",r.id),v("Estudiante eliminado"),Y()})})})}function ve(e=null){const n=!!e,a=n?"Editar Estudiante":"Nuevo Estudiante",s=`
    <div class="form-row">
      <div class="form-group">
        <label class="form-label">Nombre</label>
        <input type="text" class="form-input" id="est-nombre" value="${n?c(e.nombre):""}" required placeholder="Nombre" />
      </div>
      <div class="form-group">
        <label class="form-label">Apellido</label>
        <input type="text" class="form-input" id="est-apellido" value="${n?c(e.apellido):""}" required placeholder="Apellido" />
      </div>
    </div>
    <div class="form-row">
      <div class="form-group">
        <label class="form-label">DNI</label>
        <input type="text" class="form-input" id="est-dni" value="${n?c(e.dni):""}" required placeholder="12345678" maxlength="8" />
      </div>
      <div class="form-group">
        <label class="form-label">Año de Ingreso</label>
        <input type="number" class="form-input" id="est-anio" value="${n?e.anio_ingreso:new Date().getFullYear()}" required min="2000" max="2100" />
      </div>
    </div>
    <div class="form-group">
      <label class="form-label">Estado</label>
      <select class="form-select" id="est-estado">
        <option value="Activo" ${n&&e.estado==="Activo"?"selected":""}>Activo</option>
        <option value="Inactivo" ${n&&e.estado==="Inactivo"?"selected":""}>Inactivo</option>
        <option value="Egresado" ${n&&e.estado==="Egresado"?"selected":""}>Egresado</option>
      </select>
    </div>
  `,d=I(a,s,`
    <button class="btn btn-secondary" id="modal-cancel">Cancelar</button>
    <button class="btn btn-primary" id="modal-save">${n?"Guardar Cambios":"Crear Estudiante"}</button>
  `);d.querySelector("#modal-cancel").addEventListener("click",()=>d.remove()),d.querySelector("#modal-save").addEventListener("click",async()=>{const l=document.getElementById("est-nombre").value.trim(),t=document.getElementById("est-apellido").value.trim(),o=document.getElementById("est-dni").value.trim(),r=parseInt(document.getElementById("est-anio").value),u=document.getElementById("est-estado").value;if(!l||!t||!o||!r){v("Completá todos los campos obligatorios","error");return}if(!we(o)){v("El DNI debe tener 7 u 8 dígitos numéricos","error");return}if(await Le("estudiantes",o,n?e.id:null)){v("Ya existe un estudiante con ese DNI","error");return}try{n?(await T("estudiantes",e.id,{nombre:l,apellido:t,dni:o,anio_ingreso:r,estado:u}),v("Estudiante actualizado")):(await A("estudiantes",{nombre:l,apellido:t,dni:o,anio_ingreso:r,estado:u}),v("Estudiante creado exitosamente")),d.remove(),Y()}catch(b){v(b.message||"Error al guardar","error")}})}let V="";async function W(){var s,i;const e=S(),n=z();let a=V?await Me("profesores",["nombre","apellido","dni","especialidad"],V):await x("profesores");e.innerHTML=`
    <div class="section-header">
      <h1 class="section-title">Gestionar Profesores</h1>
      <div class="section-actions">
        <div class="search-bar">
          ${m.search}
          <input type="text" id="search-profesores" placeholder="Buscar profesor..." value="${c(V)}" />
        </div>
        <button class="btn btn-add" id="btn-add-profesor">
          ${m.plus} Nuevo Profesor
        </button>
      </div>
    </div>

    ${a.length===0?`
      <div class="empty-state">
        ${m.professors}
        <h3 class="empty-state-title">${V?"Sin resultados":"No hay profesores"}</h3>
        <p class="empty-state-text">${V?"No se encontraron profesores.":"Agregá tu primer profesor."}</p>
      </div>
    `:`
      <div class="cards-grid">
        ${a.map(d=>`
          <div class="card" data-id="${d.id}">
            <div class="card-actions">
              <button class="card-action-btn edit-btn" data-id="${d.id}" title="Editar">${m.edit}</button>
              <button class="card-action-btn delete card-action-btn-del" data-id="${d.id}" title="Eliminar">${m.trash}</button>
            </div>
            <div class="card-avatar professor" style="background: ${ee(d.nombre+d.apellido)}">
              ${Z(d.nombre,d.apellido)}
            </div>
            <div class="card-name">${c(d.nombre)} ${c(d.apellido)}</div>
            <div class="card-subtitle">${c(d.especialidad||"Sin especialidad")}</div>
            <div class="card-details">
              <div class="card-detail">
                <span class="card-detail-label">DNI</span>
                <span class="card-detail-value">${c(d.dni)}</span>
              </div>
              <div class="card-detail">
                <span class="card-detail-label">Email</span>
                <span class="card-detail-value" style="font-size: 0.7rem;">${c(d.email||"-")}</span>
              </div>
            </div>
          </div>
        `).join("")}
      </div>
    `}
  `,n.innerHTML=`
    <div class="widget">
      <div class="widget-header">
        <span class="widget-title">Profesores</span>
      </div>
      <div class="widget-stats">
        <div class="widget-stat">
          <div class="widget-stat-value">${a.length}</div>
          <div class="widget-stat-label">Total registrados</div>
        </div>
      </div>
    </div>
    <div class="widget widget-gradient">
      <div class="widget-header">
        <span class="widget-title">👨‍🏫 Especialidades</span>
      </div>
      <div style="display: flex; flex-wrap: wrap; gap: 6px; margin-top: 8px;">
        ${[...new Set(a.map(d=>d.especialidad).filter(Boolean))].map(d=>`<span class="badge badge-active">${c(d)}</span>`).join("")||'<span style="font-size: 0.8125rem; color: var(--text-muted);">Sin datos</span>'}
      </div>
    </div>
  `,(s=document.getElementById("search-profesores"))==null||s.addEventListener("input",d=>{V=d.target.value,W()}),(i=document.getElementById("btn-add-profesor"))==null||i.addEventListener("click",()=>me()),e.querySelectorAll(".edit-btn").forEach(d=>{d.addEventListener("click",l=>{l.stopPropagation();const t=a.find(o=>o.id===d.dataset.id);t&&me(t)})}),e.querySelectorAll(".card-action-btn-del").forEach(d=>{d.addEventListener("click",l=>{l.stopPropagation();const t=a.find(o=>o.id===d.dataset.id);t&&D(`¿Eliminar a <strong>${c(t.nombre)} ${c(t.apellido)}</strong>?`,async()=>{await _("profesores",t.id),v("Profesor eliminado"),W()})})})}function me(e=null){const n=!!e,a=n?"Editar Profesor":"Nuevo Profesor",s=`
    <div class="form-row">
      <div class="form-group">
        <label class="form-label">Nombre</label>
        <input type="text" class="form-input" id="prof-nombre" value="${n?c(e.nombre):""}" required placeholder="Nombre" />
      </div>
      <div class="form-group">
        <label class="form-label">Apellido</label>
        <input type="text" class="form-input" id="prof-apellido" value="${n?c(e.apellido):""}" required placeholder="Apellido" />
      </div>
    </div>
    <div class="form-row">
      <div class="form-group">
        <label class="form-label">DNI</label>
        <input type="text" class="form-input" id="prof-dni" value="${n?c(e.dni):""}" required placeholder="12345678" maxlength="8" />
      </div>
      <div class="form-group">
        <label class="form-label">Especialidad</label>
        <input type="text" class="form-input" id="prof-especialidad" value="${n?c(e.especialidad||""):""}" placeholder="Ej: Programación" />
      </div>
    </div>
    <div class="form-group">
      <label class="form-label">Email</label>
      <input type="email" class="form-input" id="prof-email" value="${n?c(e.email||""):""}" placeholder="profesor@ejemplo.com" />
    </div>
  `,d=I(a,s,`
    <button class="btn btn-secondary" id="modal-cancel">Cancelar</button>
    <button class="btn btn-primary" id="modal-save">${n?"Guardar":"Crear Profesor"}</button>
  `);d.querySelector("#modal-cancel").addEventListener("click",()=>d.remove()),d.querySelector("#modal-save").addEventListener("click",async()=>{const l=document.getElementById("prof-nombre").value.trim(),t=document.getElementById("prof-apellido").value.trim(),o=document.getElementById("prof-dni").value.trim(),r=document.getElementById("prof-especialidad").value.trim(),u=document.getElementById("prof-email").value.trim();if(!l||!t||!o){v("Completá nombre, apellido y DNI","error");return}if(!we(o)){v("El DNI debe tener 7 u 8 dígitos","error");return}if(await Le("profesores",o,n?e.id:null)){v("Ya existe un profesor con ese DNI","error");return}try{n?(await T("profesores",e.id,{nombre:l,apellido:t,dni:o,especialidad:r,email:u}),v("Profesor actualizado")):(await A("profesores",{nombre:l,apellido:t,dni:o,especialidad:r,email:u}),v("Profesor creado exitosamente")),d.remove(),W()}catch(b){v(b.message||"Error al guardar","error")}})}let K="list",X=null;async function j(){K==="detail"&&X?await Pe(X):await Q()}async function Q(){var l;const e=S(),n=z(),a=await x("trayectos_formativos"),s=await x("profesores"),i=await x("inscripciones"),d=await x("modulos");e.innerHTML=`
    <div class="section-header">
      <h1 class="section-title">Trayectos Formativos</h1>
      <div class="section-actions">
        <button class="btn btn-add" id="btn-add-trayecto">${m.plus} Nuevo Trayecto</button>
      </div>
    </div>

    ${a.length===0?`
      <div class="empty-state">
        ${m.trayectos}
        <h3 class="empty-state-title">No hay trayectos formativos</h3>
        <p class="empty-state-text">Creá un trayecto formativo, asignale módulos y empezá a inscribir estudiantes.</p>
      </div>
    `:`
      <div class="cards-grid" style="grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));">
        ${a.map(t=>{var p;const o=s.find(b=>b.id===t.profesor_id),r=i.filter(b=>b.trayecto_id===t.id),u=d.filter(b=>b.trayecto_id===t.id);return`
            <div class="card trayecto-card" data-id="${t.id}" style="cursor: pointer; align-items: stretch;">
              <div class="card-actions">
                <button class="card-action-btn edit-btn" data-id="${t.id}" title="Editar">${m.edit}</button>
                <button class="card-action-btn delete card-action-btn-del" data-id="${t.id}" title="Eliminar">${m.trash}</button>
              </div>
              <div style="display: flex; align-items: center; gap: 12px;">
                <div class="card-avatar trayecto" style="width: 52px; height: 52px; flex-shrink: 0;">
                  ${c(((p=t.nombre)==null?void 0:p.charAt(0))||"T")}
                </div>
                <div style="min-width: 0;">
                  <div class="card-name" style="text-align: left;">${c(t.nombre)}</div>
                  <div class="card-subtitle" style="text-align: left; margin-top: 2px;">
                    ${o?`Prof. ${c(o.nombre)} ${c(o.apellido)}`:"Sin profesor"}
                  </div>
                  <div style="font-size:0.75rem; color:var(--text-muted); margin-top: 4px; display:flex; align-items:center; gap: 4px;">
                    <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                    ${t.duracion?c(t.duracion):"Duración sin definir"}
                  </div>
                </div>
              </div>
              <div class="card-details" style="margin-top: auto;">
                <div class="card-detail">
                  <span class="card-detail-label">Inscriptos</span>
                  <span class="card-detail-value">${r.length}</span>
                </div>
                <div class="card-detail">
                  <span class="card-detail-label">Mód. Espec.</span>
                  <span class="card-detail-value">${u.length}</span>
                </div>
                <div class="card-detail">
                  <span class="card-detail-label">Ver detalle</span>
                  <span class="card-detail-value" style="color: var(--accent-purple-light);">→</span>
                </div>
              </div>
            </div>
          `}).join("")}
      </div>
    `}
  `,n.innerHTML=`
    <div class="widget">
      <div class="widget-header"><span class="widget-title">Trayectos</span></div>
      <div class="widget-stats">
        <div class="widget-stat">
          <div class="widget-stat-value">${a.length}</div>
          <div class="widget-stat-label">Total</div>
        </div>
        <div class="widget-stat">
          <div class="widget-stat-value">${i.length}</div>
          <div class="widget-stat-label">Inscripciones</div>
        </div>
      </div>
    </div>
  `,(l=document.getElementById("btn-add-trayecto"))==null||l.addEventListener("click",()=>fe(null,s)),e.querySelectorAll(".trayecto-card").forEach(t=>{t.addEventListener("click",()=>{X=t.dataset.id,K="detail",j()})}),e.querySelectorAll(".edit-btn").forEach(t=>{t.addEventListener("click",o=>{o.stopPropagation();const r=a.find(u=>u.id===t.dataset.id);r&&fe(r,s)})}),e.querySelectorAll(".card-action-btn-del").forEach(t=>{t.addEventListener("click",o=>{o.stopPropagation();const r=a.find(u=>u.id===t.dataset.id);r&&D(`¿Eliminar el trayecto <strong>${c(r.nombre)}</strong>?`,async()=>{await _("trayectos_formativos",r.id),v("Trayecto eliminado"),Q()})})})}async function Pe(e){var R,re,le;const n=S(),a=z(),i=(await x("trayectos_formativos")).find(g=>g.id===e);if(!i){K="list",Q();return}const l=(await x("profesores")).find(g=>g.id===i.profesor_id),t=await x("estudiantes"),r=(await x("inscripciones")).filter(g=>g.trayecto_id===e),u=await x("modulos"),p=await x("submodulos"),b=await x("seguimiento_modulos"),w=await x("trayecto_modulo_comun"),h=await x("unidades"),f=await x("seguimiento_unidades"),y=u.filter(g=>g.trayecto_id===e),$=w.filter(g=>g.trayecto_id===e),L=$.map(g=>p.find(H=>H.id===g.submodulo_id)).filter(Boolean),k=[...y.map(g=>({...g,tipo:"Específico",refId:g.id,refField:"modulo_id"})),...L.map(g=>({...g,tipo:"Común",refId:g.id,refField:"submodulo_id"}))],M=r.map(g=>{const H=t.find(q=>q.id===g.estudiante_id),F=b.filter(q=>q.inscripcion_id===g.id),te=f.filter(q=>q.inscripcion_id===g.id),ce=F.filter(q=>q.estado==="Aprobado").length,ae=k.length,_e=ae>0?Math.round(ce/ae*100):0;return{...g,estudiante:H,seguimiento:F,seguimientoUnidades:te,aprobados:ce,totalMods:ae,porcentaje:_e}}),C=r.map(g=>g.estudiante_id),P=t.filter(g=>!C.includes(g.id));n.innerHTML=`
    <div class="section-header">
      <div style="display: flex; align-items: center; gap: 12px;">
        <button class="btn btn-secondary btn-icon" id="btn-back" title="Volver">${m.arrowUpRight}</button>
        <div>
          <h1 class="section-title">${c(i.nombre)}</h1>
          <p style="font-size: 0.8125rem; color: var(--text-secondary); margin-top: 2px;">
            ${l?`Prof. ${c(l.nombre)} ${c(l.apellido)}`:"Sin profesor asignado"}
            <span style="margin: 0 4px;">·</span>
            <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2" style="vertical-align: middle; margin-top: -2px;"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
            ${i.duracion?c(i.duracion):"Duración sin definir"}
            ${i.descripcion?`<span style="margin: 0 4px;">·</span>${c(i.descripcion)}`:""}
          </p>
        </div>
      </div>
      <div class="section-actions">
        <button class="btn btn-secondary" id="btn-vincular-comun">${m.plus} Vincular Mód. Común</button>
        <button class="btn btn-add" id="btn-inscribir">${m.plus} Inscribir Estudiante</button>
      </div>
    </div>

    <!-- Tabs -->
    <div class="content-tabs">
      <button class="content-tab active" data-tab="seguimiento">Seguimiento Académico</button>
      <button class="content-tab" data-tab="comparativa">Vista Comparativa</button>
      <button class="content-tab" data-tab="historial">Historial Individual</button>
    </div>

    <!-- Tab Content -->
    <div id="tab-content">
      ${be(M)}
    </div>

    <style>
      .status-select {
        background: var(--bg-input);
        border: 1px solid var(--border-color);
        border-radius: 6px;
        padding: 4px 8px;
        font-size: 0.75rem;
        color: var(--text-primary);
        font-family: var(--font-family);
        cursor: pointer;
        appearance: none;
        min-width: 100px;
      }
      .status-select:focus { border-color: var(--border-color-focus); outline: none; }
      .mod-tipo { font-size: 0.6rem; padding: 2px 6px; border-radius: 4px; font-weight: 600; text-transform: uppercase; }
      .mod-tipo.especifico { background: rgba(245, 158, 11, 0.15); color: var(--accent-orange); }
      .mod-tipo.comun { background: rgba(139, 92, 246, 0.15); color: var(--accent-purple-light); }
      .progress-mini { width: 60px; height: 6px; background: rgba(255,255,255,0.08); border-radius: 3px; overflow: hidden; display: inline-block; vertical-align: middle; margin-right: 6px; }
      .progress-mini-fill { height: 100%; border-radius: 3px; background: var(--gradient-primary); transition: width 0.5s ease; }
      .inscripto-row td { vertical-align: middle; }
      .estado-badge { padding: 4px 10px; border-radius: 999px; font-size: 0.7rem; font-weight: 600; display: inline-block; }
      .estado-badge.en-curso { background: rgba(59,130,246,0.15); color: var(--accent-blue); }
      .estado-badge.regular { background: rgba(245,158,11,0.15); color: var(--accent-orange); }
      .estado-badge.completo { background: rgba(16,185,129,0.15); color: var(--accent-green); }
      .estado-badge.finalizado { background: rgba(139,92,246,0.15); color: var(--accent-purple-light); }
      .estado-badge.abandonado { background: rgba(239,68,68,0.15); color: var(--accent-red); }
      .hist-card { background: var(--bg-card); border: 1px solid var(--border-color); border-radius: 12px; padding: 16px; margin-bottom: 12px; }
      .back-arrow { transform: rotate(225deg); }
    </style>
  `,a.innerHTML=`
    <div class="widget">
      <div class="widget-header"><span class="widget-title">Resumen</span></div>
      <div class="widget-stats">
        <div class="widget-stat">
          <div class="widget-stat-value">${M.length}</div>
          <div class="widget-stat-label">Inscriptos</div>
        </div>
        <div class="widget-stat">
          <div class="widget-stat-value">${k.length}</div>
          <div class="widget-stat-label">Módulos</div>
        </div>
      </div>
    </div>
    <div class="widget">
      <div class="widget-header"><span class="widget-title">Módulos del Trayecto</span></div>
      ${k.length===0?'<p style="font-size:0.8125rem;color:var(--text-muted);">Sin módulos asignados</p>':k.map(g=>`
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;">
            <span class="mod-tipo ${g.tipo==="Específico"?"especifico":"comun"}">${g.tipo}</span>
            <span style="font-size:0.8125rem;color:var(--text-primary);">${c(g.nombre)}</span>
          </div>
        `).join("")}
    </div>
    <div class="widget widget-gradient">
      <div class="widget-header"><span class="widget-title">💡 Tip</span></div>
      <p style="font-size:0.8125rem;color:var(--text-secondary);line-height:1.5;">
        Los módulos comunes aprobados en un trayecto se conservan si el estudiante se inscribe en otro trayecto.
      </p>
    </div>
  `,(R=document.getElementById("btn-back"))==null||R.addEventListener("click",()=>{K="list",X=null,Q()}),n.querySelectorAll(".content-tab").forEach(g=>{g.addEventListener("click",()=>{n.querySelectorAll(".content-tab").forEach(te=>te.classList.remove("active")),g.classList.add("active");const H=g.dataset.tab,F=document.getElementById("tab-content");H==="seguimiento"?(F.innerHTML=be(M),ge(M,k,h)):H==="comparativa"?F.innerHTML=Re(M,k):H==="historial"&&(F.innerHTML=Fe(M,k))})}),(re=document.getElementById("btn-inscribir"))==null||re.addEventListener("click",()=>{Ue(P,e)}),(le=document.getElementById("btn-vincular-comun"))==null||le.addEventListener("click",()=>{Ve(e,p,$)}),ge(M,k,h)}function be(e,n,a){return e.length===0?'<div class="empty-state" style="padding: 32px;"><p class="empty-state-text">No hay estudiantes inscriptos. Usá el botón "Inscribir Estudiante".</p></div>':`
    <div class="table-container">
      <table class="table">
        <thead>
          <tr>
            <th>Estudiante</th>
            <th>Estado</th>
            <th>Avance</th>
            <th>Aprobados</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          ${e.map(s=>{if(!s.estudiante)return"";const i=s.estudiante,d=s.estado.toLowerCase().replace(" ","-");return`
              <tr class="inscripto-row">
                <td>
                  <div style="display:flex;align-items:center;gap:8px;">
                    <div style="width:32px;height:32px;border-radius:999px;display:flex;align-items:center;justify-content:center;font-size:0.7rem;font-weight:700;color:white;background:${ee(i.nombre+i.apellido)};flex-shrink:0;">
                      ${Z(i.nombre,i.apellido)}
                    </div>
                    <div>
                      <div style="font-weight:600;">${c(i.nombre)} ${c(i.apellido)}</div>
                      <div style="font-size:0.75rem;color:var(--text-muted);">DNI: ${c(i.dni)}</div>
                    </div>
                  </div>
                </td>
                <td><span class="estado-badge ${d}">${s.estado}</span></td>
                <td>
                  <div class="progress-mini"><div class="progress-mini-fill" style="width:${s.porcentaje}%"></div></div>
                  <span style="font-size:0.8rem;font-weight:600;">${s.porcentaje}%</span>
                </td>
                <td>${s.aprobados}/${s.totalMods}</td>
                <td>
                  <div style="display:flex;gap:4px;">
                    <button class="card-action-btn seg-detail-btn" data-inscid="${s.id}" title="Ver seguimiento" style="opacity:1;">${m.trayectos}</button>
                    <button class="card-action-btn estado-btn" data-inscid="${s.id}" title="Cambiar estado" style="opacity:1;">${m.edit}</button>
                    <button class="card-action-btn delete desinscribir-btn" data-inscid="${s.id}" title="Desinscribir" style="opacity:1;">${m.trash}</button>
                  </div>
                </td>
              </tr>
            `}).join("")}
        </tbody>
      </table>
    </div>
  `}function ge(e,n,a){document.querySelectorAll(".seg-detail-btn").forEach(s=>{s.addEventListener("click",()=>{const i=e.find(d=>d.id===s.dataset.inscid);i&&Ge(i,n,a)})}),document.querySelectorAll(".estado-btn").forEach(s=>{s.addEventListener("click",()=>{const i=e.find(d=>d.id===s.dataset.inscid);i&&Oe(i)})}),document.querySelectorAll(".desinscribir-btn").forEach(s=>{s.addEventListener("click",()=>{const i=e.find(d=>d.id===s.dataset.inscid);i!=null&&i.estudiante&&D(`¿Desinscribir a <strong>${c(i.estudiante.nombre)} ${c(i.estudiante.apellido)}</strong>?`,async()=>{for(const d of i.seguimiento)await _("seguimiento_modulos",d.id);if(i.seguimientoUnidades)for(const d of i.seguimientoUnidades)await _("seguimiento_unidades",d.id);await _("inscripciones",i.id),v("Estudiante desinscripto"),j()})})})}function Re(e,n,a){return e.length===0||n.length===0?'<div class="empty-state" style="padding:32px;"><p class="empty-state-text">Necesitás tener estudiantes inscriptos y módulos asignados para ver la vista comparativa.</p></div>':`
    <div class="table-container" style="overflow-x:auto;">
      <table class="table" style="min-width:${300+n.length*120}px;">
        <thead>
          <tr>
            <th style="position:sticky;left:0;background:var(--bg-card);z-index:2;min-width:180px;">Estudiante</th>
            ${n.map(s=>`
              <th style="text-align:center;min-width:110px;">
                <div>${c(s.nombre)}</div>
                <span class="mod-tipo ${s.tipo==="Específico"?"especifico":"comun"}" style="margin-top:4px;">${s.tipo}</span>
              </th>
            `).join("")}
            <th style="text-align:center;">Estado</th>
          </tr>
        </thead>
        <tbody>
          ${e.map(s=>{if(!s.estudiante)return"";const i=s.estudiante,d=s.estado.toLowerCase().replace(" ","-");return`
              <tr>
                <td style="position:sticky;left:0;background:var(--bg-secondary);z-index:1;">
                  <strong>${c(i.nombre)} ${c(i.apellido)}</strong>
                </td>
                ${n.map(l=>{const t=s.seguimiento.find(p=>l.refField==="modulo_id"&&p.modulo_id===l.refId||l.refField==="submodulo_id"&&p.submodulo_id===l.refId),o=(t==null?void 0:t.estado)||"Pendiente";let r="",u="";return o==="Aprobado"?(r="✓",u="rgba(16,185,129,0.2)"):o==="Desaprobado"?(r="✗",u="rgba(239,68,68,0.2)"):o==="En curso"?(r="◉",u="rgba(59,130,246,0.15)"):(r="○",u="rgba(255,255,255,0.03)"),`<td style="text-align:center;"><span style="display:inline-block;padding:4px 12px;border-radius:8px;font-size:0.8rem;background:${u};min-width:80px;">${r} ${o}</span></td>`}).join("")}
                <td style="text-align:center;"><span class="estado-badge ${d}">${s.estado}</span></td>
              </tr>
            `}).join("")}
        </tbody>
      </table>
    </div>
    <div style="display:flex;gap:16px;margin-top:12px;flex-wrap:wrap;">
      <span style="font-size:0.75rem;color:var(--text-muted);">✓ Aprobado</span>
      <span style="font-size:0.75rem;color:var(--text-muted);">✗ Desaprobado</span>
      <span style="font-size:0.75rem;color:var(--text-muted);">◉ En curso</span>
      <span style="font-size:0.75rem;color:var(--text-muted);">○ Pendiente</span>
    </div>
  `}function Fe(e,n,a,s){return e.length===0?'<div class="empty-state" style="padding:32px;"><p class="empty-state-text">No hay estudiantes inscriptos.</p></div>':`
    <div style="display:flex;flex-direction:column;gap:16px;">
      ${e.map(i=>{if(!i.estudiante)return"";const d=i.estudiante,l=i.seguimiento.filter(u=>u.modulo_id&&u.estado==="Aprobado"),t=i.seguimiento.filter(u=>u.submodulo_id&&u.estado==="Aprobado"),o=n.filter(u=>!i.seguimiento.some(p=>p.estado==="Aprobado"&&(u.refField==="modulo_id"&&p.modulo_id===u.refId||u.refField==="submodulo_id"&&p.submodulo_id===u.refId))),r=i.estado.toLowerCase().replace(" ","-");return`
          <div class="hist-card">
            <div style="display:flex;align-items:center;gap:12px;margin-bottom:12px;">
              <div style="width:40px;height:40px;border-radius:999px;display:flex;align-items:center;justify-content:center;font-size:0.8rem;font-weight:700;color:white;background:${ee(d.nombre+d.apellido)};flex-shrink:0;">
                ${Z(d.nombre,d.apellido)}
              </div>
              <div style="flex:1;">
                <div style="font-weight:600;font-size:1rem;">${c(d.nombre)} ${c(d.apellido)}</div>
                <div style="font-size:0.75rem;color:var(--text-muted);">DNI: ${c(d.dni)} · Ingreso: ${d.anio_ingreso}</div>
              </div>
              <span class="estado-badge ${r}">${i.estado}</span>
            </div>
            <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:12px;">
              <div>
                <div style="font-size:0.7rem;text-transform:uppercase;color:var(--text-muted);font-weight:600;margin-bottom:4px;">Mód. Específicos Aprobados</div>
                ${l.length>0?l.map(u=>{const p=n.find(b=>b.refField==="modulo_id"&&b.refId===u.modulo_id);return`<span class="badge badge-approved" style="margin:2px;">${p?c(p.nombre):"?"}</span>`}).join(""):'<span style="font-size:0.8rem;color:var(--text-muted);">Ninguno</span>'}
              </div>
              <div>
                <div style="font-size:0.7rem;text-transform:uppercase;color:var(--text-muted);font-weight:600;margin-bottom:4px;">Mód. Comunes Aprobados</div>
                ${t.length>0?t.map(u=>{const p=n.find(b=>b.refField==="submodulo_id"&&b.refId===u.submodulo_id);return`<span class="badge badge-active" style="margin:2px;">${p?c(p.nombre):"?"}</span>`}).join(""):'<span style="font-size:0.8rem;color:var(--text-muted);">Ninguno</span>'}
              </div>
              <div>
                <div style="font-size:0.7rem;text-transform:uppercase;color:var(--text-muted);font-weight:600;margin-bottom:4px;">Pendientes</div>
                ${o.length>0?o.map(u=>`<span class="badge badge-pending" style="margin:2px;">${c(u.nombre)}</span>`).join(""):'<span style="font-size:0.8rem;color:var(--accent-green);">¡Todo aprobado!</span>'}
              </div>
            </div>
            <div style="margin-top:8px;font-size:0.8rem;color:var(--text-secondary);">
              Avance: <strong>${i.porcentaje}%</strong> (${i.aprobados}/${i.totalMods} módulos)
            </div>
          </div>
        `}).join("")}
    </div>
  `}function fe(e,n){const a=!!e,s=`
    <div class="form-group">
      <label class="form-label">Nombre del Trayecto</label>
      <input type="text" class="form-input" id="tray-nombre" value="${a?c(e.nombre):""}" required placeholder="Ej: Desarrollo de Software" />
    </div>
    <div class="form-row">
      <div class="form-group">
        <label class="form-label">Profesor Responsable</label>
        <select class="form-select" id="tray-profesor">
          <option value="">Sin asignar</option>
          ${n.map(l=>`
            <option value="${l.id}" ${a&&e.profesor_id===l.id?"selected":""}>
              ${c(l.nombre)} ${c(l.apellido)} - ${c(l.especialidad||"")}
            </option>
          `).join("")}
        </select>
      </div>
      <div class="form-group">
        <label class="form-label">Duración (ej: "3 meses", "1 año")</label>
        <input type="text" class="form-input" id="tray-duracion" value="${a?c(e.duracion||""):""}" placeholder="Ej: 6 meses" />
      </div>
    </div>
    <div class="form-group">
      <label class="form-label">Descripción</label>
      <textarea class="form-textarea" id="tray-desc" placeholder="Descripción...">${a?c(e.descripcion||""):""}</textarea>
    </div>
  `,d=I(a?"Editar Trayecto":"Nuevo Trayecto",s,`
    <button class="btn btn-secondary" id="modal-cancel">Cancelar</button>
    <button class="btn btn-primary" id="modal-save">${a?"Guardar":"Crear Trayecto"}</button>
  `);d.querySelector("#modal-cancel").addEventListener("click",()=>d.remove()),d.querySelector("#modal-save").addEventListener("click",async()=>{const l=document.getElementById("tray-nombre").value.trim(),t=document.getElementById("tray-profesor").value||null,o=document.getElementById("tray-duracion").value.trim()||null,r=document.getElementById("tray-desc").value.trim();if(!l){v("Ingresá el nombre","error");return}try{a?(await T("trayectos_formativos",e.id,{nombre:l,profesor_id:t,duracion:o,descripcion:r}),v("Trayecto actualizado")):(await A("trayectos_formativos",{nombre:l,profesor_id:t,duracion:o,descripcion:r}),v("Trayecto creado")),d.remove(),j()}catch(u){v(u.message||"Error","error")}})}function Ue(e,n){if(e.length===0){v("Todos los estudiantes ya están inscriptos","error");return}const a=`
    <div class="form-group">
      <label class="form-label">Seleccionar Estudiante</label>
      <select class="form-select" id="insc-estudiante">
        <option value="">Elegir estudiante...</option>
        ${e.map(d=>`<option value="${d.id}">${c(d.nombre)} ${c(d.apellido)} (DNI: ${c(d.dni)})</option>`).join("")}
      </select>
    </div>
    <div class="form-group">
      <label class="form-label">Estado Inicial</label>
      <select class="form-select" id="insc-estado">
        <option value="En curso">En curso</option>
        <option value="Regular">Regular</option>
      </select>
    </div>
  `,i=I("Inscribir Estudiante",a,`
    <button class="btn btn-secondary" id="modal-cancel">Cancelar</button>
    <button class="btn btn-primary" id="modal-save">Inscribir</button>
  `);i.querySelector("#modal-cancel").addEventListener("click",()=>i.remove()),i.querySelector("#modal-save").addEventListener("click",async()=>{const d=document.getElementById("insc-estudiante").value,l=document.getElementById("insc-estado").value;if(!d){v("Seleccioná un estudiante","error");return}try{await A("inscripciones",{estudiante_id:d,trayecto_id:n,estado:l,fecha_inscripcion:new Date().toISOString().split("T")[0]}),v("Estudiante inscripto"),i.remove(),j()}catch(t){v(t.message||"Error","error")}})}function Ve(e,n,a){const s=a.map(o=>o.submodulo_id),i=n.filter(o=>!s.includes(o.id));if(i.length===0){v("Todos los módulos comunes ya están vinculados","error");return}const d=`
    <div class="form-group">
      <label class="form-label">Módulo Común a Vincular</label>
      <select class="form-select" id="vinc-submodulo">
        <option value="">Seleccionar...</option>
        ${i.map(o=>`<option value="${o.id}">${c(o.nombre)}</option>`).join("")}
      </select>
    </div>
    <p style="font-size:0.8rem;color:var(--text-muted);margin-top:8px;">
      Los módulos comunes vinculados se comparten entre trayectos. Si un estudiante lo aprobó en otro trayecto, se conserva.
    </p>
  `,t=I("Vincular Módulo Común",d,`
    <button class="btn btn-secondary" id="modal-cancel">Cancelar</button>
    <button class="btn btn-primary" id="modal-save">Vincular</button>
  `);t.querySelector("#modal-cancel").addEventListener("click",()=>t.remove()),t.querySelector("#modal-save").addEventListener("click",async()=>{const o=document.getElementById("vinc-submodulo").value;if(!o){v("Seleccioná un módulo","error");return}try{await A("trayecto_modulo_comun",{trayecto_id:e,submodulo_id:o}),v("Módulo común vinculado"),t.remove(),j()}catch(r){v(r.message||"Error","error")}})}function Ge(e,n,a){const s=e.estudiante;if(!s)return;const i=`
    <p style="margin-bottom:12px;font-size:0.9rem;color:var(--text-secondary);">
      Seguimiento de <strong>${c(s.nombre)} ${c(s.apellido)}</strong>
    </p>
    <div style="max-height:450px;overflow-y:auto;padding-right:8px;">
      ${n.map(t=>{const o=e.seguimiento.find(h=>t.refField==="modulo_id"&&h.modulo_id===t.refId||t.refField==="submodulo_id"&&h.submodulo_id===t.refId),r=(o==null?void 0:o.estado)||"Pendiente",u=(o==null?void 0:o.nota)||"",p=(o==null?void 0:o.fecha_aprobacion)||"",b=(o==null?void 0:o.docente_evaluador)||"";let w="";if(t.tipo==="Común"&&a){const h=a.filter(f=>f.submodulo_id===t.refId).sort((f,y)=>(f.orden||0)-(y.orden||0));h.length>0&&(w=`
          <div style="margin-top: 12px; padding-top: 12px; border-top: 1px dashed rgba(255,255,255,0.1);">
            <div style="font-size:0.7rem; color:var(--text-muted); text-transform:uppercase; margin-bottom:8px; display:flex; justify-content:space-between; align-items:center;">
              <span>Unidades de este módulo</span>
            </div>
            ${h.map(f=>{var C;const y=(C=e.seguimientoUnidades)==null?void 0:C.find(P=>P.unidad_id===f.id),$=(y==null?void 0:y.estado)||"Pendiente",L=(y==null?void 0:y.nota)||"",k=(y==null?void 0:y.fecha_aprobacion)||"",M=(y==null?void 0:y.docente_evaluador)||"";return`
                <div style="margin-bottom:12px; padding-left:12px; border-left: 2px solid var(--accent-purple); background: rgba(0,0,0,0.15); padding-top:8px; padding-bottom:8px; padding-right:8px; border-radius:4px;">
                  <div style="font-size:0.8rem; margin-bottom:6px; color: var(--text-primary);"><strong>${f.orden?f.orden+". ":""}${c(f.nombre)}</strong></div>
                  <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;">
                    <select class="form-select status-select seg-uni-estado" data-uni-id="${f.id}" data-seg-id="${(y==null?void 0:y.id)||""}" style="font-size:0.75rem; padding: 4px 6px;">
                      <option value="Pendiente" ${$==="Pendiente"?"selected":""}>Pendiente</option>
                      <option value="En curso" ${$==="En curso"?"selected":""}>En curso</option>
                      <option value="Aprobado" ${$==="Aprobado"?"selected":""}>Aprobado</option>
                      <option value="Desaprobado" ${$==="Desaprobado"?"selected":""}>Desaprobado</option>
                    </select>
                    <input type="number" class="form-input seg-uni-nota" data-uni-id="${f.id}" value="${L}" min="1" max="10" step="0.5" placeholder="Nota" style="font-size:0.75rem; padding: 4px 6px;" />
                    <input type="date" class="form-input seg-uni-fecha" data-uni-id="${f.id}" value="${k}" style="font-size:0.75rem; padding: 4px 6px;" />
                    <input type="text" class="form-input seg-uni-docente" data-uni-id="${f.id}" value="${c(M)}" placeholder="Docente" style="font-size:0.75rem; padding: 4px 6px;" />
                  </div>
                </div>
              `}).join("")}
          </div>
        `)}return`
          <div style="padding:12px;border:1px solid var(--border-color);border-radius:8px;margin-bottom:12px;background:var(--bg-input);">
            <div style="display:flex;align-items:center;gap:8px;margin-bottom:12px;">
              <span class="mod-tipo ${t.tipo==="Específico"?"especifico":"comun"}">${t.tipo}</span>
              <strong style="font-size:0.95rem;">${c(t.nombre)}</strong>
            </div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">
              <div class="form-group" style="gap:4px;">
                <label class="form-label" style="font-size:0.7rem;">Estado General</label>
                <select class="form-select status-select seg-estado" data-ref-field="${t.refField}" data-ref-id="${t.refId}" data-seg-id="${(o==null?void 0:o.id)||""}">
                  <option value="Pendiente" ${r==="Pendiente"?"selected":""}>Pendiente</option>
                  <option value="En curso" ${r==="En curso"?"selected":""}>En curso</option>
                  <option value="Aprobado" ${r==="Aprobado"?"selected":""}>Aprobado</option>
                  <option value="Desaprobado" ${r==="Desaprobado"?"selected":""}>Desaprobado</option>
                </select>
              </div>
              <div class="form-group" style="gap:4px;">
                <label class="form-label" style="font-size:0.7rem;">Nota General</label>
                <input type="number" class="form-input seg-nota" data-ref-id="${t.refId}" value="${u}" min="1" max="10" step="0.5" placeholder="-" style="padding:6px 10px;font-size:0.8rem;" />
              </div>
              <div class="form-group" style="gap:4px;">
                <label class="form-label" style="font-size:0.7rem;">Fecha aprobación</label>
                <input type="date" class="form-input seg-fecha" data-ref-id="${t.refId}" value="${p}" style="padding:6px 10px;font-size:0.8rem;" />
              </div>
              <div class="form-group" style="gap:4px;">
                <label class="form-label" style="font-size:0.7rem;">Docente evaluador</label>
                <input type="text" class="form-input seg-docente" data-ref-id="${t.refId}" value="${c(b)}" placeholder="Opcional" style="padding:6px 10px;font-size:0.8rem;" />
              </div>
            </div>
            ${w}
          </div >
    `}).join("")}
    </div>
  `,l=I("Seguimiento Académico",i,`
    <button class="btn btn-secondary" id="modal-cancel">Cancelar</button>
    <button class="btn btn-primary" id="modal-save">Guardar Todo</button>
  `);l.querySelector("#modal-cancel").addEventListener("click",()=>l.remove()),l.querySelector("#modal-save").addEventListener("click",async()=>{var t,o;try{const r=l.querySelectorAll(".seg-estado");for(const p of r){const b=p.dataset.refField,w=p.dataset.refId,h=p.dataset.segId,f=p.value,y=l.querySelector(`.seg-nota[data-ref-id="${w}"]`),$=l.querySelector(`.seg-fecha[data-ref-id="${w}"]`),L=l.querySelector(`.seg-docente[data-ref-id="${w}"]`),k=y!=null&&y.value?parseFloat(y.value):null,M=($==null?void 0:$.value)||null,C=((t=L==null?void 0:L.value)==null?void 0:t.trim())||null,P={estado:f,nota:k,fecha_aprobacion:M,docente_evaluador:C};if(h)await T("seguimiento_modulos",h,P);else{const R={inscripcion_id:e.id,...P};b==="modulo_id"?R.modulo_id=w:R.submodulo_id=w,await A("seguimiento_modulos",R)}}const u=l.querySelectorAll(".seg-uni-estado");for(const p of u){const b=p.dataset.uniId,w=p.dataset.segId,h=p.value,f=l.querySelector(`.seg-uni-nota[data-uni-id="${b}"]`),y=l.querySelector(`.seg-uni-fecha[data-uni-id="${b}"]`),$=l.querySelector(`.seg-uni-docente[data-uni-id="${b}"]`),L=f!=null&&f.value?parseFloat(f.value):null,k=(y==null?void 0:y.value)||null,M=((o=$==null?void 0:$.value)==null?void 0:o.trim())||null,C={estado:h,nota:L,fecha_aprobacion:k,docente_evaluador:M};w?await T("seguimiento_unidades",w,C):await A("seguimiento_unidades",{inscripcion_id:e.id,unidad_id:b,...C})}v("Seguimiento guardado"),l.remove(),j()}catch(r){v(r.message||"Error al guardar","error")}})}function Oe(e){const n=e.estudiante,a=`
    <p style="margin-bottom:12px;">Cambiar estado de <strong>${c(n.nombre)} ${c(n.apellido)}</strong></p>
    <div class="form-group">
      <select class="form-select" id="nuevo-estado">
        ${["En curso","Regular","Completo","Finalizado","Abandonado"].map(d=>`<option value="${d}" ${e.estado===d?"selected":""}>${d}</option>`).join("")}
      </select>
    </div>
  `,i=I("Estado del Estudiante",a,`
    <button class="btn btn-secondary" id="modal-cancel">Cancelar</button>
    <button class="btn btn-primary" id="modal-save">Guardar</button>
  `);i.querySelector("#modal-cancel").addEventListener("click",()=>i.remove()),i.querySelector("#modal-save").addEventListener("click",async()=>{const d=document.getElementById("nuevo-estado").value;try{await T("inscripciones",e.id,{estado:d}),v("Estado actualizado"),i.remove(),j()}catch(l){v(l.message||"Error","error")}})}async function ne(){var l;const e=S(),n=z(),a=await x("modulos"),s=await x("trayectos_formativos"),i={};a.forEach(t=>{const o=t.trayecto_id||"unassigned";i[o]||(i[o]=[]),i[o].push(t)});const d='<svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: var(--accent-purple);"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>';e.innerHTML=`
    <div class="section-header">
      <h1 class="section-title">Gestionar Módulos Específicos</h1>
      <div class="section-actions">
        <button class="btn btn-add" id="btn-add-modulo">
          ${m.plus} Nuevo Módulo Específico
        </button>
      </div>
    </div>

    ${a.length===0?`
      <div class="empty-state">
        ${m.modulos}
        <h3 class="empty-state-title">No hay módulos específicos</h3>
        <p class="empty-state-text">Creá un módulo específico y asocialo a un trayecto formativo.</p>
      </div>
    `:`
      <div class="modulos-grupos">
        ${Object.keys(i).map(t=>{const o=i[t],r=s.find(p=>p.id===t),u=r?c(r.nombre):"Módulos sin trayecto asignado";return`
            <div class="modulo-grupo" style="margin-bottom: 2.5rem;">
              <div style="display:flex;align-items:center;gap:12px;margin-bottom:1.5rem;padding-bottom:12px;border-bottom:1px solid rgba(255,255,255,0.05);">
                ${d}
                <h3 style="color:var(--text-primary);font-size:1.1rem;font-weight:600;margin:0;">${u}</h3>
                <span style="font-size:0.75rem;background:rgba(255,255,255,0.1);padding:4px 10px;border-radius:999px;color:var(--text-secondary);">${o.length} módulo${o.length!==1?"s":""}</span>
              </div>
              <div class="cards-grid">
                ${o.map(p=>{var b;return`
                    <div class="card" data-id="${p.id}">
                      <div class="card-actions">
                        <button class="card-action-btn edit-btn" data-id="${p.id}" title="Editar">${m.edit}</button>
                        <button class="card-action-btn delete card-action-btn-del" data-id="${p.id}" title="Eliminar">${m.trash}</button>
                      </div>
                      <div class="card-avatar modulo">
                        ${c(((b=p.nombre)==null?void 0:b.charAt(0))||"M")}
                      </div>
                      <div class="card-name">${c(p.nombre)}</div>
                      <div class="card-subtitle">${r?c(r.nombre):"Sin trayecto"}</div>
                      <div class="card-details">
                        <div class="card-detail">
                          <span class="card-detail-label">Año</span>
                          <span class="card-detail-value">${p.anio||"-"}</span>
                        </div>
                      </div>
                    </div>
                  `}).join("")}
              </div>
            </div>
          `}).join("")}
      </div>
    `}
  `,n.innerHTML=`
    <div class="widget">
      <div class="widget-header"><span class="widget-title">Módulos Específicos</span></div>
      <div class="widget-stats">
        <div class="widget-stat">
          <div class="widget-stat-value">${a.length}</div>
          <div class="widget-stat-label">Total</div>
        </div>
      </div>
    </div>
  `,(l=document.getElementById("btn-add-modulo"))==null||l.addEventListener("click",()=>ye(null,s)),e.querySelectorAll(".edit-btn").forEach(t=>{t.addEventListener("click",o=>{o.stopPropagation();const r=a.find(u=>u.id===t.dataset.id);r&&ye(r,s)})}),e.querySelectorAll(".card-action-btn-del").forEach(t=>{t.addEventListener("click",o=>{o.stopPropagation();const r=a.find(u=>u.id===t.dataset.id);r&&D(`¿Eliminar el módulo <strong>${c(r.nombre)}</strong>?`,async()=>{await _("modulos",r.id),v("Módulo eliminado"),ne()})})})}function ye(e,n){const a=!!e,s=`
    <div class="form-group">
      <label class="form-label">Nombre del Módulo Específico</label>
      <input type="text" class="form-input" id="mod-nombre" value="${a?c(e.nombre):""}" required placeholder="Ej: Programación I" />
    </div>
    <div class="form-row">
      <div class="form-group">
        <label class="form-label">Año</label>
        <input type="number" class="form-input" id="mod-anio" value="${a&&e.anio||""}" placeholder="2024" min="2000" max="2100" />
      </div>
      <div class="form-group">
        <label class="form-label">Trayecto Formativo</label>
        <select class="form-select" id="mod-trayecto">
          <option value="">Sin trayecto</option>
          ${n.map(l=>`
            <option value="${l.id}" ${a&&e.trayecto_id===l.id?"selected":""}>${c(l.nombre)}</option>
          `).join("")}
        </select>
      </div>
    </div>
  `,d=I(a?"Editar Módulo":"Nuevo Módulo",s,`
    <button class="btn btn-secondary" id="modal-cancel">Cancelar</button>
    <button class="btn btn-primary" id="modal-save">${a?"Guardar":"Crear Módulo"}</button>
  `);d.querySelector("#modal-cancel").addEventListener("click",()=>d.remove()),d.querySelector("#modal-save").addEventListener("click",async()=>{const l=document.getElementById("mod-nombre").value.trim(),t=parseInt(document.getElementById("mod-anio").value)||null,o=document.getElementById("mod-trayecto").value||null;if(!l){v("Ingresá el nombre del módulo específico","error");return}try{a?(await T("modulos",e.id,{nombre:l,anio:t,trayecto_id:o}),v("Módulo específico actualizado")):(await A("modulos",{nombre:l,anio:t,trayecto_id:o}),v("Módulo específico creado")),d.remove(),ne()}catch(r){v(r.message||"Error","error")}})}let Je=null;async function O(){var l;const e=S(),n=z(),a=await x("submodulos"),s=await x("modulos"),i=await x("unidades");e.innerHTML=`
    <div class="section-header">
      <h1 class="section-title">Gestionar Módulos Comunes</h1>
      <div class="section-actions">
        <button class="btn btn-add" id="btn-add-submodulo">
          ${m.plus} Nuevo Módulo Común
        </button>
      </div>
    </div>

    ${a.length===0?`
      <div class="empty-state">
        ${m.submodulos}
        <h3 class="empty-state-title">No hay módulos comunes</h3>
        <p class="empty-state-text">Creá un módulo común y asocialo a un módulo específico existente.</p>
      </div>
    `:`
      <div class="cards-grid" style="grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));">
        ${a.map(t=>{var u;const o=s.find(p=>p.id===t.modulo_id),r=i.filter(p=>p.submodulo_id===t.id).sort((p,b)=>(p.orden||0)-(b.orden||0));return t.id,`
            <div class="card" data-id="${t.id}" style="align-items: stretch; cursor: default;">
              <div class="card-actions">
                <button class="card-action-btn edit-btn" data-id="${t.id}" title="Editar">${m.edit}</button>
                <button class="card-action-btn delete card-action-btn-del" data-id="${t.id}" title="Eliminar">${m.trash}</button>
              </div>
              <div style="display: flex; align-items: center; gap: 12px;">
                <div class="card-avatar submodulo" style="width: 48px; height: 48px; font-size: 1rem; flex-shrink: 0;">
                  ${c(((u=t.nombre)==null?void 0:u.charAt(0))||"M")}
                </div>
                <div>
                  <div class="card-name" style="text-align: left;">${c(t.nombre)}</div>
                  <div class="card-subtitle" style="text-align: left; margin-top: 2px;">Mód. Específico: ${o?c(o.nombre):"Sin módulo"}</div>
                </div>
              </div>

              <!-- Unidades -->
              <div style="width: 100%; margin-top: 8px; padding-top: 8px; border-top: 1px solid var(--border-color);">
                <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;">
                  <span style="font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.5px; color: var(--text-muted); font-weight: 600;">
                    Unidades (${r.length})
                  </span>
                  <button class="btn btn-secondary add-unidad-btn" data-subid="${t.id}" style="padding: 4px 10px; font-size: 0.75rem; border-radius: 6px;">
                    ${m.plus} Agregar
                  </button>
                </div>
                ${r.length===0?`
                  <p style="font-size: 0.8rem; color: var(--text-muted); text-align: center; padding: 8px 0;">Sin unidades</p>
                `:`
                  <div class="unidades-list" data-subid="${t.id}">
                    ${r.map((p,b)=>`
                      <div class="unidad-item" data-uid="${p.id}">
                        <span class="unidad-orden">${p.orden||b+1}</span>
                        <span class="unidad-nombre">${c(p.nombre)}</span>
                        <div class="unidad-actions">
                          <button class="unidad-action-btn edit-unidad-btn" data-uid="${p.id}" data-subid="${t.id}" title="Editar">${m.edit}</button>
                          <button class="unidad-action-btn delete del-unidad-btn" data-uid="${p.id}" title="Eliminar">${m.trash}</button>
                        </div>
                      </div>
                    `).join("")}
                  </div>
                `}
              </div>
            </div>
          `}).join("")}
      </div>
    `}

    <style>
      .unidad-item {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 6px 8px;
        border-radius: 8px;
        background: rgba(255, 255, 255, 0.03);
        border: 1px solid var(--border-color);
        margin-bottom: 4px;
        transition: all 0.2s ease;
      }
      .unidad-item:hover {
        background: rgba(139, 92, 246, 0.06);
        border-color: var(--border-color-light);
      }
      .unidad-orden {
        width: 24px;
        height: 24px;
        border-radius: 6px;
        background: var(--gradient-purple);
        color: white;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 0.7rem;
        font-weight: 700;
        flex-shrink: 0;
      }
      .unidad-nombre {
        flex: 1;
        font-size: 0.8125rem;
        color: var(--text-primary);
      }
      .unidad-actions {
        display: flex;
        gap: 4px;
        opacity: 0;
        transition: opacity 0.2s;
      }
      .unidad-item:hover .unidad-actions {
        opacity: 1;
      }
      .unidad-action-btn {
        width: 24px;
        height: 24px;
        border-radius: 4px;
        border: 1px solid var(--border-color);
        background: var(--bg-secondary);
        color: var(--text-muted);
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: all 0.15s;
        padding: 0;
      }
      .unidad-action-btn svg {
        width: 12px;
        height: 12px;
      }
      .unidad-action-btn:hover {
        border-color: var(--accent-purple);
        color: var(--accent-purple-light);
      }
      .unidad-action-btn.delete:hover {
        border-color: var(--accent-red);
        color: var(--accent-red);
        background: rgba(239, 68, 68, 0.1);
      }
    </style>
  `;const d=i.length;n.innerHTML=`
    <div class="widget">
      <div class="widget-header"><span class="widget-title">Módulos Comunes</span></div>
      <div class="widget-stats">
        <div class="widget-stat">
          <div class="widget-stat-value">${a.length}</div>
          <div class="widget-stat-label">Módulos</div>
        </div>
        <div class="widget-stat">
          <div class="widget-stat-value">${d}</div>
          <div class="widget-stat-label">Unidades</div>
        </div>
      </div>
    </div>
    <div class="widget widget-gradient">
      <div class="widget-header"><span class="widget-title">📖 Unidades</span></div>
      <p style="font-size: 0.8125rem; color: var(--text-secondary); line-height: 1.5;">
        Cada módulo común puede contener múltiples unidades (Unidad 1, Unidad 2, etc.). Usá el botón "Agregar" en cada tarjeta.
      </p>
    </div>
  `,(l=document.getElementById("btn-add-submodulo"))==null||l.addEventListener("click",()=>he(null,s)),e.querySelectorAll(".edit-btn").forEach(t=>{t.addEventListener("click",o=>{o.stopPropagation();const r=a.find(u=>u.id===t.dataset.id);r&&he(r,s)})}),e.querySelectorAll(".card-action-btn-del").forEach(t=>{t.addEventListener("click",o=>{o.stopPropagation();const r=a.find(u=>u.id===t.dataset.id);r&&D(`¿Eliminar el módulo común <strong>${c(r.nombre)}</strong>? Esto también eliminará sus unidades.`,async()=>{const u=i.filter(p=>p.submodulo_id===r.id);for(const p of u)await _("unidades",p.id);await _("submodulos",r.id),v("Módulo común eliminado"),O()})})}),e.querySelectorAll(".add-unidad-btn").forEach(t=>{t.addEventListener("click",o=>{o.stopPropagation();const r=t.dataset.subid,p=i.filter(b=>b.submodulo_id===r).length+1;xe(null,r,p)})}),e.querySelectorAll(".edit-unidad-btn").forEach(t=>{t.addEventListener("click",o=>{o.stopPropagation();const r=i.find(u=>u.id===t.dataset.uid);r&&xe(r,t.dataset.subid)})}),e.querySelectorAll(".del-unidad-btn").forEach(t=>{t.addEventListener("click",o=>{o.stopPropagation();const r=i.find(u=>u.id===t.dataset.uid);r&&D(`¿Eliminar la unidad <strong>${c(r.nombre)}</strong>?`,async()=>{await _("unidades",r.id),v("Unidad eliminada"),O()})})})}function he(e,n){const a=!!e,s=`
    <div class="form-group">
      <label class="form-label">Nombre del Módulo Común</label>
      <input type="text" class="form-input" id="sub-nombre" value="${a?c(e.nombre):""}" required placeholder="Ej: Comunicación" />
    </div>
    <div class="form-group">
      <label class="form-label">Módulo Específico Asociado</label>
      <select class="form-select" id="sub-modulo">
        <option value="">Seleccionar módulo específico...</option>
        ${n.map(l=>`
          <option value="${l.id}" ${a&&e.modulo_id===l.id?"selected":""}>${c(l.nombre)}</option>
        `).join("")}
      </select>
    </div>
  `,d=I(a?"Editar Módulo Común":"Nuevo Módulo Común",s,`
    <button class="btn btn-secondary" id="modal-cancel">Cancelar</button>
    <button class="btn btn-primary" id="modal-save">${a?"Guardar":"Crear Módulo Común"}</button>
  `);d.querySelector("#modal-cancel").addEventListener("click",()=>d.remove()),d.querySelector("#modal-save").addEventListener("click",async()=>{const l=document.getElementById("sub-nombre").value.trim(),t=document.getElementById("sub-modulo").value||null;if(!l){v("Ingresá el nombre del módulo común","error");return}if(!t){v("Seleccioná un módulo específico","error");return}try{a?(await T("submodulos",e.id,{nombre:l,modulo_id:t}),v("Módulo común actualizado")):(await A("submodulos",{nombre:l,modulo_id:t}),v("Módulo común creado")),d.remove(),O()}catch(o){v(o.message||"Error","error")}})}function xe(e,n,a=1){const s=!!e,i=`
    <div class="form-row">
      <div class="form-group">
        <label class="form-label">Número de Unidad</label>
        <input type="number" class="form-input" id="unidad-orden" value="${s?e.orden||1:a}" required min="1" />
      </div>
      <div class="form-group">
        <label class="form-label">Nombre de la Unidad</label>
        <input type="text" class="form-input" id="unidad-nombre" value="${s?c(e.nombre):`Unidad ${a}`}" required placeholder="Ej: Unidad 1 - Introducción" />
      </div>
    </div>
  `,l=I(s?"Editar Unidad":"Nueva Unidad",i,`
    <button class="btn btn-secondary" id="modal-cancel">Cancelar</button>
    <button class="btn btn-primary" id="modal-save">${s?"Guardar":"Agregar Unidad"}</button>
  `);l.querySelector("#modal-cancel").addEventListener("click",()=>l.remove()),l.querySelector("#modal-save").addEventListener("click",async()=>{const t=document.getElementById("unidad-nombre").value.trim(),o=parseInt(document.getElementById("unidad-orden").value)||1;if(!t){v("Ingresá el nombre de la unidad","error");return}try{s?(await T("unidades",e.id,{nombre:t,orden:o}),v("Unidad actualizada")):(await A("unidades",{nombre:t,orden:o,submodulo_id:n}),v("Unidad agregada")),l.remove(),O()}catch(r){v(r.message||"Error","error")}})}async function Ye(){const e=S(),n=z(),a=await x("trayectos_formativos"),s=await x("estudiantes"),i=await x("inscripciones"),d='<svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: var(--accent-blue);"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>';let l=0,t=0;e.innerHTML=`
    <div class="section-header">
      <h1 class="section-title">Aprobaciones por Trayecto Formativo</h1>
    </div>

    ${a.length===0?`
      <div class="empty-state">
        ${m.trayectos}
        <h3 class="empty-state-title">No hay trayectos formativos</h3>
        <p class="empty-state-text">Creá trayectos e inscribí estudiantes para ver sus aprobaciones.</p>
      </div>
    `:`
      <div class="trayectos-aprobaciones-list">
        ${a.map(o=>{const r=i.filter(h=>h.trayecto_id===o.id);let u=0,p=0,b=0;const w=r.map(h=>{const f=s.find(L=>L.id===h.estudiante_id);if(!f)return"";let y="En curso",$="en-curso";return h.estado==="Finalizado"||h.estado==="Completo"?(y="Aprobado",$="completo",u++,l++):h.estado==="Abandonado"?(y="Desaprobado",$="abandonado",p++,t++):b++,`
          <tr>
            <td>
              <div style="display:flex;align-items:center;gap:8px;">
                <div>
                  <div style="font-weight:600;">${c(f.nombre)} ${c(f.apellido)}</div>
                  <div style="font-size:0.75rem;color:var(--text-muted);">DNI: ${c(f.dni)}</div>
                </div>
              </div>
            </td>
            <td>${Ae(h.fecha_inscripcion)}</td>
            <td><span class="estado-badge ${$}">${y}</span></td>
          </tr>
        `}).join("");return`
        <div class="modulo-grupo" style="margin-bottom: 2.5rem; background: var(--bg-card); border: 1px solid var(--border-color); border-radius: 12px; overflow: hidden;">
          <div style="display:flex;align-items:center;justify-content:space-between;padding:16px 20px;background:rgba(255,255,255,0.02);border-bottom:1px solid rgba(255,255,255,0.05);cursor:pointer;" class="trayecto-header" data-id="${o.id}">
            <div style="display:flex;align-items:center;gap:12px;">
              ${d}
              <h3 style="color:var(--text-primary);font-size:1.1rem;font-weight:600;margin:0;">${c(o.nombre)}</h3>
            </div>
            <div style="display:flex;gap:8px;font-size:0.8rem;">
              <span style="background:rgba(16,185,129,0.15);color:var(--accent-green);padding:4px 10px;border-radius:999px;">${u} Aprobados</span>
              <span style="background:rgba(239,68,68,0.15);color:var(--accent-red);padding:4px 10px;border-radius:999px;">${p} Desaprobados</span>
              <span style="background:rgba(59,130,246,0.15);color:var(--accent-blue);padding:4px 10px;border-radius:999px;">${b} En curso</span>
              <span style="margin-left:8px;color:var(--text-muted); transition: transform 0.3s;" class="chevron" id="chevron-${o.id}">${m.chevronDown}</span>
            </div>
          </div>
          <div class="trayecto-body" id="body-${o.id}" style="display:none; padding: 0;">
            ${r.length===0?`
              <div style="padding: 20px; text-align: center; color: var(--text-muted); font-size: 0.9rem;">
                No hay estudiantes inscriptos en este trayecto.
              </div>
            `:`
              <div class="table-container" style="border:none; border-radius:0;">
                <table class="table" style="margin:0;">
                  <thead>
                    <tr>
                      <th>Estudiante</th>
                      <th>Fecha Inscripción</th>
                      <th>Estado Final</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${w}
                  </tbody>
                </table>
              </div>
            `}
          </div>
        </div>
      `}).join("")}
      </div>
    `}
    <style>
      .estado-badge { padding: 4px 10px; border-radius: 999px; font-size: 0.7rem; font-weight: 600; display: inline-block; }
      .estado-badge.en-curso { background: rgba(59,130,246,0.15); color: var(--accent-blue); }
      .estado-badge.completo { background: rgba(16,185,129,0.15); color: var(--accent-green); }
      .estado-badge.abandonado { background: rgba(239,68,68,0.15); color: var(--accent-red); }
    </style>
  `,n.innerHTML=`
    <div class="widget">
      <div class="widget-header"><span class="widget-title">Resumen Histórico General</span></div>
      <div class="widget-stats">
        <div class="widget-stat">
          <div class="widget-stat-value">${l}</div>
          <div class="widget-stat-label">Total Aprobados</div>
        </div>
        <div class="widget-stat">
          <div class="widget-stat-value">${t}</div>
          <div class="widget-stat-label">Total Desaprobados</div>
        </div>
      </div>
      <div class="widget-bar" style="margin-top: 12px;">
        <div class="widget-bar-fill" style="width: ${l+t>0?Math.round(l/(l+t)*100):0}%; background: linear-gradient(90deg, #10b981, #34d399);"></div>
      </div>
    </div>
  `,document.querySelectorAll(".trayecto-header").forEach(o=>{o.addEventListener("click",()=>{const r=o.dataset.id,u=document.getElementById(`body-${r}`),p=document.getElementById(`chevron-${r}`);u.style.display==="none"?(u.style.display="block",p.style.transform="rotate(180deg)"):(u.style.display="none",p.style.transform="rotate(0deg)")})})}async function We(){var t,o;const e=S(),n=z(),a=await x("estudiantes"),s=await x("modulos"),i=await x("aprobaciones"),d=await x("submodulos"),l=[...new Set(a.map(r=>r.anio_ingreso))].sort((r,u)=>u-r);e.innerHTML=`
    <div class="section-header">
      <h1 class="section-title">Reportes y Consultas</h1>
    </div>

    <div class="report-filters">
      <div class="report-filter-group">
        <span class="report-filter-label">Buscar estudiante</span>
        <div class="search-bar" style="max-width:none;">
          ${m.search}
          <input type="text" id="report-search" placeholder="Nombre, apellido o DNI..." />
        </div>
      </div>
      <div class="report-filter-group">
        <span class="report-filter-label">Año de cursado</span>
        <select class="form-select" id="report-anio">
          <option value="">Todos</option>
          ${l.map(r=>`<option value="${r}">${r}</option>`).join("")}
        </select>
      </div>
      <div class="report-filter-group">
        <span class="report-filter-label">Módulo Específico</span>
        <select class="form-select" id="report-modulo">
          <option value="">Todos</option>
          ${s.map(r=>`<option value="${r.id}">${c(r.nombre)}</option>`).join("")}
        </select>
      </div>
      <div class="report-filter-group">
        <span class="report-filter-label">Estado</span>
        <select class="form-select" id="report-estado">
          <option value="">Todos</option>
          <option value="Activo">Activo</option>
          <option value="Inactivo">Inactivo</option>
          <option value="Egresado">Egresado</option>
        </select>
      </div>
      <div class="report-filter-group" style="justify-content: flex-end;">
        <button class="btn btn-primary" id="report-apply" style="margin-top: auto;">
          ${m.search} Buscar
        </button>
      </div>
    </div>

    <div id="report-results">
      <div class="table-container">
        <table class="table">
          <thead>
            <tr>
              <th>Estudiante</th>
              <th>DNI</th>
              <th>Año Ingreso</th>
              <th>Estado</th>
              <th>Mód. Específicos Aprobados</th>
              <th>Mód. Comunes Aprobados</th>
            </tr>
          </thead>
          <tbody id="report-tbody">
            ${Ie(a,i,s,d)}
          </tbody>
        </table>
      </div>
    </div>
  `,n.innerHTML=`
    <div class="widget">
      <div class="widget-header"><span class="widget-title">Estadísticas Generales</span></div>
      <div class="widget-stats">
        <div class="widget-stat">
          <div class="widget-stat-value">${a.length}</div>
          <div class="widget-stat-label">Estudiantes</div>
        </div>
        <div class="widget-stat">
          <div class="widget-stat-value">${i.length}</div>
          <div class="widget-stat-label">Aprobaciones</div>
        </div>
      </div>
    </div>
    <div class="widget">
      <div class="widget-header"><span class="widget-title">Por Año</span></div>
      ${l.map(r=>{const u=a.filter(b=>b.anio_ingreso===r).length,p=a.length>0?Math.round(u/a.length*100):0;return`
          <div style="margin-bottom: 8px;">
            <div style="display: flex; justify-content: space-between; font-size: 0.8125rem; margin-bottom: 4px;">
              <span style="color: var(--text-secondary);">${r}</span>
              <span style="color: var(--text-primary); font-weight: 600;">${u}</span>
            </div>
            <div class="widget-bar"><div class="widget-bar-fill" style="width: ${p}%"></div></div>
          </div>
        `}).join("")}
    </div>
  `,(t=document.getElementById("report-apply"))==null||t.addEventListener("click",()=>{$e(a,i,s,d)}),(o=document.getElementById("report-search"))==null||o.addEventListener("input",()=>{$e(a,i,s,d)})}function $e(e,n,a,s){var u,p,b,w;const i=(((u=document.getElementById("report-search"))==null?void 0:u.value)||"").toLowerCase(),d=(p=document.getElementById("report-anio"))==null?void 0:p.value,l=(b=document.getElementById("report-modulo"))==null?void 0:b.value,t=(w=document.getElementById("report-estado"))==null?void 0:w.value;let o=[...e];if(i&&(o=o.filter(h=>`${h.nombre} ${h.apellido} ${h.dni}`.toLowerCase().includes(i))),d&&(o=o.filter(h=>h.anio_ingreso===parseInt(d))),t&&(o=o.filter(h=>h.estado===t)),l){const h=n.filter(f=>f.modulo_id===l).map(f=>f.estudiante_id);o=o.filter(f=>h.includes(f.id))}const r=document.getElementById("report-tbody");r&&(r.innerHTML=Ie(o,n,a,s))}function Ie(e,n,a,s){return e.length===0?'<tr><td colspan="6" style="text-align: center; color: var(--text-muted); padding: 32px;">No se encontraron resultados</td></tr>':e.map(i=>{const d=n.filter(o=>o.estudiante_id===i.id),l=d.filter(o=>o.modulo_id).map(o=>{var r;return((r=a.find(u=>u.id===o.modulo_id))==null?void 0:r.nombre)||""}).filter(Boolean),t=d.filter(o=>o.submodulo_id).map(o=>{var r;return((r=s.find(u=>u.id===o.submodulo_id))==null?void 0:r.nombre)||""}).filter(Boolean);return`
      <tr>
        <td><strong>${c(i.nombre)} ${c(i.apellido)}</strong></td>
        <td>${c(i.dni)}</td>
        <td>${i.anio_ingreso}</td>
        <td><span class="badge ${i.estado==="Activo"?"badge-active":i.estado==="Egresado"?"badge-approved":"badge-inactive"}">${i.estado}</span></td>
        <td>${l.length>0?l.map(o=>`<span class="badge badge-approved" style="margin: 2px;">${c(o)}</span>`).join(""):'<span style="color: var(--text-muted);">—</span>'}</td>
        <td>${t.length>0?t.map(o=>`<span class="badge badge-pending" style="margin: 2px;">${c(o)}</span>`).join(""):'<span style="color: var(--text-muted);">—</span>'}</td>
      </tr>
    `}).join("")}function Ke(){je(e=>{e?Xe():oe()}),oe()}function Xe(){Be(),B("dashboard",De),B("estudiantes",Y),B("profesores",W),B("trayectos",j),B("modulos",ne),B("submodulos",O),B("aprobaciones",Ye),B("reportes",We),ze()}Ke();
