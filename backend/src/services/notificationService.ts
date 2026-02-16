import nodemailer from 'nodemailer';
import { query } from '../config/database';

interface NotificationData {
  user_id?: string;
  type: 'email' | 'in_app' | 'sms';
  title: string;
  message: string;
  priority?: 'low' | 'medium' | 'high' | 'critical';
  action_url?: string;
}

export class NotificationService {
  private static emailTransporter: nodemailer.Transporter | null = null;

  
  static initializeEmail() {
    if (!this.emailTransporter) {
      this.emailTransporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: false,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASSWORD,
        },
      });
    }
    return this.emailTransporter;
  }

  
  static async sendEmail(data: NotificationData, recipientEmail: string): Promise<boolean> {
    try {
      const transporter = this.initializeEmail();
      
      if (!transporter) {
        console.error('Email transporter not configured');
        return false;
      }

      await transporter.sendMail({
        from: process.env.SMTP_FROM || 'noreply@malao.sn',
        to: recipientEmail,
        subject: data.title,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background-color: #F47C20; color: white; padding: 20px; text-align: center;">
              <h1>MALAO Production System</h1>
            </div>
            <div style="padding: 20px; background-color: #f9f9f9;">
              <h2>${data.title}</h2>
              <p>${data.message}</p>
              ${data.action_url ? `<a href="${data.action_url}" style="display: inline-block; margin-top: 20px; padding: 10px 20px; background-color: #F47C20; color: white; text-decoration: none; border-radius: 5px;">Voir les détails</a>` : ''}
            </div>
            <div style="background-color: #333; color: white; padding: 10px; text-align: center; font-size: 12px;">
              <p>MALAO COMPANY SARL - Linguère, Sénégal</p>
            </div>
          </div>
        `,
      });

      return true;
    } catch (error) {
      console.error('Erreur envoi email:', error);
      return false;
    }
  }

  /**
   * Crée une notification in-app
   */
  static async createInAppNotification(data: NotificationData): Promise<void> {
    try {
      await query(
        `INSERT INTO notifications (user_id, type, title, message, priority, action_url, is_read, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, false, NOW())`,
        [data.user_id, 'in_app', data.title, data.message, data.priority || 'medium', data.action_url]
      );
    } catch (error) {
      console.error('Erreur création notification in-app:', error);
    }
  }

  /**
   * Envoie une alerte automatique (stock bas, non-conformité, etc.)
   */
  static async sendAlert(type: string, data: any): Promise<void> {
    try {
      // Récupérer les utilisateurs concernés selon le type d'alerte
      let users: any[] = [];

      switch (type) {
        case 'low_stock':
          users = await query(
            `SELECT id, email, first_name, last_name FROM users 
             WHERE role IN ('admin', 'inventory_manager', 'production_manager')`
          ).then(r => r.rows);
          break;
        case 'non_conformity':
          users = await query(
            `SELECT id, email, first_name, last_name FROM users 
             WHERE role IN ('admin', 'quality_manager')`
          ).then(r => r.rows);
          break;
        case 'production_stop':
          users = await query(
            `SELECT id, email, first_name, last_name FROM users 
             WHERE role IN ('admin', 'production_manager')`
          ).then(r => r.rows);
          break;
        default:
          users = await query(
            `SELECT id, email, first_name, last_name FROM users WHERE role = 'admin'`
          ).then(r => r.rows);
      }

      // Créer les notifications
      for (const user of users) {
        const notification: NotificationData = {
          user_id: user.id,
          type: 'in_app',
          title: `Alerte: ${type}`,
          message: this.getAlertMessage(type, data),
          priority: 'high',
        };

        await this.createInAppNotification(notification);

        // Envoyer email si configuré
        if (user.email && process.env.SMTP_USER) {
          await this.sendEmail(notification, user.email);
        }
      }
    } catch (error) {
      console.error('Erreur envoi alerte:', error);
    }
  }

  /**
   * Génère le message d'alerte selon le type
   */
  private static getAlertMessage(type: string, data: any): string {
    switch (type) {
      case 'low_stock':
        return `Le stock de ${data.item_name} est en dessous du seuil minimum (${data.current_stock} ${data.unit}).`;
      case 'non_conformity':
        return `Une non-conformité a été détectée pour le produit ${data.product_name}.`;
      case 'production_stop':
        return `Arrêt de production détecté: ${data.reason} (Durée: ${data.duration} minutes).`;
      default:
        return 'Une alerte a été déclenchée.';
    }
  }

  /**
   * Récupère les notifications d'un utilisateur
   */
  static async getUserNotifications(userId: string, limit: number = 50): Promise<any[]> {
    try {
      const result = await query(
        `SELECT * FROM notifications 
         WHERE user_id = $1 OR user_id IS NULL
         ORDER BY created_at DESC 
         LIMIT $2`,
        [userId, limit]
      );
      return result.rows;
    } catch (error) {
      console.error('Erreur récupération notifications:', error);
      return [];
    }
  }

  /**
   * Marque une notification comme lue
   */
  static async markAsRead(notificationId: string, userId: string): Promise<void> {
    try {
      await query(
        `UPDATE notifications SET is_read = true, read_at = NOW() 
         WHERE id = $1 AND user_id = $2`,
        [notificationId, userId]
      );
    } catch (error) {
      console.error('Erreur marquage notification:', error);
    }
  }
}

