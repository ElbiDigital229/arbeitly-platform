import puppeteer from 'puppeteer';

export type CvPdfStyle = 'modern' | 'classic' | 'minimal';

const COMPRESSION_LEVELS = [
  { pt: 8.5, lh: 1.35, mm: 10 },
  { pt: 8.0, lh: 1.30, mm: 9 },
  { pt: 7.5, lh: 1.25, mm: 8 },
  { pt: 7.0, lh: 1.20, mm: 7 },
  { pt: 6.5, lh: 1.15, mm: 6 },
  { pt: 6.0, lh: 1.10, mm: 5 },
];

function buildCss(style: CvPdfStyle, bodyPt: number, marginMm: number, lh: number): string {
  const h1Pt = Math.round(bodyPt * 2.2 * 10) / 10;
  const h2Pt = Math.round(bodyPt * 0.88 * 10) / 10;
  const smallPt = Math.round(bodyPt * 0.88 * 10) / 10;
  const padV = Math.round(bodyPt * 2.2 * 10) / 10;
  const padH = Math.round(bodyPt * 3.4 * 10) / 10;
  const h2margin = Math.round(bodyPt * 1.3 * 10) / 10;

  const templates: Record<CvPdfStyle, string> = {
    modern:
      `body{font-family:'Inter','Helvetica Neue',Arial,sans-serif;color:#1a1a2e;margin:0;padding:0}`
      + `.w{margin:0 auto;padding:${padV}pt ${padH}pt}`
      + `h1{font-size:${h1Pt}pt;font-weight:700;margin:0 0 2pt;color:#0f172a}`
      + `h2{font-size:${h2Pt}pt;font-weight:600;text-transform:uppercase;letter-spacing:.06em;color:#0ea5e9;border-bottom:1.5pt solid #0ea5e9;padding-bottom:2pt;margin:${h2margin}pt 0 4pt}`
      + `p,li{font-size:${bodyPt}pt;line-height:${lh};color:#334155;margin:1pt 0}`
      + `ul{padding-left:12pt;margin:1pt 0}`
      + `strong{color:#0f172a;font-size:${bodyPt}pt}`
      + `.contact{font-size:${smallPt}pt;color:#64748b;margin:2pt 0 8pt}`
      + `span{font-size:${smallPt}pt}`,

    classic:
      `body{font-family:Georgia,'Times New Roman',serif;color:#1a1a1a;margin:0;padding:0}`
      + `.w{margin:0 auto;padding:${padV}pt ${padH}pt}`
      + `h1{font-size:${h1Pt}pt;font-weight:700;margin:0 0 2pt;border-bottom:2pt double #1a1a1a;padding-bottom:4pt}`
      + `h2{font-size:${h2Pt}pt;font-weight:700;text-transform:uppercase;letter-spacing:.05em;margin:${h2margin}pt 0 4pt;color:#1a1a1a}`
      + `p,li{font-size:${bodyPt}pt;line-height:${lh};color:#2d2d2d;margin:1pt 0}`
      + `ul{padding-left:12pt;margin:1pt 0}`
      + `strong{font-size:${bodyPt}pt}`
      + `.contact{font-size:${smallPt}pt;color:#555;margin:2pt 0 8pt}`
      + `span{font-size:${smallPt}pt}`,

    minimal:
      `body{font-family:'Helvetica Neue',Arial,sans-serif;color:#222;margin:0;padding:0}`
      + `.w{margin:0 auto;padding:${padV}pt ${padH}pt}`
      + `h1{font-size:${h1Pt}pt;font-weight:300;letter-spacing:.03em;margin:0 0 2pt}`
      + `h2{font-size:${h2Pt}pt;font-weight:600;text-transform:uppercase;letter-spacing:.1em;color:#888;margin:${h2margin}pt 0 4pt}`
      + `p,li{font-size:${bodyPt}pt;line-height:${lh};color:#444;margin:1pt 0}`
      + `ul{padding-left:11pt;margin:1pt 0}`
      + `hr{border:none;border-top:1pt solid #e5e5e5;margin:6pt 0}`
      + `strong{font-size:${bodyPt}pt}`
      + `.contact{font-size:${smallPt}pt;color:#888;margin:2pt 0 8pt}`
      + `span{font-size:${smallPt}pt}`,
  };

  const pageCss = `@page{size:A4 portrait;margin:${marginMm}mm}`;
  const skillsCss = `span[data-cv-skill]{display:inline!important;border:none!important;border-radius:0!important;padding:0!important;background:none!important;font-size:${bodyPt}pt!important}span[data-cv-skill]:after{content:', '}`;
  const divCss = `div{margin-top:0!important;margin-bottom:2pt!important}section{margin-bottom:0!important}`;
  const pCss = `p{margin:1pt 0!important}`;

  return `*{box-sizing:border-box}${pageCss}${templates[style] || templates.modern}${skillsCss}${divCss}${pCss}`;
}

function preprocessHtml(html: string): string {
  // Strip soft hyphens
  html = html.replace(/\u00AD/g, '');

  // Fix inline style overrides
  html = html.replace(/margin-bottom\s*:\s*[\d.]+px/gi, 'margin-bottom:2pt');
  html = html.replace(/margin-top\s*:\s*[\d.]+px/gi, 'margin-top:1pt');
  html = html.replace(/font-size\s*:\s*[\d.]+em\s*;?/gi, '');
  html = html.replace(/opacity\s*:\s*[\d.]+\s*;?/gi, '');

  // Fix profile photo dimensions
  html = html.replace(
    /(<img[^>]*data-role=["']profile-photo["'][^>]*style=["'])([^"']*?)(["'])/gi,
    '$1width:68pt;height:68pt;object-fit:cover;border-radius:3pt$3',
  );

  return html;
}

function buildFullHtml(css: string, content: string): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <style>${css}</style>
</head>
<body>
  <div class="w">${content}</div>
</body>
</html>`;
}

export async function renderCvPdf(contentHtml: string, style: CvPdfStyle = 'modern'): Promise<Buffer> {
  const normalized = preprocessHtml(contentHtml);

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
    ...(process.env.PUPPETEER_EXECUTABLE_PATH
      ? { executablePath: process.env.PUPPETEER_EXECUTABLE_PATH }
      : {}),
  });

  try {
    const page = await browser.newPage();

    for (const level of COMPRESSION_LEVELS) {
      const css = buildCss(style, level.pt, level.mm, level.lh);
      const html = buildFullHtml(css, normalized);

      await page.setContent(html, { waitUntil: 'networkidle0' });

      const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: { top: `${level.mm}mm`, bottom: `${level.mm}mm`, left: `${level.mm}mm`, right: `${level.mm}mm` },
      });

      // Check page count — accept if ≤ 2 pages
      // Puppeteer doesn't expose page count directly, so estimate by file size
      // or just use the first level that produces a reasonable size.
      // For a more accurate check, we count pages via a second pass.
      const pageCount = await page.evaluate(() => {
        const body = document.body;
        const pageHeight = 1122; // A4 at 96dpi ≈ 1122px
        return Math.ceil(body.scrollHeight / pageHeight);
      });

      if (pageCount <= 2) {
        return Buffer.from(pdfBuffer);
      }
    }

    // Fallback: use the tightest compression
    const css = buildCss(style, 6.0, 5, 1.10);
    const html = buildFullHtml(css, normalized);
    await page.setContent(html, { waitUntil: 'networkidle0' });
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '5mm', bottom: '5mm', left: '5mm', right: '5mm' },
    });
    return Buffer.from(pdfBuffer);
  } finally {
    await browser.close();
  }
}
