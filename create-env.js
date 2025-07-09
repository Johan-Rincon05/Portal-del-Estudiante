import fs from 'fs';

// Contenido del archivo .env
const envContent = `# Configuración de la base de datos
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/websocketchat

# Configuración del servidor
NODE_ENV=development
JWT_SECRET=temporal_secret_key_please_change

# Configuración de Google Drive
GOOGLE_CREDENTIALS=${JSON.stringify({
  "type": "service_account",
  "project_id": "portal-del-estudiante-464914",
  "private_key_id": "6f9dff85a891c39aeba3ac7f35500e2577a43f2d",
  "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQCDzoYJV+BQ56Tk\nz3opcoJgM1tyq/P+QOHI8zmQYoKky8YOYKmQCy9VXjsQkb+Buu34U2OIpUEmU9NO\nhdVEJvb6nV62ymtOpJrW+4E3tWEDULxqStegOMKQgQh1hqvxQjsnTg10sTn3rEs5\nsmeK7EiO0N1IqUxeyD219jCi4D5gZVTA68W6jah93j6Rp9XBaPCaF1Uu0qEt4i0W\n57vU66JuKVD2poTQcJkPAfKTmeo9Y608bM0z70Lr1ngsYXVyj0K8WisW61a55p6N\nQerVeFDU1v06QGh8n4YSUaeIfwLbUpGWHqIyVYlQXecF6lA41MM9GPfaHdaCvoJv\nNLb+ApJXAgMBAAECggEAPu5Lo8lfsfEvkwmWl5RzODA9IM6Fw+bBhprOaKgIHVun\nl/TB8KLOejFv/PTBnVSdSxuxYawZI44RTSPsE8qQ0E5zys1xl45S2YMiinEgvR7+\nnrdWJUsEZk8dNVPT43BOYvFKzmTRuvV5wzXxZuxypjGF/avLaVOs1ySQyytKzOXV\nPHno9BknFlPuL3icD9BwAlL2LIR3zFVAiaF8W9z50eaxOmDjcFM8yUmG6OBBUme0\n3+tJEdwUAHjFZZsOwztjlld5CkL9A6x5phg6PxW8U4/6GRCTnlTMliIgyXWbto/i\nmy++q31SuMpJ7cQoUjmZah9o6srkhebfJhTTKK1uzQKBgQC40sxrIQwkyDweGTft\nAhZ3mv5bKJEWuLPZeyHX9bC7NeiXqheHXPr53XoUJdOEdBGmZFZy65Q1MNVoi8To\nhK2OJoncUOVFXdQxhE79PDveuJQRvCDk1ljXa30woVWzcW30W8lIltqCtsrtwXn7\neAxk6LYo6ekLWuZsLZ2Ae5UiHQKBgQC2kPa73TXPfWcFLZl4a+aKf5lShMjEwYNS\n/eNiV1zsjhVxdBtB61xIfKEaTyrC4qM0ULVbs2/KX2USTsxFAysdTiHESgjOawtE\nxhNBDfCWq63Gm0OJExTHzUXHB+Zr+kPmylGraUV6ECJ+ewEAgprPKVt7STR79AYj\nvVJ+0ygcAwKBgDXj2RDfiO/spoLMLZ9gvXZQbhvcXzm1z1L5cSvMCqT7mf8m7Ede\n2Bsk9eSMBvmW8lKG7SIDCKrdu0wJfPejQAuztvzTZZZtPmLVxkZWWsqdHSdyqFCx\nIyRkxhL458kzqLDYVn9g5QO6Er9ya4PkRBDkPcD+OyJBdfBS+Jqu7hQNAoGAZXGn\nqDwC6oiD9hygaomKUOsWBwRBixL8JeFtt/dTax6IS8J4YuilHqIh4ryaxi+pACjY\nnVvXglv/jWy7lJ1uF5qSqL96pThVyqFFkaBtT0uWBAXCQSiZI2ysmSuKnfUyRcum\nFdkpAep1QFKY+++WlgYlDxxeTYIK51ELxe0PHIECgYA5ZtmwmZ8ICrsvJgWrmB1N\nT5cI+YgPbIYtwrGPZyHut6PXzSHNljK9FeIKdno0VcJNeXMYjFr4tXL+mUfcxEVg\nYdFY12TxWT18JmfVGeFN/qUeVQVfIv+kzorJblZ2z3xfhDleO/1yIC9qWsAR1ACE\nTAIwtjVIWvTmVxUc1a65Vw==\n-----END PRIVATE KEY-----\n",
  "client_email": "storage-pde@portal-del-estudiante-464914.iam.gserviceaccount.com",
  "client_id": "114470682344141663141",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/storage-pde%40portal-del-estudiante-464914.iam.gserviceaccount.com",
  "universe_domain": "googleapis.com"
})}

# ID de la carpeta en Google Drive donde se almacenarán los documentos
DRIVE_FOLDER_ID=1eNzgB8aXSraFEPCTWd9Dp1HmESe0ob3G

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