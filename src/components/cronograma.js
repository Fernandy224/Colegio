// ============================================
// Módulo de Cronograma General del Personal
// ============================================
import { getContentArea } from './layout.js';
import { icons, showToast, createModal, sanitize } from '../utils/helpers.js';
import { fetchAll, create, update, remove } from '../utils/data.js';
import { getCurrentUser } from './auth.js';
import { getCurrentYear } from '../utils/state.js';

let currentTurno = 'Mañana'; // 'Mañana' | 'Tarde' | 'Vespertino'
let cronogramaData = [];
let profesoresData = [];
let trayectosData = [];
let submodulosData = [];

export async function renderCronograma() {
    console.log('[Cronograma] Rendering...');
    const content = getContentArea();
    if (!content) return;

    // Loading estado inicial
    content.innerHTML = `
        <div class="section-header">
            <h1 class="section-title">Cronograma General del Personal</h1>
        </div>
        <div style="padding:40px;text-align:center;color:var(--text-muted);">
            Procesando datos del cronograma...
        </div>
    `;

    try {
        const year = getCurrentYear();
        
        // Cargar datos
        const [crono, profs, trayectos, submodulos] = await Promise.all([
            fetchAll('cronograma_personal', { eq: { anio: year } }),
            fetchAll('profesores'),
            fetchAll('trayectos_formativos'),
            fetchAll('submodulos')
        ]);
        
        cronogramaData = crono || [];
        profesoresData = profs || [];
        trayectosData = trayectos || [];
        submodulosData = submodulos || [];

        renderMainView(content);
    } catch (error) {
        console.error('Error loading cronograma:', error);
        content.innerHTML = `<div class="empty-state"><h3>Error cargando el cronograma</h3><p>${error.message}</p></div>`;
    }
}

