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


FROM base AS runner

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

ENV NODE_ENV production

COPY --from=deps /usr/src/app .

COPY apps/admin ./apps/admin
COPY packages/configs ./packages/configs
COPY packages/lib ./packages/lib
COPY packages/emails ./packages/emails
COPY packages/events/sdk ./packages/events/sdk

CMD [ "npm", "run", "start:wss", "-w", "apps/app" ]
