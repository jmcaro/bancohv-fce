import { Router } from 'express'
import { requireAuth, requireRole } from '../middlewares/auth.middleware'
import * as v from '../controllers/vacancy.controller'

const router = Router()

// Públicas (requieren login)
router.get('/',              requireAuth, v.listVacancies)
router.get('/:id',           requireAuth, v.showVacancy)
router.post('/apply',        requireAuth, v.apply)
router.get('/me/applied',    requireAuth, v.myApplications)

export default router
