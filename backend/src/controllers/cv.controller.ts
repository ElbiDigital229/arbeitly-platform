import { cvService } from '../services/cv.service.js';
import { success } from '../utils/response.js';
import { HttpError } from '../errors/HttpError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { renderCvPdf, type CvPdfStyle, type CvDesignOptions } from '../services/cv-pdf-render.service.js';

export const cvController = {
  uploadCV: asyncHandler(async (req, res) => {
    if (!req.file) throw HttpError.badRequest('No file uploaded');
    const title = req.body.title as string | undefined;
    if (!title) throw HttpError.badRequest('Title is required');
    const cv = await cvService.uploadAndParseCV(req.user!.id, title, req.file);
    success(res, cv, 201);
  }),

  createCV: asyncHandler(async (req, res) => {
    const cv = await cvService.createCV(req.user!.id, req.body);
    success(res, cv, 201);
  }),

  getCVs: asyncHandler(async (req, res) => {
    const cvs = await cvService.getCVs(req.user!.id);
    success(res, cvs);
  }),

  getCVTree: asyncHandler(async (req, res) => {
    const tree = await cvService.getVersionTree(req.user!.id);
    success(res, tree);
  }),

  getCVById: asyncHandler(async (req, res) => {
    const cv = await cvService.getCVById(req.user!.id, req.params.id);
    success(res, cv);
  }),

  updateCV: asyncHandler(async (req, res) => {
    const cv = await cvService.updateCV(req.user!.id, req.params.id, req.body);
    success(res, cv);
  }),

  deleteCV: asyncHandler(async (req, res) => {
    await cvService.deleteCV(req.user!.id, req.params.id);
    success(res, { message: 'CV deleted successfully' });
  }),

  exportCVToPDF: asyncHandler(async (req, res) => {
    const pdfBuffer = await cvService.exportCVToPDF(req.user!.id, req.params.id);
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="cv-${req.params.id}.pdf"`,
      'Content-Length': pdfBuffer.length.toString(),
    });
    res.send(pdfBuffer);
  }),

  exportCVFromHtml: asyncHandler(async (req, res) => {
    const { contentHtml, style, filename, design } = req.body as {
      contentHtml?: string;
      style?: CvPdfStyle;
      filename?: string;
      design?: CvDesignOptions;
    };
    if (!contentHtml) throw HttpError.badRequest('contentHtml is required');
    const pdfBuffer = await renderCvPdf(contentHtml, style || 'modern', design);
    const name = filename || 'cv-export.pdf';
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${name}"`,
      'Content-Length': pdfBuffer.length.toString(),
    });
    res.send(pdfBuffer);
  }),
};
