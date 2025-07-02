/**
 * Script de prueba para verificar la subida de soporte de pago con observaciones
 * Este script ayuda a diagnosticar si el endpoint funciona correctamente
 */

const BASE_URL = 'http://localhost:3000';
const fs = require('fs');
const path = require('path');

async function testUploadSupport() {
  console.log('=== PRUEBA DE SUBIDA DE SOPORTE ===\n');

  // Prueba 1: Login para obtener token
  console.log('1. Iniciando sesión...');
  try {
    const loginResponse = await fetch(`${BASE_URL}/api/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: 'estudiante_demo',
        password: 'demo1234'
      })
    });
    
    console.log(`   Status: ${loginResponse.status}`);
    const loginData = await loginResponse.json();
    console.log(`   Response:`, loginData);
    
    if (!loginResponse.ok) {
      throw new Error(`Login falló: ${loginData.error || 'Error desconocido'}`);
    }
    
    const token = loginData.token;
    console.log(`   Token obtenido: ${token.substring(0, 20)}...`);
    
    // Prueba 2: Obtener cuotas del estudiante
    console.log('\n2. Obteniendo cuotas del estudiante...');
    const installmentsResponse = await fetch(`${BASE_URL}/api/payments/installments/me`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log(`   Status: ${installmentsResponse.status}`);
    const installmentsData = await installmentsResponse.json();
    console.log(`   Cuotas encontradas: ${installmentsData.length}`);
    
    if (!installmentsResponse.ok) {
      throw new Error(`Error al obtener cuotas: ${installmentsData.error || 'Error desconocido'}`);
    }
    
    // Buscar una cuota pendiente sin soporte
    const pendingInstallment = installmentsData.find(installment => 
      installment.status === 'pendiente' && !installment.support
    );
    
    if (!pendingInstallment) {
      console.log('   No hay cuotas pendientes sin soporte para probar');
      return;
    }
    
    console.log(`   Cuota seleccionada para prueba: ID ${pendingInstallment.id}, Cuota #${pendingInstallment.installmentNumber}`);
    
    // Prueba 3: Crear un archivo de prueba
    console.log('\n3. Creando archivo de prueba...');
    const testFilePath = path.join(__dirname, 'test-support.txt');
    const testContent = 'Este es un archivo de prueba para el soporte de pago.';
    fs.writeFileSync(testFilePath, testContent);
    console.log(`   Archivo creado: ${testFilePath}`);
    
    // Prueba 4: Subir soporte con observaciones
    console.log('\n4. Subiendo soporte con observaciones...');
    const formData = new FormData();
    formData.append('support', fs.createReadStream(testFilePath));
    formData.append('observations', 'Esta es una observación de prueba para verificar que funciona correctamente.');
    
    const uploadResponse = await fetch(`${BASE_URL}/api/payments/installments/${pendingInstallment.id}/support`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });
    
    console.log(`   Status: ${uploadResponse.status}`);
    const uploadData = await uploadResponse.json();
    console.log(`   Response:`, uploadData);
    
    if (!uploadResponse.ok) {
      throw new Error(`Error al subir soporte: ${uploadData.error || 'Error desconocido'}`);
    }
    
    console.log('   ✅ Soporte subido exitosamente');
    
    // Prueba 5: Verificar que la cuota se actualizó
    console.log('\n5. Verificando que la cuota se actualizó...');
    const verifyResponse = await fetch(`${BASE_URL}/api/payments/installments/me`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    const verifyData = await verifyResponse.json();
    const updatedInstallment = verifyData.find(installment => installment.id === pendingInstallment.id);
    
    if (updatedInstallment && updatedInstallment.support) {
      console.log(`   ✅ Cuota actualizada correctamente`);
      console.log(`   Soporte: ${updatedInstallment.support}`);
    } else {
      console.log(`   ❌ La cuota no se actualizó correctamente`);
    }
    
    // Limpiar archivo de prueba
    fs.unlinkSync(testFilePath);
    console.log('\n   Archivo de prueba eliminado');
    
  } catch (error) {
    console.error('❌ Error en la prueba:', error.message);
  }
}

// Ejecutar la prueba
testUploadSupport(); 