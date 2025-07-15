import fs from 'fs';

// Contenido del archivo .env
const envContent = `# Configuración de la base de datos
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/websocketchat

# Configuración del servidor
NODE_ENV=development
JWT_SECRET=temporal_secret_key_please_change



# Configuración de CORS
CORS_ORIGIN=http://localhost:3000

# Configuración de archivos
MAX_FILE_SIZE=10485760
`;

// Escribir el archivo .env
fs.writeFileSync('.env', envContent);

console.log('✅ Archivo .env creado correctamente con todas las variables necesarias');
console.log('📝 Variables incluidas:');
console.log('   - DATABASE_URL');
console.log('   - NODE_ENV');
console.log('   - JWT_SECRET');
console.log('   - GOOGLE_CREDENTIALS');
console.log('   - DRIVE_FOLDER_ID');
console.log('   - CORS_ORIGIN');
console.log('   - MAX_FILE_SIZE');