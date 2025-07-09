const fs = require('fs');
const path = require('path');

// Función para verificar si las variables de entorno OAuth están configuradas
function checkOAuthConfig() {
    const requiredVars = [
        'GOOGLE_CLIENT_ID',
        'GOOGLE_CLIENT_SECRET',
        'GOOGLE_DRIVE_FOLDER_ID'
    ];
    
    const missingVars = [];
    
    requiredVars.forEach(varName => {
        if (!process.env[varName]) {
            missingVars.push(varName);
        }
    });
    
    return {
        isComplete: missingVars.length === 0,
        missingVars
    };
}

// Función para mostrar instrucciones de configuración
function showSetupInstructions() {
    console.log('🔧 Configuración de OAuth para Google Drive');
    console.log('==========================================\n');
    
    console.log('📋 Pasos para configurar OAuth:');
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
    console.log('7. 🔧 Agrega estas variables a tu archivo .env:');
    console.log('');
    console.log('   GOOGLE_CLIENT_ID=tu_id_de_cliente');
    console.log('   GOOGLE_CLIENT_SECRET=tu_secreto_de_cliente');
    console.log('   GOOGLE_DRIVE_FOLDER_ID=1eNzgB8aXSraFEPCTWd9Dp1HmESe0ob3G');
    console.log('');
    console.log('8. 🚀 Reinicia el servidor');
    console.log('');
    console.log('9. 🔗 Ve a: http://localhost:3000/api/auth/google/auth');
    console.log('   Para autorizar el acceso a Google Drive');
    console.log('');
}

// Función para verificar el estado actual
function checkCurrentStatus() {
    const config = checkOAuthConfig();
    
    if (config.isComplete) {
        console.log('✅ Todas las variables de entorno están configuradas');
        console.log('');
        console.log('🔍 Para verificar la autenticación:');
        console.log('   GET http://localhost:3000/api/auth/google/status');
        console.log('');
        console.log('🔗 Para iniciar la autenticación:');
        console.log('   GET http://localhost:3000/api/auth/google/auth');
        console.log('');
    } else {
        console.log('❌ Faltan variables de entorno:');
        config.missingVars.forEach(varName => {
            console.log(`   - ${varName}`);
        });
        console.log('');
        showSetupInstructions();
    }
}

// Función para actualizar el archivo .env
function updateEnvFile() {
    const envPath = path.join(__dirname, '..', '.env');
    
    console.log('📝 Actualizando archivo .env...');
    
    try {
        let envContent = '';
        
        if (fs.existsSync(envPath)) {
            envContent = fs.readFileSync(envPath, 'utf8');
        }
        
        // Variables OAuth que necesitamos agregar
        const oauthVars = {
            'GOOGLE_CLIENT_ID': 'tu_id_de_cliente_aqui',
            'GOOGLE_CLIENT_SECRET': 'tu_secreto_de_cliente_aqui',
            'GOOGLE_DRIVE_FOLDER_ID': '1eNzgB8aXSraFEPCTWd9Dp1HmESe0ob3G'
        };
        
        let updated = false;
        
        Object.entries(oauthVars).forEach(([key, defaultValue]) => {
            const regex = new RegExp(`^${key}=.*$`, 'm');
            
            if (regex.test(envContent)) {
                console.log(`   ✅ ${key} ya existe`);
            } else {
                envContent += `\n${key}=${defaultValue}`;
                console.log(`   ➕ ${key} agregado`);
                updated = true;
            }
        });
        
        if (updated) {
            fs.writeFileSync(envPath, envContent);
            console.log('');
            console.log('✅ Archivo .env actualizado');
            console.log('💡 Edita el archivo .env y reemplaza los valores por defecto');
        } else {
            console.log('');
            console.log('ℹ️  Todas las variables ya están en el archivo .env');
        }
        
    } catch (error) {
        console.error('❌ Error al actualizar .env:', error.message);
    }
}

// Función principal
function main() {
    const args = process.argv.slice(2);
    const command = args[0];
    
    console.log('🚀 Configurador de OAuth para Google Drive\n');
    
    switch (command) {
        case 'check':
            checkCurrentStatus();
            break;
            
        case 'setup':
            updateEnvFile();
            console.log('');
            showSetupInstructions();
            break;
            
        case 'instructions':
            showSetupInstructions();
            break;
            
        default:
            console.log('📝 Uso: node setup-oauth.js <comando>');
            console.log('');
            console.log('Comandos disponibles:');
            console.log('  check        - Verificar configuración actual');
            console.log('  setup        - Configurar archivo .env');
            console.log('  instructions - Mostrar instrucciones de configuración');
            console.log('');
            console.log('Ejemplo:');
            console.log('  node setup-oauth.js check');
            break;
    }
}

// Ejecutar si se llama directamente
if (require.main === module) {
    main();
}

module.exports = { checkOAuthConfig, showSetupInstructions, updateEnvFile }; 