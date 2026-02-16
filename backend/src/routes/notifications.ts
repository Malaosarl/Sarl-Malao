import express from 'express';
import { getNotifications, markNotificationAsRead, sendTestNotification } from '../controllers/notificationController';
import { authenticate } from '../middleware/auth';

const router = express.Router();

router.use(authenticate);

router.get('/', getNotifications);
router.post('/:notificationId/read', markNotificationAsRead);
router.post('/test', sendTestNotification);

export default router;

