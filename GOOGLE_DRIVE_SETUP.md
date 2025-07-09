# Configuración de Google Drive - Guía Paso a Paso

## 🚀 Configuración Rápida

### 1. Configurar Google Cloud Console

#### Paso 1: Crear Proyecto
1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un nuevo proyecto o selecciona uno existente
3. Anota el **Project ID** (lo necesitarás después)

#### Paso 2: Habilitar Google Drive API
1. En el menú lateral, ve a **APIs & Services** > **Library**
2. Busca "Google Drive API"
3. Haz clic en **Google Drive API**
4. Haz clic en **Enable**

#### Paso 3: Crear Cuenta de Servicio
1. Ve a **IAM & Admin** > **Service Accounts**
2. Haz clic en **Create Service Account**
3. Completa los campos:
   - **Service account name**: `portal-estudiante-drive`
   - **Service account ID**: se genera automáticamente
   - **Description**: `Cuenta de servicio para Portal del Estudiante`
4. Haz clic en **Create and Continue**
5. En **Grant this service account access to project**:
   - Selecciona **Editor** como rol
   - Haz clic en **Continue**
6. Haz clic en **Done**

#### Paso 4: Generar Credenciales
1. En la lista de cuentas de servicio, haz clic en la que acabas de crear
2. Ve a la pestaña **Keys**
3. Haz clic en **Add Key** > **Create new key**
4. Selecciona **JSON**
5. Haz clic en **Create**
6. Se descargará un archivo JSON con las credenciales

### 2. Configurar Google Drive

#### Paso 1: Crear Carpeta
1. Ve a [Google Drive](https://drive.google.com/)
2. Crea una nueva carpeta llamada "Portal del Estudiante - Documentos"
3. Haz clic derecho en la carpeta > **Share**
4. Agrega la cuenta de servicio (email que termina en `@tu-proyecto.iam.gserviceaccount.com`)
5. Dale permisos de **Editor**
6. Copia el **ID de la carpeta** de la URL:
   ```
   https://drive.google.com/drive/folders/1Bxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   ```
   El ID es: `1Bxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

### 3. Configurar Variables de Entorno

#### Paso 1: Preparar Credenciales
1. Abre el archivo JSON descargado
2. Copia todo el contenido
3. En tu archivo `.env`, agrega:

```env
# Google Drive API Configuration
GOOGLE_CREDENTIALS={"type":"service_account","project_id":"tu-proyecto","private_key_id":"...","private_key":"-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n","client_email":"tu-service-account@tu-proyecto.iam.gserviceaccount.com","client_id":"...","auth_uri":"https://accounts.google.com/o/oauth2/auth","token_uri":"https://oauth2.googleapis.com/token","auth_provider_x509_cert_url":"https://www.googleapis.com/oauth2/v1/certs","client_x509_cert_url":"https://www.googleapis.com/robot/v1/metadata/x509/tu-service-account%40tu-proyecto.iam.gserviceaccount.com"}

# ID de la carpeta en Google Drive donde se guardarán los documentos
DRIVE_FOLDER_ID=1Bxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

**⚠️ Importante**: Reemplaza `tu-proyecto` con tu Project ID real y `1Bxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx` con el ID real de tu carpeta.

### 4. Instalar Dependencias

```bash
npm install googleapis
```

### 5. Ejecutar Migración

```bash
node server/run-migration.js
```

### 6. Probar la Integración

```bash
node server/test-google-drive.js
```

## 🔧 Verificación

### Verificar Configuración

1. **Variables de entorno**: Asegúrate de que `GOOGLE_CREDENTIALS` y `DRIVE_FOLDER_ID` estén configuradas
2. **Permisos**: Verifica que la cuenta de servicio tenga acceso a la carpeta
3. **API habilitada**: Confirma que Google Drive API esté habilitada en tu proyecto

### Probar Funcionalidad

1. **Subida de archivos**: Intenta subir un documento desde la aplicación
2. **Descarga de archivos**: Verifica que los archivos se puedan descargar
3. **Visualización**: Comprueba que los archivos se muestren correctamente

## 🐛 Troubleshooting

### Error: "GOOGLE_CREDENTIALS no está configurado"
- Verifica que la variable esté en tu archivo `.env`
- Asegúrate de que el JSON sea válido
- No uses comillas simples alrededor del JSON

### Error: "DRIVE_FOLDER_ID no está configurado"
- Verifica que la variable esté en tu archivo `.env`
- Confirma que el ID de la carpeta sea correcto
- Asegúrate de que la carpeta exista

### Error: "authentication failed"
- Verifica que las credenciales JSON sean correctas
- Confirma que la cuenta de servicio exista
- Revisa que el Project ID coincida

### Error: "permission denied"
- Verifica que la cuenta de servicio tenga permisos en la carpeta
- Confirma que la carpeta esté compartida correctamente
- Revisa que el rol sea "Editor" o superior

### Error: "API not enabled"
- Ve a Google Cloud Console
- Habilita Google Drive API
- Espera unos minutos para que se propague

## 📋 Checklist de Configuración

- [ ] Proyecto creado en Google Cloud Console
- [ ] Google Drive API habilitada
- [ ] Cuenta de servicio creada
- [ ] Credenciales JSON descargadas
- [ ] Carpeta creada en Google Drive
- [ ] Carpeta compartida con la cuenta de servicio
- [ ] Variables de entorno configuradas
- [ ] Dependencias instaladas
- [ ] Migración ejecutada
- [ ] Pruebas ejecutadas exitosamente

## 🔒 Seguridad

### Buenas Prácticas

1. **Nunca commits credenciales**: Las credenciales deben estar en `.env` y no en el repositorio
2. **Principio de menor privilegio**: La cuenta de servicio solo necesita permisos de Editor en la carpeta específica
3. **Rotación de credenciales**: Cambia las credenciales periódicamente
4. **Monitoreo**: Revisa los logs de acceso regularmente

### Variables de Entorno

```env
# ✅ Correcto
GOOGLE_CREDENTIALS={"type":"service_account",...}

# ❌ Incorrecto
GOOGLE_CREDENTIALS='{"type":"service_account",...}'
```

## 📞 Soporte

Si tienes problemas con la configuración:

1. Revisa los logs de error
2. Ejecuta el script de prueba: `node server/test-google-drive.js`
3. Verifica la documentación completa: `GOOGLE_DRIVE_INTEGRATION.md`
4. Consulta la documentación oficial de Google Drive API

## 🎯 Próximos Pasos

Una vez configurado correctamente:

1. **Migrar documentos existentes** (opcional):
   ```bash
   node server/migrate-to-google-drive.js
   ```

2. **Probar en producción**:
   - Sube algunos documentos de prueba
   - Verifica la descarga y visualización
   - Comprueba el rendimiento

3. **Monitorear uso**:
   - Revisa el uso de la API en Google Cloud Console
   - Monitorea los logs de la aplicación
   - Verifica el almacenamiento en Google Drive 