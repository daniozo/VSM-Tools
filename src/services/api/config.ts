/**
 * Configuration API pour VSM-Tools
 */

// Pour Vite, utiliser import.meta.env
const getEnvVar = (key: string, defaultValue: string): string => {
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    return (import.meta.env as Record<string, string>)[key] || defaultValue;
  }
  return defaultValue;
};

export const API_CONFIG = {
  baseUrl: getEnvVar('VITE_API_URL', 'http://localhost:3001'),
  wsUrl: getEnvVar('VITE_WS_URL', 'http://localhost:3001'),
  endpoints: {
    health: '/api/health',
    projects: '/api/projects',
    diagrams: '/api/diagrams',
  }
} as const;
