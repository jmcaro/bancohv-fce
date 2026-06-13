import dotenv from 'dotenv'
dotenv.config()

export const env = {
  port:               Number(process.env.PORT ?? 3000),
  nodeEnv:            process.env.NODE_ENV ?? 'development',
  sessionSecret:      process.env.SESSION_SECRET ?? 'dev-secret',
  databaseUrl:        process.env.DATABASE_URL ?? '',
  google: {
    clientId:         process.env.GOOGLE_CLIENT_ID ?? '',
    clientSecret:     process.env.GOOGLE_CLIENT_SECRET ?? '',
    callbackUrl:      process.env.GOOGLE_CALLBACK_URL ?? 'http://localhost:3000/auth/google/callback',
  },
  mail: {
    host:             process.env.MAIL_HOST ?? 'smtp.gmail.com',
    port:             Number(process.env.MAIL_PORT ?? 587),
    user:             process.env.MAIL_USER ?? '',
    pass:             process.env.MAIL_PASS ?? '',
  },
  appUrl:             process.env.APP_URL ?? 'http://localhost:3000',
  uploadDir:          process.env.UPLOAD_DIR ?? 'src/public/uploads',
  maxFileSizeMb:      Number(process.env.MAX_FILE_SIZE_MB ?? 10),
}
