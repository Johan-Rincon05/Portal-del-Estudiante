/**
 * Script para ejecutar la migración de Google Drive
 * Este script agrega los campos necesarios para Google Drive a la tabla documents
 */

import { readFileSync } from 'fs';
import { join } from 'path';
import postgres from 'postgres';

// Configuración de la base de datos
const connectionString = process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/portal_estudiante';
const client = postgres(connectionString);

async function runMigration() {
  try {
    console.log('🔄 Iniciando migración de Google Drive...');
    
    // Leer el archivo de migración (desde la raíz del proyecto)
    const migrationPath = join(process.cwd(), 'migrations', '0010_add_google_drive_fields.sql');
    console.log('📄 Ruta del archivo de migración:', migrationPath);
    
    const migrationSQL = readFileSync(migrationPath, 'utf8');
    
    console.log('📄 Ejecutando migración...');
    
    // Ejecutar la migración
    await client.unsafe(migrationSQL);
    
    console.log('✅ Migración completada exitosamente');
    console.log('📋 Campos agregados:');
    console.log('   - drive_file_id (TEXT)');
    console.log('   - drive_web_view_link (TEXT)');
    console.log('   - Índice en drive_file_id');
    
  } catch (error) {
    console.error('❌ Error durante la migración:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

// Ejecutar la migración
runMigration(); 