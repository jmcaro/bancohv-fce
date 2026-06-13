import { Request, Response } from 'express'
import { prisma } from '../config/db'
import { Role, VacancyStatus } from '@prisma/client'

// ─── Dashboard con estadísticas ───────────────────────────────────────────────

export async function dashboard(req: Request, res: Response) {
  const [totalUsers, totalCVs, totalVacancies, totalApplications, recentUsers, recentApplications] =
    await Promise.all([
      prisma.user.count(),
      prisma.curriculumVitae.count(),
      prisma.vacancy.count({ where: { status: 'OPEN' } }),
      prisma.application.count(),
      prisma.user.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: { id: true, name: true, email: true, roles: true, createdAt: true },
      }),
      prisma.application.findMany({
        orderBy: { appliedAt: 'desc' },
        take: 5,
        include: {
          user:    { select: { name: true } },
          vacancy: { select: { title: true } },
        },
      }),
    ])

  res.render('pages/admin/dashboard', {
    stats: { totalUsers, totalCVs, totalVacancies, totalApplications },
    recentUsers,
    recentApplications,
    user: req.user,
  })
}

// ─── Gestión de usuarios ──────────────────────────────────────────────────────

export async function listUsers(req: Request, res: Response) {
  const { role, q } = req.query as Record<string, string>

  const users = await prisma.user.findMany({
    where: {
      ...(role && { role: role as Role }),
      ...(q    && {
        OR: [
          { name:  { contains: q, mode: 'insensitive' } },
          { email: { contains: q, mode: 'insensitive' } },
        ],
      }),
    },
    include: { _count: { select: { applications: true } } },
    orderBy: { createdAt: 'desc' },
  })

  res.render('pages/admin/users', { users, filters: { role, q }, user: req.user })
}

export async function changeUserRole(req: Request, res: Response) {
  const allowed: Role[] = ['STUDENT', 'LIDER', 'ADMIN']
  const raw   = req.body.roles
  const roles: Role[] = (Array.isArray(raw) ? raw : [raw]).filter((r): r is Role => allowed.includes(r))
  if (roles.length === 0) return res.redirect('/admin/users')

  await prisma.user.update({ where: { id: req.params.id }, data: { roles } })
  res.redirect('/admin/users')
}

export async function deleteUser(req: Request, res: Response) {
  const me = (req.user as any).id
  if (req.params.id === me) return res.redirect('/admin/users?error=self')
  await prisma.user.delete({ where: { id: req.params.id } })
  res.redirect('/admin/users')
}

// ─── Gestión de vacantes ──────────────────────────────────────────────────────

export async function listAllVacancies(req: Request, res: Response) {
  const { status, q } = req.query as Record<string, string>

  const vacancies = await prisma.vacancy.findMany({
    where: {
      ...(status && { status: status as VacancyStatus }),
      ...(q      && { title: { contains: q, mode: 'insensitive' } }),
    },
    include: {
      company:  true,
      _count: { select: { applications: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  res.render('pages/admin/vacancies', { vacancies, filters: { status, q }, user: req.user })
}

export async function setVacancyStatus(req: Request, res: Response) {
  const { status } = req.body
  const allowed: VacancyStatus[] = ['OPEN', 'CLOSED', 'DRAFT']
  if (!allowed.includes(status)) return res.redirect('/admin/vacancies')

  await prisma.vacancy.update({ where: { id: req.params.id }, data: { status } })
  res.redirect('/admin/vacancies')
}

export async function deleteVacancy(req: Request, res: Response) {
  await prisma.vacancy.delete({ where: { id: req.params.id } })
  res.redirect('/admin/vacancies')
}

// ─── Ver HV de un usuario ─────────────────────────────────────────────────────

export async function viewUserCV(req: Request, res: Response) {
  const target = await prisma.user.findUnique({
    where: { id: req.params.id },
    include: {
      cv: {
        include: { education: true, experience: true, skills: true, languages: true, documents: true },
      },
    },
  })

  if (!target) return res.status(404).render('pages/error', { message: 'Usuario no encontrado.' })

  res.render('pages/admin/user-cv', { target, user: req.user })
}
