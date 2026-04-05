import { prisma } from '../config/prisma.js';
import { HttpError } from '../errors/HttpError.js';
import { comparePassword, hashPassword } from '../utils/hash.js';
import { signToken } from '../utils/jwt.js';
import { faqRepository } from '../repositories/faq.repository.js';

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

  async verifyAssignment(employeeId: string, candidateId: string) {
    const candidate = await prisma.user.findFirst({
      where: { id: candidateId, assignedEmployeeId: employeeId },
    });
    if (!candidate) throw HttpError.notFound('Candidate not found or not assigned to you');
    return candidate;
  },

  async getCandidateOnboarding(employeeId: string, candidateId: string) {
    await this.verifyAssignment(employeeId, candidateId);
    const profile = await prisma.candidateProfile.findUnique({ where: { userId: candidateId } });
    if (!profile) throw HttpError.notFound('Candidate profile not found');
    return {
      firstName: profile.firstName,
      lastName: profile.lastName,
      phone: profile.phone,
      location: profile.location,
      bio: profile.bio,
      linkedinUrl: profile.linkedinUrl,
      portfolioUrl: profile.portfolioUrl,
      baseCoverLetter: profile.baseCoverLetter,
      dummyEmail: profile.dummyEmail,
      dummyPassword: profile.dummyPassword,
      preferredLanguage: profile.preferredLanguage,
      onboardingCompleted: profile.onboardingCompleted,
    };
  },

  async getCandidateCVs(employeeId: string, candidateId: string) {
    await this.verifyAssignment(employeeId, candidateId);
    return prisma.cV.findMany({
      where: { userId: candidateId },
      include: {
        children: { include: { children: true }, orderBy: { createdAt: 'desc' } },
      },
      orderBy: [{ isBase: 'desc' }, { createdAt: 'desc' }],
    });
  },

  async getCandidateCLs(employeeId: string, candidateId: string) {
    await this.verifyAssignment(employeeId, candidateId);
    return prisma.coverLetter.findMany({
      where: { userId: candidateId },
      include: {
        children: { include: { children: true }, orderBy: { createdAt: 'desc' } },
      },
      orderBy: [{ isBase: 'desc' }, { createdAt: 'desc' }],
    });
  },

  async getPerformanceStats(employeeId: string) {
    const apps = await prisma.application.findMany({
      where: { addedById: employeeId },
      select: { status: true },
    });
    const jobsAdded = await prisma.jobDiscovery.count({ where: { addedById: employeeId } });
    const applied = apps.filter(a => a.status !== 'TO_APPLY').length;
    const interviews = apps.filter(a => a.status === 'INTERVIEW').length;
    const offers = apps.filter(a => a.status === 'OFFER').length;
    const accepted = apps.filter(a => a.status === 'ACCEPTED').length;

    return {
      applicationsFiled: applied,
      interviews,
      offers,
      accepted,
      interviewRatio: applied > 0 ? Math.round((interviews / applied) * 100) : 0,
      jobsAdded,
    };
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

  // FAQ
  async getCandidateFaq(employeeId: string, candidateId: string) {
    await this.verifyAssignment(employeeId, candidateId);
    return faqRepository.findByCandidateId(candidateId);
  },

  async createFaqItem(employeeId: string, candidateId: string, data: { question: string; answer: string; category?: string }) {
    await this.verifyAssignment(employeeId, candidateId);
    return faqRepository.create({
      question: data.question,
      answer: data.answer,
      category: data.category,
      candidate: { connect: { id: candidateId } },
      employee: { connect: { id: employeeId } },
    });
  },

  async updateFaqItem(employeeId: string, candidateId: string, faqId: string, data: any) {
    await this.verifyAssignment(employeeId, candidateId);
    const item = await faqRepository.findById(faqId);
    if (!item || item.candidateId !== candidateId) throw HttpError.notFound('FAQ item not found');
    return faqRepository.update(faqId, data);
  },

  async deleteFaqItem(employeeId: string, candidateId: string, faqId: string) {
    await this.verifyAssignment(employeeId, candidateId);
    const item = await faqRepository.findById(faqId);
    if (!item || item.candidateId !== candidateId) throw HttpError.notFound('FAQ item not found');
    return faqRepository.delete(faqId);
  },
};