function renderMainView(content) {
    const user = getCurrentUser();
    const isAdmin = user?.role === 'administrador';
    const miProfesorId = profesoresData.find(p => p.auth_id === user?.id)?.id;

    // Filtrar los datos por el turno actual
    const datosTurno = cronogramaData.filter(d => d.turno === currentTurno);

    content.innerHTML = `
        <div class="section-header">
            <div>
                <h1 class="section-title">Cronograma General</h1>
                <p style="color:var(--text-muted); font-size: 0.9rem;">Año Lectivo: ${getCurrentYear()}</p>
            </div>
            <div class="section-actions">
                <button class="btn btn-secondary" id="btn-export-csv" title="Exportar a Excel (CSV)">
                    ${icons.document} Exportar a Excel
                </button>
                <button class="btn btn-add" id="btn-new-row">
                    ${icons.plus} Nuevo Registro
                </button>
            </div>
        </div>

        <!-- Pestañas de Turno -->
        <div class="tabs-container" style="margin-bottom: 20px;">
            ${['Mañana', 'Tarde', 'Vespertino'].map(turno => `
                <button class="tab-btn ${currentTurno === turno ? 'active' : ''}" data-turno="${turno}">
                    Turno ${turno}
                </button>
            `).join('')}
        </div>

        <!-- Tabla -->
        <div class="table-container" style="overflow-x: auto; background: var(--bg-card); border-radius: 12px; border: 1px solid var(--border-color);">
            <table class="data-table excel-table" style="width: 100%; border-collapse: collapse; min-width: 900px;">
                <thead>
                    <tr style="background: rgba(0,0,0,0.2);">
                        <th style="padding: 12px; text-align: left; border-bottom: 1px solid var(--border-color); width: 12%;">Cargo</th>
                        <th style="padding: 12px; text-align: left; border-bottom: 1px solid var(--border-color); width: 18%;">Trayecto / Materia</th>
                        <th style="padding: 12px; text-align: left; border-bottom: 1px solid var(--border-color); width: 15%;">Docente / Aux.</th>
                        <th style="padding: 12px; text-align: center; border-bottom: 1px solid var(--border-color); width: 11%;">Lunes</th>
                        <th style="padding: 12px; text-align: center; border-bottom: 1px solid var(--border-color); width: 11%;">Martes</th>
                        <th style="padding: 12px; text-align: center; border-bottom: 1px solid var(--border-color); width: 11%;">Miércoles</th>
                        <th style="padding: 12px; text-align: center; border-bottom: 1px solid var(--border-color); width: 11%;">Jueves</th>
                        <th style="padding: 12px; text-align: center; border-bottom: 1px solid var(--border-color); width: 11%;">Viernes</th>
                        ${isAdmin ? '<th style="padding: 12px; width: 40px;"></th>' : ''}
                    </tr>
                </thead>
                <tbody>
                    ${datosTurno.length === 0 ? `
                        <tr><td colspan="9" style="text-align:center; padding: 40px; color: var(--text-muted);">No hay registros en el Turno ${currentTurno}</td></tr>
                    ` : datosTurno.map(row => {
                        const prof = profesoresData.find(p => p.id === row.profesor_id);
                        const trayecto = trayectosData.find(t => t.id === row.trayecto_id);
                        const submodulo = submodulosData.find(s => s.id === row.submodulo_id);
                        
                        let nombreDocente = 'Desconocido/Eliminado';
                        if (prof) nombreDocente = `${prof.nombre} ${prof.apellido}`;
                        else if (row.docente_externo) nombreDocente = `(Ext) ${row.docente_externo}`;
                        let nombreMateria = '-';
                        if (trayecto) {
                            nombreMateria = trayecto.nombre;
                        } else if (submodulo) {
                            nombreMateria = `[Módulo Común] ${submodulo.nombre}`;
                        } else if (row.trayecto_id || row.submodulo_id) {
                            nombreMateria = 'Materia Eliminada';
                        }
                        
                        // Permisos para editar celdas:
                        // Si es externo o profe eliminado, y el current is admin, o si soy titular
                        const canEdit = isAdmin || (miProfesorId && row.profesor_id === miProfesorId);

                        return `
                        <tr class="excel-row" data-id="${row.id}" style="border-bottom: 1px solid var(--border-color);">
                            <td style="padding: 8px; font-weight: 600; font-size: 0.85rem; color: var(--accent-purple-light);">${sanitize(row.cargo || '')}</td>
                            <td style="padding: 8px; font-size: 0.85rem;">${sanitize(nombreMateria)}</td>
                            <td style="padding: 8px; font-size: 0.85rem;">${sanitize(nombreDocente)}</td>
                            ${['lunes', 'martes', 'miercoles', 'jueves', 'viernes'].map(dia => `
                                <td style="padding: 0; position: relative;">
                                    <input type="text" 
                                        class="excel-input ${!row[dia] ? 'empty-cell' : ''}" 
                                        data-row="${row.id}" 
                                        data-col="${dia}" 
                                        value="${sanitize(row[dia] || '')}" 
                                        placeholder="-" 
                                        ${canEdit ? '' : 'disabled'}
                                        style="width: 100%; height: 100%; padding: 12px; background: transparent; border: none; color: inherit; text-align: center; font-family: monospace; font-size: 0.8rem; box-sizing: border-box; outline: none; transition: background 0.2s;"
                                    />
                                </td>
                            `).join('')}
                            ${isAdmin ? `
                                <td style="padding: 8px; text-align: center;">
                                    <button class="btn-icon-danger btn-delete-row" data-id="${row.id}" title="Eliminar fila">${icons.trash}</button>
                                </td>
                            ` : ''}
                        </tr>
                        `;
                    }).join('')}
                </tbody>
            </table>
        </div>
    `;

    bindEvents(content, isAdmin, miProfesorId);
}

