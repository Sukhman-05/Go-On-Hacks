require('dotenv').config();

module.exports = {
  jwtSecret: process.env.JWT_SECRET || 'your-super-secret-jwt-key',
  jwtExpiration: process.env.JWT_EXPIRATION || '7d',
  bcryptSaltRounds: 10
};

