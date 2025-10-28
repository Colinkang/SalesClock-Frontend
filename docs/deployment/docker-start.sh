#!/bin/bash

echo "🚀 启动 Docker 容器..."

# 构建并启动所有服务
docker-compose up -d

echo "⏳ 等待服务启动..."
sleep 5

echo "📊 检查服务状态..."
docker-compose ps

echo "📝 运行数据库迁移..."
docker-compose exec -T backend npx prisma migrate deploy

echo "🌱 初始化种子数据..."
docker-compose exec -T backend npm run prisma:seed

echo ""
echo "✅ 部署完成！"
echo ""
echo "访问地址:"
echo "  前端: http://localhost"
echo "  后端: http://localhost:3001"
echo ""
echo "查看日志: docker-compose logs -f"
echo "停止服务: docker-compose down"

