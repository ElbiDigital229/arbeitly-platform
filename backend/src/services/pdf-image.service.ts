import { getDocument, OPS } from 'pdfjs-dist/legacy/build/pdf.mjs';
import sharp from 'sharp';

interface ExtractedImage {
  data: Uint8Array;
  width: number;
  height: number;
  area: number;
}

async function imageToDataUrl(img: ExtractedImage, maxSize: number): Promise<string> {
  const channels = img.data.length / (img.width * img.height);
  const isRGBA = channels === 4;
  const jpegBuffer = await sharp(Buffer.from(img.data), {
    raw: { width: img.width, height: img.height, channels: isRGBA ? 4 : 3 },
  })
    .resize(maxSize, maxSize, { fit: 'inside', withoutEnlargement: true })
    .jpeg({ quality: 85 })
    .toBuffer();
  return `data:image/jpeg;base64,${jpegBuffer.toString('base64')}`;
}

/**
 * Extract the largest image from a PDF buffer and return it as a base64 data URL.
 * Returns null if no images are found.
 */
export async function extractLargestImage(pdfBuffer: Buffer): Promise<string | null> {
  const result = await extractAllImages(pdfBuffer);
  return result.photo;
}

/**
 * Extract photo (largest image) and signature (second image, if aspect ratio is wide/short)
 * from a PDF buffer.
 */
export async function extractAllImages(pdfBuffer: Buffer): Promise<{ photo: string | null; signature: string | null }> {
  const doc = await getDocument({ data: new Uint8Array(pdfBuffer) }).promise;
  const images: ExtractedImage[] = [];

  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i);
    const ops = await page.getOperatorList();

    for (let j = 0; j < ops.fnArray.length; j++) {
      if (ops.fnArray[j] === OPS.paintImageXObject) {
        const imgName = ops.argsArray[j][0];
        try {
          const img = await page.objs.get(imgName) as any;
          if (!img?.data || !img.width || !img.height) continue;
          // Skip tiny images (icons, decorations)
          if (img.width < 40 || img.height < 20) continue;
          const area = img.width * img.height;
          images.push({ data: img.data, width: img.width, height: img.height, area });
        } catch {
          // Skip images that can't be decoded
        }
      }
    }
  }

  await doc.destroy();

  if (images.length === 0) return { photo: null, signature: null };

  // Sort by area descending
  images.sort((a, b) => b.area - a.area);

  // Largest image = photo (if roughly square or portrait — aspect ratio < 3)
  const largest = images[0];
  const largestRatio = largest.width / largest.height;
  const photo = (largestRatio < 3 && largest.width >= 50 && largest.height >= 50)
    ? await imageToDataUrl(largest, 320)
    : null;

  // Look for signature among remaining images:
  // Signatures are typically wider than tall and small-medium size
  let signature: string | null = null;
  for (let i = photo ? 1 : 0; i < images.length; i++) {
    const img = images[i];
    const ratio = img.width / img.height;
    // Signature heuristic: wider than tall (ratio > 1.2), not too large (< 500x500), not too small
    if (ratio > 1.2 && img.width >= 60 && img.height >= 20 && img.area < 250000) {
      signature = await imageToDataUrl(img, 200);
      break;
    }
  }

  return { photo, signature };
}
