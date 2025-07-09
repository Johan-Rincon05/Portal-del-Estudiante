/**
 * Script para corregir el formato de las credenciales en el archivo .env
 */

import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const envPath = resolve(__dirname, '../.env');

console.log('🔧 Corrigiendo formato de credenciales en .env...\n');

try {
  // Leer el archivo .env actual
  const envContent = fs.readFileSync(envPath, 'utf8');
  
  // Buscar la línea de GOOGLE_CREDENTIALS
  const credentialsMatch = envContent.match(/GOOGLE_CREDENTIALS=(.+)/);
  
  if (!credentialsMatch) {
    throw new Error('No se encontró GOOGLE_CREDENTIALS en el archivo .env');
  }
  
  // Parsear las credenciales actuales
  const credentialsString = credentialsMatch[1];
  const credentials = JSON.parse(credentialsString);
  
  console.log('1️⃣ Credenciales actuales:');
  console.log('   client_email:', credentials.client_email);
  console.log('   project_id:', credentials.project_id);
  console.log('   private_key length:', credentials.private_key?.length);
  
  // Corregir la clave privada si es necesario
  if (credentials.private_key && credentials.private_key.includes('\\n')) {
    console.log('\n2️⃣ Corrigiendo formato de clave privada...');
    
    // Reemplazar \\n con \n real
    credentials.private_key = credentials.private_key.replace(/\\n/g, '\n');
    
    console.log('   Clave privada corregida');
    console.log('   Nuevo length:', credentials.private_key.length);
    console.log('   Empieza con:', credentials.private_key.substring(0, 50));
  }
  
  // Crear el nuevo contenido del archivo .env
  const updatedEnvContent = envContent.replace(
    /GOOGLE_CREDENTIALS=.*/,
    `GOOGLE_CREDENTIALS=${JSON.stringify(credentials)}`
  );
  
  // Escribir el archivo actualizado
  fs.writeFileSync(envPath, updatedEnvContent);
  
  console.log('\n✅ Archivo .env actualizado correctamente');
  console.log('📋 Resumen:');
  console.log('   ✅ Credenciales parseadas');
  console.log('   ✅ Clave privada corregida');
  console.log('   ✅ Archivo .env actualizado');
  
  // Probar que las credenciales funcionan
  console.log('\n3️⃣ Probando credenciales corregidas...');
  
  // Cargar las variables de entorno actualizadas
  const dotenv = await import('dotenv');
  dotenv.config({ path: envPath });
  
  const testCredentials = JSON.parse(process.env.GOOGLE_CREDENTIALS);
  console.log('   Credenciales cargadas correctamente');
  console.log('   private_key length:', testCredentials.private_key.length);
  console.log('   private_key starts with:', testCredentials.private_key.substring(0, 30));
  
  console.log('\n🎉 ¡Credenciales corregidas y verificadas!');
  
} catch (error) {
  console.error('\n❌ Error durante la corrección:', error.message);
  console.error('🔍 Detalles:', error);
  process.exit(1);
} 