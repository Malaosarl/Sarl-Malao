import { Request, Response } from 'express';
import { NotificationService } from '../services/notificationService';

interface ContactFormData {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
}


export const submitContactForm = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, phone, subject, message }: ContactFormData = req.body;

    
    if (!name || !email || !subject || !message) {
      res.status(400).json({
        success: false,
        error: 'Tous les champs obligatoires doivent être remplis'
      });
      return;
    }

    
    if (process.env.SMTP_USER) {
      await NotificationService.sendEmail(
        {
          type: 'email',
          title: `Nouveau message de contact: ${subject}`,
          message: `
            <p><strong>De:</strong> ${name} (${email})</p>
            ${phone ? `<p><strong>Téléphone:</strong> ${phone}</p>` : ''}
            <p><strong>Sujet:</strong> ${subject}</p>
            <p><strong>Message:</strong></p>
            <p>${message.replace(/\n/g, '<br>')}</p>
          `,
          priority: 'medium'
        },
        process.env.CONTACT_EMAIL || 'contact@malaosarl.sn'
      );
    }

    
    await NotificationService.createInAppNotification({
      type: 'in_app',
      title: `Nouveau message de contact`,
      message: `${name} a envoyé un message: ${subject}`,
      priority: 'medium',
      action_url: `/app/contact`
    });

    res.json({
      success: true,
      message: 'Votre message a été envoyé avec succès. Nous vous contacterons bientôt.'
    });
  } catch (error: any) {
    console.error('Erreur traitement formulaire contact:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de l\'envoi du message. Veuillez réessayer.'
    });
  }
};

