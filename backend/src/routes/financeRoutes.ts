import { Router } from 'express'
import * as ctrl from '../controllers/financeController'
import { authenticateJWT, authorizeRoles } from '../middleware/auth'

const router = Router()

router.get('/', authenticateJWT, authorizeRoles('ADMIN','RECEPCIONISTA'), ctrl.list)
router.put('/:id/pagamento', authenticateJWT, authorizeRoles('ADMIN','RECEPCIONISTA'), ctrl.pagamento)
router.get('/repasses', authenticateJWT, authorizeRoles('ADMIN','MEDICO'), ctrl.repasses)
router.get('/relatorio', authenticateJWT, authorizeRoles('ADMIN'), ctrl.relatorio)

export default router
