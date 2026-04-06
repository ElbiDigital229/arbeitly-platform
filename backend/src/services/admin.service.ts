import { prisma } from '../config/prisma.js';
import { HttpError } from '../errors/HttpError.js';
import { activityService } from './activity.service.js';
import { comparePassword, hashPassword } from '../utils/hash.js';
import { signToken } from '../utils/jwt.js';
import { planRepository } from '../repositories/plan.repository.js';
import { adminPromptRepository } from '../repositories/admin-prompt.repository.js';
import type { CreatePlanDtoType, UpdatePlanDtoType } from '../dtos/plan.dto.js';
import type { CreateAdminPromptDtoType, UpdateAdminPromptDtoType } from '../dtos/admin-prompt.dto.js';

export const adminService = {
  async signin(email: string, password: string) {
    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } });
    if (!user) throw HttpError.unauthorized('Invalid email or password');
    if (user.role !== 'ADMIN') throw HttpError.forbidden('This account does not have admin access');
    const valid = await comparePassword(password, user.password);
    if (!valid) throw HttpError.unauthorized('Invalid email or password');
    const token = signToken({ id: user.id, email: user.email, role: user.role });
    activityService.log(user.id, 'account', 'Signed in', 'Admin portal');
    return { token, user: { id: user.id, email: user.email, role: user.role, createdAt: user.createdAt } };
  },

  async getDashboardStats() {
    const [candidates, employees, apps, accepted, paidCandidates, plans] = await Promise.all([
      prisma.user.count({ where: { role: 'CANDIDATE' } }),
      prisma.user.count({ where: { role: 'EMPLOYEE' } }),
      prisma.application.count(),
      prisma.application.count({ where: { status: 'ACCEPTED' } }),
      prisma.candidateProfile.count({ where: { planId: { not: null } } }),
      prisma.plan.findMany({
        where: { isActive: true },
        select: { id: true, name: true, price: true, _count: { select: { candidates: true } } },
        orderBy: { sortOrder: 'asc' },
      }),
    ]);
    const totalRevenue = plans.reduce((sum, p) => sum + p.price * p._count.candidates, 0);
    return { candidates, employees, totalApplications: apps, accepted, paidCandidates, plans, totalRevenue };
  },

  // ── Candidates ──
  async getCandidates(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      prisma.user.findMany({
        where: { role: 'CANDIDATE' },
        select: {
          id: true,
          email: true,
          role: true,
          createdAt: true,
          updatedAt: true,
          profile: { include: { plan: true } },
          assignedEmployee: { select: { id: true, email: true } },
          _count: { select: { applications: true, cvs: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.user.count({ where: { role: 'CANDIDATE' } }),
    ]);
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  },

  async getCandidate(id: string) {
    const user = await prisma.user.findFirst({
      where: { id, role: 'CANDIDATE' },
      select: {
        id: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        profile: true,
        assignedEmployee: { select: { id: true, email: true } },
      },
    });
    if (!user) throw HttpError.notFound('Candidate not found');
    return user;
  },

  async updateCandidate(id: string, data: { assignedEmployeeId?: string | null }) {
    if (data.assignedEmployeeId) {
      const candidate = await prisma.user.findUnique({
        where: { id },
        include: { profile: true },
      });
      if (!candidate) throw HttpError.notFound('Candidate not found');
      if (!candidate.profile?.planId) throw HttpError.badRequest('Only PAID candidates can be assigned to an employee');
      if (!candidate.profile?.onboardingCompleted) throw HttpError.badRequest('Candidate must complete onboarding before assignment');
    }
    return prisma.user.update({ where: { id }, data });
  },

  async getCandidateApplications(candidateId: string) {
    return prisma.application.findMany({ where: { userId: candidateId }, orderBy: { createdAt: 'desc' } });
  },

  // ── Employees ──
  async getEmployees() {
    const employees = await prisma.user.findMany({
      where: { role: 'EMPLOYEE' },
      select: { id: true, email: true, createdAt: true, _count: { select: { assignedCandidates: true } } },
      orderBy: { createdAt: 'desc' },
    });
    return employees;
  },

  async createEmployee(email: string, password: string) {
    const existing = await prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } });
    if (existing) throw HttpError.conflict('Email already exists');
    const hashed = await hashPassword(password);
    return prisma.user.create({ data: { email: email.toLowerCase().trim(), password: hashed, role: 'EMPLOYEE' } });
  },

  async deleteEmployee(id: string) {
    // Unassign candidates first
    await prisma.user.updateMany({ where: { assignedEmployeeId: id }, data: { assignedEmployeeId: null } });
    return prisma.user.delete({ where: { id } });
  },

  // ── Plans ──
  async getPlans() {
    return planRepository.findAll();
  },

  async createPlan(dto: CreatePlanDtoType) {
    if (dto.isActive) {
      const activeCount = await planRepository.countActive();
      if (activeCount >= 5) throw HttpError.badRequest('Maximum 5 active plans allowed');
    }
    return planRepository.create(dto);
  },

  async updatePlan(id: string, dto: UpdatePlanDtoType) {
    const existing = await planRepository.findById(id);
    if (!existing) throw HttpError.notFound('Plan not found');
    if (dto.isActive && !existing.isActive) {
      const activeCount = await planRepository.countActive();
      if (activeCount >= 5) throw HttpError.badRequest('Maximum 5 active plans allowed');
    }
    return planRepository.update(id, dto);
  },

  async deletePlan(id: string) {
    const existing = await planRepository.findById(id);
    if (!existing) throw HttpError.notFound('Plan not found');
    const candidateCount = await planRepository.countCandidates(id);
    if (candidateCount > 0) throw HttpError.badRequest(`Cannot delete plan with ${candidateCount} active candidate(s). Deactivate the plan instead.`);
    return planRepository.delete(id);
  },

  // ── Prompts ──
  async getPrompts() {
    return adminPromptRepository.findAll();
  },

  async createPrompt(dto: CreateAdminPromptDtoType) {
    return adminPromptRepository.create(dto);
  },

  async updatePrompt(id: string, dto: UpdateAdminPromptDtoType) {
    const existing = await adminPromptRepository.findById(id);
    if (!existing) throw HttpError.notFound('Prompt not found');
    return adminPromptRepository.update(id, { ...dto, version: existing.version + 1 });
  },

  async deletePrompt(id: string) {
    const existing = await adminPromptRepository.findById(id);
    if (!existing) throw HttpError.notFound('Prompt not found');
    return adminPromptRepository.delete(id);
  },

  // ── Performance ──
  async getEmployeePerformance() {
    const employees = await prisma.user.findMany({
      where: { role: 'EMPLOYEE' },
      select: { id: true, email: true, createdAt: true, _count: { select: { assignedCandidates: true } } },
    });

    const stats = await Promise.all(employees.map(async emp => {
      const apps = await prisma.application.findMany({
        where: { addedById: emp.id },
        select: { status: true },
      });
      const jobsAdded = await prisma.jobDiscovery.count({ where: { addedById: emp.id } });
      const applied = apps.filter(a => a.status !== 'TO_APPLY').length;
      const interviews = apps.filter(a => a.status === 'INTERVIEW').length;
      const accepted = apps.filter(a => a.status === 'ACCEPTED').length;

      return {
        id: emp.id,
        email: emp.email,
        candidates: emp._count.assignedCandidates,
        applicationsFiled: applied,
        interviews,
        accepted,
        interviewRatio: applied > 0 ? Math.round((interviews / applied) * 100) : 0,
        jobsAdded,
      };
    }));

    return stats;
  },

  async getEmployeePerformanceDetail(employeeId: string) {
    const apps = await prisma.application.findMany({
      where: { addedById: employeeId },
      select: { status: true, createdAt: true, companyName: true, jobTitle: true },
      orderBy: { createdAt: 'desc' },
    });
    const jobsAdded = await prisma.jobDiscovery.count({ where: { addedById: employeeId } });

    const applied = apps.filter(a => a.status !== 'TO_APPLY').length;
    const interviews = apps.filter(a => a.status === 'INTERVIEW').length;
    const accepted = apps.filter(a => a.status === 'ACCEPTED').length;

    return {
      applicationsFiled: applied,
      interviews,
      accepted,
      interviewRatio: applied > 0 ? Math.round((interviews / applied) * 100) : 0,
      jobsAdded,
      recentApplications: apps.slice(0, 20),
    };
  },

  // ── Audit / Activity ──
  async getAuditLog(limit = 100) {
    return prisma.activityLog.findMany({
      include: {
        user: { select: { id: true, email: true, role: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  },

  // ── Transactions ──
  async getTransactions() {
    return prisma.transaction.findMany({
      include: {
        user: { select: { id: true, email: true, profile: { select: { firstName: true, lastName: true } } } },
        plan: { select: { name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  },

  // ── Admin profile ──
  async changePassword(adminId: string, currentPassword: string, newPassword: string) {
    const user = await prisma.user.findUnique({ where: { id: adminId } });
    if (!user) throw HttpError.notFound('User not found');
    const valid = await comparePassword(currentPassword, user.password);
    if (!valid) throw HttpError.unauthorized('Current password is incorrect');
    const hashed = await hashPassword(newPassword);
    return prisma.user.update({ where: { id: adminId }, data: { password: hashed } });
  },
};
