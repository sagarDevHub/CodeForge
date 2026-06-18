# ==========================================
# STAGE 1: Install production dependencies
# ==========================================
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# 🚀 FIXED: Added the explicit target destination directory (.)
COPY package.json package-lock.json ./
RUN npm ci --legacy-peer-deps --ignore-scripts

# ==========================================
# STAGE 2: Build the standalone production bundle
# ==========================================
FROM node:20-alpine AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . . 

ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

ENV NEXT_FONT_GOOGLE_MOCK_NAMES=1

ENV DATABASE_URL="postgresql://mock_user:mock_password@localhost:5432/mock_db"
ENV NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_mock"
ENV CLERK_SECRET_KEY="sk_test_mock"
ENV GROQ_API_KEY="gsk_mock"
ENV UPSTASH_REDIS_REST_TOKEN="mock_token"
ENV ARCJET_KEY="ajkey_mock"
ENV HF_API_KEY="hf_mock"
ENV NEXT_PUBLIC_RAZORPAY_KEY_ID="rzp_test_mock"
ENV RAZORPAY_KEY_SECRET="mock_secret"

RUN npx prisma generate
RUN npm run build

# ==========================================
# STAGE 3: Runtime image runner
# ==========================================
FROM node:20-alpine AS runner
WORKDIR /app

# 🚀 FIXED: Standardized runtime node environment back to production
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

RUN mkdir .next
RUN chown nextjs:nodejs .next

COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static 

USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME='0.0.0.0'

# 🚀 FIXED: Enforced matching double-quotes format compliance
CMD [ "node", "server.js" ]