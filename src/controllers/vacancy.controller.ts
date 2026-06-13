import { Request, Response } from 'express'
import { prisma } from '../config/db'
import { z } from 'zod'

function userId(req: Request): string {
  return (req.user as any).id
}

// ─── Listado público de vacantes ──────────────────────────────────────────────

export async function listVacancies(req: Request, res: Response) {
  const { area, type, q } = req.query as Record<string, string>

  const vacancies = await prisma.vacancy.findMany({
    where: {
      status: 'OPEN',
      ...(area && { area }),
      ...(type && { type }),
      ...(q    && { title: { contains: q, mode: 'insensitive' } }),
    },
    include: { company: true },
    orderBy: { createdAt: 'desc' },
  })

  const areas = await prisma.vacancy.findMany({
    where: { status: 'OPEN' },
    select: { area: true },
    distinct: ['area'],
  })

  res.render('pages/vacancies/index', {
    vacancies,
    areas: areas.map(a => a.area),
    filters: { area, type, q },
    user: req.user,
  })
}

// ─── Detalle de vacante ───────────────────────────────────────────────────────

export async function showVacancy(req: Request, res: Response) {
  const vacancy = await prisma.vacancy.findUnique({
    where: { id: req.params.id },
    include: { company: true },
  })

  if (!vacancy || vacancy.status !== 'OPEN') {
    return res.status(404).render('pages/error', { message: 'Vacante no encontrada.' })
  }

  const applied = req.isAuthenticated()
    ? await prisma.application.findUnique({
        where: { userId_vacancyId: { userId: userId(req), vacancyId: vacancy.id } },
      })
    : null

  res.render('pages/vacancies/show', { vacancy, applied, user: req.user })
}

// ─── Postularse ───────────────────────────────────────────────────────────────

export async function apply(req: Request, res: Response) {
  const { vacancyId, coverLetter } = req.body

  const cv = await prisma.curriculumVitae.findUnique({ where: { userId: userId(req) } })
  if (!cv) {
    return res.redirect('/cv?error=sin-hv')
  }

  await prisma.application.upsert({
    where: { userId_vacancyId: { userId: userId(req), vacancyId } },
    update: { coverLetter },
    create: { userId: userId(req), vacancyId, coverLetter },
  })

  res.redirect(`/vacancies/${vacancyId}?applied=1`)
}

// ─── Mis postulaciones ────────────────────────────────────────────────────────

export async function myApplications(req: Request, res: Response) {
  const applications = await prisma.application.findMany({
    where: { userId: userId(req) },
    include: { vacancy: { include: { company: true } } },
    orderBy: { appliedAt: 'desc' },
  })

  res.render('pages/vacancies/my-applications', { applications, user: req.user })
}

// ─── Panel empresa: listar sus vacantes ──────────────────────────────────────

export async function companyVacancies(req: Request, res: Response) {
  const company = await prisma.company.findUnique({ where: { userId: userId(req) } })
  if (!company) return res.redirect('/company/setup')

  const vacancies = await prisma.vacancy.findMany({
    where: { companyId: company.id },
    include: { _count: { select: { applications: true } } },
    orderBy: { createdAt: 'desc' },
  })

  res.render('pages/company/vacancies', { vacancies, company, user: req.user })
}

// ─── Panel empresa: formulario nueva vacante ──────────────────────────────────

export async function newVacancyForm(req: Request, res: Response) {
  const companies = await prisma.company.findMany({ orderBy: { name: 'asc' } })
  const myCompany = await prisma.company.findUnique({ where: { userId: userId(req) } })
  res.render('pages/company/vacancy-form', { vacancy: null, companies, myCompany, user: req.user })
}

const vacancySchema = z.object({
  title:        z.string().min(1).max(200),
  description:  z.string().min(1),
  area:         z.string().min(1).max(100),
  type:         z.string().min(1).max(100),
  location:     z.string().max(100).optional(),
  salary:       z.string().max(100).optional(),
  requirements: z.string().optional(),
})

const vacancyCreateSchema = vacancySchema.extend({
  companyId:   z.string().optional(),
  newCompany:  z.string().max(200).optional(),
})

