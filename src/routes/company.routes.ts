import { Router } from 'express'
import { requireAuth, requireRole } from '../middlewares/auth.middleware'
import * as v from '../controllers/vacancy.controller'

const router = Router()

router.use(requireAuth)
router.use(requireRole('LIDER', 'ADMIN'))


router.get('/setup',                        v.companySetupForm)
router.post('/setup',                       v.saveCompanySetup)
router.get('/vacancies',                    v.companyVacancies)
router.get('/vacancies/new',                v.newVacancyForm)
router.post('/vacancies',                   v.createVacancy)
router.get('/vacancies/:id/edit',           v.editVacancyForm)
router.post('/vacancies/:id',               v.updateVacancy)
router.post('/vacancies/:id/close',         v.closeVacancy)
router.get('/vacancies/:id/applicants',     v.vacancyApplicants)
router.post('/applications/:appId/status',  v.updateApplicationStatus)
router.get('/candidates/:userId',           v.candidateProfile)

export default router
