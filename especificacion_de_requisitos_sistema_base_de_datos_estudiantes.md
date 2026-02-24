# ESPECIFICACIÓN DE REQUISITOS DEL SISTEMA (ERS)

## 1. Introducción

### 1.1 Propósito
El presente documento tiene como objetivo definir los requisitos funcionales y no funcionales para el desarrollo de un sistema informático destinado a la gestión y consulta de datos académicos de estudiantes.

### 1.2 Alcance
El sistema permitirá almacenar y consultar información académica de estudiantes, incluyendo:
- Año de cursado
- Módulos aprobados
- Submódulos aprobados

El sistema funcionará como base de datos académica y herramienta de consulta para personal administrativo y/o docentes autorizados.

### 1.3 Definiciones
- Estudiante: Persona registrada en el sistema con información académica asociada.
- Módulo: Unidad académica principal dentro de un plan de estudios.
- Submódulo: Subdivisión de un módulo.
- Año de cursado: Año académico en el cual el estudiante cursó materias.

---

## 2. Descripción General

### 2.1 Perspectiva del producto
El sistema será una aplicación informática que podrá desarrollarse como:
- Aplicación de escritorio
- Aplicación web
- Sistema con base de datos centralizada

### 2.2 Funciones principales
El sistema deberá permitir:
- Registrar estudiantes
- Registrar módulos y submódulos
- Registrar aprobación de módulos y submódulos
- Consultar información académica
- Buscar estudiantes por distintos criterios

### 2.3 Usuarios del sistema
- Administrador del sistema
- Personal administrativo
- Docentes (opcional, según permisos)

---

## 3. Requisitos Funcionales

### RF1 – Gestión de Estudiantes
El sistema deberá permitir:
- Crear un nuevo estudiante
- Editar datos del estudiante
- Eliminar estudiante
- Visualizar listado de estudiantes

Datos mínimos del estudiante:
- Nombre y apellido
- DNI o identificación
- Año de ingreso
- Estado académico

### RF2 – Gestión de Módulos y Trayectos Formativos
El sistema deberá permitir gestionar trayectos formativos y asociar un profesor responsable a cada uno.

El sistema deberá permitir:
- Crear trayecto formativo
- Editar trayecto formativo
- Eliminar trayecto formativo
- Asignar profesor responsable
- Asociar módulos a un trayecto formativo

Cada trayecto formativo deberá tener un único profesor a cargo.

### RF2A – Gestión de Profesores
El sistema deberá permitir:
- Registrar profesor
- Editar datos del profesor
- Eliminar profesor
- Asociar profesor a uno o más trayectos formativos

Datos mínimos del profesor:
- Nombre y apellido
- DNI
- Correo electrónico
- Especialidad

### RF3 – Gestión de Módulos
El sistema deberá permitir:
- Crear módulo
- Editar módulo
- Eliminar módulo
- Asociar submódulos a un módulo

### RF3 – Gestión de Submódulos
El sistema deberá permitir:
- Crear submódulo
- Editar submódulo
- Eliminar submódulo
- Asociar submódulo a módulo correspondiente

### RF4 – Registro de Aprobaciones
El sistema deberá permitir:
- Registrar módulo aprobado por estudiante
- Registrar submódulo aprobado por estudiante
- Registrar fecha de aprobación
- Registrar nota obtenida (opcional)

### RF5 – Búsqueda y Consultas
El sistema deberá permitir buscar estudiantes por:
- Año de cursado
- Módulos aprobados
- Submódulos aprobados
- Nombre o DNI

El sistema deberá permitir generar reportes filtrados por:
- Año académico
- Módulo específico
- Estado de aprobación

---

## 4. Requisitos No Funcionales

### RNF1 – Seguridad
- Autenticación mediante Supabase Auth (email y contraseña).
- Gestión de sesiones segura mediante JWT.
- Control de permisos mediante Row Level Security (RLS) de Supabase.
- Protección de datos personales conforme normativa vigente.
- Encriptación de contraseñas gestionada por Supabase.

### RNF2 – Usabilidad
- Interfaz clara e intuitiva
- Formularios simples
- Mensajes de error descriptivos

### RNF3 – Rendimiento
- El tiempo de respuesta en búsquedas no deberá superar los 3 segundos en condiciones normales.

### RNF4 – Integridad de Datos
- No se permitirá duplicación de estudiantes con mismo DNI.
- No se permitirá registrar aprobación de submódulo sin módulo asociado.

### RNF5 – Respaldo
- El sistema deberá permitir realizar copias de seguridad de la base de datos.

---

## 5. Modelo de Datos (Conceptual)

### Entidades principales:

1. Estudiante
   - ID_Estudiante (clave primaria)
   - Nombre
   - Apellido
   - DNI
   - Año_Ingreso

2. Profesor
   - ID_Profesor (clave primaria)
   - Nombre
   - Apellido
   - DNI
   - Email
   - Especialidad

3. Trayecto_Formativo
   - ID_Trayecto (clave primaria)
   - Nombre_Trayecto
   - ID_Profesor (clave foránea)

4. Módulo
   - ID_Modulo (clave primaria)
   - Nombre_Modulo
   - Año
   - ID_Trayecto (clave foránea)

5. Submódulo
   - ID_Submodulo (clave primaria)
   - Nombre_Submodulo
   - ID_Modulo (clave foránea)

6. Aprobaciones
   - ID_Aprobacion
   - ID_Estudiante
   - ID_Modulo (opcional)
   - ID_Submodulo (opcional)
   - Fecha
   - Nota

---

## 6. Restricciones

- El sistema deberá cumplir con la normativa vigente de protección de datos personales.
- La base de datos deberá ser relacional.
- El sistema utilizará Supabase como plataforma backend, la cual incluye base de datos PostgreSQL administrada y servicios integrados de autenticación.
- Base de datos: PostgreSQL provista por Supabase.
- Backend: Supabase (API REST y/o cliente SDK).
- Autenticación: Supabase Auth (email y contraseña inicialmente).

---

## 7. Arquitectura Tecnológica

### 7.1 Plataforma Backend
El sistema utilizará Supabase como Backend as a Service (BaaS), proporcionando:
- Base de datos PostgreSQL.
- API automática REST.
- Sistema de autenticación integrado.
- Políticas de seguridad a nivel de fila (RLS).

### 7.2 Autenticación y Roles
El sistema deberá:
- Permitir registro de usuarios mediante Supabase Auth.
- Permitir inicio de sesión y cierre de sesión.
- Definir roles (Administrador, Administrativo, Docente).
- Restringir acceso a datos según rol utilizando políticas RLS.

### 7.3 Estructura Recomendada en Supabase
Tablas principales:
- estudiantes
- modulos
- submodulos
- aprobaciones
- perfiles (relacionada con tabla auth.users de Supabase)

Relaciones:
- estudiantes.id → aprobaciones.estudiante_id
- modulos.id → submodulos.modulo_id
- submodulos.id → aprobaciones.submodulo_id

---

## 8. Criterios de Aceptación

El sistema será aceptado cuando:
- Permita registrar estudiantes correctamente.
- Permita consultar estudiantes por año de cursado.
- Permita consultar módulos y submódulos aprobados.
- No presente errores críticos en pruebas funcionales.

---

Documento versión 1.0
Fecha: ____________________
Responsable: ____________________

