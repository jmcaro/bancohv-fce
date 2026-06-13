import { Request, Response } from 'express'
import { prisma } from '../config/db'
import { z } from 'zod'
import fs from 'fs'

function userId(req: Request): string {
  return (req.user as any).id
}

// ─── Página principal de la HV ───────────────────────────────────────────────

export async function showCV(req: Request, res: Response) {
  const cv = await prisma.curriculumVitae.findUnique({
    where: { userId: userId(req) },
    include: { education: true, experience: true, skills: true, languages: true, documents: true },
  })
  res.render('pages/cv/index', { cv, user: req.user })
}

// ─── Datos personales ─────────────────────────────────────────────────────────

const personalSchema = z.object({
  summary: z.string().max(1000).optional(),
  phone:   z.string().max(20).optional(),
  city:    z.string().max(100).optional(),
})

export async function upsertPersonal(req: Request, res: Response) {
  const data = personalSchema.parse(req.body)
  const photo = req.file ? `/uploads/photos/${req.file.filename}` : undefined

  const existing = await prisma.curriculumVitae.findUnique({ where: { userId: userId(req) } })

  if (existing) {
    await prisma.curriculumVitae.update({
      where: { userId: userId(req) },
      data: { ...data, ...(photo && { photoUrl: photo }) },
    })
  } else {
    await prisma.curriculumVitae.create({
      data: { userId: userId(req), ...data, ...(photo && { photoUrl: photo }) },
    })
  }
  res.redirect('/cv')
}

// ─── Subir archivo de HV (PDF/Word) ──────────────────────────────────────────

export async function uploadCVFile(req: Request, res: Response) {
  if (!req.file) return res.redirect('/cv')
  const fileUrl = `/uploads/cv/${req.file.filename}`

  const existing = await prisma.curriculumVitae.findUnique({ where: { userId: userId(req) } })
  if (existing) {
    // Eliminar archivo anterior si existe
    if (existing.cvFileUrl) {
      const old = `src/public${existing.cvFileUrl}`
      if (fs.existsSync(old)) fs.unlinkSync(old)
    }
    await prisma.curriculumVitae.update({ where: { userId: userId(req) }, data: { cvFileUrl: fileUrl } })
  } else {
    await prisma.curriculumVitae.create({ data: { userId: userId(req), cvFileUrl: fileUrl } })
  }
  res.redirect('/cv')
}

// ─── Educación ────────────────────────────────────────────────────────────────

const educationSchema = z.object({
  institution: z.string().min(1).max(200),
  degree:      z.string().min(1).max(200),
  field:       z.string().max(200).optional(),
  startYear:   z.coerce.number().int().min(1950).max(2100),
  endYear:     z.preprocess(v => (v === '' || v === null ? undefined : v), z.coerce.number().int().min(1950).max(2100).optional()),
  current:     z.preprocess(v => v === 'true' || v === true, z.boolean()).optional(),
})

export async function addEducation(req: Request, res: Response) {
  const cv = await ensureCV(userId(req))
  const data = educationSchema.parse(req.body)
  await prisma.education.create({ data: { cvId: cv.id, ...data } })
  res.redirect('/cv#educacion')
}

export async function deleteEducation(req: Request, res: Response) {
  const cv = await prisma.curriculumVitae.findUnique({ where: { userId: userId(req) } })
  if (!cv) return res.redirect('/cv')
  await prisma.education.deleteMany({ where: { id: req.params.id, cvId: cv.id } })
  res.redirect('/cv#educacion')
}

// ─── Experiencia ──────────────────────────────────────────────────────────────

const experienceSchema = z.object({
  company:     z.string().min(1).max(200),
  position:    z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
  startDate:   z.coerce.date(),
  endDate:     z.preprocess(v => (v === '' || v === null ? undefined : v), z.coerce.date().optional()),
  current:     z.preprocess(v => v === 'true' || v === true, z.boolean()).optional(),
})

export async function addExperience(req: Request, res: Response) {
  const cv = await ensureCV(userId(req))
  const data = experienceSchema.parse(req.body)
  await prisma.experience.create({ data: { cvId: cv.id, ...data } })
  res.redirect('/cv#experiencia')
}

export async function deleteExperience(req: Request, res: Response) {
  const cv = await prisma.curriculumVitae.findUnique({ where: { userId: userId(req) } })
  if (!cv) return res.redirect('/cv')
  await prisma.experience.deleteMany({ where: { id: req.params.id, cvId: cv.id } })
  res.redirect('/cv#experiencia')
}

// ─── Habilidades ──────────────────────────────────────────────────────────────

export async function addSkill(req: Request, res: Response) {
  const cv = await ensureCV(userId(req))
  const { name, level } = req.body
  if (name?.trim()) {
    await prisma.skill.create({ data: { cvId: cv.id, name: name.trim(), level } })
  }
  res.redirect('/cv#habilidades')
}

export async function deleteSkill(req: Request, res: Response) {
  const cv = await prisma.curriculumVitae.findUnique({ where: { userId: userId(req) } })
  if (!cv) return res.redirect('/cv')
  await prisma.skill.deleteMany({ where: { id: req.params.id, cvId: cv.id } })
  res.redirect('/cv#habilidades')
}

// ─── Idiomas ──────────────────────────────────────────────────────────────────

export async function addLanguage(req: Request, res: Response) {
  const cv = await ensureCV(userId(req))
  const { name, level } = req.body
  if (name?.trim()) {
    await prisma.language.create({ data: { cvId: cv.id, name: name.trim(), level } })
  }
  res.redirect('/cv#idiomas')
}

export async function deleteLanguage(req: Request, res: Response) {
  const cv = await prisma.curriculumVitae.findUnique({ where: { userId: userId(req) } })
  if (!cv) return res.redirect('/cv')
  await prisma.language.deleteMany({ where: { id: req.params.id, cvId: cv.id } })
  res.redirect('/cv#idiomas')
}

// ─── Documentos / Soportes ────────────────────────────────────────────────────

export async function addDocument(req: Request, res: Response) {
  const cv = await ensureCV(userId(req))
  if (!req.file) return res.redirect('/cv#soportes')
  const { name, type } = req.body
  await prisma.document.create({
    data: {
      cvId:    cv.id,
      name:    name?.trim() || req.file.originalname,
      type:    type || 'otro',
      fileUrl: `/uploads/documents/${req.file.filename}`,
    },
  })
  res.redirect('/cv#soportes')
}

export async function deleteDocument(req: Request, res: Response) {
  const cv = await prisma.curriculumVitae.findUnique({ where: { userId: userId(req) } })
  if (!cv) return res.redirect('/cv')
  const doc = await prisma.document.findFirst({ where: { id: req.params.id, cvId: cv.id } })
  if (doc) {
    const filePath = `src/public${doc.fileUrl}`
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath)
    await prisma.document.delete({ where: { id: doc.id } })
  }
  res.redirect('/cv#soportes')
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function ensureCV(uid: string) {
  const cv = await prisma.curriculumVitae.findUnique({ where: { userId: uid } })
  if (cv) return cv
  return prisma.curriculumVitae.create({ data: { userId: uid } })
}
