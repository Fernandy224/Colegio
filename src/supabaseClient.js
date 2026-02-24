// ============================================
// Cliente Supabase
// ============================================
import { createClient } from '@supabase/supabase-js';

// Configuración: Reemplazar con credenciales reales de Supabase
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

let supabase = null;

export function isSupabaseConfigured() {
    return SUPABASE_URL !== '' && SUPABASE_ANON_KEY !== '';
}

export function getSupabase() {
    if (!supabase && isSupabaseConfigured()) {
        supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    }
    return supabase;
}

export default { getSupabase, isSupabaseConfigured };