function bindEvents(content, isAdmin, miProfesorId) {
    // Pestañas
    content.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            currentTurno = e.target.dataset.turno;
            renderMainView(content);
        });
    });

    // Nuevo Registro
    const btnNew = content.querySelector('#btn-new-row');
    if (btnNew) {
        btnNew.addEventListener('click', () => {
            abrirModalNuevoRegistro();
        });
    }

    // Edición de celdas (Automático al perder foco - blur)
    content.querySelectorAll('.excel-input').forEach(input => {
        // Estilo al enfocar
        input.addEventListener('focus', function() {
            this.style.background = 'rgba(139, 92, 246, 0.1)';
            this.style.border = '1px solid var(--accent-purple)';
        });

        // Guardar al perder el foco
        input.addEventListener('blur', async function() {
            this.style.background = 'transparent';
            this.style.border = 'none';
            
            const rowId = this.dataset.row;
            const colName = this.dataset.col;
            const newValue = this.value.trim();
            
            // Buscar valor original
            const originalRow = cronogramaData.find(d => d.id === rowId);
            if (originalRow && (originalRow[colName] || '') === newValue) {
                return; // No hubo cambios
            }

            try {
                this.classList.add('saving'); // Opcional para feedback visual
                await update('cronograma_personal', rowId, { [colName]: newValue });
                
                // Actualizar cache local
                if (originalRow) {
                    originalRow[colName] = newValue;
                }
                
                // Refrescar estilo si está vacío
                if (!newValue) this.classList.add('empty-cell');
                else this.classList.remove('empty-cell');

                showToast('Guardado', 'success');
            } catch (err) {
                console.error('Error al guardar celda:', err);
                showToast('Error al guardar los cambios', 'error');
                // Revertir
                if (originalRow) this.value = originalRow[colName] || '';
            } finally {
                this.classList.remove('saving');
            }
        });

        // Permitir guardar al presionar Enter
        input.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') {
                this.blur(); // Dispara el evento de blur para guardar
            }
        });
    });

    // Borrar registro (Solo Admin)
    content.querySelectorAll('.btn-delete-row').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            if (!confirm('¿Seguro que deseas eliminar esta fila del cronograma?')) return;
            const rowId = e.currentTarget.dataset.id;
            try {
                await remove('cronograma_personal', rowId);
                cronogramaData = cronogramaData.filter(d => d.id !== rowId);
                renderMainView(content);
                showToast('Fila eliminada correctamente');
            } catch (err) {
                console.error('Error al eliminar fila:', err);
                showToast('No se pudo eliminar la fila', 'error');
            }
        });
    });

    // Exportar CSV
    const btnExport = content.querySelector('#btn-export-csv');
    if (btnExport) {
        btnExport.addEventListener('click', () => {
            exportarCronogramaCSV();
        });
    }
}

