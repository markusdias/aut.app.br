/**
 * Feature Flags
 */
export const ENABLE_WEBHOOK_LOGGING = process.env.ENABLE_WEBHOOK_LOGGING === 'true';

/**
 * Configurações de Ambiente
 */
export const IS_PRODUCTION = process.env.NODE_ENV === 'production';
export const IS_DEVELOPMENT = process.env.NODE_ENV === 'development';
export const IS_TEST = process.env.NODE_ENV === 'test'; 