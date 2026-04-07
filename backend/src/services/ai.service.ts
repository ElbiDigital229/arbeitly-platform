import type Anthropic from '@anthropic-ai/sdk';
import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs';
import { aiComplete, parseAiJson } from './external/ai-client.js';

async function extractTextFromPdf(buffer: Buffer): Promise<string> {
  const data = new Uint8Array(buffer);
  const doc = await getDocument({ data, useSystemFonts: true }).promise;
  const pages: string[] = [];
  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i);
    const content = await page.getTextContent();
    // Sort items by Y (descending = top-to-bottom) then X (left-to-right)
    const items = (content.items as any[])
      .filter((item) => 'str' in item && item.str)
      .map((item) => ({
        str: item.str as string,
        x: item.transform ? item.transform[4] : 0,
        y: item.transform ? item.transform[5] : 0,
        fontSize: item.transform ? Math.abs(item.transform[0]) : 12,
      }))
      .sort((a, b) => b.y - a.y || a.x - b.x);

    const lines: string[] = [];
    let currentLine = '';
    let lastY: number | null = null;

    for (const item of items) {
      if (lastY !== null) {
        const yDelta = Math.abs(lastY - item.y);
        // New line if Y changes by more than half the font size
        if (yDelta > item.fontSize * 0.5) {
          lines.push(currentLine.trim());
          currentLine = '';
        }
      }
      currentLine += (currentLine ? ' ' : '') + item.str;
      lastY = item.y;
    }
    if (currentLine.trim()) lines.push(currentLine.trim());
    pages.push(lines.join('\n'));
  }
  return pages.join('\n\n--- PAGE BREAK ---\n\n');
}

/**
 * Extract all hyperlink URLs from a PDF.
 * Returns an array of { url, text } where text is nearby display text.
 */
async function extractLinksFromPdf(buffer: Buffer): Promise<{ url: string; text: string }[]> {
  const data = new Uint8Array(buffer);
  const doc = await getDocument({ data, useSystemFonts: true }).promise;
  const links: { url: string; text: string }[] = [];

  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i);
    const annotations = await page.getAnnotations();
    for (const ann of annotations) {
      if (ann.subtype === 'Link' && ann.url) {
        // Try to find display text near the annotation rectangle
        const content = await page.getTextContent();
        const rect = ann.rect; // [x1, y1, x2, y2]
        let displayText = '';
        for (const item of content.items as any[]) {
          if ('str' in item && item.transform) {
            const [, , , , tx, ty] = item.transform;
            // Check if text position overlaps with annotation rect
            if (tx >= rect[0] - 5 && tx <= rect[2] + 5 && ty >= rect[1] - 5 && ty <= rect[3] + 5) {
              displayText += item.str;
            }
          }
        }
        links.push({ url: ann.url, text: displayText.trim() });
      }
    }
  }

  await doc.destroy();
  return links;
}

export interface ParsedCVData {
  personal: {
    name: string;
    email: string;
    phone: string;
    location: string;
    nationality: string;
    date_of_birth: string;
    marital_status: string;
    linkedin: string;
    linkedin_url: string;
    website: string;
    github: string;
    portfolio: string;
  };
  section_order: string[];
  summary: string;
  experience: {
    title: string;
    company: string;
    dates: string;
    description: string;
  }[];
  education: {
    degree: string;
    institution: string;
    dates: string;
    gpa: string;
    courses: string;
    awards: string;
    details: string;
  }[];
  certifications: {
    name: string;
    institution: string;
    dates: string;
    details: string;
  }[];
  skills: string[];
  languages: {
    language: string;
    level: string;
  }[];
  leadership: {
    title: string;
    organization: string;
    dates: string;
    description: string;
  }[];
  publications: {
    citation: string;
    year: string;
  }[];
  conferences: {
    title: string;
    location: string;
    dates: string;
    description: string;
  }[];
  references: {
    name: string;
    title: string;
    organization: string;
    phone: string;
    email: string;
  }[];
  research_interests: string;
  interests: string;
  additional_information: string;
  custom_sections: {
    heading: string;
    content: string;
    entries?: {
      title: string;
      subtitle: string;
      period: string;
      description: string;
    }[];
  }[];
  photoDataUrl?: string;
}

