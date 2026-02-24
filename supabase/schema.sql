-- ============================================
-- ESQUEMA SQL - Sistema de Gestión Estudiantil
-- Para ejecutar en Supabase SQL Editor
-- ============================================

-- Tabla: profesores
CREATE TABLE IF NOT EXISTS profesores (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  apellido VARCHAR(100) NOT NULL,
  dni VARCHAR(20) UNIQUE NOT NULL,
  email VARCHAR(150),
  especialidad VARCHAR(150),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla: trayectos_formativos
CREATE TABLE IF NOT EXISTS trayectos_formativos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre VARCHAR(200) NOT NULL,
  descripcion TEXT,
  profesor_id UUID REFERENCES profesores(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla: modulos
CREATE TABLE IF NOT EXISTS modulos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre VARCHAR(200) NOT NULL,
  anio INT,
  trayecto_id UUID REFERENCES trayectos_formativos(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla: submodulos
CREATE TABLE IF NOT EXISTS submodulos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre VARCHAR(200) NOT NULL,
  modulo_id UUID REFERENCES modulos(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla: unidades (pertenecen a un módulo común / submodulo)
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

-- Tabla: seguimiento_modulos (estado de cada módulo por estudiante en un trayecto)
CREATE TABLE IF NOT EXISTS seguimiento_modulos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  inscripcion_id UUID NOT NULL REFERENCES inscripciones(id) ON DELETE CASCADE,
  modulo_id UUID REFERENCES modulos(id) ON DELETE CASCADE,
  submodulo_id UUID REFERENCES submodulos(id) ON DELETE CASCADE,
  estado VARCHAR(50) DEFAULT 'Pendiente' CHECK (estado IN ('Aprobado', 'Desaprobado', 'En curso', 'Pendiente')),
  fecha_aprobacion DATE,
  nota DECIMAL(4,2),
  docente_evaluador VARCHAR(200),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT chk_seg_modulo_o_submodulo CHECK (modulo_id IS NOT NULL OR submodulo_id IS NOT NULL)
);

-- Tabla: seguimiento_unidades (estado de cada unidad individual por estudiante)
CREATE TABLE IF NOT EXISTS seguimiento_unidades (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  inscripcion_id UUID NOT NULL REFERENCES inscripciones(id) ON DELETE CASCADE,
  unidad_id UUID NOT NULL REFERENCES unidades(id) ON DELETE CASCADE,
  estado VARCHAR(50) DEFAULT 'Pendiente' CHECK (estado IN ('Aprobado', 'Desaprobado', 'En curso', 'Pendiente')),
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
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(trayecto_id, submodulo_id)
);

-- Tabla: perfiles (vinculada a auth.users de Supabase)
CREATE TABLE IF NOT EXISTS perfiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nombre VARCHAR(200),
  rol VARCHAR(50) DEFAULT 'administrativo' CHECK (rol IN ('administrador', 'administrativo', 'docente')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- ÍNDICES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_estudiantes_dni ON estudiantes(dni);
CREATE INDEX IF NOT EXISTS idx_estudiantes_anio ON estudiantes(anio_ingreso);
CREATE INDEX IF NOT EXISTS idx_profesores_dni ON profesores(dni);
CREATE INDEX IF NOT EXISTS idx_aprobaciones_estudiante ON aprobaciones(estudiante_id);
CREATE INDEX IF NOT EXISTS idx_modulos_trayecto ON modulos(trayecto_id);
CREATE INDEX IF NOT EXISTS idx_submodulos_modulo ON submodulos(modulo_id);
CREATE INDEX IF NOT EXISTS idx_unidades_submodulo ON unidades(submodulo_id);

-- ============================================
-- POLÍTICAS RLS (Row Level Security)
-- ============================================
ALTER TABLE estudiantes ENABLE ROW LEVEL SECURITY;
ALTER TABLE profesores ENABLE ROW LEVEL SECURITY;
ALTER TABLE trayectos_formativos ENABLE ROW LEVEL SECURITY;
ALTER TABLE modulos ENABLE ROW LEVEL SECURITY;
ALTER TABLE submodulos ENABLE ROW LEVEL SECURITY;
ALTER TABLE aprobaciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE unidades ENABLE ROW LEVEL SECURITY;
ALTER TABLE perfiles ENABLE ROW LEVEL SECURITY;

-- Permitir lectura a usuarios autenticados
CREATE POLICY "Lectura autenticados" ON estudiantes FOR SELECT TO authenticated USING (true);
CREATE POLICY "Lectura autenticados" ON profesores FOR SELECT TO authenticated USING (true);
CREATE POLICY "Lectura autenticados" ON trayectos_formativos FOR SELECT TO authenticated USING (true);
CREATE POLICY "Lectura autenticados" ON modulos FOR SELECT TO authenticated USING (true);
CREATE POLICY "Lectura autenticados" ON submodulos FOR SELECT TO authenticated USING (true);
CREATE POLICY "Lectura autenticados" ON aprobaciones FOR SELECT TO authenticated USING (true);
CREATE POLICY "Lectura autenticados" ON unidades FOR SELECT TO authenticated USING (true);

-- Permitir escritura solo a administradores
CREATE POLICY "Escritura admin" ON estudiantes FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM perfiles WHERE id = auth.uid() AND rol = 'administrador'))
  WITH CHECK (EXISTS (SELECT 1 FROM perfiles WHERE id = auth.uid() AND rol = 'administrador'));

CREATE POLICY "Escritura admin" ON profesores FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM perfiles WHERE id = auth.uid() AND rol = 'administrador'))
  WITH CHECK (EXISTS (SELECT 1 FROM perfiles WHERE id = auth.uid() AND rol = 'administrador'));

CREATE POLICY "Escritura admin" ON trayectos_formativos FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM perfiles WHERE id = auth.uid() AND rol = 'administrador'))
  WITH CHECK (EXISTS (SELECT 1 FROM perfiles WHERE id = auth.uid() AND rol = 'administrador'));

CREATE POLICY "Escritura admin" ON modulos FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM perfiles WHERE id = auth.uid() AND rol = 'administrador'))
  WITH CHECK (EXISTS (SELECT 1 FROM perfiles WHERE id = auth.uid() AND rol = 'administrador'));

CREATE POLICY "Escritura admin" ON submodulos FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM perfiles WHERE id = auth.uid() AND rol = 'administrador'))
  WITH CHECK (EXISTS (SELECT 1 FROM perfiles WHERE id = auth.uid() AND rol = 'administrador'));

CREATE POLICY "Escritura admin" ON aprobaciones FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM perfiles WHERE id = auth.uid() AND rol = 'administrador'))
  WITH CHECK (EXISTS (SELECT 1 FROM perfiles WHERE id = auth.uid() AND rol = 'administrador'));

-- Perfil propio
CREATE POLICY "Ver perfil propio" ON perfiles FOR SELECT TO authenticated
  USING (id = auth.uid());
