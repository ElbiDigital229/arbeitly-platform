import type { RequestHandler } from 'express';
import { adminService } from '../services/admin.service.js';
import { success } from '../utils/response.js';
import { HttpError } from '../errors/HttpError.js';

export const adminController = {
  signin: (async (req, res, next) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) return next(HttpError.badRequest('Email and password required'));
      const result = await adminService.signin(email, password);
      success(res, result);
    } catch (err) { next(err); }
  }) as RequestHandler,

  dashboard: (async (_req, res, next) => {
    try { success(res, await adminService.getDashboardStats()); } catch (err) { next(err); }
  }) as RequestHandler,

  getCandidates: (async (_req, res, next) => {
    try { success(res, await adminService.getCandidates()); } catch (err) { next(err); }
  }) as RequestHandler,

  getCandidate: (async (req, res, next) => {
    try { success(res, await adminService.getCandidate(req.params.id)); } catch (err) { next(err); }
  }) as RequestHandler,

  updateCandidate: (async (req, res, next) => {
    try { success(res, await adminService.updateCandidate(req.params.id, req.body)); } catch (err) { next(err); }
  }) as RequestHandler,

  getCandidateApplications: (async (req, res, next) => {
    try { success(res, await adminService.getCandidateApplications(req.params.id)); } catch (err) { next(err); }
  }) as RequestHandler,

  getEmployees: (async (_req, res, next) => {
    try { success(res, await adminService.getEmployees()); } catch (err) { next(err); }
  }) as RequestHandler,

  createEmployee: (async (req, res, next) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) return next(HttpError.badRequest('Email and password required'));
      const emp = await adminService.createEmployee(email, password);
      success(res, { id: emp.id, email: emp.email, role: emp.role }, 201);
    } catch (err) { next(err); }
  }) as RequestHandler,

  deleteEmployee: (async (req, res, next) => {
    try { await adminService.deleteEmployee(req.params.id); success(res, { message: 'Deleted' }); } catch (err) { next(err); }
  }) as RequestHandler,

  getPlans: (async (_req, res, next) => {
    try { success(res, await adminService.getPlans()); } catch (err) { next(err); }
  }) as RequestHandler,

  createPlan: (async (req, res, next) => {
    try { success(res, await adminService.createPlan(req.body), 201); } catch (err) { next(err); }
  }) as RequestHandler,

  updatePlan: (async (req, res, next) => {
    try { success(res, await adminService.updatePlan(req.params.id, req.body)); } catch (err) { next(err); }
  }) as RequestHandler,

  deletePlan: (async (req, res, next) => {
    try { await adminService.deletePlan(req.params.id); success(res, { message: 'Plan deleted' }); } catch (err) { next(err); }
  }) as RequestHandler,

  getPrompts: (async (_req, res, next) => {
    try { success(res, await adminService.getPrompts()); } catch (err) { next(err); }
  }) as RequestHandler,

  createPrompt: (async (req, res, next) => {
    try { success(res, await adminService.createPrompt(req.body), 201); } catch (err) { next(err); }
  }) as RequestHandler,

  updatePrompt: (async (req, res, next) => {
    try { success(res, await adminService.updatePrompt(req.params.id, req.body)); } catch (err) { next(err); }
  }) as RequestHandler,

  deletePrompt: (async (req, res, next) => {
    try { await adminService.deletePrompt(req.params.id); success(res, { message: 'Prompt deleted' }); } catch (err) { next(err); }
  }) as RequestHandler,

  getEmployeePerformance: (async (_req, res, next) => {
    try { success(res, await adminService.getEmployeePerformance()); } catch (err) { next(err); }
  }) as RequestHandler,

  getEmployeePerformanceDetail: (async (req, res, next) => {
    try { success(res, await adminService.getEmployeePerformanceDetail(req.params.id)); } catch (err) { next(err); }
  }) as RequestHandler,

  getAuditLog: (async (_req, res, next) => {
    try { success(res, await adminService.getAuditLog()); } catch (err) { next(err); }
  }) as RequestHandler,

  getTransactions: (async (_req, res, next) => {
    try { success(res, await adminService.getTransactions()); } catch (err) { next(err); }
  }) as RequestHandler,

  changePassword: (async (req, res, next) => {
    try {
      const { currentPassword, newPassword } = req.body;
      if (!currentPassword || !newPassword) return next(HttpError.badRequest('Both passwords required'));
      await adminService.changePassword(req.user!.id, currentPassword, newPassword);
      success(res, { message: 'Password updated' });
    } catch (err) { next(err); }
  }) as RequestHandler,
};
