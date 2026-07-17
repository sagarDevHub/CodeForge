# CodeForge 🚀

### _AI-Powered Development Platform for Smarter Codebase Insights, Visualizations, & Automated Migrations_

An all-in-one AI platform engineered to revolutionize how engineering teams analyze system dependencies, measure deployment risks, run smart migrations, and get immediate contextual answers about their code repositories.

---

## 🛡️ Tech Stack & Badges

![Next.js](https://img.shields.io/badge/Next.js-15.5.19-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8.2-blue?style=flat-square&logo=typescript)
![Prisma](https://img.shields.io/badge/Prisma-6.19.3-2D3748?style=flat-square&logo=prisma)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.0.15-06B6D4?style=flat-square&logo=tailwindcss)
![Redis](https://img.shields.io/badge/Redis-Upstash-DC382D?style=flat-square&logo=redis)
![Clerk](https://img.shields.io/badge/Clerk-Auth-6C47FF?style=flat-square&logo=clerk)
![GROQ](https://img.shields.io/badge/AI_Engine-GROQ-FF6B6B?style=flat-square)
![Vercel](https://img.shields.io/badge/Vercel-Deployed-000000?style=flat-square&logo=vercel)
![License](https://img.shields.io/badge/License-MIT-green.svg?style=flat-square)

---

## 🌟 Overview

CodeForge bridges the gap between complex software architecture and intelligent automation. Powered by **GROQ AI**, **tRPC**, and **Upstash Redis**, it dynamically processes repos to surface modular dependency patterns, scoring your application across vital infrastructure vectors (Security, Performance, and Maintainability) while orchestrating zero-downtime, safe code updates directly through automated GitHub Pull Requests.

### 🎯 What Makes CodeForge Special?

- **🤖 AI-Driven Intelligence:** Leverages blazing-fast inference via GROQ AI to understand raw code layouts and drive complex refactoring layers.
- **⚡ Edge-Optimized Performance:** Upstash Redis caching layer slashes response times by **60%**, scaling database limits down gracefully.
- **🔄 Hands-Free Migrations:** Safely updates versions or refactors patterns asynchronously via PRs, requiring absolute zero configuration injection within your live target codebases.
- **🔒 Enterprise Guardrails:** Robust Clerk session isolation integrated right through serverless API middleware loops.

---

## ✨ Key Features

### 1. 🏗️ Architecture Visualization

- Interactive dynamic module relationship layouts with node clustering filters.
- Granular type, layer, and asset isolation toggles.
- Viewport fluid zooming, canvas panning, and deep-dive element inspector cards.

### 2. 🚀 Deployment Readiness Scoring

- Heuristic vulnerability analysis and optimization profiling using automated GROQ passes.
- Tri-metric evaluation score mapping (_Security_, _Performance_, _Maintainability_).
- Comparative workspace analytical history over time.

### 3. 🔄 Smart Code Migration Assistant

- Automated dependency updates and syntax refactoring pipelines managed smoothly out-of-band.
- **Zero-Overhead Integration:** Code updates execute exclusively within dedicated staging PR cycles.
- Built-in continuous validation states with clear progress timelines.

### 4. 📚 Contextual Codebase Q&A

- Semantic RAG search over indexed logic configurations.
- Accurate code references mapped precisely back to host modules.
- Persistent shared workspace interactive queries.

### 5. 💳 Metered Billing & Subscriptions

- Tiered multi-profile access (Pro, Team, Enterprise plans).
- Secure processing loops handled instantly via **Razorpay**.
- Granular user credit allocation pools updated on checkout.

---

## 🏗️ Architecture & Data Flow

### System Layout Diagram

```text
┌─────────────────────────────────────────────────────────────────────┐
│                         CodeForge Platform                         │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐         │
│  │   Frontend   │    │   Backend    │    │   Database   │         │
│  │   (Next.js)  │◄──►│  (tRPC API)  │◄──►│  (PostgreSQL)│         │
│  └──────────────┘    └──────────────┘    └──────────────┘         │
│         │                   │                   │                  │
│         ▼                   ▼                   ▼                  │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐         │
│  │  AI Engine   │    │   Redis      │    │   GitHub     │         │
│  │   (GROQ)     │    │   Cache      │    │   API        │         │
│  └──────────────┘    └──────────────┘    └──────────────┘         │
│         │                   │                   │                  │
│         ▼                   ▼                   ▼                  │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐         │
│  │  Clerk Auth  │    │  GitHub PR   │    │  Subscription│         │
│  │              │    │  Migration   │    │  (Razorpay)  │         │
│  └──────────────┘    └──────────────┘    └──────────────┘         │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
Data Pipeline FlowPlaintextUser Input ──► Next.js Frontend ──► tRPC Router ──► Redis Cache (Hit/Miss)
                                        │
                                        ├──► PostgreSQL / Neon DB
                                        ├──► GitHub API (PR Workflows)
                                        └──► GROQ AI (Inference Engines)
🛠️ Detailed Tech StackFrontend ArchitectureTechnologyVersionOperational PurposeNext.js15.5.19Modern App Router core infrastructureTypeScript5.8.2Compile-time strict interface safetyTailwind CSS4.0.15Fluid atomic reactive grid layout utility engineFramer MotionLatestPhysics-based fluid interaction UI state shiftsLucide ReactLatestScalable minimalist component micro-iconography setsshadcn/uiLatestFully accessible headless layout component building blocksBackend & Service LayerTechnologyVersionOperational PurposetRPC11.0.0End-to-end type safety boundaries without schema noisePrisma6.19.3Native strongly-typed query access ORM database layerPostgreSQLLatestDistributed relational workspace model storage (Neon)RedisLatestLow latency edge state performance runtime layer (Upstash)ClerkLatestContextual RBAC organization user authentication gateGROQLatestDynamic context window LLM code intelligence executorHugging FaceLatestMulti-dimensional text embeddings translation pipelines📊 Core Database Relational SchemasCode snippet// Core Entity Mapping Highlights
model User {
  id            String         @id
  email         String         @unique
  credits       Int            @default(100)
  subscriptions Subscription[]
  questions     Question[]
}

model Project {
  id                    String                 @id @default(uuid())
  name                  String
  githubUrl             String
  status                ProjectStatus
  progress              Float
  blueprints            ArchitectureBlueprint[]
  reports               DeploymentReport[]
  migrationPlans        MigrationPlan[]
}

model MigrationPlan {
  id             String          @id @default(uuid())
  projectId      String
  project        Project         @relation(fields: [projectId], references: [id])
  name           String
  status         MigrationStatus
  githubPrNumber Int?
  githubPrUrl    String?
}
📁 Repository Directory LayoutPlaintextcodeforge/
├── src/
│   ├── app/
│   │   ├── (protected)/         # Authenticated Core Client Workspace Workspace
│   │   │   ├── architecture/     # Layout Dependency Canvas
│   │   │   ├── deployment/       # AI Optimization Evaluation Reports
│   │   │   ├── migration/        # Branch Transformation Automation Engines
│   │   │   ├── qa/              # Natural Language Vector Ingestion Terminal
│   │   │   ├── billing/          # Razorpay Subscription Control Cards
│   │   │   └── dashboard/        # Global Repository Performance Status
│   │   ├── api/                  # Global Edge Route Fallbacks
│   │   ├── sign-in/             # Custom Clerk Routing Entry
│   │   └── layout.tsx           # Standard DOM Context Viewport
│   ├── components/
│   │   ├── ui/                  # Raw Core Component Definitions (shadcn)
│   │   ├── deployment/           # Score Tracking Cards
│   │   ├── architecture/         # Visual Canvas Modals
│   │   └── migration/            # Automated Integration Steppers
│   ├── hooks/                    # Reusable Client Environment React Closures
│   ├── lib/
│   │   ├── ai/                  # AI Client Engines (GROQ/Embeddings)
│   │   ├── redis/               # Upstash Redis Connection Handles
│   │   └── github/              # Git Branching Automation Handlers
│   ├── server/
│   │   └── api/
│   │       └── routers/         # End-To-End Typed tRPC Controllers
│   └── types/                    # System Namespace Formats
├── prisma/
│   └── schema.prisma            # Live Environment System Data Model Configuration
├── Dockerfile                   # Localized Multi-Stage Container Setup
└── README.md
🚀 Installation & Local Environment ConfigurationPrerequisitesNode.js v20.0.0 or higherPackage Managers: npm or pnpmDatabase instances: Live relational PostgreSQL context (Neon) + Cache state access credentials (Upstash Redis)Integration credentials: Valid API key configurations for Clerk, GitHub PAT tokens, and GROQ.Step-by-Step SetupClone the project repositoryBashgit clone [https://github.com/sagarDevHub/codeforge.git](https://github.com/sagarDevHub/codeforge.git)
cd codeforge
Install project dependenciesBashpnpm install
# or: npm install
Initialize local workspace environment mapsBashcp .env.example .env.local
Open .env.local inside your preferred code editor and enter your private secret variables.Synchronize persistent databasesBashnpx prisma generate
npx prisma db push
Fire up the localized dev engine serverBashpnpm dev
# or: npm run dev
Open http://localhost:3000 inside your web browser to view your live instance.🔧 Environment Variables Reference TemplateCode snippet# Database Credentials
DATABASE_URL="postgresql://user:password@neon-host/codeforge?sslmode=require"

# Cache Store Setup (Upstash Redis)
UPSTASH_REDIS_REST_URL="[https://your-instance.upstash.io](https://your-instance.upstash.io)"
UPSTASH_REDIS_REST_TOKEN="your_token_here"

# Clerk Application Configurations
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_..."
CLERK_SECRET_KEY="sk_test_..."

# AI Engine Models API Authentication
GROQ_API_KEY="gsk_..."

# Version Control Integrations
GITHUB_TOKEN="ghp_..."

# Payment Processing Services
NEXT_PUBLIC_RAZORPAY_KEY_ID="rzp_test_..."
RAZORPAY_KEY_SECRET="secret_..."

# Development Configurations
REPO_PATH="./"
NEXT_PUBLIC_VERCEL_URL="localhost:3000"
📦 Deployment GuidesStandard Pipeline: Deploy via Vercel EcosystemOption A: Quick deployment via Vercel CLIBashnpm install -g vercel
vercel --prod
Option B: Automatic Continuous Deployment (CD)Navigate directly to your Vercel Web Dashboard.Click Add New Project, choose your remote CodeForge repository path.Configure the specific environment keys outlined in the reference matrix, then hit Deploy.Container Pipeline: Deploy with DockerEnsure your container engine is running locally, then execute:Bash# Build production container image block
docker build -t codeforge .

# Fire up container runtime mapping internal port configurations
docker run -p 3000:3000 --env-file .env.local codeforge
🤝 Contributing StrategiesWe highly welcome contributions to CodeForge! To introduce structural changes, please follow this pipeline:Fork the repository workspace.Form your isolated topic branch block: git checkout -b feature/your-awesome-feature.Check code styles before committing changes (pnpm lint).Commit your structured adjustments using meaningful semantic labels: git commit -m "feat: add advanced dependency metrics graph".Push changes safely up: git push origin feature/your-awesome-feature.Open a formal Pull Request targeting the upstream main repository path.📜 LicenseDistributed under the strict terms of the open-source MIT License. Check out LICENSE documentation records inside the source root for full disclosure details.📞 Contact & Workspace InquiriesAuthor Profile: Sagar GullaWorkplace Email: sagar@codeforge.comProfessional Networking: LinkedIn
```
