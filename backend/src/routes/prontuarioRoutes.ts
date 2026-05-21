import { Router } from 'express'
import * as ctrl from '../controllers/prontuarioController'
import { authenticateJWT, authorizeRoles } from '../middleware/auth'

const router = Router()

router.post('/', authenticateJWT, authorizeRoles('ADMIN','MEDICO'), ctrl.create)
router.get('/paciente/:paciente_id', authenticateJWT, ctrl.listByPaciente)
router.get('/:id', authenticateJWT, ctrl.getById)
router.put('/:id', authenticateJWT, ctrl.update)
router.put('/:id/autosave', authenticateJWT, ctrl.autosave)

export default router
