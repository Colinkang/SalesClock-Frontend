# 构建阶段
FROM node:18-alpine AS builder

WORKDIR /app

# 复制所有文件
COPY package*.json ./
COPY tsconfig.json ./
COPY prisma ./prisma/
COPY src ./src/

# 安装所有依赖（包括开发依赖）
RUN npm install

# 生成 Prisma Client
RUN npx prisma generate

# 构建 TypeScript
RUN npm run build

# 生产阶段
FROM node:18-alpine

WORKDIR /app

# 只复制生产依赖
COPY package*.json ./
COPY prisma ./prisma/

# 只安装生产依赖
RUN npm ci --only=production && \
    npx prisma generate

# 复制构建产物
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

# 暴露端口
EXPOSE 3001

# 健康检查
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3001/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# 启动应用
CMD ["node", "dist/index.js"]
