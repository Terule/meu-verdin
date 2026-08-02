import { betterAuth } from 'better-auth'
import { prismaAdapter } from 'better-auth/adapters/prisma'

import prisma from '@/lib/prisma'

export const auth = betterAuth({
  appName: 'Meu Verdin',
  baseURL: process.env.BETTER_AUTH_URL,
  database: prismaAdapter(prisma, {
    provider: 'postgresql',
  }),
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      prompt: 'select_account',
    },
  },
  account: {
    encryptOAuthTokens: true,
    accountLinking: {
      enabled: true,
      trustedProviders: ['google'],
      disableImplicitLinking: true,
    },
  },
  disabledPaths: ['/sign-up/email', '/sign-in/email'],
  advanced: {
    useSecureCookies: process.env.NODE_ENV === 'production',
  },
})
