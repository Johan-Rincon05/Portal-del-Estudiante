/**
 * Servicio de Email para el Portal del Estudiante
 * Este archivo maneja el envío de emails para notificaciones del sistema
 */

import nodemailer from 'nodemailer';

/**
 * Configuración del transportador de email
 * En desarrollo usa Ethereal Email, en producción usaría un servicio real
 */
const createTransporter = () => {
  if (process.env.NODE_ENV === 'production') {
    // Configuración para producción (ejemplo con Gmail)
    return nodemailer.createTransporter({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
  } else {
    // Configuración para desarrollo (Ethereal Email)
    return nodemailer.createTransporter({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: process.env.ETHEREAL_USER || 'test@ethereal.email',
        pass: process.env.ETHEREAL_PASS || 'test123'
      }
    });
  }
};

/**
 * Envía un email de reseteo de contraseña
 * @param to - Email del destinatario
 * @param temporaryPassword - Contraseña temporal generada
 * @param username - Nombre de usuario
 * @returns Promise con el resultado del envío
 */
export const sendPasswordResetEmail = async (
  to: string, 
  temporaryPassword: string, 
  username: string
): Promise<boolean> => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: process.env.EMAIL_FROM || '"Portal del Estudiante" <noreply@portalestudiante.com>',
      to: to,
      subject: '🔐 Nueva Contraseña Temporal - Portal del Estudiante',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
          <div style="background-color: #ffffff; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #2563eb; margin: 0; font-size: 24px;">Portal del Estudiante</h1>
              <p style="color: #6b7280; margin: 10px 0 0 0;">Sistema de Gestión Académica</p>
            </div>
            
            <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin-bottom: 25px; border-radius: 5px;">
              <h2 style="color: #92400e; margin: 0 0 10px 0; font-size: 18px;">⚠️ Contraseña Temporal Generada</h2>
              <p style="color: #92400e; margin: 0; font-size: 14px;">
                Hola <strong>${username}</strong>, se ha generado una nueva contraseña temporal para tu cuenta.
              </p>
            </div>
            
            <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
              <h3 style="color: #374151; margin: 0 0 15px 0; font-size: 16px;">🔑 Tu Nueva Contraseña Temporal</h3>
              <div style="background-color: #ffffff; padding: 15px; border: 2px dashed #d1d5db; border-radius: 5px; text-align: center;">
                <code style="font-size: 18px; font-weight: bold; color: #059669; letter-spacing: 2px; font-family: 'Courier New', monospace;">
                  ${temporaryPassword}
                </code>
              </div>
            </div>
            
            <div style="background-color: #dbeafe; border-left: 4px solid #3b82f6; padding: 15px; margin-bottom: 25px; border-radius: 5px;">
              <h3 style="color: #1e40af; margin: 0 0 10px 0; font-size: 16px;">📋 Instrucciones Importantes</h3>
              <ul style="color: #1e40af; margin: 0; padding-left: 20px;">
                <li>Utiliza esta contraseña temporal para iniciar sesión</li>
                <li>Cambia tu contraseña inmediatamente después del primer inicio de sesión</li>
                <li>Esta contraseña es temporal y por seguridad debe ser cambiada</li>
                <li>No compartas esta contraseña con nadie</li>
              </ul>
            </div>
            
            <div style="text-align: center; margin-top: 30px;">
              <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth" 
                 style="background-color: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
                🔗 Ir al Portal del Estudiante
              </a>
            </div>
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center;">
              <p style="color: #6b7280; font-size: 12px; margin: 0;">
                Este email fue enviado automáticamente por el sistema.<br>
                Si no solicitaste este cambio, contacta inmediatamente al administrador.
              </p>
            </div>
          </div>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    
    if (process.env.NODE_ENV === 'development') {
      console.log('📧 Email de reseteo enviado (desarrollo):');
      console.log('URL de preview:', nodemailer.getTestMessageUrl(info));
    }
    
    return true;
  } catch (error) {
    console.error('❌ Error al enviar email de reseteo:', error);
    return false;
  }
};

/**
 * Envía un email de bienvenida a nuevos usuarios
 * @param to - Email del destinatario
 * @param username - Nombre de usuario
 * @param temporaryPassword - Contraseña temporal (si se proporciona)
 * @returns Promise con el resultado del envío
 */
