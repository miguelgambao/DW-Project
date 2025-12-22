// Configuration for API endpoints
// Copy this file to config.js and update the settings for your environment
// Set isDevelopment to true for local development, false for production
const isDevelopment = false;

export const API_CONFIG = {
    BASE_URL: isDevelopment ? 'http://localhost:8080' : 'http://10.17.0.28:8080'
};
