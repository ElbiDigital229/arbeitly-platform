import type { RequestHandler } from 'express';
import { employeeService } from '../services/employee.service.js';
import { success } from '../utils/response.js';
import { HttpError } from '../errors/HttpError.js';

export const employeeController = {
  signin: (async (req, res, next) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) return next(HttpError.badRequest('Email and password are required'));
      const result = await employeeService.signin(email, password);
      success(res, result);
    } catch (err) { next(err); }
  }) as RequestHandler,

  dashboard: (async (req, res, next) => {
    try {
      const stats = await employeeService.getDashboardStats(req.user!.id);
      success(res, stats);
    } catch (err) { next(err); }
  }) as RequestHandler,

  getCandidates: (async (req, res, next) => {
    try {
      const candidates = await employeeService.getAssignedCandidates(req.user!.id);
      success(res, candidates);
    } catch (err) { next(err); }
  }) as RequestHandler,

  getCandidate: (async (req, res, next) => {
    try {
      const candidate = await employeeService.getCandidate(req.user!.id, req.params.id);
      success(res, candidate);
    } catch (err) { next(err); }
  }) as RequestHandler,

  getCandidateApplications: (async (req, res, next) => {
    try {
      const apps = await employeeService.getCandidateApplications(req.user!.id, req.params.id);
      success(res, apps);
    } catch (err) { next(err); }
  }) as RequestHandler,

  createCandidateApplication: (async (req, res, next) => {
    try {
      const app = await employeeService.createCandidateApplication(req.user!.id, req.params.id, req.body);
      success(res, app, 201);
    } catch (err) { next(err); }
  }) as RequestHandler,

  updateCandidateApplication: (async (req, res, next) => {
    try {
      const app = await employeeService.updateCandidateApplication(req.user!.id, req.params.candidateId, req.params.appId, req.body);
      success(res, app);
    } catch (err) { next(err); }
  }) as RequestHandler,

  deleteCandidateApplication: (async (req, res, next) => {
    try {
      await employeeService.deleteCandidateApplication(req.user!.id, req.params.candidateId, req.params.appId);
      success(res, { message: 'Deleted' });
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
