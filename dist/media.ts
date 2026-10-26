import orbitHero from '../assets/images/app_orbit_hero_1791511390312.jpg';
import luminaShowcase from '../assets/images/app_lumina_showcase_1791511401157.jpg';
import aetherSound from '../assets/images/app_aether_sound_1791511411872.jpg';
import zenithFitness from '../assets/images/app_zenith_fitness_1791511423835.jpg';
import adinkraStudio from '../assets/images/app_adinkra_studio_1791803015774.jpg';

export const APP_MEDIA_ASSETS = {
  orbitHero,
  luminaShowcase,
  aetherSound,
  zenithFitness,
  adinkraStudio,
};

// Maps any legacy or static string reference to the bundled, hashed production asset URL
export function resolveAppMedia(url: string | undefined, fallbackKey: keyof typeof APP_MEDIA_ASSETS = 'orbitHero'): string {
  if (!url) return APP_MEDIA_ASSETS[fallbackKey];

  // If already a web or data URL, return it
  if (url.startsWith('data:') || url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }

  // Map known filenames to Vite bundled assets
  if (url.includes('adinkra')) return APP_MEDIA_ASSETS.adinkraStudio;
  if (url.includes('lumina')) return APP_MEDIA_ASSETS.luminaShowcase;
  if (url.includes('aether') || url.includes('sound')) return APP_MEDIA_ASSETS.aetherSound;
  if (url.includes('zenith') || url.includes('fitness')) return APP_MEDIA_ASSETS.zenithFitness;
  if (url.includes('orbit')) return APP_MEDIA_ASSETS.orbitHero;

  // Default to bundled orbitHero asset
  return APP_MEDIA_ASSETS[fallbackKey] || APP_MEDIA_ASSETS.orbitHero;
}

// Fallback high-tech placeholder generator if an image fails to load in browser
export function getAppCategoryPlaceholder(category: string = 'General', name: string = 'App'): string {
  const label = encodeURIComponent(name);
  const cat = encodeURIComponent(category.toUpperCase());
  return `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="800" height="500" viewBox="0 0 800 500"><defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%230f172a"/><stop offset="50%" stop-color="%231e1b4b"/><stop offset="100%" stop-color="%23020617"/></linearGradient><linearGradient id="b" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stop-color="%236366f1"/><stop offset="100%" stop-color="%23a855f7"/></linearGradient></defs><rect width="800" height="500" fill="url(%23g)"/><circle cx="400" cy="220" r="160" fill="url(%23b)" opacity="0.12"/><circle cx="400" cy="220" r="90" fill="url(%23b)" opacity="0.2"/><path d="M400 160 L450 240 L350 240 Z" fill="%23818cf8" opacity="0.8"/><text x="400" y="320" font-family="system-ui, -apple-system, sans-serif" font-size="28" font-weight="bold" fill="%23f8fafc" text-anchor="middle">${label}</text><rect x="330" y="340" width="140" height="26" rx="6" fill="%23312e81" opacity="0.8"/><text x="400" y="358" font-family="monospace" font-size="12" font-weight="600" fill="%23c7d2fe" text-anchor="middle">${cat}</text></svg>`;
}
