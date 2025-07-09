const fs = require('fs');
const path = require('path');

// Función para crear el archivo .env
function createEnvFile() {
    const envPath = path.join(__dirname, '..', '.env');
    
    const envContent = `# Configuración de la base de datos
DATABASE_URL="file:./dev.db"

# Configuración del servidor
PORT=3000
JWT_SECRET="temporal_secret_key_change_in_production"

# Configuración de Google Drive OAuth
GOOGLE_CLIENT_ID=tu_id_de_cliente_aqui
GOOGLE_CLIENT_SECRET=tu_secreto_de_cliente_aqui
GOOGLE_DRIVE_FOLDER_ID=1eNzgB8aXSraFEPCTWd9Dp1HmESe0ob3G

# Configuración de Google Drive (cuenta de servicio - mantener para compatibilidad)
GOOGLE_SERVICE_ACCOUNT_EMAIL=tu_email_de_cuenta_de_servicio
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\\nTu_clave_privada_aqui\\n-----END PRIVATE KEY-----\\n"
`;

    try {
        fs.writeFileSync(envPath, envContent);
        console.log('✅ Archivo .env creado exitosamente');
        console.log('');
        console.log('📝 Ahora necesitas:');
        console.log('   1. Obtener las credenciales OAuth de Google Cloud Console');
        console.log('   2. Reemplazar los valores en el archivo .env');
        console.log('   3. Reiniciar el servidor');
        console.log('');
        console.log('🔗 Para obtener las credenciales:');
        console.log('   https://console.cloud.google.com/apis/credentials');
        console.log('');
        console.log('📋 Variables que necesitas configurar:');
        console.log('   - GOOGLE_CLIENT_ID');
        console.log('   - GOOGLE_CLIENT_SECRET');
        console.log('   - GOOGLE_DRIVE_FOLDER_ID (ya configurado con tu carpeta)');
        
    } catch (error) {
        console.error('❌ Error al crear el archivo .env:', error.message);
    }
}

// Función para mostrar instrucciones detalladas
function showInstructions() {
    console.log('🔧 Configuración completa de OAuth para Google Drive');
    console.log('==================================================\n');
    
    console.log('📋 Pasos detallados:');
    console.log('');
    console.log('1. 🌐 Ve a Google Cloud Console:');
    console.log('   https://console.cloud.google.com/');
    console.log('');
    console.log('2. 📁 Selecciona tu proyecto o crea uno nuevo');
    console.log('');
    console.log('3. 🔑 Ve a "APIs y servicios" > "Credenciales"');
    console.log('');
    console.log('4. ➕ Haz clic en "Crear credenciales" > "ID de cliente de OAuth 2.0"');
    console.log('');
    console.log('5. 📝 Configura la aplicación:');
    console.log('   - Tipo: Aplicación de escritorio');
    console.log('   - Nombre: Portal del Estudiante');
    console.log('');
    console.log('6. 📋 Copia las credenciales generadas:');
    console.log('   - ID de cliente');
    console.log('   - Secreto del cliente');
    console.log('');
    console.log('7. 🔧 Edita el archivo .env y reemplaza:');
    console.log('   GOOGLE_CLIENT_ID=tu_id_de_cliente_real');
    console.log('   GOOGLE_CLIENT_SECRET=tu_secreto_de_cliente_real');
    console.log('');
    console.log('8. 🚀 Reinicia el servidor');
    console.log('');
    console.log('9. 🔗 Ve a: http://localhost:3000/api/auth/google/auth');
    console.log('   Para autorizar el acceso a Google Drive');
    console.log('');
    console.log('10. ✅ Verifica el estado:');
    console.log('    http://localhost:3000/api/auth/google/status');
    console.log('');
}

// Función principal
function main() {
    const args = process.argv.slice(2);
    const command = args[0];
    
    console.log('🚀 Configurador de OAuth para Google Drive\n');
    
    switch (command) {
        case 'create':
            createEnvFile();
            break;
            
        case 'instructions':
            showInstructions();
            break;
            
        case 'setup':
            createEnvFile();
            console.log('');
            showInstructions();
            break;
            
        default:
            console.log('📝 Uso: node create-env-oauth.js <comando>');
            console.log('');
            console.log('Comandos disponibles:');
            console.log('  create       - Crear archivo .env');
            console.log('  instructions - Mostrar instrucciones detalladas');
            console.log('  setup        - Crear .env y mostrar instrucciones');
            console.log('');
            console.log('Ejemplo:');
            console.log('  node create-env-oauth.js setup');
            break;
    }
}

// Ejecutar si se llama directamente
if (require.main === module) {
    main();
}

module.exports = { createEnvFile, showInstructions }; 