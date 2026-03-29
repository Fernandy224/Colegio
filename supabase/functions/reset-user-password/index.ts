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

    try {
        const authHeader = req.headers.get('Authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return new Response(JSON.stringify({ error: 'No authorization header' }), { status: 200, headers: CORS_HEADERS });
        }

        const token = authHeader.replace('Bearer ', '').trim();

        const supabaseAdmin = createClient(
            Deno.env.get('SUPABASE_URL')!,
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
            { auth: { autoRefreshToken: false, persistSession: false } }
        );

        const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token);
        if (userError || !user) {
            return new Response(JSON.stringify({ error: 'Sesión inválida: ' + (userError?.message || '') }), { status: 200, headers: CORS_HEADERS });
        }

        const { data: perfil, error: perfilError } = await supabaseAdmin
            .from('perfiles').select('rol').eq('id', user.id).single();

        if (perfilError || perfil?.rol !== 'administrador') {
            return new Response(JSON.stringify({ error: 'Solo administradores pueden cambiar contraseñas. Rol actual: ' + (perfil?.rol || 'ninguno') }), { status: 200, headers: CORS_HEADERS });
        }

        let body: { user_id: string; password?: string };
        try { 
            body = await req.json(); 
        } catch (e) { 
            return new Response(JSON.stringify({ error: 'Body inválido o vacío' }), { status: 200, headers: CORS_HEADERS }); 
        }

        const { user_id, password } = body;
        if (!user_id) {
            return new Response(JSON.stringify({ error: 'user_id es requerido' }), { status: 200, headers: CORS_HEADERS });
        }
        if (!password) {
            return new Response(JSON.stringify({ error: 'password es requerido' }), { status: 200, headers: CORS_HEADERS });
        }

        // Actualizar la contraseña del usuario en auth.users
        const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(user_id, {
            password: password
        });

        if (updateError) {
            return new Response(JSON.stringify({ error: 'Auth Admin Error: ' + updateError.message }), { status: 200, headers: CORS_HEADERS });
        }

        return new Response(JSON.stringify({ success: true, nueva_password: password }), { status: 200, headers: CORS_HEADERS });
    } catch (err: any) {
        return new Response(JSON.stringify({ error: 'Catch global: ' + err.message }), { status: 200, headers: CORS_HEADERS });
    }
});
