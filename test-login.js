// Script para probar el endpoint de login
const fetch = require('node-fetch');

async function testLogin() {
  try {
    console.log('🔍 Probando endpoint de login...');
    
    // Probar con estudiante_demo y demo1234
    const response = await fetch('http://localhost:3000/api/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: 'estudiante_demo',
        password: 'demo1234'
      })
    });

    const data = await response.json();
    
    console.log('📊 Respuesta del servidor:');
    console.log('Status:', response.status);
    console.log('Data:', JSON.stringify(data, null, 2));
    
    if (response.ok) {
      console.log('✅ Login exitoso!');
      console.log('Token:', data.token ? 'Generado correctamente' : 'No generado');
    } else {
      console.log('❌ Error en login:', data.error);
    }
    
  } catch (error) {
    console.error('❌ Error de conexión:', error.message);
  }
}

// Ejecutar la prueba
testLogin(); 