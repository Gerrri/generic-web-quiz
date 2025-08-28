# 1) Build-Stage
FROM node:20-alpine AS build
WORKDIR /app
COPY package.json yarn.lock* ./
RUN yarn install --frozen-lockfile || yarn install
COPY . .
RUN yarn build

# 2) Runtime-Stage
FROM nginx:1.27-alpine
COPY nginx/default.conf /etc/nginx/conf.d/default.conf
# Dist-Verzeichnis (Angular 17 Standardeinstellung)
COPY --from=build /app/dist/quiz-web/browser /usr/share/nginx/html
# Standard-Questions (können per Volume überschrieben werden)
COPY src/assets/questions.json /usr/share/nginx/html/assets/questions.json

HEALTHCHECK CMD wget -qO- http://localhost/ >/dev/null || exit 1
