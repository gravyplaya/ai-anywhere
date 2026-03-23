# Deployment Guide for Dokploy (via Git)

This guide explains how to deploy the **RunAnywhere Web Example App** (`examples/web/RunAnywhereAI/`) from this monorepo to a **Dokploy** server.

## Overview
- **Deployment Type**: GitHub (or other Git provider) + Nixpacks (default build engine)
- **Monorepo Strategy**: Set the **Base Directory** in Dokploy to `examples/web/RunAnywhereAI/`.
- **WASM Requirement**: The server **MUST** send specific security headers for the multi-threaded WASM to work correctly.

---

## 1. Connect to Dokploy

1. Log in to your **Dokploy Panel**.
2. Go to **Projects** > Create a new project (e.g., `ai-anywhere`).
3. Inside the project, click **Create Application**.
4. Choose **GitHub** (or your Git provider).
5. Select your repository: `gravyplaya/ai-anywhere`.
6. Select the **Branch** (usually `main`).

---

## 2. Configuration (Monorepo)

Since this app is located in a subdirectory and depends on files in `sdk/`, configure the following in Dokploy's **Build** section:

- **Build Engine**: Nixpacks (recommended) or Dockerfile.
- **Base Directory**: `examples/web/RunAnywhereAI/`
- **Build Command**: `npm run build` (Nixpacks detects this if using a Node.js base).
- **Start Command**: `npm run preview -- --host --port 3000` (By default, Vite's `preview` works well for testing).

> [!TIP]
> **Base Directory** is crucial because it tells Dokploy where your `package.json` is. However, the `vite.config.ts` uses `../../../sdk/runanywhere-web/` to find WASM binaries, so Dokploy **must** have access to the entire repository during the build step. Most Git deployments include the entire repo, so this should work out of the box.

---

## 3. WASM Security Headers (CRITICAL)

The **RunAnywhere SDK** uses multi-threaded WASM (with `SharedArrayBuffer`). This requires the following HTTP headers from your server:

- `Cross-Origin-Opener-Policy: same-origin`
- `Cross-Origin-Embedder-Policy: credentialless` (or `require-corp`)

In Dokploy, you can add these headers via **Traefik Labels** (Advanced Setup):

1. Go to the **Advanced** tab of your application in Dokploy.
2. In the **Docker Labels** section, add the following (replace `{app_name}` with your application's identifier):
   ```
   traefik.http.middlewares.wasm-headers.headers.customResponseHeaders.Cross-Origin-Opener-Policy=same-origin
   traefik.http.middlewares.wasm-headers.headers.customResponseHeaders.Cross-Origin-Embedder-Policy=credentialless
   traefik.http.routers.{app_name}.middlewares=wasm-headers
   ```

---

## 4. Production Considerations

For a more robust production deployment, you might want to use a **Dockerfile** instead of Nixpacks to serve the static files with **Nginx**:

### Sample `Dockerfile` (Place in `examples/web/RunAnywhereAI/`)
```dockerfile
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
```

If you use this `Dockerfile`, set the **Dockerfile Path** in Dokploy to `examples/web/RunAnywhereAI/Dockerfile`.

---

## Summary
To deploy via Git on Dokploy:
1. Connect your repo.
2. Set the **Base Directory** to `examples/web/RunAnywhereAI/`.
3. Configure **Traefik Labels** to add the `Cross-Origin` headers.
4. (Optional) Use a custom `Dockerfile` with Nginx for better performance and built-in header management.
