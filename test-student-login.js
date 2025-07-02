/**
 * Script para probar el login del usuario estudiante y verificar las rutas de pagos
 */

const BASE_URL = 'http://localhost:3000';

async function testStudentLogin() {
  console.log('=== PRUEBA DE LOGIN Y PAGOS PARA ESTUDIANTE ===\n');

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
      
      const headers = {
        'Authorization': `Bearer ${loginData.token}`,
        'Content-Type': 'application/json'
      };

      // Paso 2: Probar ruta de pagos
      console.log('\n2. Probando /api/payments/me...');
      const paymentsResponse = await fetch(`${BASE_URL}/api/payments/me`, { headers });
      console.log(`   Payments Status: ${paymentsResponse.status}`);
      const paymentsData = await paymentsResponse.json();
      console.log(`   Payments Response:`, paymentsData);

      // Paso 3: Probar ruta de cuotas
      console.log('\n3. Probando /api/payments/installments/me...');
      const installmentsResponse = await fetch(`${BASE_URL}/api/payments/installments/me`, { headers });
      console.log(`   Installments Status: ${installmentsResponse.status}`);
      const installmentsData = await installmentsResponse.json();
      console.log(`   Installments Response:`, installmentsData);

      // Paso 4: Probar ruta de resumen
      console.log('\n4. Probando /api/payments/summary...');
      const summaryResponse = await fetch(`${BASE_URL}/api/payments/summary`, { headers });
      console.log(`   Summary Status: ${summaryResponse.status}`);
      const summaryData = await summaryResponse.json();
      console.log(`   Summary Response:`, summaryData);

      // Paso 5: Verificar datos del usuario
      console.log('\n5. Verificando datos del usuario...');
      const userResponse = await fetch(`${BASE_URL}/api/user`, { headers });
      console.log(`   User Status: ${userResponse.status}`);
      const userData = await userResponse.json();
      console.log(`   User Response:`, userData);

      console.log('\n=== RESUMEN ===');
      console.log('✅ Login: Funcionando');
      console.log(`✅ Pagos: ${paymentsResponse.status === 200 ? 'Funcionando' : 'Error'}`);
      console.log(`✅ Cuotas: ${installmentsResponse.status === 200 ? 'Funcionando' : 'Error'}`);
      console.log(`✅ Resumen: ${summaryResponse.status === 200 ? 'Funcionando' : 'Error'}`);
      console.log(`✅ Usuario: ${userResponse.status === 200 ? 'Funcionando' : 'Error'}`);

    } else {
      console.log('\n❌ Error: No se obtuvo token del login');
    }
  } catch (error) {
    console.log(`\n❌ Error en la prueba:`, error.message);
  }
}

// Ejecutar las pruebas
testStudentLogin().catch(console.error); 