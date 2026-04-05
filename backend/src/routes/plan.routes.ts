import { Router } from 'express';
import { planController } from '../controllers/plan.controller.js';

const router = Router();

router.get('/', planController.getActivePlans);

export default router;
