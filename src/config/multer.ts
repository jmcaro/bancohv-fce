import multer from 'multer'
import path from 'path'
import fs from 'fs'
import { env } from './env'

function ensureDir(dir: string) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
}

function storage(subfolder: string) {
  return multer.diskStorage({
    destination: (_req, _file, cb) => {
      const dir = path.join(env.uploadDir, subfolder)
      ensureDir(dir)
      cb(null, dir)
    },
    filename: (_req, file, cb) => {
      const unique = `${Date.now()}-${Math.round(Math.random() * 1e6)}`
      cb(null, `${unique}${path.extname(file.originalname)}`)
    },
  })
}

const MB = 1024 * 1024

export const uploadPhoto = multer({
  storage: storage('photos'),
  limits: { fileSize: 3 * MB },
  fileFilter: (_req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Solo se permiten imágenes.'))
    }
    cb(null, true)
  },
})

export const uploadCV = multer({
  storage: storage('cv'),
  limits: { fileSize: env.maxFileSizeMb * MB },
  fileFilter: (_req, file, cb) => {
    const allowed = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ]
    if (!allowed.includes(file.mimetype)) {
      return cb(new Error('Solo se permiten archivos PDF o Word.'))
    }
    cb(null, true)
  },
})

export const uploadDocument = multer({
  storage: storage('documents'),
  limits: { fileSize: env.maxFileSizeMb * MB },
  fileFilter: (_req, file, cb) => {
    const allowed = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'image/jpeg',
      'image/png',
    ]
    if (!allowed.includes(file.mimetype)) {
      return cb(new Error('Formato no permitido.'))
    }
    cb(null, true)
  },
})
