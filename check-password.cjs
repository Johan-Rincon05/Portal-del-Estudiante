// Script para verificar qué contraseña funciona
const bcrypt = require('bcrypt');

// Contraseñas a probar
const passwords = ['123456', 'demo1234', 'password', 'admin', 'test'];

// Hash que está en la base de datos (del archivo create-student-user.sql)
const storedHash = '$2b$10$gJwprrMRLuDZhuxEcFp2k.Dncakvgfc/ZKcxKo8XLEgm72YBtsH2K';

console.log('🔍 Verificando contraseñas para estudiante_demo...\n');

async function checkPasswords() {
  for (const password of passwords) {
    try {
      const isMatch = await bcrypt.compare(password, storedHash);
      console.log(`Contraseña "${password}": ${isMatch ? '✅ CORRECTA' : '❌ Incorrecta'}`);
    } catch (error) {
      console.log(`Contraseña "${password}": ❌ Error - ${error.message}`);
    }
  }
  
  console.log('\n📋 Resumen:');
  console.log('- Si ninguna contraseña funciona, necesitamos actualizar la base de datos');
  console.log('- Si alguna funciona, esa es la contraseña correcta');
}

checkPasswords(); 