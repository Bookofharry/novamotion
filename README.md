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
