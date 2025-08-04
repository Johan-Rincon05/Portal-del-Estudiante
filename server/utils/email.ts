/**
 * Servicio de Email para el Portal del Estudiante
 * Este archivo maneja el envío de emails para notificaciones del sistema
 */

import nodemailer from 'nodemailer';
import jwt from 'jsonwebtoken';
import { config } from '../config';

// Configuración del transportador de email
const transporter = nodemailer.createTransporter({
  host: config.email.host,
  port: config.email.port,
  secure: config.email.secure, // true para 465, false para otros puertos
  auth: {
    user: config.email.user,
    pass: config.email.password,
  },
});

// Tipos para los tokens de verificación
interface VerificationTokenPayload {
  email: string;
  userId: string;
  type: 'email_verification' | 'password_reset';
  expiresIn: string;
}

// Generar token de verificación
export const generateVerificationToken = (email: string, userId: string, type: 'email_verification' | 'password_reset' = 'email_verification'): string => {
  const payload: VerificationTokenPayload = {
    email,
    userId,
    type,
    expiresIn: type === 'email_verification' ? '24h' : '1h'
  };

  return jwt.sign(payload, config.jwt.secret, { 
    expiresIn: payload.expiresIn 
  });
};

// Verificar token de verificación
export const verifyToken = (token: string): VerificationTokenPayload | null => {
  try {
    const decoded = jwt.verify(token, config.jwt.secret) as VerificationTokenPayload;
    return decoded;
  } catch (error) {
    console.error('Error al verificar token:', error);
    return null;
  }
};

