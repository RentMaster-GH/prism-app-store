export const APP_MEDIA_ASSETS: Record<string, string> = {
  adinkraStudio: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=800",
  luminaShowcase: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=800",
  orbitHero: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=800",
  aetherSound: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=800",
  zenithFitness: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=800",
};

export function resolveAppMedia(url: string | undefined, fallbackKey: string = 'orbitHero'): string {
  if (!url) return APP_MEDIA_ASSETS[fallbackKey] || APP_MEDIA_ASSETS.orbitHero;
  return url;
}

export function getOptimizedImageUrl(url: string | undefined, width = 480): string {
  if (!url) return '';
  const resolved = resolveAppMedia(url);
  if (resolved.startsWith('data:')) return resolved;
  if (resolved.includes('supabase.co/storage/v1/object/public/')) {
    if (resolved.includes('width=')) return resolved;
    return `${resolved}${resolved.includes('?') ? '&' : '?'}width=${width}&quality=75&format=webp`;
  }
  return resolved;
}

export function getAppCategoryPlaceholder(category: string = 'General', name: string = 'App'): string {
  const seed = encodeURIComponent((name || category || "prism").toLowerCase().replace(/\s+/g,"-"));
  return `https://picsum.photos/seed/${seed}/800/600`;
}