export const aiService = {
  async parseCV(fileBuffer: Buffer, mimeType: string): Promise<ParsedCVData> {
    const prompt = `Extract ALL content from this CV/resume into JSON. Return ONLY valid JSON, no markdown fences, no extra text.

CRITICAL RULES:
- Extract EVERY section and ALL details from the CV. Do NOT skip, summarize, or omit anything.
- Extract ONLY what is written in the CV. Do NOT invent, guess, or add placeholder text.
- If a field has no data in the CV, use "" or [].
- Copy text VERBATIM — do not rephrase, shorten, or summarize bullet points or descriptions.
- Each job/degree/cert/publication/conference gets its own entry in the appropriate array.
- For experience "description": join all bullet points with "\\n" between lines. Do NOT prefix lines with "- " or "• " — just the plain text of each bullet.
- For skills: flat array of individual skills, not categories.
- For "linkedin": extract the display text. For "linkedin_url": extract the actual URL if present.
- "section_order": Return an array of section keys in the EXACT order they appear in the original CV. Available keys: "summary", "experience", "education", "skills", "certifications", "languages", "leadership", "publications", "conferences", "references", "research_interests", "interests", "additional_information". Also include "custom:<heading>" for any section that does not fit the predefined keys. Only include sections that actually exist in the CV.
- "publications": Extract ALL publications, papers, book chapters, journal articles with full citation text and year.
- "conferences": Extract ALL conferences, presentations, workshops, trainings attended or facilitated — each as a separate entry with title, location, dates, and description.
- "references" / "referees": Extract ALL referees/references with name, title, organization, phone, email.
- "research_interests": Extract research interests or areas of specialization as a single string.
- "custom_sections": For any section in the CV that does not map to the predefined fields (e.g. "Professional Affiliations", "Volunteering", "Projects", "Awards"), create a custom section with heading. For sections with multiple structured items, provide an "entries" array with {title, subtitle, period, description} for each item. For simple text-only sections, use "content" as a string with \\n between items.
- When key figures appear in text (monetary amounts, percentages, notable achievements), wrap them in **bold** markers.

JSON structure:
{"personal":{"name":"","email":"","phone":"","location":"","nationality":"","date_of_birth":"","marital_status":"","linkedin":"","linkedin_url":"","website":"","github":"","portfolio":""},"section_order":[],"summary":"","experience":[{"title":"","company":"","dates":"","description":""}],"education":[{"degree":"","institution":"","dates":"","gpa":"","courses":"","awards":"","details":""}],"certifications":[{"name":"","institution":"","dates":"","details":""}],"skills":[],"languages":[{"language":"","level":""}],"leadership":[{"title":"","organization":"","dates":"","description":""}],"publications":[{"citation":"","year":""}],"conferences":[{"title":"","location":"","dates":"","description":""}],"references":[{"name":"","title":"","organization":"","phone":"","email":""}],"research_interests":"","interests":"","additional_information":"","custom_sections":[{"heading":"","content":"","entries":[{"title":"","subtitle":"","period":"","description":""}]}]}`;

    let messageContent: Anthropic.MessageParam['content'];

    if (mimeType === 'application/pdf') {
      // Extract text from PDF first — much faster than sending the full binary
      const pdfText = await extractTextFromPdf(fileBuffer);
      console.log('[AI] Extracted PDF text length:', pdfText.length);
      messageContent = [{ type: 'text', text: `${prompt}\n\nCV TEXT:\n${pdfText}` }];
    } else if (mimeType.startsWith('image/')) {
      // Images must be sent as visual content
      const imgMime = mimeType as 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp';
      messageContent = [
        {
          type: 'image',
          source: {
            type: 'base64',
            media_type: imgMime,
            data: fileBuffer.toString('base64'),
          },
        } as Anthropic.ImageBlockParam,
        { type: 'text', text: prompt },
      ];
    } else {
      // Word docs or other formats — send as document block
      messageContent = [{ type: 'text', text: `${prompt}\n\nCV TEXT:\n${fileBuffer.toString('utf-8')}` }];
    }

    const rawText = await aiComplete(messageContent, { useCvParseModel: true });
    const parsed = parseAiJson<ParsedCVData>(rawText);

    // Enrich with PDF hyperlinks if available
    if (mimeType === 'application/pdf') {
      try {
        const links = await extractLinksFromPdf(fileBuffer);
        if (links.length > 0) {
          // Find LinkedIn URL
          const linkedinLink = links.find((l) => l.url.includes('linkedin.com'));
          if (linkedinLink && !parsed.personal.linkedin_url) {
            parsed.personal.linkedin_url = linkedinLink.url;
            if (!parsed.personal.linkedin) {
              parsed.personal.linkedin = linkedinLink.text || parsed.personal.name;
            }
          }
          // Find other URLs (website, github, portfolio)
          for (const link of links) {
            if (link.url.includes('linkedin.com')) continue;
            if (link.url.includes('github.com') && !parsed.personal.github) {
              parsed.personal.github = link.url;
            } else if (!parsed.personal.website && !link.url.includes('mailto:')) {
              parsed.personal.website = link.url;
            }
          }
        }
        console.log('[AI] Extracted PDF links:', links.length);
      } catch (err: any) {
        console.error('Link extraction failed (non-fatal):', err?.message);
      }
    }

    return parsed;
  },
};
