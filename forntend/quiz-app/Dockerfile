# Multi-stage Dockerfile: build Angular app and serve with nginx

# Builder stage
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --silent
COPY . .
# Build production client bundle
RUN npm run build -- --configuration=production

# Runner stage
FROM nginx:stable-alpine AS runner
# Remove default nginx content
RUN rm -rf /usr/share/nginx/html/*

# Copy the browser bundle into the nginx web root
COPY --from=builder /app/dist/quiz-app/browser/ /usr/share/nginx/html/
COPY public/env.js /usr/share/nginx/html/env.js

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
