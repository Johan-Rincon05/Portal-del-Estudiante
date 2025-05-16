import { Router } from 'express';
import { storage } from '../storage';
import { eq } from 'drizzle-orm';
import { users, profiles, documents } from '@shared/schema';
import { db } from "../db";

const router = Router();

// Middleware para verificar rol de administrador
const requireAdmin = (req, res, next) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: 'No autenticado' });
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'No autorizado' });
  }

  next();
};

// Obtener todos los estudiantes con sus documentos
router.get('/students', requireAdmin, async (req, res) => {
  try {
    // Obtener estudiantes (usuarios con rol 'estudiante' y sus perfiles)
    const students = await storage.getAllStudentsWithDocuments();
    res.json(students);
  } catch (error) {
    console.error('Error al obtener estudiantes:', error);
    res.status(500).json({ error: 'Error al obtener los estudiantes' });
  }
});

// Obtener empleados
router.get("/employees", async (req, res) => {
  try {
    const employees = await db.query("SELECT * FROM employees");
    res.json(employees);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener los empleados" });
  }
});

// Crear empleado
router.post("/employees", async (req, res) => {
  try {
    const {
      name,
      document_number,
      birth_date,
      cell_phone,
      phone,
      address,
      locality,
      email,
      blood_type,
      eps,
      pension_fund,
      severance_fund,
      arl,
      compensation_fund,
      position,
      emergency_contact,
      emergency_contact_relationship,
      emergency_contact_phone,
      children,
      contract_start_date,
      contract_end_date,
      salary,
      payment_entity,
      account_number,
      is_active,
      arl_affiliation_date,
      arl_disaffiliation_date,
      eps_affiliation_date,
      eps_disaffiliation_date,
      compensation_fund_affiliation_date,
      compensation_fund_disaffiliation_date,
    } = req.body;

    const result = await db.query(
      `INSERT INTO employees (
        name, document_number, birth_date, cell_phone, phone, address, locality, email, blood_type, eps, pension_fund, severance_fund, arl, compensation_fund, position, emergency_contact, emergency_contact_relationship, emergency_contact_phone, children, contract_start_date, contract_end_date, salary, payment_entity, account_number, is_active, arl_affiliation_date, arl_disaffiliation_date, eps_affiliation_date, eps_disaffiliation_date, compensation_fund_affiliation_date, compensation_fund_disaffiliation_date
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, $31, $32) RETURNING *`,
      [
        name,
        document_number,
        birth_date,
        cell_phone,
        phone,
        address,
        locality,
        email,
        blood_type,
        eps,
        pension_fund,
        severance_fund,
        arl,
        compensation_fund,
        position,
        emergency_contact,
        emergency_contact_relationship,
        emergency_contact_phone,
        children,
        contract_start_date,
        contract_end_date,
        salary,
        payment_entity,
        account_number,
        is_active,
        arl_affiliation_date,
        arl_disaffiliation_date,
        eps_affiliation_date,
        eps_disaffiliation_date,
        compensation_fund_affiliation_date,
        compensation_fund_disaffiliation_date,
      ]
    );
    res.status(201).json(result[0]);
  } catch (error) {
    res.status(500).json({ error: "Error al crear el empleado" });
  }
});

// Editar empleado
router.put("/employees/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      document_number,
      birth_date,
      cell_phone,
      phone,
      address,
      locality,
      email,
      blood_type,
      eps,
      pension_fund,
      severance_fund,
      arl,
      compensation_fund,
      position,
      emergency_contact,
      emergency_contact_relationship,
      emergency_contact_phone,
      children,
      contract_start_date,
      contract_end_date,
      salary,
      payment_entity,
      account_number,
      is_active,
      arl_affiliation_date,
      arl_disaffiliation_date,
      eps_affiliation_date,
      eps_disaffiliation_date,
      compensation_fund_affiliation_date,
      compensation_fund_disaffiliation_date,
    } = req.body;

    const result = await db.query(
      `UPDATE employees SET
        name = $1,
        document_number = $2,
        birth_date = $3,
        cell_phone = $4,
        phone = $5,
        address = $6,
        locality = $7,
        email = $8,
        blood_type = $9,
        eps = $10,
        pension_fund = $11,
        severance_fund = $12,
        arl = $13,
        compensation_fund = $14,
        position = $15,
        emergency_contact = $16,
        emergency_contact_relationship = $17,
        emergency_contact_phone = $18,
        children = $19,
        contract_start_date = $20,
        contract_end_date = $21,
        salary = $22,
        payment_entity = $23,
        account_number = $24,
        is_active = $25,
        arl_affiliation_date = $26,
        arl_disaffiliation_date = $27,
        eps_affiliation_date = $28,
        eps_disaffiliation_date = $29,
        compensation_fund_affiliation_date = $30,
        compensation_fund_disaffiliation_date = $31,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $32 RETURNING *`,
      [
        name,
        document_number,
        birth_date,
        cell_phone,
        phone,
        address,
        locality,
        email,
        blood_type,
        eps,
        pension_fund,
        severance_fund,
        arl,
        compensation_fund,
        position,
        emergency_contact,
        emergency_contact_relationship,
        emergency_contact_phone,
        children,
        contract_start_date,
        contract_end_date,
        salary,
        payment_entity,
        account_number,
        is_active,
        arl_affiliation_date,
        arl_disaffiliation_date,
        eps_affiliation_date,
        eps_disaffiliation_date,
        compensation_fund_affiliation_date,
        compensation_fund_disaffiliation_date,
        id,
      ]
    );
    if (result.length === 0) {
      return res.status(404).json({ error: "Empleado no encontrado" });
    }
    res.json(result[0]);
  } catch (error) {
    res.status(500).json({ error: "Error al actualizar el empleado" });
  }
});

// Eliminar empleado
router.delete("/employees/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query("DELETE FROM employees WHERE id = $1 RETURNING *", [id]);
    if (result.length === 0) {
      return res.status(404).json({ error: "Empleado no encontrado" });
    }
    res.json({ message: "Empleado eliminado correctamente" });
  } catch (error) {
    res.status(500).json({ error: "Error al eliminar el empleado" });
  }
});

export default router; 