const axios = require('axios');

// Configuración
const BASE_URL = 'http://localhost:3000';
const TEST_USER = {
  username: 'estudiante_demo',
  password: 'demo1234'
};

async function testListDocuments() {
  try {
    console.log('🔍 Listando documentos...\n');

    // 1. Login para obtener token
    console.log('1. Iniciando sesión...');
    const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, TEST_USER);
    const token = loginResponse.data.token;
    console.log('✅ Login exitoso\n');

    // 2. Obtener documentos del usuario
    console.log('2. Obteniendo documentos del usuario...');
    const documentsResponse = await axios.get(`${BASE_URL}/api/documents?userId=100`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const documents = documentsResponse.data;
    console.log(`✅ Se encontraron ${documents.length} documentos`);
    
    if (documents.length === 0) {
      console.log('❌ No hay documentos');
      return;
    }

    // Mostrar documentos con detalles
    console.log('\n📋 Documentos encontrados:');
    documents.forEach((doc, index) => {
      console.log(`\n   ${index + 1}. Documento:`);
      console.log(`      ID: ${doc.id}`);
      console.log(`      Nombre: ${doc.name}`);
      console.log(`      Tipo: ${doc.type}`);
      console.log(`      Estado: ${doc.status}`);
      console.log(`      Ruta: ${doc.path}`);
      console.log(`      Subido: ${doc.uploadedAt}`);
      console.log(`      Usuario ID: ${doc.userId}`);
    });

    console.log('\n🎉 Listado completado');

  } catch (error) {
    console.error('❌ Error durante la prueba:', error.response?.data || error.message);
    
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Headers:', error.response.headers);
    }
  }
}

// Ejecutar la prueba
testListDocuments(); 