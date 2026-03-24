# Build Stage
FROM node:20-slim AS build
WORKDIR /app

# Copy the ENTIRE repository (needed for sdk/ dependencies)
COPY . .

# Install dependencies and build the web app
RUN npm install -g pnpm && \
    cd examples/web/RunAnywhereAI && \
    pnpm install && \
    pnpm build

# Serve Stage
FROM nginx:alpine
# Copy the build output from the build stage
COPY --from=build /app/examples/web/RunAnywhereAI/dist /usr/share/nginx/html

# Add WASM security headers to Nginx config
RUN echo 'server { \
    listen 80; \
    location / { \
    root /usr/share/nginx/html; \
    index index.html; \
    add_header Cross-Origin-Opener-Policy "same-origin"; \
    add_header Cross-Origin-Embedder-Policy "credentialless"; \
    } \
    }' > /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
