-- ============================================
-- ESQUEMA SQL - Sistema de Gestión Educativa
-- Antigravity — Actualizado 2026-03
-- Para ejecutar en Supabase SQL Editor
-- ============================================

-- ==============================
-- TABLAS PRINCIPALES
-- ==============================

-- Tabla: profesores
CREATE TABLE IF NOT EXISTS profesores (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  apellido VARCHAR(100) NOT NULL,
  dni VARCHAR(20) UNIQUE NOT NULL,
  email VARCHAR(150),
  especialidad VARCHAR(150),
  foto_url TEXT,
  auth_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla: trayectos_formativos
CREATE TABLE IF NOT EXISTS trayectos_formativos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre VARCHAR(200) NOT NULL,
  descripcion TEXT,
  duracion VARCHAR(100),
  profesor_id UUID REFERENCES profesores(id) ON DELETE SET NULL,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla: modulos (módulos específicos de un trayecto)
CREATE TABLE IF NOT EXISTS modulos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre VARCHAR(200) NOT NULL,
  anio INT,
  estado VARCHAR(50) DEFAULT 'Pendiente',
  trayecto_id UUID REFERENCES trayectos_formativos(id) ON DELETE SET NULL,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla: plantillas_actas (Modelos dinámicos de actas por área/profesor)
CREATE TABLE IF NOT EXISTS plantillas_actas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre VARCHAR(200) NOT NULL,
  desempenos JSONB DEFAULT '[]',
  capacidades JSONB DEFAULT '[]',
  declaracion TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla: submodulos (módulos comunes/transversales)
CREATE TABLE IF NOT EXISTS submodulos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre VARCHAR(200) NOT NULL,
  descripcion TEXT,
  modulo_id UUID REFERENCES modulos(id) ON DELETE CASCADE,
  profesor_id UUID REFERENCES profesores(id) ON DELETE SET NULL,
  plantilla_acta_id UUID REFERENCES plantillas_actas(id) ON DELETE SET NULL,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla: unidades (pertenecen a un módulo común)
CREATE TABLE IF NOT EXISTS unidades (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre VARCHAR(200) NOT NULL,
  orden INT DEFAULT 1,
  submodulo_id UUID NOT NULL REFERENCES submodulos(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla: estudiantes
CREATE TABLE IF NOT EXISTS estudiantes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  apellido VARCHAR(100) NOT NULL,
  dni VARCHAR(20) UNIQUE NOT NULL,
  anio_ingreso INT NOT NULL,
  estado VARCHAR(50) DEFAULT 'Activo',
  genero TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla: aprobaciones
CREATE TABLE IF NOT EXISTS aprobaciones (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  estudiante_id UUID NOT NULL REFERENCES estudiantes(id) ON DELETE CASCADE,
  modulo_id UUID REFERENCES modulos(id) ON DELETE SET NULL,
  submodulo_id UUID REFERENCES submodulos(id) ON DELETE SET NULL,
  fecha DATE NOT NULL DEFAULT CURRENT_DATE,
  nota DECIMAL(4,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT chk_modulo_o_submodulo CHECK (modulo_id IS NOT NULL OR submodulo_id IS NOT NULL)
);

-- Tabla: inscripciones (estudiante inscripto en un trayecto formativo)
CREATE TABLE IF NOT EXISTS inscripciones (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  estudiante_id UUID NOT NULL REFERENCES estudiantes(id) ON DELETE CASCADE,
  trayecto_id UUID NOT NULL REFERENCES trayectos_formativos(id) ON DELETE CASCADE,
  estado VARCHAR(50) DEFAULT 'En curso' CHECK (estado IN ('En curso', 'Regular', 'Completo', 'Finalizado', 'Abandonado')),
  fecha_inscripcion DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(estudiante_id, trayecto_id)
);

-- Tabla: seguimiento_modulos (estado de cada módulo por inscripción)
CREATE TABLE IF NOT EXISTS seguimiento_modulos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  inscripcion_id UUID NOT NULL REFERENCES inscripciones(id) ON DELETE CASCADE,
  modulo_id UUID REFERENCES modulos(id) ON DELETE CASCADE,
  submodulo_id UUID REFERENCES submodulos(id) ON DELETE CASCADE,
  estado VARCHAR(50) DEFAULT 'Pendiente' CHECK (estado IN ('Aprobado', 'Desaprobado', 'En curso', 'Pendiente', 'No aplica')),
  fecha_aprobacion DATE,
  nota DECIMAL(4,2),
  docente_evaluador VARCHAR(200),
  desempenos JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT chk_seg_modulo_o_submodulo CHECK (modulo_id IS NOT NULL OR submodulo_id IS NOT NULL)
);

-- Tabla: seguimiento_unidades (estado de cada unidad por inscripción)
CREATE TABLE IF NOT EXISTS seguimiento_unidades (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  inscripcion_id UUID NOT NULL REFERENCES inscripciones(id) ON DELETE CASCADE,
  unidad_id UUID NOT NULL REFERENCES unidades(id) ON DELETE CASCADE,
  estado VARCHAR(50) DEFAULT 'Pendiente' CHECK (estado IN ('Aprobado', 'Desaprobado', 'En curso', 'Pendiente', 'No aplica')),
  nota DECIMAL(4,2),
  docente_evaluador VARCHAR(200),
  fecha_aprobacion DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(inscripcion_id, unidad_id)
);

-- Tabla: trayecto_modulo_comun (relación muchos a muchos: módulo común compartido entre trayectos)
CREATE TABLE IF NOT EXISTS trayecto_modulo_comun (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  trayecto_id UUID NOT NULL REFERENCES trayectos_formativos(id) ON DELETE CASCADE,
  submodulo_id UUID NOT NULL REFERENCES submodulos(id) ON DELETE CASCADE,
  estado VARCHAR(50) DEFAULT 'Pendiente',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(trayecto_id, submodulo_id)
);

-- Tabla: perfiles (vinculada a auth.users de Supabase)
CREATE TABLE IF NOT EXISTS perfiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nombre VARCHAR(200),
  email TEXT,
  rol VARCHAR(50) DEFAULT 'profesor' CHECK (rol IN ('administrador', 'profesor')),
  activo BOOLEAN DEFAULT false,
  must_change_password BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla: asistencias
CREATE TABLE IF NOT EXISTS asistencias (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  estudiante_id UUID NOT NULL REFERENCES estudiantes(id) ON DELETE CASCADE,
  trayecto_id UUID REFERENCES trayectos_formativos(id) ON DELETE SET NULL,
  modulo_comun_id UUID REFERENCES submodulos(id) ON DELETE SET NULL,
  fecha_clase DATE NOT NULL,
  presente BOOLEAN DEFAULT false,
  observaciones TEXT,
  tema_clase TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla: actas (registro de documentos generados por estudiante)
CREATE TABLE IF NOT EXISTS actas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tipo TEXT NOT NULL CHECK (tipo IN ('modulo', 'trayecto')),
  nombre TEXT NOT NULL,
  descripcion TEXT,
  archivo_url TEXT NOT NULL,
  fecha DATE DEFAULT CURRENT_DATE,
  grupo_id UUID REFERENCES trayectos_formativos(id) ON DELETE SET NULL,
  submodulo_id UUID REFERENCES submodulos(id) ON DELETE SET NULL,
  estudiante_id UUID REFERENCES estudiantes(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla: documentos_trayectos
CREATE TABLE IF NOT EXISTS documentos_trayectos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  trayecto_id UUID REFERENCES trayectos_formativos(id) ON DELETE CASCADE,
  nombre TEXT NOT NULL,
  url TEXT NOT NULL,
  tipo TEXT DEFAULT 'general',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla: documentos_profesores
CREATE TABLE IF NOT EXISTS documentos_profesores (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  profesor_id UUID NOT NULL REFERENCES profesores(id) ON DELETE CASCADE,
  nombre VARCHAR(200) NOT NULL,
  url TEXT NOT NULL,
  tipo VARCHAR(50) DEFAULT 'general',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla: asignaciones_profesor
CREATE TABLE IF NOT EXISTS asignaciones_profesor (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  profesor_id UUID NOT NULL REFERENCES profesores(id) ON DELETE CASCADE,
  trayecto_id UUID NOT NULL REFERENCES trayectos_formativos(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla: disponibilidad_docentes
CREATE TABLE IF NOT EXISTS disponibilidad_docentes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  profesor_id UUID REFERENCES profesores(id) ON DELETE CASCADE,
  dia_semana INT NOT NULL CHECK (dia_semana >= 1 AND dia_semana <= 5),
  hora_entrada TIME NOT NULL,
  hora_salida TIME NOT NULL,
  cuatrimestre INT NOT NULL CHECK (cuatrimestre IN (1, 2)),
  anio INT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla: horarios_submodulos
CREATE TABLE IF NOT EXISTS horarios_submodulos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  submodulo_id UUID NOT NULL REFERENCES submodulos(id) ON DELETE CASCADE,
  trayecto_id UUID REFERENCES trayectos_formativos(id) ON DELETE SET NULL,
  cuatrimestre INT NOT NULL CHECK (cuatrimestre IN (1, 2)),
  anio INT DEFAULT 2025,
  dia_semana INT NOT NULL CHECK (dia_semana >= 1 AND dia_semana <= 5),
  hora_inicio TIME,
  hora_fin TIME,
  grupo_comision VARCHAR(100),
  aula VARCHAR(100),
  observaciones TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla: horarios_docentes
CREATE TABLE IF NOT EXISTS horarios_docentes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  trayecto_id UUID REFERENCES trayectos_formativos(id) ON DELETE SET NULL,
  grupo_comision VARCHAR(100),
  dia_semana INT NOT NULL CHECK (dia_semana >= 1 AND dia_semana <= 5),
  hora_inicio TIME NOT NULL,
  hora_fin TIME NOT NULL,
  aula VARCHAR(100),
  observaciones TEXT,
  anio INT DEFAULT EXTRACT(year FROM CURRENT_DATE),
  horario_eventual VARCHAR(200),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==============================
-- ÍNDICES
-- ==============================
CREATE INDEX IF NOT EXISTS idx_estudiantes_dni ON estudiantes(dni);
CREATE INDEX IF NOT EXISTS idx_estudiantes_anio ON estudiantes(anio_ingreso);
CREATE INDEX IF NOT EXISTS idx_profesores_dni ON profesores(dni);
CREATE INDEX IF NOT EXISTS idx_aprobaciones_estudiante ON aprobaciones(estudiante_id);
CREATE INDEX IF NOT EXISTS idx_modulos_trayecto ON modulos(trayecto_id);
CREATE INDEX IF NOT EXISTS idx_submodulos_modulo ON submodulos(modulo_id);
CREATE INDEX IF NOT EXISTS idx_unidades_submodulo ON unidades(submodulo_id);
CREATE INDEX IF NOT EXISTS idx_seguimiento_inscripcion ON seguimiento_modulos(inscripcion_id);
CREATE INDEX IF NOT EXISTS idx_inscripciones_estudiante ON inscripciones(estudiante_id);
CREATE INDEX IF NOT EXISTS idx_inscripciones_trayecto ON inscripciones(trayecto_id);
CREATE INDEX IF NOT EXISTS idx_actas_estudiante ON actas(estudiante_id);

-- ==============================
-- FUNCIONES DE SEGURIDAD
-- ==============================

-- Función: verificar si el usuario es admin activo
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
DECLARE
    v_rol VARCHAR;
    v_activo BOOLEAN;
BEGIN
    SELECT rol, activo INTO v_rol, v_activo FROM public.perfiles WHERE id = auth.uid();
    RETURN COALESCE(v_rol = 'administrador' AND v_activo = true, FALSE);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Función: evitar eliminar o degradar el último administrador
CREATE OR REPLACE FUNCTION check_last_admin()
RETURNS TRIGGER AS $$
DECLARE
    admin_count INT;
BEGIN
    IF TG_OP = 'DELETE' THEN
        SELECT COUNT(*) INTO admin_count FROM perfiles WHERE rol = 'administrador' AND activo = true AND id != OLD.id;
        IF admin_count = 0 AND OLD.rol = 'administrador' AND OLD.activo = true THEN
            RAISE EXCEPTION 'No se puede eliminar el último administrador activo del sistema.';
        END IF;
        RETURN OLD;
    ELSIF TG_OP = 'UPDATE' THEN
        IF OLD.rol = 'administrador' AND OLD.activo = true AND (NEW.rol != 'administrador' OR NEW.activo = false) THEN
            SELECT COUNT(*) INTO admin_count FROM perfiles WHERE rol = 'administrador' AND activo = true AND id != OLD.id;
            IF admin_count = 0 THEN
                RAISE EXCEPTION 'No se puede desactivar o quitar el rol al último administrador activo del sistema.';
            END IF;
        END IF;
        RETURN NEW;
    END IF;
END;
$$ LANGUAGE plpgsql SET search_path = public;

DROP TRIGGER IF EXISTS prevent_last_admin_removal ON perfiles;
CREATE TRIGGER prevent_last_admin_removal
BEFORE UPDATE OR DELETE ON perfiles
FOR EACH ROW EXECUTE FUNCTION check_last_admin();

-- ==============================
-- ROW LEVEL SECURITY (RLS)
-- ==============================

-- Habilitar RLS en todas las tablas
ALTER TABLE estudiantes ENABLE ROW LEVEL SECURITY;
ALTER TABLE profesores ENABLE ROW LEVEL SECURITY;
ALTER TABLE trayectos_formativos ENABLE ROW LEVEL SECURITY;
ALTER TABLE modulos ENABLE ROW LEVEL SECURITY;
ALTER TABLE submodulos ENABLE ROW LEVEL SECURITY;
ALTER TABLE aprobaciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE unidades ENABLE ROW LEVEL SECURITY;
ALTER TABLE perfiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE inscripciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE seguimiento_modulos ENABLE ROW LEVEL SECURITY;
ALTER TABLE seguimiento_unidades ENABLE ROW LEVEL SECURITY;
ALTER TABLE trayecto_modulo_comun ENABLE ROW LEVEL SECURITY;
ALTER TABLE asistencias ENABLE ROW LEVEL SECURITY;
ALTER TABLE actas ENABLE ROW LEVEL SECURITY;
ALTER TABLE documentos_trayectos ENABLE ROW LEVEL SECURITY;
ALTER TABLE documentos_profesores ENABLE ROW LEVEL SECURITY;
ALTER TABLE asignaciones_profesor ENABLE ROW LEVEL SECURITY;
ALTER TABLE disponibilidad_docentes ENABLE ROW LEVEL SECURITY;
ALTER TABLE horarios_submodulos ENABLE ROW LEVEL SECURITY;
ALTER TABLE horarios_docentes ENABLE ROW LEVEL SECURITY;
ALTER TABLE plantillas_actas ENABLE ROW LEVEL SECURITY;

-- POLÍTICAS: Lectura para autenticados, escritura solo admin
-- (Patrón estándar del sistema educativo)

CREATE POLICY "Lectura autenticados" ON estudiantes FOR SELECT TO authenticated USING (true);
CREATE POLICY "Escritura admin" ON estudiantes FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "Lectura autenticados" ON profesores FOR SELECT TO authenticated USING (true);
CREATE POLICY "Escritura admin" ON profesores FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "Lectura autenticados" ON trayectos_formativos FOR SELECT TO authenticated USING (true);
CREATE POLICY "Escritura admin" ON trayectos_formativos FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "Lectura autenticados" ON modulos FOR SELECT TO authenticated USING (true);
CREATE POLICY "Escritura admin" ON modulos FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "Lectura autenticados" ON submodulos FOR SELECT TO authenticated USING (true);
CREATE POLICY "Escritura admin" ON submodulos FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "Lectura autenticados" ON aprobaciones FOR SELECT TO authenticated USING (true);
CREATE POLICY "Escritura admin" ON aprobaciones FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "Lectura autenticados" ON unidades FOR SELECT TO authenticated USING (true);
CREATE POLICY "Escritura admin" ON unidades FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "Lectura autenticados" ON inscripciones FOR SELECT TO authenticated USING (true);
CREATE POLICY "Escritura admin" ON inscripciones FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "Lectura autenticados" ON seguimiento_modulos FOR SELECT TO authenticated USING (true);
CREATE POLICY "Escritura admin" ON seguimiento_modulos FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "Lectura autenticados" ON seguimiento_unidades FOR SELECT TO authenticated USING (true);
CREATE POLICY "Escritura admin" ON seguimiento_unidades FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "Lectura autenticados" ON trayecto_modulo_comun FOR SELECT TO authenticated USING (true);
CREATE POLICY "Escritura admin" ON trayecto_modulo_comun FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "Lectura autenticados" ON asistencias FOR SELECT TO authenticated USING (true);
CREATE POLICY "Escritura admin" ON asistencias FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "Lectura autenticados" ON actas FOR SELECT TO authenticated USING (true);
CREATE POLICY "Escritura admin" ON actas FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "Lectura autenticados" ON documentos_trayectos FOR SELECT TO authenticated USING (true);
CREATE POLICY "Escritura admin" ON documentos_trayectos FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "Lectura autenticados" ON documentos_profesores FOR SELECT TO authenticated USING (true);
CREATE POLICY "Escritura admin" ON documentos_profesores FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "Lectura autenticados" ON asignaciones_profesor FOR SELECT TO authenticated USING (true);
CREATE POLICY "Escritura admin" ON asignaciones_profesor FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "Lectura autenticados" ON disponibilidad_docentes FOR SELECT TO authenticated USING (true);
CREATE POLICY "Escritura admin" ON disponibilidad_docentes FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "Lectura autenticados" ON horarios_submodulos FOR SELECT TO authenticated USING (true);
CREATE POLICY "Escritura admin" ON horarios_submodulos FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "Lectura autenticados" ON horarios_docentes FOR SELECT TO authenticated USING (true);
CREATE POLICY "Escritura admin" ON horarios_docentes FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "Lectura perfiles" ON perfiles FOR SELECT TO authenticated USING (id = auth.uid() OR public.is_admin());
CREATE POLICY "Escritura admin perfiles" ON perfiles FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "Lectura autenticados" ON plantillas_actas FOR SELECT TO authenticated USING (true);
CREATE POLICY "Escritura admin plantillas_actas" ON plantillas_actas FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
