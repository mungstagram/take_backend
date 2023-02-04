# Step 1 : Build
FROM node:16 AS builder
# Work Directory 설정
WORKDIR /app
# 패키지 설치를 위한 Package.json 복사
COPY ["package.json" , "package-lock.json" , "./"]
# package.json 에 작성된 package 설치
RUN npm install
# Build를 위한 파일 복사
COPY ["tsconfig.build.json" , "tsconfig.json", "./"]
COPY ["nest-cli.json" , "./"]
COPY ["src/", "./src/"]
RUN npm run build

# Step 2 : Run
FROM node:16-alpine
# Work Directory 설정
WORKDIR /app
# Stemp 1의 builder에서 build된 프로젝트를 복사
COPY --from=builder /app ./
# npm run start:prod
CMD ["npm" , "run" ,"start:prod"]
# # Step 1 : Build
# # Node 버전
# FROM node:16 AS builder
# # Work Directory 설정
# WORKDIR /app
# # /app 디렉토리에 모든파일 복사.
# COPY . .
# # package.json 에 작성된 package 설치
# RUN npm install
# # package.json 에 작성된 build 스크립트
# RUN npm run build

# # Step 2 : Run
# # Node 버전
# FROM node:16-alpine
# # Work Directory 설정
# WORKDIR /app
# # Stemp 1의 builder에서 build된 프로젝트를 복사
# COPY --from=builder /app ./
# # npm run start:prod
# CMD ["npm" , "run" ,"start:prod"]