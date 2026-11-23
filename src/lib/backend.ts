import { CustomBackendClient } from './apiClient';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || (typeof window !== 'undefined' && window.location.hostname !== 'localhost' ? 'https://api.' + 'credibleartisans.com' : 'http://localhost:3000');
const APP_ID = import.meta.env.VITE_APP_ID || 'prism-app-store';

export const backend = new CustomBackendClient(BACKEND_URL, APP_ID);
