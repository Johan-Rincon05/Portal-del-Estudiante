const axios = require('axios');

// Configuración
const BASE_URL = 'http://localhost:3000';
const TEST_USER = {
  username: 'estudiante_demo',
  password: 'demo1234'
};

async function testDeleteDocument() {
  try {
    console.log('🔍 Iniciando prueba de eliminación de documentos...\n');

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
      console.log('❌ No hay documentos para eliminar');
      return;
    }

    // Mostrar documentos disponibles
    documents.forEach((doc, index) => {
      console.log(`   ${index + 1}. ${doc.name} (ID: ${doc.id})`);
    });

    // 3. Eliminar el primer documento
    const documentToDelete = documents[0];
    console.log(`\n3. Eliminando documento: ${documentToDelete.name} (ID: ${documentToDelete.id})`);
    
    const deleteResponse = await axios.delete(`${BASE_URL}/api/documents/${documentToDelete.id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('✅ Documento eliminado exitosamente');
    console.log('Respuesta del servidor:', deleteResponse.data);

    // 4. Verificar que el documento ya no existe
    console.log('\n4. Verificando que el documento fue eliminado...');
    const documentsAfterDelete = await axios.get(`${BASE_URL}/api/documents?userId=100`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    const remainingDocuments = documentsAfterDelete.data;
    console.log(`✅ Quedan ${remainingDocuments.length} documentos`);
    
    const documentStillExists = remainingDocuments.find(doc => doc.id === documentToDelete.id);
    if (documentStillExists) {
      console.log('❌ ERROR: El documento aún existe en la base de datos');
    } else {
      console.log('✅ El documento fue eliminado correctamente de la base de datos');
    }

    console.log('\n🎉 Prueba completada exitosamente');

  } catch (error) {
    console.error('❌ Error durante la prueba:', error.response?.data || error.message);
    
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Headers:', error.response.headers);
    }
  }
}

// Ejecutar la prueba
testDeleteDocument(); 