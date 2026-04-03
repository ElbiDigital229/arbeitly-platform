import type { RequestHandler } from 'express';
import { cvService } from '../services/cv.service.js';
import { success } from '../utils/response.js';
import { HttpError } from '../errors/HttpError.js';

export const cvController = {
  uploadCV: (async (req, res, next) => {
    try {
      if (!req.file) {
        return next(HttpError.badRequest('No file uploaded'));
      }
      const title = req.body.title as string | undefined;
      if (!title) {
        return next(HttpError.badRequest('Title is required'));
      }
      const cv = await cvService.uploadAndParseCV(req.user!.id, title, req.file);
      success(res, cv, 201);
    } catch (err) {
      next(err);
    }
  }) as RequestHandler,

  createCV: (async (req, res, next) => {
    try {
      const cv = await cvService.createCV(req.user!.id, req.body);
      success(res, cv, 201);
    } catch (err) {
      next(err);
    }
  }) as RequestHandler,

  getCVs: (async (req, res, next) => {
    try {
      const cvs = await cvService.getCVs(req.user!.id);
      success(res, cvs);
    } catch (err) {
      next(err);
    }
  }) as RequestHandler,

  getCVById: (async (req, res, next) => {
    try {
      const cv = await cvService.getCVById(req.user!.id, req.params.id);
      success(res, cv);
    } catch (err) {
      next(err);
    }
  }) as RequestHandler,

  updateCV: (async (req, res, next) => {
    try {
      const cv = await cvService.updateCV(req.user!.id, req.params.id, req.body);
      success(res, cv);
    } catch (err) {
      next(err);
    }
  }) as RequestHandler,

  deleteCV: (async (req, res, next) => {
    try {
      await cvService.deleteCV(req.user!.id, req.params.id);
      success(res, { message: 'CV deleted successfully' });
    } catch (err) {
      next(err);
    }
  }) as RequestHandler,

  exportCVToPDF: (async (req, res, next) => {
    try {
      const pdfBuffer = await cvService.exportCVToPDF(req.user!.id, req.params.id);
      res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="cv-${req.params.id}.pdf"`,
        'Content-Length': pdfBuffer.length.toString(),
      });
      res.send(pdfBuffer);
    } catch (err) {
      next(err);
    }
  }) as RequestHandler,
};
