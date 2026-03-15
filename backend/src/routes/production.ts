import express from 'express';
import {
  getProductionPlanning,
  createProductionOrder,
  recordProduction,
  getProductionKPIs,
  getFormulas,
  createFormula,
  getDowntimes,
  recordEnergyData
} from '../controllers/productionController';
import { authenticate } from '../middleware/auth';

const router = express.Router();

// Toutes les routes production nécessitent une authentification
router.use(authenticate);

/**
 * @swagger
 * /production/planning:
 *   get:
 *     summary: Récupérer le planning de production
 *     description: Retourne la liste des ordres de production planifiés
 *     tags: [Production]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Date de début (YYYY-MM-DD)
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Date de fin (YYYY-MM-DD)
 *     responses:
 *       200:
 *         description: Planning récupéré avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/ProductionOrder'
 *       401:
 *         description: Non authentifié
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/planning', getProductionPlanning);

/**
 * @swagger
 * /production/orders:
 *   post:
 *     summary: Créer un ordre de production
 *     description: Crée un nouvel ordre de production
 *     tags: [Production]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - product_id
 *               - quantity_planned
 *               - scheduled_date
 *             properties:
 *               product_id:
 *                 type: string
 *               quantity_planned:
 *                 type: number
 *               scheduled_date:
 *                 type: string
 *                 format: date
 *     responses:
 *       201:
 *         description: Ordre de production créé avec succès
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       400:
 *         description: Données invalides
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/orders', createProductionOrder);

/**
 * @swagger
 * /production/record:
 *   post:
 *     summary: Enregistrer une production
 *     description: Enregistre les données de production réelle
 *     tags: [Production]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - order_id
 *               - actual_quantity
 *             properties:
 *               order_id:
 *                 type: string
 *               actual_quantity:
 *                 type: number
 *               production_date:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       200:
 *         description: Production enregistrée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 */
router.post('/record', recordProduction);

/**
 * @swagger
 * /production/kpis:
 *   get:
 *     summary: Récupérer les KPIs de production
 *     description: Retourne les indicateurs de performance de production
 *     tags: [Production]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Date de début (YYYY-MM-DD)
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Date de fin (YYYY-MM-DD)
 *     responses:
 *       200:
 *         description: KPIs récupérés avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     production_rate:
 *                       type: number
 *                     efficiency:
 *                       type: number
 *                     energy_consumption:
 *                       type: number
 */
router.get('/kpis', getProductionKPIs);

/**
 * @swagger
 * /production/formulas:
 *   get:
 *     summary: Récupérer les formules de production
 *     description: Retourne la liste des formules de production
 *     tags: [Production]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Formules récupérées avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       name:
 *                         type: string
 *                       version:
 *                         type: string
 *                       is_active:
 *                         type: boolean
 */
router.get('/formulas', getFormulas);

/**
 * @swagger
 * /production/formulas:
 *   post:
 *     summary: Créer une formule de production
 *     description: Crée une nouvelle formule de production
 *     tags: [Production]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - product_id
 *               - name
 *               - version
 *             properties:
 *               product_id:
 *                 type: string
 *               name:
 *                 type: string
 *               version:
 *                 type: string
 *               is_active:
 *                 type: boolean
 *                 default: true
 *     responses:
 *       201:
 *         description: Formule créée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 */
router.post('/formulas', createFormula);

// Routes additionnelles (temps d'arrêt, énergie)
router.get('/downtimes', getDowntimes);
router.post('/energy', recordEnergyData);

export default router;



