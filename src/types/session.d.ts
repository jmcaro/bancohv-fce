import { Role } from '@prisma/client'
import 'express-session'

declare module 'express-session' {
  interface SessionData {
    activeRole?: Role
  }
}
