#!/bin/bash

# 设置脚本错误时退出
set -e

echo "开始构建后端和前端资源..."

# 进入项目根目录
cd "$(dirname "$0")/../.."

echo "0. 构建依赖包..."
pnpm --filter @xiaohongshu/logger build
pnpm --filter @xiaohongshu/utils build

echo "1. 安装Rollup依赖..."
cd packages/server
pnpm install

echo "2. 使用Rollup构建后端资源..."
cd ../..
pnpm --filter @xiaohongshu/server build

echo "3. 构建前端资源..."
pnpm --filter @xiaohongshu/web build

echo "4. 创建静态资源目录..."
mkdir -p packages/server/public

echo "5. 复制前端构建产物到后端静态资源目录..."
cp -r packages/web/dist/* packages/server/public/

echo "构建完成！前端资源已复制到 packages/server/public 目录"
echo "后端已打包为单个bundle文件: packages/server/dist/bundle.js" 