function abrirModalNuevoRegistro() {
    const html = `
        <div class="form-group">
            <label>Cargo / Rol</label>
            <input type="text" id="nuevo-cargo" class="form-control" placeholder="Ej: Maestro de Taller, Director, Auxiliar..." required>
        </div>
        <div class="form-group">
            <label>Docente / Auxiliar</label>
            <select id="nuevo-docente" class="form-control" required>
                <option value="">Seleccione personal...</option>
                ${profesoresData.map(p => `<option value="${p.id}">${p.nombre} ${p.apellido}</option>`).join('')}
                <option value="_externo" style="font-weight:600; color:var(--accent-purple);">-- Personal Externo / Otro --</option>
            </select>
        </div>
        <div class="form-group" id="grupo-externo" style="display:none; margin-top:-8px;">
            <input type="text" id="nuevo-docente-ext" class="form-control" placeholder="Escriba el nombre completo...">
        </div>
        <div class="form-group">
            <label>Trayecto o Materia (Opcional)</label>
            <select id="nuevo-trayecto" class="form-control">
                <option value="">-- Ninguno o General --</option>
                <optgroup label="Trayectos Formativos">
                    ${trayectosData.map(t => `<option value="trayecto_${t.id}">${t.nombre}</option>`).join('')}
                </optgroup>
                <optgroup label="Módulos Comunes">
                    ${submodulosData.map(s => `<option value="submodulo_${s.id}">${s.nombre}</option>`).join('')}
                </optgroup>
            </select>
        </div>
    `;

    const footer = `
        <button class="btn btn-secondary" id="btn-cancel-new">Cancelar</button>
        <button class="btn btn-primary" id="btn-save-new">Añadir al Turno ${currentTurno}</button>
    `;

    const modal = createModal(`Añadir personal al Turno ${currentTurno}`, html, footer);

    modal.querySelector('#btn-cancel-new').addEventListener('click', () => modal.remove());
    
    // Toggle para docente externo
    const selDocente = modal.querySelector('#nuevo-docente');
    const grpExterno = modal.querySelector('#grupo-externo');
    selDocente.addEventListener('change', () => {
        if (selDocente.value === '_externo') {
            grpExterno.style.display = 'block';
            modal.querySelector('#nuevo-docente-ext').focus();
        } else {
            grpExterno.style.display = 'none';
        }
    });

    modal.querySelector('#btn-save-new').addEventListener('click', async () => {
        const cargo = document.getElementById('nuevo-cargo').value.trim();
        let profesor_id = document.getElementById('nuevo-docente').value;
        const docente_externo = document.getElementById('nuevo-docente-ext').value.trim();
        const selectMateria = document.getElementById('nuevo-trayecto').value || '';
        
        let trayecto_id = null;
        let submodulo_id = null;
        
        if (selectMateria.startsWith('trayecto_')) {
            trayecto_id = selectMateria.split('trayecto_')[1];
        } else if (selectMateria.startsWith('submodulo_')) {
            submodulo_id = selectMateria.split('submodulo_')[1];
        }

        let isExterno = false;
        if (profesor_id === '_externo') {
            profesor_id = null;
            isExterno = true;
        }

        if (!cargo || (!profesor_id && !isExterno)) {
            showToast('Por favor, ingresa el cargo y selecciona un docente.', 'warning');
            return;
        }
        
        if (isExterno && !docente_externo) {
            showToast('Por favor, indica el nombre del personal externo.', 'warning');
            return;
        }

        const btn = modal.querySelector('#btn-save-new');
        btn.disabled = true;
        btn.textContent = 'Guardando...';

        try {
            const result = await create('cronograma_personal', {
                profesor_id,
                docente_externo: isExterno ? docente_externo : null,
                trayecto_id,
                submodulo_id,
                cargo,
                turno: currentTurno,
                anio: getCurrentYear()
            });

            if (result) {
                cronogramaData.push(result);
                renderMainView(getContentArea());
                showToast('Fila añadida con éxito');
                modal.remove();
            }
        } catch (err) {
            console.error('Error al añadir fila:', err);
            showToast('Error al guardar en la base de datos', 'error');
            btn.disabled = false;
            btn.textContent = `Añadir al Turno ${currentTurno}`;
        }
    });
}

function exportarCronogramaCSV() {
    const year = getCurrentYear();
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Turno,Cargo,Trayecto,Docente,Lunes,Martes,Miércoles,Jueves,Viernes\n";

    cronogramaData.forEach(row => {
        const prof = profesoresData.find(p => p.id === row.profesor_id);
        const trayecto = trayectosData.find(t => t.id === row.trayecto_id);
        const submodulo = submodulosData.find(s => s.id === row.submodulo_id);
        
        let nombreDocente = '';
        if (prof) nombreDocente = `${prof.nombre} ${prof.apellido}`;
        else if (row.docente_externo) nombreDocente = row.docente_externo;
        let nombreMateria = '';
        if (trayecto) nombreMateria = trayecto.nombre;
        else if (submodulo) nombreMateria = `[Módulo Común] ${submodulo.nombre}`;

        // Envolver campos en comillas para evitar problemas con comas internas
        const formatField = (str) => `"${(str || '').replace(/"/g, '""')}"`;

        const csvRow = [
            formatField(row.turno),
            formatField(row.cargo),
            formatField(nombreMateria),
            formatField(nombreDocente),
            formatField(row.lunes),
            formatField(row.martes),
            formatField(row.miercoles),
            formatField(row.jueves),
            formatField(row.viernes)
        ].join(",");
        
        csvContent += csvRow + "\n";
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Cronograma_General_${year}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
}
