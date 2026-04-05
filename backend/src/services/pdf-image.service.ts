import { getDocument, OPS } from 'pdfjs-dist/legacy/build/pdf.mjs';
import sharp from 'sharp';

/**
 * Extract the largest image from a PDF buffer and return it as a base64 data URL.
 * Returns null if no images are found.
 */
export async function extractLargestImage(pdfBuffer: Buffer): Promise<string | null> {
  const doc = await getDocument({ data: new Uint8Array(pdfBuffer) }).promise;

  let largestImage: { data: Uint8Array; width: number; height: number } | null = null;
  let largestArea = 0;

  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i);
    const ops = await page.getOperatorList();

    for (let j = 0; j < ops.fnArray.length; j++) {
      if (ops.fnArray[j] === OPS.paintImageXObject) {
        const imgName = ops.argsArray[j][0];
        try {
          const img = await page.objs.get(imgName) as any;
          if (!img?.data || !img.width || !img.height) continue;

          const area = img.width * img.height;
          // Skip tiny images (icons, decorations) — require at least 50x50
          if (img.width < 50 || img.height < 50) continue;

          if (area > largestArea) {
            largestArea = area;
            largestImage = { data: img.data, width: img.width, height: img.height };
          }
        } catch {
          // Skip images that can't be decoded
        }
      }
    }
  }

  await doc.destroy();

  if (!largestImage) return null;

  // Convert raw RGBA/RGB pixel data to JPEG via sharp
  const { data, width, height } = largestImage;
  const channels = data.length / (width * height);
  const isRGBA = channels === 4;

  const jpegBuffer = await sharp(Buffer.from(data), {
    raw: { width, height, channels: isRGBA ? 4 : 3 },
  })
    .resize(320, 320, { fit: 'inside', withoutEnlargement: true })
    .jpeg({ quality: 85 })
    .toBuffer();

  return `data:image/jpeg;base64,${jpegBuffer.toString('base64')}`;
}
