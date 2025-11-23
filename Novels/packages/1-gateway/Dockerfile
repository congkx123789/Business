FROM node:20-alpine as builder
WORKDIR /app
COPY package*.json ./
RUN npm install -g pnpm@8.15.5 && pnpm install --frozen-lockfile
COPY . .
RUN pnpm build

FROM node:20-alpine as runner
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY package*.json ./
RUN npm install -g pnpm@8.15.5 && pnpm install --prod --frozen-lockfile
EXPOSE 3001
CMD ["node", "dist/main.js"]
