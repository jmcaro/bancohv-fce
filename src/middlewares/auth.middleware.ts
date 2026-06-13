import { Request, Response, NextFunction } from 'express'
import { Role } from '@prisma/client'

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (req.isAuthenticated()) return next()
  res.redirect('/auth/login')
}

export function getActiveRole(req: Request): Role | null {
  const user = req.user as any
  if (!user) return null
  const roles: Role[] = user.roles ?? []
  const active = req.session.activeRole
  if (active && roles.includes(active)) return active
  return roles[0] ?? null
}

export function requireRole(...roles: Role[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const user  = req.user as any
    const active = getActiveRole(req)
    const userRoles: Role[] = user?.roles ?? []
    // Pasa si el rol activo coincide O si el usuario tiene ADMIN en sus roles
    if ((active && roles.includes(active)) || userRoles.includes('ADMIN')) return next()
    res.status(403).render('pages/error', { message: 'No tienes permiso para acceder a esta página.' })
  }
}