export async function createVacancy(req: Request, res: Response) {
  const data = vacancyCreateSchema.parse(req.body)

  let companyId = data.companyId

  // Si eligió crear una empresa nueva
  if (!companyId && data.newCompany?.trim()) {
    const created = await prisma.company.upsert({
      where:  { userId: userId(req) },
      update: { name: data.newCompany.trim() },
      create: { userId: userId(req), name: data.newCompany.trim() },
    })
    companyId = created.id
  }

  // Si no eligió nada, usar la empresa propia del usuario
  if (!companyId) {
    const mine = await prisma.company.findUnique({ where: { userId: userId(req) } })
    if (!mine) return res.redirect('/company/setup')
    companyId = mine.id
  }

  const { companyId: _, newCompany: __, ...vacancyData } = data
  const vacancy = await prisma.vacancy.create({
    data: { ...vacancyData, companyId, status: 'OPEN' },
  })

  res.redirect(`/vacancies/${vacancy.id}`)
}

export async function editVacancyForm(req: Request, res: Response) {
  const vacancy = await prisma.vacancy.findUnique({ where: { id: req.params.id } })
  if (!vacancy) return res.status(404).render('pages/error', { message: 'Vacante no encontrada.' })

  const companies  = await prisma.company.findMany({ orderBy: { name: 'asc' } })
  const myCompany  = await prisma.company.findUnique({ where: { userId: userId(req) } })

  res.render('pages/company/vacancy-form', { vacancy, companies, myCompany, user: req.user })
}

export async function updateVacancy(req: Request, res: Response) {
  const company = await prisma.company.findUnique({ where: { userId: userId(req) } })
  if (!company) return res.redirect('/company/setup')

  const data = vacancySchema.parse(req.body)
  await prisma.vacancy.updateMany({
    where: { id: req.params.id, companyId: company.id },
    data,
  })

  res.redirect('/company/vacancies')
}

export async function closeVacancy(req: Request, res: Response) {
  const company = await prisma.company.findUnique({ where: { userId: userId(req) } })
  if (!company) return res.redirect('/company/setup')

  await prisma.vacancy.updateMany({
    where: { id: req.params.id, companyId: company.id },
    data: { status: 'CLOSED' },
  })

  res.redirect('/company/vacancies')
}

// ─── Panel empresa: ver candidatos de una vacante ─────────────────────────────

export async function vacancyApplicants(req: Request, res: Response) {
  const company = await prisma.company.findUnique({ where: { userId: userId(req) } })
  if (!company) return res.redirect('/company/setup')

  const vacancy = await prisma.vacancy.findFirst({
    where: { id: req.params.id, companyId: company.id },
    include: {
      applications: {
        include: {
          user: { include: { cv: { include: { education: true, experience: true, skills: true } } } },
        },
        orderBy: { appliedAt: 'desc' },
      },
    },
  })

  if (!vacancy) return res.status(404).render('pages/error', { message: 'Vacante no encontrada.' })

  res.render('pages/company/applicants', { vacancy, user: req.user })
}

export async function updateApplicationStatus(req: Request, res: Response) {
  const { status, message } = req.body
  const allowed = ['PENDING', 'REVIEWED', 'ACCEPTED', 'REJECTED']
  if (!allowed.includes(status)) return res.redirect('back')

  await prisma.application.update({
    where: { id: req.params.appId },
    data: {
      status,
      ...(message?.trim() && { message: message.trim() }),
    },
  })

  res.redirect('back')
}

export async function candidateProfile(req: Request, res: Response) {
  const candidate = await prisma.user.findUnique({
    where: { id: req.params.userId },
    include: {
      cv: {
        include: {
          education:  true,
          experience: true,
          skills:     true,
          languages:  true,
          documents:  true,
        },
      },
    },
  })

  if (!candidate) return res.status(404).render('pages/error', { message: 'Candidato no encontrado.' })

  res.render('pages/company/candidate-profile', { candidate, user: req.user })
}

// ─── Setup perfil empresa ─────────────────────────────────────────────────────

export async function companySetupForm(req: Request, res: Response) {
  const company = await prisma.company.findUnique({ where: { userId: userId(req) } })
  res.render('pages/company/setup', { company, user: req.user })
}

const companySchema = z.object({
  name:        z.string().min(1).max(200),
  nit:         z.string().max(20).optional(),
  sector:      z.string().max(100).optional(),
  description: z.string().max(1000).optional(),
  website:     z.string().url().optional().or(z.literal('')),
})

export async function saveCompanySetup(req: Request, res: Response) {
  const data = companySchema.parse(req.body)

  await prisma.company.upsert({
    where:  { userId: userId(req) },
    update: data,
    create: { userId: userId(req), ...data },
  })

  res.redirect('/company/vacancies')
}