export const sendWelcomeEmail = async (
  to: string, 
  username: string, 
  temporaryPassword?: string
): Promise<boolean> => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: process.env.EMAIL_FROM || '"Portal del Estudiante" <noreply@portalestudiante.com>',
      to: to,
      subject: '🎉 ¡Bienvenido al Portal del Estudiante!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
          <div style="background-color: #ffffff; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #2563eb; margin: 0; font-size: 24px;">Portal del Estudiante</h1>
              <p style="color: #6b7280; margin: 10px 0 0 0;">Sistema de Gestión Académica</p>
            </div>
            
            <div style="background-color: #ecfdf5; border-left: 4px solid #10b981; padding: 15px; margin-bottom: 25px; border-radius: 5px;">
              <h2 style="color: #065f46; margin: 0 0 10px 0; font-size: 18px;">🎉 ¡Bienvenido!</h2>
              <p style="color: #065f46; margin: 0; font-size: 14px;">
                Hola <strong>${username}</strong>, tu cuenta ha sido creada exitosamente en el Portal del Estudiante.
              </p>
            </div>
            
            ${temporaryPassword ? `
            <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
              <h3 style="color: #374151; margin: 0 0 15px 0; font-size: 16px;">🔑 Tu Contraseña Temporal</h3>
              <div style="background-color: #ffffff; padding: 15px; border: 2px dashed #d1d5db; border-radius: 5px; text-align: center;">
                <code style="font-size: 18px; font-weight: bold; color: #059669; letter-spacing: 2px; font-family: 'Courier New', monospace;">
                  ${temporaryPassword}
                </code>
              </div>
              <p style="color: #6b7280; font-size: 12px; margin: 10px 0 0 0; text-align: center;">
                Cambia esta contraseña después de tu primer inicio de sesión
              </p>
            </div>
            ` : ''}
            
            <div style="background-color: #dbeafe; border-left: 4px solid #3b82f6; padding: 15px; margin-bottom: 25px; border-radius: 5px;">
              <h3 style="color: #1e40af; margin: 0 0 10px 0; font-size: 16px;">🚀 Comienza Ahora</h3>
              <ul style="color: #1e40af; margin: 0; padding-left: 20px;">
                <li>Inicia sesión con tus credenciales</li>
                <li>Completa tu perfil personal</li>
                <li>Sube los documentos requeridos</li>
                <li>Explora todas las funcionalidades disponibles</li>
              </ul>
            </div>
            
            <div style="text-align: center; margin-top: 30px;">
              <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth" 
                 style="background-color: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
                🔗 Iniciar Sesión
              </a>
            </div>
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center;">
              <p style="color: #6b7280; font-size: 12px; margin: 0;">
                Si tienes alguna pregunta, no dudes en contactar al soporte técnico.
              </p>
            </div>
          </div>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    
    if (process.env.NODE_ENV === 'development') {
      console.log('📧 Email de bienvenida enviado (desarrollo):');
      console.log('URL de preview:', nodemailer.getTestMessageUrl(info));
    }
    
    return true;
  } catch (error) {
    console.error('❌ Error al enviar email de bienvenida:', error);
    return false;
  }
};

/**
 * Envía una notificación general por email
 * @param to - Email del destinatario
 * @param subject - Asunto del email
 * @param message - Mensaje del email
 * @returns Promise con el resultado del envío
 */
export const sendNotificationEmail = async (
  to: string,
  subject: string,
  message: string
): Promise<boolean> => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: process.env.EMAIL_FROM || '"Portal del Estudiante" <noreply@portalestudiante.com>',
      to: to,
      subject: subject,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
          <div style="background-color: #ffffff; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #2563eb; margin: 0; font-size: 24px;">Portal del Estudiante</h1>
              <p style="color: #6b7280; margin: 10px 0 0 0;">Sistema de Gestión Académica</p>
            </div>
            
            <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
              <h2 style="color: #374151; margin: 0 0 15px 0; font-size: 18px;">📢 Notificación</h2>
              <div style="color: #374151; line-height: 1.6;">
                ${message}
              </div>
            </div>
            
            <div style="text-align: center; margin-top: 30px;">
              <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}" 
                 style="background-color: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
                🔗 Ir al Portal
              </a>
            </div>
          </div>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    
    if (process.env.NODE_ENV === 'development') {
      console.log('📧 Email de notificación enviado (desarrollo):');
      console.log('URL de preview:', nodemailer.getTestMessageUrl(info));
    }
    
    return true;
  } catch (error) {
    console.error('❌ Error al enviar email de notificación:', error);
    return false;
  }
}; 