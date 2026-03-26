import { fetchAll, create, update } from '../utils/data.js';
import { sanitize, showToast, icons } from '../utils/helpers.js';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { getCurrentYear } from '../utils/state.js';
import { getSupabase } from '../supabaseClient.js';

// Desempeños por defecto (compatibilidad con actas antiguas sin plantilla)
const DESEMPENOS_LEGACY = [
  "Identifica los peligros propios de la actividad.",
  "Identifica y evalúa los riesgos para poder minimizarlos.",
  "Utiliza los EPP adecuados teniendo en cuenta los riesgos.",
  "Mantiene el orden y la limpieza en el lugar de trabajo.",
  "Adquiere una adecuada postura de trabajo para evitar consecuencias negativas.",
  "Respeta y aplica las normas de convivencia manteniendo un entorno de trabajo seguro."
];

const CAPACIDADES_LEGACY = [
  "Identificar los riesgos asociados al sector de trabajo.",
  "Establecer medidas preventivas a corto, mediano y largo plazo."
];

const DECLARACION_DEFAULT = 'Declaro haber sido informado/a de los resultados de mi evaluación final y haber recibido retroalimentación sobre mi desempeño durante el módulo.';

// Cargar plantilla del submódulo (o null si no tiene)
async function fetchPlantillaForSubmodulo(submoduloId) {
  try {
    const sb = getSupabase();
    const { data: sub, error } = await sb
      .from('submodulos')
      .select('plantilla_acta_id')
      .eq('id', submoduloId)
      .single();
    if (error || !sub?.plantilla_acta_id) return null;

    const { data: plantilla, error: pErr } = await sb
      .from('plantillas_actas')
      .select('*')
      .eq('id', sub.plantilla_acta_id)
      .single();
    if (pErr) return null;
    return plantilla;
  } catch {
    return null;
  }
}

