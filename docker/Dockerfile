FROM node:14-alpine as build

WORKDIR /app
#复制package文件到工作目录
COPY package*.json ./
#复制项目到工作目录中
COPY . .  
# 安装项目依赖包
RUN npm install --registry https://registry.npm.taobao.org
RUN npm run build

FROM nginx:alpine

WORKDIR /usr/share/nginx/html
COPY --from=build /app/dist/ .
RUN ls /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

ENTRYPOINT ["nginx","-g","daemon off;"]