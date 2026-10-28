# ============================================================
# STAGE 1: Build Next.js 14 Standalone Frontend
# ============================================================
FROM node:18-alpine AS frontend-builder
WORKDIR /app/frontend

COPY frontend/package*.json ./
RUN npm ci

COPY frontend/ ./
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# ============================================================
# STAGE 2: Unified Live Runner (Python + Foundry Anvil + Node)
# ============================================================
FROM python:3.11-slim AS runner

WORKDIR /app

# Install system dependencies, Node.js, and build tools
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    git \
    bash \
    build-essential \
    && curl -fsSL https://deb.nodesource.com/setup_18.x | bash - \
    && apt-get install -y --no-install-recommends nodejs \
    && rm -rf /var/lib/apt/lists/*

# Install Foundry (anvil, forge, cast)
RUN curl -L https://foundry.paradigm.xyz | bash && \
    /root/.foundry/bin/foundryup
ENV PATH="/root/.foundry/bin:${PATH}"

# Install Python backend dependencies
COPY backend/requirements.txt ./backend/
RUN pip install --no-cache-dir -r ./backend/requirements.txt

# Copy Smart Contracts & compile artifacts with Forge
COPY contracts/ ./contracts/
RUN cd /app/contracts && forge build

# Copy Backend Source
COPY backend/ ./backend/

# Copy Next.js standalone build
COPY --from=frontend-builder /app/frontend/.next/standalone ./frontend/
COPY --from=frontend-builder /app/frontend/.next/static ./frontend/.next/static
COPY --from=frontend-builder /app/frontend/public ./frontend/public

# Copy Entrypoint startup script
COPY entrypoint.sh .
RUN chmod +x entrypoint.sh

# Render defines PORT dynamically (defaults to 10000)
ENV PORT=10000
EXPOSE 10000

CMD ["./entrypoint.sh"]
