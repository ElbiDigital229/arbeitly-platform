import { employeeService } from '../services/employee.service.js';
import { cvEnhanceService } from '../services/cv-enhance.service.js';
import { clService } from '../services/cl.service.js';
import { jobDiscoveryService } from '../services/job-discovery.service.js';
import { renderCvPdf, type CvPdfStyle, type CvDesignOptions } from '../services/cv-pdf-render.service.js';
import { success } from '../utils/response.js';
import { HttpError } from '../errors/HttpError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const employeeController = {
  signin: asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) throw HttpError.badRequest('Email and password are required');
    success(res, await employeeService.signin(email, password));
  }),

  dashboard: asyncHandler(async (req, res) => {
    success(res, await employeeService.getDashboardStats(req.user!.id));
  }),

  getPerformance: asyncHandler(async (req, res) => {
    success(res, await employeeService.getPerformanceStats(req.user!.id));
  }),

  getCandidates: asyncHandler(async (req, res) => {
    success(res, await employeeService.getAssignedCandidates(req.user!.id));
  }),

  getCandidate: asyncHandler(async (req, res) => {
    success(res, await employeeService.getCandidate(req.user!.id, req.params.id));
  }),

  getCandidateOnboarding: asyncHandler(async (req, res) => {
    success(res, await employeeService.getCandidateOnboarding(req.user!.id, req.params.id));
  }),

  getCandidateApplications: asyncHandler(async (req, res) => {
    success(res, await employeeService.getCandidateApplications(req.user!.id, req.params.id));
  }),

  createCandidateApplication: asyncHandler(async (req, res) => {
    success(res, await employeeService.createCandidateApplication(req.user!.id, req.params.id, req.body), 201);
  }),

  updateCandidateApplication: asyncHandler(async (req, res) => {
    success(res, await employeeService.updateCandidateApplication(req.user!.id, req.params.candidateId, req.params.appId, req.body));
  }),

  deleteCandidateApplication: asyncHandler(async (req, res) => {
    await employeeService.deleteCandidateApplication(req.user!.id, req.params.candidateId, req.params.appId);
    success(res, { message: 'Deleted' });
  }),

  // CV endpoints
  getCandidateCVs: asyncHandler(async (req, res) => {
    success(res, await employeeService.getCandidateCVs(req.user!.id, req.params.id));
  }),

  // CV Builder mirror endpoints
  uploadCandidateCv: asyncHandler(async (req, res) => {
    if (!req.file) throw HttpError.badRequest('No file uploaded');
    const title = (req.body.title as string | undefined) || req.file.originalname.replace(/\.[^.]+$/, '');
    const cv = await employeeService.uploadCvForCandidate(req.user!.id, req.params.id, title, req.file);
    success(res, cv, 201);
  }),

  createCandidateCv: asyncHandler(async (req, res) => {
    const cv = await employeeService.createCvForCandidate(req.user!.id, req.params.id, req.body);
    success(res, cv, 201);
  }),

  listCandidateCvBuilder: asyncHandler(async (req, res) => {
    success(res, await employeeService.listCvsForCandidate(req.user!.id, req.params.id));
  }),

  getCandidateCvBuilder: asyncHandler(async (req, res) => {
    success(res, await employeeService.getCvForCandidate(req.user!.id, req.params.id, req.params.cvId));
  }),

  updateCandidateCvBuilder: asyncHandler(async (req, res) => {
    success(res, await employeeService.updateCvForCandidate(req.user!.id, req.params.id, req.params.cvId, req.body));
  }),

  deleteCandidateCvBuilder: asyncHandler(async (req, res) => {
    await employeeService.deleteCvForCandidate(req.user!.id, req.params.id, req.params.cvId);
    success(res, { message: 'CV deleted' });
  }),

  exportCandidateCvHtml: asyncHandler(async (req, res) => {
    await employeeService.verifyAssignment(req.user!.id, req.params.id);
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

  enhanceCandidateCV: asyncHandler(async (req, res) => {
    await employeeService.verifyAssignment(req.user!.id, req.params.id);
    const enhanced = await cvEnhanceService.enhanceCV(req.params.cvId, req.body.customPrompt);
    success(res, enhanced);
  }),

  createCVVersion: asyncHandler(async (req, res) => {
    await employeeService.verifyAssignment(req.user!.id, req.params.id);
    const { title, parsedData } = req.body;
    success(res, await cvEnhanceService.createVersion(req.params.cvId, title, parsedData), 201);
  }),

  createCVVariant: asyncHandler(async (req, res) => {
    await employeeService.verifyAssignment(req.user!.id, req.params.id);
    const { title, parsedData } = req.body;
    success(res, await cvEnhanceService.createVariant(req.params.cvId, title, parsedData), 201);
  }),

  getCVVersionTree: asyncHandler(async (req, res) => {
    await employeeService.verifyAssignment(req.user!.id, req.params.id);
    success(res, await cvEnhanceService.getVersionTree(req.params.cvId));
  }),

  // Generic file endpoints
  listCandidateFiles: asyncHandler(async (req, res) => {
    success(res, await employeeService.listCandidateFiles(req.user!.id, req.params.id));
  }),

  uploadCandidateFile: asyncHandler(async (req, res) => {
    if (!req.file) throw HttpError.badRequest('No file uploaded');
    const label = (req.body.label as string | undefined) || undefined;
    const file = await employeeService.uploadCandidateFile(req.user!.id, req.params.id, req.file, label);
    success(res, file, 201);
  }),

  downloadCandidateFile: asyncHandler(async (req, res) => {
    const { file, stream } = await employeeService.downloadCandidateFile(req.user!.id, req.params.id, req.params.fileId);
    res.set({
      'Content-Type': file.mimetype,
      'Content-Disposition': `attachment; filename="${file.filename}"`,
      'Content-Length': file.size.toString(),
    });
    stream.pipe(res);
  }),

  deleteCandidateFile: asyncHandler(async (req, res) => {
    await employeeService.deleteCandidateFile(req.user!.id, req.params.id, req.params.fileId);
    success(res, { message: 'File deleted' });
  }),

  // Cover letter endpoints
  getCandidateCLs: asyncHandler(async (req, res) => {
    success(res, await employeeService.getCandidateCLs(req.user!.id, req.params.id));
  }),

  createCandidateCL: asyncHandler(async (req, res) => {
    await employeeService.verifyAssignment(req.user!.id, req.params.id);
    const { title, content, parentId, parentType } = req.body;
    success(res, await clService.createCoverLetter(req.params.id, title, content, { parentId, parentType }), 201);
  }),

  updateCandidateCL: asyncHandler(async (req, res) => {
    await employeeService.verifyAssignment(req.user!.id, req.params.id);
    success(res, await clService.updateCoverLetter(req.params.clId, req.body));
  }),

  enhanceCandidateCL: asyncHandler(async (req, res) => {
    await employeeService.verifyAssignment(req.user!.id, req.params.id);
    const enhanced = await clService.enhanceCoverLetter(req.params.clId, req.body.customPrompt);
    success(res, { content: enhanced });
  }),

  createCLVersion: asyncHandler(async (req, res) => {
    await employeeService.verifyAssignment(req.user!.id, req.params.id);
    const { title, content } = req.body;
    success(res, await clService.createVersion(req.params.clId, title, content), 201);
  }),

  createCLVariant: asyncHandler(async (req, res) => {
    await employeeService.verifyAssignment(req.user!.id, req.params.id);
    const { title, content } = req.body;
    success(res, await clService.createVariant(req.params.clId, title, content), 201);
  }),

  getCLVersionTree: asyncHandler(async (req, res) => {
    await employeeService.verifyAssignment(req.user!.id, req.params.id);
    success(res, await clService.getVersionTree(req.params.clId));
  }),

  generateCLForJob: asyncHandler(async (req, res) => {
    await employeeService.verifyAssignment(req.user!.id, req.params.id);
    const { jobTitle, company, jobDescription } = req.body;
    const content = await clService.generateForJob(req.params.id, jobTitle, company, jobDescription);
    success(res, { content });
  }),

  getCandidateFaq: asyncHandler(async (req, res) => {
    success(res, await employeeService.getCandidateFaq(req.user!.id, req.params.id));
  }),

  createFaqItem: asyncHandler(async (req, res) => {
    success(res, await employeeService.createFaqItem(req.user!.id, req.params.id, req.body), 201);
  }),

  updateFaqItem: asyncHandler(async (req, res) => {
    success(res, await employeeService.updateFaqItem(req.user!.id, req.params.id, req.params.faqId, req.body));
  }),

  deleteFaqItem: asyncHandler(async (req, res) => {
    await employeeService.deleteFaqItem(req.user!.id, req.params.id, req.params.faqId);
    success(res, { message: 'Deleted' });
  }),

  getCandidateQueue: asyncHandler(async (req, res) => {
    await employeeService.verifyAssignment(req.user!.id, req.params.id);
    success(res, await jobDiscoveryService.getCandidateQueue(req.params.id));
  }),

  updateProfile: asyncHandler(async (req, res) => {
    const user = await employeeService.updateProfile(req.user!.id, req.body);
    success(res, { id: user.id, email: user.email });
  }),

  changePassword: asyncHandler(async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) throw HttpError.badRequest('Both passwords required');
    await employeeService.changePassword(req.user!.id, currentPassword, newPassword);
    success(res, { message: 'Password updated' });
  }),
};
