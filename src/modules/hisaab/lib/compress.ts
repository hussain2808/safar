const MAX_WIDTH = 1200;
const THUMB_WIDTH = 200;
const QUALITY = 0.8;

function resizeToCanvas(img: HTMLImageElement, maxWidth: number): HTMLCanvasElement {
  const scale = Math.min(1, maxWidth / img.width);
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(img.width * scale);
  canvas.height = Math.round(img.height * scale);
  canvas.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height);
  return canvas;
}

function canvasToBlob(canvas: HTMLCanvasElement, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('Canvas toBlob failed'))),
      'image/jpeg',
      quality,
    );
  });
}

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => { URL.revokeObjectURL(url); resolve(img); };
    img.onerror = reject;
    img.src = url;
  });
}

export async function compressPhoto(file: File): Promise<{ blob: Blob; thumbnail: Blob }> {
  const img = await loadImage(file);
  const [blob, thumbnail] = await Promise.all([
    canvasToBlob(resizeToCanvas(img, MAX_WIDTH), QUALITY),
    canvasToBlob(resizeToCanvas(img, THUMB_WIDTH), QUALITY),
  ]);
  return { blob, thumbnail };
}
