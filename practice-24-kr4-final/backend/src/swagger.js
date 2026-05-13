const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Cars API (KR4 unified)',
      version: '1.0.0',
      description: 'REST API для каталога автомобилей: Auth + RBAC + PostgreSQL + Redis cache. Запросы балансируются через Nginx между 3 инстансами.'
    },
    servers: [
      { url: '/', description: 'Через Nginx (балансировка)' }
    ],
    components: {
      securitySchemes: {
        bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' }
      },
      schemas: {
        Car: {
          type: 'object',
          properties: {
            id:        { type: 'integer', example: 1 },
            brand:     { type: 'string',  example: 'BMW' },
            model:     { type: 'string',  example: 'X5' },
            year:      { type: 'integer', example: 2023, minimum: 1900, maximum: 2100 },
            price:     { type: 'number',  example: 7500000, minimum: 0 },
            vin:       { type: 'string',  nullable: true, example: 'WBA12345678901234' },
            created_at:{ type: 'string',  format: 'date-time' },
            updated_at:{ type: 'string',  format: 'date-time' }
          }
        },
        User: {
          type: 'object',
          properties: {
            id:         { type: 'string',  example: 'abc123' },
            email:      { type: 'string',  example: 'admin@cars.local' },
            first_name: { type: 'string',  example: 'Admin' },
            last_name:  { type: 'string',  example: 'Demo' },
            role:       { type: 'string',  enum: ['user','seller','admin'] },
            blocked:    { type: 'boolean', example: false }
          }
        },
        CachedListResponse: {
          type: 'object',
          properties: {
            source: { type: 'string', enum: ['cache', 'server'], description: 'Откуда пришли данные' },
            server: { type: 'string', example: 'cars-backend-2', description: 'Какой backend-инстанс ответил' },
            data:   { type: 'array', items: { type: 'object' } }
          }
        },
        AuthTokens: {
          type: 'object',
          properties: {
            accessToken:  { type: 'string', description: 'JWT, 15 минут' },
            refreshToken: { type: 'string', description: 'JWT, 7 дней' }
          }
        }
      }
    }
  },
  apis: ['./src/routes/*.js']
};

module.exports = swaggerJsdoc(options);
