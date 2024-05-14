FROM node:20-alpine AS base
# Install turbo-cli
RUN npm install turbo --global

FROM base AS deps

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

ENV NODE_ENV production

#? Copy the necessary files to install dependencies
COPY package.json ./
COPY package-lock.json ./
COPY turbo.json ./

COPY apps/admin/package.json ./apps/admin/package.json

COPY packages/lib/package.json ./packages/lib/package.json
COPY packages/emails/package.json ./packages/emails/package.json
COPY packages/events/sdk/package.json ./packages/events/sdk/package.json
#? Copy full app/db because we need the prisma schema for postinstall
COPY packages/app/db ./packages/app/db
#? Copy full events/db because we need the prisma schema for postinstall
COPY packages/events/db ./packages/events/db

RUN npm ci --omit=dev


FROM base AS builder

ARG TURBO_TEAM
ENV TURBO_TEAM=$TURBO_TEAM

ARG TURBO_TOKEN
ENV TURBO_TOKEN=$TURBO_TOKEN

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

ENV NEXT_TELEMETRY_DISABLED 1
ENV NODE_ENV production

COPY --from=deps /usr/src/app .

COPY apps/admin ./apps/admin
COPY packages/configs ./packages/configs
COPY packages/lib ./packages/lib
COPY packages/emails ./packages/emails
COPY packages/events/sdk ./packages/events/sdk

RUN turbo run build --filter=@animadate/admin
RUN npm run deploy-db:prod -w apps/admin


FROM base AS runner

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

ENV NEXT_TELEMETRY_DISABLED 1
ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /usr/src/app/apps/admin/public ./apps/admin/public

RUN mkdir .next
RUN chown nextjs:nodejs .next

COPY --from=builder --chown=nextjs:nodejs /usr/src/app/apps/admin/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /usr/src/app/apps/admin/.next/static ./apps/admin/.next/static

USER nextjs

ENV HOSTNAME "0.0.0.0"

CMD ["node", "apps/admin/server.js"]
