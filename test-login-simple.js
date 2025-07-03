// Script simple para probar el endpoint de login
const http = require('http');

const postData = JSON.stringify({
  username: 'estudiante_demo',
  password: 'demo1234'
});

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/login',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData)
  }
};

console.log('🔍 Probando login con estudiante_demo / demo1234...');

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
      console.log('📊 Respuesta:', JSON.stringify(response, null, 2));
      
      if (res.statusCode === 200) {
        console.log('✅ Login exitoso!');
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