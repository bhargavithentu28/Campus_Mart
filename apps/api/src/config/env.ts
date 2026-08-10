import dotenv from 'dotenv';
dotenv.config();

export function validateEnv() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (isProduction) {
    const requiredVars = ['DATABASE_URL', 'JWT_SECRET', 'JWT_REFRESH_SECRET'];
    const missing = requiredVars.filter(v => !process.env[v]);

    if (missing.length > 0) {
      console.error('CRITICAL PRODUCTION CONFIGURATION ERROR: Missing required environment variables:', missing.join(', '));
      throw new Error(`Production environment startup failed. Missing variables: ${missing.join(', ')}`);
    }
  }
}

export const JWT_SECRET = process.env.JWT_SECRET || (process.env.NODE_ENV !== 'production' ? 'dev_jwt_secret_campusmart_2026' : undefined)!;
export const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || (process.env.NODE_ENV !== 'production' ? 'dev_jwt_refresh_secret_campusmart_2026' : undefined)!;
