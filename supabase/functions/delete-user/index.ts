import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json',
};

Deno.serve(async (req: Request) => {
    if (req.method === 'OPTIONS') {
        return new Response(null, { status: 200, headers: CORS_HEADERS });
    }

    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return new Response(JSON.stringify({ error: 'No authorization header' }), { status: 401, headers: CORS_HEADERS });
    }

    const token = authHeader.replace('Bearer ', '').trim();

    const supabaseAdmin = createClient(
        Deno.env.get('SUPABASE_URL')!,
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
        { auth: { autoRefreshToken: false, persistSession: false } }
    );

    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token);
    if (userError || !user) {
        return new Response(JSON.stringify({ error: 'Sesión inválida' }), { status: 401, headers: CORS_HEADERS });
    }

    const { data: perfil, error: perfilError } = await supabaseAdmin
        .from('perfiles').select('rol').eq('id', user.id).single();

    if (perfilError || perfil?.rol !== 'administrador') {
        return new Response(JSON.stringify({ error: 'Solo administradores pueden eliminar usuarios' }), { status: 403, headers: CORS_HEADERS });
    }

    let body: { user_id: string };
    try { body = await req.json(); }
    catch { return new Response(JSON.stringify({ error: 'Body inválido' }), { status: 400, headers: CORS_HEADERS }); }

    const { user_id } = body;
    if (!user_id) {
        return new Response(JSON.stringify({ error: 'user_id es requerido' }), { status: 400, headers: CORS_HEADERS });
    }

    if (user_id === user.id) {
        return new Response(JSON.stringify({ error: 'No podés eliminar tu propia cuenta' }), { status: 400, headers: CORS_HEADERS });
    }

    // 1. Unlink from profesores
    await supabaseAdmin.from('profesores').update({ auth_id: null }).eq('auth_id', user_id);

    // 2. Delete from perfiles
    await supabaseAdmin.from('perfiles').delete().eq('id', user_id);

    // 3. Delete from auth.users
    const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(user_id);
    if (deleteError) {
        return new Response(JSON.stringify({ error: deleteError.message }), { status: 400, headers: CORS_HEADERS });
    }

    return new Response(JSON.stringify({ success: true }), { headers: CORS_HEADERS });
});
