export const APP_MEDIA_ASSETS: Record<string, string> = {
  adinkraStudio: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=800",
  luminaShowcase: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=800",
};
export function resolveAppMedia(url: string){ return url || ""; }
export function getAppCategoryPlaceholder(category: string, name: string){
  const seed = encodeURIComponent((name || category || "prism").toLowerCase().replace(/\s+/g,"-"));
  return `https://picsum.photos/seed/${seed}/800/600`;
}