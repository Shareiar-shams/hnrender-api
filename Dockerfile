FROM node:20-alpine

# Install pnpm and enable corepack
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# Copy lockfile and package.json first for better caching
COPY package.json pnpm-lock.yaml ./

# Install dependencies using pnpm
# --frozen-lockfile ensures the build fails if the lockfile is out of sync
RUN pnpm install --frozen-lockfile

COPY prisma ./prisma
RUN pnpm exec prisma generate

COPY . .
# Build the project
RUN pnpm run build

EXPOSE 4000

# Run migrations and start the app
CMD ["sh", "-c", "pnpm exec prisma migrate deploy && pnpm start"]
