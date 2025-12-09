# ================================
# 1) Build Stage
# ================================
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package.json package-lock.json ./
RUN npm ci

# Build the production bundle
COPY . .
ENV REACT_APP_API=http://kubescope-backend
RUN npm run build

# ================================
# 2) NGINX Serve Stage
# ================================
FROM nginx:alpine AS production

# Remove default nginx static content
RUN rm -rf /usr/share/nginx/html/*

# Copy built static files to NGINX's public folder
COPY --from=builder /app/dist /usr/share/nginx/html
# For CRA use: /app/build instead of /app/dist

# (Optional) Add custom NGINX config
#COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
