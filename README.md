# VideoLab — AI Video Generation Platform

> **VideoLab** is a modern, provider-independent generative AI video studio and orchestration engine. Create, enhance, queue, and manage cinematic videos with multi-model routing, prompt enhancement, and resilient asynchronous job processing.

---

## 🌟 Key Features

- **🎬 Multi-Model AI Video Generation**:
  - Unified adapter architecture supporting **Google Veo**, **Runway Gen-3 / Gen-2**, and an instant **Mock Provider** (for cost-free, zero-config local development).
  - Text-to-Video and Image-to-Video generation.
  - Multi-aspect ratio selection (`16:9`, `9:16`, `1:1`, `4:3`, `21:9`), duration, and resolution controls.

- **⚡ Asynchronous Job Pipeline**:
  - Queued video generation with real-time status tracking, cancellation, and progress polling.
  - Dual-mode orchestration: High-throughput **BullMQ + Redis** in production, with an autonomous **in-memory event queue** for local dev without external services.

- **✨ AI Prompt Enhancer**:
  - Automatically transforms short, rough ideas into rich, cinematic prompts with camera movements, dynamic lighting, color grading, and lens specifications tailored to video models.

- **🎞️ Multi-Clip Sequencer & FFmpeg Stitcher**:
  - Sequence multiple generated AI video clips on an interactive timeline strip.
  - Interactive clip trimming (custom start offset and duration) and clip reordering.
  - Seamless transition rendering (`Direct Cut`, `Crossfade Dissolve`, `Fade to Black`).
  - Server-side FFmpeg concatenation pipeline with graceful dev-mode fallback.

- **🎵 Audio & Sound Effects Studio**:
  - Overcome silent AI video generation with procedural and curated soundscapes.
  - Preset soundtracks: *Neon Cyberpunk Pulse*, *Ethereal Cinematic Drone*, *Deep Ocean & Rain*, *Epic Trailer Impact*, *Midnight Lo-Fi*, and *Deep Space Frequencies*.
  - Procedural 44.1kHz 16-bit PCM waveform synthesis engine.
  - FFmpeg audio multiplexing with volume normalization, looping, and instant canvas playback.

- **🖥️ Cyber-Dark Studio UI**:
  - Modern, dark-mode, glassmorphic workstation with sleek micro-interactions.
  - Real-time generation job drawer & status indicator.
  - Integrated video player with frame seeking, fullscreen, looping, and direct MP4 export.
  - Project management & video library with prompt history and generation parameters.

---

## 🛠️ Tech Stack

- **Frontend**: React 18/19, TypeScript, Tailwind CSS, Lucide Icons, Vite
- **Backend**: Node.js, Express.js, TypeScript, REST API
- **Data & Queue**: Prisma ORM, PostgreSQL / SQLite dev fallback, Redis & BullMQ
- **AI Integrations**: Provider Adapter Interface (Google Veo, Runway, Mock) & LLM Prompt Enhancer

---

## 🐳 Quick Start with Docker

Start the entire platform (Web, API Gateway, PostgreSQL, and Redis) with a single command:

```bash
# 1. Start all containers with Docker Compose
docker compose up --build -d

# Or via npm script:
npm run docker:up

# 2. View running logs
docker compose logs -f

# 3. Stop all containers
docker compose down
```

### Service Map:
- **Web Studio**: [http://localhost:3000](http://localhost:3000) (Nginx SPA + Reverse Proxy)
- **API Server & Health**: [http://localhost:4000/health](http://localhost:4000/health)
- **PostgreSQL**: `localhost:5432` (`user: videolab`, `db: videolab`)
- **Redis Queue**: `localhost:6379`

---

## 💻 Running Locally (Without Docker)

```bash
# 1. Install all monorepo dependencies
npm install

# 2. Build shared packages
npm run build --workspace=@videolab/shared

# 3. Start development servers concurrently (API on 4000, Vite Web on 5173)
npm run dev
```
