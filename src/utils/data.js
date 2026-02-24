// ============================================
// Capa de datos (Demo con localStorage)
// ============================================
import { getSupabase, isSupabaseConfigured } from '../supabaseClient.js';
import { generateId } from './helpers.js';

// Datos de ejemplo
const DEMO_DATA = {
    estudiantes: [
        { id: generateId(), nombre: 'Lucía', apellido: 'Martínez', dni: '42356789', anio_ingreso: 2024, estado: 'Activo' },
        { id: generateId(), nombre: 'Tomás', apellido: 'García', dni: '41234567', anio_ingreso: 2024, estado: 'Activo' },
        { id: generateId(), nombre: 'Valentina', apellido: 'López', dni: '43567890', anio_ingreso: 2023, estado: 'Activo' },
        { id: generateId(), nombre: 'Mateo', apellido: 'Rodríguez', dni: '40123456', anio_ingreso: 2023, estado: 'Activo' },
        { id: generateId(), nombre: 'Camila', apellido: 'Fernández', dni: '44678901', anio_ingreso: 2022, estado: 'Egresado' },
        { id: generateId(), nombre: 'Santiago', apellido: 'Pérez', dni: '39012345', anio_ingreso: 2024, estado: 'Activo' },
        { id: generateId(), nombre: 'Sofía', apellido: 'González', dni: '45789012', anio_ingreso: 2023, estado: 'Activo' },
        { id: generateId(), nombre: 'Benjamín', apellido: 'Díaz', dni: '38901234', anio_ingreso: 2022, estado: 'Inactivo' },
        { id: generateId(), nombre: 'Isabella', apellido: 'Ruiz', dni: '46890123', anio_ingreso: 2024, estado: 'Activo' },
    ],
    profesores: [
        { id: generateId(), nombre: 'María', apellido: 'Sánchez', dni: '28123456', email: 'msanchez@edu.ar', especialidad: 'Programación' },
        { id: generateId(), nombre: 'Carlos', apellido: 'Torres', dni: '30234567', email: 'ctorres@edu.ar', especialidad: 'Redes' },
        { id: generateId(), nombre: 'Ana', apellido: 'Romero', dni: '29345678', email: 'aromero@edu.ar', especialidad: 'Diseño Web' },
        { id: generateId(), nombre: 'Roberto', apellido: 'Morales', dni: '27456789', email: 'rmorales@edu.ar', especialidad: 'Base de Datos' },
        { id: generateId(), nombre: 'Laura', apellido: 'Acosta', dni: '31567890', email: 'lacosta@edu.ar', especialidad: 'Matemática' },
    ],
    trayectos_formativos: [],
    modulos: [],
    submodulos: [],
    unidades: [],
    inscripciones: [],
    seguimiento_modulos: [],
    seguimiento_unidades: [],
    trayecto_modulo_comun: [],
    aprobaciones: [],
};

function initDemoData() {
    const tables = ['estudiantes', 'profesores', 'trayectos_formativos', 'modulos', 'submodulos', 'unidades', 'inscripciones', 'seguimiento_modulos', 'seguimiento_unidades', 'trayecto_modulo_comun', 'aprobaciones'];
    tables.forEach(table => {
        if (!localStorage.getItem(`demo_${table}`)) {
            localStorage.setItem(`demo_${table}`, JSON.stringify(DEMO_DATA[table] || []));
        }
    });
}

function getLocalData(table) {
    const data = localStorage.getItem(`demo_${table}`);
    return data ? JSON.parse(data) : [];
}

function setLocalData(table, data) {
    localStorage.setItem(`demo_${table}`, JSON.stringify(data));
}

// ============================================
// API unificada
// ============================================

export async function fetchAll(table) {
    if (isSupabaseConfigured()) {
        const { data, error } = await getSupabase().from(table).select('*').order('created_at', { ascending: false });
        if (error) throw error;
        return data;
    }
    return getLocalData(table);
}

export async function fetchById(table, id) {
    if (isSupabaseConfigured()) {
        const { data, error } = await getSupabase().from(table).select('*').eq('id', id).single();
        if (error) throw error;
        return data;
    }
    return getLocalData(table).find(item => item.id === id);
}

export async function create(table, record) {
    if (isSupabaseConfigured()) {
        const { data, error } = await getSupabase().from(table).insert(record).select().single();
        if (error) throw error;
        return data;
    }
    const items = getLocalData(table);
    const newItem = { id: generateId(), ...record, created_at: new Date().toISOString() };
    items.unshift(newItem);
    setLocalData(table, items);
    return newItem;
}

export async function update(table, id, changes) {
    if (isSupabaseConfigured()) {
        const { data, error } = await getSupabase().from(table).update(changes).eq('id', id).select().single();
        if (error) throw error;
        return data;
    }
    const items = getLocalData(table);
    const idx = items.findIndex(item => item.id === id);
    if (idx === -1) throw new Error('Registro no encontrado');
    items[idx] = { ...items[idx], ...changes };
    setLocalData(table, items);
    return items[idx];
}

export async function remove(table, id) {
    if (isSupabaseConfigured()) {
        const { error } = await getSupabase().from(table).delete().eq('id', id);
        if (error) throw error;
        return true;
    }
    const items = getLocalData(table).filter(item => item.id !== id);
    setLocalData(table, items);
    return true;
}

export async function search(table, field, value) {
    if (isSupabaseConfigured()) {
        const { data, error } = await getSupabase().from(table).select('*').ilike(field, `%${value}%`);
        if (error) throw error;
        return data;
    }
    return getLocalData(table).filter(item =>
        String(item[field] || '').toLowerCase().includes(value.toLowerCase())
    );
}

export async function searchMultipleFields(table, fields, value) {
    if (isSupabaseConfigured()) {
        const orConditions = fields.map(f => `${f}.ilike.%${value}%`).join(',');
        const { data, error } = await getSupabase().from(table).select('*').or(orConditions);
        if (error) throw error;
        return data;
    }
    const lowerVal = value.toLowerCase();
    return getLocalData(table).filter(item =>
        fields.some(f => String(item[f] || '').toLowerCase().includes(lowerVal))
    );
}

// Validar duplicado de DNI
export async function checkDniExists(table, dni, excludeId = null) {
    const items = await fetchAll(table);
    return items.some(item => item.dni === dni && item.id !== excludeId);
}

// Contadores para dashboard
export async function countAll(table) {
    const items = await fetchAll(table);
    return items.length;
}

export async function countByField(table, field, value) {
    const items = await fetchAll(table);
    return items.filter(item => item[field] === value).length;
}

// Inicializar datos demo
initDemoData();

export default { fetchAll, fetchById, create, update, remove, search, searchMultipleFields, checkDniExists, countAll, countByField };
