export default () => ({
  port: parseInt(process.env.PORT || '3333', 10),
  database: {
    url: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/os_melhores_da_cidade?schema=public',
  },
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET || 'jwt-access-super-secret-key-change-in-prod',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'jwt-refresh-super-secret-key-change-in-prod',
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  },
});

