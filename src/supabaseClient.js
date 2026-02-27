// ============================================
// Cliente Supabase — con persistencia de sesión
// ============================================
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

let supabase = null;

export function isSupabaseConfigured() {
    return SUPABASE_URL !== '' && SUPABASE_ANON_KEY !== '';
}

export function getSupabase() {
    if (!supabase && isSupabaseConfigured()) {
        supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
            auth: {
                persistSession: true,       // Guarda la sesión en localStorage
                autoRefreshToken: true,     // Renueva el token automáticamente
                detectSessionInUrl: true,   // Detecta el token en la URL (OAuth)
            }
        });
    }
    return supabase;
}

export default { getSupabase, isSupabaseConfigured };
