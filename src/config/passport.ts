import passport from 'passport'
import { Strategy as GoogleStrategy } from 'passport-google-oauth20'
import { prisma } from './db'
import { env } from './env'
import { isInstitutionalEmail } from '../utils/auth'

passport.use(new GoogleStrategy(
  {
    clientID:     env.google.clientId,
    clientSecret: env.google.clientSecret,
    callbackURL:  env.google.callbackUrl,
  },
  async (_accessToken, _refreshToken, profile, done) => {
    try {
      const email = profile.emails?.[0]?.value ?? ''

      if (!isInstitutionalEmail(email)) {
        return done(null, false, { message: 'Solo se permiten correos institucionales de la Universidad del Atlántico.' })
      }

      const user = await prisma.user.upsert({
        where: { email },
        update: {
          name:     profile.displayName,
          googleId: profile.id,
          photo:    profile.photos?.[0]?.value,
        },
        create: {
          email,
          name:     profile.displayName,
          googleId: profile.id,
          photo:    profile.photos?.[0]?.value,
          roles:    ['STUDENT'],
        },
      })

      return done(null, user)
    } catch (err) {
      return done(err as Error)
    }
  }
))

passport.serializeUser((user: any, done) => {
  done(null, user.id)
})

passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await prisma.user.findUnique({ where: { id } })
    done(null, user)
  } catch (err) {
    done(err)
  }
})

export default passport
