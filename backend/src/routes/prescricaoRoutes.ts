import { Router } from 'express'
import * as ctrl from '../controllers/prescricaoController'
import { authenticateJWT, authorizeRoles } from '../middleware/auth'

const router = Router()

router.post('/:id/prescricoes', authenticateJWT, authorizeRoles('ADMIN','MEDICO'), ctrl.create)
router.get('/:id/prescricoes', authenticateJWT, ctrl.list)
router.delete('/prescricoes/:id', authenticateJWT, authorizeRoles('ADMIN','MEDICO'), ctrl.remove)

export default router
