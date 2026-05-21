import { Router } from 'express'
import * as ctrl from '../controllers/pacienteController'
import { authenticateJWT } from '../middleware/auth'

const router = Router()

router.get('/:id/faltas', authenticateJWT, ctrl.faltas)

export default router
