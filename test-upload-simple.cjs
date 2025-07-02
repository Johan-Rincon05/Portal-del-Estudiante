/**
 * Script de prueba simple para verificar la subida de soporte
 */

const BASE_URL = 'http://localhost:3000';
const fs = require('fs');
const path = require('path');

async function testUploadSimple() {
  console.log('=== PRUEBA SIMPLE DE SUBIDA ===\n');

  try {
    // 1. Login
    console.log('1. Iniciando sesión...');
    const loginResponse = await fetch(`${BASE_URL}/api/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'estudiante_demo',
        password: 'demo1234'
      })
    });
    
    const loginData = await loginResponse.json();
    if (!loginData.token) {
      throw new Error('No se obtuvo token');
    }
    console.log('✅ Login exitoso');
    
    // 2. Crear archivo de prueba
    const testFile = path.join(__dirname, 'test-file.txt');
    fs.writeFileSync(testFile, 'Archivo de prueba para soporte de pago');
    console.log('✅ Archivo de prueba creado');
    
    // 3. Subir soporte
    console.log('\n2. Subiendo soporte...');
    const formData = new FormData();
    formData.append('support', fs.createReadStream(testFile));
    formData.append('observations', 'Observación de prueba desde script');
    
    const uploadResponse = await fetch(`${BASE_URL}/api/payments/installments/103/support`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${loginData.token}`
      },
      body: formData
    });
    
    console.log(`Status: ${uploadResponse.status}`);
    console.log(`Headers:`, Object.fromEntries(uploadResponse.headers.entries()));
    
    // Verificar si la respuesta es JSON
    const contentType = uploadResponse.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      const uploadData = await uploadResponse.json();
      console.log('✅ Respuesta JSON:', uploadData);
    } else {
      const textResponse = await uploadResponse.text();
      console.log('❌ Respuesta no es JSON:', textResponse.substring(0, 200));
    }
    
    // 4. Limpiar
    fs.unlinkSync(testFile);
    console.log('✅ Archivo de prueba eliminado');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testUploadSimple(); 