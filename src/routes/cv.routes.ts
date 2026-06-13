import { Router } from 'express'
import { requireAuth } from '../middlewares/auth.middleware'
import { uploadPhoto, uploadCV, uploadDocument } from '../config/multer'
import * as cv from '../controllers/cv.controller'

const router = Router()

router.use(requireAuth)

router.get('/',                                           cv.showCV)
router.post('/personal',  uploadPhoto.single('photo'),   cv.upsertPersonal)
router.post('/cv-file',   uploadCV.single('cvFile'),     cv.uploadCVFile)

router.post('/education',           cv.addEducation)
router.post('/education/:id/delete',cv.deleteEducation)

router.post('/experience',            cv.addExperience)
router.post('/experience/:id/delete', cv.deleteExperience)

router.post('/skills',           cv.addSkill)
router.post('/skills/:id/delete',cv.deleteSkill)

router.post('/languages',            cv.addLanguage)
router.post('/languages/:id/delete', cv.deleteLanguage)

router.post('/documents',            uploadDocument.single('file'), cv.addDocument)
router.post('/documents/:id/delete', cv.deleteDocument)

export default router
