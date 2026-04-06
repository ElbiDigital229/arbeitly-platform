# CV Parsing

## Overview

When candidates upload a CV, the system parses it using Claude AI to extract structured data. This parsed data powers the CV builder, enhancement features, and job matching.

## Upload Flow

**Endpoint:** `POST /api/cvs` (multipart form data)
**Service:** `cv.service.ts → uploadAndParseCV()`

1. File uploaded via multipart form (field name: `file`)
2. Quota check: `checkAndIncrementCvQuota()` — enforces 10 CV limit
3. File stored in MinIO at `cvs/{userId}/{timestamp}-{filename}`
4. File passed to `aiService.parseCV(buffer, mimeType)`
5. CV record created with `parsedData` JSON + file metadata
6. Returns CV record to frontend

## Supported File Types

| Type | MIME | Handling |
|------|------|----------|
| PDF | `application/pdf` | Text extracted via `pdfjs-dist`, then sent to Claude |
| DOCX | `application/vnd.openxmlformats...` | Sent directly to Claude |
| JPEG | `image/jpeg` | Sent as image to Claude (multimodal) |
| PNG | `image/png` | Sent as image to Claude |
| GIF | `image/gif` | Sent as image to Claude |
| WebP | `image/webp` | Sent as image to Claude |

## AI Parsing

**Service:** `ai.service.ts → parseCV()`
**Model:** `claude-haiku-4-5-20251001`

### PDF Enhancement

Before sending to Claude, PDFs get special processing:
- Text extracted using `pdfjs-dist` library
- Hyperlinks extracted from PDF annotations (LinkedIn URLs, websites)
- Photo/signature images extracted and embedded as base64

### Parsing Prompt

```
Extract the content of this CV into JSON. Return ONLY valid JSON, no markdown fences.

CRITICAL RULES:
- Extract ONLY what is written. Do NOT invent, guess, or add placeholder text.
- If a field has no data, use "" or [].
- Copy text verbatim — do not rephrase or summarize bullet points.
- Each job/degree/cert gets its own entry.
- For experience "description": join all bullet points with "\n"
- For skills: flat array of individual skills.
- When key figures appear (monetary amounts, percentages), wrap in **bold** markers.
```

## ParsedCVData Structure

```typescript
{
  personal: {
    name: string
    email: string
    phone: string
    location: string
    nationality: string
    linkedin: string
    linkedin_url: string
    website: string
    github: string
    portfolio: string
  }
  section_order: string[]       // tracks original CV section order
  summary: string               // professional summary
  experience: [{
    title: string               // job title
    company: string
    dates: string               // "Jan 2020 - Present"
    description: string         // bullet points joined with \n
  }]
  education: [{
    degree: string
    institution: string
    dates: string
    gpa: string
    courses: string
    awards: string
    details: string
  }]
  certifications: [{
    name: string
    institution: string
    dates: string
    details: string
  }]
  skills: string[]              // flat array: ["Python", "React", ...]
  languages: [{
    language: string
    level: string               // "Native", "Fluent", "B2", etc.
  }]
  leadership: [{
    title: string
    organization: string
    dates: string
    description: string
  }]
  interests: string
  additional_information: string
  photoDataUrl?: string         // base64 photo extracted from PDF
}
```

## CV Database Model

```
CV {
  id                String
  userId            String
  title             String?
  parsedData        Json?           // ParsedCVData JSON
  htmlContent       String?         // rendered HTML (from CV builder)
  editorData        Json?           // editor state (for CV builder)
  originalFileKey   String?         // MinIO key for uploaded file
  originalName      String?
  mimeType          String?
  language          String?
  style             String?
  isBase            Boolean         // true for first/onboarding CV
  parentId          String?         // self-relation for versions
  parentType        String?         // "version" | "variant"
  generatedForJobId String?         // links to JobDiscovery if auto-generated
}
```

## Error Handling

- **CV too large:** If Claude hits max_tokens, returns partial data with error flag
- **Invalid JSON response:** Attempts to fix trailing commas, strips markdown fences
- **Link extraction failure:** Non-fatal, continues without extracted links
- **Quota exceeded:** Returns 403 before parsing attempt

## Key Files

| File | Purpose |
|------|---------|
| `ai.service.ts` | `parseCV()` — Claude call + PDF processing |
| `cv.service.ts` | `uploadAndParseCV()`, `createCV()`, quota enforcement |
| `cv.controller.ts` | Upload endpoint handler |
| `cv.routes.ts` | `POST /` with multer middleware |
| `cv.repository.ts` | Database CRUD |
