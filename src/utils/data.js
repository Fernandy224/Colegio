// ============================================
// Capa de datos — 100% Supabase
// ============================================
import { getSupabase } from '../supabaseClient.js';

// ============================================
// API unificada
// ============================================

export async function fetchAll(table, options = {}) {
    console.log(`[Data] Fetching all from ${table}...`);
    let query = getSupabase().from(table).select(options.select || '*');
    
    // Aplicar filtros eq si existen
    if (options.eq) {
        Object.entries(options.eq).forEach(([field, value]) => {
            if (value !== undefined && value !== null) {
                query = query.eq(field, value);
            }
        });
    }

    if (options.orderBy) query = query.order(options.orderBy, { ascending: options.ascending ?? false });
    else query = query.order('created_at', { ascending: false });
    
    const { data, error } = await query;
    if (error) {
        console.error(`[Data] Error fetching ${table}:`, error);
        throw error;
    }
    console.log(`[Data] Fetched ${data?.length || 0} rows from ${table}`);
    return data || [];
}

export async function fetchById(table, id) {
    const { data, error } = await getSupabase().from(table).select('*').eq('id', id).single();
    if (error) throw error;
    return data;
}

export async function fetchByField(table, field, value, select = '*') {
    const { data, error } = await getSupabase()
        .from(table).select(select).eq(field, value).order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
}

export async function create(table, record) {
    const { data, error } = await getSupabase().from(table).insert(record).select();
    if (error) throw error;
    return data ? data[0] : null;
}

export async function update(table, id, changes) {
    const { data, error } = await getSupabase().from(table).update(changes).eq('id', id).select().single();
    if (error) throw error;
    return data;
}

export async function remove(table, id) {
    const { error } = await getSupabase().from(table).delete().eq('id', id);
    if (error) throw error;
    return true;
}

export async function search(table, field, value) {
    const { data, error } = await getSupabase().from(table).select('*').ilike(field, `%${value}%`);
    if (error) throw error;
    return data || [];
}

export async function searchMultipleFields(table, fields, value) {
    const orConditions = fields.map(f => `${f}.ilike.%${value}%`).join(',');
    const { data, error } = await getSupabase().from(table).select('*').or(orConditions);
    if (error) throw error;
    return data || [];
}

export async function checkDniExists(table, dni, excludeId = null) {
    let query = getSupabase().from(table).select('id').eq('dni', dni);
    if (excludeId) query = query.neq('id', excludeId);
    const { data, error } = await query;
    if (error) throw error;
    return (data || []).length > 0;
}

export async function countAll(table) {
    console.log(`[Data] Counting all from ${table}...`);
    const { count, error } = await getSupabase()
        .from(table).select('*', { count: 'exact', head: true });
    if (error) {
        console.error(`[Data] Error counting ${table}:`, error);
        throw error;
    }
    return count || 0;
}

export async function countByField(table, field, value) {
    console.log(`[Data] Counting ${table} where ${field}=${value}...`);
    const { count, error } = await getSupabase()
        .from(table).select('*', { count: 'exact', head: true }).eq(field, value);
    if (error) {
        console.error(`[Data] Error counting ${table} filtered:`, error);
        throw error;
    }
    return count || 0;
}

// Mantener compatibilidad: ya no se usa, pero evita errores de import en auth.js
export function setSupabaseSession() { }

export default { fetchAll, fetchById, fetchByField, create, update, remove, search, searchMultipleFields, checkDniExists, countAll, countByField };
