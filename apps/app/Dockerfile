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

COPY apps/app/package.json ./apps/app/package.json

COPY packages/lib/package.json ./packages/lib/package.json
COPY packages/emails/package.json ./packages/emails/package.json
COPY packages/events/sdk/package.json ./packages/events/sdk/package.json
#? Copy full app/db because we need the prisma schema for postinstall
COPY packages/app/db ./packages/app/db
#? Copy patch files
COPY patches ./patches

RUN npm ci --omit=dev && npm run postinstall


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

COPY apps/app ./apps/app
COPY packages/configs ./packages/configs
COPY packages/lib ./packages/lib
COPY packages/emails ./packages/emails
COPY packages/events/sdk ./packages/events/sdk

RUN turbo run build --filter=@animadate/app
RUN npm run deploy-db:prod -w apps/app


FROM base AS runner

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

ENV NEXT_TELEMETRY_DISABLED 1
ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /usr/src/app/apps/app/public ./apps/app/public

RUN mkdir .next
RUN chown nextjs:nodejs .next

COPY --from=builder --chown=nextjs:nodejs /usr/src/app/apps/app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /usr/src/app/apps/app/.next/static ./apps/app/.next/static

USER nextjs

ENV HOSTNAME "0.0.0.0"

CMD ["node", "apps/app/server.js"]
