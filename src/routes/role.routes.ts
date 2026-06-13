import { Router } from 'express'
import { requireAuth } from '../middlewares/auth.middleware'
import { Role } from '@prisma/client'

const router = Router()

router.post('/switch', requireAuth, (req, res) => {
  const user = req.user as any
  const { role } = req.body as { role: Role }
  const roles: Role[] = user.roles ?? []

  if (roles.includes(role)) {
    req.session.activeRole = role
  }

  res.redirect('back')
})

export default router
