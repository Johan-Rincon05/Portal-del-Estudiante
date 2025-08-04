import { Router } from 'express';
import { storage } from '../storage';
import { z } from 'zod';
import { authenticateToken } from '../middleware/auth';
import ExcelJS from 'exceljs';
import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';

const router = Router();

// Esquemas de validación
const generateReportSchema = z.object({
  reportType: z.enum(['students', 'documents', 'payments', 'requests', 'comprehensive']),
  format: z.enum(['excel', 'pdf']),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  status: z.string().optional(),
  type: z.string().optional(),
  filters: z.record(z.any()).optional()
});

const getReportDataSchema = z.object({
  reportType: z.enum(['students', 'documents', 'payments', 'requests', 'comprehensive']),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  status: z.string().optional(),
  type: z.string().optional(),
  filters: z.record(z.any()).optional()
});

// Generar y descargar reporte
router.post('/generate', authenticateToken, async (req, res) => {
  try {
    const { user } = req as any;
    
    if (user.role !== 'SuperAdministrativos' && user.role !== 'superuser') {
      return res.status(403).json({ error: 'Acceso denegado' });
    }

    const { reportType, format, dateFrom, dateTo, status, type, filters } = generateReportSchema.parse(req.body);

    // Obtener datos del reporte
    const reportData = await storage.getAdvancedReportData({
      reportType,
      dateFrom,
      dateTo,
      status,
      type,
      filters
    });

    if (format === 'excel') {
      const workbook = await generateExcelReport(reportType, reportData);
      const fileName = `reporte_${reportType}_${new Date().toISOString().split('T')[0]}.xlsx`;
      
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
      
      await workbook.xlsx.write(res);
      res.end();
    } else if (format === 'pdf') {
      const fileName = `reporte_${reportType}_${new Date().toISOString().split('T')[0]}.pdf`;
      
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
      
      generatePDFReport(reportType, reportData, res);
    }

  } catch (error) {
    console.error('Error generating report:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Datos de reporte inválidos', details: error.errors });
    }
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Obtener datos de reporte (sin descarga)
router.get('/data', authenticateToken, async (req, res) => {
  try {
    const { user } = req as any;
    
    if (user.role !== 'SuperAdministrativos' && user.role !== 'superuser') {
      return res.status(403).json({ error: 'Acceso denegado' });
    }

    const query = getReportDataSchema.parse(req.query);
    
    const reportData = await storage.getAdvancedReportData({
      reportType: query.reportType,
      dateFrom: query.dateFrom,
      dateTo: query.dateTo,
      status: query.status,
      type: query.type,
      filters: query.filters
    });

    res.json(reportData);
  } catch (error) {
    console.error('Error getting report data:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Obtener estadísticas para dashboard
router.get('/dashboard-stats', authenticateToken, async (req, res) => {
  try {
    const { user } = req as any;
    
    if (user.role !== 'SuperAdministrativos' && user.role !== 'superuser') {
      return res.status(403).json({ error: 'Acceso denegado' });
    }

    const stats = await storage.getDashboardStats();
    res.json(stats);
  } catch (error) {
    console.error('Error getting dashboard stats:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Función para generar reporte Excel
async function generateExcelReport(reportType: string, data: any) {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Reporte');

  // Configurar estilos
  const headerStyle = {
    font: { bold: true, color: { argb: 'FFFFFF' } },
    fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: '4472C4' } },
    alignment: { horizontal: 'center' }
  };

  const titleStyle = {
    font: { bold: true, size: 16 },
    alignment: { horizontal: 'center' }
  };

  // Agregar título
  const titleRow = worksheet.addRow([`Reporte de ${getReportTypeTitle(reportType)}`]);
  titleRow.font = { bold: true, size: 16 };
  worksheet.mergeCells(`A1:${getLastColumn(data)}1`);
  worksheet.addRow([]); // Línea en blanco

  // Agregar encabezados según el tipo de reporte
  const headers = getHeadersForReportType(reportType);
  const headerRow = worksheet.addRow(headers);
  headerRow.eachCell((cell) => {
    cell.style = headerStyle;
  });

  // Agregar datos
  if (Array.isArray(data)) {
    data.forEach((row: any) => {
      const rowData = getRowDataForReportType(reportType, row);
      worksheet.addRow(rowData);
    });
  }

  // Ajustar ancho de columnas
  worksheet.columns.forEach((column) => {
    column.width = 15;
  });

  return workbook;
}

// Función para generar reporte PDF
function generatePDFReport(reportType: string, data: any, res: any) {
  const doc = new PDFDocument();
  doc.pipe(res);

  // Configurar página
  doc.fontSize(20).text(`Reporte de ${getReportTypeTitle(reportType)}`, { align: 'center' });
  doc.moveDown();
  doc.fontSize(12).text(`Generado el: ${new Date().toLocaleDateString('es-ES')}`, { align: 'center' });
  doc.moveDown(2);

  // Agregar contenido según el tipo de reporte
  if (reportType === 'comprehensive') {
    generateComprehensivePDFReport(doc, data);
  } else {
    generateSimplePDFReport(doc, reportType, data);
  }

  doc.end();
}

// Función para generar reporte PDF simple
function generateSimplePDFReport(doc: any, reportType: string, data: any) {
  const headers = getHeadersForReportType(reportType);
  
  // Agregar tabla
  let yPosition = doc.y;
  const startX = 50;
  const columnWidth = 80;
  
  // Encabezados
  headers.forEach((header, index) => {
    doc.fontSize(10).font('Helvetica-Bold')
       .text(header, startX + (index * columnWidth), yPosition);
  });
  
  yPosition += 20;
  doc.moveTo(startX, yPosition).lineTo(startX + (headers.length * columnWidth), yPosition).stroke();
  yPosition += 10;

  // Datos
  if (Array.isArray(data)) {
    data.forEach((row: any) => {
      const rowData = getRowDataForReportType(reportType, row);
      rowData.forEach((cell: any, index: number) => {
        doc.fontSize(8).font('Helvetica')
           .text(String(cell || ''), startX + (index * columnWidth), yPosition);
      });
      yPosition += 15;
    });
  }
}

// Función para generar reporte PDF comprehensivo
function generateComprehensivePDFReport(doc: any, data: any) {
  // Resumen ejecutivo
  doc.fontSize(16).font('Helvetica-Bold').text('Resumen Ejecutivo', { underline: true });
  doc.moveDown();
  
  if (data.summary) {
    Object.entries(data.summary).forEach(([key, value]) => {
      doc.fontSize(12).font('Helvetica-Bold').text(`${key}:`);
      doc.fontSize(10).font('Helvetica').text(`${value}`);
      doc.moveDown();
    });
  }

  doc.addPage();

  // Gráficos y estadísticas
  if (data.charts) {
    doc.fontSize(16).font('Helvetica-Bold').text('Estadísticas', { underline: true });
    doc.moveDown();
    
    Object.entries(data.charts).forEach(([title, chartData]: [string, any]) => {
      doc.fontSize(14).font('Helvetica-Bold').text(title);
      doc.moveDown();
      
      if (Array.isArray(chartData)) {
        chartData.forEach((item: any) => {
          doc.fontSize(10).font('Helvetica').text(`${item.label}: ${item.value}`);
        });
      }
      doc.moveDown();
    });
  }
}

// Funciones auxiliares
function getReportTypeTitle(reportType: string): string {
  const titles: Record<string, string> = {
    students: 'Estudiantes',
    documents: 'Documentos',
    payments: 'Pagos',
    requests: 'Solicitudes',
    comprehensive: 'Comprehensivo'
  };
  return titles[reportType] || reportType;
}

function getHeadersForReportType(reportType: string): string[] {
  const headers: Record<string, string[]> = {
    students: ['ID', 'Nombre', 'Email', 'Etapa', 'Estado', 'Fecha Registro'],
    documents: ['ID', 'Estudiante', 'Tipo', 'Estado', 'Fecha Subida', 'Revisado Por'],
    payments: ['ID', 'Estudiante', 'Monto', 'Método', 'Estado', 'Fecha Pago'],
    requests: ['ID', 'Estudiante', 'Tipo', 'Estado', 'Fecha Solicitud', 'Completado Por']
  };
  return headers[reportType] || [];
}

function getRowDataForReportType(reportType: string, row: any): any[] {
  switch (reportType) {
    case 'students':
      return [
        row.id,
        `${row.firstName} ${row.lastName}`,
        row.email,
        row.currentStage,
        row.isActive ? 'Activo' : 'Inactivo',
        new Date(row.createdAt).toLocaleDateString('es-ES')
      ];
    case 'documents':
      return [
        row.id,
        row.userName,
        row.type,
        row.status,
        new Date(row.uploadedAt).toLocaleDateString('es-ES'),
        row.reviewedBy || 'N/A'
      ];
    case 'payments':
      return [
        row.id,
        row.userName,
        `${row.currency} ${row.amount.toFixed(2)}`,
        row.paymentMethod,
        row.status,
        new Date(row.paymentDate).toLocaleDateString('es-ES')
      ];
    case 'requests':
      return [
        row.id,
        row.userName,
        row.type,
        row.status,
        new Date(row.createdAt).toLocaleDateString('es-ES'),
        row.completedBy || 'N/A'
      ];
    default:
      return Object.values(row);
  }
}

function getLastColumn(data: any): string {
  if (Array.isArray(data) && data.length > 0) {
    const columnCount = Object.keys(data[0]).length;
    return String.fromCharCode(65 + columnCount - 1); // A, B, C, etc.
  }
  return 'A';
}

// Obtener tipos de reporte disponibles
router.get('/types', authenticateToken, async (req, res) => {
  try {
    const { user } = req as any;
    
    if (user.role !== 'SuperAdministrativos' && user.role !== 'superuser') {
      return res.status(403).json({ error: 'Acceso denegado' });
    }

    const reportTypes = [
      {
        id: 'students',
        name: 'Estudiantes',
        description: 'Reporte completo de estudiantes con estadísticas',
        filters: ['dateFrom', 'dateTo', 'status', 'stage']
      },
      {
        id: 'documents',
        name: 'Documentos',
        description: 'Reporte de validación de documentos',
        filters: ['dateFrom', 'dateTo', 'status', 'type']
      },
      {
        id: 'payments',
        name: 'Pagos',
        description: 'Reporte financiero de pagos y cuotas',
        filters: ['dateFrom', 'dateTo', 'status', 'paymentMethod']
      },
      {
        id: 'requests',
        name: 'Solicitudes',
        description: 'Reporte de solicitudes y su estado',
        filters: ['dateFrom', 'dateTo', 'status', 'type']
      },
      {
        id: 'comprehensive',
        name: 'Comprehensivo',
        description: 'Reporte completo del sistema',
        filters: ['dateFrom', 'dateTo', 'status', 'type']
      }
    ];

    res.json(reportTypes);
  } catch (error) {
    console.error('Error getting report types:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Obtener filtros disponibles para un tipo de reporte
router.get('/filters/:reportType', authenticateToken, async (req, res) => {
  try {
    const { user } = req as any;
    
    if (user.role !== 'SuperAdministrativos' && user.role !== 'superuser') {
      return res.status(403).json({ error: 'Acceso denegado' });
    }

    const { reportType } = req.params;
    
    const filters = await storage.getAvailableFilters(reportType);
    res.json(filters);
  } catch (error) {
    console.error('Error getting filters:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

export default router; 