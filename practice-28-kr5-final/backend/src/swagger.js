const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Car Service API (KR5 Kanban)',
      version: '1.0.0',
      description: 'REST API для автосервиса (Kanban-доска): Auth + RBAC + PostgreSQL + Redis cache. Запросы балансируются через Nginx между 3 инстансами.'
    },
    servers: [
      { url: '/', description: 'Через Nginx (балансировка)' }
    ],
    components: {
      securitySchemes: {
        bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' }
      },
      schemas: {
        Task: {
          type: 'object',
          properties: {
            id:             { type: 'integer', example: 1 },
            title:          { type: 'string',  example: 'Замена моторного масла' },
            description:    { type: 'string',  nullable: true, example: 'Плановое ТО, замена масла 5W-30' },
            status:         { type: 'string',  enum: ['todo', 'in-progress', 'done'], example: 'todo' },
            car_model:      { type: 'string',  example: 'BMW X5' },
            price_estimate: { type: 'number',  example: 8500, minimum: 0 },
            assignee_id:    { type: 'string',  nullable: true, example: 'abc123' },
            reminder_time:  { type: 'string',  format: 'date-time', nullable: true },
            created_at:     { type: 'string',  format: 'date-time' },
            updated_at:     { type: 'string',  format: 'date-time' }
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
