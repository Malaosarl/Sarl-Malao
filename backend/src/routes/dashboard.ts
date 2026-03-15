import express from 'express';
import { getDashboardData } from '../controllers/dashboardController';
import { authenticate } from '../middleware/auth';

const router = express.Router();

/**
 * @swagger
 * /dashboard:
 *   get:
 *     summary: Récupérer les données du tableau de bord
 *     description: Retourne les KPIs principaux pour le dashboard (production, qualité, commandes, stocks)
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Données du dashboard récupérées avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/DashboardData'
 *       401:
 *         description: Non authentifié
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Erreur serveur
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/', authenticate, getDashboardData);

export default router;

