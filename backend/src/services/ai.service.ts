import Anthropic from '@anthropic-ai/sdk';
import { env } from '../config/env.js';

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
    console.log('[AI] ANTHROPIC_API_KEY present:', !!env.ANTHROPIC_API_KEY, '| length:', env.ANTHROPIC_API_KEY?.length ?? 0);
    if (!env.ANTHROPIC_API_KEY) {
      // Return empty structure when API key not configured
      return {
        personal: { name: '', email: '', phone: '', location: '', nationality: '', linkedin: '', website: '', github: '', portfolio: '' },
        summary: '',
        experience: [],
        education: [],
        certifications: [],
        skills: [],
        languages: [],
        leadership: [],
        interests: '',
        additional_information: '',
      };
    }

    const client = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });

    const base64Content = fileBuffer.toString('base64');

    const prompt = `Extract ALL information from this CV/resume into the following JSON structure. Be extremely thorough — do NOT skip or compress any details. Every bullet point, every course name, every award, every GPA must be captured exactly as written.

Return ONLY valid JSON, no markdown fences, no explanation:

{
    "personal": {
        "name": "",
        "email": "",
        "phone": "",
        "location": "",
        "nationality": "",
        "linkedin": "",
        "website": "",
        "github": "",
        "portfolio": ""
    },
    "summary": "",
    "experience": [
        {
            "title": "Job title",
            "company": "Company name",
            "dates": "Start - End",
            "description": "Every responsibility and achievement as bullet points, each on its own line starting with a dash"
        }
    ],
    "education": [
        {
            "degree": "Full degree name exactly as written",
            "institution": "School/University name",
            "dates": "Start - End",
            "gpa": "GPA or grade if mentioned",
            "courses": "List of specific courses/modules if mentioned, comma-separated",
            "awards": "Honors, medals, scholarships, distinctions related to this degree",
            "details": "Any other details like thesis topic, exchange info, or special notes"
        }
    ],
    "certifications": [
        {
            "name": "Certification/qualification name",
            "institution": "Issuing body",
            "dates": "Start - End or date obtained",
            "details": "Level, focus areas, exam results, medals, or other specifics"
        }
    ],
    "skills": ["skill1", "skill2"],
    "languages": [
        {
            "language": "Language name",
            "level": "Proficiency level if mentioned (e.g. Native, Fluent, B2, etc.)"
        }
    ],
    "leadership": [
        {
            "title": "Program or role name",
            "organization": "Organization name",
            "dates": "Start - End",
            "description": "Details of the program or role"
        }
    ],
    "interests": "",
    "additional_information": ""
}

Rules:
- CAPTURE EVERYTHING: Do not summarize, shorten, or omit any bullet points, details, or data from the CV.
- Create a SEPARATE entry for each role/degree/certification — do not merge multiple items into one.
- For experience descriptions, include EVERY bullet point exactly as written. Each line starts with "- ".
- For skills, return a flat array of individual skill strings (not categories). Include every single skill listed.
- For education: always fill gpa, courses, and awards if the CV mentions them. Do NOT put GPA/courses/awards in the "details" field — use their dedicated fields.
- For certifications: include professional qualifications (e.g. CIMA, CPA, CFA, PMP), training programs, and any non-degree credentials. Include exam results, medals, pass rates in the "details" field.
- For languages: extract from any "Languages" or "Language Skills" section. If no proficiency level is stated, use "".
- For leadership: include mentorship programs, leadership training, development programs, committee roles, etc.
- For interests: extract hobbies, interests, and personal activities.
- For additional_information: ONLY use this for content that does NOT fit any of the above sections. If everything has been captured above, use an empty string.
- If a field is not found, use an empty string "" or empty array [].
- Include linkedin URL if found (e.g. "linkedin.com/in/username").
- Include GitHub URL if found (e.g. "github.com/username").
- Include portfolio/personal website URL if found separately from linkedin/github.
- Preserve all dates exactly as written in the CV.
- Nationality: extract if mentioned anywhere in the CV (e.g. "Nationality: German").
- EDUCATION SUB-FIELDS ARE CRITICAL:
  * gpa: Any GPA score, grade, or scholarship. E.g. if CV says "On Scholarship - GPA of 9.8/10" then gpa = "9.8/10 (On Scholarship)". Never leave empty if a GPA or grade is mentioned.
  * courses: Any listed course names, modules, or subjects under a degree. E.g. if CV says "Courses include: Corporate Valuation, M&A, Bank Management" then courses = "Corporate Valuation, M&A, Bank Management". Include ALL listed courses.
  * awards: Honors, dean's list, cum laude, distinctions related to a degree.
  * details: Thesis topics, exchange info, or other notes not covered above.
- CERTIFICATION DETAILS ARE CRITICAL:
  * Include ALL bullet points under a certification. E.g. if CV says "Focus on Finance, Strategy, Controlling" then include that. If it says "Gold Medal in exam X" then details MUST include the full text.
  * Never leave certification details empty if there are bullet points under it.
- ZERO TOLERANCE FOR DATA LOSS: Every single bullet point, sub-bullet, note, and detail in the CV must appear somewhere in the output. After generating your response, mentally verify each section of the source CV is represented.`;

    let messageContent: Anthropic.MessageParam['content'];

    if (mimeType === 'application/pdf') {
      messageContent = [
        {
          type: 'document',
          source: {
            type: 'base64',
            media_type: 'application/pdf',
            data: base64Content,
          },
        } as Anthropic.DocumentBlockParam,
        {
          type: 'text',
          text: prompt,
        },
      ];
    } else {
      // For image-based CVs (png, jpg, etc.)
      const imgMime = mimeType as 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp';
      messageContent = [
        {
          type: 'image',
          source: {
            type: 'base64',
            media_type: imgMime,
            data: base64Content,
          },
        } as Anthropic.ImageBlockParam,
        {
          type: 'text',
          text: prompt,
        },
      ];
    }

    const response = await client.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 8192,
      messages: [{ role: 'user', content: messageContent }],
    });

    const textContent = response.content.find((c) => c.type === 'text');
    if (!textContent || textContent.type !== 'text') {
      throw new Error('No text response from AI');
    }

    // Strip markdown code fences if present
    let jsonText = textContent.text.trim();
    if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/^```(?:json)?\s*\n?/, '').replace(/\n?```\s*$/, '');
    }

    const parsed: ParsedCVData = JSON.parse(jsonText);
    return parsed;
  },
};
