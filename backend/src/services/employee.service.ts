import { prisma } from '../config/prisma.js';
import { HttpError } from '../errors/HttpError.js';
import { comparePassword, hashPassword } from '../utils/hash.js';
import { signToken } from '../utils/jwt.js';

export const employeeService = {
  async signin(email: string, password: string) {
    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } });
    if (!user) throw HttpError.unauthorized('Invalid email or password');
    if (user.role !== 'EMPLOYEE') throw HttpError.forbidden('This account does not have employee access');

    const valid = await comparePassword(password, user.password);
    if (!valid) throw HttpError.unauthorized('Invalid email or password');

    const token = signToken({ id: user.id, email: user.email, role: user.role });
    return { token, user: { id: user.id, email: user.email, role: user.role, createdAt: user.createdAt } };
  },

  async getAssignedCandidates(employeeId: string) {
    const candidates = await prisma.user.findMany({
      where: { assignedEmployeeId: employeeId, role: 'CANDIDATE' },
      include: {
        profile: true,
        _count: { select: { applications: true, cvs: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Get application stats per candidate
    const result = [];
    for (const c of candidates) {
      const statusCounts = await prisma.application.groupBy({
        by: ['status'],
        where: { userId: c.id },
        _count: true,
      });
      const stats: Record<string, number> = {};
      for (const s of statusCounts) {
        stats[s.status] = s._count;
      }
      result.push({
        id: c.id,
        email: c.email,
        createdAt: c.createdAt,
        profile: c.profile,
        totalApplications: c._count.applications,
        totalCvs: c._count.cvs,
        stats,
      });
    }
    return result;
  },

  async getCandidate(employeeId: string, candidateId: string) {
    const candidate = await prisma.user.findFirst({
      where: { id: candidateId, assignedEmployeeId: employeeId, role: 'CANDIDATE' },
      include: { profile: true },
    });
    if (!candidate) throw HttpError.notFound('Candidate not found or not assigned to you');
    return candidate;
  },

  async getCandidateApplications(employeeId: string, candidateId: string) {
    // Verify assignment
    const candidate = await prisma.user.findFirst({
      where: { id: candidateId, assignedEmployeeId: employeeId },
    });
    if (!candidate) throw HttpError.notFound('Candidate not found or not assigned to you');

    return prisma.application.findMany({
      where: { userId: candidateId },
      orderBy: { createdAt: 'desc' },
    });
  },

  async createCandidateApplication(employeeId: string, candidateId: string, data: {
    jobTitle: string; companyName: string; jobUrl?: string; status?: string;
    salary?: string; contactPerson?: string; nextAction?: string; notes?: string; jobDescription?: string;
  }) {
    const candidate = await prisma.user.findFirst({
      where: { id: candidateId, assignedEmployeeId: employeeId },
    });
    if (!candidate) throw HttpError.notFound('Candidate not found or not assigned to you');

    return prisma.application.create({
      data: {
        ...data,
        status: (data.status as any) || 'TO_APPLY',
        addedById: employeeId,
        source: 'platform',
        user: { connect: { id: candidateId } },
      },
    });
  },

  async updateCandidateApplication(employeeId: string, candidateId: string, appId: string, data: any) {
    const candidate = await prisma.user.findFirst({
      where: { id: candidateId, assignedEmployeeId: employeeId },
    });
    if (!candidate) throw HttpError.notFound('Candidate not found or not assigned to you');

    const app = await prisma.application.findFirst({ where: { id: appId, userId: candidateId } });
    if (!app) throw HttpError.notFound('Application not found');

    return prisma.application.update({ where: { id: appId }, data });
  },

  async deleteCandidateApplication(employeeId: string, candidateId: string, appId: string) {
    const candidate = await prisma.user.findFirst({
      where: { id: candidateId, assignedEmployeeId: employeeId },
    });
    if (!candidate) throw HttpError.notFound('Candidate not found or not assigned to you');

    return prisma.application.delete({ where: { id: appId } });
  },

  async getDashboardStats(employeeId: string) {
    const candidateCount = await prisma.user.count({ where: { assignedEmployeeId: employeeId, role: 'CANDIDATE' } });
    const candidateIds = (await prisma.user.findMany({
      where: { assignedEmployeeId: employeeId, role: 'CANDIDATE' },
      select: { id: true },
    })).map(c => c.id);

    const totalApps = candidateIds.length > 0
      ? await prisma.application.count({ where: { userId: { in: candidateIds } } })
      : 0;
    const interviews = candidateIds.length > 0
      ? await prisma.application.count({ where: { userId: { in: candidateIds }, status: 'INTERVIEW' } })
      : 0;
    const accepted = candidateIds.length > 0
      ? await prisma.application.count({ where: { userId: { in: candidateIds }, status: 'ACCEPTED' } })
      : 0;

    return { candidateCount, totalApplications: totalApps, interviews, accepted };
  },

  async updateProfile(employeeId: string, data: { email?: string }) {
    return prisma.user.update({ where: { id: employeeId }, data });
  },

  async changePassword(employeeId: string, currentPassword: string, newPassword: string) {
    const user = await prisma.user.findUnique({ where: { id: employeeId } });
    if (!user) throw HttpError.notFound('User not found');
    const valid = await comparePassword(currentPassword, user.password);
    if (!valid) throw HttpError.unauthorized('Current password is incorrect');
    const hashed = await hashPassword(newPassword);
    return prisma.user.update({ where: { id: employeeId }, data: { password: hashed } });
  },
};
