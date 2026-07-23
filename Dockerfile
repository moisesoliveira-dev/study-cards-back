# syntax=docker/dockerfile:1

ARG NODE_VERSION=22

# --- Dependencies ---
FROM node:${NODE_VERSION}-alpine AS deps
WORKDIR /app

COPY package.json package-lock.json ./
RUN --mount=type=cache,target=/root/.npm \
  npm config set fetch-retries 5 \
  && npm config set fetch-retry-mintimeout 20000 \
  && npm config set fetch-retry-maxtimeout 120000 \
  && npm ci

# --- Development ---
FROM node:${NODE_VERSION}-alpine AS development
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

ARG DATABASE_URL=postgresql://studycards:studycards@postgres:5432/studycards?schema=public
ENV DATABASE_URL=${DATABASE_URL}

RUN npx prisma generate

ENV NODE_ENV=development
ENV PORT=3000

EXPOSE 3000

CMD ["npm", "run", "start:dev"]

# --- Build ---
FROM node:${NODE_VERSION}-alpine AS build
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

ARG DATABASE_URL=postgresql://studycards:studycards@postgres:5432/studycards?schema=public
ENV DATABASE_URL=${DATABASE_URL}

RUN npx prisma generate \
  && npm run build \
  && npm prune --omit=dev

# --- Production ---
FROM node:${NODE_VERSION}-alpine AS production
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

RUN addgroup -S nestjs && adduser -S nestjs -G nestjs

COPY --from=build --chown=nestjs:nestjs /app/dist ./dist
COPY --from=build --chown=nestjs:nestjs /app/node_modules ./node_modules
COPY --from=build --chown=nestjs:nestjs /app/package.json ./
COPY --from=build --chown=nestjs:nestjs /app/prisma ./prisma
COPY --from=build --chown=nestjs:nestjs /app/prisma.config.ts ./prisma.config.ts

USER nestjs

EXPOSE 3000

CMD ["node", "dist/main.js"]
