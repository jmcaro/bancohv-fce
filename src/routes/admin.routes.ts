import { Router } from 'express'
import { requireAuth, requireRole } from '../middlewares/auth.middleware'
import * as admin from '../controllers/admin.controller'

const router = Router()

router.use(requireAuth)
router.use(requireRole('ADMIN'))

router.get('/',                           admin.dashboard)
router.get('/users',                      admin.listUsers)
router.post('/users/:id/role',            admin.changeUserRole)
router.post('/users/:id/delete',          admin.deleteUser)
router.get('/users/:id/cv',               admin.viewUserCV)
router.get('/vacancies',                  admin.listAllVacancies)
router.post('/vacancies/:id/status',      admin.setVacancyStatus)
router.post('/vacancies/:id/delete',      admin.deleteVacancy)

export default router
