const bcrypt = require('bcrypt');

// Contraseñas a probar
const passwords = [
  'password123',
  '123456',
  'demo123',
  'estudiante123',
  'admin123',
  'test123'
];

// Hash almacenado en la base de datos
const storedHash = '$2b$10$gJwprrMRLuDZhuxEcFp2k.Dncakvgfc/ZKcxKo8XLEgm72YBtsH2K';

async function testPasswords() {
  console.log('🔍 Probando contraseñas...\n');
  
  for (const password of passwords) {
    const isValid = await bcrypt.compare(password, storedHash);
    console.log(`Contraseña "${password}": ${isValid ? '✅ CORRECTA' : '❌ Incorrecta'}`);
    
    if (isValid) {
      console.log(`\n🎉 La contraseña correcta es: "${password}"`);
      break;
    }
  }
}

testPasswords(); 