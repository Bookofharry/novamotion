# Contributing to NovaMotion

Thank you for your interest in contributing to **NovaMotion**! We welcome contributions from developers, designers, and AI creators across the world.

---

## 🧭 Project Architecture Overview

NovaMotion is organized as a monorepo using npm workspaces:

```
├── apps/
│   ├── api/          # Node.js + Express API gateway, BullMQ queue, Runway & Gemini providers
│   └── web/          # React + Vite + Tailwind CSS frontend studio
├── packages/
│   ├── shared/       # Shared TypeScript types, model catalogs, and pricing schemas
│   └── database/     # Prisma ORM schemas, PostgreSQL migrations, and seed scripts
└── docker-compose.yml # 1-command local orchestration (Web, API, Postgres, Redis)
```

---

## 🚀 Development Quick Start

### Prerequisites
- Node.js >= 20.x
- npm >= 10.x
- Docker & Docker Compose (optional, but recommended)

### 1. Clone the repository
```bash
git clone https://github.com/Bookofharry/novamotion.git
cd novamotion
```

### 2. Install dependencies
```bash
npm install
```

### 3. Setup environment variables
```bash
cp .env.example .env
```
Fill in your API keys:
- `RUNWAY_API_KEY`: Runway developer API key (https://dev.runwayml.com/)
- `GOOGLE_AI_API_KEY`: Google Gemini API key for smart prompt enhancement (optional)

### 4. Run with Docker (Recommended)
```bash
docker compose up --build -d
```
- Web UI: http://localhost:3000
- API Server: http://localhost:4000
- Database: `localhost:5432`
- Redis Queue: `localhost:6379`

### Or run locally without Docker
```bash
npm run build --workspace=@videolab/shared
npm run dev --workspace=@videolab/api
npm run dev --workspace=@videolab/web
```

---

## 🔌 Adding a New Video Generation Engine

NovaMotion is designed to be provider-agnostic. To add a new model adapter:

1. **Define the Model Specs in `packages/shared/src/index.ts`**:
   Add the model ID and capabilities to the shared catalog (`AVAILABLE_MODELS`).

2. **Implement the Provider Adapter in `apps/api/src/providers/`**:
   Implement the `VideoProviderAdapter` interface:
   - `submitTextToVideo(req)`
   - `submitImageToVideo(req)`
   - `pollJobStatus(jobId)`
   - `cancelJob(jobId)`

3. **Configure Wholesale Unit Economics in `apps/api/src/services/admin.service.ts`**:
   Add the provider cost formula so the admin audit dashboard can track unit economics automatically.

4. **Register in `apps/api/src/config.ts`**:
   Add the model to the available registry.

---

## 🧪 Code Quality & Pull Request Guidelines

Before submitting a PR:
1. Ensure TypeScript builds cleanly without errors:
   ```bash
   npm run build --workspace=@videolab/shared
   npm run build --workspace=@videolab/api
   npm run build --workspace=@videolab/web
   ```
2. Follow clean code and modern component practices (Vanilla CSS / Tailwind, accessible buttons, keyboard navigability).
3. Open a Pull Request with a clear description and screenshot/recording of your changes.

---

## 📜 License

NovaMotion is licensed under the [MIT License](LICENSE).
