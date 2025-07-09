import express from 'express';
import { generateAuthUrl, getTokensFromCode, isAuthenticated, getFolderInfo } from '../google-drive-oauth';

const router = express.Router();

// Ruta para iniciar el proceso de autenticación
router.get('/google/auth', (req, res) => {
    try {
        const authUrl = generateAuthUrl();
        console.log('🔗 URL de autorización generada:', authUrl);
        res.json({ 
            success: true, 
            authUrl,
            message: 'Ve a esta URL para autorizar el acceso a Google Drive'
        });
    } catch (error) {
        console.error('Error al generar URL de autorización:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Error al generar URL de autorización' 
        });
    }
});

// Ruta de callback después de la autorización
router.get('/google/callback', async (req, res) => {
    try {
        const { code } = req.query;
        
        if (!code || typeof code !== 'string') {
            return res.status(400).json({ 
                success: false, 
                error: 'Código de autorización no válido' 
            });
        }

        console.log('🔄 Intercambiando código por tokens...');
        const tokens = await getTokensFromCode(code);
        
        console.log('✅ Tokens obtenidos correctamente');
        
        // Redirigir a una página de éxito o devolver respuesta JSON
        res.json({ 
            success: true, 
            message: 'Autenticación completada exitosamente',
            authenticated: true
        });
        
    } catch (error) {
        console.error('Error en callback de Google:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Error al completar la autenticación' 
        });
    }
});

// Ruta para verificar el estado de autenticación
router.get('/google/status', async (req, res) => {
    try {
        const authenticated = isAuthenticated();
        
        if (authenticated) {
            // Intentar obtener información de la carpeta para verificar que todo funciona
            try {
                const folderInfo = await getFolderInfo();
                res.json({
                    success: true,
                    authenticated: true,
                    folderInfo,
                    message: 'Autenticación válida y carpeta accesible'
                });
            } catch (folderError) {
                res.json({
                    success: true,
                    authenticated: true,
                    folderError: folderError.message,
                    message: 'Autenticado pero error al acceder a la carpeta'
                });
            }
        } else {
            res.json({
                success: false,
                authenticated: false,
                message: 'No autenticado. Necesitas autorizar el acceso a Google Drive'
            });
        }
        
    } catch (error) {
        console.error('Error al verificar estado de autenticación:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Error al verificar estado de autenticación' 
        });
    }
});

export default router; 