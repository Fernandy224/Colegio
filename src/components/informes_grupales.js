// ============================================
// Generación de Informes Grupales (PDF)
// ============================================
import { fetchAll } from '../utils/data.js';
import { sanitize, showToast } from '../utils/helpers.js';
import { getCurrentYear } from '../utils/state.js';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

export async function openInformeGrupalModal(submoduloId, submoduloNombre) {
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = `
    <div class="modal" style="max-width:700px;width:95vw;">
      <div class="modal-header">
        <h3 class="modal-title">📊 Informe Grupal — ${submoduloNombre}</h3>
        <button class="modal-close" id="modal-close-btn">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
      <div class="modal-body" id="informe-modal-body">
        <div style="padding:40px;text-align:center;color:var(--text-muted);">Cargando datos...</div>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);

  overlay.querySelector('#modal-close-btn').addEventListener('click', () => overlay.remove());
  overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove(); });

  try {
    const tmcLinks = await fetchAll('trayecto_modulo_comun');
    const trayectosIds = tmcLinks.filter(l => l.submodulo_id === submoduloId).map(l => l.trayecto_id);
    const todosTrayectos = await fetchAll('trayectos_formativos');
    const trayectosAsociados = todosTrayectos.filter(t => trayectosIds.includes(t.id));

    const body = overlay.querySelector('#informe-modal-body');

    if (trayectosAsociados.length === 0) {
      body.innerHTML = `<div style="padding:32px;text-align:center;color:var(--text-muted);">Este módulo no está asociado a ningún trayecto formativo.</div>`;
      return;
    }

    const inscripciones = await fetchAll('inscripciones');
    const estudiantes = await fetchAll('estudiantes');
    const profesores = await fetchAll('profesores');
    const submodulos = await fetchAll('submodulos');

    const modActual = submodulos.find(s => s.id === submoduloId);
    const profModulo = modActual && modActual.profesor_id ? profesores.find(p => p.id === modActual.profesor_id) : null;

    const tabsHTML = trayectosAsociados.map((t, idx) => `
      <button class="content-tab ${idx === 0 ? 'active' : ''}" data-trayectoid="${t.id}">${sanitize(t.nombre)}</button>
    `).join('');

    body.innerHTML = `
      <div class="content-tabs" style="margin-bottom: 16px;">
        ${tabsHTML}
      </div>
      <div id="informe-tab-content">
        <div style="padding:40px;text-align:center;color:var(--text-muted);">Cargando...</div>
      </div>
    `;

    const tabContent = body.querySelector('#informe-tab-content');

    const loadTab = (trayectoId) => {
      const insRelev = inscripciones.filter(i => i.trayecto_id === trayectoId);
      const trayectoActual = trayectosAsociados.find(t => t.id === trayectoId);
      const profTrayecto = trayectoActual && trayectoActual.profesor_id ? profesores.find(p => p.id === trayectoActual.profesor_id) : null;
      
      const estIds = insRelev.map(i => i.estudiante_id);
      const estAsociados = estudiantes.filter(e => estIds.includes(e.id));
      const varones = estAsociados.filter(e => e.genero === 'Masculino').length;
      const mujeres = estAsociados.filter(e => e.genero === 'Femenino').length;
      const total = estAsociados.length;

      const hoy = new Date();
      const fechaHoy = `${hoy.getDate().toString().padStart(2, '0')}/${(hoy.getMonth() + 1).toString().padStart(2, '0')}/${hoy.getFullYear()}`;

      tabContent.innerHTML = `
        <div style="display:flex;flex-direction:column;gap:14px;">
          <div style="display:flex;gap:12px;flex-wrap:wrap;">
            <div style="flex:1;min-width:120px;padding:10px 14px;background:rgba(139,92,246,0.08);border-radius:8px;text-align:center;">
              <div style="font-size:1.3rem;font-weight:700;color:var(--accent-purple-light);">${total}</div>
              <div style="font-size:0.7rem;color:var(--text-muted);">Estudiantes</div>
            </div>
            <div style="flex:1;min-width:120px;padding:10px 14px;background:rgba(59,130,246,0.08);border-radius:8px;text-align:center;">
              <div style="font-size:1.3rem;font-weight:700;color:#60a5fa;">${varones}</div>
              <div style="font-size:0.7rem;color:var(--text-muted);">Varones</div>
            </div>
            <div style="flex:1;min-width:120px;padding:10px 14px;background:rgba(236,72,153,0.08);border-radius:8px;text-align:center;">
              <div style="font-size:1.3rem;font-weight:700;color:#f472b6;">${mujeres}</div>
              <div style="font-size:0.7rem;color:var(--text-muted);">Mujeres</div>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Fecha del informe</label>
            <input type="text" class="form-input" id="inf-fecha" value="${fechaHoy}" placeholder="DD/MM/AAAA" />
          </div>

          <div class="form-group">
            <label class="form-label">Sección 1 — Características del grupo</label>
            <textarea class="form-input" id="inf-caract" rows="4" placeholder="Describir las características del grupo de estudiantes..."  style="resize:vertical;min-height:80px;"></textarea>
          </div>

          <div class="form-group">
            <label class="form-label">Sección 2 — El grupo en relación con los contenidos trabajados</label>
            <textarea class="form-input" id="inf-contenidos" rows="4" placeholder="Describir la relación del grupo con los contenidos..." style="resize:vertical;min-height:80px;"></textarea>
          </div>

          <div class="form-group">
            <label class="form-label">Sección 3 — Estado del módulo</label>
            <select class="form-select" id="inf-estado">
              <option value="completado">Módulo completado</option>
              <option value="en_desarrollo">Módulo en desarrollo</option>
            </select>
          </div>

          <div style="display:flex;justify-content:flex-end;gap:10px;margin-top:8px;">
            <button class="btn btn-primary" id="btn-generar-informe">📥 Generar PDF</button>
          </div>
        </div>
      `;

      // Evento generar PDF
      tabContent.querySelector('#btn-generar-informe').addEventListener('click', async () => {
        const caracteristicas = document.getElementById('inf-caract').value.trim();
        const contenidos = document.getElementById('inf-contenidos').value.trim();
        const estado = document.getElementById('inf-estado').value;
        const fecha = document.getElementById('inf-fecha').value.trim();

        if (!caracteristicas || !contenidos) {
          showToast('Completá las secciones 1 y 2 del informe', 'error');
          return;
        }

        try {
          await generarInformePDF({
            trayecto: trayectoActual,
            profTrayecto,
            modulo: modActual,
            profModulo,
            fecha,
            totalEstudiantes: total,
            varones,
            mujeres,
            caracteristicas,
            contenidos,
            estado
          });
          showToast('Informe grupal generado exitosamente');
        } catch (err) {
          showToast('Error al generar el informe: ' + err.message, 'error');
        }
      });
    };

    // Load first tab
    loadTab(trayectosAsociados[0].id);

    // Tab switching
    body.querySelectorAll('.content-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        body.querySelectorAll('.content-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        loadTab(tab.dataset.trayectoid);
      });
    });

  } catch (err) {
    const body = overlay.querySelector('#informe-modal-body');
    body.innerHTML = `<div style="padding:32px;text-align:center;color:var(--accent-red);">Error al cargar: ${err.message}</div>`;
  }
}

// ========================================
// Generación del PDF del Informe Grupal
// ========================================
async function generarInformePDF(data) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
    putOnlyUsedFonts: true
  });

  // Helper function to load images cleanly as Data URL and get natural dimensions
  const loadImageDataURL = async (src) => {
    try {
      const resp = await fetch(src);
      if (!resp.ok) return null;
      const contentType = resp.headers.get('content-type');
      if (!contentType || !contentType.startsWith('image/')) return null;
      const blob = await resp.blob();
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const img = new Image();
          img.onload = () => {
            resolve({
              data: reader.result,
              type: contentType === 'image/jpeg' || contentType === 'image/jpg' ? 'JPEG' : 'PNG',
              width: img.width,
              height: img.height
            });
          };
          img.onerror = () => resolve(null);
          img.src = reader.result;
        };
        reader.readAsDataURL(blob);
      });
    } catch (err) {
      return null;
    }
  };

  // Cargar imagen del encabezado específica para informes grupales
  const encabezado = await loadImageDataURL('/imagenes/encabezado-informe.png');

  const pageWidth = doc.internal.pageSize.getWidth();
  const marginX = 14;
  const marginTop = 10;
  let cursorY = marginTop;

  // ========== ENCABEZADO BANNER ==========
  if (encabezado && encabezado.data) {
    const imgWidth = pageWidth;
    const aspect = encabezado.height / encabezado.width;
    const imgHeight = imgWidth * aspect;
    doc.addImage(encabezado.data, encabezado.type, 0, marginTop, imgWidth, imgHeight);

    cursorY = marginTop + imgHeight + 8;
  } else {
    cursorY = 20;
  }

  // ========== TÍTULO ==========
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('NUCLEAMIENTO N° 6', pageWidth / 2, cursorY, { align: 'center' });
  cursorY += 6;
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text('Escuela para Jóvenes, Adultos y Formación Profesional', pageWidth / 2, cursorY, { align: 'center' });
  cursorY += 10;

  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('INFORME GRUPAL', pageWidth / 2, cursorY, { align: 'center' });
  cursorY += 6;
  doc.setFontSize(12);
  doc.text(String(getCurrentYear()), pageWidth / 2, cursorY, { align: 'center' });
  cursorY += 12;

  // ========== DATOS INSTITUCIONALES ==========
  doc.setFontSize(11);
  const writeLabel = (label, value, y) => {
    doc.setFont('helvetica', 'bold');
    doc.text(label, marginX, y);
    const lw = doc.getTextWidth(label);
    doc.setFont('helvetica', 'normal');
    doc.text(String(value || ''), marginX + lw + 2, y);
  };

  writeLabel('ESTABLECIMIENTO: ', 'NUCLEAMIENTO EDUCATIVO N° 6', cursorY);
  cursorY += 8;

  writeLabel('TRAYECTO FORMATIVO: ', data.trayecto ? data.trayecto.nombre : '', cursorY);
  cursorY += 8;

  const profTNombre = data.profTrayecto ? `${data.profTrayecto.nombre} ${data.profTrayecto.apellido || ''}` : '';
  writeLabel('M.E.P: ', profTNombre, cursorY);
  cursorY += 8;

  writeLabel('MODULO TRANSVERSAL: ', 'Seguridad e Higiene Laboral', cursorY);
  cursorY += 8;

  const profMNombre = data.profModulo ? `${data.profModulo.nombre} ${data.profModulo.apellido || ''}` : '';
  writeLabel('M.E.P: ', profMNombre, cursorY);
  cursorY += 8;

  writeLabel('FECHA: ', data.fecha, cursorY);
  cursorY += 8;

  writeLabel('CANTIDAD DE ESTUDIANTES: ', String(data.totalEstudiantes), cursorY);
  cursorY += 8;

  doc.setFont('helvetica', 'bold');
  doc.text(`VARONES: ${data.varones}`, marginX, cursorY);
  doc.text(`MUJERES: ${data.mujeres}`, marginX + 60, cursorY);
  cursorY += 14;

  // ========== SECCIÓN 1 ==========
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Características del grupo:', marginX, cursorY);
  doc.setLineWidth(0.3);
  const s1w = doc.getTextWidth('Características del grupo:');
  doc.line(marginX, cursorY + 1.5, marginX + s1w, cursorY + 1.5);
  cursorY += 8;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  const maxTextWidth = pageWidth - (marginX * 2);
  const lines1 = doc.splitTextToSize(data.caracteristicas, maxTextWidth);
  doc.text(lines1, marginX, cursorY);
  cursorY += (lines1.length * 5) + 10;

  // ========== SECCIÓN 2 ==========
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('El grupo en relación con los contenidos trabajados:', marginX, cursorY);
  const s2w = doc.getTextWidth('El grupo en relación con los contenidos trabajados:');
  doc.line(marginX, cursorY + 1.5, marginX + s2w, cursorY + 1.5);
  cursorY += 8;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  const lines2 = doc.splitTextToSize(data.contenidos, maxTextWidth);
  doc.text(lines2, marginX, cursorY);
  cursorY += (lines2.length * 5) + 10;

  // ========== SECCIÓN 3 — Apreciación ==========
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Apreciación:', marginX, cursorY);
  const s3w = doc.getTextWidth('Apreciación:');
  doc.line(marginX, cursorY + 1.5, marginX + s3w, cursorY + 1.5);
  cursorY += 8;

  let apreciacion = '';
  if (data.estado === 'completado') {
    apreciacion = 'La regularidad en el dictado de clases y el buen nivel de asistencia permitieron desarrollar la totalidad de los contenidos previstos para este módulo. Los estudiantes lograron apropiarse de los conocimientos propuestos, participando activamente en cada una de las actividades planteadas y demostrando interés en los temas abordados.';
  } else {
    apreciacion = 'Debido a diferentes situaciones que afectaron la regularidad en el dictado de clases, no fue posible desarrollar la totalidad de los contenidos previstos en el tiempo estipulado. Por tal motivo se continuará con el dictado de las clases hasta lograr completar los contenidos propuestos y alcanzar los objetivos de aprendizaje previstos para el módulo.';
  }

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  const lines3 = doc.splitTextToSize(apreciacion, maxTextWidth);
  doc.text(lines3, marginX, cursorY);
  cursorY += (lines3.length * 5) + 20;

  // ========== FIRMAS ==========
  // Verificar si entramos en la página, si no, nueva página
  if (cursorY > 250) {
    doc.addPage();
    cursorY = 30;
  }

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');

  const firmaY = cursorY;
  const firmaWidth = 60;
  
  // Firma MEP
  const firma1X = marginX + 20;
  doc.line(firma1X, firmaY, firma1X + firmaWidth, firmaY);
  doc.text('Firma del MEP', firma1X + (firmaWidth / 2), firmaY + 5, { align: 'center' });

  // Firma Directora
  const firma2X = pageWidth - marginX - firmaWidth - 20;
  doc.line(firma2X, firmaY, firma2X + firmaWidth, firmaY);
  doc.text('Firma de la directora', firma2X + (firmaWidth / 2), firmaY + 5, { align: 'center' });

  // ========== PIE DE PÁGINA ==========
  const pageHeight = doc.internal.pageSize.getHeight();
  doc.setFontSize(8);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(120, 120, 120);
  doc.text(`Trayecto formativo: ${data.trayecto ? data.trayecto.nombre : ''}`, marginX, pageHeight - 10);
  doc.text(`MEP responsable del informe: ${profMNombre}`, marginX, pageHeight - 6);
  doc.setTextColor(0, 0, 0);

  // ========== GUARDAR ==========
  const trayNombre = data.trayecto ? data.trayecto.nombre.replace(/\s+/g, '_') : 'informe';
  doc.save(`Informe_Grupal_${trayNombre}.pdf`);
}

// ============================================
// Informe Grupal desde vista de Trayecto Formativo
// ============================================
export async function openInformeGrupalTrayecto(trayectoId) {
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = `
    <div class="modal" style="max-width:700px;width:95vw;">
      <div class="modal-header">
        <h3 class="modal-title">📊 Informe Grupal</h3>
        <button class="modal-close" id="modal-close-btn">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
      <div class="modal-body" id="informe-tray-body">
        <div style="padding:40px;text-align:center;color:var(--text-muted);">Cargando datos...</div>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);

  overlay.querySelector('#modal-close-btn').addEventListener('click', () => overlay.remove());
  overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove(); });

  try {
    const trayectos = await fetchAll('trayectos_formativos');
    const trayecto = trayectos.find(t => t.id === trayectoId);
    if (!trayecto) { showToast('Trayecto no encontrado', 'error'); overlay.remove(); return; }

    const profesores = await fetchAll('profesores');
    const inscripciones = await fetchAll('inscripciones');
    const estudiantes = await fetchAll('estudiantes');
    const submodulos = await fetchAll('submodulos');
    const tmcLinks = await fetchAll('trayecto_modulo_comun');

    const profTrayecto = trayecto.profesor_id ? profesores.find(p => p.id === trayecto.profesor_id) : null;

    // Buscar módulo transversal de Higiene y Seguridad vinculado a este trayecto
    const comunLinks = tmcLinks.filter(l => l.trayecto_id === trayectoId);
    const modulosComunes = comunLinks.map(l => submodulos.find(s => s.id === l.submodulo_id)).filter(Boolean);
    const modHigiene = modulosComunes.find(m => m.nombre && m.nombre.toLowerCase().includes('higiene'));
    const profModulo = modHigiene && modHigiene.profesor_id ? profesores.find(p => p.id === modHigiene.profesor_id) : null;

    // Estudiantes inscriptos en este trayecto
    const insRelev = inscripciones.filter(i => i.trayecto_id === trayectoId);
    const estIds = insRelev.map(i => i.estudiante_id);
    const estAsociados = estudiantes.filter(e => estIds.includes(e.id));
    const varones = estAsociados.filter(e => e.genero === 'Masculino').length;
    const mujeres = estAsociados.filter(e => e.genero === 'Femenino').length;
    const total = estAsociados.length;

    const hoy = new Date();
    const fechaHoy = `${hoy.getDate().toString().padStart(2, '0')}/${(hoy.getMonth() + 1).toString().padStart(2, '0')}/${hoy.getFullYear()}`;

    const body = overlay.querySelector('#informe-tray-body');
    body.innerHTML = `
      <div style="display:flex;flex-direction:column;gap:14px;">
        <div style="font-size:0.85rem;color:var(--text-secondary);padding:8px 12px;background:rgba(139,92,246,0.06);border-radius:8px;border-left:3px solid var(--accent-purple);">
          <strong>${sanitize(trayecto.nombre)}</strong><br>
          ${profTrayecto ? `Prof. ${sanitize(profTrayecto.nombre)} ${sanitize(profTrayecto.apellido || '')}` : 'Sin profesor'}
        </div>

        <div style="display:flex;gap:12px;flex-wrap:wrap;">
          <div style="flex:1;min-width:100px;padding:10px 14px;background:rgba(139,92,246,0.08);border-radius:8px;text-align:center;">
            <div style="font-size:1.3rem;font-weight:700;color:var(--accent-purple-light);">${total}</div>
            <div style="font-size:0.7rem;color:var(--text-muted);">Estudiantes</div>
          </div>
          <div style="flex:1;min-width:100px;padding:10px 14px;background:rgba(59,130,246,0.08);border-radius:8px;text-align:center;">
            <div style="font-size:1.3rem;font-weight:700;color:#60a5fa;">${varones}</div>
            <div style="font-size:0.7rem;color:var(--text-muted);">Varones</div>
          </div>
          <div style="flex:1;min-width:100px;padding:10px 14px;background:rgba(236,72,153,0.08);border-radius:8px;text-align:center;">
            <div style="font-size:1.3rem;font-weight:700;color:#f472b6;">${mujeres}</div>
            <div style="font-size:0.7rem;color:var(--text-muted);">Mujeres</div>
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">Fecha del informe</label>
          <input type="text" class="form-input" id="inf-tray-fecha" value="${fechaHoy}" placeholder="DD/MM/AAAA" />
        </div>

        <div class="form-group">
          <label class="form-label">Sección 1 — Características del grupo</label>
          <textarea class="form-input" id="inf-tray-caract" rows="4" placeholder="Describir las características del grupo de estudiantes..." style="resize:vertical;min-height:80px;"></textarea>
        </div>

        <div class="form-group">
          <label class="form-label">Sección 2 — El grupo en relación con los contenidos trabajados</label>
          <textarea class="form-input" id="inf-tray-contenidos" rows="4" placeholder="Describir la relación del grupo con los contenidos..." style="resize:vertical;min-height:80px;"></textarea>
        </div>

        <div class="form-group">
          <label class="form-label">Sección 3 — Estado del trayecto</label>
          <select class="form-select" id="inf-tray-estado">
            <option value="completado">Contenido completo</option>
            <option value="en_desarrollo">Contenido en proceso</option>
          </select>
        </div>

        <div style="display:flex;justify-content:flex-end;gap:10px;margin-top:8px;">
          <button class="btn btn-primary" id="btn-generar-informe-tray">📥 Generar PDF</button>
        </div>
      </div>
    `;

    body.querySelector('#btn-generar-informe-tray').addEventListener('click', async () => {
      const caracteristicas = document.getElementById('inf-tray-caract').value.trim();
      const contenidos = document.getElementById('inf-tray-contenidos').value.trim();
      const estado = document.getElementById('inf-tray-estado').value;
      const fecha = document.getElementById('inf-tray-fecha').value.trim();

      if (!caracteristicas || !contenidos) {
        showToast('Completá las secciones 1 y 2 del informe', 'error');
        return;
      }

      try {
        await generarInformePDF({
          trayecto,
          profTrayecto,
          modulo: modHigiene || null,
          profModulo,
          fecha,
          totalEstudiantes: total,
          varones,
          mujeres,
          caracteristicas,
          contenidos,
          estado
        });
        showToast('Informe grupal generado exitosamente');
      } catch (err) {
        showToast('Error al generar el informe: ' + err.message, 'error');
      }
    });

  } catch (err) {
    const body = overlay.querySelector('#informe-tray-body');
    body.innerHTML = `<div style="padding:32px;text-align:center;color:var(--accent-red);">Error: ${err.message}</div>`;
  }
}
