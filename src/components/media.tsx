type Props = { name: string; alt: string; className?: string; eager?: boolean; sizes?: string; width?: number; height?: number };
export function Media({ name, alt, className = '', eager = false, sizes = '100vw', width = 1600, height = 1200 }: Props) {
  return <picture className={`product-media ${className}`}>
    <source type="image/webp" srcSet={`/assets/${name}-800.webp 800w, /assets/${name}-1600.webp 1600w`} sizes={sizes} />
    {/* Optimized, authored responsive sources; no runtime image transformation. */}
    <img src={`/assets/${name}-1600.webp`} alt={alt} width={width} height={height} loading={eager ? 'eager' : 'lazy'} fetchPriority={eager ? 'high' : 'auto'} decoding="async" />
  </picture>;
}
