import { prisma } from '../config/prisma.js';
import { HttpError } from '../errors/HttpError.js';
import { comparePassword, hashPassword } from '../utils/hash.js';
import { signToken } from '../utils/jwt.js';

export const adminService = {
  async signin(email: string, password: string) {
    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } });
    if (!user) throw HttpError.unauthorized('Invalid email or password');
    if (user.role !== 'ADMIN') throw HttpError.forbidden('This account does not have admin access');
    const valid = await comparePassword(password, user.password);
    if (!valid) throw HttpError.unauthorized('Invalid email or password');
    const token = signToken({ id: user.id, email: user.email, role: user.role });
    return { token, user: { id: user.id, email: user.email, role: user.role, createdAt: user.createdAt } };
  },

  async getDashboardStats() {
    const [candidates, employees, apps, accepted] = await Promise.all([
      prisma.user.count({ where: { role: 'CANDIDATE' } }),
      prisma.user.count({ where: { role: 'EMPLOYEE' } }),
      prisma.application.count(),
      prisma.application.count({ where: { status: 'ACCEPTED' } }),
    ]);
    return { candidates, employees, totalApplications: apps, accepted };
  },

  // ── Candidates ──
  async getCandidates() {
    return prisma.user.findMany({
      where: { role: 'CANDIDATE' },
      include: {
        profile: true,
        assignedEmployee: { select: { id: true, email: true } },
        _count: { select: { applications: true, cvs: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  },

  async getCandidate(id: string) {
    const user = await prisma.user.findFirst({
      where: { id, role: 'CANDIDATE' },
      include: { profile: true, assignedEmployee: { select: { id: true, email: true } } },
    });
    if (!user) throw HttpError.notFound('Candidate not found');
    return user;
  },

  async updateCandidate(id: string, data: { assignedEmployeeId?: string | null }) {
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
