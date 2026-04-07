import { adminService } from '../services/admin.service.js';
import { aiConfigService } from '../services/ai-config.service.js';
import { success } from '../utils/response.js';
import { HttpError } from '../errors/HttpError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const adminController = {
  signin: asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) throw HttpError.badRequest('Email and password required');
    success(res, await adminService.signin(email, password));
  }),

  dashboard: asyncHandler(async (_req, res) => {
    success(res, await adminService.getDashboardStats());
  }),

  getCandidates: asyncHandler(async (_req, res) => {
    success(res, await adminService.getCandidates());
  }),

  getCandidate: asyncHandler(async (req, res) => {
    success(res, await adminService.getCandidate(req.params.id));
  }),

  updateCandidate: asyncHandler(async (req, res) => {
    success(res, await adminService.updateCandidate(req.params.id, req.body));
  }),

  getCandidateApplications: asyncHandler(async (req, res) => {
    success(res, await adminService.getCandidateApplications(req.params.id));
  }),

  getEmployees: asyncHandler(async (_req, res) => {
    success(res, await adminService.getEmployees());
  }),

  createEmployee: asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) throw HttpError.badRequest('Email and password required');
    const emp = await adminService.createEmployee(email, password);
    success(res, { id: emp.id, email: emp.email, role: emp.role }, 201);
  }),

  deleteEmployee: asyncHandler(async (req, res) => {
    await adminService.deleteEmployee(req.params.id);
    success(res, { message: 'Deleted' });
  }),

  getPlans: asyncHandler(async (_req, res) => {
    success(res, await adminService.getPlans());
  }),

  createPlan: asyncHandler(async (req, res) => {
    success(res, await adminService.createPlan(req.body), 201);
  }),

  updatePlan: asyncHandler(async (req, res) => {
    success(res, await adminService.updatePlan(req.params.id, req.body));
  }),

  deletePlan: asyncHandler(async (req, res) => {
    await adminService.deletePlan(req.params.id);
    success(res, { message: 'Plan deleted' });
  }),

  getPrompts: asyncHandler(async (_req, res) => {
    success(res, await adminService.getPrompts());
  }),

  createPrompt: asyncHandler(async (req, res) => {
    success(res, await adminService.createPrompt(req.body), 201);
  }),

  updatePrompt: asyncHandler(async (req, res) => {
    success(res, await adminService.updatePrompt(req.params.id, req.body));
  }),

  deletePrompt: asyncHandler(async (req, res) => {
    await adminService.deletePrompt(req.params.id);
    success(res, { message: 'Prompt deleted' });
  }),

  getEmployeePerformance: asyncHandler(async (_req, res) => {
    success(res, await adminService.getEmployeePerformance());
  }),

  getEmployeePerformanceDetail: asyncHandler(async (req, res) => {
    success(res, await adminService.getEmployeePerformanceDetail(req.params.id));
  }),

  getAuditLog: asyncHandler(async (_req, res) => {
    success(res, await adminService.getAuditLog());
  }),

  getTransactions: asyncHandler(async (_req, res) => {
    success(res, await adminService.getTransactions());
  }),

  changePassword: asyncHandler(async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) throw HttpError.badRequest('Both passwords required');
    await adminService.changePassword(req.user!.id, currentPassword, newPassword);
    success(res, { message: 'Password updated' });
  }),

  getAiSettings: asyncHandler(async (_req, res) => {
    success(res, await aiConfigService.getMasked());
  }),

  updateAiSettings: asyncHandler(async (req, res) => {
    const { apiKey, model, cvParseModel, maxTokens } = req.body ?? {};
    const updated = await aiConfigService.update({
      apiKey,
      model,
      cvParseModel,
      maxTokens: maxTokens != null ? Number(maxTokens) : undefined,
    });
    success(res, updated);
  }),
};
