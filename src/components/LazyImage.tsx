import { useState, useRef, useEffect } from 'react';
interface LazyImageProps { src: string; alt: string; className?: string; onError?: (e: React.SyntheticEvent<HTMLImageElement>) => void; }
export const LazyImage: React.FC<LazyImageProps> = ({ src, alt, className, onError }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const imgRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) { setIsInView(true); observer.disconnect(); } }, { rootMargin: '300px' });
    if (imgRef.current) observer.observe(imgRef.current);
    return () => observer.disconnect();
  }, []);
  return (
    <div ref={imgRef} className={`relative overflow-hidden bg-slate-900 ${className}`}>
      {!isLoaded && <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-900 animate-pulse" />}
      {isInView && <img src={src} alt={alt} loading="lazy" decoding="async" onLoad={() => setIsLoaded(true)} onError={onError} className={`w-full h-full object-cover transition-all duration-700 ${isLoaded ? 'opacity-100 blur-0 scale-100' : 'opacity-0 blur-[10px] scale-[1.03]'}`} />}
    </div>
  );
};