// Generar código de verificación de 6 dígitos
export const generateVerificationCode = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Plantilla de email de verificación
const getVerificationEmailTemplate = (code: string, userName: string) => {
  return `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Verificación de Email - Portal del Estudiante</title>
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          background-color: #f5f5f5;
        }
        .container {
          background-color: #ffffff;
          border-radius: 10px;
          padding: 30px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
        }
        .logo {
          font-size: 24px;
          font-weight: bold;
          color: #2563eb;
          margin-bottom: 10px;
        }
        .verification-code {
          background-color: #f8fafc;
          border: 2px solid #e2e8f0;
          border-radius: 8px;
          padding: 20px;
          text-align: center;
          margin: 20px 0;
          font-family: 'Courier New', monospace;
          font-size: 32px;
          font-weight: bold;
          letter-spacing: 4px;
          color: #1e293b;
        }
        .instructions {
          background-color: #fef3c7;
          border-left: 4px solid #f59e0b;
          padding: 15px;
          margin: 20px 0;
          border-radius: 4px;
        }
        .footer {
          text-align: center;
          margin-top: 30px;
          padding-top: 20px;
          border-top: 1px solid #e2e8f0;
          color: #64748b;
          font-size: 14px;
        }
        .button {
          display: inline-block;
          background-color: #2563eb;
          color: white;
          padding: 12px 24px;
          text-decoration: none;
          border-radius: 6px;
          margin: 10px 0;
        }
        .warning {
          background-color: #fef2f2;
          border: 1px solid #fecaca;
          border-radius: 6px;
          padding: 15px;
          margin: 20px 0;
          color: #dc2626;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">🎓 Portal del Estudiante</div>
          <h1>Verifica tu Email</h1>
        </div>
        
        <p>Hola <strong>${userName}</strong>,</p>
        
        <p>Gracias por registrarte en el Portal del Estudiante. Para completar tu registro, necesitamos verificar tu dirección de email.</p>
        
        <div class="verification-code">
          ${code}
        </div>
        
        <div class="instructions">
          <strong>Instrucciones:</strong>
          <ul>
            <li>Ingresa este código en la página de verificación</li>
            <li>El código expira en 10 minutos</li>
            <li>Si no solicitaste este código, ignora este email</li>
          </ul>
        </div>
        
        <p>Si el botón no funciona, copia y pega este enlace en tu navegador:</p>
        <p style="word-break: break-all; color: #2563eb;">
          ${config.frontendUrl}/verify-email?email=${encodeURIComponent(userName)}
        </p>
        
        <div class="warning">
          <strong>⚠️ Importante:</strong> Nunca compartas este código con nadie. El equipo del Portal del Estudiante nunca te pedirá este código por otros medios.
        </div>
        
        <div class="footer">
          <p>Este es un email automático, por favor no respondas a este mensaje.</p>
          <p>Si tienes problemas, contacta al soporte técnico.</p>
          <p>&copy; 2024 Portal del Estudiante. Todos los derechos reservados.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

// Plantilla de email de bienvenida
const getWelcomeEmailTemplate = (userName: string) => {
  return `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>¡Bienvenido al Portal del Estudiante!</title>
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          background-color: #f5f5f5;
        }
        .container {
          background-color: #ffffff;
          border-radius: 10px;
          padding: 30px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
        }
        .logo {
          font-size: 24px;
          font-weight: bold;
          color: #2563eb;
          margin-bottom: 10px;
        }
        .success-icon {
          font-size: 48px;
          margin-bottom: 20px;
        }
        .next-steps {
          background-color: #f0f9ff;
          border-left: 4px solid #0ea5e9;
          padding: 20px;
          margin: 20px 0;
          border-radius: 4px;
        }
        .button {
          display: inline-block;
          background-color: #2563eb;
          color: white;
          padding: 12px 24px;
          text-decoration: none;
          border-radius: 6px;
          margin: 10px 0;
        }
        .footer {
          text-align: center;
          margin-top: 30px;
          padding-top: 20px;
          border-top: 1px solid #e2e8f0;
          color: #64748b;
          font-size: 14px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">🎓 Portal del Estudiante</div>
          <div class="success-icon">✅</div>
          <h1>¡Email Verificado Exitosamente!</h1>
        </div>
        
        <p>¡Felicitaciones <strong>${userName}</strong>!</p>
        
        <p>Tu cuenta ha sido verificada exitosamente. Ya puedes acceder a todas las funcionalidades del Portal del Estudiante.</p>
        
        <div class="next-steps">
          <h3>🎯 Próximos pasos:</h3>
          <ol>
            <li><strong>Completa tu perfil:</strong> Agrega información personal y académica</li>
            <li><strong>Sube tus documentos:</strong> Carga los documentos requeridos para tu matrícula</li>
            <li><strong>Revisa el dashboard:</strong> Consulta tu progreso en el proceso de matrícula</li>
            <li><strong>Crea solicitudes:</strong> Si necesitas ayuda, crea una solicitud de soporte</li>
          </ol>
        </div>
        
        <p style="text-align: center;">
          <a href="${config.frontendUrl}/home" class="button">
            🚀 Ir al Dashboard
          </a>
        </p>
        
        <div class="footer">
          <p>¡Bienvenido a tu nueva experiencia académica!</p>
          <p>&copy; 2024 Portal del Estudiante. Todos los derechos reservados.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

// Enviar email de verificación
export const sendVerificationEmail = async (email: string, userName: string, code: string): Promise<boolean> => {
  try {
    const mailOptions = {
      from: `"Portal del Estudiante" <${config.email.user}>`,
      to: email,
      subject: '🎓 Verifica tu Email - Portal del Estudiante',
      html: getVerificationEmailTemplate(code, userName),
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email de verificación enviado:', info.messageId);
    return true;
  } catch (error) {
    console.error('Error al enviar email de verificación:', error);
    return false;
  }
};

// Enviar email de bienvenida
export const sendWelcomeEmail = async (email: string, userName: string): Promise<boolean> => {
  try {
    const mailOptions = {
      from: `"Portal del Estudiante" <${config.email.user}>`,
      to: email,
      subject: '🎉 ¡Bienvenido al Portal del Estudiante!',
      html: getWelcomeEmailTemplate(userName),
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email de bienvenida enviado:', info.messageId);
    return true;
  } catch (error) {
    console.error('Error al enviar email de bienvenida:', error);
    return false;
  }
};

// Enviar email de notificación de cambio de estado
export const sendStatusChangeEmail = async (
  email: string, 
  userName: string, 
  type: 'document' | 'request' | 'payment',
  status: string,
  details: string
): Promise<boolean> => {
  try {
    const statusEmojis = {
      'aprobado': '✅',
      'rechazado': '❌',
      'pendiente': '⏳',
      'en_proceso': '🔄',
      'completada': '🎉'
    };

    const typeLabels = {
      'document': 'Documento',
      'request': 'Solicitud',
      'payment': 'Pago'
    };

    const mailOptions = {
      from: `"Portal del Estudiante" <${config.email.user}>`,
      to: email,
      subject: `${statusEmojis[status as keyof typeof statusEmojis] || '📢'} ${typeLabels[type]} ${status} - Portal del Estudiante`,
      html: `
        <!DOCTYPE html>
        <html lang="es">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Actualización de Estado</title>
          <style>
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
              background-color: #f5f5f5;
            }
            .container {
              background-color: #ffffff;
              border-radius: 10px;
              padding: 30px;
              box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
            }
            .status-badge {
              display: inline-block;
              padding: 8px 16px;
              border-radius: 20px;
              font-weight: bold;
              margin: 10px 0;
            }
            .status-approved { background-color: #dcfce7; color: #166534; }
            .status-rejected { background-color: #fef2f2; color: #dc2626; }
            .status-pending { background-color: #fef3c7; color: #d97706; }
            .footer {
              text-align: center;
              margin-top: 30px;
              padding-top: 20px;
              border-top: 1px solid #e2e8f0;
              color: #64748b;
              font-size: 14px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>📢 Actualización de Estado</h1>
            </div>
            
            <p>Hola <strong>${userName}</strong>,</p>
            
            <p>Tu ${typeLabels[type]} ha cambiado de estado:</p>
            
            <div class="status-badge status-${status}">
              ${statusEmojis[status as keyof typeof statusEmojis] || '📢'} ${status.toUpperCase()}
            </div>
            
            <p><strong>Detalles:</strong></p>
            <p>${details}</p>
            
            <p style="text-align: center;">
              <a href="${config.frontendUrl}/home" style="display: inline-block; background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">
                Ver en el Portal
              </a>
            </p>
            
            <div class="footer">
              <p>&copy; 2024 Portal del Estudiante. Todos los derechos reservados.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email de notificación enviado:', info.messageId);
    return true;
  } catch (error) {
    console.error('Error al enviar email de notificación:', error);
    return false;
  }
};

// Verificar la conexión del email
export const testEmailConnection = async (): Promise<boolean> => {
  try {
    await transporter.verify();
    console.log('✅ Conexión de email verificada correctamente');
    return true;
  } catch (error) {
    console.error('❌ Error en la conexión de email:', error);
    return false;
  }
}; 