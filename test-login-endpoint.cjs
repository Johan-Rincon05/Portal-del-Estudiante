// Script para probar el endpoint de login con la URL correcta
const http = require('http');

const postData = JSON.stringify({
  username: 'estudiante_demo',
  password: 'demo1234'
});

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/auth/login', // URL correcta
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData)
  }
};

console.log('🔍 Probando login con URL correcta: /api/auth/login');
console.log('Usuario: estudiante_demo');
console.log('Contraseña: demo1234\n');

const req = http.request(options, (res) => {
  console.log(`📊 Status: ${res.statusCode}`);
  console.log(`📊 Headers: ${JSON.stringify(res.headers)}`);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    try {
      const response = JSON.parse(data);
      console.log('📊 Respuesta completa:', JSON.stringify(response, null, 2));
      
      if (res.statusCode === 200) {
        console.log('✅ Login exitoso!');
        console.log('Token generado:', response.token ? 'SÍ' : 'NO');
        console.log('Usuario:', response.username);
        console.log('Rol:', response.role);
      } else {
        console.log('❌ Error en login:', response.error);
      }
    } catch (e) {
      console.log('❌ Error parseando respuesta:', data);
    }
  });
});

req.on('error', (e) => {
  console.error('❌ Error de conexión:', e.message);
});

req.write(postData);
req.end(); 