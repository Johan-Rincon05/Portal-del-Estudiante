/**
 * Script para ejecutar la migración inicial consolidada
 * Este script crea todas las tablas y estructuras necesarias para el Portal del Estudiante
 */

import { readFileSync } from 'fs';
import { join } from 'path';
import postgres from 'postgres';

// Configuración de la base de datos
const connectionString = process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/portal_estudiante';
const client = postgres(connectionString);

async function runMigration() {
  try {
    console.log('🔄 Iniciando migración inicial consolidada...');
    
    // Leer el archivo de migración consolidada
    const migrationPath = join(process.cwd(), 'migrations', '0000_initial_schema.sql');
    console.log('📄 Ruta del archivo de migración:', migrationPath);
    
    const migrationSQL = readFileSync(migrationPath, 'utf8');
    
    console.log('📄 Ejecutando migración consolidada...');
    
    // Ejecutar la migración
    await client.unsafe(migrationSQL);
    
    console.log('✅ Migración consolidada completada exitosamente');
    console.log('📋 Estructura creada:');
    console.log('   - Todas las tablas del sistema');
    console.log('   - Enums para validación de datos');
    console.log('   - Índices para rendimiento');
    console.log('   - Roles por defecto');
    console.log('   - Relaciones entre tablas');
    
  } catch (error) {
    console.error('❌ Error durante la migración:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

// Ejecutar la migración
runMigration(); 