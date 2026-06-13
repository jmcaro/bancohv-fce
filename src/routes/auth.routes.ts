import { Router } from 'express'
import passport from '../config/passport'

const router = Router()

router.get('/login', (req, res) => {
  if (req.isAuthenticated()) return res.redirect('/dashboard')
  const error = req.query.error as string | undefined
  res.render('pages/auth/login', { error })
})

router.get('/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
)

router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: '/auth/login?error=dominio' }),
  (req, res) => {
    res.redirect('/dashboard')
  }
)

router.post('/logout', (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err)
    res.redirect('/auth/login')
  })
})

export default router
