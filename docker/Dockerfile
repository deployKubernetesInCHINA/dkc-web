FROM node:14-alpine

WORKDIR /app
#复制package文件到工作目录
COPY package*.json ./
#复制项目到工作目录中
COPY . .  
# 安装项目依赖包
RUN npm install --registry https://registry.npm.taobao.org
RUN npm run build
# 容器对外暴露的端口号
EXPOSE 8080
# 容器启动时执行的命令，类似npm run start
ENTRYPOINT [ "npm","run", "serve" ] 