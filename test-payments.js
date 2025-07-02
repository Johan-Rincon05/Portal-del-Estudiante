/**
 * Script de prueba para verificar las rutas de pagos
 * Este script prueba las rutas de pagos sin autenticación para identificar problemas
 */



const BASE_URL = 'http://localhost:3000';

async function testPaymentsRoutes() {
  console.log('=== PRUEBA DE RUTAS DE PAGOS ===\n');

  // Prueba 1: Ruta de pagos sin token
  console.log('1. Probando /api/payments/me sin token...');
  try {
    const response = await fetch(`${BASE_URL}/api/payments/me`);
    console.log(`   Status: ${response.status}`);
    const data = await response.json();
    console.log(`   Response:`, data);
  } catch (error) {
    console.log(`   Error:`, error.message);
  }

  console.log('\n2. Probando /api/payments/installments/me sin token...');
  try {
    const response = await fetch(`${BASE_URL}/api/payments/installments/me`);
    console.log(`   Status: ${response.status}`);
    const data = await response.json();
    console.log(`   Response:`, data);
  } catch (error) {
    console.log(`   Error:`, error.message);
  }

  console.log('\n3. Probando /api/payments/summary sin token...');
  try {
    const response = await fetch(`${BASE_URL}/api/payments/summary`);
    console.log(`   Status: ${response.status}`);
    const data = await response.json();
    console.log(`   Response:`, data);
  } catch (error) {
    console.log(`   Error:`, error.message);
  }

  // Prueba 4: Login para obtener token
  console.log('\n4. Probando login para obtener token...');
  try {
    const loginResponse = await fetch(`${BASE_URL}/api/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: 'estudiante1',
        password: 'password123'
      })
    });
    
    console.log(`   Login Status: ${loginResponse.status}`);
    const loginData = await loginResponse.json();
    console.log(`   Login Response:`, loginData);

    if (loginData.token) {
      console.log('\n5. Probando rutas de pagos con token...');
      
      const headers = {
        'Authorization': `Bearer ${loginData.token}`,
        'Content-Type': 'application/json'
      };

      // Probar pagos con token
      const paymentsResponse = await fetch(`${BASE_URL}/api/payments/me`, { headers });
      console.log(`   Payments Status: ${paymentsResponse.status}`);
      const paymentsData = await paymentsResponse.json();
      console.log(`   Payments Response:`, paymentsData);

      // Probar cuotas con token
      const installmentsResponse = await fetch(`${BASE_URL}/api/payments/installments/me`, { headers });
      console.log(`   Installments Status: ${installmentsResponse.status}`);
      const installmentsData = await installmentsResponse.json();
      console.log(`   Installments Response:`, installmentsData);

      // Probar resumen con token
      const summaryResponse = await fetch(`${BASE_URL}/api/payments/summary`, { headers });
      console.log(`   Summary Status: ${summaryResponse.status}`);
      const summaryData = await summaryResponse.json();
      console.log(`   Summary Response:`, summaryData);
    }
  } catch (error) {
    console.log(`   Error:`, error.message);
  }
}

// Ejecutar las pruebas
testPaymentsRoutes().catch(console.error); 