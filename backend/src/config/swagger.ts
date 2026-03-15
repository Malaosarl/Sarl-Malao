import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'MALAO Production System API',
      version: '2.0.0',
      description: 'API REST pour le système de gestion et de suivi de production MALAO Company SARL',
      contact: {
        name: 'MALAO Company SARL',
        email: 'contact@malaosarl.sn',
        url: 'https://www.malao.sn'
      }
    },
    servers: [
      {
        url: 'http://localhost:5000/api/v1',
        description: 'Serveur de développement'
      },
      {
        url: 'https://api.malao.sn/api/v1',
        description: 'Serveur de production'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            email: { type: 'string', format: 'email' },
            name: { type: 'string' },
            role: { type: 'string', enum: ['admin', 'manager', 'operator', 'viewer'] },
            created_at: { type: 'string', format: 'date-time' },
            updated_at: { type: 'string', format: 'date-time' }
          }
        },
        ProductionOrder: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            product_id: { type: 'string' },
            product_name: { type: 'string' },
            quantity_planned: { type: 'number' },
            quantity_produced: { type: 'number' },
            status: { type: 'string', enum: ['planned', 'in_progress', 'completed', 'cancelled'] },
            scheduled_date: { type: 'string', format: 'date' },
            production_date: { type: 'string', format: 'date-time' },
            created_at: { type: 'string', format: 'date-time' }
          }
        },
        InventoryItem: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            name: { type: 'string' },
            type: { type: 'string', enum: ['raw_material', 'product'] },
            current_stock: { type: 'number' },
            min_stock_level: { type: 'number' },
            max_stock_level: { type: 'number' },
            unit: { type: 'string' },
            is_low_stock: { type: 'boolean' },
            stock_percentage: { type: 'number' }
          }
        },
        DashboardData: {
          type: 'object',
          properties: {
            production: {
              type: 'object',
              properties: {
                today: { type: 'number' },
                planned: { type: 'number' },
                rate: { type: 'number' },
                unit: { type: 'string' }
              }
            },
            quality: {
              type: 'object',
              properties: {
                conformityRate: { type: 'number' },
                unit: { type: 'string' }
              }
            },
            orders: {
              type: 'object',
              properties: {
                pending: { type: 'number' },
                unit: { type: 'string' }
              }
            },
            stock: {
              type: 'object',
              properties: {
                total: { type: 'number' },
                unit: { type: 'string' }
              }
            }
          }
        },
        Error: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            error: {
              type: 'object',
              properties: {
                message: { type: 'string' },
                code: { type: 'string' }
              }
            }
          }
        },
        Success: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            data: { type: 'object' },
            message: { type: 'string' }
          }
        }
      }
    },
    security: [
      {
        bearerAuth: []
      }
    ]
  },
  apis: ['./src/routes/*.ts', './src/controllers/*.ts']
};

export const specs = swaggerJsdoc(options);
