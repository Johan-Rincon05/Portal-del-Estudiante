const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Configuración
const BASE_URL = 'http://localhost:3000';
const TEST_USER = {
  username: 'estudiante_demo',
  password: 'demo1234'
};

async function testUploadAndDelete() {
  try {
    console.log('🔍 Iniciando prueba de subida y eliminación...\n');

    // 1. Login para obtener token
    console.log('1. Iniciando sesión...');
    const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, TEST_USER);
    const token = loginResponse.data.token;
    console.log('✅ Login exitoso\n');

    // 2. Crear un archivo de prueba
    console.log('2. Creando archivo de prueba...');
    const testFileName = 'test-document.txt';
    const testFilePath = path.join(__dirname, testFileName);
    const testContent = 'Este es un documento de prueba para testing.';
    fs.writeFileSync(testFilePath, testContent);
    console.log('✅ Archivo de prueba creado\n');

    // 3. Subir el documento
    console.log('3. Subiendo documento...');
    const formData = new FormData();
    const fileBuffer = fs.readFileSync(testFilePath);
    const fileBlob = new Blob([fileBuffer], { type: 'text/plain' });
    formData.append('file', fileBlob, testFileName);
    formData.append('type', 'formulario');
    formData.append('userId', '100');

    const uploadResponse = await axios.post(`${BASE_URL}/api/documents`, formData, {
      headers: { 
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data'
      }
    });
    
    const uploadedDocument = uploadResponse.data;
    console.log('✅ Documento subido exitosamente');
    console.log('   ID:', uploadedDocument.id);
    console.log('   Nombre:', uploadedDocument.name);
    console.log('   Tipo:', uploadedDocument.type);

    // 4. Verificar que el documento existe
    console.log('\n4. Verificando que el documento existe...');
    const documentsResponse = await axios.get(`${BASE_URL}/api/documents?userId=100`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const documents = documentsResponse.data;
    console.log(`✅ Se encontraron ${documents.length} documentos`);

    // 5. Eliminar el documento
    console.log('\n5. Eliminando documento...');
    const deleteResponse = await axios.delete(`${BASE_URL}/api/documents/${uploadedDocument.id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('✅ Documento eliminado exitosamente');
    console.log('Respuesta del servidor:', deleteResponse.data);

    // 6. Verificar que el documento fue eliminado
    console.log('\n6. Verificando que el documento fue eliminado...');
    const documentsAfterDelete = await axios.get(`${BASE_URL}/api/documents?userId=100`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    const remainingDocuments = documentsAfterDelete.data;
    console.log(`✅ Quedan ${remainingDocuments.length} documentos`);
    
    const documentStillExists = remainingDocuments.find(doc => doc.id === uploadedDocument.id);
    if (documentStillExists) {
      console.log('❌ ERROR: El documento aún existe en la base de datos');
    } else {
      console.log('✅ El documento fue eliminado correctamente de la base de datos');
    }

    // 7. Limpiar archivo de prueba
    console.log('\n7. Limpiando archivo de prueba...');
    if (fs.existsSync(testFilePath)) {
      fs.unlinkSync(testFilePath);
      console.log('✅ Archivo de prueba eliminado');
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
testUploadAndDelete(); 