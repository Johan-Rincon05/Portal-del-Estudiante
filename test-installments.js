/**
 * Script de prueba para verificar las cuotas del estudiante
 * Este script ayuda a diagnosticar si las cuotas se están cargando correctamente
 */

const BASE_URL = 'http://localhost:3000';

async function testInstallments() {
  console.log('=== PRUEBA DE CUOTAS ===\n');

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
        password: 'password123'
      })
    });
    
    console.log(`   Status: ${loginResponse.status}`);
    const loginData = await loginResponse.json();
    console.log(`   Response:`, loginData);
    
    if (loginData.token) {
      console.log(`   Token obtenido: ${loginData.token.substring(0, 20)}...`);
      
      // Prueba 2: Obtener cuotas
      console.log('\n2. Obteniendo cuotas...');
      const installmentsResponse = await fetch(`${BASE_URL}/api/payments/installments/me`, {
        headers: {
          'Authorization': `Bearer ${loginData.token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log(`   Status: ${installmentsResponse.status}`);
      const installmentsData = await installmentsResponse.json();
      console.log(`   Response:`, installmentsData);
      
      // Prueba 3: Analizar cuotas pendientes
      console.log('\n3. Analizando cuotas pendientes...');
      if (Array.isArray(installmentsData)) {
        const pendingInstallments = installmentsData.filter(installment => 
          installment.status === 'pendiente' && !installment.support
        );
        
        console.log(`   Total cuotas: ${installmentsData.length}`);
        console.log(`   Cuotas pendientes sin soporte: ${pendingInstallments.length}`);
        
        pendingInstallments.forEach(installment => {
          console.log(`   - Cuota ${installment.installmentNumber}: ${installment.status}, soporte: ${installment.support || 'No disponible'}`);
        });
      }
      
    } else {
      console.log('   No se obtuvo token del login');
    }
    
  } catch (error) {
    console.log(`   Error:`, error.message);
  }
}

// Ejecutar las pruebas
testInstallments().catch(console.error); 