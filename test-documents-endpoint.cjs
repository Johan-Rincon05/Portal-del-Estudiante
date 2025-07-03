// Script para probar el endpoint de documentos
const http = require('http');

// Token JWT válido (del test anterior)
const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTAwLCJ1c2VybmFtZSI6ImVzdHVkaWFudGVfZGVtbyIsInJvbGUiOiJlc3R1ZGlhbnRlIiwiaWF0IjoxNzUxNTU5OTczLCJleHAiOjE3NTE2NDYzNzN9.APYhsJqDebgS4NWCNCHG5fJbKl1K5ONK_eMNIFn6Sdk';

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/documents?userId=100', // URL para obtener documentos del usuario 100
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  }
};

console.log('🔍 Probando endpoint de documentos...');
console.log('URL: /api/documents?userId=100');
console.log('Usuario: estudiante_demo (ID: 100)\n');

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
        console.log('✅ Documentos obtenidos exitosamente!');
        console.log('Cantidad de documentos:', Array.isArray(response) ? response.length : 'No es un array');
        
        if (Array.isArray(response)) {
          response.forEach((doc, index) => {
            console.log(`Documento ${index + 1}:`, {
              id: doc.id,
              name: doc.name,
              type: doc.type,
              status: doc.status
            });
          });
        }
      } else {
        console.log('❌ Error al obtener documentos:', response.error || response.message);
      }
    } catch (e) {
      console.log('❌ Error parseando respuesta:', data);
      console.log('Error:', e.message);
    }
  });
});

req.on('error', (e) => {
  console.error('❌ Error de conexión:', e.message);
});

req.end(); 