import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import { faqRepository } from '../repositories/faq.repository.js';
import { success } from '../utils/response.js';
import type { RequestHandler } from 'express';

const router = Router();

router.use(authenticate);

// Candidate fetches their own approved FAQ items
router.get('/', (async (req, res, next) => {
  try {
    const items = await faqRepository.findByCandidateId(req.user!.id);
    success(res, items);
  } catch (err) { next(err); }
}) as RequestHandler);

// Candidate approves/rejects a FAQ item
router.patch('/:id/approve', (async (req, res, next) => {
  try {
    const item = await faqRepository.findById(req.params.id);
    if (!item || item.candidateId !== req.user!.id) {
      return res.status(404).json({ success: false, error: 'FAQ item not found' });
    }
    const updated = await faqRepository.update(req.params.id, { isApproved: req.body.isApproved });
    success(res, updated);
  } catch (err) { next(err); }
}) as RequestHandler);

export default router;
