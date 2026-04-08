import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import { matchingService } from '../services/matching.service.js';
import { HttpError } from '../errors/HttpError.js';
import { prisma } from '../config/prisma.js';

const router = Router();

router.use(authenticate);

/**
 * GET /api/browse-jobs
 * Candidate-facing: returns all published jobs with match scores,
 * sorted by best fit first.
 */
router.get('/', async (req, res, next) => {
  try {
    if (req.user?.role !== 'CANDIDATE') {
      throw HttpError.forbidden('Candidates only');
    }
    const results = await matchingService.scoreAllJobsForCandidate(req.user.id);
    res.json({ success: true, data: results });
  } catch (e) { next(e); }
});

/**
 * GET /api/browse-jobs/:id
 * Single job with full match breakdown for the current candidate.
 */
router.get('/:id', async (req, res, next) => {
  try {
    if (req.user?.role !== 'CANDIDATE') {
      throw HttpError.forbidden('Candidates only');
    }
    const job = await prisma.jobDiscovery.findFirst({
      where: { id: req.params.id, isPublished: true },
    });
    if (!job) throw HttpError.notFound('Job not found');

    const profile = await prisma.candidateProfile.findUnique({
      where: { userId: req.user.id },
    });
    if (!profile) throw HttpError.notFound('Profile not found');

    const match = await matchingService.score(
      {
        currentRoleId: profile.currentRoleId,
        targetRoleIds: profile.targetRoleIds,
        targetIndustryIds: profile.targetIndustryIds,
        skillIds: profile.skillIds,
        yearsExperienceMin: profile.yearsExperienceMin,
        yearsExperienceMax: profile.yearsExperienceMax,
        salaryMin: profile.salaryMin,
        salaryMax: profile.salaryMax,
        salaryCurrency: profile.salaryCurrency,
        baseCity: profile.baseCity,
        baseCountry: profile.baseCountry,
        acceptsRemote: profile.acceptsRemote,
        willingToRelocate: profile.willingToRelocate,
        acceptedCities: profile.acceptedCities,
        candidateLanguages: (profile.candidateLanguages as any) ?? [],
        workAuth: profile.workAuth,
      },
      {
        id: job.id,
        roleId: job.roleId,
        roleFamily: job.roleFamily,
        skillIds: job.skillIds,
        industryIds: job.industryIds,
        city: job.city,
        country: job.country,
        remote: job.remote,
        salaryMin: job.salaryMin,
        salaryMax: job.salaryMax,
        salaryCurrency: job.salaryCurrency,
        yearsExperienceMin: job.yearsExperienceMin,
        yearsExperienceMax: job.yearsExperienceMax,
        languagesRequired: job.languagesRequired,
        workAuthRequired: job.workAuthRequired,
      },
    );

    res.json({ success: true, data: { job, match } });
  } catch (e) { next(e); }
});

export default router;
