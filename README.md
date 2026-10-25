<div align="center">

# 🎬 NovaMotion
### Open-Source Generative AI Video Studio & Orchestration Platform

[![License: MIT](https://img.shields.io/badge/License-MIT-teal.svg)](https://opensource.org/licenses/MIT)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?logo=docker&logoColor=white)](docker-compose.yml)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Runway API](https://img.shields.io/badge/Runway_API-Gen--4_Turbo-black?logo=openai)](https://dev.runwayml.com/)

**NovaMotion** is an open-source, full-stack generative AI video creation studio and multi-model orchestration engine. Create, queue, playback, and remix cinematic AI videos across premier engines like **Runway Gen-4**, **Runway Lite**, **Grok 1.5 Lite**, **WAN 3.0 Prime**, and **MiniMax H3 Max**.

[Features](#-key-features) • [Engines](#-supported-generative-engines) • [Quick Start](#-1-minute-quick-start) • [Architecture](#-architecture) • [Self-Hosting](#-self-hosting--byok) • [Monetization Engine](#-built-in-unit-economics--monetization)

</div>

---

## 🌟 Key Features

- **🚀 Multi-Model Video Generation**:
  - Unified adapter routing across 5 live generative video engines: **Grok Imagine 1.5 Lite**, **Runway Lite**, **Gen-4 Turbo**, **Alibaba WAN 3.0 Prime**, and **MiniMax H3 Max**.
  - Text-to-Video and Image-to-Video (starter frame / keyframe).
  - Multiple resolutions (`480p`, `720p`, `1080p`) and aspect ratios (`16:9`, `9:16`, `1:1`, `4:3`, `auto`).

- **✨ Click-to-Pop Modal Studio UX**:
  - Click-to-pop model selection modal with provider badges, wholesale costs, and capability tags.
  - Quick-switch workspace modal in the header navbar (`Generate Video`, `Video History`, and `Admin`).
  - Edge-to-edge full-width workstation layout for ultra-wide monitors.

- **🎞️ Complete Video Library & Prompt Remixing**:
  - Archive of all generated videos with duration, resolution, credits spent, and date.
  - Native inline cinema player with speed controls, fullscreen, and loop.
  - Direct 1-click **Prompt Remixing** to re-inject prompts and settings back into the studio for rapid iteration.
  - 1-click MP4 downloads and prompt copying.

- **⚡ Asynchronous Queue Engine**:
  - Powered by **BullMQ + Redis** with concurrent generation queues, real-time polling, and instant job cancellation.
  - Built-in Mock Provider mode for zero-cost, zero-API-key local testing.

- **💰 Positive-Margin Monetization & Financial Audit**:
  - Automated wholesale cost tracking ($0.01 USD / credit) vs user retail billing.
  - Configurable platform markup formula ensuring positive net profit on every second generated.
  - Free administrative audit dashboard with real-time margins, API health latency check, and ledger adjustments.

---

## 🤖 Supported Generative Engines

| Engine | Provider | Wholesale Rate | Capabilities |
| :--- | :--- | :--- | :--- |
| **Grok Imagine Video 1.5 Lite** | xAI | `2–14 credits/s` | Ultra-fast, low-cost distilled text & image-to-video |
| **Runway Lite** | Runway | `5 credits/s` | High-efficiency generation engine for rapid cinematic motion |
| **Gen-4 Turbo** | Runway | `5 credits/s` (min 10c) | Runway's premier high-fidelity Image-to-Video engine |
| **WAN 3.0 Prime** | Alibaba | `6.8–28 credits/s` | Alibaba video generation with native audio & keyframes |
| **MiniMax H3 Max** | MiniMax | `5–8 credits/s` (5s min) | Text/Image-to-video with native audio & prompt expansion |

---

## 🐳 1-Minute Quick Start

Self-host NovaMotion locally with Docker Compose in 3 simple steps:

### 1. Clone the repository
```bash
git clone https://github.com/Bookofharry/novamotion.git
cd novamotion
```

### 2. Configure environment variables
```bash
cp .env.example .env
```
Add your **Runway Developer API Key** (and optional Google Gemini API key):
```env
RUNWAY_API_KEY=your_runway_api_key_here
GOOGLE_AI_API_KEY=your_gemini_key_here
```

### 3. Launch with Docker Compose
```bash
docker compose up --build -d
```

Open your browser to:
- 🌐 **Web Studio UI**: [http://localhost:3000](http://localhost:3000)
- 🔌 **API Server**: [http://localhost:4000/api/health](http://localhost:4000/api/health)
- 🛡️ **Free Admin Audit**: [http://localhost:3000](http://localhost:3000) -> Navbar Dropdown -> *Admin Operations*

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                       Web Studio UI                         │
│         React 19 • Vite • Tailwind CSS • Glassmorphism      │
└──────────────────────────────┬──────────────────────────────┘
                               │ REST / JSON
┌──────────────────────────────▼──────────────────────────────┐
│                    NovaMotion API Gateway                   │
│         Express • TypeScript • Zod Validation • Security    │
└──────────────┬──────────────────────────────┬───────────────┘
               │                              │
    ┌──────────▼──────────┐        ┌──────────▼──────────┐
    │     BullMQ Queue    │        │  Financial Engine   │
    │  Redis Background   │        │ Wholesale vs Retail │
    └──────────┬──────────┘        └──────────┬──────────┘
               │                              │
┌──────────────▼──────────────────────────────▼───────────────┐
│                   Provider Adapter Routing                  │
├───────────────────┬───────────────────┬─────────────────────┤
│   Runway Gen-4    │   xAI Grok Lite   │  Alibaba WAN 3.0    │
│   Runway Lite     │   MiniMax H3 Max  │  Mock Dev Engine    │
└───────────────────┴───────────────────┴─────────────────────┘
```

---

## 🔑 Self-Hosting & BYOK (Bring Your Own Key)

NovaMotion supports **Bring Your Own Key (BYOK)** directly in the UI. If you are hosting a shared instance for a team or community:
1. Click the **Settings ⚙️** icon in the top right navbar.
2. Enter your own personal Runway API Key or Gemini API Key.
3. Your keys are used for your generation requests without requiring server-level redeployment.

---

## 📈 Built-in Unit Economics & Monetization

For founders looking to launch their own video generation startup, NovaMotion includes a mathematically guaranteed positive margin engine:

$$\text{User Generation Price} = \lceil \text{Wholesale API Cost} \times 1.50 \rceil + 2 \text{ credits}$$

- **Wholesale API Cost**: Real cost from Runway Dev API ($0.01 USD / credit).
- **1.50x Markup Multiplier**: Ensures 50%+ gross margin on model compute.
- **+2 Credits Base Fee**: Absorbs network egress, queue processing, and micro-storage costs.
- **Retail Credit Packs**: Pre-configured tiers ($12 / 600 credits, $29 / 1,800 credits, $59 / 4,200 credits).

---

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for details on adding new model adapters, submitting issues, or creating pull requests.

---

## 📜 License

NovaMotion is distributed under the [MIT License](LICENSE).
