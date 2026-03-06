import { Router } from 'express';
import * as technicianRewardsController from '../controllers/technicianRewardsController';

const router = Router();

router.post('/technicians/register', technicianRewardsController.registerTechnician);
router.get('/technicians', technicianRewardsController.getTechnicians);
router.get('/missions', technicianRewardsController.getMissions);
router.post('/missions/:missionId/complete', technicianRewardsController.completeMission);
router.get('/rewards/catalog', technicianRewardsController.getRewardsCatalog);
router.post('/rewards/redeem', technicianRewardsController.redeemReward);

export default router;
