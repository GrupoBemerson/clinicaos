import { Router } from 'express'
import * as ctrl from '../controllers/consultaController'
import { authenticateJWT, authorizeRoles } from '../middleware/auth'

const router = Router()

router.post('/', authenticateJWT, authorizeRoles('ADMIN','RECEPCIONISTA'), ctrl.create)
router.get('/', authenticateJWT, ctrl.list)
router.put('/:id', authenticateJWT, authorizeRoles('ADMIN','RECEPCIONISTA','MEDICO'), ctrl.update)
router.put('/:id/status', authenticateJWT, authorizeRoles('ADMIN','RECEPCIONISTA','MEDICO'), ctrl.updateStatus)
router.delete('/:id', authenticateJWT, authorizeRoles('ADMIN','RECEPCIONISTA'), ctrl.cancel)
router.put('/:id/presenca', authenticateJWT, authorizeRoles('ADMIN','RECEPCIONISTA','MEDICO'), ctrl.presenca)

router.get('/hoje', authenticateJWT, ctrl.listToday)

export default router
