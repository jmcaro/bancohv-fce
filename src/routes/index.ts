import { Router } from 'express'
import authRoutes    from './auth.routes'
import cvRoutes      from './cv.routes'
import vacancyRoutes from './vacancy.routes'
import companyRoutes from './company.routes'
import adminRoutes   from './admin.routes'
import roleRoutes    from './role.routes'
import { requireAuth } from '../middlewares/auth.middleware'

const router = Router()

router.use('/auth',     authRoutes)
router.use('/cv',       cvRoutes)
router.use('/vacancies',vacancyRoutes)
router.use('/company',  companyRoutes)
router.use('/admin',    adminRoutes)
router.use('/role',     roleRoutes)

router.get('/', (req, res) => {
  if (req.isAuthenticated()) return res.redirect('/dashboard')
  res.redirect('/auth/login')
})

router.get('/dashboard', requireAuth, (req, res) => {
  res.render('pages/dashboard/index', { user: req.user })
})

router.get('/applications', requireAuth, (req, res) => {
  res.redirect('/vacancies/me/applied')
})

export default router
