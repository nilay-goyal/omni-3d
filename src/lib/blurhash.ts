// src/lib/blurhash.ts
import { decode } from 'blurhash';

export function renderBlurhashToCanvas(canvas: HTMLCanvasElement, blurhash: string, width = 32, height = 32) {
  const pixels = decode(blurhash, width, height);
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const imageData = ctx.createImageData(width, height);
  imageData.data.set(pixels);
  ctx.putImageData(imageData, 0, 0);
}

export function BlurhashCanvas({ blurhash, width = 32, height = 32, style = {} }: {
  blurhash: string;
  width?: number;
  height?: number;
  style?: React.CSSProperties;
}) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  React.useEffect(() => {
    if (canvasRef.current && blurhash) {
      renderBlurhashToCanvas(canvasRef.current, blurhash, width, height);
    }
  }, [blurhash, width, height]);
  return <canvas ref={canvasRef} width={width} height={height} style={style} />;
}
