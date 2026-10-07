import Image from "next/image";
import { imageDims } from "@/lib/media";

type Props = { src: string; alt?: string; priority?: boolean; className?: string; sizes?: string; width?: number; height?: number };

/**
 * Site image. Raster files go through next/image (AVIF/WebP, explicit dimensions → no CLS);
 * SVG/GIF/remote fall back to a plain <img> with dimensions when known.
 */
export function Img({ src, alt = "", priority, className, sizes, width, height }: Props) {
  const dims = width && height ? { width, height } : imageDims(src);
  const raster = /\.(png|jpe?g|webp|avif)$/i.test(src) && src.startsWith("/");
  if (raster && dims) {
    return <Image src={src} alt={alt} width={dims.width} height={dims.height} priority={priority} fetchPriority={priority ? "high" : undefined} className={className} sizes={sizes || "(max-width: 768px) 100vw, 50vw"} loading={priority ? undefined : "lazy"} />;
  }
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt={alt} className={className} loading={priority ? "eager" : "lazy"} decoding="async" {...(dims || {})} />;
}
