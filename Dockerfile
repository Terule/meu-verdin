FROM node:22-alpine AS dependencies

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM dependencies AS builder

WORKDIR /app
COPY . .

# Prisma v7 requires a datasource value even during client generation. This
# non-secret placeholder is used only while the image is being built.
ARG DATABASE_URL=postgresql://postgres:postgres@localhost:5432/meu_verdin
ENV NEXT_TELEMETRY_DISABLED=1

RUN DATABASE_URL="$DATABASE_URL" \
    BETTER_AUTH_SECRET=build-only-secret-that-is-never-used-at-runtime \
    BETTER_AUTH_URL=http://localhost:3000 \
    GOOGLE_CLIENT_ID=build-only-google-client-id \
    GOOGLE_CLIENT_SECRET=build-only-google-client-secret \
    npm run db:generate && npm run build

FROM node:22-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

COPY --from=dependencies /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/prisma.config.ts ./prisma.config.ts
COPY --from=builder /app/src/generated ./src/generated
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY docker-entrypoint.sh ./docker-entrypoint.sh

RUN chmod 755 ./docker-entrypoint.sh

EXPOSE 3000
ENTRYPOINT ["/app/docker-entrypoint.sh"]
CMD ["npm", "run", "start"]
