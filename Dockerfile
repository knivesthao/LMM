FROM node:22-slim AS dev

WORKDIR /app

# Install Playwright system dependencies (Debian includes glibc)
RUN apt-get update -qq && apt-get install -y -qq \
    libnss3 libnspr4 libatk1.0-0 libatk-bridge2.0-0 libcups2 \
    libdrm2 libdbus-1-3 libxkbcommon0 libxcomposite1 libxdamage1 \
    libxfixes3 libxrandr2 libgbm1 libpango-1.0-0 libcairo2 \
    libasound2 libatspi2.0-0 2>/dev/null | tail -1

COPY package.json package-lock.json ./
RUN npm ci

# Install Playwright browser binary
RUN npx playwright install chromium-headless-shell 2>&1 | tail -1

COPY . .

EXPOSE 5173

CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
