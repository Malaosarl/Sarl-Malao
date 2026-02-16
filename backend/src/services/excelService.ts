import ExcelJS from 'exceljs';

export class ExcelService {
  
  static async exportProductionData(data: any[]): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Production');

    
    worksheet.columns = [
      { header: 'Date', key: 'date', width: 15 },
      { header: 'Produit', key: 'product', width: 30 },
      { header: 'Quantité Planifiée', key: 'planned', width: 18 },
      { header: 'Quantité Produite', key: 'produced', width: 18 },
      { header: 'Taux d\'atteinte', key: 'rate', width: 15 },
      { header: 'Statut', key: 'status', width: 15 },
    ];

    
    data.forEach((item) => {
      worksheet.addRow({
        date: new Date(item.production_date || item.date).toLocaleDateString('fr-FR'),
        product: item.product_name || 'N/A',
        planned: item.quantity_planned || 0,
        produced: item.quantity_produced || 0,
        rate: item.achievement_rate ? `${item.achievement_rate}%` : '-',
        status: item.status || '-',
      });
    });

    
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFF47C20' }
    };

    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }

  
  static async exportInventoryData(data: any[]): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Stocks');

    worksheet.columns = [
      { header: 'Item', key: 'name', width: 30 },
      { header: 'Type', key: 'type', width: 15 },
      { header: 'Stock Actuel', key: 'stock', width: 15 },
      { header: 'Seuil Min', key: 'min', width: 12 },
      { header: 'Seuil Max', key: 'max', width: 12 },
      { header: 'Unité', key: 'unit', width: 10 },
      { header: 'Statut', key: 'status', width: 15 },
    ];

    data.forEach((item) => {
      worksheet.addRow({
        name: item.name,
        type: item.type === 'raw_material' ? 'Matière première' : 'Produit fini',
        stock: item.current_stock || 0,
        min: item.min_stock_level || 0,
        max: item.max_stock_level || 0,
        unit: item.unit || 'kg',
        status: item.is_low_stock ? 'Stock bas' : 'OK',
      });
    });

    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF4CAF50' }
    };

    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }

  
  static async exportSalesData(data: any[]): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Ventes');

    worksheet.columns = [
      { header: 'N° Commande', key: 'order_number', width: 20 },
      { header: 'Client', key: 'client', width: 30 },
      { header: 'Date', key: 'date', width: 15 },
      { header: 'Montant', key: 'amount', width: 15 },
      { header: 'Statut', key: 'status', width: 15 },
    ];

    data.forEach((item) => {
      worksheet.addRow({
        order_number: item.order_number || item.id.substring(0, 8),
        client: item.client_name || 'N/A',
        date: new Date(item.order_date || item.created_at).toLocaleDateString('fr-FR'),
        amount: item.total_amount || 0,
        status: item.status || '-',
      });
    });

    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF2196F3' }
    };

    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }
}

