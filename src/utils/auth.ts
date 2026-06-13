const INSTITUTIONAL_DOMAIN = 'uniatlantico.edu.co'

export function isInstitutionalEmail(email: string): boolean {
  const domain = email.split('@')[1]?.toLowerCase() ?? ''
  return domain === INSTITUTIONAL_DOMAIN || domain.endsWith(`.${INSTITUTIONAL_DOMAIN}`)
}
