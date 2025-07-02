/**
 * Script de prueba para verificar el estado del token y las peticiones de autenticación
 * Este script ayuda a diagnosticar problemas con la autenticación
 */

const BASE_URL = 'http://localhost:3000';

async function testTokenDebug() {
  console.log('=== PRUEBA DE DEBUG DE TOKEN ===\n');

  // Prueba 1: Verificar si hay token en localStorage
  console.log('1. Verificando token en localStorage...');
  try {
    // Simular acceso a localStorage
    const token = localStorage.getItem('token');
    console.log(`   Token en localStorage: ${token ? token.substring(0, 20) + '...' : 'No encontrado'}`);
  } catch (error) {
    console.log(`   Error al acceder a localStorage: ${error.message}`);
  }

  // Prueba 2: Login para obtener token
  console.log('\n2. Probando login para obtener token...');
  try {
    const loginResponse = await fetch(`${BASE_URL}/api/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: 'estudiante1@test.com',
        password: 'password123'
      })
    });
    
    console.log(`   Status: ${loginResponse.status}`);
    const loginData = await loginResponse.json();
    console.log(`   Response:`, loginData);
    
    if (loginData.token) {
      console.log(`   Token obtenido: ${loginData.token.substring(0, 20)}...`);
      
      // Prueba 3: Verificar token con /api/user
      console.log('\n3. Probando /api/user con token...');
      const userResponse = await fetch(`${BASE_URL}/api/user`, {
        headers: {
          'Authorization': `Bearer ${loginData.token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log(`   Status: ${userResponse.status}`);
      const userData = await userResponse.json();
      console.log(`   Response:`, userData);
      
      // Prueba 4: Verificar rutas de pagos con token
      console.log('\n4. Probando rutas de pagos con token...');
      
      const paymentsResponse = await fetch(`${BASE_URL}/api/payments/me`, {
        headers: {
          'Authorization': `Bearer ${loginData.token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log(`   /api/payments/me - Status: ${paymentsResponse.status}`);
      const paymentsData = await paymentsResponse.json();
      console.log(`   Response:`, paymentsData);
      
      const installmentsResponse = await fetch(`${BASE_URL}/api/payments/installments/me`, {
        headers: {
          'Authorization': `Bearer ${loginData.token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log(`   /api/payments/installments/me - Status: ${installmentsResponse.status}`);
      const installmentsData = await installmentsResponse.json();
      console.log(`   Response:`, installmentsData);
      
      const summaryResponse = await fetch(`${BASE_URL}/api/payments/summary`, {
        headers: {
          'Authorization': `Bearer ${loginData.token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log(`   /api/payments/summary - Status: ${summaryResponse.status}`);
      const summaryData = await summaryResponse.json();
      console.log(`   Response:`, summaryData);
      
    } else {
      console.log('   No se obtuvo token del login');
    }
    
  } catch (error) {
    console.log(`   Error:`, error.message);
  }

  // Prueba 5: Verificar rutas sin token
  console.log('\n5. Probando rutas sin token...');
  try {
    const response = await fetch(`${BASE_URL}/api/payments/me`);
    console.log(`   Status: ${response.status}`);
    const data = await response.json();
    console.log(`   Response:`, data);
  } catch (error) {
    console.log(`   Error:`, error.message);
  }
}

// Ejecutar las pruebas
testTokenDebug().catch(console.error); 