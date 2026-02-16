import PDFDocument from 'pdfkit';

interface QuoteData {
  quote_number: string;
  client_name: string;
  client_address?: string;
  date: string;
  valid_until: string;
  items: Array<{
    product_name: string;
    quantity: number;
    unit_price: number;
    total: number;
  }>;
  subtotal: number;
  tax?: number;
  total: number;
  notes?: string;
}

export class PDFService {
  
  static async generateQuotePDF(data: QuoteData): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ margin: 50 });
        const buffers: Buffer[] = [];

        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => {
          const pdfBuffer = Buffer.concat(buffers);
          resolve(pdfBuffer);
        });
        doc.on('error', reject);

        
        doc.fontSize(20).text('MALAO COMPANY SARL', { align: 'center' });
        doc.fontSize(12).text('Système de Production', { align: 'center' });
        doc.moveDown();

        
        doc.fontSize(18).text('DEVIS', { align: 'center', underline: true });
        doc.moveDown();

        
        doc.fontSize(10);
        doc.text(`N° Devis: ${data.quote_number}`, 50, 150);
        doc.text(`Date: ${new Date(data.date).toLocaleDateString('fr-FR')}`, 50, 165);
        doc.text(`Valide jusqu'au: ${new Date(data.valid_until).toLocaleDateString('fr-FR')}`, 50, 180);

        
        doc.text('Client:', 350, 150);
        doc.text(data.client_name, 350, 165);
        if (data.client_address) {
          doc.text(data.client_address, 350, 180);
        }

        doc.moveDown(3);

        
        let y = 250;
        doc.fontSize(12).text('Articles', 50, y);
        y += 20;

        
        doc.fontSize(10);
        doc.text('Produit', 50, y);
        doc.text('Quantité', 250, y);
        doc.text('Prix unitaire', 350, y);
        doc.text('Total', 450, y);
        y += 15;

        
        doc.moveTo(50, y).lineTo(550, y).stroke();
        y += 10;

        
        data.items.forEach((item) => {
          doc.text(item.product_name, 50, y);
          doc.text(item.quantity.toString(), 250, y);
          doc.text(`${item.unit_price.toLocaleString('fr-FR')} FCFA`, 350, y);
          doc.text(`${item.total.toLocaleString('fr-FR')} FCFA`, 450, y);
          y += 20;
        });

        y += 10;
        doc.moveTo(50, y).lineTo(550, y).stroke();
        y += 20;

        
        doc.text('Sous-total:', 350, y);
        doc.text(`${data.subtotal.toLocaleString('fr-FR')} FCFA`, 450, y);
        y += 20;

        if (data.tax) {
          doc.text('TVA:', 350, y);
          doc.text(`${data.tax.toLocaleString('fr-FR')} FCFA`, 450, y);
          y += 20;
        }

        doc.fontSize(12).font('Helvetica-Bold');
        doc.text('TOTAL:', 350, y);
        doc.text(`${data.total.toLocaleString('fr-FR')} FCFA`, 450, y);
        doc.font('Helvetica');

        
        if (data.notes) {
          y += 30;
          doc.fontSize(10).text('Notes:', 50, y);
          y += 15;
          doc.text(data.notes, 50, y, { width: 500 });
        }

        
        const pageHeight = doc.page.height;
        doc.fontSize(8)
          .text('MALAO COMPANY SARL - Linguère, Région de Louga, Sénégal', 50, pageHeight - 50, { align: 'center' })
          .text('Tél: +221 77 220 85 85 | Email: contact@malaosarl.sn', 50, pageHeight - 35, { align: 'center' });

        doc.end();
      } catch (error) {
        reject(error);
      }
    });
  }

  
  static async generateProductionReportPDF(data: any): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ margin: 50 });
        const buffers: Buffer[] = [];

        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => {
          const pdfBuffer = Buffer.concat(buffers);
          resolve(pdfBuffer);
        });
        doc.on('error', reject);

        
        doc.fontSize(20).text('RAPPORT DE PRODUCTION', { align: 'center', underline: true });
        doc.moveDown();

        doc.fontSize(10);
        doc.text(`Période: ${data.period}`, 50, 150);
        doc.text(`Date de génération: ${new Date().toLocaleDateString('fr-FR')}`, 50, 165);

        doc.moveDown(2);

        
        doc.fontSize(14).text('Indicateurs Clés', 50, 200);
        doc.fontSize(10);
        let y = 230;
        if (data.production) {
          doc.text(`Production totale: ${data.production.total_produced || 0} tonnes`, 50, y);
          y += 20;
          doc.text(`Taux d'atteinte: ${data.production.achievement_rate || 0}%`, 50, y);
          y += 20;
        }
        if (data.quality) {
          doc.text(`Taux de conformité: ${data.quality.conformityRate || 0}%`, 50, y);
          y += 20;
        }

        
        const pageHeight = doc.page.height;
        doc.fontSize(8)
          .text('MALAO COMPANY SARL - Système de Gestion de Production', 50, pageHeight - 50, { align: 'center' });

        doc.end();
      } catch (error) {
        reject(error);
      }
    });
  }
}