export async function openGenerarActaModal(submoduloId, submoduloNombre) {
  // Cargar plantilla asignada al submódulo
  let plantilla = await fetchPlantillaForSubmodulo(submoduloId);
  let todasLasPlantillas = [];

  // Si no tiene plantilla asignada, ofrecer selector
  if (!plantilla) {
    todasLasPlantillas = await fetchAll('plantillas_actas');
  }

  const desempenosList = plantilla ? (plantilla.desempenos || []) : [];
  const capacidadesList = plantilla ? (plantilla.capacidades || []) : [];
  const declaracion = plantilla?.declaracion || DECLARACION_DEFAULT;
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = `
    <div class="modal" style="max-width:900px;width:95vw;">
      <div class="modal-header">
        <h3 class="modal-title">📄 Generación de Actas — ${submoduloNombre}${plantilla ? ` <span style="font-size:0.75rem;font-weight:400;color:var(--text-muted);">(Plantilla: ${sanitize(plantilla.nombre)})</span>` : ''}</h3>
        <div style="display:flex;align-items:center;gap:8px;">
          <button class="btn btn-secondary" id="btn-imprimir-modelo" style="padding:6px 14px;font-size:0.8rem;display:flex;align-items:center;gap:6px;${!plantilla ? 'display:none;' : ''}">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:15px;height:15px;"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
            Imprimir Modelo
          </button>
          <button class="modal-close" id="modal-close-btn">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>
      </div>
      <div class="modal-body" id="actas-modal-body" style="position:relative;">
        <div id="actas-banner-container">
          ${!plantilla ? `
            <div style="background:rgba(251, 191, 36, 0.1); border:1px solid rgba(251, 191, 36, 0.3); border-radius:8px; padding:12px 16px; margin-bottom:16px; display:flex; align-items:center; justify-content:space-between; gap:16px;">
              <div>
                <strong style="color:var(--accent-yellow); font-size:0.9rem;">⚠️ Sin plantilla asignada</strong>
                <div style="font-size:0.8rem; color:var(--text-muted); margin-top:4px;">
                  Seleccioná una plantilla para evaluar los desempeños, o cerrá y asigná una desde la configuración del módulo.
                </div>
              </div>
              <div style="display:flex; gap:8px; min-width:250px;">
                <select id="select-plantilla-banner" class="form-input" style="font-size:0.85rem; padding:6px 10px;">
                  <option value="">— Elegir plantilla —</option>
                  ${todasLasPlantillas.map(p => `<option value="${p.id}">${sanitize(p.nombre)}</option>`).join('')}
                </select>
                <button class="btn btn-primary" id="btn-usar-plantilla" style="padding:6px 12px; font-size:0.85rem; white-space:nowrap;">Aplicar</button>
              </div>
            </div>
          ` : ''}
        </div>
        <div id="actas-content-area">
          <div style="padding:40px;text-align:center;color:var(--text-muted);">Cargando estudiantes...</div>
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);

  overlay.querySelector('#modal-close-btn').addEventListener('click', () => overlay.remove());
  overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove(); });

  // Estado compartido
  let _printContext = null;
  let activosDesempenos = [...desempenosList];
  let activeCapacidades = [...capacidadesList];
  let activeDeclaracion = declaracion;

  overlay.querySelector('#btn-imprimir-modelo')?.addEventListener('click', () => {
    if (_printContext) {
      imprimirModeloActa(_printContext, activosDesempenos, activeCapacidades, activeDeclaracion);
    } else {
      showToast('Seleccioná un trayecto primero para imprimir el modelo.', 'error');
    }
  });

  // Si no tiene plantilla, manejar la selección desde el banner
  if (!plantilla) {
    overlay.querySelector('#btn-usar-plantilla')?.addEventListener('click', async () => {
      const sel = overlay.querySelector('#select-plantilla-banner');
      const pId = sel?.value;
      if (!pId) { showToast('Elegí una plantilla primero', 'error'); return; }
      const selPlantilla = todasLasPlantillas.find(p => p.id === pId);
      if (!selPlantilla) return;
      activosDesempenos = selPlantilla.desempenos || [];
      activeCapacidades = selPlantilla.capacidades || [];
      activeDeclaracion = selPlantilla.declaracion || DECLARACION_DEFAULT;
      
      // Ocultar banner y actualizar UI
      overlay.querySelector('#actas-banner-container').innerHTML = '';
      overlay.querySelector('h3.modal-title').innerHTML = `📄 Generación de Actas — ${submoduloNombre} <span style="font-size:0.75rem;font-weight:400;color:var(--text-muted);">(Plantilla: ${sanitize(selPlantilla.nombre)})</span>`;
      const printBtn = overlay.querySelector('#btn-imprimir-modelo');
      if (printBtn) printBtn.style.display = 'flex';
      
      // Recargar estudiantes
      overlay.querySelector('#actas-content-area').innerHTML = '<div style="padding:40px;text-align:center;color:var(--text-muted);">Cargando estudiantes...</div>';
      await iniciarCargaEstudiantes();
    });
  }

  const iniciarCargaEstudiantes = () =>
    _doLoadEstudiantes(overlay, submoduloId, activosDesempenos, activeCapacidades, activeDeclaracion, (ctx) => { _printContext = ctx; });

  await iniciarCargaEstudiantes();
}

// ============================================
// LÓGICA INTERNA DE CARGA (scope de openGenerarActaModal)
// ============================================
async function _doLoadEstudiantes(overlay, submoduloId, activosDesempenos, activeCapacidades, activeDeclaracion, setPrintContext) {
  try {
    const tmcLinks = await fetchAll('trayecto_modulo_comun');
    const trayectosIds = tmcLinks.filter(l => l.submodulo_id === submoduloId).map(l => l.trayecto_id);
    const todosTrayectos = await fetchAll('trayectos_formativos');
    const trayectosAsociados = todosTrayectos.filter(t => trayectosIds.includes(t.id));

    const body = overlay.querySelector('#actas-content-area');

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

      // Actualizar contexto para impresión
      setPrintContext({
        trayecto: trayectoActual,
        profTrayecto,
        modulo: modActual,
        profModulo,
        estudiantes: insRelev.map(i => estudiantes.find(e => e.id === i.estudiante_id)).filter(Boolean),
        seguimiento,
        inscripciones: insRelev
      });
      
      if (insRelev.length === 0) {
        tabContent.innerHTML = '<div style="padding:32px;text-align:center;color:var(--text-muted);">No hay inscriptos en este trayecto.</div>';
        return;
      }

      let rowsHTML = insRelev.map(insc => {
        const est = estudiantes.find(e => e.id === insc.estudiante_id);
        if (!est) return '';
        
        const seg = seguimiento.find(s => s.inscripcion_id === insc.id && s.submodulo_id === submoduloId);
        
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
                  ${activosDesempenos.map((crit, idx) => `
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

          if (activosDesempenos.length === 0) {
             showToast('⚠️ Seleccioná una plantilla en el banner superior antes de generar el acta.', 'warning');
             return;
          }

          activosDesempenos.forEach((crit, idx) => {
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
                condicion: condicionStr,
                desempenosList: activosDesempenos,
                capacidadesList: activeCapacidades,
                declaracion: activeDeclaracion
             });

             // Registrar constancia en historial de documentación del estudiante
             try {
               const fechaHoy = new Date().toISOString().slice(0, 10);
               const nombreDoc = `Acta — ${modActual?.nombre || 'Módulo'} (${trayectoActual?.nombre || 'Trayecto'})`;
               await create('actas', {
                 estudiante_id: est.id,
                 tipo: 'modulo',
                 nombre: nombreDoc,
                 descripcion: condicionStr,
                 archivo_url: '',
                 fecha: fechaHoy,
                 grupo_id: trayectoActual?.id || null,
                 submodulo_id: submoduloId || null
               });
             } catch (regErr) {
               console.warn('[Actas] No se pudo registrar la constancia:', regErr?.message);
             }

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
    
    // MAGIA: El PNG original tiene el texto "Seguridad e Higiene Laboral" incrustado en la caja derecha.
    // La caja derecha empieza aprox al 69.3% del ancho.
    // Vamos a pintar un rectángulo blanco encima para tapar ese texto y escribir el nombre real del módulo.
    const rightBoxX = imgWidth * 0.693;
    const rightBoxW = imgWidth - rightBoxX;
    
    // Pintamos rectángulo blanco con borde negro tenue para que coincida con el estilo
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.3);
    doc.rect(rightBoxX, marginTop, rightBoxW, imgHeight, 'FD');

    // Escribimos el nombre del módulo dinámicamente
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text('Evaluación por estudiante', rightBoxX + 4, marginTop + 6);
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    const modTitle = data.modulo ? data.modulo.nombre : 'Módulo General';
    const numLines = doc.splitTextToSize(modTitle.toUpperCase(), rightBoxW - 8);
    doc.text(numLines, rightBoxX + 4, marginTop + 12);

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

  // Capacidades (dinámicas)
  writeUnderlinedNormal('Capacidad para evaluar:', marginXIndented, cursorY);
  cursorY += 8;
  
  const caps = data.capacidadesList || CAPACIDADES_LEGACY;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  caps.forEach(cap => {
    const lines = doc.splitTextToSize(`• ${cap}`, pageWidth - marginXIndented - 5 - 10);
    doc.text(lines, marginXIndented + 5, cursorY);
    cursorY += lines.length * 6;
  });
  cursorY += 4;

  doc.setFontSize(12);
  writeUnderlinedNormal('Desempeños para evaluar:', marginXIndented, cursorY);
  cursorY += 6;

  // Tabla de desempeños (dinámica)
  const desempenosParaPDF = data.desempenosList || DESEMPENOS_LEGACY;
  const tableData = desempenosParaPDF.map((crit, i) => {
     let obsText = "";
     if (i === 0) obsText = data.observaciones || "";
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
  const declText = data.declaracion || DECLARACION_DEFAULT;
  doc.text('Declaración del estudiante:', marginX, cursorY);
  cursorY += 5;
  const declLines = doc.splitTextToSize(`"${declText}"`, pageWidth - marginX * 2);
  doc.text(declLines, marginX, cursorY);
  cursorY += declLines.length * 5;

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

// ============================================
// RE-GENERAR PDF DESDE HISTORIAL (sin modal abierto)
// Exportada para uso desde reportes.js
// ============================================
export async function generarPDFDesdeHistorial({ estudiante, trayecto, modulo, desempenos, observaciones, condicion }) {
  const profesores = await fetchAll('profesores');

  const profTrayecto = trayecto?.profesor_id ? profesores.find(p => p.id === trayecto.profesor_id) : null;
  const modActual = modulo || null;
  const profModulo = modActual?.profesor_id ? profesores.find(p => p.id === modActual.profesor_id) : null;

  await generarPDF({
    estudiante,
    trayecto,
    profTrayecto,
    modulo: modActual,
    profModulo,
    desempenos,
    observaciones,
    condicion
  });
}

// ============================================
// IMPRESIÓN DEL MODELO DE ACTA EN PAPEL (FORMATO EN BLANCO)
// ============================================
function imprimirModeloActa(_ctx, desempenosLista, capacidadesLista, declaracionTexto) {
  const desempsImp = desempenosLista || DESEMPENOS_LEGACY;
  const capsImp = capacidadesLista || CAPACIDADES_LEGACY;
  const declImp = declaracionTexto || DECLARACION_DEFAULT;

  const LINEA = '<span style="display:inline-block;border-bottom:1px solid #333;min-width:200px;">&nbsp;</span>';
  const LINEA_CORTA = '<span style="display:inline-block;border-bottom:1px solid #333;min-width:120px;">&nbsp;</span>';

  const filasDesempenos = desempsImp.map((crit) => `
    <tr>
      <td style="padding:6px 8px;font-size:10pt;border:1px solid #999;">${crit}</td>
      <td style="text-align:center;border:1px solid #999;width:40px;">&nbsp;</td>
      <td style="text-align:center;border:1px solid #999;width:40px;">&nbsp;</td>
      <td style="border:1px solid #999;width:160px;padding:5px;">&nbsp;</td>
    </tr>`).join('');

  const listaCaps = capsImp.map(c => `<li>${c}</li>`).join('');

  const paginaHTML = `
    <div class="acta-pagina">
      <div style="position:relative; width:100%;">
        <img src="/imagenes/encabezado-acta.png" style="width:100%;display:block;" onerror="this.style.display='none'" />
        
        <!-- PARCHE MAGICO: tapar la caja derecha del PNG ("Seguridad e Higiene") -->
        <div style="position:absolute; top:0; right:0; width:30.7%; height:100%; background:#fff; border: 2px solid #000; border-left: 1.5px solid #000; box-sizing:border-box; display:flex; flex-direction:column; padding: 8px 10px;">
          <strong style="font-size:11.5pt; margin-bottom:8px; font-family:Arial,sans-serif; color:#000;">Evaluación por estudiante</strong>
          <span style="font-size:10pt; font-family:Arial,sans-serif; color:#000; line-height:1.2;">
            ${(_ctx?.modulo?.nombre || 'Módulo General').toUpperCase()}
          </span>
        </div>
      </div>

      <table style="width:100%;border-collapse:collapse;margin-top:12px;font-family:Arial,sans-serif;font-size:10.5pt;">
        <tr>
          <td style="padding:6px 0;">
            <strong>Nombre del trayecto formativo:</strong> ${LINEA}
          </td>
        </tr>
        <tr>
          <td style="padding:6px 0;">
            <strong>Profesora a cargo del trayecto formativo:</strong> ${LINEA}
          </td>
        </tr>
        <tr>
          <td style="padding:6px 0 6px 28px;">
            <strong>Nombre del módulo:</strong> ${LINEA}
          </td>
        </tr>
        <tr>
          <td style="padding:6px 0 6px 28px;">
            <strong>Nombre del profesor a cargo del módulo:</strong> ${LINEA}
          </td>
        </tr>
        <tr>
          <td style="padding:6px 0 6px 28px;">
            <strong>Nombre y apellido del/la estudiante:</strong> ${LINEA}
          </td>
        </tr>
        <tr>
          <td style="padding:6px 0 6px 28px;">
            <strong>DNI:</strong> ${LINEA_CORTA}
          </td>
        </tr>
      </table>

      <p style="font-family:Arial,sans-serif;font-size:10.5pt;text-decoration:underline;margin:12px 0 4px 28px;">
        Capacidad para evaluar:
      </p>
      <ul style="font-family:Arial,sans-serif;font-size:10pt;margin:0 0 8px 44px;">
        ${listaCaps}
      </ul>

      <p style="font-family:Arial,sans-serif;font-size:10.5pt;text-decoration:underline;margin:10px 0 6px 28px;">
        Desempeños para evaluar:
      </p>

      <table style="width:calc(100% - 28px);margin-left:28px;border-collapse:collapse;font-family:Arial,sans-serif;">
        <thead>
          <tr>
            <th style="background:#2d2d2d;color:#fff;padding:6px 8px;font-size:9pt;text-align:left;border:1px solid #999;">Desempeño</th>
            <th style="background:#2d2d2d;color:#fff;padding:6px 8px;font-size:9pt;text-align:center;border:1px solid #999;width:40px;">SI</th>
            <th style="background:#2d2d2d;color:#fff;padding:6px 8px;font-size:9pt;text-align:center;border:1px solid #999;width:40px;">NO</th>
            <th style="background:#2d2d2d;color:#fff;padding:6px 8px;font-size:9pt;text-align:left;border:1px solid #999;width:160px;">Observaciones</th>
          </tr>
        </thead>
        <tbody>
          ${filasDesempenos}
        </tbody>
      </table>

      <p style="font-family:Arial,sans-serif;font-size:11pt;font-weight:bold;margin:12px 0 0;">
        Condición del estudiante:
        <span style="display:inline-block;border-bottom:1px solid #333;min-width:160px;">&nbsp;</span>
      </p>

      <p style="font-family:Arial,sans-serif;font-size:9pt;margin:10px 0 4px;">Declaración del estudiante:</p>
      <p style="font-family:Arial,sans-serif;font-size:9pt;font-style:italic;margin:0;border:1px solid #ccc;padding:7px 12px;border-radius:4px;background:#f9f9f9;">
        &ldquo;${declImp}&rdquo;
      </p>

      <div style="display:flex;justify-content:space-between;margin-top:32px;font-family:Arial,sans-serif;font-size:9.5pt;">
        <div style="text-align:center;width:30%;">
          <div style="border-top:1px solid #333;padding-top:5px;">Firma del estudiante</div>
        </div>
        <div style="text-align:center;width:30%;">
          <div style="border-top:1px solid #333;padding-top:5px;">Prof. del Trayecto</div>
        </div>
        <div style="text-align:center;width:30%;">
          <div style="border-top:1px solid #333;padding-top:5px;">Prof. del Módulo</div>
        </div>
      </div>
      <div style="display:flex;justify-content:center;margin-top:22px;font-family:Arial,sans-serif;font-size:9.5pt;">
        <div style="text-align:center;width:30%;">
          <div style="border-top:1px solid #333;padding-top:5px;">Firma de la directora</div>
        </div>
      </div>
    </div>
  `;

  const printWindow = window.open('', '_blank', 'width=900,height=700');
  if (!printWindow) {
    showToast('El navegador bloqueó la ventana de impresión. Permití ventanas emergentes.', 'error');
    return;
  }

  printWindow.document.write(`
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8" />
      <title>Modelo de Acta</title>
      <style>
        @page { size: A4 portrait; margin: 14mm 14mm 18mm 14mm; }
        * { box-sizing: border-box; }
        body { margin: 0; padding: 0; background: #fff; color: #000; }
        .acta-pagina { padding: 0; }
        .no-print { display: none !important; }
        @media print {
          body { margin: 0; }
          .no-print { display: none !important; }
        }
      </style>
    </head>
    <body>
      <div class="no-print" style="display:flex!important;justify-content:center;gap:12px;padding:14px;background:#f3f4f6;border-bottom:1px solid #d1d5db;position:sticky;top:0;z-index:99;">
        <button onclick="window.print()" style="padding:9px 22px;background:#6b2cf5;color:#fff;border:none;border-radius:8px;font-size:14px;cursor:pointer;font-weight:600;">🖨️ Imprimir / Guardar PDF</button>
        <button onclick="window.close()" style="padding:9px 22px;background:#e5e7eb;color:#374151;border:none;border-radius:8px;font-size:14px;cursor:pointer;">✕ Cerrar</button>
        <span style="font-size:12px;color:#6b7280;align-self:center;">📋 Modelo en blanco para completar a mano</span>
      </div>
      <div style="padding: 10px 0;">
        ${paginaHTML}
      </div>
    </body>
    </html>
  `);
  printWindow.document.close();
  printWindow.focus();
}
