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

          <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:12px;">
            <div class="form-group">
              <label class="form-label">Grupo</label>
              <input type="text" class="form-input" id="inf-grupo" placeholder="Ej: A, B..." />
            </div>
            <div class="form-group">
              <label class="form-label">Turno</label>
              <input type="text" class="form-input" id="inf-turno" placeholder="Ej: Mañana, Tarde..." />
            </div>
            <div class="form-group">
              <label class="form-label">Día de cursado</label>
              <input type="text" class="form-input" id="inf-dia" placeholder="Ej: Lunes y Miércoles" />
            </div>
            <div class="form-group">
              <label class="form-label">Horario</label>
              <input type="text" class="form-input" id="inf-horario" placeholder="Ej: 18:00 a 21:00" />
            </div>
            <div class="form-group">
              <label class="form-label">Fecha de inicio</label>
              <input type="date" class="form-input" id="inf-fecha-ini" />
            </div>
            <div class="form-group">
              <label class="form-label">Fecha de finalización</label>
              <input type="date" class="form-input" id="inf-fecha-fin" />
            </div>
          </div>

          <div class="form-group" style="margin-top:12px;">
            <label class="form-label">Fecha del informe</label>
            <input type="text" class="form-input" id="inf-fecha" value="${fechaHoy}" placeholder="DD/MM/AAAA" />
          </div>

          <div class="form-group">
            <label class="form-label">Estado del grupo</label>
            <select class="form-select" id="inf-estado">
              <option value="completado">1️⃣ CONTENIDOS COMPLETADOS</option>
              <option value="en_desarrollo">2️⃣ CONTINÚA PRÓXIMO SEMESTRE</option>
            </select>
            <small style="color:var(--text-muted);display:block;margin-top:4px;">El contenido del informe se redactará automáticamente según esta opción.</small>
          </div>

          <div style="display:flex;justify-content:flex-end;gap:10px;margin-top:8px;">
            <button class="btn btn-primary" id="btn-generar-informe">📥 Generar PDF</button>
          </div>
        </div>
      `;

      // Evento generar PDF
      tabContent.querySelector('#btn-generar-informe').addEventListener('click', async () => {
        const grupo = document.getElementById('inf-grupo').value.trim();
        const turno = document.getElementById('inf-turno').value.trim();
        const diaCursado = document.getElementById('inf-dia').value.trim();
        const horario = document.getElementById('inf-horario').value.trim();
        const fechaIni = document.getElementById('inf-fecha-ini').value;
        const fechaFin = document.getElementById('inf-fecha-fin').value;
        const estado = document.getElementById('inf-estado').value;
        const fecha = document.getElementById('inf-fecha').value.trim();

        if (!grupo || !turno || !diaCursado || !horario || !fechaIni || !fechaFin) {
          showToast('Completá todos los campos del grupo (Turno, fechas, etc.)', 'error');
          return;
        }

        try {
          await generarInformePDF({
            trayecto: trayectoActual,
            profTrayecto,
            modulo: modActual,
            profModulo,
            fecha,
            grupo,
            turno,
            diaCursado,
            horario,
            fechaIni,
            fechaFin,
            totalEstudiantes: total,
            varones,
            mujeres,
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
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('NUCLEAMIENTO N° 6', pageWidth / 2, cursorY, { align: 'center' });
  cursorY += 5;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Escuela para Jóvenes, Adultos y Formación Profesional', pageWidth / 2, cursorY, { align: 'center' });
  cursorY += 6;

  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('INFORME GRUPAL', pageWidth / 2, cursorY, { align: 'center' });
  cursorY += 5;
  doc.setFontSize(11);
  doc.text(String(getCurrentYear()), pageWidth / 2, cursorY, { align: 'center' });
  cursorY += 8;

  // ========== DATOS INSTITUCIONALES ==========
  doc.setFontSize(9);
  const writeLabel = (label, value, y) => {
    doc.setFont('helvetica', 'bold');
    doc.text(label, marginX, y);
    const lw = doc.getTextWidth(label);
    doc.setFont('helvetica', 'normal');
    doc.text(String(value || ''), marginX + lw + 2, y);
  };

  const lineStep = 5.5;

  writeLabel('ESTABLECIMIENTO: ', 'NUCLEAMIENTO EDUCATIVO N° 6', cursorY);
  cursorY += lineStep;

  writeLabel('TRAYECTO FORMATIVO: ', data.trayecto ? data.trayecto.nombre : '', cursorY);
  cursorY += lineStep;

  writeLabel('GRUPO: ', data.grupo || '', cursorY);
  cursorY += lineStep;

  writeLabel('TURNO: ', data.turno || '', cursorY);
  cursorY += lineStep;

  writeLabel('DÍA DE CURSADO: ', data.diaCursado || '', cursorY);
  cursorY += lineStep;

  writeLabel('HORARIO: ', data.horario || '', cursorY);
  cursorY += lineStep;

  const formatIsoToDate = (isoString) => {
    if (!isoString) return '';
    const parts = isoString.split('-');
    if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`;
    return isoString;
  };
  const dIni = formatIsoToDate(data.fechaIni);
  const dFin = formatIsoToDate(data.fechaFin);
  const periodo = (dIni && dFin) ? `Desde ${dIni} hasta ${dFin}` : '';
  
  writeLabel('PERÍODO: ', periodo, cursorY);
  cursorY += lineStep;

  const profTNombre = data.profTrayecto ? `${data.profTrayecto.nombre} ${data.profTrayecto.apellido || ''}` : '';
  writeLabel('M.E.P (Trayecto): ', profTNombre, cursorY);
  cursorY += lineStep;

  writeLabel('MODULO TRANSVERSAL: ', 'Seguridad e Higiene Laboral', cursorY);
  cursorY += lineStep;

  const profMNombre = data.profModulo ? `${data.profModulo.nombre} ${data.profModulo.apellido || ''}` : '';
  writeLabel('DOCENTE: ', profMNombre, cursorY);
  cursorY += lineStep;

  writeLabel('FECHA INFORME: ', data.fecha, cursorY);
  cursorY += lineStep;

  writeLabel('CANTIDAD DE ESTUDIANTES: ', String(data.totalEstudiantes), cursorY);
  cursorY += lineStep;

  doc.setFont('helvetica', 'bold');
  doc.text(`VARONES: ${data.varones}`, marginX, cursorY);
  doc.text(`MUJERES: ${data.mujeres}`, marginX + 60, cursorY);
  cursorY += 10;

  let txt1 = '';
  let txt2 = '';
  let txt3 = '';

  if (data.estado === 'completado') {
    txt1 = 'Las clases se desarrollaron durante el período previsto, manteniendo el grupo una buena participación, interés y compromiso con las actividades propuestas.';
    txt2 = 'Durante el dictado de las clases se utilizaron diferentes herramientas metodológicas como presentaciones, observación de videos, análisis de experiencias, debates y uso de plataformas virtuales para la realización de actividades.\n\nFue posible abordar la totalidad de los contenidos previstos del módulo, logrando que los estudiantes puedan identificar riesgos laborales y aplicar normas de seguridad e higiene relacionadas con la actividad.';
    txt3 = 'La regularidad de las clases y la asistencia del grupo permitieron alcanzar los objetivos pedagógicos previstos sin inconvenientes.';
  } else {
    txt1 = 'Las clases se desarrollaron durante el período previsto manteniendo el grupo interés y participación en las actividades propuestas.';
    txt2 = 'Durante el desarrollo de las clases se utilizaron diferentes recursos metodológicos como presentaciones, análisis de situaciones, debates y uso de herramientas virtuales para fortalecer el aprendizaje.\n\nDebido a la extensión de los contenidos del módulo y a la organización institucional del trayecto formativo, no fue posible abordar la totalidad del programa durante este período.';
    txt3 = 'Los contenidos restantes serán desarrollados en el próximo semestre con el fin de completar el programa correspondiente al módulo.';
  }

  // ========== SECCIÓN 1 ==========
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('CARACTERÍSTICAS DEL GRUPO', marginX, cursorY);
  cursorY += 5;

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  const maxTextWidth = pageWidth - (marginX * 2);
  const lines1 = doc.splitTextToSize(txt1, maxTextWidth);
  doc.text(lines1, marginX, cursorY);
  cursorY += (lines1.length * 4) + 6;

  // ========== SECCIÓN 2 ==========
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('EL GRUPO EN RELACIÓN CON LOS CONTENIDOS TRABAJADOS', marginX, cursorY);
  cursorY += 5;

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  const lines2 = doc.splitTextToSize(txt2, maxTextWidth);
  doc.text(lines2, marginX, cursorY);
  cursorY += (lines2.length * 4) + 6;

  // ========== SECCIÓN 3 — Apreciación ==========
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('APRECIACIÓN:', marginX, cursorY);
  cursorY += 5;

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  const lines3 = doc.splitTextToSize(txt3, maxTextWidth);
  doc.text(lines3, marginX, cursorY);
  cursorY += (lines3.length * 4) + 12;

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

        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:12px;">
          <div class="form-group">
            <label class="form-label">Grupo</label>
            <input type="text" class="form-input" id="inf-tray-grupo" placeholder="Ej: A, B..." />
          </div>
          <div class="form-group">
            <label class="form-label">Turno</label>
            <input type="text" class="form-input" id="inf-tray-turno" placeholder="Ej: Mañana, Tarde..." />
          </div>
          <div class="form-group">
            <label class="form-label">Día de cursado</label>
            <input type="text" class="form-input" id="inf-tray-dia" placeholder="Ej: Lunes y Miércoles" />
          </div>
          <div class="form-group">
            <label class="form-label">Horario</label>
            <input type="text" class="form-input" id="inf-tray-horario" placeholder="Ej: 18:00 a 21:00" />
          </div>
          <div class="form-group">
            <label class="form-label">Fecha de inicio</label>
            <input type="date" class="form-input" id="inf-tray-fecha-ini" />
          </div>
          <div class="form-group">
            <label class="form-label">Fecha de finalización</label>
            <input type="date" class="form-input" id="inf-tray-fecha-fin" />
          </div>
        </div>

        <div class="form-group" style="margin-top:12px;">
          <label class="form-label">Fecha del informe</label>
          <input type="text" class="form-input" id="inf-tray-fecha" value="${fechaHoy}" placeholder="DD/MM/AAAA" />
        </div>

        <div class="form-group">
          <label class="form-label">Estado del grupo</label>
          <select class="form-select" id="inf-tray-estado">
            <option value="completado">1️⃣ CONTENIDOS COMPLETADOS</option>
            <option value="en_desarrollo">2️⃣ CONTINÚA PRÓXIMO SEMESTRE</option>
          </select>
          <small style="color:var(--text-muted);display:block;margin-top:4px;">El contenido del informe se redactará automáticamente según esta opción.</small>
        </div>

        <div style="display:flex;justify-content:flex-end;gap:10px;margin-top:8px;">
          <button class="btn btn-primary" id="btn-generar-informe-tray">📥 Generar PDF</button>
        </div>
      </div>
    `;

    body.querySelector('#btn-generar-informe-tray').addEventListener('click', async () => {
      const grupo = document.getElementById('inf-tray-grupo').value.trim();
      const turno = document.getElementById('inf-tray-turno').value.trim();
      const diaCursado = document.getElementById('inf-tray-dia').value.trim();
      const horario = document.getElementById('inf-tray-horario').value.trim();
      const fechaIni = document.getElementById('inf-tray-fecha-ini').value;
      const fechaFin = document.getElementById('inf-tray-fecha-fin').value;
      const estado = document.getElementById('inf-tray-estado').value;
      const fecha = document.getElementById('inf-tray-fecha').value.trim();

      if (!grupo || !turno || !diaCursado || !horario || !fechaIni || !fechaFin) {
        showToast('Completá todos los campos del grupo (Turno, fechas, etc.)', 'error');
        return;
      }

      try {
        await generarInformePDF({
          trayecto,
          profTrayecto,
          modulo: modHigiene || null,
          profModulo,
          fecha,
          grupo,
          turno,
          diaCursado,
          horario,
          fechaIni,
          fechaFin,
          totalEstudiantes: total,
          varones,
          mujeres,
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
