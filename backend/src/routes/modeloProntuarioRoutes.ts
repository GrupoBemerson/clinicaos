import { Router } from 'express'
import * as ctrl from '../controllers/modeloProntuarioController'

const router = Router()

router.get('/', ctrl.listByEspecialidade)

export default router
