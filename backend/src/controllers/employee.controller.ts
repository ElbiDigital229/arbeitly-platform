import type { RequestHandler } from 'express';
import { employeeService } from '../services/employee.service.js';
import { cvEnhanceService } from '../services/cv-enhance.service.js';
import { clService } from '../services/cl.service.js';
import { jobDiscoveryService } from '../services/job-discovery.service.js';
import { success } from '../utils/response.js';
import { HttpError } from '../errors/HttpError.js';

export const employeeController = {
  signin: (async (req, res, next) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) return next(HttpError.badRequest('Email and password are required'));
      success(res, await employeeService.signin(email, password));
    } catch (err) { next(err); }
  }) as RequestHandler,

  dashboard: (async (req, res, next) => {
    try { success(res, await employeeService.getDashboardStats(req.user!.id)); } catch (err) { next(err); }
  }) as RequestHandler,

  getPerformance: (async (req, res, next) => {
    try { success(res, await employeeService.getPerformanceStats(req.user!.id)); } catch (err) { next(err); }
  }) as RequestHandler,

  getCandidates: (async (req, res, next) => {
    try { success(res, await employeeService.getAssignedCandidates(req.user!.id)); } catch (err) { next(err); }
  }) as RequestHandler,

  getCandidate: (async (req, res, next) => {
    try { success(res, await employeeService.getCandidate(req.user!.id, req.params.id)); } catch (err) { next(err); }
  }) as RequestHandler,

  getCandidateOnboarding: (async (req, res, next) => {
    try { success(res, await employeeService.getCandidateOnboarding(req.user!.id, req.params.id)); } catch (err) { next(err); }
  }) as RequestHandler,

  getCandidateApplications: (async (req, res, next) => {
    try { success(res, await employeeService.getCandidateApplications(req.user!.id, req.params.id)); } catch (err) { next(err); }
  }) as RequestHandler,

  createCandidateApplication: (async (req, res, next) => {
    try { success(res, await employeeService.createCandidateApplication(req.user!.id, req.params.id, req.body), 201); } catch (err) { next(err); }
  }) as RequestHandler,

  updateCandidateApplication: (async (req, res, next) => {
    try { success(res, await employeeService.updateCandidateApplication(req.user!.id, req.params.candidateId, req.params.appId, req.body)); } catch (err) { next(err); }
  }) as RequestHandler,

  deleteCandidateApplication: (async (req, res, next) => {
    try { await employeeService.deleteCandidateApplication(req.user!.id, req.params.candidateId, req.params.appId); success(res, { message: 'Deleted' }); } catch (err) { next(err); }
  }) as RequestHandler,

  // CV endpoints
  getCandidateCVs: (async (req, res, next) => {
    try { success(res, await employeeService.getCandidateCVs(req.user!.id, req.params.id)); } catch (err) { next(err); }
  }) as RequestHandler,

  enhanceCandidateCV: (async (req, res, next) => {
    try {
      await employeeService.verifyAssignment(req.user!.id, req.params.id);
      const enhanced = await cvEnhanceService.enhanceCV(req.params.cvId, req.body.customPrompt);
      success(res, enhanced);
    } catch (err) { next(err); }
  }) as RequestHandler,

  createCVVersion: (async (req, res, next) => {
    try {
      await employeeService.verifyAssignment(req.user!.id, req.params.id);
      const { title, parsedData } = req.body;
      success(res, await cvEnhanceService.createVersion(req.params.cvId, title, parsedData), 201);
    } catch (err) { next(err); }
  }) as RequestHandler,

  createCVVariant: (async (req, res, next) => {
    try {
      await employeeService.verifyAssignment(req.user!.id, req.params.id);
      const { title, parsedData } = req.body;
      success(res, await cvEnhanceService.createVariant(req.params.cvId, title, parsedData), 201);
    } catch (err) { next(err); }
  }) as RequestHandler,

  getCVVersionTree: (async (req, res, next) => {
    try {
      await employeeService.verifyAssignment(req.user!.id, req.params.id);
      success(res, await cvEnhanceService.getVersionTree(req.params.cvId));
    } catch (err) { next(err); }
  }) as RequestHandler,

  // Cover letter endpoints
  getCandidateCLs: (async (req, res, next) => {
    try { success(res, await employeeService.getCandidateCLs(req.user!.id, req.params.id)); } catch (err) { next(err); }
  }) as RequestHandler,

  createCandidateCL: (async (req, res, next) => {
    try {
      await employeeService.verifyAssignment(req.user!.id, req.params.id);
      const { title, content } = req.body;
      success(res, await clService.createCoverLetter(req.params.id, title, content), 201);
    } catch (err) { next(err); }
  }) as RequestHandler,

  updateCandidateCL: (async (req, res, next) => {
    try {
      await employeeService.verifyAssignment(req.user!.id, req.params.id);
      success(res, await clService.updateCoverLetter(req.params.clId, req.body));
    } catch (err) { next(err); }
  }) as RequestHandler,

  enhanceCandidateCL: (async (req, res, next) => {
    try {
      await employeeService.verifyAssignment(req.user!.id, req.params.id);
      const enhanced = await clService.enhanceCoverLetter(req.params.clId, req.body.customPrompt);
      success(res, { content: enhanced });
    } catch (err) { next(err); }
  }) as RequestHandler,

  createCLVersion: (async (req, res, next) => {
    try {
      await employeeService.verifyAssignment(req.user!.id, req.params.id);
      const { title, content } = req.body;
      success(res, await clService.createVersion(req.params.clId, title, content), 201);
    } catch (err) { next(err); }
  }) as RequestHandler,

  createCLVariant: (async (req, res, next) => {
    try {
      await employeeService.verifyAssignment(req.user!.id, req.params.id);
      const { title, content } = req.body;
      success(res, await clService.createVariant(req.params.clId, title, content), 201);
    } catch (err) { next(err); }
  }) as RequestHandler,

  getCLVersionTree: (async (req, res, next) => {
    try {
      await employeeService.verifyAssignment(req.user!.id, req.params.id);
      success(res, await clService.getVersionTree(req.params.clId));
    } catch (err) { next(err); }
  }) as RequestHandler,

  generateCLForJob: (async (req, res, next) => {
    try {
      await employeeService.verifyAssignment(req.user!.id, req.params.id);
      const { jobTitle, company, jobDescription } = req.body;
      const content = await clService.generateForJob(req.params.id, jobTitle, company, jobDescription);
      success(res, { content });
    } catch (err) { next(err); }
  }) as RequestHandler,

  getCandidateQueue: (async (req, res, next) => {
    try {
      await employeeService.verifyAssignment(req.user!.id, req.params.id);
      success(res, await jobDiscoveryService.getCandidateQueue(req.params.id));
    } catch (err) { next(err); }
  }) as RequestHandler,

  updateProfile: (async (req, res, next) => {
    try {
      const user = await employeeService.updateProfile(req.user!.id, req.body);
      success(res, { id: user.id, email: user.email });
    } catch (err) { next(err); }
  }) as RequestHandler,

  changePassword: (async (req, res, next) => {
    try {
      const { currentPassword, newPassword } = req.body;
      if (!currentPassword || !newPassword) return next(HttpError.badRequest('Both passwords required'));
      await employeeService.changePassword(req.user!.id, currentPassword, newPassword);
      success(res, { message: 'Password updated' });
    } catch (err) { next(err); }
  }) as RequestHandler,
};
