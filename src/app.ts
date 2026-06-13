import 'dotenv/config'
import express from 'express'
import session from 'express-session'
import path from 'path'
import passport from './config/passport'
import { env } from './config/env'
import router from './routes/index'
import { getActiveRole } from './middlewares/auth.middleware'

const app = express()

// Vistas EJS
app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'))

// Archivos estáticos
app.use(express.static(path.join(__dirname, 'public')))
app.use('/uploads', express.static(path.join(process.cwd(), env.uploadDir)))

// Body parser
app.use(express.urlencoded({ extended: true }))
app.use(express.json())

// Sesión
app.use(session({
  secret:            env.sessionSecret,
  resave:            false,
  saveUninitialized: false,
  cookie: {
    secure:   env.nodeEnv === 'production',
    httpOnly: true,
    maxAge:   1000 * 60 * 60 * 24 * 7, // 7 días
  },
}))

// Passport
app.use(passport.initialize())
app.use(passport.session())

// Variable global para vistas
app.use((req, res, next) => {
  res.locals.user       = req.user ?? null
  res.locals.activeRole = getActiveRole(req)
  next()
})

// Rutas
app.use('/', router)

// 404
app.use((req, res) => {
  res.status(404).render('pages/error', { message: 'Página no encontrada.' })
})

app.listen(env.port, () => {
  console.log(`Servidor corriendo en http://localhost:${env.port}`)
})

export default app
