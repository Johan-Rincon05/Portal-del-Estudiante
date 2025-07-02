const fetch = require('node-fetch');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

async function testUploadDocument() {
  try {
    // Token de prueba (reemplazar con un token válido)
    const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTAwLCJ1c2VybmFtZSI6ImVzdHVkaWFudGVfZGVtbyIsInJvbGUiOiJlc3R1ZGlhbnRlIiwiaWF0IjoxNzUxMzg5ODY1LCJleHAiOjE3NTE0NzYyNjV9.bgMhKI1kRyppLB5WTuuSPirnxON9L3-xJCuoKhly_2k';
    
    // Crear un archivo de prueba simple
    const testFilePath = path.join(__dirname, 'test-document.txt');
    fs.writeFileSync(testFilePath, 'Este es un documento de prueba para verificar la subida.');
    
    // Crear FormData
    const formData = new FormData();
    formData.append('file', fs.createReadStream(testFilePath));
    formData.append('type', 'formulario');
    formData.append('observations', 'Documento de prueba subido desde script');
    
    console.log('Probando subida de documento...');
    console.log('Archivo:', testFilePath);
    console.log('Tipo:', 'formulario');
    
    const response = await fetch('http://localhost:3000/api/documents', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        // No establecer Content-Type, dejar que FormData lo configure
      },
      body: formData
    });
    
    console.log('Status:', response.status);
    console.log('Headers:', Object.fromEntries(response.headers.entries()));
    
    if (response.ok) {
      const result = await response.json();
      console.log('✅ Documento subido exitosamente:', result);
    } else {
      const error = await response.text();
      console.log('❌ Error al subir documento:', error);
    }
    
    // Limpiar archivo de prueba
    fs.unlinkSync(testFilePath);
    
  } catch (error) {
    console.error('❌ Error en la prueba:', error.message);
  }
}

testUploadDocument(); 