import Anthropic from '@anthropic-ai/sdk';
import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs';
import { env } from '../config/env.js';

async function extractTextFromPdf(buffer: Buffer): Promise<string> {
  const data = new Uint8Array(buffer);
  const doc = await getDocument({ data, useSystemFonts: true }).promise;
  const pages: string[] = [];
  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i);
    const content = await page.getTextContent();
    const text = content.items
      .map((item: any) => ('str' in item ? item.str : ''))
      .join(' ');
    pages.push(text);
  }
  return pages.join('\n\n');
}

export interface ParsedCVData {
  personal: {
    name: string;
    email: string;
    phone: string;
    location: string;
    nationality: string;
    linkedin: string;
    website: string;
    github: string;
    portfolio: string;
  };
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
  interests: string;
  additional_information: string;
}

export const aiService = {
  async parseCV(fileBuffer: Buffer, mimeType: string): Promise<ParsedCVData> {
    const client = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });

    const prompt = `Extract the content of this CV into JSON. Return ONLY valid JSON, no markdown fences, no extra text.

CRITICAL RULES:
- Extract ONLY what is written in the CV. Do NOT invent, guess, or add placeholder text.
- If a field has no data in the CV, use "" or [].
- Copy text verbatim — do not rephrase or summarize bullet points.
- Each job/degree/cert gets its own entry.
- For experience "description": join all bullet points with "\\n- " prefix per line.
- For skills: flat array of individual skills, not categories.

JSON structure:
{"personal":{"name":"","email":"","phone":"","location":"","nationality":"","linkedin":"","website":"","github":"","portfolio":""},"summary":"","experience":[{"title":"","company":"","dates":"","description":""}],"education":[{"degree":"","institution":"","dates":"","gpa":"","courses":"","awards":"","details":""}],"certifications":[{"name":"","institution":"","dates":"","details":""}],"skills":[],"languages":[{"language":"","level":""}],"leadership":[{"title":"","organization":"","dates":"","description":""}],"interests":"","additional_information":""}`;

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

    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 16384,
      messages: [{ role: 'user', content: messageContent }],
    });

    console.log('[AI] stop_reason:', response.stop_reason, '| usage:', JSON.stringify(response.usage));

    if (response.stop_reason === 'max_tokens') {
      throw new Error('CV too large — AI response was truncated. Try a shorter CV or reduce details.');
    }

    const textContent = response.content.find((c) => c.type === 'text');
    if (!textContent || textContent.type !== 'text') {
      throw new Error('No text response from AI');
    }

    // Strip markdown code fences if present
    let jsonText = textContent.text.trim();
    if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/^```(?:json)?\s*\n?/, '').replace(/\n?```\s*$/, '');
    }

    // Extract the JSON object — find the outermost { ... }
    const firstBrace = jsonText.indexOf('{');
    const lastBrace = jsonText.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace > firstBrace) {
      jsonText = jsonText.slice(firstBrace, lastBrace + 1);
    }

    // Fix common JSON issues from LLM output
    // Remove trailing commas before } or ]
    jsonText = jsonText.replace(/,\s*([}\]])/g, '$1');

    try {
      const parsed: ParsedCVData = JSON.parse(jsonText);
      return parsed;
    } catch (parseErr) {
      console.error('JSON parse failed. Raw response (first 500 chars):', jsonText.slice(0, 500));
      throw parseErr;
    }
  },
};
