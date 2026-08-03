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
      // Keep the locally stored profile picture in sync for returning users.
      overrideUserInfoOnSignIn: true,
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
  session: {
    // End sessions after one hour without activity; active sessions renew every
    // ten minutes rather than writing to the database on each request.
    expiresIn: 60 * 60,
    updateAge: 10 * 60,
  },
  advanced: {
    useSecureCookies: process.env.NODE_ENV === 'production',
  },
})
