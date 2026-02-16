import { Response } from 'express';
import { NotificationService } from '../services/notificationService';
import { AuthRequest } from '../middleware/auth';


export const getNotifications = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ success: false, error: 'Non authentifié' });
      return;
    }

    const notifications = await NotificationService.getUserNotifications(userId);
    
    res.json({
      success: true,
      data: notifications
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};


export const markNotificationAsRead = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { notificationId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ success: false, error: 'Non authentifié' });
      return;
    }

    await NotificationService.markAsRead(notificationId, userId);
    
    res.json({
      success: true,
      message: 'Notification marquée comme lue'
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};


export const sendTestNotification = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { type, title, message } = req.body;

    if (!userId) {
      res.status(401).json({ success: false, error: 'Non authentifié' });
      return;
    }

    await NotificationService.createInAppNotification({
      user_id: userId,
      type: type || 'in_app',
      title: title || 'Notification de test',
      message: message || 'Ceci est une notification de test',
      priority: 'medium'
    });

    res.json({
      success: true,
      message: 'Notification envoyée'
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

