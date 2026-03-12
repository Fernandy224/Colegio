import { fetchAll, create, update } from '../utils/data.js';
import { sanitize, showToast, icons } from '../utils/helpers.js';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { getCurrentYear } from '../utils/state.js';

const DESEMPENOS_LIST = [
  "Identifica los peligros propios de la actividad.",
  "Identifica y evalúa los riesgos para poder minimizarlos.",
  "Utiliza los EPP adecuados teniendo en cuenta los riesgos.",
  "Mantiene el orden y la limpieza en el lugar de trabajo.",
  "Adquiere una adecuada postura de trabajo para evitar consecuencias negativas.",
  "Respeta y aplica las normas de convivencia manteniendo un entorno de trabajo seguro."
];

export async function openGenerarActaModal(submoduloId, submoduloNombre) {
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = `
    <div class="modal" style="max-width:900px;width:95vw;">
      <div class="modal-header">
        <h3 class="modal-title">📄 Generación de Actas — ${submoduloNombre}</h3>
        <button class="modal-close" id="modal-close-btn">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
      <div class="modal-body" id="actas-modal-body">
        <div style="padding:40px;text-align:center;color:var(--text-muted);">Cargando estudiantes...</div>
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

    const body = overlay.querySelector('#actas-modal-body');

    if (trayectosAsociados.length === 0) {
      body.innerHTML = `<div style="padding:32px;text-align:center;color:var(--text-muted);">Este módulo no está asociado a ningún trayecto formativo.</div>`;
      return;
    }

    const inscripciones = await fetchAll('inscripciones');
    const estudiantes = await fetchAll('estudiantes');
    const seguimiento = await fetchAll('seguimiento_modulos');
    const profesores = await fetchAll('profesores');
    const submodulos = await fetchAll('submodulos');

    const modActual = submodulos.find(s => s.id === submoduloId);
    const profModulo = modActual && modActual.profesor_id ? profesores.find(p => p.id === modActual.profesor_id) : null;

    const tabsHTML = trayectosAsociados.map((t, idx) => `
      <button class="content-tab ${idx === 0 ? 'active' : ''}" data-trayectoid="${t.id}">${sanitize(t.nombre)}</button>
    `).join('');

    body.innerHTML = `
      <div class="content-tabs" style="margin-bottom: 20px;">
        ${tabsHTML}
      </div>
      <div id="actas-tab-content">
        <div style="padding:40px;text-align:center;color:var(--text-muted);">Cargando...</div>
      </div>
    `;

    const tabContent = body.querySelector('#actas-tab-content');

    const loadTab = async (trayectoId) => {
      const insRelev = inscripciones.filter(i => i.trayecto_id === trayectoId);
      const trayectoActual = trayectosAsociados.find(t => t.id === trayectoId);
      const profTrayecto = trayectoActual && trayectoActual.profesor_id ? profesores.find(p => p.id === trayectoActual.profesor_id) : null;
      
      if (insRelev.length === 0) {
        tabContent.innerHTML = '<div style="padding:32px;text-align:center;color:var(--text-muted);">No hay inscriptos en este trayecto.</div>';
        return;
      }

      let rowsHTML = insRelev.map(insc => {
        const est = estudiantes.find(e => e.id === insc.estudiante_id);
        if (!est) return '';
        
        const seg = seguimiento.find(s => s.inscripcion_id === insc.id && s.submodulo_id === submoduloId);
        
        // Cargar desempeños previos si los hay
        let obs = '';
        let dsp = {};
        if (seg && seg.desempenos) {
          obs = seg.desempenos.observaciones || '';
          dsp = seg.desempenos.criterios || {};
        }

        return `
          <div class="acta-row" style="background: rgba(255,255,255,0.02); border: 1px solid var(--border-color); border-radius: 8px; margin-bottom: 12px; padding: 16px;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 12px;">
              <div>
                <strong style="font-size: 1.1rem;">${sanitize(est.nombre)} ${sanitize(est.apellido)}</strong>
                <div style="font-size: 0.8rem; color: var(--text-muted);">DNI: ${sanitize(est.dni)}</div>
              </div>
              <div>
                <button class="btn btn-primary btn-generate-pdf" data-insc-id="${insc.id}" data-seg-id="${seg?.id || ''}">📄 Guardar y Generar PDF</button>
              </div>
            </div>
            
            <div class="acta-form" data-insc-id="${insc.id}" style="display:grid; grid-template-columns: 2.5fr 1fr; gap: 16px;">
              <div>
                <label style="font-size:0.75rem; color:var(--text-muted); font-weight:bold; text-transform:uppercase;">Evaluación de Desempeños</label>
                <div style="margin-top: 8px; font-size: 0.85rem;">
                  ${DESEMPENOS_LIST.map((crit, idx) => `
                    <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid rgba(255,255,255,0.05); padding: 6px 0;">
                      <span style="flex:1; padding-right:12px;">${crit}</span>
                      <div style="display:flex; gap: 12px; flex-shrink:0;">
                         <label><input type="radio" name="des_${insc.id}_${idx}" value="SI" ${dsp[idx] === 'SI' ? 'checked' : ''} /> SI</label>
                         <label><input type="radio" name="des_${insc.id}_${idx}" value="NO" ${dsp[idx] === 'NO' ? 'checked' : ''} /> NO</label>
                      </div>
                    </div>
                  `).join('')}
                </div>
              </div>
              
              <div style="display:flex; flex-direction:column; gap: 12px;">
                <div class="form-group" style="padding:0; margin:0;">
                  <label class="form-label" style="font-size:0.75rem;">Observaciones</label>
                  <textarea class="form-input obs-input" style="height: 100px; resize: none;">${sanitize(obs)}</textarea>
                </div>
                
                <div class="form-group" style="padding:0; margin:0; position:relative;">
                  <label class="form-label" style="font-size:0.75rem;">Condición Final (Automática)</label>
                  <div class="condicion-display" style="padding: 10px; border-radius: 6px; background: rgba(0,0,0,0.2); font-weight: bold; text-align: center; border: 1px solid var(--border-color);">
                    COMPLETAR PARA CALCULAR
                  </div>
                </div>
              </div>
            </div>
          </div>
        `;
      }).join('');
      
      tabContent.innerHTML = `
        <div style="max-height: 65vh; overflow-y: auto;">
          ${rowsHTML}
        </div>
      `;

      // Live update of the Aprobado/Desaprobado condition based on radios
      tabContent.querySelectorAll('.acta-row').forEach(row => {
        const radios = row.querySelectorAll('input[type="radio"]');
        const updateCondicion = () => {
          let siCount = 0;
          let noCount = 0;
          radios.forEach(r => {
            if (r.checked) {
              if (r.value === 'SI') siCount++;
              else if (r.value === 'NO') noCount++;
            }
          });
          const display = row.querySelector('.condicion-display');
          if (siCount + noCount === 0) {
            display.textContent = 'COMPLETAR PARA CALCULAR';
            display.style.color = 'var(--text-primary)';
            display.style.borderColor = 'var(--border-color)';
          } else if (siCount > noCount) {
             display.textContent = 'APROBADO';
             display.style.color = '#10b981';
             display.style.borderColor = 'rgba(16,185,129,0.5)';
          } else {
             display.textContent = 'DESAPROBADO';
             display.style.color = '#ef4444';
             display.style.borderColor = 'rgba(239,68,68,0.5)';
          }
        };
        radios.forEach(r => r.addEventListener('change', updateCondicion));
        updateCondicion();
      });

      // Handle Submit and PDF generation
      tabContent.querySelectorAll('.btn-generate-pdf').forEach(btn => {
        btn.addEventListener('click', async (e) => {
          const row = e.target.closest('.acta-row');
          const inscId = btn.dataset.inscId;
          let segId = btn.dataset.segId;
          const inscActual = insRelev.find(i => i.id === inscId);
          const est = estudiantes.find(es => es.id === inscActual.estudiante_id);
          
          let dsp = {};
          let siCount = 0;
          let noCount = 0;
          let notCompleted = false;

          DESEMPENOS_LIST.forEach((crit, idx) => {
             const selected = row.querySelector(`input[name="des_${inscId}_${idx}"]:checked`);
             if (selected) {
                 dsp[idx] = selected.value;
                 if (selected.value === 'SI') siCount++;
                 else noCount++;
             } else {
                 notCompleted = true;
             }
          });

          if (notCompleted) {
             showToast('Completá todos los desempeños (SI o NO) antes de generar.', 'error');
             return;
          }

          const obs = row.querySelector('.obs-input').value.trim();
          const condicionStr = (siCount > noCount) ? "APROBADO" : "DESAPROBADO";
          
          const recordToSave = {
              criterios: dsp,
              observaciones: obs
          };
          
          try {
             if (segId) {
                await update('seguimiento_modulos', segId, { 
                    desempenos: recordToSave,
                    estado: condicionStr === 'APROBADO' ? 'Aprobado' : 'Desaprobado'
                });
             } else {
                const newSeg = await create('seguimiento_modulos', {
                    inscripcion_id: inscId,
                    submodulo_id: submoduloId,
                    estado: condicionStr === 'APROBADO' ? 'Aprobado' : 'Desaprobado',
                    desempenos: recordToSave
                });
                segId = newSeg.id;
                btn.dataset.segId = segId;
             }
             
             // Generar PDF
             await generarPDF({
                estudiante: est,
                trayecto: trayectoActual,
                profTrayecto: profTrayecto,
                modulo: modActual,
                profModulo: profModulo,
                desempenos: dsp,
                observaciones: obs,
                condicion: condicionStr
             });
             
             showToast('Acta generada y guardada correctamente.');
          } catch (err) {
             showToast(err.message || 'Error al guardar el acta', 'error');
          }
        });
      });
    };

    const tabButtons = body.querySelectorAll('.content-tab');
    tabButtons.forEach(btn => {
      btn.addEventListener('click', async () => {
        tabButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const trayectoId = btn.dataset.trayectoid;
        await loadTab(trayectoId);
      });
    });

    await loadTab(trayectosAsociados[0].id);

  } catch (err) {
    const body = overlay.querySelector('#actas-modal-body');
    body.innerHTML = `<div style="padding:32px;text-align:center;color:var(--accent-red);">Error al cargar: ${err.message}</div>`;
  }
}

async function generarPDF(data) {
  // Crear el PDF SIN márgenes de página
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
      
      // Vite may return index.html (200 OK) for missing files. We MUST check it's actually an image.
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

  // Cargar imagen del encabezado
  const encabezado = await loadImageDataURL('/imagenes/encabezado-acta.png');

  // Ancho completo de la página A4 en mm = 210
  const pageWidth = doc.internal.pageSize.getWidth();
  const marginX = 14; // Solo para el texto (NO para la imagen)
  const marginTop = 10; // Margen superior antes del encabezado
  let cursorY = marginTop;

  // ========== ENCABEZADO BANNER ==========
  if (encabezado && encabezado.data) {
    const imgWidth = pageWidth; // 100% del ancho de la hoja
    const aspect = encabezado.height / encabezado.width;
    const imgHeight = imgWidth * aspect;
    
    // Imagen con margen superior
    doc.addImage(encabezado.data, encabezado.type, 0, marginTop, imgWidth, imgHeight);
    
    // ===== Sobreescribir el año "2025" con el año actual =====
    const currentYear = new Date().getFullYear();
    // La zona del año está aprox. al 78% del ancho desde la izquierda
    const yearX = pageWidth * 0.78;
    const yearY = marginTop + (imgHeight * 0.2); // Parte superior del tercio derecho
    const rectW = 28;
    const rectH = 7;
    
    // Dibujar rectángulo blanco para tapar el "2025"
    doc.setFillColor(255, 255, 255);
    doc.rect(yearX, yearY, rectW, rectH, 'F');
    
    // Escribir año actual encima
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(40, 40, 40);
    doc.text(`AÑO: ${currentYear}`, yearX + (rectW / 2), yearY + 5, { align: 'center' });
    
    // Resetear color de texto
    doc.setTextColor(0, 0, 0);
    
    // El contenido arranca debajo con margen
    cursorY = marginTop + imgHeight + 8;
  } else {
    cursorY = 20;
  }

  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  
  const writeUnderlinedBold = (label, value, _x, _y) => {
    doc.setFont('helvetica', 'bold');
    doc.text(label, _x, _y);
    const labelWidth = doc.getTextWidth(label);
    doc.setLineWidth(0.3);
    doc.line(_x, _y + 1.5, _x + labelWidth, _y + 1.5);
    
    if (value) {
      doc.setFont('helvetica', 'normal');
      doc.text(String(value), _x + labelWidth + 3, _y);
    }
  };

  const writeUnderlinedNormal = (label, _x, _y) => {
    doc.setFont('helvetica', 'normal');
    doc.text(label, _x, _y);
    const labelWidth = doc.getTextWidth(label);
    doc.setLineWidth(0.3);
    doc.line(_x, _y + 1.5, _x + labelWidth, _y + 1.5);
  };

  // Datos Trayecto
  const tName = data.trayecto ? data.trayecto.nombre : '';
  writeUnderlinedBold('Nombre del trayecto formativo:', tName, marginX, cursorY);
  cursorY += 8;

  const ptName = data.profTrayecto ? `${data.profTrayecto.nombre} ${data.profTrayecto.apellido || ''}` : '';
  writeUnderlinedBold('Profesora a cargo del trayecto formativo:', ptName, marginX, cursorY);
  cursorY += 8;

  // Datos Módulo (Indented)
  const marginXIndented = marginX + 10;
  
  const mName = data.modulo ? data.modulo.nombre : '';
  writeUnderlinedBold('Nombre del módulo:', mName, marginXIndented, cursorY);
  cursorY += 8;

  const pmName = data.profModulo ? `${data.profModulo.nombre} ${data.profModulo.apellido || ''}` : '';
  writeUnderlinedBold('Nombre del profesor a cargo del módulo:', pmName, marginXIndented, cursorY);
  cursorY += 8;

  const estName = (`${data.estudiante.nombre} ${data.estudiante.apellido}`).toUpperCase();
  writeUnderlinedBold('Nombre y apellido del/la estudiante:', estName, marginXIndented, cursorY);
  cursorY += 8;

  writeUnderlinedBold('DNI:', data.estudiante.dni || '', marginXIndented, cursorY);
  cursorY += 10;

  // Capacidades
  writeUnderlinedNormal('Capacidad para evaluar:', marginXIndented, cursorY);
  cursorY += 8;
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  // Bullets with a small dash or dot
  doc.text('• Identificar los riesgos asociados al sector de trabajo.', marginXIndented + 5, cursorY);
  cursorY += 6;
  doc.text('• Establecer medidas preventivas a corto, mediano y largo plazo.', marginXIndented + 5, cursorY);
  cursorY += 10;

  doc.setFontSize(12);
  writeUnderlinedNormal('Desempeños para evaluar:', marginXIndented, cursorY);
  cursorY += 6;

  // Tabla
  const tableData = DESEMPENOS_LIST.map((crit, i) => {
     let obsText = "";
     if (i === 0) obsText = data.observaciones || ""; // Print observations in first row only, or distribute? PDF shows observations across entire column.
     // AutoTable can merge cells or we just leave it in the first row. We will put the raw data here.
     return [
       crit,
       data.desempenos[i] === 'SI' ? 'X' : '',
       data.desempenos[i] === 'NO' ? 'X' : '',
       obsText
     ];
  });

  autoTable(doc, {
    startY: cursorY,
    headStyles: { fillColor: [40, 40, 40], textColor: 255, halign: 'center' },
    styles: { fontSize: 9, cellPadding: 2, overflow: 'linebreak', lineColor: [0,0,0], lineWidth: 0.1 },
    theme: 'grid',
    head: [['Desempeño', 'SI', 'NO', 'Observaciones']],
    body: tableData,
    columnStyles: {
      0: { cellWidth: 90 },
      1: { cellWidth: 15, halign: 'center', fontStyle: 'bold' },
      2: { cellWidth: 15, halign: 'center', fontStyle: 'bold' },
      3: { cellWidth: 50 },
    },
    didDrawCell: function(data) {
      // Merge all Observation cells into one big cell
      if (data.column.index === 3 && data.section === 'body') {
         // jsPDF autotable merging is tricky without plugins, just let it print per row for now.
         // Or we can just print it outside the table to be safe and match a clean layout.
      }
    }
  });

  cursorY = doc.lastAutoTable.finalY + 8;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text(`Condición del estudiante: ${data.condicion}`, marginX, cursorY);
  
  cursorY += 10;
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text('Declaración del estudiante:', marginX, cursorY);
  cursorY += 5;
  doc.text('"Declaro haber sido informado/a de los resultados de mi evaluación final', marginX, cursorY);
  cursorY += 5;
  doc.text('y haber recibido retroalimentación sobre mi desempeño durante el módulo."', marginX, cursorY);

  cursorY += 25;

  // Firmas layout
  const firmW = 50;
  const lineY = cursorY;
  
  doc.setLineWidth(0.3);
  
  // Estudiante
  doc.line(marginX, lineY, marginX + firmW, lineY);
  doc.text('Firma del estudiante', marginX + 8, lineY + 5);

  // Prof Trayecto
  const midX = 75;
  doc.line(midX, lineY, midX + firmW, lineY);
  doc.text('Prof. del Trayecto', midX + 10, lineY + 5);
  
  // Prof Modulo
  const rightX = 140;
  doc.line(rightX, lineY, rightX + firmW, lineY);
  doc.text('Prof. del Módulo', rightX + 10, lineY + 5);
  
  cursorY += 20;

  // Directora
  doc.line(midX, cursorY, midX + firmW, cursorY);
  doc.text('Firma de la directora', midX + 8, cursorY + 5);

  const cleanFilename = `Acta_${mName || 'Modulo'}_${data.estudiante.dni}.pdf`.replace(/[^a-z0-9_.-]/gi, '_');
  doc.save(cleanFilename);
}
