import { Router } from 'express';
import { eq } from 'drizzle-orm';
import { profiles, documents, requests } from '@shared/schema';
import db from '../db';
import { requireAuth } from '../middleware/auth';

const router = Router();

// GET /api/profiles - Obtener todos los perfiles (admin)
router.get('/', requireAuth, async (req, res) => {
  try {
    // Obtener todos los perfiles
    const allProfiles = await db.select().from(profiles);

    // Obtener conteos de documentos por usuario
    const documentCounts = await db
      .select({
        userId: documents.userId,
        count: sql`count(*)::int`
      })
      .from(documents)
      .groupBy(documents.userId);

    // Obtener conteos de solicitudes pendientes por usuario
    const requestCounts = await db
      .select({
        userId: requests.userId,
        count: sql`count(*)::int`
      })
      .from(requests)
      .where(sql`status IN ('pendiente', 'en_proceso')`)
      .groupBy(requests.userId);

    // Combinar la información
    const profilesWithCounts = allProfiles.map(profile => {
      const docCount = documentCounts.find(d => d.userId === profile.id)?.count || 0;
      const reqCount = requestCounts.find(r => r.userId === profile.id)?.count || 0;

      return {
        ...profile,
        documentCount: docCount,
        pendingRequestCount: reqCount
      };
    });

    res.json(profilesWithCounts);
  } catch (error) {
    console.error('Error al obtener perfiles:', error);
    res.status(500).json({ error: 'Error al obtener perfiles' });
  }
});

// GET /api/profiles/:id - Obtener un perfil específico
router.get('/:id', requireAuth, async (req, res) => {
  try {
    const id = req.params.id;

    // Obtener el perfil
    const [profile] = await db.select().from(profiles).where(eq(profiles.id, id));

    if (!profile) {
      return res.status(404).json({ error: 'Perfil no encontrado' });
    }

    // Obtener conteo de documentos
    const [{ count: documentCount }] = await db
      .select({
        count: sql`count(*)::int`
      })
      .from(documents)
      .where(eq(documents.userId, id));

    // Obtener conteo de solicitudes pendientes
    const [{ count: pendingRequestCount }] = await db
      .select({
        count: sql`count(*)::int`
      })
      .from(requests)
      .where(eq(requests.userId, id))
      .where(sql`status IN ('pendiente', 'en_proceso')`);

    res.json({
      ...profile,
      documentCount,
      pendingRequestCount
    });
  } catch (error) {
    console.error('Error al obtener perfil:', error);
    res.status(500).json({ error: 'Error al obtener perfil' });
  }
});

// PUT /api/profiles/:id - Actualizar un perfil
router.put('/:id', requireAuth, async (req, res) => {
  try {
    const id = req.params.id;
    const updates = req.body;

    // Verificar que el perfil existe
    const [existingProfile] = await db.select().from(profiles).where(eq(profiles.id, id));
    if (!existingProfile) {
      return res.status(404).json({ error: 'Perfil no encontrado' });
    }

    // Actualizar el perfil
    const [updatedProfile] = await db
      .update(profiles)
      .set(updates)
      .where(eq(profiles.id, id))
      .returning();

    res.json(updatedProfile);
  } catch (error) {
    console.error('Error al actualizar perfil:', error);
    res.status(500).json({ error: 'Error al actualizar perfil' });
  }
});

export default router; 