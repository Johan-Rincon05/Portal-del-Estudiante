/**
 * Script para probar las rutas de pagos simulando el comportamiento del frontend
 */

const BASE_URL = 'http://localhost:3000';

async function testFrontendPayments() {
  console.log('=== PRUEBA FRONTEND PAGOS ===\n');

  // Paso 1: Login del estudiante
  console.log('1. Iniciando sesión con estudiante_demo...');
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
    
    console.log(`   Login Status: ${loginResponse.status}`);
    const loginData = await loginResponse.json();
    console.log(`   Login Response:`, loginData);

    if (loginData.token) {
      console.log('\n✅ Login exitoso! Token obtenido.');
      
      // Simular exactamente lo que hace el frontend
      const headers = {
        'Authorization': `Bearer ${loginData.token}`,
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      };

      console.log('\n2. Probando /api/payments/me (simulando frontend)...');
      const paymentsResponse = await fetch(`${BASE_URL}/api/payments/me`, { 
        method: 'GET',
        headers,
        credentials: 'include',
        mode: 'cors'
      });
      console.log(`   Payments Status: ${paymentsResponse.status}`);
      const paymentsData = await paymentsResponse.json();
      console.log(`   Payments Response:`, paymentsData);

      console.log('\n3. Probando /api/payments/installments/me (simulando frontend)...');
      const installmentsResponse = await fetch(`${BASE_URL}/api/payments/installments/me`, { 
        method: 'GET',
        headers,
        credentials: 'include',
        mode: 'cors'
      });
      console.log(`   Installments Status: ${installmentsResponse.status}`);
      const installmentsData = await installmentsResponse.json();
      console.log(`   Installments Response:`, installmentsData);

      console.log('\n4. Probando /api/payments/summary (simulando frontend)...');
      const summaryResponse = await fetch(`${BASE_URL}/api/payments/summary`, { 
        method: 'GET',
        headers,
        credentials: 'include',
        mode: 'cors'
      });
      console.log(`   Summary Status: ${summaryResponse.status}`);
      const summaryData = await summaryResponse.json();
      console.log(`   Summary Response:`, summaryData);

      console.log('\n=== RESUMEN FRONTEND ===');
      console.log('✅ Login: Funcionando');
      console.log(`✅ Pagos: ${paymentsResponse.status === 200 ? 'Funcionando' : 'Error'}`);
      console.log(`✅ Cuotas: ${installmentsResponse.status === 200 ? 'Funcionando' : 'Error'}`);
      console.log(`✅ Resumen: ${summaryResponse.status === 200 ? 'Funcionando' : 'Error'}`);

    } else {
      console.log('\n❌ Error: No se obtuvo token del login');
    }
  } catch (error) {
    console.log(`\n❌ Error en la prueba:`, error.message);
  }
}

// Ejecutar las pruebas
testFrontendPayments().catch(console.error); 