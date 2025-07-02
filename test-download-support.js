import fetch from 'node-fetch';

async function testDownloadSupport() {
  try {
    // Token de prueba (reemplazar con un token válido)
    const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTAwLCJ1c2VybmFtZSI6ImVzdHVkaWFudGVfZGVtbyIsInJvbGUiOiJlc3R1ZGlhbnRlIiwiaWF0IjoxNzUxMzg5ODY1LCJleHAiOjE3NTE0NzYyNjV9.bgMhKI1kRyppLB5WTuuSPirnxON9L3-xJCuoKhly_2k';
    
    // Archivo de prueba
    const filename = 'cuota_103_1751393081229.pdf';
    
    // URL con token como parámetro de consulta
    const url = `http://localhost:3000/api/payments/support/${filename}?token=${encodeURIComponent(token)}`;
    
    console.log('Probando descarga de soporte...');
    console.log('URL:', url);
    
    const response = await fetch(url);
    
    console.log('Status:', response.status);
    console.log('Headers:', Object.fromEntries(response.headers.entries()));
    
    if (response.ok) {
      console.log('✅ Descarga exitosa');
      const buffer = await response.buffer();
      console.log('Tamaño del archivo:', buffer.length, 'bytes');
    } else {
      console.log('❌ Error en la descarga');
      const errorText = await response.text();
      console.log('Error:', errorText);
    }
    
  } catch (error) {
    console.error('Error en la prueba:', error);
  }
}

testDownloadSupport(); 