# Build — node:22-alpine is the smallest official Node image (musl).
FROM node:22-alpine AS build
WORKDIR /app

RUN apk add --no-cache --virtual .build-deps python3 make g++

COPY package.json package-lock.json ./
RUN npm ci

COPY prisma ./prisma
COPY prisma.config.ts ./
COPY tsconfig.json ./
COPY src ./src

RUN npx prisma generate && npm run build \
    && apk del .build-deps

# Run (database is external — set DATABASE_* etc. at runtime)
FROM node:22-alpine AS production
WORKDIR /app
ENV NODE_ENV=production

RUN apk add --no-cache --virtual .build-deps python3 make g++

COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm install prisma@7.8.0 --no-save \
    && apk del .build-deps

COPY --from=build /app/dist ./dist
COPY --from=build /app/prisma ./prisma
COPY --from=build /app/prisma.config.ts ./
COPY --from=build /app/src/core/config ./src/core/config

EXPOSE 3000

CMD ["sh", "-c", "npx prisma migrate deploy && node dist/index.js"]
