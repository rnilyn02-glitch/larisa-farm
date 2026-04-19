FROM node:20-alpine AS builder
WORKDIR /app

# Копируем package.json
COPY package*.json ./

# Устанавливаем зависимости
RUN npm install

# Копируем исходники
COPY . .

# Создаем директорию public если её нет
RUN mkdir -p public

# Собираем проект
RUN npm run build

# Production stage
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Копируем файлы с проверкой существования через find
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/.next/standalone ./

# Копируем public если существует
RUN --mount=type=bind,from=builder,source=/app/public,target=/tmp/public \
    if [ -d /tmp/public ]; then cp -r /tmp/public ./public; fi

# Копируем static если существует
RUN --mount=type=bind,from=builder,source=/app/.next/static,target=/tmp/static \
    if [ -d /tmp/static ]; then mkdir -p .next && cp -r /tmp/static ./.next/static; fi

RUN chown -R nextjs:nodejs /app
USER nextjs

EXPOSE 3000
ENV PORT=3000
CMD ["node", "server.js"]
