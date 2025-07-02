/**
 * Script para generar hash de contraseña usando bcrypt
 */

import bcrypt from 'bcrypt';

async function generateHash() {
  const password = 'demo1234';
  const hash = await bcrypt.hash(password, 10);
  
  console.log('=== HASH GENERADO ===');
  console.log('Contraseña:', password);
  console.log('Hash:', hash);
  console.log('=====================');
  
  return hash;
}

generateHash().catch(console.error); 