# ZipLink ✨🔗

> *A modern powerful URL shortening service ~ focused on scalability and data analytics!* ♡

[![NestJS](https://img.shields.io/badge/NestJS-E0234E?style=flat&logo=nestjs&logoColor=white)](https://nestjs.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=flat&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Redis](https://img.shields.io/badge/Redis-DC382D?style=flat&logo=redis&logoColor=white)](https://redis.io/)
[![Docker](https://img.shields.io/badge/Docker-2496ED?style=flat&logo=docker&logoColor=white)](https://www.docker.com/)

## 📋 Overview ꒰ᐢ. .ᐢ꒱

ZipLink is designed to handle high traffic (solving the *Thundering Herd* problem), ensure data consistency in concurrent environments, and process access metrics asynchronously to minimize end-user latency~ ✧

### Key Goals ⋆˙⟡

- **🚀 Low Latency:** Redirects in sub-milliseconds (target: < 50ms) ~
- **🔒 Data Integrity:** Atomic operations ensuring unique aliases ♪
- **👀 Observability:** Async collection of access data (User-Agent, IP, Timestamp) ✿

## 🏗️ Architecture ₊˚⊹♡

```
┌─────────────────────────────────────────────────────────────────┐
│                         Client Request                          │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                    API Gateway (NestJS + Fastify)               │
│                                                                 │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────────────┐  │
│  │   Create    │    │  Redirect   │    │      Stats          │  │
│  │   Endpoint  │    │  Endpoint   │    │      Endpoint       │  │
│  └─────────────┘    └─────────────┘    └─────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
          │                   │                      │
          │                   ▼                      │
          │         ┌─────────────────┐              │
          │         │   Redis Cache   │◄─────────────┘
          │         │  (Cache-Aside)  │
          │         └─────────────────┘
          │                   │
          │                   ▼
          │         ┌─────────────────┐
          └────────►│   PostgreSQL    │
                    │  (Persistent)   │
                    └─────────────────┘
                              │
                              ▼
                    ┌─────────────────┐
                    │ BullMQ (Redis)  │
                    │ Analytics Queue │
                    └─────────────────┘
                              │
                              ▼
                    ┌─────────────────┐
                    │  Worker Service │
                    │  (Batch Insert) │
                    └─────────────────┘
```

## 🛠️ Tech Stack ˗ˏˋ ★ ˎˊ˗

### Backend & Infrastructure ⚙️
- **Runtime:** Node.js v20+ LTS ✧
- **Framework:** NestJS with Fastify adapter ~
- **Database:** PostgreSQL 16 ♡
- **ORM:** Prisma ✿
- **Cache & Queue:** Redis (Alpine) ⋆
- **Containerization:** Docker & Docker Compose 🐳

### Frontend (Dashboard) ~ Coming Soon! ૮₍˶ᵔ ᵕ ᵔ˶₎ა
- **Framework:** Next.js 16 (App Router) ✧
- **Styling:** Tailwind CSS 4 ~
- **Animations:** Framer Motion ₊˚
- **Charts:** Recharts ♪
- **Icons:** Lucide React ✿

> The dashboard will have private source code.

## 📁 Project Structure ♡₊˚ 🦢・

```
nano-link/
├── apps/
│   ├── api/                   # NestJS API application
│   │   ├── src/
│   │   │   ├── modules/
│   │   │   │   ├── url/       # URL shortening module
│   │   │   │   ├── analytics/ # Analytics module
│   │   │   │   └── health/    # Health check module
│   │   │   ├── common/        # Shared utilities
│   │   │   └── config/        # Configuration
│   │   └── test/
│   └── worker/                # Background worker service
├── libs/
│   └── shared/                # Shared types and utilities
├── docker/                    # Docker configurations
```

## 🚀 Getting Started ~ Let's Go! ₊˚ʚ ᗢ₊˚✧

### Prerequisites ♡

- Node.js v20+ ✧
- Docker & Docker Compose 🐳
- pnpm (recommended) or npm ~

### Installation ✿

```bash
# Clone the repository
git clone https://github.com/sophiabiscottini/nano-link.git
cd nano-link

# Install dependencies
pnpm install

# Copy environment variables
cp .env.example .env

# Start infrastructure (PostgreSQL, Redis)
docker compose -f docker-compose.dev.yml up -d

# Run database migrations
pnpm prisma migrate dev

# Start the API in development mode
pnpm dev:api

# In another terminal, start the worker
pnpm dev:worker
```

### Using Docker Compose (Full Stack) 🐳✨

```bash
# Build and start all services
docker compose up --build

# The API will be available at http://localhost:3000
```

## 📡 API Endpoints ⋆。°✧₊

### Create Short URL ♡
```http
POST /api/v1/shorten
Content-Type: application/json

{
  "url": "https://example.com/very-long-url",
  "customAlias": "my-link"  // optional
}
```

**Response:**
```json
{
  "shortUrl": "https://nano.link/my-link",
  "shortCode": "my-link",
  "originalUrl": "https://example.com/very-long-url",
  "createdAt": "2025-12-07T10:00:00Z"
}
```

### Redirect → ✿
```http
GET /:code
```

**Response:** `301 Moved Permanently` → Redirects to original URL

### Get Statistics 📊✨
```http
GET /api/v1/stats/:code
```

**Response:**
```json
{
  "shortCode": "my-link",
  "originalUrl": "https://example.com/very-long-url",
  "totalClicks": 1234,
  "analytics": {
    "clicksByDay": [...],
    "topCountries": [...],
    "topBrowsers": [...]
  }
}
```

## ⚙️ Configuration ⋆˚✧

| Environment Variable | Description | Default |
|---------------------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | - |
| `REDIS_URL` | Redis connection string | `redis://localhost:6379` |
| `PORT` | API server port | `3000` |
| `NODE_ENV` | Environment (development/production) | `development` |
| `CACHE_TTL` | Cache TTL in seconds | `86400` (24h) |
| `BASE_URL` | Base URL for short links | `http://localhost:3000` |

## 🧪 Testing ~ Let's make sure it works! ૮˂ᵕˀ૮ ✧

```bash
# Unit tests
pnpm test

# E2E tests
pnpm test:e2e

# Test coverage
pnpm test:cov
```

## 📝 Contributing ~ Join us! ◝(ᵔᗜᵔ)◜

1. Fork the repository 🍴
2. Create your feature branch (`git checkout -b feature/amazing-feature`) 🌿
3. Commit your changes using semantic commits (`git commit -m 'feat: add amazing feature'`) ✨
4. Push to the branch (`git push origin feature/amazing-feature`) 🚀
5. Open a Pull Request 🎉

### Commit Convention ♡

We use [Conventional Commits](https://www.conventionalcommits.org/) ~

- `feat:` - New features ✨
- `fix:` - Bug fixes 💜
- `docs:` - Documentation changes 📝
- `style:` - Code style changes (formatting, etc.) 🎨
- `refactor:` - Code refactoring ⚙️
- `test:` - Adding or updating tests 🧪
- `chore:` - Maintenance tasks 🧹

### Semantic Versioning ₊˚✧

This project follows [Semantic Versioning](https://semver.org/) ~
- MAJOR version when you make incompatible API changes. ♡
- MINOR version when you add functionality in a backwards-compatible manner. ✧
- PATCH version when you make backwards-compatible bug fixes. ₊˚

## 📄 License ˖˃ˀა

This project is licensed under the MIT License (see the [LICENSE](LICENSE) file for details!) ♡

## 🙏 Acknowledgments ~ Thank you! ♡⊹✧*

- Design inspired by real-world URL shorteners (Bitly, TinyURL) ✧
- Built with best practices from the NestJS community ♡
- Architecture patterns from high-scale systems ~

---

**Made with 🧡 and ✨ by Sophia Biscottini**

ദ്ദി(˵ •̀ ᴗ - ˵ ) ✧ ~ Happy Coding!*
